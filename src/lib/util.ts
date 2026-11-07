import { getCollection, type CollectionEntry } from "astro:content";

/** Enderezo interno respectando o "base" (/asteriskos) */
export function u(path = "/") {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base + (path.startsWith("/") ? path : "/" + path);
}

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

const MESES = ["xan", "feb", "mar", "abr", "mai", "xuñ", "xul", "ago", "set", "out", "nov", "dec"];
export function dataCurta(d?: Date) {
  return d ? `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}` : "";
}
export function iso(d?: Date) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export async function materias() {
  return (await getCollection("materias")).sort((a, b) => a.data.orde - b.data.orde);
}

export function sigla(m: CollectionEntry<"materias">) {
  return m.data.sigla ?? m.data.nome.slice(0, 3);
}

export async function avisos(grupo?: string) {
  const all = (await getCollection("avisos")).sort((a, b) => +b.data.data - +a.data.data);
  return grupo ? all.filter((a) => a.data.grupos.length === 0 || a.data.grupos.includes(grupo)) : all;
}

export async function deberes(grupo?: string) {
  const all = (await getCollection("deberes")).sort(
    (a, b) => (a.data.data ? +a.data.data : Infinity) - (b.data.data ? +b.data.data : Infinity),
  );
  return grupo ? all.filter((d) => d.data.grupos.includes(grupo)) : all;
}

export async function unidades(materia: string) {
  return (await getCollection("unidades"))
    .filter((x) => x.data.materia === materia)
    .sort((a, b) => a.data.numero - b.data.numero);
}

export function recursoHref(r: { url?: string; gramatica?: string }) {
  if (r.gramatica) return u(`/gramatica/${r.gramatica}`);
  return r.url || "";
}

export const ESTADO = { agora: "Agora", vista: "Vista", proxima: "Próxima" } as const;
