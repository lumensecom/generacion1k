'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function checkinToday(workedToday: boolean) {
  const session = await getSession();
  if (!session) return { error: 'Sesión expirada.' };

  const today = new Date().toISOString().slice(0, 10);
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
