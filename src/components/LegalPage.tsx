import { Link } from "react-router-dom";
import { LAST_UPDATED } from "../lib/legal";

export interface LegalSection { heading: string; paragraphs?: string[]; bullets?: string[]; after?: string[] }

/** Shared layout for the Privacy Policy and Terms pages. */
export function LegalPage({ title, intro, sections }: { title: string; intro: string[]; sections: LegalSection[] }) {
  return (
    <article className="legal">
      <Link to="/" className="legal-back">← Back to home</Link>
      <h1>{title}</h1>
      <p className="legal-date">Last updated: {LAST_UPDATED}</p>
      {intro.map((p, i) => <p key={i}>{p}</p>)}
      {sections.map((s, i) => (
        <section key={i}>
          <h2>{i + 1}. {s.heading}</h2>
          {s.paragraphs?.map((p, j) => <p key={j}>{p}</p>)}
          {s.bullets && <ul>{s.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
          {s.after?.map((p, j) => <p key={j}>{p}</p>)}
        </section>
      ))}
    </article>
  );
}
