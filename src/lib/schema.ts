import {
  pgTable, serial, text, boolean, integer, timestamp, date, primaryKey, index,
} from "drizzle-orm/pg-core";

/* ── Persoas ─────────────────────────────────────────── */

// Alumnado e profesorado. Nunca se borra ninguén: dar de baixa = active false.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").$type<"alumno" | "profesor">().notNull().default("alumno"),
  active: boolean("active").notNull().default(true),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ── Materias e grupos ───────────────────────────────── */

// Latín 4.º ESO, Latín I, Latín II, Grego II…
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  level: text("level").notNull(), // "4.º ESO", "1.º BAC"…
  color: text("color").notNull().default("blue"), // blue | pink | mint | lilac | sun
  description: text("description"),
  order: integer("order").notNull().default(0),
});

// Un grupo é unha materia nun curso académico: "Latín I 2026-27".
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull().references(() => subjects.id),
  schoolYear: text("school_year").notNull(), // "2026-27"
  name: text("name").notNull(), // "Latín I"
});

// Matrícula: quen está en que grupo. Acumúlase ano a ano = histórico.
export const enrollments = pgTable("enrollments", {
  userId: integer("user_id").notNull().references(() => users.id),
  groupId: integer("group_id").notNull().references(() => groups.id),
}, (t) => [primaryKey({ columns: [t.userId, t.groupId] })]);

/* ── Contidos ────────────────────────────────────────── */

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull().references(() => subjects.id),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  status: text("status").$type<"proxima" | "agora" | "vista">().notNull().default("proxima"),
});

export const RESOURCE_KINDS = {
  apuntamentos: "Apuntamentos",
  ficha: "Ficha",
  ampliacion: "Ampliación",
  texto: "Texto",
  video: "Vídeo",
  cuestionario: "Cuestionario",
  ligazon: "Ligazón",
} as const;
export type ResourceKind = keyof typeof RESOURCE_KINDS;

// Calquera material: PDF subido, ligazón, vídeo, punto da gramática…
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").references(() => subjects.id),
  unitId: integer("unit_id").references(() => units.id),
  kind: text("kind").$type<ResourceKind>().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"), // ligazón externa ou ficheiro subido
  grammarSlug: text("grammar_slug"), // se apunta a un punto da gramática
  visible: boolean("visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("resources_unit_idx").on(t.unitId)]);

// Deberes asignados a un grupo
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: date("due_date"),
  resourceId: integer("resource_id").references(() => resources.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// O alumno marca "feito"
export const assignmentDone = pgTable("assignment_done", {
  userId: integer("user_id").notNull().references(() => users.id),
  assignmentId: integer("assignment_id").notNull().references(() => assignments.id),
  doneAt: timestamp("done_at").notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.assignmentId] })]);

export const favorites = pgTable("favorites", {
  userId: integer("user_id").notNull().references(() => users.id),
  resourceId: integer("resource_id").notNull().references(() => resources.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.resourceId] })]);

/* ── Comunicación ────────────────────────────────────── */

// groupId null = para todo o departamento
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  tag: text("tag"),
  groupId: integer("group_id").references(() => groups.id),
  link: text("link"),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  title: text("title").notNull(),
  prompt: text("prompt"),
  closed: boolean("closed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull().references(() => threads.id),
  userId: integer("user_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  hidden: boolean("hidden").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ── Biblioteca e saídas ─────────────────────────────── */

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  order: integer("order").notNull().default(0),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  kind: text("kind").$type<"viaxe" | "saida">().notNull().default("saida"),
  title: text("title").notNull(),
  when: text("when_label"), // "Primavera de 2027", "12 de decembro"
  body: text("body"), // markdown
  audience: text("audience"), // "4.º ESO e 1.º BAC"
  order: integer("order").notNull().default(0),
});
