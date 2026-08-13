import 'server-only';
import type { Mensaje } from '@/lib/asistente-modelo';
import { leerTextoOpenAI } from '@/lib/sse-openai';

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

/** El formato SSE es el de OpenAI, igual que el de OpenRouter. */
export const leerTexto = leerTextoOpenAI;
