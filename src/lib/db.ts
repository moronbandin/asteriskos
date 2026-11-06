import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Durante a compilación pode non haber DATABASE_URL: úsase un valor de recheo
const url = process.env.DATABASE_URL || "postgresql://build:build@localhost/build";

export const db = drizzle(neon(url), { schema });
export { schema };
