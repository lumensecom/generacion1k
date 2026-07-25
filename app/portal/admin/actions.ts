'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { setPortalConfig } from '@/lib/portal-data';

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
