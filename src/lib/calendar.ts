/* Le un Google Calendar público (formato iCal) cando se constrúe a web.
   A web reconstrúese soa cada 3 horas (ver .github/workflows/publicar.yml),
   así que un evento novo aparece como moito nese tempo.
   Se o calendario non se pode ler, a web publícase igual e amosa un aviso. */

import sitio from "../data/sitio.json";

export type Evento = {
  id: string;
  titulo: string;
  inicio: Date;   // en UTC
  fin?: Date;
  diaEnteiro: boolean;
  lugar?: string;
  descricion?: string;
};

const TZ = "Europe/Madrid";

/** Acepta o ID do calendario (correo), a ligazón "?cid=…" ou a ligazón .ics */
export function icsUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (v.endsWith(".ics")) return v;
  let id = v;
  const cid = v.match(/[?&]cid=([^&]+)/);
  if (cid) {
    try { id = Buffer.from(decodeURIComponent(cid[1]), "base64").toString("utf8"); } catch { id = cid[1]; }
  }
  const src = v.match(/[?&]src=([^&]+)/);
  if (src) id = decodeURIComponent(src[1]);
  if (!id.includes("@")) return null;
  return `https://calendar.google.com/calendar/ical/${encodeURIComponent(id)}/public/basic.ics`;
}

/* ── lectura do formato iCal ─────────────────────────── */

function unfold(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function unescape(v: string) {
  return v.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\").trim();
}

/** Diferenza en minutos entre a hora local dunha zona e UTC, para unha data */
function tzOffset(date: Date, tz: string) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
  return (asUtc - date.getTime()) / 60000;
}

function parseDate(value: string, params: string): { d: Date; allDay: boolean } {
  const tzid = params.match(/TZID=([^;:]+)/)?.[1] || TZ;
  if (/VALUE=DATE(?!-)/.test(params) || /^\d{8}$/.test(value)) {
    const y = +value.slice(0, 4), m = +value.slice(4, 6) - 1, d = +value.slice(6, 8);
    return { d: new Date(Date.UTC(y, m, d, 12)), allDay: true };
  }
  const y = +value.slice(0, 4), mo = +value.slice(4, 6) - 1, d = +value.slice(6, 8);
  const h = +value.slice(9, 11), mi = +value.slice(11, 13), s = +value.slice(13, 15) || 0;
  const naive = Date.UTC(y, mo, d, h, mi, s);
  if (value.endsWith("Z")) return { d: new Date(naive), allDay: false };
  const off = tzOffset(new Date(naive), tzid);
  return { d: new Date(naive - off * 60000), allDay: false };
}

type Raw = Record<string, { v: string; p: string }[]>;

function parseICS(text: string): Raw[] {
  const out: Raw[] = [];
  let cur: Raw | null = null;
  for (const line of unfold(text).split("\n")) {
    if (line === "BEGIN:VEVENT") { cur = {}; continue; }
    if (line === "END:VEVENT") { if (cur) out.push(cur); cur = null; continue; }
    if (!cur) continue;
    const i = line.indexOf(":");
    if (i < 0) continue;
    const left = line.slice(0, i), value = line.slice(i + 1);
    const [name, ...rest] = left.split(";");
    (cur[name] ||= []).push({ v: value, p: rest.join(";") });
  }
  return out;
}

const DAY = 86400000;
const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/** Repeticións simples (diaria, semanal, mensual, anual) dentro dunha xanela */
function expand(start: Date, rule: string, exdates: Set<number>, until: Date): Date[] {
  const r = Object.fromEntries(rule.split(";").map((kv) => kv.split("=")));
  const freq = r.FREQ;
  const interval = +(r.INTERVAL || 1);
  const count = r.COUNT ? +r.COUNT : Infinity;
  const end = r.UNTIL ? parseDate(r.UNTIL, "").d : until;
  const limit = Math.min(+end, +until);
  const days = r.BYDAY ? r.BYDAY.split(",").map((d: string) => BYDAY.indexOf(d.slice(-2))) : null;
  const res: Date[] = [];
  let n = 0;
  if (freq === "WEEKLY" && days) {
    const weekStart = new Date(+start - start.getUTCDay() * DAY);
    for (let w = 0; n < count; w += interval) {
      for (const wd of days.sort()) {
        const d = new Date(+weekStart + (w * 7 + wd) * DAY);
        if (+d < +start) continue;
        if (+d > limit || n >= count) return res;
        n++;
        if (!exdates.has(+d)) res.push(d);
      }
      if (+weekStart + w * 7 * DAY > limit) break;
    }
    return res;
  }
  for (let k = 0; n < count; k += interval) {
    const d = new Date(start);
    if (freq === "DAILY") d.setTime(+start + k * DAY);
    else if (freq === "WEEKLY") d.setTime(+start + k * 7 * DAY);
    else if (freq === "MONTHLY") d.setUTCMonth(start.getUTCMonth() + k);
    else if (freq === "YEARLY") d.setUTCFullYear(start.getUTCFullYear() + k);
    else break;
    if (+d > limit) break;
    n++;
    if (!exdates.has(+d)) res.push(d);
  }
  return res;
}

