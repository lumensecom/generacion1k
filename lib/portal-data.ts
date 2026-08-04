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
