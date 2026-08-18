import type { OneOnOneSession, GroupSession, MeetingRequest } from '@/lib/types';

// Une los dos tipos de sesión en una sola lista para el calendario.
//
// Las 1:1 y la clase grupal viven en tablas distintas porque tienen dueños
// distintos (una es de un estudiante, la otra es de todos), pero el
// estudiante no piensa en dos calendarios: piensa en "mi semana".

export type TipoEvento = 'individual' | 'grupal';

export interface EventoAgenda {
  id: string;
  tipo: TipoEvento;
  titulo: string;
  /** ISO. Los eventos sin fecha no entran al calendario. */
  inicio: string;
  duracionMinutos: number;
  meetUrl: string | null;
  descripcion: string | null;
  /**
   * De quién es la 1:1. Solo se llena en la vista de Juan, que ve las de
   * todos a la vez: sin el nombre en el chip, el calendario es una pared de
   * "Sesión 1:1" imposible de leer. Al estudiante le llega en null porque en
   * su agenda todas son suyas.
   */
  persona: string | null;
  /** Solo en las 1:1: lo que el estudiante pidió tratar. */
  temaEstudiante: string | null;
  /** Solo en las 1:1: su número dentro del plan. */
  numero: number | null;
  estado: string;
  grabacionUrl: string | null;
  /** El tema solo se propone en las propias, y solo si no ha pasado. */
  puedeProponerTema: boolean;
}

export function eventoDeSesion(s: OneOnOneSession, persona: string | null = null): EventoAgenda | null {
  if (!s.scheduled_at) return null;
  return {
    id: s.id,
    tipo: 'individual',
    titulo: s.title?.trim() || `Sesión 1:1 · ${s.session_number}`,
    inicio: s.scheduled_at,
    duracionMinutos: s.duration_minutes,
    meetUrl: s.meet_url,
    // admin_notes son privadas de Juan: no se exponen al estudiante.
    descripcion: null,
    persona,
    temaEstudiante: s.student_topic,
    numero: s.session_number,
    estado: s.status,
    grabacionUrl: s.recording_url,
    puedeProponerTema: s.status !== 'cancelada' && s.status !== 'hecha',
  };
}

export function eventoDeClase(c: GroupSession): EventoAgenda | null {
  if (!c.scheduled_at) return null;
  return {
    id: c.id,
    tipo: 'grupal',
    titulo: c.title,
    inicio: c.scheduled_at,
    duracionMinutos: c.duration_minutes,
    meetUrl: c.meet_url,
    descripcion: c.description,
    persona: null,
    temaEstudiante: null,
    numero: null,
    estado: 'agendada',
    grabacionUrl: c.recording_url,
    puedeProponerTema: false,
  };
}

/**
 * Una 1:1 pedida por el estudiante y ya confirmada por Juan.
 *
 * Las solicitudes viven en su propia tabla, no en one_on_one_sessions, y sin
 * esto no salían en ningún calendario: el estudiante pedía la reunión, Juan
 * le ponía fecha, y esa fecha solo se veía en la pestaña de Ayuda. Ahora que
 * las 1:1 se piden en vez de programarse, esta ES la 1:1.
 */
export function eventoDeReunion(r: MeetingRequest, persona: string | null = null): EventoAgenda | null {
  if (!r.scheduled_at || r.status === 'pendiente' || r.status === 'cancelada') return null;
  return {
    id: `reunion-${r.id}`,
    tipo: 'individual',
    titulo: 'Sesión 1:1',
    inicio: r.scheduled_at,
    duracionMinutos: 60,
    meetUrl: null,
    // admin_note es la nota privada de Juan; lo que se enseña es lo que el
    // propio estudiante escribió al pedirla.
    descripcion: null,
    persona,
    temaEstudiante: r.question,
    numero: null,
    estado: r.status,
    grabacionUrl: null,
    // El tema ya lo escribió al solicitarla: no hay nada que proponer aquí.
    puedeProponerTema: false,
  };
}

/**
 * `nombres` mapea student_id a cómo llamarle en el chip. Solo lo pasa la
 * agenda de Juan, que mezcla las de todos los estudiantes.
 */
export function construirAgenda(
  sesiones: OneOnOneSession[],
  clases: GroupSession[],
  nombres?: Map<string, string>,
  reuniones: MeetingRequest[] = []
): EventoAgenda[] {
  return [
    ...sesiones.map((s) => eventoDeSesion(s, nombres?.get(s.student_id) ?? null)),
    ...clases.map(eventoDeClase),
    ...reuniones.map((r) => eventoDeReunion(r, nombres?.get(r.student_id) ?? null)),
  ]
    .filter((e): e is EventoAgenda => e !== null)
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}

// ---------- Estado temporal ----------

/** En vivo desde 15 min antes hasta que termina. */
export function enVivo(e: EventoAgenda): boolean {
  if (e.estado === 'cancelada' || e.estado === 'hecha') return false;
  const inicio = new Date(e.inicio).getTime();
  const ahora = Date.now();
  return ahora >= inicio - 15 * 60_000 && ahora <= inicio + e.duracionMinutos * 60_000;
}

