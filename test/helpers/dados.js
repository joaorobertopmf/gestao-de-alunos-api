import { readFileSync } from 'node:fs';

export function carregarDados(arquivo) {
  const caminho = new URL(`../fixtures/${arquivo}`, import.meta.url);
  return JSON.parse(readFileSync(caminho, 'utf8'));
}
