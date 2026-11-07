import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const md = (dir: string) => glob({ pattern: "**/*.md", base: `./src/content/${dir}` });

// Os grupos son os nomes curtos das materias (o nome do ficheiro en content/materias)
const grupos = z.array(z.string()).default([]);

export const TIPOS = {
  apuntamentos: "Apuntamentos",
  ficha: "Ficha",
  ampliacion: "Ampliación",
  texto: "Texto",
  video: "Vídeo",
  cuestionario: "Cuestionario",
  ligazon: "Ligazón",
} as const;

export const collections = {
  materias: defineCollection({
    loader: md("materias"),
    schema: z.object({
      nome: z.string(),
      curso: z.string(),
      cor: z.enum(["blue", "pink", "mint", "lilac", "sun"]).default("blue"),
      orde: z.number().default(0),
      sigla: z.string().optional(),
      descricion: z.string().optional(),
    }),
  }),

  unidades: defineCollection({
    loader: md("unidades"),
    schema: z.object({
      materia: z.string(),
      numero: z.number(),
      titulo: z.string(),
      estado: z.enum(["proxima", "agora", "vista"]).default("proxima"),
      recursos: z.array(z.object({
        tipo: z.enum(Object.keys(TIPOS) as [keyof typeof TIPOS, ...(keyof typeof TIPOS)[]]),
        titulo: z.string(),
        url: z.string().optional(),
        gramatica: z.string().optional(),
        descricion: z.string().optional(),
      })).default([]),
    }),
  }),

  avisos: defineCollection({
    loader: md("avisos"),
    schema: z.object({
      titulo: z.string(),
      data: z.coerce.date(),
      grupos,
      etiqueta: z.string().optional(),
      fixado: z.boolean().default(false),
      ligazon: z.string().optional(),
    }),
  }),

  deberes: defineCollection({
    loader: md("deberes"),
    schema: z.object({
      titulo: z.string(),
      grupos,
      data: z.coerce.date().optional(),
      ligazon: z.string().optional(),
    }),
  }),

  gramatica: defineCollection({
    loader: md("gramatica"),
    schema: z.object({
      titulo: z.string(),
      seccion: z.string().default("Outros"),
      orde: z.number().default(99),
      usado: z.array(z.string()).default([]),
    }),
  }),

  foros: defineCollection({
    loader: md("foros"),
    schema: z.object({
      titulo: z.string(),
      grupos,
      data: z.coerce.date(),
      ligazon: z.string(),
      aberto: z.boolean().default(true),
    }),
  }),

  saidas: defineCollection({
    loader: md("saidas"),
    schema: z.object({
      titulo: z.string(),
      tipo: z.enum(["viaxe", "saida"]).default("saida"),
      cando: z.string().optional(),
      para: z.string().optional(),
      orde: z.number().default(0),
    }),
  }),
};
