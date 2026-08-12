import type { OneOnOneSession, GroupSession } from '@/lib/types';

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
  /** Solo en las 1:1: lo que el estudiante pidió tratar. */
  temaEstudiante: string | null;
  /** Solo en las 1:1: su número dentro del plan. */
  numero: number | null;
  estado: string;
  grabacionUrl: string | null;
  /** El tema solo se propone en las propias, y solo si no ha pasado. */
  puedeProponerTema: boolean;
}

export function eventoDeSesion(s: OneOnOneSession): EventoAgenda | null {
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
    temaEstudiante: null,
    numero: null,
    estado: 'agendada',
    grabacionUrl: c.recording_url,
    puedeProponerTema: false,
  };
}

export function construirAgenda(sesiones: OneOnOneSession[], clases: GroupSession[]): EventoAgenda[] {
  return [
    ...sesiones.map(eventoDeSesion),
    ...clases.map(eventoDeClase),
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

// ---------- Rejilla del mes ----------

export interface Dia {
  fecha: Date;
  /** Clave YYYY-MM-DD en hora local, para agrupar sin líos de zona. */
  clave: string;
  delMes: boolean;
  esHoy: boolean;
}

export function claveLocal(d: Date): string {
  // toISOString() pasa a UTC y en Colombia (UTC-5) eso mueve de día a
  // cualquier evento de después de las 7 pm. Se compone a mano en local.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Las 6 semanas de la rejilla del mes, empezando en lunes.
 * Siempre 42 celdas para que la altura no salte al cambiar de mes.
 */
export function rejillaDelMes(ancla: Date): Dia[] {
  const primero = new Date(ancla.getFullYear(), ancla.getMonth(), 1);
  // getDay() da 0 para domingo; aquí la semana empieza en lunes.
  const desplazamiento = (primero.getDay() + 6) % 7;
  const inicio = new Date(primero);
  inicio.setDate(primero.getDate() - desplazamiento);

  const hoy = claveLocal(new Date());
  const dias: Dia[] = [];
  for (let i = 0; i < 42; i++) {
    const f = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
    const clave = claveLocal(f);
    dias.push({ fecha: f, clave, delMes: f.getMonth() === ancla.getMonth(), esHoy: clave === hoy });
  }
  return dias;
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
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
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
  });
}

export function nombreMes(d: Date): string {
  return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
}

export function fechaCorta(d: Date): string {
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
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

/** getDay() da 0 para domingo; aquí la semana empieza en lunes. */
export function diaISO(d: Date): number {
  return d.getDay() === 0 ? 7 : d.getDay();
}

/**
 * "2026-08-17" a Date local a medianoche.
 *
 * new Date("2026-08-17") lo interpreta como UTC, y en Colombia eso es el 16
 * a las 7 pm: el patrón entero arrancaría un día antes.
 */
export function fechaDesdeInput(texto: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
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
  const fechas: Date[] = [];
  for (const f of franjas) {
    if (!franjaValida(f)) continue;
    const [h, min] = f.hora.split(':').map(Number);
    const salto = (f.dia - diaISO(desde) + 7) % 7;
    for (let s = 0; s < semanas; s++) {
      // El constructor normaliza el desbordamiento de mes, así que sumar
      // días crudos es seguro incluso pasando de agosto a noviembre.
      fechas.push(
        new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + salto + s * 7, h, min)
      );
    }
  }
  return fechas.sort((a, b) => a.getTime() - b.getTime());
}
