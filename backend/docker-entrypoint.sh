#!/bin/sh
set -e

echo "── CifraStudio Backend ──────────────────────────"
echo "→ Aplicando migrações..."
node -e "
const { runMigrations } = require('./dist/db/migrate');
runMigrations().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
"

echo "→ Verificando seed inicial..."
node -e "
const { createClient } = require('@libsql/client');
const client = createClient({ url: process.env.DATABASE_URL || 'file:./dev.db' });
client.execute('SELECT COUNT(*) as c FROM users').then(r => {
  if (r.rows[0].c === 0) {
    console.log('Banco vazio — execute npm run seed manualmente para popular dados iniciais.');
  } else {
    console.log('Banco com dados. OK.');
  }
  process.exit(0);
}).catch(() => process.exit(0));
"

echo "→ Iniciando servidor..."
exec node dist/index.js
