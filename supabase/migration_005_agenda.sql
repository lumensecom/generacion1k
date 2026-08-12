-- ============================================================
-- migration_005 — Agenda: 90 min por defecto (2026-08-12)
--
-- El programa pasa a 3 encuentros semanales (2 sesiones 1:1 + 1 clase
-- grupal) de 90 a 120 minutos. Solo cambia el valor por defecto; las
-- filas ya creadas conservan su duración.
-- ============================================================

alter table public.one_on_one_sessions alter column duration_minutes set default 90;

comment on column public.one_on_one_sessions.session_number is
  'Orden de la sesión dentro del plan (1..N). No es el número de semana: puede haber varias por semana.';
