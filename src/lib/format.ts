const MONTHS = ["xan", "feb", "mar", "abr", "mai", "xuñ", "xul", "ago", "set", "out", "nov", "dec"];
const MONTHS_LONG = ["xaneiro", "febreiro", "marzo", "abril", "maio", "xuño", "xullo", "agosto", "setembro", "outubro", "novembro", "decembro"];
const DAYS = ["Domingo", "Luns", "Martes", "Mércores", "Xoves", "Venres", "Sábado"];

function toDate(d: Date | string) {
  return typeof d === "string" ? new Date(d + (d.length === 10 ? "T12:00:00" : "")) : d;
}

export function shortDate(d: Date | string | null | undefined) {
  if (!d) return "";
  const x = toDate(d);
  return `${x.getDate()} ${MONTHS[x.getMonth()]}`;
}

export function longToday() {
  const x = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  return `${DAYS[x.getDay()]}, ${x.getDate()} de ${MONTHS_LONG[x.getMonth()]}`;
}

/** "hoxe", "mañá", "en 3 días", "hai 2 días" */
export function dueLabel(d: string | null) {
  if (!d) return "Sen data";
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  today.setHours(12, 0, 0, 0);
  const diff = Math.round((toDate(d).getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Para hoxe";
  if (diff === 1) return "Para mañá";
  if (diff > 1 && diff < 7) return `En ${diff} días`;
  if (diff < 0) return diff === -1 ? "Era onte" : `Pasou hai ${-diff} días`;
  return `Para o ${shortDate(d)}`;
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function firstName(name: string) {
  return name.split(/\s+/)[0] || name;
}
