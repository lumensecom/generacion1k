import 'server-only';
import type { Mensaje } from '@/lib/asistente-modelo';

// Cliente de la API de Gemini (Google AI Studio) por REST.
//
// El ejemplo que circula usa el SDK de Python (`from google import genai`),
// pero el portal es Next.js: aquí es una llamada HTTP normal con
// `x-goog-api-key`. Se evita así una dependencia más en el bundle.

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// gemini-2.5-flash ya NO se puede usar con claves nuevas — la API responde
// 404 "no longer available to new users". Por eso el defecto es 3.6-flash,
// que es el flash actual. GEMINI_MODEL permite cambiarlo sin tocar código:
//   gemini-3.1-flash-lite -> ~1s a la primera palabra, sin razonamiento
//   gemini-3.6-flash      -> ~3.5s, respuestas notablemente mejores
const MODELO_POR_DEFECTO = 'gemini-3.6-flash';

// El razonamiento consume del MISMO presupuesto que la respuesta: medido,
// gasta 270-680 tokens antes de escribir la primera palabra. Con un tope de
// 300 la respuesta salía cortada a media frase. De ahí este margen.
const MAX_TOKENS = 2500;

export function modeloGemini(): string {
  return process.env.GEMINI_MODEL?.trim() || MODELO_POR_DEFECTO;
}

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

export async function geminiStream(
  sistema: string,
  mensajes: Mensaje[],
  signal?: AbortSignal
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiError('Falta la variable de entorno GEMINI_API_KEY.', 503);

  const respuesta = await fetch(
    `${BASE_URL}/${modeloGemini()}:streamGenerateContent?alt=sse`,
    {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Gemini llama "model" a lo que el resto del mundo llama "assistant".
        contents: mensajes.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        systemInstruction: { parts: [{ text: sistema }] },
        generationConfig: {
          // Baja a propósito: es un tutor que cita material del curso, y aquí
          // la creatividad se traduce en inventarse pasos que Juan no enseña.
          temperature: 0.3,
          topP: 0.9,
          maxOutputTokens: MAX_TOKENS,
          thinkingConfig: { thinkingLevel: 'low' },
        },
        // El material del curso ya trae las respuestas; sin esto el modelo
        // rellena huecos con prácticas genéricas de otros mercados.
        safetySettings: [],
      }),
      signal,
    }
  );

  if (!respuesta.ok || !respuesta.body) {
    const detalle = await respuesta.text().catch(() => '');
    throw new GeminiError(
      `Gemini respondió ${respuesta.status}: ${detalle.slice(0, 300)}`,
      respuesta.status === 401 || respuesta.status === 403 || respuesta.status === 404 ? 503 : 502
    );
  }

  return respuesta.body;
}

/**
 * Convierte el SSE de Gemini en texto plano.
 *
 * Los modelos 3.x razonan antes de responder. Ese razonamiento llega como
 * `part.thought === true` y no se le muestra al estudiante. Ojo: una parte
 * puede traer `thoughtSignature` Y texto real a la vez — esa sí se muestra;
 * la única marca fiable de "esto es pensamiento" es `thought`.
 */
export function leerTextoGemini(fuente: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      const lector = fuente.getReader();
      try {
        for (;;) {
          const { done, value } = await lector.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // El último trozo puede ser una línea a medias: se guarda para la
          // vuelta siguiente en vez de intentar parsearla rota.
          const lineas = buffer.split('\n');
          buffer = lineas.pop() ?? '';

          for (const linea of lineas) {
            const limpia = linea.trim();
            if (!limpia.startsWith('data:')) continue;
            const datos = limpia.slice(5).trim();
            if (!datos || datos === '[DONE]') continue;

            let evento: unknown;
            try {
              evento = JSON.parse(datos);
            } catch {
              continue;
            }

            const candidatos = (evento as { candidates?: unknown[] })?.candidates ?? [];
            for (const c of candidatos) {
              const partes =
                (c as { content?: { parts?: { text?: string; thought?: boolean }[] } })?.content?.parts ?? [];
              for (const p of partes) {
                if (p.thought || !p.text) continue;
                controller.enqueue(encoder.encode(p.text));
              }
            }
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
