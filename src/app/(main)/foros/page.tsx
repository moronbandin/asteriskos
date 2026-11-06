import Link from "next/link";
import { count, desc, eq, inArray } from "drizzle-orm";
import { requireMe } from "@/lib/session";
import { myGroups } from "@/lib/queries";
import { db } from "@/lib/db";
import { groups, posts, subjects, threads } from "@/lib/schema";
import { createThread } from "@/lib/admin-actions";

export const metadata = { title: "Foros" };

export default async function Foros() {
  const me = await requireMe();
  const gs = await myGroups(me);
  const ids = gs.map((g) => g.group.id);
  const list = ids.length ? await db
    .select({ t: threads, group: groups, subject: subjects, n: count(posts.id) })
    .from(threads)
    .innerJoin(groups, eq(threads.groupId, groups.id))
    .innerJoin(subjects, eq(groups.subjectId, subjects.id))
    .leftJoin(posts, eq(posts.threadId, threads.id))
    .where(inArray(threads.groupId, ids))
    .groupBy(threads.id, groups.id, subjects.id)
    .orderBy(desc(threads.createdAt)) : [];

  return (
    <div className="stack" style={{ gap: 28 }}>
      <div className="big-hello"><span className="eyebrow">Foros</span><h1>Que opinas?</h1></div>
      <p className="muted prose">Cada foro só o ve o teu grupo. Escríbese co nome real e o profesor pode ocultar mensaxes.</p>

      {me.role === "profesor" && (
        <details className="adder">
          <summary>Abrir un tema novo</summary>
          <form action={createThread} className="inner form-grid">
            <label className="f">Grupo
              <select name="groupId" required>{gs.map((g) => <option key={g.group.id} value={g.group.id}>{g.subject.name}</option>)}</select>
            </label>
            <label className="f full">Pregunta<input type="text" name="title" required placeholder="Euclión: avaro ou só preocupado?" /></label>
            <label className="f full">Instrucións (opcional)<textarea name="prompt" placeholder="Defende unha postura cunha escena concreta." /></label>
            <div><button className="btn accent">Publicar o tema</button></div>
          </form>
        </details>
      )}

      {list.length === 0 ? <div className="empty">Aínda non hai temas abertos.</div> : (
        <div className="stack-sm">
          {list.map(({ t, subject, n }) => (
            <Link key={t.id} href={`/foros/${t.id}`} className={`card hover row c-${subject.color}`} style={{ flexWrap: "nowrap", alignItems: "flex-start", gap: 14 }}>
              <div className="min0 stack-sm" style={{ gap: 6, flex: 1 }}>
                <div className="row" style={{ gap: 6 }}><span className="pill">{subject.name}</span>{t.closed && <span className="pill line">Pechado</span>}</div>
                <h3 style={{ fontSize: 20 }}>{t.title}</h3>
                {t.prompt && <p className="small muted">{t.prompt}</p>}
              </div>
              <span className="pill line">{n} {n === 1 ? "mensaxe" : "mensaxes"}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
