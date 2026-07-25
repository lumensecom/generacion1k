'use server';

import { redirect } from 'next/navigation';
import { getSession, setSessionCookie } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/portal-data';

export interface IntakeAnswers {
  name: string;
  age: string;
  city: string;
  occupation: string;
  economic_situation: string;
  income_goal: string;
  daily_hours: string;
  investment_capital: string;
  biggest_fear: string;
  why_chose_program: string;
}

export async function submitIntake(answers: IntakeAnswers): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) redirect('/portal');

  const admin = supabaseAdmin();

  const { error: studentError } = await admin
    .from('students')
    .update({
      full_name: answers.name.trim() || session.name,
      age: answers.age ? Number(answers.age) : null,
      city: answers.city.trim() || null,
    })
    .eq('id', session.sid);

  if (studentError) return { error: 'No pudimos guardar tus datos. Intenta de nuevo.' };

  const { error: intakeError } = await admin.from('student_intake').upsert(
    {
      student_id: session.sid,
      occupation: answers.occupation,
      economic_situation: answers.economic_situation,
      income_goal: answers.income_goal,
      daily_hours: answers.daily_hours,
      investment_capital: answers.investment_capital,
      biggest_fear: answers.biggest_fear,
      why_chose_program: answers.why_chose_program,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'student_id' }
  );

  if (intakeError) return { error: 'No pudimos guardar el cuestionario. Intenta de nuevo.' };

  await logActivity(session.sid, 'intake_completed');
  const { exp: _exp, ...rest } = session;
  await setSessionCookie({ ...rest, intakeDone: true });

  redirect('/portal/inicio');
}
