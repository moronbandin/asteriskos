// Dominio do correo do centro. Opcional: só se usa para completar correos curtos
// ("uxia.rodriguez" → "uxia.rodriguez@dominio") e para suxerir a conta en Google.
// Pode quedar baleiro se o alumnado entra con Gmail.
export const SCHOOL_DOMAIN = (process.env.SCHOOL_DOMAIN || "").trim().toLowerCase();
export const SCHOOL_YEAR = process.env.SCHOOL_YEAR || "2026-27";
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const SITE = {
  name: "Asteriskos",
  tagline: "Departamento de Latín e Grego",
  school: process.env.SCHOOL_NAME || "",
};

// Ligazóns aos outros proxectos do departamento
export const PROJECTS = {
  palaestra: "https://palaestra-eta.vercel.app",
  pau: process.env.NEXT_PUBLIC_PAU_URL || "",
};
