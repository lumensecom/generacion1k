import { getSession } from '@/lib/session';
import { responder, esErrorDeConfiguracion, esErrorDeModelo, type Mensaje } from '@/lib/asistente-modelo';
import { construirContexto, MODULOS_TEXTO } from '@/lib/asistente-contexto';
import { systemPrompt, bloqueDeMaterial } from '@/lib/asistente-prompt';

export const runtime = 'nodejs';
// La respuesta se genera entera en cada llamada: nada que cachear.
export const dynamic = 'force-dynamic';

const MAX_PREGUNTA = 1000;
const MAX_HISTORIAL = 8; // 4 turnos de ida y vuelta

// Límite por estudiante. Vive en memoria del proceso, así que con varias
// instancias en Vercel el tope real es más alto que el nominal. No es un
// control de seguridad: es una red para que un bucle accidental en el
// navegador no se coma la cuota de NVIDIA en una tarde.
const LIMITE_POR_HORA = 40;
const usos = new Map<string, number[]>();

function superaLimite(studentId: string): boolean {
  const ahora = Date.now();
  const haceUnaHora = ahora - 60 * 60 * 1000;
  const recientes = (usos.get(studentId) ?? []).filter((t) => t > haceUnaHora);
  recientes.push(ahora);
  usos.set(studentId, recientes);

  // Poda: sin esto el Map crece con cada estudiante que pasó alguna vez.
  if (usos.size > 500) {
    for (const [id, marcas] of usos) {
      if (marcas.every((t) => t <= haceUnaHora)) usos.delete(id);
    }
  }

  return recientes.length > LIMITE_POR_HORA;
}

function error(mensaje: string, status: number) {
  return Response.json({ error: mensaje }, { status });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return error('Tu sesión expiró. Vuelve a entrar al portal.', 401);

  let cuerpo: { pregunta?: unknown; historial?: unknown; slug?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return error('Petición inválida.', 400);
  }

  const pregunta = typeof cuerpo.pregunta === 'string' ? cuerpo.pregunta.trim() : '';
  if (!pregunta) return error('Escribe una pregunta.', 400);
  if (pregunta.length > MAX_PREGUNTA) return error('Esa pregunta es muy larga. Divídela en dos.', 400);

  if (superaLimite(session.sid)) {
    return error('Llegaste al límite de preguntas por hora. Vuelve en un rato.', 429);
  }

  const slug = typeof cuerpo.slug === 'string' ? cuerpo.slug : null;
  const moduloActual = MODULOS_TEXTO.find((m) => m.slug === slug)?.titulo ?? null;

  // El historial llega del cliente, así que se sanea: solo los últimos turnos,
  // solo roles válidos y solo texto. Nunca se confía en que traiga un `system`.
  const historial: Mensaje[] = Array.isArray(cuerpo.historial)
    ? cuerpo.historial
        .filter(
          (m): m is Mensaje =>
            !!m &&
            typeof m === 'object' &&
            (m as Mensaje).role !== 'system' &&
            ['user', 'assistant'].includes((m as Mensaje).role) &&
            typeof (m as Mensaje).content === 'string'
        )
        .slice(-MAX_HISTORIAL)
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_PREGUNTA) }))
    : [];

  // El material se busca con la pregunta actual, no con todo el historial:
  // si no, una conversación larga arrastra siempre los módulos del principio.
  const contexto = construirContexto(pregunta, slug);

  const sistema = systemPrompt(
    session.name.split(' ')[0] || session.name,
    moduloActual,
    session.role === 'admin'
  );
  const mensajes: Mensaje[] = [
    ...historial,
    { role: 'user', content: `${bloqueDeMaterial(contexto)}\n\nPREGUNTA DE ${session.name}:\n${pregunta}` },
  ];

  try {
    return new Response(await responder(sistema, mensajes, request.signal), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        // Evita que un proxy intermedio acumule la respuesta y rompa el streaming.
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (e) {
    // Si el estudiante cierra la pestaña, fetch aborta: no es un fallo real.
    if (e instanceof Error && e.name === 'AbortError') return new Response(null, { status: 499 });

    if (esErrorDeModelo(e)) {
      console.error('[asistente]', e.message);
      return esErrorDeConfiguracion(e)
        ? error('El asistente no está configurado todavía. Avísale a Juan.', 503)
        : error('El asistente no está disponible en este momento. Intenta de nuevo en un minuto.', 502);
    }

    console.error('[asistente] error inesperado', e);
    return error('Algo falló. Intenta de nuevo.', 500);
  }
}
