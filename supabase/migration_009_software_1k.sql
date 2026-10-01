-- Software 1K — las herramientas de LUMENS OS, traídas al portal del estudiante.
--
-- LUMENS OS es de un solo usuario: cada tabla cuelga de profiles con Supabase
-- Auth. El portal no usa Supabase Auth sino una cookie firmada sobre students,
-- así que el esquema se porta con student_id desde la base. Sin ese cambio los
-- estudiantes verían la contabilidad de los demás.
--
-- Prefijo sw_ para no chocar con nada del portal.

create type sw_estado_producto as enum ('activo', 'pausado', 'probando', 'archivado');
create type sw_categoria_gasto as enum (
  'ads_meta', 'ads_tiktok', 'envio', 'costo_producto', 'devolucion', 'herramientas', 'otro'
);
create type sw_fuente_ingreso as enum ('tienda', 'marketplace', 'otro');
create type sw_estado_creativo as enum ('ganador', 'probando', 'pausado', 'archivado');
create type sw_plataforma as enum ('meta', 'tiktok', 'ambas');

create table public.sw_productos (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  nombre text not null,
  estado sw_estado_producto not null default 'probando',
  precio_venta numeric(12,2) not null default 0,
  precio_tachado numeric(12,2),
  costo_producto numeric(12,2) not null default 0,
  costo_envio numeric(12,2) not null default 0,
  costo_devolucion numeric(12,2) not null default 0,
  efectividad_pct numeric(5,2) not null default 70,
  landing_url text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.sw_productos.efectividad_pct is
  'Porcentaje entregado y cobrado. Es lo que convierte el margen teorico en margen real.';

create table public.sw_ingresos (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  fecha date not null,
  fuente sw_fuente_ingreso not null default 'tienda',
  producto_id uuid references public.sw_productos(id) on delete set null,
  monto numeric(12,2) not null,
  pedidos integer not null default 1,
  notas text,
  created_at timestamptz not null default now()
);

create table public.sw_gastos (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  fecha date not null,
  categoria sw_categoria_gasto not null,
  producto_id uuid references public.sw_productos(id) on delete set null,
  monto numeric(12,2) not null,
  descripcion text,
  created_at timestamptz not null default now()
);

create table public.sw_creativos (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  nombre text not null,
  producto_id uuid references public.sw_productos(id) on delete set null,
  plataforma sw_plataforma not null default 'ambas',
  estado sw_estado_creativo not null default 'probando',
  formato text,
  angulo text,
  hook text,
  guion text,
  cta text,
  video_url text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sw_ajustes (
  student_id uuid primary key references public.students(id) on delete cascade,
  moneda text not null default 'COP',
  costo_envio_default numeric(12,2) not null default 0,
  efectividad_default numeric(5,2) not null default 70,
  meta_mensual numeric(12,2) not null default 0,
  -- Lo que el estudiante vende y a quien. Se le pasa a la IA para que los
  -- guiones y las landings salgan de su marca y no de un molde generico.
  contexto_marca text,
  updated_at timestamptz not null default now()
);

create index sw_productos_student_idx on public.sw_productos (student_id);
create index sw_ingresos_student_fecha_idx on public.sw_ingresos (student_id, fecha desc);
create index sw_gastos_student_fecha_idx on public.sw_gastos (student_id, fecha desc);
create index sw_creativos_student_idx on public.sw_creativos (student_id);

-- El mismo criterio que el resto del portal: RLS activo y cero políticas, de
-- modo que por PostgREST no entra nadie y sólo el service_role del servidor
-- —que salta RLS por diseño— puede leer.
--
-- El aislamiento entre estudiantes lo hace el .eq('student_id', sid) de cada
-- consulta en lib/software-data.ts. Esto es la segunda cerradura.
alter table public.sw_productos enable row level security;
alter table public.sw_ingresos  enable row level security;
alter table public.sw_gastos    enable row level security;
alter table public.sw_creativos enable row level security;
alter table public.sw_ajustes   enable row level security;
