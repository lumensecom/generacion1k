-- Migración 006 — renumeración cronológica de las sesiones 1:1
--
-- Contexto: con tres 1:1 por semana y la posibilidad de reprogramar a mitad
-- del plan, session_number ("la enésima sesión") tiene que seguir a la fecha.
--
-- El problema: renumerar con updates fila a fila choca contra el unique en
-- cuanto dos sesiones se cruzan de orden, porque el estado intermedio tiene
-- dos filas con el mismo número. Aplazando la restricción, la renumeración
-- entera ocurre dentro de una sola sentencia y solo se comprueba al final.
--
-- Aplicada en producción el 2026-08-12.

alter table public.one_on_one_sessions
  drop constraint one_on_one_sessions_student_id_session_number_key;

alter table public.one_on_one_sessions
  add constraint one_on_one_sessions_student_id_session_number_key
  unique (student_id, session_number) deferrable initially immediate;

create or replace function public.renumerar_sesiones(p_student uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  set constraints public.one_on_one_sessions_student_id_session_number_key deferred;

  update public.one_on_one_sessions s
  set session_number = r.rn
  from (
    select id,
           row_number() over (
             order by scheduled_at nulls last, created_at, id
           ) as rn
    from public.one_on_one_sessions
    where student_id = p_student
  ) r
  where s.id = r.id
    and s.student_id = p_student
    and s.session_number <> r.rn;
end;
$$;

-- Solo la llama el servidor con la service_role.
revoke all on function public.renumerar_sesiones(uuid) from public, anon, authenticated;

comment on function public.renumerar_sesiones is
  'Renumera las 1:1 de un estudiante en orden cronologico. Se llama tras agendar o reprogramar.';