export function yaPaso(e: EventoAgenda): boolean {
  return new Date(e.inicio).getTime() + e.duracionMinutos * 60_000 < Date.now();
}

// ---------- Hora de Colombia ----------
//
// Todo lo de abajo va en hora de Bogotá, fijada a mano y no heredada del
// proceso. Mientras se usó la hora local del proceso, el calendario decía dos
// cosas distintas según dónde corriera el código: tu portátil va en hora de
// Bogotá, pero Vercel va en UTC. En producción eso significaba que elegir las
// 7 pm guardaba las 2 pm, y que una sesión de las 7 pm se pintaba a las 12 de
// la noche del día siguiente.
//
// Colombia va en UTC-5 el año entero: no tiene horario de verano desde 1993.

export const ZONA = 'America/Bogota';
const DESFASE = -5 * 60 * 60_000;

/** El mismo instante corrido, para que sus getters UTC den la hora de Bogotá. */
function civil(d: Date): Date {
  return new Date(d.getTime() + DESFASE);
}

/**
 * El instante de una fecha y hora civiles de Bogotá; el inverso de civil().
 *
 * El mes va de 1 a 12 y los desbordamientos se normalizan solos, así que
 * sumar días crudos es seguro: el 32 de agosto es el 1 de septiembre.
 */
export function instante(anio: number, mes: number, dia: number, h = 0, min = 0): Date {
  return new Date(Date.UTC(anio, mes - 1, dia, h, min) - DESFASE);
}

/** Año, mes (1-12) y día de un instante, en Bogotá. */
function partes(d: Date): [number, number, number] {
  const c = civil(d);
  return [c.getUTCFullYear(), c.getUTCMonth() + 1, c.getUTCDate()];
}

// ---------- Rejilla del mes ----------

export interface Dia {
  fecha: Date;
  /** El número que se pinta en la celda. */
  numero: number;
  /** Clave YYYY-MM-DD en Bogotá, para agrupar sin líos de zona. */
  clave: string;
  delMes: boolean;
  esHoy: boolean;
}

