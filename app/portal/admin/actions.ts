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
  programarSesiones,
  renumerarSesiones,
  generarClasesSemanales,
  actualizarSesion,
  borrarSesion,
} from '@/lib/portal-data';
import { aCentavos } from '@/lib/planes';
import {
  type Franja,
  fechaDesdeInput,
  fechaHoraDesdeInput,
  fechasDelPatron,
  franjaValida,
  claveFranja,
} from '@/lib/agenda';
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

/**
 * El video de bienvenida, la puerta por la que pasa todo estudiante nuevo.
 * Vaciarlo abre la puerta de par en par: sin enlace no hay nada que ver, y la
 * página deja pasar en vez de encerrar a nadie.
 */
export async function updateOnboardingVideo(url: string) {
  await requireAdmin();
  const limpia = url.trim();
  if (limpia && !tieneVideo(limpia)) {
    return { error: 'Esa URL no se reconoce. Pega el enlace de Bunny (el embed o el .m3u8) o el de Cloudinary.' };
  }
  await setPortalConfig('onboarding_video_url', limpia);
  revalidatePath('/portal/admin');
  revalidatePath('/portal/onboarding');
  return {};
}

/**
 * El día en que se abren los videos de los módulos y del aliado. Vacío = ya
 * están abiertos. Es una fecha y no un interruptor para que se abra sola el
 * día que toca, sin que Juan tenga que acordarse de venir a pulsar nada.
 */
export async function updateVideosDesde(dia: string) {
  await requireAdmin();
  const limpia = dia.trim();
  if (limpia && !/^\d{4}-\d{2}-\d{2}$/.test(limpia)) {
    return { error: 'Elige una fecha válida.' };
  }
  await setPortalConfig('videos_desde', limpia);
  revalidatePath('/portal/admin');
  revalidatePath('/portal/modulos', 'layout');
  revalidatePath('/portal/mentores');
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
    return { error: 'Esa URL de video no se reconoce. Pega el enlace de Bunny (el embed o el .m3u8) o el de Cloudinary.' };
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
    // datetime-local no lleva zona, así que se lee como hora de Bogotá y no
    // como hora del proceso, que en Vercel es UTC.
    scheduledAt: fechaHoraDesdeInput(scheduledAt)?.toISOString() ?? null,
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
    return { error: 'Esa URL de grabación no se reconoce. Pega el enlace de Bunny o el de Cloudinary.' };
  }

  await crearClase({
    title,
    description: description || null,
    scheduledAt: fechaHoraDesdeInput(scheduledAt)?.toISOString() ?? null,
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
    return { error: 'Esa URL de video no se reconoce. Pega el enlace de Bunny o el de Cloudinary.' };
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
    return { error: 'Esa URL no se reconoce. Pega el enlace de Bunny (el embed o el .m3u8) o el de Cloudinary.' };
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

/** Tope de sesiones por tanda: 7 franjas × 52 semanas ya es absurdo. */
const MAX_SESIONES = 200;

/**
 * Agenda las 1:1 de un estudiante desde el patrón semanal: N franjas
 * (día + hora) que se repiten durante las semanas que dure el plan.
 */
export async function programarSesionesAdmin(formData: FormData) {
  await requireAdmin();
  const studentId = String(formData.get('studentId') ?? '');
  if (!studentId) return { error: 'Elige primero al estudiante.' };

  const desde = fechaDesdeInput(String(formData.get('desde') ?? ''));
  if (!desde) return { error: 'Elige la fecha desde la que arranca el patrón.' };

  const semanas = Number(formData.get('semanas') ?? 0);
  if (!Number.isInteger(semanas) || semanas < 1 || semanas > 52) {
    return { error: 'Las semanas deben estar entre 1 y 52.' };
  }

  const duracion = Number(formData.get('duracion') ?? 90);
  const duracionMinutos = Number.isFinite(duracion) && duracion > 0 ? duracion : 90;

  const dias = formData.getAll('dia').map((v) => Number(v));
  const horas = formData.getAll('hora').map((v) => String(v).trim());
  const franjas: Franja[] = dias
    .map((dia, i) => ({ dia, hora: horas[i] ?? '' }))
    .filter((f) => f.hora !== '');

  if (franjas.length === 0) return { error: 'Añade al menos un día y una hora.' };
  if (franjas.some((f) => !franjaValida(f))) {
    return { error: 'Alguno de los horarios no es válido. Revisa el día y la hora.' };
  }

  // Dos franjas iguales crearían dos sesiones encimadas a la misma hora.
  const claves = new Set(franjas.map(claveFranja));
  if (claves.size !== franjas.length) {
    return { error: 'Hay dos horarios repetidos el mismo día. Cambia uno de los dos.' };
  }
  if (franjas.length * semanas > MAX_SESIONES) {
    return { error: `Eso son más de ${MAX_SESIONES} sesiones. Baja las semanas o los horarios.` };
  }

  const fechas = fechasDelPatron(desde, franjas, semanas);
  const r = await programarSesiones({
    studentId,
    fechas,
    duracionMinutos,
    reemplazarFuturas: formData.get('reemplazar') === 'on',
  });

  if (r.creadas === 0) {
    return {
      error: r.borradas > 0
        ? 'Se borraron las futuras pero el patrón nuevo no creó ninguna: revisa que las fechas sean posteriores a hoy.'
        : 'No se creó ninguna sesión: esas fechas ya estaban agendadas o ya pasaron.',
    };
  }

  revalidatePath('/portal/admin');
  revalidatePath('/portal/agenda');
  revalidatePath('/portal/perfil');
  return { ok: `${r.creadas} sesiones agendadas${r.borradas > 0 ? `, ${r.borradas} reemplazadas` : ''}.` };
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
  const desde = fechaHoraDesdeInput(desdeTexto);
  if (!desde) return { error: 'Esa fecha no es válida.' };
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
    return { error: 'Esa URL de grabación no se reconoce. Pega el enlace de Bunny o el de Cloudinary.' };
  }

  const duracion = Number(formData.get('durationMinutes') ?? 60);

  const studentId = await actualizarSesion(id, {
    title: String(formData.get('title') ?? '').trim() || null,
    // datetime-local no lleva zona: se lee como hora de Bogotá.
    scheduled_at: fechaHoraDesdeInput(scheduledAt)?.toISOString() ?? null,
    duration_minutes: Number.isFinite(duracion) && duracion > 0 ? duracion : 60,
    meet_url: String(formData.get('meetUrl') ?? '').trim() || null,
    status: String(formData.get('status') ?? 'pendiente') as OneOnOneSession['status'],
    admin_notes: String(formData.get('adminNotes') ?? '').trim() || null,
    recording_url: recordingUrl || null,
  });

  // Cambiar la fecha a mano puede cruzar dos sesiones de orden.
  if (studentId) await renumerarSesiones(studentId);

  revalidatePath('/portal/admin');
  revalidatePath('/portal/agenda');
  revalidatePath('/portal/perfil');
  return {};
}

export async function borrarSesionAdmin(id: string) {
  await requireAdmin();
  const studentId = await borrarSesion(id);
  if (studentId) await renumerarSesiones(studentId);
  revalidatePath('/portal/admin');
  revalidatePath('/portal/agenda');
  revalidatePath('/portal/perfil');
  return {};
}
