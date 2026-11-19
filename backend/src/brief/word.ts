import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { DOMParser, XMLSerializer, type Element } from '@xmldom/xmldom';
import JSZip from 'jszip';
import { cellKey, questions, templateVersion, type Answers, type Question } from './questionnaire';

const wordNamespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const xmlNamespace = 'http://www.w3.org/XML/1998/namespace';

function descendantText(node: Element) {
  return Array.from(node.getElementsByTagNameNS(wordNamespace, 't'));
}

function textAt(node: Element) {
  return descendantText(node).map((text) => text.textContent).join('');
}

function writeText(node: Element, value: string) {
  const [first, ...more] = value.split('\n');
  node.textContent = first;
  if (/^\s|\s$/.test(first)) node.setAttributeNS(xmlNamespace, 'xml:space', 'preserve');
  const originalNext = node.nextSibling;
  const run = node.parentNode;
  for (const line of more) {
    const text = node.ownerDocument.createElementNS(wordNamespace, 'w:t');
    text.setAttributeNS(xmlNamespace, 'xml:space', 'preserve');
    text.textContent = line;
    run.insertBefore(node.ownerDocument.createElementNS(wordNamespace, 'w:br'), originalNext);
    run.insertBefore(text, originalNext);
  }
}

function replaceAt(node: Element, offset: number, length: number, value: string) {
  const end = offset + length;
  let position = 0;
  for (const text of descendantText(node)) {
    const previous = text.textContent;
    const next = position + previous.length;
    if (offset < next && end > position) {
      const prefix = previous.slice(0, Math.max(0, offset - position));
      const suffix = previous.slice(Math.min(previous.length, end - position));
      writeText(text, prefix + (offset >= position ? value : '') + suffix);
    }
    position = next;
    if (position >= end) return;
  }
  throw new Error('Word template range is missing');
}

function replaceText(node: Element, search: string, value: string) {
  const offset = textAt(node).indexOf(search);
  if (offset < 0) throw new Error('Word template placeholder is missing');
  replaceAt(node, offset, search.length, value);
}

function plainAnswer(answers: Answers, key: string | number) {
  const value = answers[key];
  return typeof value === 'string' ? value : '';
}

function fillQuestion(question: Question, nodes: Element[], answerParagraph: Element, answers: Answers) {
  if (question.type === 'note') return;
  const { id, rows, word } = question;
  if (rows) {
    const table = nodes[id];
    const wordRows = table.getElementsByTagNameNS(wordNamespace, 'tr');
    rows.slice(1).forEach((row, rowIndex) => {
      const cells = wordRows.item(rowIndex + 1).getElementsByTagNameNS(wordNamespace, 'tc');
      row.forEach((placeholder, colIndex) => {
        if (placeholder === '[Please enter]') {
          replaceText(cells.item(colIndex), placeholder, plainAnswer(answers, cellKey(id, rowIndex, colIndex)));
        }
      });
    });
    return;
  }

  if (word.options) {
    const value = answers[id];
    const selections = Array.isArray(value) ? value : [value];
    for (const { paragraph, options } of word.options) {
      const node = nodes[paragraph - 1];
      const text = textAt(node);
      let index = -1;
      for (const option of options) {
        index = text.indexOf('☐', index + 1);
        if (index < 0) throw new Error('Word template checkbox is missing');
        if (selections.includes(option)) replaceAt(node, index, 1, '☑');
      }
      const other = plainAnswer(answers, `${id}-other`);
      if (options.includes('Other') && selections.includes('Other') && other) {
        const line = text.match(/_+/)?.[0];
        if (line) replaceText(node, line, other);
      }
    }
    question.followups?.forEach((followup) => fillQuestion(followup, nodes, answerParagraph, answers));
    return;
  }

  const answer = plainAnswer(answers, id);
  if (word.paragraph) {
    const value = question.type === 'date' ? answer.split('-').reverse().join(' / ') : answer;
    replaceText(nodes[word.paragraph - 1], question.placeholder, value);
  } else if (answer && word.append) {
    const text = descendantText(nodes[word.append - 1]).at(-1);
    writeText(text, `${text.textContent} — ${answer}`);
  } else if (answer && word.after) {
    // The campaign-reason question gives examples but has no answer slot in v1.
    // Reuse an existing answer paragraph style immediately after those examples.
    const anchor = nodes[word.after - 1];
    const answerNode = answerParagraph.cloneNode(true) as Element;
    answerNode.removeAttribute('w14:paraId');
    answerNode.removeAttribute('w14:textId');
    replaceText(answerNode, '[Please enter]', answer);
    anchor.parentNode.insertBefore(answerNode, anchor.nextSibling);
  }
}

export async function exportBriefWord(version: number, answers: Answers) {
  if (version !== templateVersion) throw new Error('Unsupported client brief Word template');
  const reference = path.join(process.cwd(), 'templates', 'client-brief-v1.docx');
  const archive = await JSZip.loadAsync(await readFile(reference));
  const documentPath = 'word/document.xml';
  const xml = await archive.file(documentPath).async('string');
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  const body = document.getElementsByTagNameNS(wordNamespace, 'body').item(0);
  const nodes = Array.from(body.childNodes).filter((node): node is Element => node.nodeType === 1);
  const answerParagraph = nodes[5].cloneNode(true) as Element;
  for (const question of questions) fillQuestion(question, nodes, answerParagraph, answers);
  archive.file(documentPath, new XMLSerializer().serializeToString(document), { createFolders: false });
  return archive.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
