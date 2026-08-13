-- El video de bienvenida es una puerta: se ve una vez, antes de que se abra
-- el resto del portal. Guardar CUANDO se vio, y no un booleano, deja saber
-- despues si alguien lo vio de verdad o si le dio a "ya lo vi" en tres
-- segundos, comparandolo con su hora de creacion.

alter table public.students
  add column if not exists onboarding_video_at timestamptz;

comment on column public.students.onboarding_video_at is
  'Cuando el estudiante marco el video de bienvenida como visto. Null = todavia no ha pasado la puerta.';
