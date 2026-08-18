'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import {
  crearPregunta,
  crearSolicitudReunion,
  getReunionesDeEstudiante,
  votar,
  getEncuestaAbierta,
  guardarTemaSesion,
} from '@/lib/portal-data';
import { cupoRestante, CUPO_SEMANAL_1A1 } from '@/lib/reuniones';

async function requireStudent() {
  const session = await getSession();
  if (!session) throw new Error('Sesión expirada.');
  return session;
}

const MAX = 2000;

export async function enviarPregunta(formData: FormData) {
  const session = await requireStudent();
  const question = String(formData.get('question') ?? '').trim();
  const moduleSlug = String(formData.get('moduleSlug') ?? '').trim();

  if (question.length < 10) return { error: 'Cuéntame un poco más para poder ayudarte bien.' };
  if (question.length > MAX) return { error: 'Es muy larga. Resúmela o divídela en dos preguntas.' };

  await crearPregunta({ studentId: session.sid, question, moduleSlug: moduleSlug || null });
  revalidatePath('/portal/ayuda');
  return {};
}

/**
 * La pregunta es obligatoria a propósito: obliga a llegar a la reunión con
 * algo concreto en vez de un "hablemos", y le permite a Juan prepararla.
 *
 * El cupo se comprueba aquí y no solo en la pantalla: el botón se puede
 * esquivar, y dos estudiantes pidiendo a la vez pasarían los dos el control
 * del cliente.
 */
export async function solicitarReunion(formData: FormData) {
  const session = await requireStudent();
  const question = String(formData.get('question') ?? '').trim();
  const availability = String(formData.get('availability') ?? '').trim();

  if (question.length < 10) return { error: 'Escribe qué quieres resolver en la reunión.' };
  if (question.length > MAX) return { error: 'Resúmelo un poco para que quepa.' };

  const restante = cupoRestante(await getReunionesDeEstudiante(session.sid));
  if (restante <= 0) {
    return {
      error: `Ya usaste tus ${CUPO_SEMANAL_1A1} sesiones 1:1 de esta semana. El cupo se reinicia el lunes. Mientras tanto nos vemos en la grupal, o escríbeme por "Mis preguntas".`,
    };
  }

  await crearSolicitudReunion({
    studentId: session.sid,
    question,
    availability: availability || null,
  });
  revalidatePath('/portal/ayuda');
  return {};
}

export async function votarEncuesta(optionId: string) {
  const session = await requireStudent();
  const encuesta = await getEncuestaAbierta();
  if (!encuesta) return { error: 'No hay ninguna encuesta abierta ahora mismo.' };

  const valida = encuesta.options.some((o) => o.id === optionId);
  if (!valida) return { error: 'Esa opción ya no existe.' };

  await votar(encuesta.id, session.sid, optionId);
  revalidatePath('/portal/clases');
  // La encuesta también se vota desde debajo del calendario.
  revalidatePath('/portal/agenda');
  return {};
}

/**
 * El estudiante propone qué quiere tratar en una de sus 1:1.
 * El guardado filtra por student_id además de por sesión: sin eso,
 * cualquiera con un id de sesión ajeno podría escribir en la agenda de otro.
 */
export async function guardarTema(sessionId: string, tema: string) {
  const session = await requireStudent();
  const limpio = tema.trim().slice(0, 1000);

  const ok = await guardarTemaSesion(sessionId, session.sid, limpio);
  if (!ok) return { error: 'Esa sesión no es tuya.' };

  revalidatePath('/portal/perfil');
  // El tema se escribe DESDE la agenda: sin esto, al reabrir la sesión
  // seguía apareciendo el texto viejo.
  revalidatePath('/portal/agenda');
  return {};
}
