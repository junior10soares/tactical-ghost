// Grava um vídeo .webm mudo demonstrando o fluxo completo do Tactical Ghost:
// digitar uma jogada, analisar via IA, ver a animação passo a passo, ouvir a
// narração e checar o histórico. Requer o dev server rodando (`npm run dev`).
//
// Uso: BASE_URL=http://localhost:3001 node scripts/record-demo.mjs
import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT_DIR = 'recordings';
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 800 } },
});
const page = await context.newPage();

async function pause(ms) {
  await page.waitForTimeout(ms);
}

await page.goto(BASE_URL);
await pause(1500);

// Jogada livre: digitar a descrição e analisar
const textarea = page.getByPlaceholder(/Descreva a jogada/i);
await textarea.click();
await textarea.type(
  'Vinicius arrancou pela esquerda, driblou dois marcantes e cruzou rasteiro para Richarlison, que bateu de primeira e fez um golaço',
  { delay: 25 },
);
await pause(800);

await page.getByRole('button', { name: /Analisar jogada/i }).click();
// Espera a análise da IA retornar (pode levar alguns segundos no Groq real)
await page.getByText(/eficácia/i).waitFor({ timeout: 30000 });
await pause(1500);

// Reproduzir os passos da jogada (anima no campo + dispara SFX)
await page.getByRole('button', { name: /Reproduzir jogada/i }).click();
await pause(6000);

// Ouvir a narração gerada pela IA (ElevenLabs)
await page.getByRole('button', { name: /Ouvir narração/i }).click();
await pause(4000);

// Mostrar o histórico de jogadas salvas
await page.mouse.wheel(0, 600);
await pause(2500);

// Modo Desafio do Técnico
await page.getByRole('button', { name: /Desafio do Técnico/i }).click();
await pause(2500);

await context.close();
await browser.close();

console.log(`Vídeo salvo em ${OUT_DIR}/`);
