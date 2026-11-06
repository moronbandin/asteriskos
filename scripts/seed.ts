/* Enche a base de datos co esqueleto do departamento.
   Execútase unha vez:  npm run db:seed
   Non crea alumnado: dáse de alta desde Xestión → Alumnado. */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/schema";

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
const YEAR = process.env.SCHOOL_YEAR || "2026-27";

async function main() {
  const existing = await db.select().from(schema.subjects);
  if (existing.length) {
    console.log("Xa hai materias na base de datos. Non se toca nada.");
    return;
  }

  const subs = await db.insert(schema.subjects).values([
    { slug: "latin-4-eso", name: "Latín", level: "4.º ESO", color: "blue", order: 1, description: "Primeiro contacto coa lingua e a cultura de Roma." },
    { slug: "latin-i", name: "Latín I", level: "1.º BAC", color: "pink", order: 2, description: "Morfoloxía e sintaxe para ler textos adaptados." },
    { slug: "latin-ii", name: "Latín II", level: "2.º BAC", color: "mint", order: 3, description: "Eutropio, Fedro e a literatura latina para a PAU." },
    { slug: "grego-ii", name: "Grego II", level: "2.º BAC", color: "lilac", order: 4, description: "Lectura de textos gregos e preparación da PAU." },
  ]).returning();
  const by = Object.fromEntries(subs.map((s) => [s.slug, s]));

  await db.insert(schema.groups).values(subs.map((s) => ({ subjectId: s.id, schoolYear: YEAR, name: s.name })));

  const unitRows = await db.insert(schema.units).values([
    { subjectId: by["latin-4-eso"].id, number: 1, title: "O alfabeto e a pronuncia", status: "vista" as const },
    { subjectId: by["latin-4-eso"].id, number: 2, title: "A primeira declinación", status: "vista" as const },
    { subjectId: by["latin-4-eso"].id, number: 3, title: "O presente de indicativo", status: "agora" as const },
    { subjectId: by["latin-i"].id, number: 1, title: "Repaso: o tema de presente", status: "vista" as const },
    { subjectId: by["latin-i"].id, number: 2, title: "Adxectivos de primeira clase", status: "vista" as const },
    { subjectId: by["latin-i"].id, number: 3, title: "A terceira declinación", status: "agora" as const },
    { subjectId: by["latin-ii"].id, number: 1, title: "Eutropio, Breviarium", status: "agora" as const },
    { subjectId: by["latin-ii"].id, number: 2, title: "Fedro, fábulas", status: "proxima" as const },
    { subjectId: by["latin-ii"].id, number: 3, title: "Literatura: Plauto e a comedia", status: "agora" as const },
    { subjectId: by["grego-ii"].id, number: 1, title: "Verbos contractos", status: "vista" as const },
    { subjectId: by["grego-ii"].id, number: 2, title: "O aoristo", status: "agora" as const },
  ]).returning();
  const u = (slug: string, n: number) => unitRows.find((x) => x.subjectId === by[slug].id && x.number === n)!;

  await db.insert(schema.resources).values([
    { subjectId: by["latin-i"].id, unitId: u("latin-i", 3).id, kind: "apuntamentos", title: "A terceira declinación", description: "Explicación e táboas", grammarSlug: "terceira-declinacion" },
    { subjectId: by["latin-i"].id, unitId: u("latin-i", 3).id, kind: "cuestionario", title: "Practica a terceira declinación en Palaestra", url: "https://palaestra-eta.vercel.app" },
    { subjectId: by["latin-4-eso"].id, unitId: u("latin-4-eso", 2).id, kind: "apuntamentos", title: "A primeira declinación", grammarSlug: "primeira-declinacion" },
    { subjectId: by["latin-4-eso"].id, unitId: u("latin-4-eso", 3).id, kind: "apuntamentos", title: "O presente de indicativo", grammarSlug: "tema-de-presente" },
  ]);

  await db.insert(schema.links).values([
    { category: "Dicionarios", title: "Logeion", description: "Latín e grego nun só buscador", url: "https://logeion.uchicago.edu", order: 1 },
    { category: "Dicionarios", title: "Gaffiot", description: "Dicionario latín–francés dixitalizado", url: "https://gaffiot.org", order: 2 },
    { category: "Textos", title: "The Latin Library", description: "Textos latinos completos", url: "https://www.thelatinlibrary.com", order: 1 },
    { category: "Textos", title: "Perseus", description: "Textos gregos e latinos con análise de cada palabra", url: "https://www.perseus.tufts.edu", order: 2 },
    { category: "Textos", title: "Dickinson College Commentaries", description: "Textos comentados con vocabulario", url: "https://dcc.dickinson.edu", order: 3 },
    { category: "Os nosos proxectos", title: "Palaestra", description: "Practica latín e grego xogando", url: "https://palaestra-eta.vercel.app", order: 1 },
  ]);

  await db.insert(schema.events).values([
    { kind: "viaxe", title: "Operación Nostos", when: "Primavera de 2027", audience: "Alumnado de Latín e Grego", body: "A viaxe de estudos a Grecia do departamento. Aquí iremos colgando o itinerario, as datas e as autorizacións." },
  ]);

  await db.insert(schema.news).values([
    { title: "Benvidas e benvidos a Asteriskos", body: "Este é o novo espazo do departamento. Aquí tedes os materiais de cada unidade, os deberes do voso grupo e as novidades.\n\nToca o corazón dun material para gardalo no teu espazo.", tag: "Novo", pinned: true },
  ]);

  console.log("Feito. Materias, grupos de " + YEAR + ", unidades de exemplo, biblioteca e a viaxe.");
}

main().catch((e) => { console.error(e); process.exit(1); });
