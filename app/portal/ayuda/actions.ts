'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { crearPregunta, crearSolicitudReunion, votar, getEncuestaAbierta } from '@/lib/portal-data';

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
 */
export async function solicitarReunion(formData: FormData) {
  const session = await requireStudent();
  const question = String(formData.get('question') ?? '').trim();
  const availability = String(formData.get('availability') ?? '').trim();

  if (question.length < 10) return { error: 'Escribe qué quieres resolver en la reunión.' };
  if (question.length > MAX) return { error: 'Resúmelo un poco para que quepa.' };

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
  return {};
}
