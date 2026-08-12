-- ============================================================
-- migration_003 — Portal v2 (aplicada el 2026-08-11)
--
-- Contraseñas gestionadas por el admin, panel de ayuda con respuesta en
-- video, clase grupal semanal con encuesta de día, y solicitud de reunión.
-- Los videos pasan de Loom a Cloudinary (video_url).
-- ============================================================

alter table public.students
  add column if not exists password_hash text,
  add column if not exists password_set_at timestamptz,
  add column if not exists created_by_admin boolean not null default false;

alter table public.modules add column if not exists video_url text;
alter table public.mentors add column if not exists video_url text;

create table if not exists public.student_questions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  question text not null,
  module_slug text,
  status text not null default 'nueva' check (status in ('nueva','respondida','en_video','cerrada')),
  admin_reply text,
  reply_video_url text,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists student_questions_student_idx on public.student_questions(student_id, created_at desc);
create index if not exists student_questions_status_idx on public.student_questions(status, created_at desc);

create table if not exists public.meeting_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  question text not null,
  availability text,
  status text not null default 'pendiente' check (status in ('pendiente','agendada','hecha','cancelada')),
  admin_note text,
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists meeting_requests_status_idx on public.meeting_requests(status, created_at desc);

create table if not exists public.group_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  scheduled_at timestamptz,
  duration_minutes integer not null default 90,
  meet_url text,
  recording_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists group_sessions_fecha_idx on public.group_sessions(scheduled_at desc nulls last);

create table if not exists public.session_polls (
  id uuid primary key default gen_random_uuid(),
  question text not null default '¿Qué día te sirve para la clase grupal?',
  options jsonb not null default '[]'::jsonb,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.session_poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.session_polls(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  option_id text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, student_id)
);
create index if not exists poll_votes_poll_idx on public.session_poll_votes(poll_id);

alter table public.student_questions   enable row level security;
alter table public.meeting_requests    enable row level security;
alter table public.group_sessions      enable row level security;
alter table public.session_polls       enable row level security;
alter table public.session_poll_votes  enable row level security;

-- Solo ADMA queda como aliado.
delete from public.mentors where slug in ('ronhal','jorge-arias');
