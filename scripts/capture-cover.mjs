// Captura um screenshot 1920x1080 do app após uma análise, para usar como
// imagem de capa no portfólio. Requer o dev server rodando.
// Uso: BASE_URL=http://localhost:3001 node scripts/capture-cover.mjs
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.setViewportSize({ width: 1920, height: 1080 });

await page.goto(BASE_URL);
await page.waitForTimeout(1000);

const textarea = page.getByPlaceholder(/Descreva a jogada/i);
await textarea.click();
await textarea.fill(
  'Vinicius arrancou pela esquerda, driblou dois marcantes e cruzou rasteiro para Richarlison, que bateu de primeira e fez um golaço',
);
await page.getByRole('button', { name: /Analisar jogada/i }).click();
await page.getByText(/eficácia/i).waitFor({ timeout: 30000 });
await page.waitForTimeout(1000);

await page.screenshot({ path: 'recordings/tactical-ghost-cover.png' });

await browser.close();
console.log('Screenshot salvo em recordings/tactical-ghost-cover.png');
