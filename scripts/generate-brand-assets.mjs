// Génère apple-touch-icon.png, pwa-192x192.png, pwa-512x512.png et assets/og-image.png
// à partir du logo public/favicon.svg. Script ponctuel - peut être supprimé une fois
// les assets remplacés par un design final (Figma/Canva).
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const faviconSvg = readFileSync(resolve(root, 'public/favicon.svg'), 'utf-8');
const logoInner = faviconSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];

const LOGO_W = 492;
const LOGO_H = 511;
const BG = '#fafaf9';
const BRAND = '#2f9dd4';
const ACCENT = '#EF6A22';

function iconSvg(size) {
  const scale = (size * 0.6) / LOGO_H;
  const w = LOGO_W * scale;
  const h = LOGO_H * scale;
  const x = (size - w) / 2;
  const y = (size - h) / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}" />
  <g transform="translate(${x}, ${y}) scale(${scale})">${logoInner}</g>
</svg>`;
}

function ogImageSvg() {
  const width = 1200;
  const height = 630;
  const scale = 400 / LOGO_H;
  const w = LOGO_W * scale;
  const h = LOGO_H * scale;
  const x = 90;
  const y = (height - h) / 2;
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${BRAND}" />
  <g transform="translate(${x}, ${y}) scale(${scale})">${logoInner}</g>
  <text x="540" y="290" font-family="Arial, sans-serif" font-size="96" font-weight="700" fill="#ffffff">Zenko</text>
  <text x="540" y="360" font-family="Arial, sans-serif" font-size="34" fill="#ffffff" opacity="0.92">
    <tspan x="540" dy="0">Accompagner les enfants neurodivergents,</tspan>
    <tspan x="540" dy="46">ensemble - école, famille, spécialistes.</tspan>
  </text>
  <rect x="540" y="430" width="60" height="8" fill="${ACCENT}" />
</svg>`;
}

async function run() {
  await sharp(Buffer.from(iconSvg(180)))
    .png()
    .toFile(resolve(root, 'public/apple-touch-icon.png'));
  await sharp(Buffer.from(iconSvg(192)))
    .png()
    .toFile(resolve(root, 'public/pwa-192x192.png'));
  await sharp(Buffer.from(iconSvg(512)))
    .png()
    .toFile(resolve(root, 'public/pwa-512x512.png'));
  await sharp(Buffer.from(ogImageSvg())).png().toFile(resolve(root, 'public/assets/og-image.png'));
  console.log(
    'Assets générés : apple-touch-icon.png, pwa-192x192.png, pwa-512x512.png, assets/og-image.png'
  );
}

run();
