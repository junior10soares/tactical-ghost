// Grava um vídeo .webm explicando o pipeline LangGraph real (analyze →
// persist) do Tactical Ghost, extraído via API local do `langgraphjs dev`
// (sem precisar de login no LangSmith). Usado para juntar com o vídeo de
// demo do app (ver scripts/concat-videos.mjs).
import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = 'recordings';
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 800 } },
});
const page = await context.newPage();

await page.goto('file://' + path.join(__dirname, 'graph-diagram.html'));
await page.waitForFunction(() => window.__done === true, { timeout: 20000 });
await page.waitForTimeout(500);

await context.close();
await browser.close();

console.log(`Vídeo salvo em ${OUT_DIR}/`);
