'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { claveLocal } from '@/lib/agenda';

export async function checkinToday(workedToday: boolean) {
  const session = await getSession();
  if (!session) return { error: 'Sesión expirada.' };

  // El día es el de Bogotá, no el del servidor. toISOString() da la fecha en
  // UTC, y de 7 pm a medianoche en Colombia eso ya es el día siguiente: el
  // check-in de la noche del lunes se guardaba como martes, y la racha se
  // rompía sola.
  const today = claveLocal(new Date());
  await supabaseAdmin()
    .from('student_checkins')
    .upsert({ student_id: session.sid, date: today, worked_today: workedToday }, { onConflict: 'student_id,date' });

  revalidatePath('/portal/mi-progreso');
  return {};
}

export async function savePersonalNotes(notes: string) {
  const session = await getSession();
  if (!session) return { error: 'Sesión expirada.' };

  await supabaseAdmin().from('students').update({ personal_notes: notes }).eq('id', session.sid);
  return {};
}
