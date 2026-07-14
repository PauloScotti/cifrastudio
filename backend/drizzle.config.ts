import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso", // dialeto compatível com libSQL (arquivo local ou Turso remoto)
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
} satisfies Config;
