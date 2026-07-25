import fs from 'node:fs/promises';
import path from 'node:path';

// Sirve programa/index.html (landing del programa premium) sin cambios,
// exactamente igual que antes de introducir Next.js en el repo.
export const dynamic = 'force-static';

export async function GET() {
  const filePath = path.join(process.cwd(), 'programa', 'index.html');
  const html = await fs.readFile(filePath, 'utf-8');
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
