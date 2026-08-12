'use server';

import { redirect } from 'next/navigation';
import { timingSafeEqual } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { setSessionCookie, clearSessionCookie, getSession } from '@/lib/session';
import { getStudentByEmail, getStudentIntake, logActivity, getPortalConfig } from '@/lib/portal-data';
import { verifyPassword } from '@/lib/password';

export interface ActionResult {
  error?: string;
}

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

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

  if (ADMIN_EMAIL && email === ADMIN_EMAIL) {
    return { error: 'Ese correo es de administrador. Usa la pestaña "Soy admin" para entrar.' };
  }

  const [isActive, accessCode] = await Promise.all([getPortalConfig('is_active'), getPortalConfig('access_code')]);

  if (isActive !== 'true') {
    return { error: 'El acceso a esta generación está cerrado por ahora. Escríbele a Juan.' };
  }
  if (!accessCode || code !== accessCode) {
    return { error: 'Clave de acceso incorrecta. Revísala con Juan.' };
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
    .insert({ email, full_name: fullName, role: 'student', first_login_at: nowIso, last_login_at: nowIso })
    .select('id')
    .single();

  if (error || !created) {
    return { error: 'No pudimos crear tu perfil. Intenta de nuevo o escríbele a Juan.' };
  }

  await afterLogin(created.id, email, fullName, 'student');
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
  if (student.role === 'admin') {
    return { error: 'Esa cuenta es de administrador. Usa la pestaña "Soy admin" para entrar.' };
  }

  const admin = supabaseAdmin();
  await admin.from('students').update({ last_login_at: new Date().toISOString() }).eq('id', student.id);
  await afterLogin(student.id, student.email, student.full_name, 'student');
  return {};
}

/** Login del admin: correo fijo (ADMIN_EMAIL) + contraseña (ADMIN_PASSWORD). */
export async function submitAdminLogin(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return { error: 'El login de admin no está configurado. Falta ADMIN_EMAIL o ADMIN_PASSWORD en el servidor.' };
  }
  if (!email || !password) {
    return { error: 'Ingresa correo y contraseña.' };
  }
  if (!safeCompare(email, ADMIN_EMAIL) || !safeCompare(password, ADMIN_PASSWORD)) {
    return { error: 'Correo o contraseña incorrectos.' };
  }

  const admin = supabaseAdmin();
  const existing = await getStudentByEmail(email);
  const nowIso = new Date().toISOString();

  if (existing) {
    if (!existing.is_active) return { error: 'Esta cuenta está desactivada.' };
    await admin
      .from('students')
      .update({ role: 'admin', last_login_at: nowIso })
      .eq('id', existing.id);
    await afterLogin(existing.id, existing.email, existing.full_name, 'admin');
    return {};
  }

  const { data: created, error } = await admin
    .from('students')
    .insert({ email, full_name: 'Admin', role: 'admin', first_login_at: nowIso, last_login_at: nowIso })
    .select('id')
    .single();

  if (error || !created) {
    return { error: 'No pudimos crear la cuenta de admin. Intenta de nuevo.' };
  }

  await afterLogin(created.id, email, 'Admin', 'admin');
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

/**
 * Entrada con correo y contraseña — el camino normal desde que Juan crea
 * las cuentas él mismo desde el panel.
 *
 * El mensaje de error es el mismo para "no existe ese correo" y "la clave
 * está mal": distinguirlos le diría a cualquiera qué correos tienen cuenta.
 */
export async function submitPasswordLogin(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Ese correo no parece válido.' };
  if (!password) return { error: 'Escribe tu contraseña.' };

  const student = await getStudentByEmail(email);
  const ok = await verifyPassword(password, student?.password_hash ?? null);

  if (!student || !ok) return { error: 'Correo o contraseña incorrectos.' };
  if (!student.is_active) return { error: 'Tu cuenta está desactivada. Escríbele a Juan.' };

  await supabaseAdmin()
    .from('students')
    .update({
      last_login_at: new Date().toISOString(),
      first_login_at: student.first_login_at ?? new Date().toISOString(),
    })
    .eq('id', student.id);

  await afterLogin(student.id, student.email, student.full_name, student.role);
  return {};
}
