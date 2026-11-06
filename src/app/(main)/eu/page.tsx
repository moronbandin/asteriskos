import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { requireMe } from "@/lib/session";
import { groupHistory, myFavorites } from "@/lib/queries";
import { db } from "@/lib/db";
import { assignmentDone, posts } from "@/lib/schema";
import { SCHOOL_YEAR } from "@/lib/config";
import { Avatar } from "@/components/Avatar";
import { ResourceItem } from "@/components/ResourceItem";
import { SignOut } from "./SignOut";

export const metadata = { title: "O meu espazo" };

export default async function Eu() {
  const me = await requireMe();
  const profe = me.role === "profesor";
  const [hist, favs, [{ d }], [{ m }]] = await Promise.all([
    groupHistory(me.id),
    myFavorites(me),
    db.select({ d: count() }).from(assignmentDone).where(eq(assignmentDone.userId, me.id)),
    db.select({ m: count() }).from(posts).where(eq(posts.userId, me.id)),
  ]);
  const years = [...new Set(hist.map((h) => h.group.schoolYear))];

  return (
    <div className="split">
      <section className="stack" style={{ gap: 28 }}>
        <div className="row" style={{ gap: 16, flexWrap: "nowrap" }}>
          <Avatar name={me.name} image={me.image} size="lg" />
          <div className="min0"><h1 style={{ fontSize: "clamp(28px,6vw,42px)" }}>{me.name}</h1><span className="small muted mono">{me.email}</span></div>
        </div>

        {!profe && (
          <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
            <div className="card stat"><b>{d}</b><span className="small muted">deberes feitos</span></div>
            <div className="card stat"><b>{favs.length}</b><span className="small muted">gardados</span></div>
            <div className="card stat"><b>{m}</b><span className="small muted">mensaxes</span></div>
          </div>
        )}

        <div className="stack-sm">
          <h2>Gardado</h2>
          {favs.length === 0 ? <div className="empty">Toca o corazón dun material para gardalo aquí.</div> : (
            <div className="card" style={{ paddingBlock: 6 }}>
              <div className="list">{favs.map(({ r, subject }) => <ResourceItem key={r.id} r={r} fav color={subject?.color} />)}</div>
            </div>
          )}
        </div>

        {!profe && years.length > 0 && (
          <div className="stack-sm">
            <h2>O teu camiño no departamento</h2>
            <div className="stack-sm">
              {years.map((y) => (
                <div key={y} className="row" style={{ gap: 12, alignItems: "flex-start", flexWrap: "nowrap" }}>
                  <span className={`pill ${y === SCHOOL_YEAR ? "accent" : "line"}`} style={{ minWidth: 72, justifyContent: "center" }}>{y}</span>
                  <div className="row" style={{ gap: 6 }}>
                    {hist.filter((h) => h.group.schoolYear === y).map((h) => <span key={h.group.id} className={`pill c-${h.subject.color}`}>{h.subject.name}, {h.subject.level}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <aside className="stack-sm">
        <span className="eyebrow">Máis</span>
        <Link href="/biblioteca" className="card tight hover row between"><b>Biblioteca</b><span className="muted">→</span></Link>
        <Link href="/saidas" className="card tight hover row between"><b>Viaxe e saídas</b><span className="muted">→</span></Link>
        {profe && <Link href="/xestion" className="card tight hover row between" style={{ borderColor: "var(--accent)" }}><b>Xestión</b><span className="muted">→</span></Link>}
        <div style={{ marginTop: 8 }}><SignOut /></div>
      </aside>
    </div>
  );
}