export function claveLocal(d: Date): string {
  const [anio, mes, dia] = partes(d);
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/** El primer día del mes que está a `meses` del ancla. Para los flechazos. */
export function mesRelativo(ancla: Date, meses: number): Date {
  const [anio, mes] = partes(ancla);
  return instante(anio, mes + meses, 1);
}

/**
 * Las 6 semanas de la rejilla del mes, empezando en lunes.
 * Siempre 42 celdas para que la altura no salte al cambiar de mes.
 */
export function rejillaDelMes(ancla: Date): Dia[] {
  const [anio, mes] = partes(ancla);
  const desplazamiento = diaISO(instante(anio, mes, 1)) - 1;

  const hoy = claveLocal(new Date());
  const dias: Dia[] = [];
  for (let i = 0; i < 42; i++) {
    const f = instante(anio, mes, 1 - desplazamiento + i);
    const [, mesF, diaF] = partes(f);
    dias.push({ fecha: f, numero: diaF, clave: claveLocal(f), delMes: mesF === mes, esHoy: claveLocal(f) === hoy });
  }
  return dias;
}

/** ¿Cae este instante en el mes del ancla? */
export function mismoMes(d: Date, ancla: Date): boolean {
  const [anioD, mesD] = partes(d);
  const [anioA, mesA] = partes(ancla);
  return anioD === anioA && mesD === mesA;
}

export function agruparPorDia(eventos: EventoAgenda[]): Map<string, EventoAgenda[]> {
  const mapa = new Map<string, EventoAgenda[]>();
  for (const e of eventos) {
    const clave = claveLocal(new Date(e.inicio));
    const lista = mapa.get(clave);
    if (lista) lista.push(e);
    else mapa.set(clave, [e]);
  }
  return mapa;
}

// ---------- Formato ----------

/**
 * Hora compacta para los chips del calendario: "7pm", "8:30pm", "9:05am".
 *
 * es-CO devuelve "7:00 p. m." — con espacios y puntos que en una celda de
 * calendario solo ocupan sitio. Se compone a mano en vez de parchear la
 * salida del locale, que cambia entre plataformas.
 */
export function hora(iso: string): string {
  const c = civil(new Date(iso));
  const h = c.getUTCHours();
  const m = c.getUTCMinutes();
  const sufijo = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${sufijo}` : `${h12}:${String(m).padStart(2, '0')}${sufijo}`;
}

export function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA,
  });
}

/** El encabezado de día de la lista: "lunes, 17 de agosto". */
export function fechaDia(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: ZONA,
  });
}

export function nombreMes(d: Date): string {
  return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric', timeZone: ZONA });
}

export function fechaCorta(d: Date): string {
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: ZONA });
}

// ---------- Patrón semanal (con esto se agenda) ----------
//
// Juan no piensa en 36 fechas sueltas: piensa en "lunes, miércoles y viernes
// a las 7". Se elige el día de la semana y la hora, y el patrón se repite
// tantas semanas como dure el plan. Todo esto es puro a propósito: el
// formulario calcula la vista previa con las mismas funciones que el servidor
// usa para crear las filas, así lo que se ve es exactamente lo que se guarda.

/** 1 = lunes … 7 = domingo, como en ISO-8601. */
export const DIAS_SEMANA = [
  { valor: 1, nombre: 'Lunes' },
  { valor: 2, nombre: 'Martes' },
  { valor: 3, nombre: 'Miércoles' },
  { valor: 4, nombre: 'Jueves' },
  { valor: 5, nombre: 'Viernes' },
  { valor: 6, nombre: 'Sábado' },
  { valor: 7, nombre: 'Domingo' },
] as const;

export interface Franja {
  /** 1 = lunes … 7 = domingo. */
  dia: number;
  /** "19:00", en hora local. */
  hora: string;
}

export function nombreDia(dia: number): string {
  return DIAS_SEMANA.find((d) => d.valor === dia)?.nombre ?? '';
}

/** getUTCDay() da 0 para domingo; aquí la semana empieza en lunes. */
export function diaISO(d: Date): number {
  const n = civil(d).getUTCDay();
  return n === 0 ? 7 : n;
}

/**
 * "2026-08-17" (input date, sin zona) a la medianoche de ese día en Bogotá.
 *
 * new Date("2026-08-17") lo interpreta como UTC, y en Colombia eso es el 16
 * a las 7 pm: el patrón entero arrancaría un día antes.
 */
export function fechaDesdeInput(texto: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto.trim());
  if (!m) return null;
  const d = instante(Number(m[1]), Number(m[2]), Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * true si ese día (YYYY-MM-DD, en Bogotá) todavía no ha empezado.
 *
 * Se compara contra la medianoche de Bogotá: el 17 se abre a las 00:00 hora
 * colombiana, no a las 7 de la tarde del 16, que es lo que pasaría midiendo
 * en UTC.
 */
export function aunNoLlega(dia: string | null | undefined): boolean {
  if (!dia) return false;
  const d = fechaDesdeInput(dia);
  return !!d && Date.now() < d.getTime();
}

/** "lunes 17 de agosto" a partir de un YYYY-MM-DD. Para anunciar estrenos. */
export function diaLargo(dia: string): string {
  const d = fechaDesdeInput(dia);
  if (!d) return dia;
  return d
    .toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: ZONA })
    .replace(',', '');
}

/**
 * "2026-08-17T19:00" (input datetime-local, sin zona) como hora de Bogotá.
 *
 * new Date(texto) lo leería con la zona del proceso, que en Vercel es UTC:
 * las 7 pm escritas a mano se guardaban como las 2 pm.
 */
export function fechaHoraDesdeInput(texto: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(texto.trim());
  if (!m) return null;
  const d = instante(+m[1], +m[2], +m[3], +m[4], +m[5]);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Un instante de vuelta a lo que espera <input type="datetime-local">. */
export function paraInputFechaHora(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return civil(d).toISOString().slice(0, 16);
}

export function franjaValida(f: Franja): boolean {
  if (!Number.isInteger(f.dia) || f.dia < 1 || f.dia > 7) return false;
  const m = /^(\d{1,2}):(\d{2})$/.exec(f.hora);
  return !!m && Number(m[1]) <= 23 && Number(m[2]) <= 59;
}

/** Clave para detectar dos franjas iguales, que crearían sesiones encimadas. */
export function claveFranja(f: Franja): string {
  const [h, m] = f.hora.split(':');
  return `${f.dia}-${h.padStart(2, '0')}:${m}`;
}

/**
 * Todas las fechas del patrón, en orden.
 *
 * Cada franja arranca en su primera aparición desde `desde` (incluido ese
 * mismo día) y se repite sumando 7 días. Las sesiones salen ordenadas
 * cronológicamente aunque las franjas se hayan escrito en desorden.
 */
export function fechasDelPatron(desde: Date, franjas: Franja[], semanas: number): Date[] {
  const [anio, mes, dia] = partes(desde);
  const fechas: Date[] = [];
  for (const f of franjas) {
    if (!franjaValida(f)) continue;
    const [h, min] = f.hora.split(':').map(Number);
    const salto = (f.dia - diaISO(desde) + 7) % 7;
    for (let s = 0; s < semanas; s++) {
      // instante() normaliza el desbordamiento de mes, así que sumar días
      // crudos es seguro incluso pasando de agosto a noviembre.
      fechas.push(instante(anio, mes, dia + salto + s * 7, h, min));
    }
  }
  return fechas.sort((a, b) => a.getTime() - b.getTime());
}

/** Un instante N semanas después. En zona de desfase fijo son 7×24 h justas. */
export function masSemanas(d: Date, semanas: number): Date {
  return new Date(d.getTime() + semanas * 7 * 24 * 60 * 60_000);
}
