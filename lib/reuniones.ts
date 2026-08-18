import { claveLocal, diaISO, instante } from '@/lib/agenda';
import type { MeetingRequest } from '@/lib/types';

// El modelo del acompañamiento: el peso está en las clases grupales, y las
// 1:1 son un recurso que el estudiante pide cuando le hace falta.
//
// TRES grupales a la semana (martes, jueves y domingo) de hora y media, más
// UNA 1:1 semanal de una hora que pide él.
//
// "Sin acumular" es la parte que manda: el cupo es de la semana, no del plan.
// Si esta semana no la pide, no se guarda para la siguiente — el lunes vuelve
// a haber una. Es lo que evita que alguien desaparezca dos meses y reaparezca
// reclamando ocho sesiones.

export const CUPO_SEMANAL_1A1 = 1;
export const DURACION_1A1 = 60;

export const GRUPAL_DURACION = 90;
export const GRUPAL_HORA = '19:30';
/** 2 = martes, 4 = jueves, 7 = domingo, en ISO (1 = lunes). */
export const GRUPAL_DIAS = [2, 4, 7] as const;
export const GRUPAL_MEET = 'https://meet.jit.si/MENTOR%C3%8DA1K%C3%89LITEgrupal';

/**
 * El lunes de la semana a la que pertenece un instante, en Bogotá.
 *
 * Se usa como clave para agrupar: dos solicitudes son de la misma semana si
 * les sale el mismo lunes. La semana empieza en lunes y no en domingo porque
 * el domingo es día de clase grupal, y cortar la semana justo ahí partiría
 * en dos lo que el estudiante vive como una sola semana.
 */
export function lunesDeLaSemana(d: Date = new Date()): string {
  const [anio, mes, dia] = claveLocal(d).split('-').map(Number);
  return claveLocal(instante(anio, mes, dia - (diaISO(d) - 1)));
}

/** Las solicitudes que consumen cupo de esta semana. */
export function solicitudesDeLaSemana(
  solicitudes: MeetingRequest[],
  ahora: Date = new Date()
): MeetingRequest[] {
  const semana = lunesDeLaSemana(ahora);
  return solicitudes.filter((r) => {
    // Una cancelada no gasta cupo: si Juan la cancela o no puede atenderla,
    // sería injusto que además le costara la semana al estudiante.
    if (r.status === 'cancelada') return false;
    // Cuenta la fecha acordada cuando ya la hay, y si no la de la solicitud:
    // lo que consume el cupo es la sesión, no el papeleo.
    const referencia = r.scheduled_at ?? r.created_at;
    return lunesDeLaSemana(new Date(referencia)) === semana;
  });
}

export function cupoRestante(solicitudes: MeetingRequest[], ahora: Date = new Date()): number {
  return Math.max(0, CUPO_SEMANAL_1A1 - solicitudesDeLaSemana(solicitudes, ahora).length);
}

/** El domingo de esta semana a medianoche: cuándo se reinicia el cupo. */
export function finDeSemana(ahora: Date = new Date()): Date {
  const [anio, mes, dia] = lunesDeLaSemana(ahora).split('-').map(Number);
  return instante(anio, mes, dia + 7);
}
