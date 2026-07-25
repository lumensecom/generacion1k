import fs from 'node:fs/promises';
import path from 'node:path';

// Sirve el index.html estático original (landing pública) sin pasar por
// React/App Router — se devuelve exactamente el mismo HTML que ya existía.
export const dynamic = 'force-static';

export async function GET() {
  const filePath = path.join(process.cwd(), 'index.html');
  const html = await fs.readFile(filePath, 'utf-8');
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
