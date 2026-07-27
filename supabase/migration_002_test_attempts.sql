-- ============================================================
-- Migración 002 — Sistema de tests por módulo
-- Ejecutar en: Supabase Dashboard → proyecto "LMS" → SQL Editor → Run
-- ============================================================
-- Nota: igual que en supabase/schema.sql, no usamos políticas basadas en
-- auth.uid() porque el portal no usa Supabase Auth — todo el acceso pasa
-- por el servidor de Next.js con la service_role key (que ignora RLS).
-- RLS aquí es "default deny" para anon/authenticated, como en el resto.

create table if not exists test_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  module_id uuid not null references modules(id) on delete cascade,
  score integer not null,
  total_questions integer not null default 5,
  answers jsonb not null default '[]'::jsonb,
  passed boolean not null default false,
  attempt_number integer not null default 1,
  duration_seconds integer,
  completed_at timestamptz not null default now()
);

create index if not exists idx_test_attempts_student on test_attempts(student_id);
create index if not exists idx_test_attempts_module on test_attempts(module_id);
create index if not exists idx_test_attempts_student_module on test_attempts(student_id, module_id);

alter table test_attempts enable row level security;

-- Amplía el check de activity_log.action para incluir los nuevos eventos
-- de test (test_passed / test_failed) sin tocar los valores existentes.
alter table activity_log drop constraint if exists activity_log_action_check;
alter table activity_log add constraint activity_log_action_check check (
  action in (
    'login', 'video_watched', 'practice_completed', 'module_completed',
    'intake_completed', 'test_passed', 'test_failed'
  )
);
