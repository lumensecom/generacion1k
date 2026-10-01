import { claveLocal } from '@/lib/agenda';

/**
 * Quién puede entrar al Software 1K y desde cuándo.
 *
 * Hasta la apertura sólo entra el admin. El estudiante sí ve el mapa — en
 * colores, con sus seis herramientas — pero difuminado y sin poder abrir
 * ninguna. Que sepa lo que viene es parte de lo que lo hace esperar; que lo
 * pueda tocar a medio terminar, no.
 *
 * La fecha manda sola: el 5 de octubre se abre para todos sin que nadie tenga
 * que acordarse de cambiar nada. Se compara en hora de Bogotá, no en la del
 * servidor, que en Vercel es UTC y abriría cinco horas antes.
 *
 * Este archivo lo importa el middleware, que corre en el Edge: nada de
 * Supabase ni de server-only aquí.
 */

export const FECHA_APERTURA = '2026-10-05';

export const APERTURA_TEXTO = '5 de octubre';

/** true desde el 5 de octubre de 2026, a las 00:00 de Bogotá. */
export function softwareAbierto(ahora: Date = new Date()): boolean {
  return claveLocal(ahora) >= FECHA_APERTURA;
}

/** Si puede usar las herramientas de verdad, no sólo verlas por encima. */
export function puedeUsarSoftware(
  role: 'student' | 'admin',
  ahora: Date = new Date()
): boolean {
  return role === 'admin' || softwareAbierto(ahora);
}

/** Cuántos días faltan. 0 el mismo día de la apertura. */
export function diasParaApertura(ahora: Date = new Date()): number {
  const hoy = claveLocal(ahora);
  if (hoy >= FECHA_APERTURA) return 0;
  const [a1, m1, d1] = hoy.split('-').map(Number);
  const [a2, m2, d2] = FECHA_APERTURA.split('-').map(Number);
  const ms = Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1);
  return Math.round(ms / 86_400_000);
}
