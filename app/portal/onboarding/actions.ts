'use server';

import { redirect } from 'next/navigation';
import { getSession, setSessionCookie } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/portal-data';

/**
 * Marca el video de bienvenida como visto y abre el resto del portal.
 *
 * La marca se guarda en la base Y en la cookie: en la base para que sobreviva
 * al cierre de sesión, y en la cookie porque quien vigila la puerta es el
 * middleware, que corre en el Edge y no puede consultar Supabase.
 */
export async function marcarVideoVisto(): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) redirect('/portal');

  // Se conserva la primera vez: si vuelve a la página, la fecha no se mueve.
  if (!session.videoDone) {
    const { error } = await supabaseAdmin()
      .from('students')
      .update({ onboarding_video_at: new Date().toISOString() })
      .eq('id', session.sid)
      .is('onboarding_video_at', null);

    if (error) return { error: 'No pudimos guardarlo. Intenta de nuevo.' };
    await logActivity(session.sid, 'onboarding_video_watched');
  }

  const { exp: _exp, ...rest } = session;
  await setSessionCookie({ ...rest, videoDone: true });

  redirect('/portal/inicio');
}
