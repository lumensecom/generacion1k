-- ============================================================
-- Seed inicial — ejecutar una sola vez después de schema.sql
-- ============================================================

insert into portal_config (key, value) values
  ('access_code', 'GEN1K-2026'),
  ('is_active', 'true'),
  ('current_generation', '1')
on conflict (key) do nothing;

insert into modules (slug, title, subtitle, order_index) values
  ('mentalidad-pce', 'Mentalidad del emprendedor PCE', 'La base mental para construir tu primer negocio', 1),
  ('producto-ganador', 'Cómo elegir tu producto ganador', 'El framework de los 5 criterios LUMENS', 2),
  ('setup-shopify', 'Setup Shopify completo', 'De cero a tienda funcionando en 2 horas', 3),
  ('dropi-adma', 'Dropi + ADMA: configuración', 'Fulfillment automatizado paso a paso', 4),
  ('releasit-cod', 'ReleaseIt COD: pagos y confirmación', 'El sistema de pago contra entrega completo', 5),
  ('pixel-tracking', 'Meta Pixel + TikTok Pixel', 'Tracking correcto desde el día 1', 6),
  ('primer-creativo', 'Cómo crear tu primer creativo ganador', 'Los 6 ángulos validados en Colombia', 7),
  ('lanzamiento', 'Lanzamiento de tu primera campaña', 'Configuración de campaña que convierte', 8),
  ('escalado', 'Optimización y escalado', 'Cómo escalar sin romper campañas ni perder rentabilidad', 9),
  ('devoluciones-cs', 'Gestión de devoluciones y customer service', 'Maneja devoluciones y atención al cliente como un profesional', 10)
on conflict (slug) do nothing;

-- Placeholder de contenido teórico + práctica para cada módulo — Juan lo
-- completa después desde /portal/admin. El formato de theory_content lo
-- entiende TheoryRenderer (components/portal/TheoryRenderer.tsx).
update modules set
  theory_content = '[
    {"type":"callout","variant":"purple","text":"Contenido en construcción — Juan está preparando este módulo. Vuelve pronto."}
  ]'::jsonb,
  practice_checklist = '["Práctica en construcción — se agregará pronto."]'::jsonb
where theory_content = '[]'::jsonb;

insert into mentors (slug, name, role, bio, years_experience, companies, order_index) values
  ('adma', 'ADMA', 'Proveedor aliado · fulfillment y logística',
   'Nuestro aliado de fulfillment. Su sesión cubre cómo montar una operación de entregas que no te deje mal con el cliente: tiempos, novedades y devoluciones.', null, null, 1)
on conflict (slug) do nothing;
