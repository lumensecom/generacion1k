'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  setPortalConfig,
  getStudentByEmail,
  responderPregunta,
  cerrarPregunta,
  actualizarReunion,
  crearClase,
  actualizarClase,
  borrarClase,
  crearEncuesta,
  cerrarEncuesta,
} from '@/lib/portal-data';
import { hashPassword, generarPassword, MIN_PASSWORD } from '@/lib/password';
import { tieneVideo } from '@/lib/video';
import type { MeetingRequest } from '@/lib/types';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') throw new Error('No autorizado.');
  return session;
}

export async function toggleActiveGeneration(isActive: boolean) {
  await requireAdmin();
  await setPortalConfig('is_active', isActive ? 'true' : 'false');
  revalidatePath('/portal/admin');
  return {};
}

export async function updateAccessCode(code: string) {
  await requireAdmin();
  const trimmed = code.trim();
  if (!trimmed) return { error: 'La clave no puede estar vacía.' };
  await setPortalConfig('access_code', trimmed);
  revalidatePath('/portal/admin');
  return {};
}

export async function toggleModuleLock(moduleId: string, isLocked: boolean) {
  await requireAdmin();
  await supabaseAdmin().from('modules').update({ is_locked: isLocked }).eq('id', moduleId);
  revalidatePath('/portal/admin');
  revalidatePath('/portal/modulos');
  return {};
}

export async function updateModuleLoomUrl(moduleId: string, loomUrl: string) {
  await requireAdmin();
  await supabaseAdmin()
    .from('modules')
    .update({ loom_url: loomUrl.trim() || null })
    .eq('id', moduleId);
  revalidatePath('/portal/admin');
  return {};
}

/**
 * Editor simple: el contenido teórico se edita como JSON (array de bloques
 * que entiende TheoryRenderer) y la práctica como una lista, un ítem por
 * línea. No es un editor visual de bloques — es la versión honesta y
 * funcional para v1; un editor visual sería la siguiente iteración natural.
 */
export async function updateModuleContent(
  moduleId: string,
  theoryContentJson: string,
  practiceChecklistText: string
) {
  await requireAdmin();

  let theoryContent: unknown;
  try {
    theoryContent = JSON.parse(theoryContentJson);
    if (!Array.isArray(theoryContent)) throw new Error('not array');
  } catch {
    return { error: 'El contenido teórico debe ser un JSON válido (array de bloques).' };
  }

  const practiceChecklist = practiceChecklistText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  await supabaseAdmin()
    .from('modules')
    .update({ theory_content: theoryContent, practice_checklist: practiceChecklist })
    .eq('id', moduleId);

  revalidatePath('/portal/admin');
  revalidatePath('/portal/modulos');
  return {};
}

export async function setStudentActive(studentId: string, isActive: boolean) {
  await requireAdmin();
  await supabaseAdmin().from('students').update({ is_active: isActive }).eq('id', studentId);
  revalidatePath('/portal/admin');
  return {};
}

// ============================================================
// Crear cuentas de estudiante
// ============================================================

/**
 * Juan crea la cuenta y le entrega la contraseña al estudiante.
 * Devuelve la contraseña EN CLARO una sola vez, para que pueda copiarla:
 * a partir de aquí solo queda el hash y no hay forma de recuperarla.
 */
