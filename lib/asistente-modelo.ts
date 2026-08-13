import 'server-only';
import { geminiStream, leerTextoGemini, modeloGemini, GeminiError } from '@/lib/gemini';
import { chatStream as nemotronStream, modeloActual as modeloNemotron, NemotronError } from '@/lib/nemotron';
import { chatStream as openrouterStream, modeloActual as modeloOpenRouter, OpenRouterError } from '@/lib/openrouter';
import { leerTextoOpenAI } from '@/lib/sse-openai';

// Elige el proveedor según qué claves estén configuradas. El route handler no
// sabe con cuál está hablando: solo pide un stream de texto.
//
// OpenRouter va primero. Su router de modelos gratis no tiene el tope diario
// de la capa gratuita de Gemini, que con cinco estudiantes se agotaba en una
// tarde. Los otros dos se quedan escritos como respaldo: no cuestan nada
// teniéndolos y son la salida si OpenRouter se cae o cambia de condiciones.

export interface Mensaje {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type Proveedor = 'openrouter' | 'gemini' | 'nemotron';

const CLAVES: Record<Proveedor, string> = {
  openrouter: 'OPENROUTER_API_KEY',
  gemini: 'GEMINI_API_KEY',
  nemotron: 'NVIDIA_API_KEY',
};

/** Los proveedores con clave, en orden de preferencia. */
export function proveedoresActivos(): Proveedor[] {
  return (['openrouter', 'gemini', 'nemotron'] as const).filter((p) => !!process.env[CLAVES[p]]);
}

export function proveedorActivo(): Proveedor | null {
  return proveedoresActivos()[0] ?? null;
}

export function modeloDe(p: Proveedor): string {
  if (p === 'openrouter') return modeloOpenRouter();
  if (p === 'gemini') return modeloGemini();
  return modeloNemotron();
}

export function modeloActivo(): string {
  const p = proveedorActivo();
  return p ? modeloDe(p) : 'ninguno';
}

export class AsistenteNoConfigurado extends Error {
  readonly status = 503;
  constructor() {
    super(`No hay ninguna clave de modelo configurada (${Object.values(CLAVES).join(', ')}).`);
    this.name = 'AsistenteNoConfigurado';
  }
}

async function abrirStream(
  p: Proveedor,
  sistema: string,
  mensajes: Mensaje[],
  signal?: AbortSignal
): Promise<ReadableStream<Uint8Array>> {
  switch (p) {
    case 'openrouter':
      // Formato OpenAI: el sistema es el primer mensaje de la conversación.
      return leerTextoOpenAI(await openrouterStream([{ role: 'system', content: sistema }, ...mensajes], signal));
    case 'gemini':
      return leerTextoGemini(await geminiStream(sistema, mensajes, signal));
    case 'nemotron':
      return leerTextoOpenAI(await nemotronStream([{ role: 'system', content: sistema }, ...mensajes], signal));
  }
}

/**
 * Devuelve un stream de texto plano ya listo para mandar al navegador.
 *
 * Si el primero falla se intenta con el siguiente. El respaldo solo puede
 * actuar aquí, antes de que empiece a salir texto: en cuanto el navegador
 * recibe el primer trozo ya no hay vuelta atrás, así que un corte a mitad de
 * respuesta llega al estudiante como error y no como reintento.
 *
 * `sistema` va aparte del historial porque Gemini lo trata como un campo
 * propio (systemInstruction), no como un mensaje más de la conversación.
 */
export async function responder(
  sistema: string,
  mensajes: Mensaje[],
  signal?: AbortSignal
): Promise<ReadableStream<Uint8Array>> {
  const proveedores = proveedoresActivos();
  if (proveedores.length === 0) throw new AsistenteNoConfigurado();

  let ultimo: unknown;
  for (const p of proveedores) {
    try {
      return await abrirStream(p, sistema, mensajes, signal);
    } catch (e) {
      // Que el estudiante cierre la pestaña no es un fallo del proveedor:
      // reintentar con otro sería pedirle una respuesta a nadie.
      if (e instanceof Error && e.name === 'AbortError') throw e;
      console.error(`[asistente] ${p} falló, se intenta con el siguiente`, e);
      ultimo = e;
    }
  }
  throw ultimo;
}

/** true si el error viene de que falta configuración, no de un fallo puntual. */
export function esErrorDeConfiguracion(e: unknown): boolean {
  return e instanceof AsistenteNoConfigurado || (esErrorDeModelo(e) && e.status === 503);
}

export function esErrorDeModelo(
  e: unknown
): e is GeminiError | NemotronError | OpenRouterError | AsistenteNoConfigurado {
  return (
    e instanceof GeminiError ||
    e instanceof NemotronError ||
    e instanceof OpenRouterError ||
    e instanceof AsistenteNoConfigurado
  );
}
