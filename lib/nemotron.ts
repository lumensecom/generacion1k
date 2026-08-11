import 'server-only';

// Cliente de la API de NVIDIA (NIM). Es compatible con el formato de OpenAI,
// así que son llamadas HTTP normales — no hace falta ningún SDK.
//
// La clave se saca de build.nvidia.com y empieza por "nvapi-".

const BASE_URL = 'https://integrate.api.nvidia.com/v1';

// Nemotron 3 Super: familia MoE de 120B parámetros con ~12B activos, así que
// responde rápido para lo grande que es. Es el punto medio de la familia
// (Nano 30B / Super 120B / Ultra 550B). Si algún día responde lento o sale
// caro, NEMOTRON_MODEL permite bajar a nano sin tocar código.
const MODELO_POR_DEFECTO = 'nvidia/nemotron-3-super-120b-a12b';

export function modeloActual(): string {
  return process.env.NEMOTRON_MODEL?.trim() || MODELO_POR_DEFECTO;
}

export interface Mensaje {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class NemotronError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'NemotronError';
  }
}

/**
 * Llama a la API y devuelve el stream crudo de SSE.
 * El parseo lo hace `leerTexto` — así el route handler puede ir mandando
 * texto al navegador según llega, en vez de esperar la respuesta completa.
 */
export async function chatStream(mensajes: Mensaje[], signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new NemotronError('Falta la variable de entorno NVIDIA_API_KEY.', 503);
  }

  const respuesta = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      model: modeloActual(),
      messages: mensajes,
      // Temperatura baja: es un tutor que cita material del curso. Aquí la
      // creatividad se traduce en inventarse pasos que Juan no enseña.
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 1200,
      stream: true,
    }),
    signal,
  });

  if (!respuesta.ok || !respuesta.body) {
    const detalle = await respuesta.text().catch(() => '');
    throw new NemotronError(
      `NVIDIA respondió ${respuesta.status}: ${detalle.slice(0, 300)}`,
      respuesta.status === 401 || respuesta.status === 403 ? 503 : 502
    );
  }

  return respuesta.body;
}

/**
 * Convierte el stream SSE de NVIDIA en un stream de texto plano.
 *
 * Nemotron 3 es un modelo de razonamiento: además de `content` puede emitir
 * `reasoning_content` (su cadena de pensamiento) y a veces envuelve esa parte
 * en <think>...</think>. Nada de eso se le muestra al estudiante — solo
 * confunde y multiplica el texto en pantalla.
 */
export function leerTexto(fuente: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';
  let dentroDeThink = false;

  return new ReadableStream({
    async start(controller) {
      const lector = fuente.getReader();
      try {
        for (;;) {
          const { done, value } = await lector.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Los eventos SSE se separan por línea; el último trozo del buffer
          // puede ser una línea a medias, así que se guarda para la vuelta
          // siguiente.
          const lineas = buffer.split('\n');
          buffer = lineas.pop() ?? '';

          for (const linea of lineas) {
            const limpia = linea.trim();
            if (!limpia.startsWith('data:')) continue;

            const datos = limpia.slice(5).trim();
            if (datos === '[DONE]') continue;

            let trozo: string | undefined;
            try {
              trozo = JSON.parse(datos)?.choices?.[0]?.delta?.content;
            } catch {
              continue; // evento partido o keep-alive: se ignora
            }
            if (!trozo) continue;

            // Filtro de <think>: puede llegar partido entre trozos, por eso
            // se lleva el estado en `dentroDeThink` en vez de un replace.
            let salida = '';
            for (const parte of trozo.split(/(<\/?think>)/)) {
              if (parte === '<think>') dentroDeThink = true;
              else if (parte === '</think>') dentroDeThink = false;
              else if (!dentroDeThink) salida += parte;
            }

            if (salida) controller.enqueue(encoder.encode(salida));
          }
        }
      } catch (error) {
        controller.error(error);
        return;
      } finally {
        lector.releaseLock();
      }
      controller.close();
    },
  });
}
