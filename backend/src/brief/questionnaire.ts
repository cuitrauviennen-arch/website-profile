import { createHash } from 'node:crypto';
import questionnaire from './questionnaire-v1.json';

export const briefUid = 'api::client-brief.client-brief';
export const templateVersion = questionnaire.version;
export const contactEmailKey = '329';
export const companyKey = '5';

type WordBinding = {
  paragraph?: number;
  after?: number;
  append?: number;
  options?: { paragraph: number; options: string[] }[];
};

export type Question = {
  id: number;
  label: string;
  type: string;
  options?: string[];
  placeholder?: string;
  rows?: string[][];
  followups?: Question[];
  word?: WordBinding;
};

export type Answers = Record<string, string | string[]>;
export const questions: Question[] = questionnaire.groups.flatMap((group) => group.flatMap((section) => section.questions));

type Field = { question: Question; kind: string };
const fields = new Map<string, Field>();

export function cellKey(id: number, row: number, column: number) {
  return `${id}-${row}-${column}`;
}

function addField(question: Question) {
  if (question.type === 'note') return;
  if (question.rows) {
    question.rows.slice(1).forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
      if (value === '[Please enter]') fields.set(cellKey(question.id, rowIndex, columnIndex), { question, kind: 'table cell' });
    }));
  } else {
    fields.set(String(question.id), { question, kind: question.type });
    if (question.options?.includes('Other')) fields.set(`${question.id}-other`, { question, kind: 'other' });
  }
  question.followups?.forEach(addField);
}

questions.forEach(addField);

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export class InvalidBrief extends Error {}

function reject(question?: Question): never {
  throw new InvalidBrief(question ? `Check your answer for “${question.label}”` : 'Invalid brief submission.');
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function validateSubmission(body: unknown) {
  if (!object(body) || body.templateVersion !== templateVersion || !object(body.answers)) reject();
  const { submissionId, answers: incoming, extraWebsite } = body;
  if (typeof submissionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(submissionId)) reject();
  if (extraWebsite !== '' || Object.keys(incoming).length > fields.size) reject();

  const answers: Answers = {};
  let totalLength = 0;
  for (const [key, input] of Object.entries(incoming).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
    const field = fields.get(key);
    if (!field) reject();
    const { question, kind } = field;
    if (kind === 'checkbox') {
      if (!Array.isArray(input) || input.some((value) => !question.options.includes(value))) reject(question);
      const values = question.options.filter((option) => input.includes(option));
      if (values.length) answers[key] = values;
      continue;
    }
    if (typeof input !== 'string') reject(question);
    const value = input.replace(/\r\n?/g, '\n').trim();
    if (!value) continue;
    const limit = key === companyKey ? 200 : kind === 'textarea' ? 4000 : 500;
    // Word's XML format cannot represent these control characters.
    if (value.length > limit || /[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFE\uFFFF]/u.test(value) || /[\uD800-\uDFFF]/u.test(value)) reject(question);
    if (kind === 'radio' && !question.options.includes(value)) reject(question);
    if (kind === 'date' && !validDate(value)) reject(question);
    totalLength += value.length;
    answers[key] = value;
  }

  if (totalLength > 60_000) throw new InvalidBrief('The brief is too long. Shorten a few answers and try again.');
  for (const { id, followups, options } of questions) {
    const value = answers[id];
    if (value !== 'Yes') for (const followup of followups ?? []) delete answers[followup.id];
    if (options?.includes('Other') && value !== 'Other' && !(Array.isArray(value) && value.includes('Other'))) delete answers[`${id}-other`];
  }

  const email = answers[contactEmailKey];
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new InvalidBrief('Enter a valid contact email in section 20.');
  }
  const start = answers['203'];
  const end = answers['205'];
  if (typeof start === 'string' && typeof end === 'string' && start > end) {
    throw new InvalidBrief('The campaign end date in section 12 must follow the start date.');
  }

  return {
    submissionId,
    templateVersion,
    answers,
    contactEmail: email,
    company: typeof answers[companyKey] === 'string' ? answers[companyKey] : '',
    answerHash: createHash('sha256').update(JSON.stringify(answers)).digest('hex'),
  };
}

export function briefReference(id: number) {
  return `BRF-${String(id).padStart(4, '0')}`;
}
