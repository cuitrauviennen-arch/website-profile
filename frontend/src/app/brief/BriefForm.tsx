'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import BriefField from './BriefFields';
import { emailKey, getString, groups, reviewQuestions, stepNames, templateVersion, visibleAnswers, type Answers } from './questionnaire';
import styles from './brief.module.css';

const apiUrl = (process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337').replace(/\/$/, '');
const reviewStep = groups.length;
const contactStep = groups.findIndex((group) => group.some((section) => section.number === 20));
const scheduleStep = groups.findIndex((group) => group.some((section) => section.number === 12));

interface SubmissionResponse {
  reference?: string;
  error?: { message?: string };
}

export default function BriefForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const attempt = useRef<string | null>(null);
  const inProgress = useRef(false);
  const trap = useRef<HTMLInputElement>(null);
  const stepTitle = useRef<HTMLHeadingElement>(null);

  function changeAnswer(key: string, value: string | string[]) {
    setAnswers((previous) => ({ ...previous, [key]: value }));
  }

  function goTo(next: number, field?: string) {
    setStep(next);
    setError('');
    requestAnimationFrame(() => {
      const input = field ? document.getElementById(`brief-field-${field}`) : null;
      const section = input?.closest('details');
      if (section) section.open = true;
      (input ?? stepTitle.current)?.focus();
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== reviewStep || inProgress.current) return;
    const email = getString(answers, emailKey).trim();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      goTo(contactStep, emailKey);
      setError('Enter a valid contact email in section 20 so I can follow up.');
      return;
    }
    const start = getString(answers, '203');
    const end = getString(answers, '205');
    if (start && end && start > end) {
      goTo(scheduleStep, '205');
      setError('The campaign end date in section 12 must follow the start date.');
      return;
    }

    inProgress.current = true;
    setBusy(true);
    setError('');
    try {
      attempt.current ??= crypto.randomUUID();
      const result = await fetch(`${apiUrl}/api/client-briefs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify({ submissionId: attempt.current, templateVersion, answers: visibleAnswers(answers), extraWebsite: trap.current?.value ?? '' }),
        signal: AbortSignal.timeout(75_000),
      });
      const payload: SubmissionResponse | null = await result.json().catch(() => null);
      if (result.ok && typeof payload?.reference === 'string' && /^BRF-\d+$/.test(payload.reference)) {
        setAnswers({});
        setReference(payload.reference);
        return;
      }
      if (result.status === 400 || result.status === 413) {
        attempt.current = null;
        setRetry(false);
        setError(payload?.error?.message || 'Check your answers, then try submitting again.');
        return;
      }
      setRetry(true);
      setError(result.status === 429
        ? 'Please wait a few minutes, then try again. Your answers are still here.'
        : 'The server hasn’t confirmed receipt. Your answers are still here. Select Try again to check or resend.');
    } catch {
      setRetry(true);
      setError('The server hasn’t confirmed receipt. Your answers are still here. Select Try again to check or resend.');
    } finally {
      inProgress.current = false;
      setBusy(false);
    }
  }

  if (reference) {
    return (
      <section className={`glass-panel ${styles.received}`} aria-live="polite">
        <h2>Brief received</h2>
        <p>Thank you for completing the brief. I’ll review your answers and follow up using the email you provided.</p>
        <p className={styles.help}>Brief ID {reference}</p>
        <Link href="/" className={styles.secondary}>Back to home</Link>
      </section>
    );
  }

  const reviewing = step === reviewStep;
  const locked = busy || retry;
  const visible = reviewing ? visibleAnswers(answers) : {};
  return (
    <div className={styles.layout}>
      <nav aria-label="Brief steps">
        <ol className={styles.steps}>
          {stepNames.map((name, index) => (
            <li key={name}>
              <button type="button" aria-current={step === index ? 'step' : undefined} disabled={locked} onClick={() => goTo(index)}>
                <span aria-hidden="true">{index + 1}</span>{name}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <form className={`glass-panel ${styles.panel}`} noValidate onSubmit={submit} aria-busy={busy}>
        <div className={styles.stepHeader}>
          <h2 ref={stepTitle} tabIndex={-1}>{stepNames[step]}</h2>
          <span>Step {step + 1} of {stepNames.length}</span>
        </div>
        <progress className={styles.progress} aria-label="Brief steps" max={stepNames.length} value={step + 1} />
        <div className={styles.honeypot} aria-hidden="true">
          <label>Leave this field blank <input name="extraWebsite" ref={trap} autoComplete="off" tabIndex={-1} /></label>
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}
        {reviewing ? (
          <div>
            <p className={styles.help}>Review your answers. An email in section 20 is needed so I can follow up.</p>
            <ul className={styles.review}>
              {groups.map((group, index) => {
                const items = reviewQuestions(group, visible);
                return (
                  <li key={stepNames[index]}>
                    <details>
                      <summary>{stepNames[index]} · {items.length} answered</summary>
                      {items.length ? (
                        <dl>{items.map((item, row) => (
                          <div key={row}><dt>{item.label}</dt><dd>{item.values.join('\n')}</dd></div>
                        ))}</dl>
                      ) : <p className={styles.help}>No answers in this group.</p>}
                    </details>
                    <button type="button" className={styles.textButton} aria-label={`Edit ${stepNames[index]}`} disabled={locked}
                      onClick={() => goTo(index)}>Edit</button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : groups[step].map((section, index) => (
          <details key={section.number} className={styles.section} open={index === 0}>
            <summary>{section.title}</summary>
            <div className={styles.fields}>
              {section.questions.map((question) => <BriefField key={question.id} question={question} answers={answers} onChange={changeAnswer} />)}
            </div>
          </details>
        ))}

        {busy && <p className={styles.help} role="status">Sending your brief. Please keep this page open.</p>}
        <div className={styles.actions}>
          {step > 0 && <button type="button" className={styles.secondary} disabled={locked} onClick={() => goTo(step - 1)}>Back</button>}
          {reviewing ? (
            <button type="submit" className={styles.primary} disabled={busy}>{busy ? 'Sending…' : retry ? 'Try again' : 'Submit brief'}</button>
          ) : (
            <button type="button" className={styles.primary} onClick={() => goTo(step + 1)}>Continue <span aria-hidden="true">→</span></button>
          )}
        </div>
      </form>
    </div>
  );
}
