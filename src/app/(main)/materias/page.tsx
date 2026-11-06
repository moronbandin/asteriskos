import Link from "next/link";
import { asc } from "drizzle-orm";
import { requireMe } from "@/lib/session";
import { mySubjects } from "@/lib/queries";
import { db } from "@/lib/db";
import { units } from "@/lib/schema";

export const metadata = { title: "Materias" };

function code(name: string) {
  if (/grego/i.test(name)) return "Γρ";
  if (/II$/.test(name)) return "LII";
  if (/I$/.test(name)) return "LI";
  return "Lat";
}

export default async function Materias() {
  const me = await requireMe();
  const subs = await mySubjects(me);
  const us = await db.select().from(units).orderBy(asc(units.number));
  return (
    <div className="stack" style={{ gap: 28 }}>
      <div className="big-hello"><span className="eyebrow">Materias</span><h1>{me.role === "profesor" ? "Todas as materias" : "As túas materias"}</h1></div>
      {subs.length === 0 ? <div className="empty">Aínda non estás en ningún grupo. Fala co profesor.</div> : (
        <div className="grid">
          {subs.map((s) => {
            const su = us.filter((u) => u.subjectId === s.id);
            const done = su.filter((u) => u.status === "vista").length;
            return (
              <Link key={s.id} href={`/materias/${s.slug}`} className={`subject-card hover c-${s.color}`}>
                <span className="code">{code(s.name)}</span>
                <div><h3>{s.name}</h3><span className="meta">{s.level}</span></div>
                <div className="stack-sm" style={{ gap: 6, marginTop: "auto" }}>
                  <span className="meta">{done} de {su.length} unidades vistas</span>
                  <div className="bar"><i style={{ width: `${su.length ? (done / su.length) * 100 : 0}%` }} /></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
