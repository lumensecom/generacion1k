'use server';

import { revalidatePath } from 'next/cache';
import { getSession, setSessionCookie } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function updateProfile(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session) return { error: 'Sesión expirada.' };

  const fullName = String(formData.get('fullName') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const ageRaw = String(formData.get('age') ?? '').trim();

  if (!fullName || fullName.length < 2) return { error: 'Escribe tu nombre completo.' };

  const { error } = await supabaseAdmin()
    .from('students')
    .update({
      full_name: fullName,
      city: city || null,
      phone: phone || null,
      age: ageRaw ? Number(ageRaw) : null,
    })
    .eq('id', session.sid);

  if (error) return { error: 'No pudimos guardar tus cambios. Intenta de nuevo.' };

  const { exp: _exp, ...rest } = session;
  await setSessionCookie({ ...rest, name: fullName });

  revalidatePath('/portal/perfil');
  return { success: true };
}
