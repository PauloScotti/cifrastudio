import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { client } from "./client";

/**
 * Executor de migrações simplificado.
 *
 * Motivo de não usar drizzle-orm/libsql/migrator: a combinação atual do
 * driver libSQL local (modo arquivo) com o método `executeMultiple`
 * apresenta incompatibilidade ao processar lotes de DDL. Aplicamos cada
 * statement individualmente via `execute()`, que é estável, e mantemos
 * nosso próprio controle de migrações já aplicadas — mesma garantia de
 * idempotência que o migrator oficial oferece.
 */

const MIGRATIONS_DIR = path.resolve(__dirname, "../../drizzle");

async function ensureMigrationsTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS __migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const result = await client.execute("SELECT name FROM __migrations");
  return new Set(result.rows.map((r) => r.name as string));
}

function splitStatements(sql: string): string[] {
  // drizzle-kit separa múltiplos statements no mesmo arquivo com este marcador
  return sql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function runMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log("Nenhuma pasta de migrações encontrada — pulando.");
    return;
  }

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const fullPath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(fullPath, "utf8");
    const statements = splitStatements(sql);

    console.log(`→ Aplicando migração: ${file} (${statements.length} statement(s))`);
    for (const statement of statements) {
      await client.execute(statement);
    }
    await client.execute({
      sql: "INSERT INTO __migrations (name) VALUES (?)",
      args: [file],
    });
  }

  console.log("✓ Migrações aplicadas com sucesso.");
}

// Permite rodar via `tsx src/db/migrate.ts`
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("✗ Falha ao aplicar migrações:", err);
      process.exit(1);
    });
}