export async function crearEstudiante(formData: FormData): Promise<{
  error?: string;
  ok?: { email: string; password: string; nombre: string };
}> {
  await requireAdmin();

  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const manual = String(formData.get('password') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();

  if (fullName.length < 2) return { error: 'Escribe el nombre completo.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Ese correo no parece válido.' };
  if (manual && manual.length < MIN_PASSWORD) {
    return { error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` };
  }

  const existente = await getStudentByEmail(email);
  if (existente) return { error: 'Ya existe una cuenta con ese correo.' };

  const password = manual || generarPassword();
  const { error } = await supabaseAdmin().from('students').insert({
    email,
    full_name: fullName,
    phone: phone || null,
    role: 'student',
    password_hash: await hashPassword(password),
    password_set_at: new Date().toISOString(),
    created_by_admin: true,
  });

  if (error) return { error: 'No se pudo crear la cuenta. Intenta de nuevo.' };

  revalidatePath('/portal/admin');
  return { ok: { email, password, nombre: fullName } };
}

/** Cambiar la contraseña de alguien que la perdió. */
export async function resetearPassword(studentId: string, nueva?: string) {
  await requireAdmin();
  const password = nueva?.trim() || generarPassword();
  if (password.length < MIN_PASSWORD) {
    return { error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` };
  }
  await supabaseAdmin()
    .from('students')
    .update({ password_hash: await hashPassword(password), password_set_at: new Date().toISOString() })
    .eq('id', studentId);
  revalidatePath('/portal/admin');
  return { ok: { password } };
}

// ============================================================
// Panel de ayuda
// ============================================================

export async function responderPreguntaAdmin(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const reply = String(formData.get('reply') ?? '').trim();
  const videoUrl = String(formData.get('videoUrl') ?? '').trim();

  if (!id) return { error: 'Falta la pregunta.' };
  if (!reply && !videoUrl) return { error: 'Escribe una recomendación o adjunta un video.' };
  if (videoUrl && !tieneVideo(videoUrl)) {
    return { error: 'Esa URL de video no se reconoce. Pega el enlace del video en Cloudinary.' };
  }

  await responderPregunta({ id, reply: reply || null, videoUrl: videoUrl || null });
  revalidatePath('/portal/admin');
  revalidatePath('/portal/ayuda');
  return {};
}

export async function cerrarPreguntaAdmin(id: string) {
  await requireAdmin();
  await cerrarPregunta(id);
  revalidatePath('/portal/admin');
  revalidatePath('/portal/ayuda');
  return {};
}

// ============================================================
// Reuniones 1:1
// ============================================================

export async function actualizarReunionAdmin(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? 'pendiente') as MeetingRequest['status'];
  const adminNote = String(formData.get('adminNote') ?? '').trim();
  const scheduledAt = String(formData.get('scheduledAt') ?? '').trim();

  if (!id) return { error: 'Falta la solicitud.' };

  await actualizarReunion({
    id,
    status,
    adminNote: adminNote || null,
    // El input datetime-local entrega hora local sin zona; se convierte a
    // ISO aquí para que la base guarde siempre UTC.
    scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
  });
  revalidatePath('/portal/admin');
  revalidatePath('/portal/ayuda');
  return {};
}

// ============================================================
// Clase grupal semanal
// ============================================================

export async function crearClaseAdmin(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const scheduledAt = String(formData.get('scheduledAt') ?? '').trim();
  const meetUrl = String(formData.get('meetUrl') ?? '').trim();
  const recordingUrl = String(formData.get('recordingUrl') ?? '').trim();
  const duration = Number(formData.get('durationMinutes') ?? 90);

  if (!title) return { error: 'Ponle un título a la clase.' };
  if (recordingUrl && !tieneVideo(recordingUrl)) {
    return { error: 'Esa URL de grabación no se reconoce. Pega el enlace del video en Cloudinary.' };
  }

  await crearClase({
    title,
    description: description || null,
    scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    meetUrl: meetUrl || null,
    recordingUrl: recordingUrl || null,
    durationMinutes: Number.isFinite(duration) && duration > 0 ? duration : 90,
  });
  revalidatePath('/portal/admin');
  revalidatePath('/portal/clases');
  return {};
}

export async function guardarGrabacionClase(id: string, recordingUrl: string) {
  await requireAdmin();
  const url = recordingUrl.trim();
  if (url && !tieneVideo(url)) {
    return { error: 'Esa URL de video no se reconoce. Pega el enlace de Cloudinary.' };
  }
  await actualizarClase(id, { recording_url: url || null });
  revalidatePath('/portal/admin');
  revalidatePath('/portal/clases');
  return {};
}

export async function borrarClaseAdmin(id: string) {
  await requireAdmin();
  await borrarClase(id);
  revalidatePath('/portal/admin');
  revalidatePath('/portal/clases');
  return {};
}

// ============================================================
// Encuesta del día de clase
// ============================================================

export async function crearEncuestaAdmin(formData: FormData) {
  await requireAdmin();
  const question = String(formData.get('question') ?? '').trim();
  const opcionesTexto = String(formData.get('opciones') ?? '');

  const opciones = opcionesTexto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    // El id se deriva del texto para que los votos sobrevivan a un reorden
    // de la lista; el índice no serviría.
    .map((label, i) => ({ id: `${i}-${label.slice(0, 24).replace(/\s+/g, '-').toLowerCase()}`, label }));

  if (opciones.length < 2) return { error: 'Pon al menos dos opciones, una por línea.' };

  await crearEncuesta(question || '¿Qué día te sirve para la clase grupal?', opciones);
  revalidatePath('/portal/admin');
  revalidatePath('/portal/clases');
  return {};
}

export async function cerrarEncuestaAdmin(id: string) {
  await requireAdmin();
  await cerrarEncuesta(id);
  revalidatePath('/portal/admin');
  revalidatePath('/portal/clases');
  return {};
}

// ============================================================
// Video del módulo (Cloudinary)
// ============================================================

export async function updateModuleVideoUrl(moduleId: string, videoUrl: string) {
  await requireAdmin();
  const url = videoUrl.trim();
  if (url && !tieneVideo(url)) {
    return { error: 'Esa URL no se reconoce. Pega el enlace del video en Cloudinary.' };
  }
  await supabaseAdmin().from('modules').update({ video_url: url || null }).eq('id', moduleId);
  revalidatePath('/portal/admin');
  revalidatePath('/portal/modulos');
  return {};
}
