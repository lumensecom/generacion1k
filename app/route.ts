import fs from 'node:fs/promises';
import path from 'node:path';

// Sirve el index.html estático original (landing pública) sin pasar por
// React/App Router — se devuelve exactamente el mismo HTML que ya existía.
export const dynamic = 'force-static';

// Esta es la única parte del build que depende de la forma del sistema de
// archivos y no del grafo de módulos, así que es también la única que puede
// comportarse distinto en Vercel que en local (root directory, working dir,
// archivos no incluidos en el deploy). Si la lectura falla, antes reventaba
// el build completo: con force-static, una excepción aquí aborta el
// "Generating static pages" y no se despliega nada.
//
// Ahora falla suave: se registra el error en el log del build y se sirve una
// página mínima, para que el resto del sitio (/portal, /recursos, /programa)
// sí quede desplegado y el problema se pueda ver en vez de adivinarlo.
async function leerLanding(): Promise<string | null> {
  const filePath = path.join(process.cwd(), 'index.html');
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(
      `[landing] No se pudo leer ${filePath} (cwd: ${process.cwd()}):`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

const FALLBACK = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Generación 1K</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0A0A0A;
       color:#fff;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px}
  a{display:inline-block;margin-top:24px;background:#F59E0B;color:#000;font-weight:700;
    padding:14px 26px;border-radius:12px;text-decoration:none}
  p{color:#B4B4BE;line-height:1.6;max-width:420px}
</style>
</head>
<body>
  <main>
    <h1>Generación 1K</h1>
    <p>Estamos actualizando esta página. Mientras tanto, puedes agendar tu llamada directamente.</p>
    <a href="https://calendly.com/juanfelipelopezlara3/30min">Agenda tu llamada</a>
  </main>
</body>
</html>`;

export async function GET() {
  const html = (await leerLanding()) ?? FALLBACK;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
