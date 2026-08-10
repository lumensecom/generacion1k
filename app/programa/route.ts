import fs from 'node:fs/promises';
import path from 'node:path';

// Sirve programa/index.html (landing del programa premium) sin cambios,
// exactamente igual que antes de introducir Next.js en el repo.
export const dynamic = 'force-static';

// Mismo razonamiento que en app/route.ts: una excepción aquí abortaba el
// "Generating static pages" y con ello el deploy completo. Falla suave y
// deja el error en el log del build.
export async function GET() {
  const filePath = path.join(process.cwd(), 'programa', 'index.html');
  try {
    const html = await fs.readFile(filePath, 'utf-8');
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error(
      `[programa] No se pudo leer ${filePath} (cwd: ${process.cwd()}):`,
      error instanceof Error ? error.message : error
    );
    return new Response(null, {
      status: 307,
      headers: { Location: '/' },
    });
  }
}
