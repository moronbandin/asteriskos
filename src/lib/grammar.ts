import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const DIR = path.join(process.cwd(), "content", "gramatica");

export const GRAMMAR_SECTIONS = ["Fonética", "Nomes e adxectivos", "Pronomes", "Verbo", "Sintaxe", "Grego"];

export type GrammarPage = {
  slug: string;
  title: string;
  section: string;
  order: number;
  used: string[]; // "Latín I, U3"
  html: string;
};

// Cabeceira sinxela entre liñas ---:  clave: valor
function parse(raw: string) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  let body = raw;
  if (m) {
    body = m[2];
    m[1].split("\n").forEach((line) => {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
  }
  return { meta, body };
}

export async function listGrammar(): Promise<Omit<GrammarPage, "html">[]> {
  let files: string[] = [];
  try { files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".md")); } catch { return []; }
  const pages = await Promise.all(files.map(async (f) => {
    const { meta } = parse(await fs.readFile(path.join(DIR, f), "utf8"));
    return {
      slug: f.replace(/\.md$/, ""),
      title: meta.title || f,
      section: meta.section || "Outros",
      order: Number(meta.order || 99),
      used: meta.used ? meta.used.split(";").map((s) => s.trim()).filter(Boolean) : [],
    };
  }));
  return pages.sort((a, b) => a.order - b.order);
}

export async function getGrammar(slug: string): Promise<GrammarPage | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const raw = await fs.readFile(path.join(DIR, slug + ".md"), "utf8");
    const { meta, body } = parse(raw);
    return {
      slug,
      title: meta.title || slug,
      section: meta.section || "Outros",
      order: Number(meta.order || 99),
      used: meta.used ? meta.used.split(";").map((s) => s.trim()).filter(Boolean) : [],
      html: await marked.parse(body),
    };
  } catch {
    return null;
  }
}

export async function md(text: string | null | undefined) {
  return text ? marked.parse(text) : "";
}
