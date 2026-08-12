import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Json } from '@/lib/database.types';
import type {
  ActivityLogRow,
  Mentor,
  ModuleResource,
  ModuleRow,
  Student,
  StudentCheckin,
  StudentIntake,
  StudentProgress,
  TestAttemptRow,
  StudentQuestion,
  MeetingRequest,
  GroupSession,
  SessionPoll,
  SessionPollVote,
  OpcionEncuesta,
  OneOnOneSession,
} from '@/lib/types';

// Capa de acceso a datos. Todo corre en el servidor con la service_role key
// (ver lib/supabase/admin.ts) — las páginas y server actions del portal
// llaman a estas funciones en vez de tocar Supabase directamente.
//
// Los `as unknown as X` de abajo castean del Row generado por Supabase
// (columnas jsonb tipadas como `Json`, columnas de texto libres como
// `role`/`action`/`file_type`) a los tipos de dominio más específicos de
// lib/types.ts (TheoryBlock[], StudentRole, etc.). El esquema real
// garantiza esos valores — ver supabase/schema.sql (checks) y seed.sql.

export async function getStudentById(id: string): Promise<Student | null> {
  const { data } = await supabaseAdmin().from('students').select('*').eq('id', id).maybeSingle();
  return (data as unknown as Student) ?? null;
}

export async function getStudentByEmail(email: string): Promise<Student | null> {
  const { data } = await supabaseAdmin()
    .from('students')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  return (data as unknown as Student) ?? null;
}

export async function getModules(): Promise<ModuleRow[]> {
  const { data } = await supabaseAdmin().from('modules').select('*').order('order_index', { ascending: true });
  return (data as unknown as ModuleRow[]) ?? [];
}

export async function getModuleBySlug(slug: string): Promise<ModuleRow | null> {
  const { data } = await supabaseAdmin().from('modules').select('*').eq('slug', slug).maybeSingle();
  return (data as unknown as ModuleRow) ?? null;
}

export async function getModuleResources(moduleId: string): Promise<ModuleResource[]> {
  const { data } = await supabaseAdmin()
    .from('module_resources')
    .select('*')
    .eq('module_id', moduleId)
    .order('created_at', { ascending: true });
  return (data as unknown as ModuleResource[]) ?? [];
}

export async function getStudentProgress(studentId: string): Promise<StudentProgress[]> {
  const { data } = await supabaseAdmin().from('student_progress').select('*').eq('student_id', studentId);
  return (data as unknown as StudentProgress[]) ?? [];
}

export async function getProgressForModule(studentId: string, moduleId: string): Promise<StudentProgress | null> {
  const { data } = await supabaseAdmin()
    .from('student_progress')
    .select('*')
    .eq('student_id', studentId)
    .eq('module_id', moduleId)
    .maybeSingle();
  return (data as unknown as StudentProgress) ?? null;
}

export function computeProgressStats(
  modules: ModuleRow[],
  progress: StudentProgress[],
  passedModuleIds?: Set<string>
) {
  const byModule = new Map(progress.map((p) => [p.module_id, p]));
  const totalModules = modules.length;
  const completedModules = modules.filter((m) => byModule.get(m.id)?.module_completed).length;
  const videosWatched = modules.filter((m) => byModule.get(m.id)?.video_watched).length;
  const percent = totalModules === 0 ? 0 : Math.round((completedModules / totalModules) * 100);

  const currentModule = passedModuleIds
    ? modules.find(
        (m, i) => !byModule.get(m.id)?.module_completed && isModuleUnlocked(modules, i, passedModuleIds)
      ) ?? modules[modules.length - 1]
    : modules.find((m) => !byModule.get(m.id)?.module_completed && !m.is_locked) ?? modules[modules.length - 1];

  return { totalModules, completedModules, videosWatched, percent, currentModule, byModule };
}

export async function getMentors(): Promise<Mentor[]> {
  const { data } = await supabaseAdmin().from('mentors').select('*').order('order_index', { ascending: true });
  return (data as unknown as Mentor[]) ?? [];
}

