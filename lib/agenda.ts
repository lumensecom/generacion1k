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
