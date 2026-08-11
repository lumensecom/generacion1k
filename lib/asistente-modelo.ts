import 'server-only';
import { geminiStream, leerTextoGemini, modeloGemini, GeminiError } from '@/lib/gemini';
import { chatStream, leerTexto, modeloActual as modeloNemotron, NemotronError } from '@/lib/nemotron';

// Elige el proveedor según qué clave esté configurada. El route handler no
// sabe con cuál está hablando: solo pide un stream de texto.
//
// Se mantienen los dos porque no cuestan nada teniéndolos escritos y dan una
// salida si uno se cae o cambia de precio. Gemini manda cuando ambos están
// configurados, que es lo que hay hoy.

export interface Mensaje {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type Proveedor = 'gemini' | 'nemotron';

export function proveedorActivo(): Proveedor | null {
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.NVIDIA_API_KEY) return 'nemotron';
  return null;
}

export function modeloActivo(): string {
  const p = proveedorActivo();
  if (p === 'gemini') return modeloGemini();
  if (p === 'nemotron') return modeloNemotron();
  return 'ninguno';
}

export class AsistenteNoConfigurado extends Error {
  readonly status = 503;
  constructor() {
    super('No hay ninguna clave de modelo configurada (GEMINI_API_KEY o NVIDIA_API_KEY).');
    this.name = 'AsistenteNoConfigurado';
  }
}

/**
 * Devuelve un stream de texto plano ya listo para mandar al navegador.
 * `sistema` va aparte del historial porque Gemini lo trata como un campo
 * propio (systemInstruction), no como un mensaje más de la conversación.
 */
export async function responder(
  sistema: string,
  mensajes: Mensaje[],
  signal?: AbortSignal
): Promise<ReadableStream<Uint8Array>> {
  switch (proveedorActivo()) {
    case 'gemini':
      return leerTextoGemini(await geminiStream(sistema, mensajes, signal));
    case 'nemotron':
      // Nemotron usa el formato de OpenAI, donde el sistema es el primer mensaje.
      return leerTexto(await chatStream([{ role: 'system', content: sistema }, ...mensajes], signal));
    default:
      throw new AsistenteNoConfigurado();
  }
}

/** true si el error viene de que falta configuración, no de un fallo puntual. */
export function esErrorDeConfiguracion(e: unknown): boolean {
  return (
    e instanceof AsistenteNoConfigurado ||
    ((e instanceof GeminiError || e instanceof NemotronError) && e.status === 503)
  );
}

export function esErrorDeModelo(e: unknown): e is GeminiError | NemotronError | AsistenteNoConfigurado {
  return e instanceof GeminiError || e instanceof NemotronError || e instanceof AsistenteNoConfigurado;
}
