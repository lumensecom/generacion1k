'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getModuleBySlug, getProgressForModule, logActivity } from '@/lib/portal-data';

async function ensureProgressRow(studentId: string, moduleId: string) {
  const admin = supabaseAdmin();
  const existing = await getProgressForModule(studentId, moduleId);
  if (existing) return existing;

  const { data } = await admin
    .from('student_progress')
    .insert({ student_id: studentId, module_id: moduleId })
    .select('*')
    .single();
  return data;
}

export async function markVideoWatched(slug: string) {
  const session = await getSession();
  if (!session) return { error: 'Sesión expirada.' };

  const mod = await getModuleBySlug(slug);
  if (!mod) return { error: 'Módulo no encontrado.' };

  await ensureProgressRow(session.sid, mod.id);
  await supabaseAdmin()
    .from('student_progress')
    .update({ video_watched: true, video_watched_at: new Date().toISOString() })
    .eq('student_id', session.sid)
    .eq('module_id', mod.id);

  await logActivity(session.sid, 'video_watched', { module_slug: slug });
  revalidatePath(`/portal/modulos/${slug}`);
  revalidatePath('/portal/inicio');
  revalidatePath('/portal/mi-progreso');
  return {};
}

export async function togglePracticeItem(slug: string, itemIndex: number, checklistLength: number) {
  const session = await getSession();
  if (!session) return { error: 'Sesión expirada.' };

  const mod = await getModuleBySlug(slug);
  if (!mod) return { error: 'Módulo no encontrado.' };

  const progress = await ensureProgressRow(session.sid, mod.id);
  const current = new Set<number>(((progress?.practice_checked_items as unknown as number[]) ?? []));
  if (current.has(itemIndex)) current.delete(itemIndex);
  else current.add(itemIndex);

  const checkedItems = Array.from(current);
  const practiceCompleted = checkedItems.length >= checklistLength && checklistLength > 0;

  await supabaseAdmin()
    .from('student_progress')
    .update({
      practice_checked_items: checkedItems,
      practice_completed: practiceCompleted,
      practice_completed_at: practiceCompleted ? new Date().toISOString() : null,
    })
    .eq('student_id', session.sid)
    .eq('module_id', mod.id);

  if (practiceCompleted) {
    await logActivity(session.sid, 'practice_completed', { module_slug: slug });
  }

  revalidatePath(`/portal/modulos/${slug}`);
  return { checkedItems, practiceCompleted };
}

export async function saveNotes(slug: string, notes: string) {
  const session = await getSession();
  if (!session) return { error: 'Sesión expirada.' };

  const mod = await getModuleBySlug(slug);
  if (!mod) return { error: 'Módulo no encontrado.' };

  await ensureProgressRow(session.sid, mod.id);
  await supabaseAdmin()
    .from('student_progress')
    .update({ student_notes: notes })
    .eq('student_id', session.sid)
    .eq('module_id', mod.id);

  return {};
}

export async function markModuleCompleted(slug: string) {
  const session = await getSession();
  if (!session) return { error: 'Sesión expirada.' };

  const mod = await getModuleBySlug(slug);
  if (!mod) return { error: 'Módulo no encontrado.' };

  await ensureProgressRow(session.sid, mod.id);
  await supabaseAdmin()
    .from('student_progress')
    .update({ module_completed: true, module_completed_at: new Date().toISOString() })
    .eq('student_id', session.sid)
    .eq('module_id', mod.id);

  await logActivity(session.sid, 'module_completed', { module_slug: slug });
  revalidatePath(`/portal/modulos/${slug}`);
  revalidatePath('/portal/modulos');
  revalidatePath('/portal/inicio');
  revalidatePath('/portal/mi-progreso');
  return {};
}
