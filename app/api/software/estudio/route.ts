import { getSession } from '@/lib/session';
import {
  responder,
  esErrorDeConfiguracion,
  esErrorDeModelo,
  type Mensaje,
} from '@/lib/asistente-modelo';
import { SISTEMA_ESTUDIO, TAREAS } from '@/lib/software-landings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * El estudio del Software 1K: copy de landing, hooks, guiones y FAQ.
 *
 * Corre sobre el mismo proveedor que el asistente del portal — OpenRouter con
 * su cadena de respaldo — y no sobre la configuración de LUMENS OS. Una sola
 * key que mantener y un solo sitio donde cambiar de modelo.
 */

const MAX_ENTRADA = 4000;

// Generar una landing cuesta bastante más que una pregunta al asistente, así
// que el tope es más bajo. Vive en memoria del proceso: no es un control de
// seguridad, es una red contra un bucle accidental.
const LIMITE_POR_HORA = 15;
const usos = new Map<string, number[]>();

function superaLimite(studentId: string): boolean {
  const ahora = Date.now();
  const haceUnaHora = ahora - 60 * 60 * 1000;
  const recientes = (usos.get(studentId) ?? []).filter((t) => t > haceUnaHora);
  recientes.push(ahora);
  usos.set(studentId, recientes);

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

  let cuerpo: { tarea?: unknown; entrada?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return error('Petición inválida.', 400);
  }

  const tarea = TAREAS.find((t) => t.id === cuerpo.tarea);
  if (!tarea) return error('Esa herramienta no existe.', 400);

  const entrada = typeof cuerpo.entrada === 'string' ? cuerpo.entrada.trim() : '';
  if (!entrada) return error('Cuéntale de qué producto se trata.', 400);
  if (entrada.length > MAX_ENTRADA) {
    return error('Eso es muy largo. Déjale lo esencial del producto.', 400);
  }

  if (superaLimite(session.sid)) {
    return error('Llegaste al límite de generaciones por hora. Vuelve en un rato.', 429);
  }

  const mensajes: Mensaje[] = [
    { role: 'user', content: `${tarea.instruccion}\n\n---\n\n${entrada}` },
  ];

  try {
    const stream = await responder(SISTEMA_ESTUDIO, mensajes, request.signal);
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      // El estudiante cerró la pestaña o canceló: no hay a quién responderle.
      return new Response(null, { status: 499 });
    }
    if (esErrorDeConfiguracion(e)) {
      return error('El estudio todavía no está configurado. Avísale a Juan.', 503);
    }
    if (esErrorDeModelo(e)) {
      return error('El modelo está saturado. Intenta otra vez en un minuto.', 502);
    }
    console.error('[estudio] falló la generación', e);
    return error('No se pudo generar. Intenta otra vez.', 500);
  }
}
