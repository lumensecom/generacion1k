'use server';

import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { setSessionCookie, clearSessionCookie, getSession } from '@/lib/session';
import { getStudentByEmail, getStudentIntake, logActivity, getPortalConfig } from '@/lib/portal-data';

export interface ActionResult {
  error?: string;
}

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();

async function afterLogin(studentId: string, email: string, fullName: string, role: 'student' | 'admin') {
  const intake = role === 'admin' ? null : await getStudentIntake(studentId);
  await setSessionCookie({ sid: studentId, email, name: fullName, role, intakeDone: Boolean(intake) });
  await logActivity(studentId, 'login');

  if (role === 'admin') redirect('/portal/admin');
  redirect(intake ? '/portal/inicio' : '/portal/bienvenida');
}

/** Primera vez: nombre + email + clave de acceso general. */
export async function submitAccessCode(formData: FormData): Promise<ActionResult> {
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const code = String(formData.get('code') ?? '').trim();

  if (!fullName || fullName.length < 2) return { error: 'Escribe tu nombre completo.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Ese correo no parece válido.' };
  if (!code) return { error: 'Ingresa la clave de acceso.' };

  const isAdmin = ADMIN_EMAIL && email === ADMIN_EMAIL;

  if (!isAdmin) {
    const [isActive, accessCode] = await Promise.all([
      getPortalConfig('is_active'),
      getPortalConfig('access_code'),
    ]);

    if (isActive !== 'true') {
      return { error: 'El acceso a esta generación está cerrado por ahora. Escríbele a Juan.' };
    }
    if (!accessCode || code !== accessCode) {
      return { error: 'Clave de acceso incorrecta. Revísala con Juan.' };
    }
  }

  const admin = supabaseAdmin();
  const existing = await getStudentByEmail(email);

  if (existing) {
    if (!existing.is_active) return { error: 'Tu cuenta está desactivada. Escríbele a Juan.' };
    await admin
      .from('students')
      .update({ full_name: fullName, last_login_at: new Date().toISOString() })
      .eq('id', existing.id);
    await afterLogin(existing.id, email, fullName, existing.role as 'student' | 'admin');
    return {};
  }

  const nowIso = new Date().toISOString();
  const { data: created, error } = await admin
    .from('students')
    .insert({
      email,
      full_name: fullName,
      role: isAdmin ? 'admin' : 'student',
      first_login_at: nowIso,
      last_login_at: nowIso,
    })
    .select('id')
    .single();

  if (error || !created) {
    return { error: 'No pudimos crear tu perfil. Intenta de nuevo o escríbele a Juan.' };
  }

  await afterLogin(created.id, email, fullName, isAdmin ? 'admin' : 'student');
  return {};
}

/** Sesiones futuras: solo el email (ya existe la cuenta). */
export async function submitReturningEmail(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Ese correo no parece válido.' };

  const student = await getStudentByEmail(email);
  if (!student || !student.is_active) {
    return { error: 'No encontramos una cuenta activa con ese correo. Usa la clave de acceso si es tu primera vez.' };
  }

  const admin = supabaseAdmin();
  await admin.from('students').update({ last_login_at: new Date().toISOString() }).eq('id', student.id);
  await afterLogin(student.id, student.email, student.full_name, student.role as 'student' | 'admin');
  return {};
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/portal');
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect('/portal');
  return session;
}
