import Link from "next/link";
import { requireMe } from "@/lib/session";
import { listGrammar } from "@/lib/grammar";
import { GrammarToc } from "./Toc";

export const metadata = { title: "Gramática" };

export default async function Gramatica() {
  await requireMe();
  const pages = await listGrammar();
  return (
    <div className="gram">
      <GrammarToc />
      <section className="stack" style={{ gap: 24 }}>
        <div className="big-hello"><span className="eyebrow">Gramática do departamento</span><h1>Todo o que vemos, nun só sitio.</h1></div>
        <p className="muted prose">A mesma explicación serve para 4.º ESO, 1.º e 2.º de bacharelato. Cada unidade das materias liga co punto que lle toca.</p>
        <div className="grid">
          {pages.map((p) => (
            <Link key={p.slug} href={`/gramatica/${p.slug}`} className="card hover stack-sm" style={{ gap: 6 }}>
              <span className="eyebrow">{p.section}</span>
              <h3>{p.title}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
