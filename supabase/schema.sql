-- ============================================================
-- Portal de Estudiantes · Generación 1K Elite
-- Proyecto Supabase separado de LUMENS OS ("LMS")
-- ============================================================
-- Nota de seguridad: el portal NO usa Supabase Auth. Toda la app pasa por
-- el servidor de Next.js con la service_role key (que ignora RLS por
-- diseño de Supabase); el navegador nunca consulta esta base directamente.
-- Por eso las políticas de abajo son "default deny" para anon/authenticated
-- — son una segunda capa de seguridad, no el mecanismo principal.

create extension if not exists pgcrypto;

-- Estudiantes
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  city text,
  age integer,
  phone text,
  role text not null default 'student' check (role in ('student', 'admin')),
  invited_at timestamptz not null default now(),
  first_login_at timestamptz,
  last_login_at timestamptz,
  is_active boolean not null default true,
  personal_notes text
);

-- Cuestionario inicial (bienvenida)
create table if not exists student_intake (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  occupation text,
  economic_situation text,
  income_goal text,
  daily_hours text,
  investment_capital text,
  biggest_fear text,
  why_chose_program text,
  completed_at timestamptz not null default now(),
  unique (student_id)
);

-- Módulos (configuración global, no por estudiante)
create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  order_index integer not null,
  loom_url text,
  theory_content jsonb not null default '[]'::jsonb,
  practice_checklist jsonb not null default '[]'::jsonb,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Recursos descargables por módulo
create table if not exists module_resources (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  name text not null,
  file_url text not null,
  file_type text check (file_type in ('pdf', 'video', 'link', 'template')),
  size_bytes integer,
  created_at timestamptz not null default now()
);

-- Progreso del estudiante por módulo
create table if not exists student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  module_id uuid not null references modules(id) on delete cascade,
  video_watched boolean not null default false,
  video_watched_at timestamptz,
  practice_checked_items jsonb not null default '[]'::jsonb,
  practice_completed boolean not null default false,
  practice_completed_at timestamptz,
  module_completed boolean not null default false,
  module_completed_at timestamptz,
  student_notes text,
  updated_at timestamptz not null default now(),
  unique (student_id, module_id)
);

-- Check-in diario ("hoy trabajé en mi negocio")
create table if not exists student_checkins (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  worked_today boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

-- Mentores invitados
create table if not exists mentors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  role text not null,
  bio text,
  photo_url text,
  years_experience text,
  companies text,
  session_loom_url text,
  session_date text,
  order_index integer not null default 0
);

-- Configuración global (clave de acceso, generación activa, etc.)
create table if not exists portal_config (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text,
  updated_at timestamptz not null default now()
);

-- Log de actividad
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  action text not null check (
    action in (
      'login', 'video_watched', 'practice_completed', 'module_completed',
      'intake_completed', 'test_passed', 'test_failed'
    )
  ),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_student_progress_student on student_progress(student_id);
create index if not exists idx_activity_log_student on activity_log(student_id);
create index if not exists idx_module_resources_module on module_resources(module_id);

-- updated_at automático
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_modules_updated_at on modules;
create trigger trg_modules_updated_at before update on modules
  for each row execute function set_updated_at();

drop trigger if exists trg_student_progress_updated_at on student_progress;
create trigger trg_student_progress_updated_at before update on student_progress
  for each row execute function set_updated_at();

-- Intentos de test por módulo (ver migration_002_test_attempts.sql para el
-- historial — esta definición vive aquí también para que schema.sql sea
-- la fuente de verdad completa en despliegues nuevos desde cero).
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

-- ============================================================
-- Row Level Security — default deny para anon/authenticated.
-- service_role (usado por el servidor de Next.js) ignora RLS siempre.
-- ============================================================
alter table students enable row level security;
alter table student_intake enable row level security;
alter table modules enable row level security;
alter table module_resources enable row level security;
alter table student_progress enable row level security;
alter table student_checkins enable row level security;
alter table mentors enable row level security;
alter table portal_config enable row level security;
alter table activity_log enable row level security;
alter table test_attempts enable row level security;
