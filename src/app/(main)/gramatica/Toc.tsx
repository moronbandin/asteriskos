import Link from "next/link";
import { GRAMMAR_SECTIONS, listGrammar } from "@/lib/grammar";

export async function GrammarToc({ current }: { current?: string }) {
  const pages = await listGrammar();
  const sections = [...GRAMMAR_SECTIONS, ...new Set(pages.map((p) => p.section).filter((s) => !GRAMMAR_SECTIONS.includes(s)))];
  return (
    <nav className="toc" aria-label="Índice da gramática">
      {sections.map((sec) => {
        const ps = pages.filter((p) => p.section === sec);
        if (!ps.length) return null;
        return (
          <div key={sec}>
            <span className="eyebrow">{sec}</span>
            <ol>{ps.map((p) => <li key={p.slug}><Link href={`/gramatica/${p.slug}`} aria-current={p.slug === current ? "page" : undefined}>{p.title}</Link></li>)}</ol>
          </div>
        );
      })}
    </nav>
  );
}