export async function getStudentIntake(studentId: string): Promise<StudentIntake | null> {
  const { data } = await supabaseAdmin()
    .from('student_intake')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle();
  return (data as unknown as StudentIntake) ?? null;
}

export async function getPortalConfig(key: string): Promise<string | null> {
  const { data } = await supabaseAdmin().from('portal_config').select('value').eq('key', key).maybeSingle();
  return data?.value ?? null;
}

export async function setPortalConfig(key: string, value: string) {
  await supabaseAdmin().from('portal_config').upsert({ key, value, updated_at: new Date().toISOString() });
}

export async function logActivity(
  studentId: string,
  action: ActivityLogRow['action'],
  metadata?: Record<string, unknown>
) {
  await supabaseAdmin()
    .from('activity_log')
    .insert({ student_id: studentId, action, metadata: (metadata ?? null) as unknown as Json });
}

export async function getCheckins(studentId: string, days = 30): Promise<StudentCheckin[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabaseAdmin()
    .from('student_checkins')
    .select('*')
    .eq('student_id', studentId)
    .gte('date', since.toISOString().slice(0, 10))
    .order('date', { ascending: true });
  return (data as unknown as StudentCheckin[]) ?? [];
}

export function computeStreak(checkins: StudentCheckin[]): number {
  if (checkins.length === 0) return 0;
  const dates = new Set(checkins.filter((c) => c.worked_today).map((c) => c.date));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (dates.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ---------- Tests por módulo ----------
// Desbloqueo secuencial: el módulo en `modules[i]` solo está disponible si
// (a) el admin no lo bloqueó manualmente (is_locked) y (b) es el primer
// módulo, o el estudiante ya aprobó el test del módulo anterior. Esto es
// ADITIVO al `is_locked` que ya existía — is_locked sigue siendo un
// override manual del admin ("todavía no publico este módulo"), y ahora
// además hay una segunda condición automática basada en tests.

export async function getTestAttempts(studentId: string): Promise<TestAttemptRow[]> {
  const { data } = await supabaseAdmin()
    .from('test_attempts')
    .select('*')
    .eq('student_id', studentId)
    .order('completed_at', { ascending: false });
  return (data as unknown as TestAttemptRow[]) ?? [];
}

export async function getAttemptsForModule(studentId: string, moduleId: string): Promise<TestAttemptRow[]> {
  const { data } = await supabaseAdmin()
    .from('test_attempts')
    .select('*')
    .eq('student_id', studentId)
    .eq('module_id', moduleId)
    .order('attempt_number', { ascending: false });
  return (data as unknown as TestAttemptRow[]) ?? [];
}

export function getPassedModuleIds(attempts: TestAttemptRow[]): Set<string> {
  return new Set(attempts.filter((a) => a.passed).map((a) => a.module_id));
}

/**
 * true si el módulo en `modules[index]` está efectivamente disponible.
 * El admin (isAdmin=true) ve absolutamente todo desbloqueado, incluso
 * módulos marcados is_locked manualmente — necesita poder revisar
 * cualquier módulo sin depender del progreso de ningún estudiante.
 */
export function isModuleUnlocked(
  modules: ModuleRow[],
  index: number,
  passedModuleIds: Set<string>,
  isAdmin = false
): boolean {
  if (isAdmin) return true;
  const mod = modules[index];
  if (!mod) return false;
  if (mod.is_locked) return false;
  if (index === 0) return true;
  const prev = modules[index - 1];
  return prev ? passedModuleIds.has(prev.id) : true;
}

export async function insertTestAttempt(input: {
  studentId: string;
  moduleId: string;
  score: number;
  totalQuestions: number;
  answers: unknown[];
  passed: boolean;
  durationSeconds?: number;
}): Promise<void> {
  const previous = await getAttemptsForModule(input.studentId, input.moduleId);
  const attemptNumber = (previous[0]?.attempt_number ?? 0) + 1;

  await supabaseAdmin()
    .from('test_attempts')
    .insert({
      student_id: input.studentId,
      module_id: input.moduleId,
      score: input.score,
      total_questions: input.totalQuestions,
      answers: input.answers as unknown as Json,
      passed: input.passed,
      attempt_number: attemptNumber,
      duration_seconds: input.durationSeconds ?? null,
    });
}

export async function getAllTestAttempts(): Promise<TestAttemptRow[]> {
  const { data } = await supabaseAdmin().from('test_attempts').select('*').order('completed_at', { ascending: false });
  return (data as unknown as TestAttemptRow[]) ?? [];
}

// ---------- Admin ----------

export async function getAllStudents(): Promise<Student[]> {
  const { data } = await supabaseAdmin()
    .from('students')
    .select('*')
    .eq('role', 'student')
    .order('invited_at', { ascending: false });
  return (data as unknown as Student[]) ?? [];
}

export async function getAdminSummary() {
  const [students, modules, progress] = await Promise.all([getAllStudents(), getModules(), getAllProgress()]);

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const newThisWeek = students.filter((s) => new Date(s.invited_at).getTime() >= weekAgo).length;
  const inactive7d = students.filter((s) => {
    if (!s.last_login_at) return new Date(s.invited_at).getTime() < weekAgo;
    return new Date(s.last_login_at).getTime() < weekAgo;
  }).length;

  const progressByStudent = new Map<string, number>();
  for (const s of students) {
    const own = progress.filter((p) => p.student_id === s.id);
    const stats = computeProgressStats(modules, own);
    progressByStudent.set(s.id, stats.percent);
  }

  const moduleViews = new Map<string, number>();
  for (const p of progress) {
    if (p.video_watched) moduleViews.set(p.module_id, (moduleViews.get(p.module_id) ?? 0) + 1);
  }
  let mostViewedModule: ModuleRow | null = null;
  let maxViews = -1;
  for (const m of modules) {
    const v = moduleViews.get(m.id) ?? 0;
    if (v > maxViews) {
      maxViews = v;
      mostViewedModule = m;
    }
  }

  const topStudents = [...students]
    .sort((a, b) => (progressByStudent.get(b.id) ?? 0) - (progressByStudent.get(a.id) ?? 0))
    .slice(0, 5);

  return {
    totalStudents: students.length,
    newThisWeek,
    inactive7d,
    mostViewedModule,
    topStudents,
    progressByStudent,
  };
}

export async function getAllProgress(): Promise<StudentProgress[]> {
  const { data } = await supabaseAdmin().from('student_progress').select('*');
  return (data as unknown as StudentProgress[]) ?? [];
}

export async function getStudentActivity(studentId: string, limit = 30): Promise<ActivityLogRow[]> {
  const { data } = await supabaseAdmin()
    .from('activity_log')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as unknown as ActivityLogRow[]) ?? [];
}

// ============================================================
// Panel de ayuda, reuniones y clases grupales
// ============================================================

export async function crearPregunta(input: {
  studentId: string;
  question: string;
  moduleSlug?: string | null;
}): Promise<void> {
  await supabaseAdmin().from('student_questions').insert({
    student_id: input.studentId,
    question: input.question,
    module_slug: input.moduleSlug ?? null,
  });
}

export async function getPreguntasDeEstudiante(studentId: string): Promise<StudentQuestion[]> {
  const { data } = await supabaseAdmin()
    .from('student_questions')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  return (data as unknown as StudentQuestion[]) ?? [];
}

/** Para el admin: todas las preguntas, con el nombre del estudiante resuelto. */
export async function getPreguntasConEstudiante(): Promise<(StudentQuestion & { student: Student | null })[]> {
  const [preguntas, estudiantes] = await Promise.all([
    supabaseAdmin().from('student_questions').select('*').order('created_at', { ascending: false }),
    getAllStudents(),
  ]);
  const porId = new Map(estudiantes.map((s) => [s.id, s]));
  return ((preguntas.data as unknown as StudentQuestion[]) ?? []).map((p) => ({
    ...p,
    student: porId.get(p.student_id) ?? null,
  }));
}

export async function responderPregunta(input: {
  id: string;
  reply: string | null;
  videoUrl: string | null;
}): Promise<void> {
  // El estado sale de lo que Juan haya rellenado: si adjuntó video es una
  // respuesta grabada, si solo escribió es una recomendación de texto.
  const status = input.videoUrl ? 'en_video' : input.reply ? 'respondida' : 'nueva';
  await supabaseAdmin()
    .from('student_questions')
    .update({
      admin_reply: input.reply,
      reply_video_url: input.videoUrl,
      status,
      replied_at: input.reply || input.videoUrl ? new Date().toISOString() : null,
    })
    .eq('id', input.id);
}

export async function cerrarPregunta(id: string): Promise<void> {
  await supabaseAdmin().from('student_questions').update({ status: 'cerrada' }).eq('id', id);
}

// ---------- Reuniones 1:1 ----------

export async function crearSolicitudReunion(input: {
  studentId: string;
  question: string;
  availability: string | null;
}): Promise<void> {
  await supabaseAdmin().from('meeting_requests').insert({
    student_id: input.studentId,
    question: input.question,
    availability: input.availability,
  });
}

export async function getReunionesDeEstudiante(studentId: string): Promise<MeetingRequest[]> {
  const { data } = await supabaseAdmin()
    .from('meeting_requests')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  return (data as unknown as MeetingRequest[]) ?? [];
}

export async function getReunionesConEstudiante(): Promise<(MeetingRequest & { student: Student | null })[]> {
  const [reuniones, estudiantes] = await Promise.all([
    supabaseAdmin().from('meeting_requests').select('*').order('created_at', { ascending: false }),
    getAllStudents(),
  ]);
  const porId = new Map(estudiantes.map((s) => [s.id, s]));
  return ((reuniones.data as unknown as MeetingRequest[]) ?? []).map((r) => ({
    ...r,
    student: porId.get(r.student_id) ?? null,
  }));
}

export async function actualizarReunion(input: {
  id: string;
  status: MeetingRequest['status'];
  adminNote: string | null;
  scheduledAt: string | null;
}): Promise<void> {
  await supabaseAdmin()
    .from('meeting_requests')
    .update({ status: input.status, admin_note: input.adminNote, scheduled_at: input.scheduledAt })
    .eq('id', input.id);
}

// ---------- Clase grupal semanal ----------

export async function getClases(soloPublicadas = false): Promise<GroupSession[]> {
  let q = supabaseAdmin().from('group_sessions').select('*');
  if (soloPublicadas) q = q.eq('is_published', true);
  const { data } = await q.order('scheduled_at', { ascending: false, nullsFirst: false });
  return (data as unknown as GroupSession[]) ?? [];
}

export async function crearClase(input: {
  title: string;
  description: string | null;
  scheduledAt: string | null;
  meetUrl: string | null;
  recordingUrl: string | null;
  durationMinutes: number;
}): Promise<void> {
  await supabaseAdmin().from('group_sessions').insert({
    title: input.title,
    description: input.description,
    scheduled_at: input.scheduledAt,
    meet_url: input.meetUrl,
    recording_url: input.recordingUrl,
    duration_minutes: input.durationMinutes,
  });
}

export async function actualizarClase(id: string, cambios: Partial<GroupSession>): Promise<void> {
  await supabaseAdmin().from('group_sessions').update(cambios).eq('id', id);
}

export async function borrarClase(id: string): Promise<void> {
  await supabaseAdmin().from('group_sessions').delete().eq('id', id);
}

// ---------- Encuesta del día de clase ----------

export async function getEncuestaAbierta(): Promise<SessionPoll | null> {
  const { data } = await supabaseAdmin()
    .from('session_polls')
    .select('*')
    .eq('is_open', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as unknown as SessionPoll) ?? null;
}

export async function getVotos(pollId: string): Promise<SessionPollVote[]> {
  const { data } = await supabaseAdmin().from('session_poll_votes').select('*').eq('poll_id', pollId);
  return (data as unknown as SessionPollVote[]) ?? [];
}

export async function votar(pollId: string, studentId: string, optionId: string): Promise<void> {
  // Un voto por estudiante: si ya votó, cambiar de opinión reemplaza el voto
  // en vez de sumar otro (de ahí el unique(poll_id, student_id) del esquema).
  await supabaseAdmin()
    .from('session_poll_votes')
    .upsert(
      { poll_id: pollId, student_id: studentId, option_id: optionId },
      { onConflict: 'poll_id,student_id' }
    );
}

export async function crearEncuesta(question: string, opciones: OpcionEncuesta[]): Promise<void> {
  const admin = supabaseAdmin();
  // Solo una encuesta abierta a la vez: si no, el estudiante no sabe cuál
  // contesta y los votos quedan repartidos entre dos.
  await admin.from('session_polls').update({ is_open: false }).eq('is_open', true);
  await admin.from('session_polls').insert({ question, options: opciones as unknown as Json });
}

export async function cerrarEncuesta(id: string): Promise<void> {
  await supabaseAdmin().from('session_polls').update({ is_open: false }).eq('id', id);
}

// ============================================================
// Cronograma de sesiones 1:1
// ============================================================

export async function getSesionesDeEstudiante(studentId: string): Promise<OneOnOneSession[]> {
  const { data } = await supabaseAdmin()
    .from('one_on_one_sessions')
    .select('*')
    .eq('student_id', studentId)
    .order('session_number', { ascending: true });
  return (data as unknown as OneOnOneSession[]) ?? [];
}

/** Todas las 1:1 del programa. Para la agenda de Juan, que filtra por estudiante. */
export async function getTodasLasSesiones(): Promise<OneOnOneSession[]> {
  const { data } = await supabaseAdmin()
    .from('one_on_one_sessions')
    .select('*')
    .order('scheduled_at', { ascending: true });
  return (data as unknown as OneOnOneSession[]) ?? [];
}

/** Agenda de Juan: las próximas sesiones de todos, con el estudiante resuelto. */
export async function getProximasSesiones(limite = 20): Promise<(OneOnOneSession & { student: Student | null })[]> {
  const [sesiones, estudiantes] = await Promise.all([
    supabaseAdmin()
      .from('one_on_one_sessions')
      .select('*')
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
      .in('status', ['pendiente', 'agendada'])
      .order('scheduled_at', { ascending: true })
      .limit(limite),
    getAllStudents(),
  ]);
  const porId = new Map(estudiantes.map((s) => [s.id, s]));
  return ((sesiones.data as unknown as OneOnOneSession[]) ?? []).map((s) => ({
    ...s,
    student: porId.get(s.student_id) ?? null,
  }));
}

/**
 * Agenda las 1:1 de un estudiante a partir de una lista de fechas ya calculada.
 *
 * Dos reglas que importan:
 *
 * - Lo que ya pasó no se toca nunca. Las fechas anteriores a ahora se
 *   descartan y las sesiones marcadas como hechas sobreviven a cualquier
 *   reprogramación: son el historial del acompañamiento.
 * - `reemplazarFuturas` es lo que permite cambiar de horario a mitad del
 *   plan. Sin él, agendar otra vez solo AÑADE lo que falte, que es lo que se
 *   quiere al ampliar; con él, las futuras pendientes se borran y el patrón
 *   nuevo manda.
 *
 * Las nuevas entran con números por encima del último ocupado y después se
 * renumera todo en la base. La renumeración no es cosmética: sin ella, una
 * sesión futura marcada como hecha (que sobrevive al reemplazo) se queda con
 * un número menor que sesiones anteriores a ella, y el estudiante ve una
 * "nº 3" después de la "nº 4". Probado.
 */
export async function programarSesiones(input: {
  studentId: string;
  fechas: Date[];
  duracionMinutos: number;
  reemplazarFuturas: boolean;
}): Promise<{ creadas: number; borradas: number; total: number }> {
  const ahora = Date.now();
  let borradas = 0;

  if (input.reemplazarFuturas) {
    const { data } = await supabaseAdmin()
      .from('one_on_one_sessions')
      .delete()
      .eq('student_id', input.studentId)
      .neq('status', 'hecha')
      .gte('scheduled_at', new Date(ahora).toISOString())
      .select('id');
    borradas = data?.length ?? 0;
  }

  const existentes = await getSesionesDeEstudiante(input.studentId);
  const ocupados = new Set(
    existentes.map((s) => (s.scheduled_at ? new Date(s.scheduled_at).getTime() : 0))
  );
  const ultimoNumero = existentes.reduce((max, s) => Math.max(max, s.session_number), 0);

  const nuevas = input.fechas
    .filter((f) => f.getTime() > ahora && !ocupados.has(f.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (nuevas.length > 0) {
    await supabaseAdmin()
      .from('one_on_one_sessions')
      .insert(
        nuevas.map((fecha, i) => ({
          student_id: input.studentId,
          session_number: ultimoNumero + i + 1,
          scheduled_at: fecha.toISOString(),
          duration_minutes: input.duracionMinutos,
          status: 'agendada',
        }))
      );
  }

  const total = existentes.length + nuevas.length;
  await Promise.all([
    renumerarSesiones(input.studentId),
    // El perfil muestra "hechas / total", así que el total tiene que seguir a
    // lo que de verdad hay agendado y no al valor por defecto del plan.
    supabaseAdmin().from('students').update({ sessions_total: total }).eq('id', input.studentId),
  ]);

  return { creadas: nuevas.length, borradas, total };
}

/**
 * Deja los session_number de un estudiante en orden de fecha.
 *
 * Va por función de Postgres porque renumerar desde aquí sería un update por
 * fila y, en cuanto dos sesiones se cruzan, el unique de (student_id,
 * session_number) rechaza el paso intermedio. La función aplaza esa
 * restricción y lo hace todo en una sentencia.
 */
export async function renumerarSesiones(studentId: string): Promise<void> {
  await supabaseAdmin().rpc('renumerar_sesiones', { p_student: studentId });
}

/** Crea N clases grupales semanales desde una fecha. */
export async function generarClasesSemanales(input: {
  titulo: string;
  desde: Date;
  semanas: number;
  duracionMinutos: number;
  meetUrl: string | null;
}): Promise<void> {
  const filas = Array.from({ length: input.semanas }, (_, i) => {
    const f = new Date(input.desde);
    f.setDate(f.getDate() + i * 7);
    return {
      title: `${input.titulo} ${i + 1}`,
      scheduled_at: f.toISOString(),
      duration_minutes: input.duracionMinutos,
      meet_url: input.meetUrl,
    };
  });
  if (filas.length > 0) await supabaseAdmin().from('group_sessions').insert(filas);
}

/** Devuelve el estudiante de la sesión, que hace falta para renumerar. */
export async function actualizarSesion(
  id: string,
  cambios: Partial<OneOnOneSession>
): Promise<string | null> {
  const { data } = await supabaseAdmin()
    .from('one_on_one_sessions')
    .update(cambios)
    .eq('id', id)
    .select('student_id')
    .maybeSingle();
  return (data as { student_id: string } | null)?.student_id ?? null;
}

export async function borrarSesion(id: string): Promise<string | null> {
  const { data } = await supabaseAdmin()
    .from('one_on_one_sessions')
    .delete()
    .eq('id', id)
    .select('student_id')
    .maybeSingle();
  return (data as { student_id: string } | null)?.student_id ?? null;
}

/** El estudiante solo puede tocar su propio tema, y solo de su sesión. */
export async function guardarTemaSesion(sessionId: string, studentId: string, tema: string): Promise<boolean> {
  const { data } = await supabaseAdmin()
    .from('one_on_one_sessions')
    .update({ student_topic: tema || null })
    .eq('id', sessionId)
    .eq('student_id', studentId)
    .select('id');
  return (data?.length ?? 0) > 0;
}

export async function actualizarPlanYPagos(
  studentId: string,
  cambios: {
    plan: string | null;
    planStartedAt: string | null;
    sessionsTotal: number | null;
    amountTotalCents: number;
    amountPaidCents: number;
    currency: string;
    paymentNotes: string | null;
  }
): Promise<void> {
  await supabaseAdmin()
    .from('students')
    .update({
      plan: cambios.plan,
      plan_started_at: cambios.planStartedAt,
      sessions_total: cambios.sessionsTotal,
      amount_total_cents: cambios.amountTotalCents,
      amount_paid_cents: cambios.amountPaidCents,
      currency: cambios.currency,
      payment_notes: cambios.paymentNotes,
    })
    .eq('id', studentId);
}
