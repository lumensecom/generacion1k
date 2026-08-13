import 'server-only';

// Lector de streams SSE en formato OpenAI. Lo hablan NVIDIA y OpenRouter
// igual, así que vive aquí y no dentro de un proveedor concreto.

export class ErrorDeStream extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeStream';
  }
}

/**
 * Convierte el stream SSE en un stream de texto plano listo para el navegador.
 *
 * Se queda solo con `delta.content`. Los modelos de razonamiento mandan además
 * su cadena de pensamiento, unos en un campo aparte (`reasoning`, que aquí se
 * ignora solo) y otros metida en el propio content entre <think>...</think>,
 * que sí hay que filtrar. Nada de eso se le enseña al estudiante: confunde y
 * multiplica el texto en pantalla.
 *
 * El router de modelos gratis de OpenRouter reparte entre modelos distintos en
 * cada llamada, así que las dos formas pueden aparecer el mismo día.
 */
export function leerTextoOpenAI(fuente: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
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
            // Los ":" son keep-alives (OpenRouter manda ": OPENROUTER PROCESSING").
            if (!limpia.startsWith('data:')) continue;

            const datos = limpia.slice(5).trim();
            if (datos === '[DONE]') continue;

            let evento: {
              choices?: { delta?: { content?: string } }[];
              error?: { message?: string };
            };
            try {
              evento = JSON.parse(datos);
            } catch {
              continue; // evento partido o keep-alive: se ignora
            }

            // Un fallo a mitad de stream llega como un evento más, no como un
            // código HTTP: la respuesta ya iba de camino cuando ocurrió.
            if (evento.error) {
              controller.error(new ErrorDeStream(evento.error.message ?? 'El modelo cortó la respuesta.'));
              return;
            }

            const trozo = evento.choices?.[0]?.delta?.content;
            if (!trozo) continue;

            // El <think> puede llegar partido entre trozos, por eso se lleva
            // el estado en `dentroDeThink` en vez de un replace.
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
