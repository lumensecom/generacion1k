-- ============================================================
-- migration_004 — Planes, pagos y cronograma de 1:1
-- (aplicada el 2026-08-12)
-- ============================================================

alter table public.students
  add column if not exists plan text check (plan in ('start','growth')),
  add column if not exists plan_started_at date,
  add column if not exists sessions_total integer,
  add column if not exists amount_total_cents integer not null default 0,
  add column if not exists amount_paid_cents integer not null default 0,
  add column if not exists currency text not null default 'USD',
  add column if not exists payment_notes text;

create table if not exists public.one_on_one_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  session_number integer not null,
  title text,
  scheduled_at timestamptz,
  duration_minutes integer not null default 60,
  meet_url text,
  status text not null default 'pendiente'
    check (status in ('pendiente','agendada','hecha','cancelada','no_asistio')),
  student_topic text,
  admin_notes text,
  recording_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Hace idempotente la generación del cronograma: volver a pulsar
  -- "completar" no duplica las sesiones que ya existen.
  unique (student_id, session_number)
);
create index if not exists sesiones_estudiante_idx on public.one_on_one_sessions(student_id, session_number);
create index if not exists sesiones_fecha_idx on public.one_on_one_sessions(scheduled_at) where scheduled_at is not null;

alter table public.one_on_one_sessions enable row level security;

create or replace function public.tocar_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sesiones_updated_at on public.one_on_one_sessions;
create trigger sesiones_updated_at
  before update on public.one_on_one_sessions
  for each row execute function public.tocar_updated_at();
