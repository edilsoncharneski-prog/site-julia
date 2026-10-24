/**
 * Aplica a migração SQL de variações no Supabase usando conexão Postgres.
 * Requer SUPABASE_DB_PASSWORD no .env.local (ou DATABASE_URL).
 *
 * Uso: npm run db:migrate
 */
import { readFile } from 'node:fs/promises';
import { Client } from 'pg';

const envText = await readFile('.env.local', 'utf8').catch(() => '');
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    })
);

const migrationFiles = [
  'supabase/migrations/20261022_produto_variacoes.sql',
  'supabase/migrations/20261023_especificacoes_tecnicas.sql',
  'supabase/migrations/20261024_carousel_slides.sql',
];
const sqlParts = await Promise.all(
  migrationFiles.map((file) => readFile(file, 'utf8'))
);
const sql = sqlParts.join('\n\n');

const connectionString = process.env.DATABASE_URL || env.DATABASE_URL;
let client;

if (connectionString) {
  client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
} else {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const ref = projectUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const password = process.env.SUPABASE_DB_PASSWORD || env.SUPABASE_DB_PASSWORD;

  if (!ref || !password) {
    console.error(
      'Defina SUPABASE_DB_PASSWORD no .env.local ou DATABASE_URL.\n' +
        'A chave service_role não executa DDL; a senha do banco é necessária.'
    );
    process.exit(1);
  }

  client = new Client({
    host: process.env.SUPABASE_DB_HOST || 'aws-1-sa-east-1.pooler.supabase.com',
    port: Number(process.env.SUPABASE_DB_PORT || 5432),
    user: `postgres.${ref}`,
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
}

try {
  await client.connect();
  console.log('Conectado ao Postgres do Supabase. A aplicar migração...');
  await client.query(sql);
  console.log('Migração aplicada com sucesso.');
} catch (error) {
  console.error(`Falha ao aplicar a migração: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
