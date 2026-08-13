import 'server-only';
import type { Mensaje } from '@/lib/asistente-modelo';

// Cliente de OpenRouter. La API es compatible con la de OpenAI, así que son
// llamadas HTTP normales — no hace falta ningún SDK.
//
// La clave sale de openrouter.ai/keys y empieza por "sk-or-v1-".

const BASE_URL = 'https://openrouter.ai/api/v1';

// "openrouter/free" es un router: en cada llamada elige al azar uno de los
// modelos gratuitos disponibles, filtrando por lo que la petición necesite.
// Eso trae dos cosas que condicionan el resto del archivo: la respuesta puede
// venir de un modelo de razonamiento (por eso el filtro de <think> en el
// lector) y la ventana de contexto es la del modelo que toque, que puede ser
// pequeña — de ahí que el prompt no pueda crecer sin medida.
//
// OPENROUTER_MODEL permite fijar un modelo concreto sin tocar código, que es
// la salida si el router empieza a devolver respuestas flojas.
const MODELO_POR_DEFECTO = 'openrouter/free';

export function modeloActual(): string {
  return process.env.OPENROUTER_MODEL?.trim() || MODELO_POR_DEFECTO;
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

/**
 * Llama a la API y devuelve el stream crudo de SSE. El parseo lo hace
 * `leerTextoOpenAI`, para poder ir mandando texto al navegador según llega.
 */
export async function chatStream(mensajes: Mensaje[], signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new OpenRouterError('Falta la variable de entorno OPENROUTER_API_KEY.', 503);
  }

  const respuesta = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      // Opcionales de OpenRouter: identifican la app en su panel de uso.
      'HTTP-Referer': 'https://generacion1k.com',
      'X-Title': 'Generación 1K',
    },
    body: JSON.stringify({
      model: modeloActual(),
      messages: mensajes,
      // Temperatura baja: es un tutor que cita material del curso. Aquí la
      // creatividad se traduce en inventarse pasos que Juan no enseña.
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 1200,
      // Sin esto el asistente devuelve respuestas vacías. Buena parte de los
      // modelos gratuitos del router razonan, y el razonamiento consume del
      // mismo max_tokens que la respuesta: en una prueba real, nemotron-nano
      // se gastó los 80 tokens pensando y terminó con finish_reason "length"
      // y contenido vacío. `exclude: true` no sirve — sigue gastándolos, solo
      // esconde el texto. Esto los apaga: 0 tokens de razonamiento.
      reasoning: { enabled: false },
      stream: true,
    }),
    signal,
  });

  if (!respuesta.ok || !respuesta.body) {
    const detalle = await respuesta.text().catch(() => '');
    // 401/403 es la clave; 402 es que se acabó el saldo gratis. Los tres son
    // configuración, no un fallo pasajero, y el 429 sí conviene reintentarlo
    // con otro proveedor.
    const esConfiguracion = [401, 402, 403].includes(respuesta.status);
    throw new OpenRouterError(
      `OpenRouter respondió ${respuesta.status}: ${detalle.slice(0, 300)}`,
      esConfiguracion ? 503 : 502
    );
  }

  return respuesta.body;
}
