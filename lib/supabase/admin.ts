import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

// Cliente con la service_role key — SOLO se importa desde código de servidor
// (Server Components, Server Actions, Route Handlers). Nunca desde un
// componente cliente. Es el único cliente de Supabase que usa el portal:
// el navegador nunca habla directo con Supabase, todo pasa por el servidor
// de Next.js, que valida la cookie de sesión antes de tocar la base de datos.
let cached: ReturnType<typeof createClient<Database>> | null = null;

export function supabaseAdmin() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Configúralas en .env.local o en Vercel.'
    );
  }

  cached = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
