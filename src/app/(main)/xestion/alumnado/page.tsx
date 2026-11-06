import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { enrollments, groups, subjects, users } from "@/lib/schema";
import { SCHOOL_DOMAIN, SCHOOL_YEAR } from "@/lib/config";
import { addStudent, bulkAddStudents, setActive, setEnrollment } from "@/lib/admin-actions";

export default async function Alumnado({ searchParams }: { searchParams: Promise<{ grupo?: string; ver?: string }> }) {
  const sp = await searchParams;
  const gs = await db.select({ g: groups, s: subjects }).from(groups)
    .innerJoin(subjects, eq(groups.subjectId, subjects.id))
    .where(eq(groups.schoolYear, SCHOOL_YEAR)).orderBy(asc(subjects.order));
  const gIds = gs.map((x) => x.g.id);
  const filter = Number(sp.grupo) || null;
  const showOff = sp.ver === "todos";

  const students = await db.select().from(users).where(and(eq(users.role, "alumno"), ...(showOff ? [] : [eq(users.active, true)]))).orderBy(asc(users.name));
  const enr = gIds.length ? await db.select().from(enrollments).where(inArray(enrollments.groupId, gIds)) : [];
  const byUser = new Map<number, Set<number>>();
  enr.forEach((e) => { if (!byUser.has(e.userId)) byUser.set(e.userId, new Set()); byUser.get(e.userId)!.add(e.groupId); });
  const list = filter ? students.filter((u) => byUser.get(u.id)?.has(filter)) : students;

  const GroupSelect = ({ name = "groupId" }: { name?: string }) => (
    <select name={name}>{gs.map(({ g, s }) => <option key={g.id} value={g.id}>{s.name} ({s.level})</option>)}</select>
  );

  return (
    <div className="stack" style={{ gap: 20 }}>
      <details className="adder">
        <summary>Dar de alta unha persoa</summary>
        <form action={addStudent} className="inner form-grid">
          <label className="f">Nome e apelidos<input type="text" name="name" required /></label>
          <label className="f">Correo de Google<input type="text" name="email" required placeholder={SCHOOL_DOMAIN ? `nome.apelido@${SCHOOL_DOMAIN}` : "nome@gmail.com"} /></label>
          <label className="f">Grupo<GroupSelect /></label>
          <div><button className="btn accent">Dar de alta</button></div>
        </form>
      </details>
      <details className="adder">
        <summary>Dar de alta un grupo enteiro</summary>
        <form action={bulkAddStudents} className="inner stack-sm">
          <label className="f">Unha persoa por liña: <span className="muted" style={{ fontWeight: 400 }}>Nome Apelidos; correo</span>
            <textarea name="list" required placeholder={"Uxía Rodríguez Varela; uxia.rodriguez\nBreogán Pena Castro; breogan.pena"} style={{ minHeight: 160 }} />
          </label>
          <span className="small muted">{SCHOOL_DOMAIN ? `Se o correo vai sen @, engádese @${SCHOOL_DOMAIN}. ` : "Escribe o correo completo. "}Vale calquera conta de Google, tamén Gmail. Podes pegar dúas columnas copiadas dunha folla de cálculo.</span>
          <div className="row"><label className="f" style={{ minWidth: 220 }}>Grupo<GroupSelect /></label><button className="btn accent" style={{ alignSelf: "flex-end" }}>Dar de alta a todos</button></div>
        </form>
      </details>

      <nav className="chips" aria-label="Filtrar">
        <a href="/xestion/alumnado" aria-current={!filter ? "true" : undefined}>Todos</a>
        {gs.map(({ g, s }) => <a key={g.id} href={`/xestion/alumnado?grupo=${g.id}${showOff ? "&ver=todos" : ""}`} aria-current={filter === g.id ? "true" : undefined}>{s.name}</a>)}
        <a href={`/xestion/alumnado?${filter ? `grupo=${filter}&` : ""}${showOff ? "" : "ver=todos"}`}>{showOff ? "Ocultar as baixas" : "Ver tamén as baixas"}</a>
      </nav>

      <p className="small muted">Dar de baixa non borra nada: a conta deixa de entrar e consérvase o histórico. Cada pílula é un grupo de {SCHOOL_YEAR}: tócaa para meter ou sacar a persoa.</p>

      {list.length === 0 ? <div className="empty">Non hai ninguén aquí.</div> : (
        <div className="tablebox">
          <table className="t">
            <thead><tr><th>Nome</th><th>Conta</th><th>Grupos {SCHOOL_YEAR}</th><th>Estado</th></tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className={u.active ? "" : "off"}>
                  <td><b>{u.name}</b></td>
                  <td className="mono">{SCHOOL_DOMAIN ? u.email.replace("@" + SCHOOL_DOMAIN, "") : u.email}</td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      {gs.map(({ g, s }) => {
                        const on = byUser.get(u.id)?.has(g.id) ?? false;
                        return (
                          <form key={g.id} action={setEnrollment.bind(null, u.id, g.id, !on)}>
                            <button className={`pill ${on ? `c-${s.color}` : "line"}`} style={{ border: 0, cursor: "pointer", opacity: on ? 1 : .55 }} title={on ? "Sacar deste grupo" : "Meter neste grupo"}>{s.name}</button>
                          </form>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <form action={setActive.bind(null, u.id, !u.active)}>
                      <button className={`btn sm ${u.active ? "line" : "ghost"}`}>{u.active ? "Dar de baixa" : "Reactivar"}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