let cache: { eventos: Evento[]; erro: string | null } | null = null;

export async function eventos(): Promise<{ eventos: Evento[]; erro: string | null }> {
  if (cache) return cache;
  const url = icsUrl(sitio.calendario || "");
  if (!url) return (cache = { eventos: [], erro: "sen-calendario" });
  let text = "";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    text = await res.text();
    if (!text.includes("BEGIN:VCALENDAR")) throw new Error("non é un calendario");
  } catch (e) {
    console.warn(`[calendario] Non se puido ler ${url}: ${(e as Error).message}`);
    return (cache = { eventos: [], erro: "non-publico" });
  }

  const now = Date.now();
  const from = now - 2 * DAY;
  const to = now + 270 * DAY;
  const list: Evento[] = [];
  const overridden = new Set<string>();

  const raws = parseICS(text);
  for (const e of raws) {
    if (e["RECURRENCE-ID"]) overridden.add(e.UID?.[0].v + "|" + +parseDate(e["RECURRENCE-ID"][0].v, e["RECURRENCE-ID"][0].p).d);
  }
  for (const e of raws) {
    if (!e.DTSTART || e.STATUS?.[0].v === "CANCELLED") continue;
    const s = parseDate(e.DTSTART[0].v, e.DTSTART[0].p);
    const en = e.DTEND ? parseDate(e.DTEND[0].v, e.DTEND[0].p).d : undefined;
    const dur = en ? +en - +s.d : 0;
    const base = {
      titulo: unescape(e.SUMMARY?.[0].v || "(sen título)"),
      lugar: e.LOCATION ? unescape(e.LOCATION[0].v) || undefined : undefined,
      descricion: e.DESCRIPTION ? unescape(e.DESCRIPTION[0].v).replace(/<[^>]+>/g, " ").trim() || undefined : undefined,
      diaEnteiro: s.allDay,
    };
    const uid = e.UID?.[0].v || base.titulo;
    const starts = e.RRULE && !e["RECURRENCE-ID"]
      ? expand(s.d, e.RRULE[0].v, new Set((e.EXDATE || []).flatMap((x) => x.v.split(",").map((v) => +parseDate(v, x.p).d))), new Date(to))
          .filter((d) => !overridden.has(uid + "|" + +d))
      : [s.d];
    for (const d of starts) {
      const fin = dur ? new Date(+d + dur) : undefined;
      if (+(fin ?? d) < from || +d > to) continue;
      list.push({ id: `${uid}-${+d}`, inicio: d, fin, ...base });
    }
  }
  list.sort((a, b) => +a.inicio - +b.inicio);
  return (cache = { eventos: list, erro: null });
}

/* ── formato en galego ───────────────────────────────── */

const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("gl-ES", { timeZone: TZ, ...o });
const MESES = ["xaneiro", "febreiro", "marzo", "abril", "maio", "xuño", "xullo", "agosto", "setembro", "outubro", "novembro", "decembro"];
const DIAS = ["dom", "lun", "mar", "mér", "xov", "ven", "sáb"];

function parts(d: Date) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric", weekday: "short", hourCycle: "h23", hour: "2-digit", minute: "2-digit" })
    .formatToParts(d).map((x) => [x.type, x.value]));
  return { y: +p.year, m: +p.month - 1, d: +p.day, wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday), hh: p.hour, mm: p.minute };
}

export function mesClave(e: Evento) {
  const p = parts(e.inicio);
  return { clave: `${p.y}-${p.m}`, nome: `${MESES[p.m]} ${p.y}` };
}
export function dia(e: Evento) {
  const p = parts(e.inicio);
  return { num: p.d, semana: DIAS[p.wd], mes: MESES[p.m].slice(0, 3) };
}
export function hora(e: Evento) {
  if (e.diaEnteiro) {
    if (e.fin && +e.fin - +e.inicio > DAY) {
      const f = parts(new Date(+e.fin - DAY));
      return `Ata o ${f.d} de ${MESES[f.m]}`;
    }
    return "Todo o día";
  }
  const a = parts(e.inicio);
  const b = e.fin ? parts(e.fin) : null;
  return b ? `${a.hh}:${a.mm}–${b.hh}:${b.mm}` : `${a.hh}:${a.mm}`;
}
/** Data local (AAAA-MM-DD) do final, para ocultar no navegador o que xa pasou */
export function finLocal(e: Evento) {
  const p = parts(e.fin && e.diaEnteiro ? new Date(+e.fin - DAY) : e.fin ?? e.inicio);
  return `${p.y}-${String(p.m + 1).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
}
export { fmt };
