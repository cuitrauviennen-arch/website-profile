import type { ReactNode } from 'react';
import { emailKey, getString, selections, tableKey, type Answers, type Question } from './questionnaire';
import styles from './brief.module.css';

type FieldProps = {
  question: Question;
  answers: Answers;
  onChange: (key: string, value: string | string[]) => void;
};

function TextField({ fieldKey, label, kind = 'text', placeholder, value, children, onChange }: {
  fieldKey: string;
  label: string;
  kind?: string;
  placeholder?: string;
  value: string;
  children?: ReactNode;
  onChange: (key: string, value: string) => void;
}) {
  const email = fieldKey === emailKey;
  const id = `brief-field-${fieldKey}`;
  const inputProps = { id, name: fieldKey, value, placeholder, className: styles.input };
  const full = kind === 'textarea' || !!children;
  return (
    <div className={`${styles.field} ${full ? styles.full : ''}`}>
      <label htmlFor={id} className={styles.label}>
        {label}{email && <span className={styles.required}> Required</span>}
      </label>
      {children}
      {kind === 'textarea' ? (
        <textarea {...inputProps} rows={3} maxLength={4000} onChange={(e) => onChange(fieldKey, e.target.value)} />
      ) : (
        <input
          {...inputProps}
          type={kind}
          maxLength={email ? 254 : fieldKey === '5' ? 200 : 500}
          autoComplete={email ? 'email' : fieldKey === '327' ? 'name' : fieldKey === '5' ? 'organization' : undefined}
          required={email}
          onChange={(e) => onChange(fieldKey, e.target.value)}
        />
      )}
    </div>
  );
}

function Examples({ content }: { content: string[] }) {
  return (
    <div className={styles.help}>
      {content.filter((item) => !item.startsWith('• ')).map((item) => <p key={item}>{item}</p>)}
      {content.some((item) => item.startsWith('• ')) && (
        <ul>{content.filter((item) => item.startsWith('• ')).map((item) => <li key={item}>{item.slice(2)}</li>)}</ul>
      )}
    </div>
  );
}

function FieldsTable({ question, answers, onChange }: FieldProps) {
  const [headings, ...rows] = question.rows ?? [];
  const competitors = question.id === 165;
  return (
    <div className={`${styles.field} ${styles.full}`}>
      <p id={`brief-table-${question.id}`} className={styles.label}>{question.label}</p>
      <table className={`${styles.table} ${competitors ? styles.competitors : ''}`} aria-labelledby={`brief-table-${question.id}`}>
        <thead><tr>{headings.map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, column) => {
                if (cell !== '[Please enter]') return <th key={column} scope="row">{cell}</th>;
                const key = tableKey(question.id, rowIndex, column);
                const label = competitors ? `${headings[column]} ${rowIndex + 1}` : `${row[0]} · ${headings[column]}`;
                return (
                  <td key={column}>
                    {competitors && <label className={styles.mobileLabel} htmlFor={`brief-field-${key}`}>{label}</label>}
                    <input id={`brief-field-${key}`} className={styles.input} aria-label={label} name={key} maxLength={500}
                      value={getString(answers, key)} onChange={(e) => onChange(key, e.target.value)} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Choices({ question, answers, onChange }: FieldProps) {
  const options = question.options ?? [];
  const fieldKey = String(question.id);
  const selected = selections(answers, fieldKey);
  const multiple = question.type === 'checkbox';
  const followups = selected.includes('Yes') ? question.followups : undefined;
  return (
    <fieldset className={`${styles.field} ${styles.choices} ${styles.full}`}>
      <legend className={styles.label}>{question.label}</legend>
      <div className={styles.choiceList}>
        {options.map((option) => (
          <label key={option} className={styles.choice}>
            <input type={multiple ? 'checkbox' : 'radio'} name={fieldKey} value={option} checked={selected.includes(option)}
              onChange={(e) => onChange(fieldKey, multiple
                ? e.target.checked ? [...selected, option] : selected.filter((choice) => choice !== option)
                : option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {!multiple && selected.length > 0 && (
        <button type="button" className={styles.textButton} onClick={() => onChange(fieldKey, '')}>Clear selection</button>
      )}
      {selected.includes('Other') && (
        <TextField fieldKey={`${fieldKey}-other`} label="Please specify other" value={getString(answers, `${fieldKey}-other`)} onChange={onChange} />
      )}
      {!!followups?.length && (
        <div className={styles.followups}>
          {question.followupLabel && <p className={styles.help}>{question.followupLabel}</p>}
          <div className={styles.fields}>
            {followups.map((entry) => <BriefField key={entry.id} question={entry} answers={answers} onChange={onChange} />)}
          </div>
        </div>
      )}
    </fieldset>
  );
}

export default function BriefField({ question, answers, onChange }: FieldProps) {
  if (question.type === 'note') return <p className={`${styles.full} ${styles.help}`}>{question.label}</p>;
  if (question.rows) return <FieldsTable question={question} answers={answers} onChange={onChange} />;
  if (question.options) return <Choices question={question} answers={answers} onChange={onChange} />;
  const fieldKey = String(question.id);
  return (
    <TextField fieldKey={fieldKey} label={question.label} kind={question.type} placeholder={question.placeholder}
      value={getString(answers, fieldKey)} onChange={onChange}>
      {question.help && <Examples content={question.help} />}
    </TextField>
  );
}
