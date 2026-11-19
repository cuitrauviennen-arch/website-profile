import template from './questionnaire-v1.json';

export type Question = {
  id: number;
  label: string;
  type: string;
  placeholder?: string;
  help?: string[];
  options?: string[];
  followups?: Question[];
  followupLabel?: string;
  rows?: string[][];
};

export type Section = { number: number; title: string; questions: Question[] };
export type Answers = Record<string, string | string[]>;
export const groups: Section[][] = template.groups;
export const stepNames = [...template.stepNames, 'Review'];
export const templateVersion = template.version;
export const emailKey = '329';

export function tableKey(id: number, row: number, column: number) {
  return `${id}-${row}-${column}`;
}

export function getString(answers: Answers, key: string | number) {
  const value = answers[key];
  return typeof value === 'string' ? value : '';
}

export function selections(answers: Answers, key: string | number) {
  const value = answers[key];
  return Array.isArray(value) ? value : value ? [value] : [];
}

export function visibleAnswers(answers: Answers) {
  const visible: Answers = {};
  function add(key: string) {
    const value = answers[key];
    if (Array.isArray(value) ? value.length : value?.trim()) visible[key] = value;
  }
  function collect(question: Question) {
    if (question.type === 'note') return;
    if (question.rows) {
      question.rows.slice(1).forEach((row, rowIndex) => row.forEach((value, column) => {
        if (value === '[Please enter]') add(tableKey(question.id, rowIndex, column));
      }));
      return;
    }
    add(String(question.id));
    const chosen = selections(answers, question.id);
    if (chosen.includes('Other')) add(`${question.id}-other`);
    if (chosen.includes('Yes')) question.followups?.forEach(collect);
  }
  for (const section of groups.flat()) section.questions.forEach(collect);
  return visible;
}

export function reviewQuestions(group: Section[], answers: Answers) {
  function read(question: Question): { label: string; values: string[] }[] {
    if (question.type === 'note') return [];
    if (question.rows) {
      const values = question.rows.slice(1).flatMap((row, rowIndex) => {
        const filled = row.flatMap((placeholder, column) => {
          const value = getString(answers, tableKey(question.id, rowIndex, column)).trim();
          return placeholder === '[Please enter]' && value ? [value] : [];
        });
        return filled.length && row[0] !== '[Please enter]' ? [`${row[0]} · ${filled.join(' · ')}`] : filled;
      });
      return values.length ? [{ label: question.label, values }] : [];
    }
    const values = selections(answers, question.id).map((value) => value.trim()).filter(Boolean);
    const other = getString(answers, `${question.id}-other`).trim();
    if (other) values.push(other);
    const results = values.length ? [{ label: question.label, values }] : [];
    return [...results, ...(question.followups ?? []).flatMap(read)];
  }
  return group.flatMap((section) => section.questions.flatMap(read));
}
