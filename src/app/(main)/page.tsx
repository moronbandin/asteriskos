import Link from "next/link";
import { requireMe } from "@/lib/session";
import { myAssignments, myGroups, myNews, myFavorites } from "@/lib/queries";
import { db } from "@/lib/db";
import { units } from "@/lib/schema";
import { dueLabel, firstName, longToday, shortDate } from "@/lib/format";
import { md } from "@/lib/grammar";
import { PROJECTS } from "@/lib/config";
import { DoneButton } from "@/components/DoneButton";
import { Icon } from "@/components/icons";

export default async function Inicio() {
  const me = await requireMe();
  const profe = me.role === "profesor";
  const [groups, tasks, feed, favs, allUnits] = await Promise.all([
    myGroups(me), profe ? Promise.resolve([]) : myAssignments(me), myNews(me, 12), myFavorites(me), db.select().from(units),
  ]);
  const pending = tasks.filter((t) => !t.done);
  const doneCount = tasks.length - pending.length;
  const bodies = await Promise.all(feed.map((f) => md(f.n.body)));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="split">
      <section className="stack" style={{ gap: 28 }}>
        <div className="big-hello">
          <span className="eyebrow">{longToday()}</span>
          <h1>Ola, {firstName(me.name)}<span style={{ color: "var(--accent)" }}>.</span></h1>
          {!profe && (
            <p className="muted">
              {pending.length === 0 ? "Non tes nada pendente. A ler algo da biblioteca?" :
                pending.length === 1 ? "Tes unha cousa pendente." : `Tes ${pending.length} cousas pendentes.`}
            </p>
          )}
        </div>

        {!profe && (
          <div className="card stack-sm">
            <div className="row between"><h2>Deberes</h2>{doneCount > 0 && <span className="pill ok">{doneCount} feitos</span>}</div>
            {tasks.length === 0 ? <p className="muted small">Cando o profe poña deberes no teu grupo, aparecerán aquí.</p> : (
              <div className="list">
                {[...pending, ...tasks.filter((t) => t.done)].slice(0, 8).map((t) => (
                  <div key={t.a.id} className={`task ${t.done ? "done" : ""}`}>
                    <DoneButton id={t.a.id} on={t.done} />
                    <div className="min0 stack-sm" style={{ gap: 4 }}>
                      <div className="row" style={{ gap: 8 }}>
                        <span className={`pill c-${t.subject.color}`}>{t.subject.name}</span>
                        <span className={`due ${t.a.dueDate && t.a.dueDate <= today && !t.done ? "soon" : "muted"}`}>{dueLabel(t.a.dueDate)}</span>
                      </div>
                      <div className="tt" style={{ fontWeight: 700 }}>{t.a.title}</div>
                      {t.a.description && <div className="small muted">{t.a.description}</div>}
                      {t.resource && (
                        <Link href={t.resource.grammarSlug ? `/gramatica/${t.resource.grammarSlug}` : t.resource.url || "#"} className="small" style={{ color: "var(--accent)", fontWeight: 700 }}
                          {...(t.resource.url && !t.resource.grammarSlug ? { target: "_blank" } : {})}>
                          {t.resource.title} →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="stack-sm">
          <div className="row between"><h2>Novidades</h2>{profe && <Link className="btn sm accent" href="/xestion/novidades">Publicar</Link>}</div>
          {feed.length === 0 ? <div className="empty">Aínda non hai novidades.</div> : (
            <div className="feed">
              {feed.map((f, i) => (
                <article key={f.n.id} className={`post-card ${f.n.pinned ? "pinned" : ""}`}>
                  <div className="row" style={{ gap: 8 }}>
                    {f.n.pinned && <span className="pill accent">Fixada</span>}
                    {f.n.tag && <span className="pill">{f.n.tag}</span>}
                    {f.group && <span className="pill line">{f.group.name}</span>}
                    <span className="tiny muted">{shortDate(f.n.createdAt)}</span>
                  </div>
                  <h3 style={{ fontSize: 21 }}>{f.n.title}</h3>
                  <div className="body" dangerouslySetInnerHTML={{ __html: bodies[i] }} />
                  {f.n.link && <a href={f.n.link} target="_blank" rel="noopener noreferrer" className="btn sm line" style={{ alignSelf: "flex-start" }}>Abrir <Icon.out width={15} height={15} /></a>}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <aside className="stack">
        <div className="stack-sm">
          <span className="eyebrow">{profe ? "Grupos deste curso" : "As túas materias"}</span>
          {groups.length === 0 && <div className="empty small">Aínda non estás en ningún grupo.</div>}
          {groups.map(({ group, subject }) => {
            const us = allUnits.filter((u) => u.subjectId === subject.id);
            const now = us.find((u) => u.status === "agora");
            return (
              <Link key={group.id} href={`/materias/${subject.slug}`} className={`subject-card hover c-${subject.color}`} style={{ minHeight: 0, padding: 18, gap: 6 }}>
                <div className="row between"><h3>{subject.name}</h3><span className="meta">{subject.level}</span></div>
                <span className="small" style={{ color: "var(--ink)", opacity: .75 }}>{now ? `Agora: ${now.title}` : `${us.length} unidades`}</span>
              </Link>
            );
          })}
        </div>

        <div className="card stack-sm">
          <span className="eyebrow">Atallos</span>
          <a className="row between" href={PROJECTS.palaestra} target="_blank" rel="noopener noreferrer"><b>Palaestra</b><span className="muted small">practicar xogando ↗</span></a>
          {PROJECTS.pau && <a className="row between" href={PROJECTS.pau} target="_blank" rel="noopener noreferrer"><b>Web da PAU</b><span className="muted small">↗</span></a>}
          <Link className="row between" href="/gramatica"><b>Gramática</b><span className="muted small">→</span></Link>
          <Link className="row between" href="/saidas"><b>Viaxe e saídas</b><span className="muted small">→</span></Link>
        </div>

        {favs.length > 0 && (
          <div className="card stack-sm">
            <div className="row between"><span className="eyebrow">Gardado</span><Link href="/eu" className="small muted">Ver todo</Link></div>
            {favs.slice(0, 4).map(({ r }) => (
              <a key={r.id} href={r.grammarSlug ? `/gramatica/${r.grammarSlug}` : r.url || "#"} className="row" style={{ flexWrap: "nowrap", gap: 8 }}>
                <Icon.heartFill width={16} height={16} style={{ color: "var(--accent)", flex: "none" }} />
                <span className="small" style={{ fontWeight: 600 }}>{r.title}</span>
              </a>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
