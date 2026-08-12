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
  actualizarPlanYPagos,
  generarCronograma,
  generarClasesSemanales,
  actualizarSesion,
  borrarSesion,
} from '@/lib/portal-data';
import { aCentavos } from '@/lib/planes';
import { hashPassword, generarPassword, MIN_PASSWORD } from '@/lib/password';
import { tieneVideo } from '@/lib/video';
import type { MeetingRequest, OneOnOneSession } from '@/lib/types';

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

// ============================================================
// Plan, pagos y cronograma de 1:1
// ============================================================

export async function guardarPlanYPagos(formData: FormData) {
  await requireAdmin();
  const studentId = String(formData.get('studentId') ?? '');
  if (!studentId) return { error: 'Falta el estudiante.' };

  const planId = String(formData.get('plan') ?? '').trim();
  const total = aCentavos(String(formData.get('amountTotal') ?? '0'));
  const pagado = aCentavos(String(formData.get('amountPaid') ?? '0'));
  if (total === null || pagado === null) return { error: 'Los importes deben ser números.' };

  const sesionesTexto = String(formData.get('sessionsTotal') ?? '').trim();
  const sesiones = sesionesTexto ? Number(sesionesTexto) : null;
  if (sesiones !== null && (!Number.isInteger(sesiones) || sesiones < 1 || sesiones > 100)) {
    return { error: 'Las sesiones deben ser un número entre 1 y 100.' };
  }

  await actualizarPlanYPagos(studentId, {
    plan: planId === 'start' || planId === 'growth' ? planId : null,
    planStartedAt: String(formData.get('planStartedAt') ?? '').trim() || null,
    sessionsTotal: sesiones,
    amountTotalCents: total,
    amountPaidCents: pagado,
    currency: String(formData.get('currency') ?? 'USD').trim().toUpperCase().slice(0, 3) || 'USD',
    paymentNotes: String(formData.get('paymentNotes') ?? '').trim() || null,
  });

  revalidatePath('/portal/admin');
  revalidatePath('/portal/perfil');
  return {};
}

/**
 * Crea de una vez las sesiones que falten, repitiendo uno o dos horarios
 * cada semana. El segundo horario es opcional: con uno solo se comporta
 * como antes.
 */
export async function generarCronogramaAdmin(formData: FormData) {
  await requireAdmin();
  const studentId = String(formData.get('studentId') ?? '');
  const total = Number(formData.get('total') ?? 0);
  const duracion = Number(formData.get('duracion') ?? 90);

  if (!studentId) return { error: 'Falta el estudiante.' };
  if (!Number.isInteger(total) || total < 1 || total > 100) {
    return { error: 'El número de sesiones debe estar entre 1 y 100.' };
  }

  const anclas: Date[] = [];
  for (const campo of ['slot1', 'slot2']) {
    const texto = String(formData.get(campo) ?? '').trim();
    if (!texto) continue;
    const d = new Date(texto);
    if (Number.isNaN(d.getTime())) return { error: 'Alguna de las fechas no es válida.' };
    anclas.push(d);
  }
  if (anclas.length === 0) return { error: 'Elige al menos el primer horario de la semana.' };

  // Dos anclas en el mismo instante generarían dos sesiones superpuestas.
  if (anclas.length === 2 && anclas[0].getTime() === anclas[1].getTime()) {
    return { error: 'Los dos horarios son el mismo. Cambia el segundo o déjalo vacío.' };
  }
  // Más de 7 días entre anclas rompe la idea de "dos veces por semana".
  if (anclas.length === 2 && Math.abs(anclas[0].getTime() - anclas[1].getTime()) >= 7 * 864e5) {
    return { error: 'Los dos horarios deben estar dentro de la misma semana.' };
  }

  await generarCronograma(studentId, total, anclas, Number.isFinite(duracion) ? duracion : 90);
  revalidatePath('/portal/admin');
  revalidatePath('/portal/agenda');
  revalidatePath('/portal/perfil');
  return {};
}

/** Crea las clases grupales de todo el trimestre de una sola vez. */
export async function generarClasesAdmin(formData: FormData) {
  await requireAdmin();
  const titulo = String(formData.get('titulo') ?? '').trim() || 'Clase grupal';
  const desdeTexto = String(formData.get('desde') ?? '').trim();
  const semanas = Number(formData.get('semanas') ?? 12);
  const duracion = Number(formData.get('duracion') ?? 90);
  const meetUrl = String(formData.get('meetUrl') ?? '').trim();

  if (!desdeTexto) return { error: 'Elige la fecha y hora de la primera clase.' };
  const desde = new Date(desdeTexto);
  if (Number.isNaN(desde.getTime())) return { error: 'Esa fecha no es válida.' };
  if (!Number.isInteger(semanas) || semanas < 1 || semanas > 52) {
    return { error: 'Las semanas deben estar entre 1 y 52.' };
  }

  await generarClasesSemanales({
    titulo,
    desde,
    semanas,
    duracionMinutos: Number.isFinite(duracion) && duracion > 0 ? duracion : 90,
    meetUrl: meetUrl || null,
  });
  revalidatePath('/portal/admin');
  revalidatePath('/portal/agenda');
  revalidatePath('/portal/clases');
  return {};
}

export async function guardarSesionAdmin(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Falta la sesión.' };

  const scheduledAt = String(formData.get('scheduledAt') ?? '').trim();
  const recordingUrl = String(formData.get('recordingUrl') ?? '').trim();
  if (recordingUrl && !tieneVideo(recordingUrl)) {
    return { error: 'Esa URL de grabación no se reconoce. Pega el enlace de Cloudinary.' };
  }

  const duracion = Number(formData.get('durationMinutes') ?? 60);

  await actualizarSesion(id, {
    title: String(formData.get('title') ?? '').trim() || null,
    // datetime-local entrega hora local sin zona; se pasa a ISO para que la
    // base guarde siempre UTC y el calendario no se desplace.
    scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    duration_minutes: Number.isFinite(duracion) && duracion > 0 ? duracion : 60,
    meet_url: String(formData.get('meetUrl') ?? '').trim() || null,
    status: String(formData.get('status') ?? 'pendiente') as OneOnOneSession['status'],
    admin_notes: String(formData.get('adminNotes') ?? '').trim() || null,
    recording_url: recordingUrl || null,
  });

  revalidatePath('/portal/admin');
  revalidatePath('/portal/perfil');
  return {};
}

export async function borrarSesionAdmin(id: string) {
  await requireAdmin();
  await borrarSesion(id);
  revalidatePath('/portal/admin');
  revalidatePath('/portal/perfil');
  return {};
}
