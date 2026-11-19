import type { Metadata } from 'next';
import Link from 'next/link';
import BriefForm from './BriefForm';
import questionnaire from './questionnaire-v1.json';
import styles from './brief.module.css';

export const metadata: Metadata = {
  title: questionnaire.title,
  description: 'Share your campaign objectives, audience and priorities to prepare your digital marketing consultation.',
};

export default function BriefPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>← Back to home</Link>
        <h1>{questionnaire.title}</h1>
        {questionnaire.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </header>
      <BriefForm />
    </div>
  );
}
