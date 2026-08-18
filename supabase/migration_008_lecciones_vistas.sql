-- Cada modulo se divide en lecciones (estilo Skool) y el estudiante las va
-- marcando una a una. Se guardan los ids de las vistas, no un contador: si
-- manana se reordenan o se anade una leccion en medio, un contador mentiria y
-- la lista de ids sigue siendo cierta.
--
-- jsonb y no text[] por coherencia con practice_checked_items, que ya guarda
-- su lista asi en esta misma tabla.

alter table public.student_progress
  add column if not exists lessons_done jsonb not null default '[]'::jsonb;

comment on column public.student_progress.lessons_done is
  'Ids de las lecciones que el estudiante ya marco como vistas dentro del modulo.';
