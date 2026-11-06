import { asc, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { assignmentDone, assignments, enrollments, groups, resources, subjects, users } from "@/lib/schema";
import { SCHOOL_YEAR } from "@/lib/config";
import { createAssignment, deleteAssignment } from "@/lib/admin-actions";
import { dueLabel } from "@/lib/format";

export default async function Deberes() {
  const gs = await db.select({ g: groups, s: subjects }).from(groups)
    .innerJoin(subjects, eq(groups.subjectId, subjects.id))
    .where(eq(groups.schoolYear, SCHOOL_YEAR)).orderBy(asc(subjects.order));
  const ids = gs.map((x) => x.g.id);
  const rs = await db.select().from(resources).where(eq(resources.visible, true)).orderBy(desc(resources.createdAt)).limit(150);
  const list = ids.length ? await db.select().from(assignments).where(inArray(assignments.groupId, ids)).orderBy(desc(assignments.createdAt)) : [];
  const doneCounts = list.length ? await db.select({ id: assignmentDone.assignmentId, n: count() }).from(assignmentDone)
    .where(inArray(assignmentDone.assignmentId, list.map((a) => a.id))).groupBy(assignmentDone.assignmentId) : [];
  const sizes = ids.length ? await db.select({ g: enrollments.groupId, n: count() }).from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(inArray(enrollments.groupId, ids)).groupBy(enrollments.groupId) : [];

  return (
    <div className="stack" style={{ gap: 20 }}>
      <details className="adder" open>
        <summary>Poñer deberes</summary>
        <form action={createAssignment} className="inner form-grid">
          <fieldset className="full" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="small" style={{ fontWeight: 600, marginBottom: 6 }}>Para que grupos</legend>
            <div className="row" style={{ gap: 14 }}>
              {gs.map(({ g, s }) => <label key={g.id} className="checkline"><input type="checkbox" name="groupId" value={g.id} /> {s.name}</label>)}
            </div>
          </fieldset>
          <label className="f full">Que hai que facer<input type="text" name="title" required placeholder="Facer a ficha 3A" /></label>
          <label className="f full">Detalles (opcional)<input type="text" name="description" placeholder="Exercicios 1 a 5. Traédeos para corrixir." /></label>
          <label className="f">Para cando<input type="date" name="dueDate" /></label>
          <label className="f">Material (opcional)
            <select name="resourceId"><option value="">Ningún</option>{rs.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</select>
          </label>
          <div><button className="btn accent">Publicar</button></div>
        </form>
      </details>

      {list.length === 0 ? <div className="empty">Aínda non puxeches deberes.</div> : (
        <div className="tablebox">
          <table className="t">
            <thead><tr><th>Deberes</th><th>Grupo</th><th>Data</th><th>Feitos</th><th /></tr></thead>
            <tbody>
              {list.map((a) => {
                const gg = gs.find((x) => x.g.id === a.groupId);
                const d = doneCounts.find((x) => x.id === a.id)?.n ?? 0;
                const total = sizes.find((x) => x.g === a.groupId)?.n ?? 0;
                return (
                  <tr key={a.id}>
                    <td><b>{a.title}</b>{a.description && <div className="small muted">{a.description}</div>}</td>
                    <td>{gg && <span className={`pill c-${gg.s.color}`}>{gg.s.name}</span>}</td>
                    <td className="small">{dueLabel(a.dueDate)}</td>
                    <td className="mono">{d} de {total}</td>
                    <td><form action={deleteAssignment.bind(null, a.id)}><button className="btn sm danger">Borrar</button></form></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="small muted">«Feitos» conta quen o marcou no seu inicio. É só orientativo: márcao cada alumno.</p>
    </div>
  );
}
