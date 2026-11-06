/* Crea ou actualiza as táboas na base de datos.  npm run db:migrate */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL no ficheiro .env");
  process.exit(1);
}
const db = drizzle(neon(process.env.DATABASE_URL));
migrate(db, { migrationsFolder: "./drizzle" })
  .then(() => console.log("Táboas listas."))
  .catch((e) => { console.error(e); process.exit(1); });
