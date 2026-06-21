import { createClient, type Client } from '@libsql/client';

import type { AnalyzeResponse } from '@/types';

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL ?? 'file:./data/tactical-ghost.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = initDb();
  }
  await schemaReady;
}

export async function initDb(): Promise<void> {
  const db = getClient();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS plays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      team TEXT NOT NULL,
      formation TEXT NOT NULL,
      input_text TEXT NOT NULL,
      play_type TEXT,
      efficacy INTEGER,
      summary TEXT,
      steps_json TEXT NOT NULL,
      analysis TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      adversary TEXT NOT NULL,
      defenders_json TEXT NOT NULL
    );
  `);
}

export interface SavePlayInput {
  team: string;
  formation: string;
  inputText: string;
  analysis: AnalyzeResponse;
}

export async function savePlay(input: SavePlayInput): Promise<number> {
  await ensureSchema();
  const db = getClient();
  const result = await db.execute({
    sql: `INSERT INTO plays (team, formation, input_text, play_type, efficacy, summary, steps_json, analysis)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.team,
      input.formation,
      input.inputText,
      input.analysis.tipo,
      input.analysis.eficacia,
      input.analysis.resumo,
      JSON.stringify(input.analysis.steps),
      input.analysis.analise,
    ],
  });

  return Number(result.lastInsertRowid);
}

export interface PlayHistoryItem {
  id: number;
  createdAt: string;
  team: string;
  formation: string;
  inputText: string;
  playType: string | null;
  efficacy: number | null;
  summary: string | null;
}

export async function listPlays(limit = 20): Promise<PlayHistoryItem[]> {
  await ensureSchema();
  const db = getClient();
  const result = await db.execute({
    sql: `SELECT id, created_at, team, formation, input_text, play_type, efficacy, summary
          FROM plays ORDER BY created_at DESC LIMIT ?`,
    args: [limit],
  });

  return result.rows.map((row) => ({
    id: Number(row.id),
    createdAt: String(row.created_at),
    team: String(row.team),
    formation: String(row.formation),
    inputText: String(row.input_text),
    playType: row.play_type ? String(row.play_type) : null,
    efficacy: row.efficacy === null ? null : Number(row.efficacy),
    summary: row.summary ? String(row.summary) : null,
  }));
}
