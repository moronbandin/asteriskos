import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { requireMe } from "@/lib/session";
import { myGroups } from "@/lib/queries";
import { db } from "@/lib/db";
import { groups, posts, subjects, threads, users } from "@/lib/schema";
import { reply } from "@/lib/actions";
import { setPostHidden, setThreadClosed } from "@/lib/admin-actions";
import { Avatar } from "@/components/Avatar";
import { shortDate } from "@/lib/format";

export default async function Fio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireMe();
  const profe = me.role === "profesor";
  const [row] = await db.select({ t: threads, subject: subjects }).from(threads)
    .innerJoin(groups, eq(threads.groupId, groups.id))
    .innerJoin(subjects, eq(groups.subjectId, subjects.id))
    .where(eq(threads.id, Number(id)));
  if (!row) notFound();
  const mine = (await myGroups(me)).some((g) => g.group.id === row.t.groupId);
  if (!mine) notFound();
  const all = await db.select({ p: posts, u: users }).from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.threadId, row.t.id)).orderBy(asc(posts.createdAt));
  const visible = profe ? all : all.filter((x) => !x.p.hidden);
  const t = row.t;

  return (
    <div className={`stack c-${row.subject.color}`} style={{ gap: 24, maxWidth: 760 }}>
      <Link href="/foros" className="small muted" style={{ fontWeight: 600 }}>← Foros</Link>
      <div className="stack-sm">
        <div className="row" style={{ gap: 6 }}><span className="pill">{row.subject.name}</span>{t.closed && <span className="pill line">Pechado</span>}</div>
        <h1 style={{ fontSize: "clamp(30px,6vw,44px)" }}>{t.title}</h1>
        {t.prompt && <p className="muted">{t.prompt}</p>}
        {profe && (
          <form action={setThreadClosed.bind(null, t.id, !t.closed)}><button className="btn sm line">{t.closed ? "Volver abrir" : "Pechar o tema"}</button></form>
        )}
      </div>

      <div className="stack-sm" style={{ gap: 14 }}>
        {visible.length === 0 && <div className="empty">Ninguén escribiu aínda. Estrea ti o tema.</div>}
        {visible.map(({ p, u }) => (
          <div key={p.id} className={`bubble ${u.role === "profesor" ? "prof" : ""} ${p.hidden ? "hidden" : ""}`}>
            <Avatar name={u.name} image={u.image} />
            <div className="say">
              <div className="row between" style={{ gap: 8 }}>
                <span className="small"><b>{u.name}</b> <span className="muted">{shortDate(p.createdAt)}</span></span>
                {profe && u.role !== "profesor" && (
                  <form action={setPostHidden.bind(null, p.id, !p.hidden)}><button className="btn sm line">{p.hidden ? "Mostrar" : "Ocultar"}</button></form>
                )}
              </div>
              <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      {!t.closed && (
        <form action={reply.bind(null, t.id)} className="stack-sm">
          <label className="f">A túa resposta<textarea name="body" required maxLength={4000} placeholder="Escribe aquí o que pensas" /></label>
          <div><button className="btn accent">Publicar</button></div>
        </form>
      )}
    </div>
  );
}
