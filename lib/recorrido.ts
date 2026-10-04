import { claveLocal, instante, partes } from '@/lib/agenda';
import type { Student } from '@/lib/types';

/**
 * El recorrido de la mentoría: tres meses, de la fecha de inicio a la de
 * cierre.
 *
 * El estudiante no piensa en porcentajes sino en "¿cuánto llevo y cuánto me
 * queda?". Todo esto existe para responder esa pregunta de un vistazo.
 *
 * Las fechas se calculan en hora de Bogotá, no en la del servidor: en Vercel
 * es UTC y el cambio de día ocurriría a las 7 de la noche.
 */

export const MESES_PROGRAMA = 3;

export interface Recorrido {
  inicio: Date;
  fin: Date;
  /** De dónde salió la fecha de inicio, para poder avisarlo si fue inferida. */
  origenInicio: 'plan' | 'primer-ingreso' | 'invitacion';
  /** Días desde que empezó. 0 el mismo día. */
  diasTranscurridos: number;
  diasTotales: number;
  diasRestantes: number;
  /** Semana en la que va, empezando en 1. */
  semanaActual: number;
  semanasTotales: number;
  /** 0 a 100. Se queda en 100 cuando ya terminó. */
  porcentaje: number;
  /** En cuál de los tres meses está, de 1 a 3. */
  mesActual: number;
  /** Aún no empieza (fecha de inicio futura). */
  porEmpezar: boolean;
  terminado: boolean;
}

/** Suma meses respetando el calendario: 31 de enero + 1 mes = 28/29 de febrero. */
function sumarMeses(d: Date, meses: number): Date {
  const [anio, mes, dia] = partes(d);
  // instante() normaliza el desborde (mes 13 → enero del año siguiente), pero
  // un 31 en un mes de 30 se iría al mes siguiente. Se recorta al último día.
  const ultimoDelDestino = new Date(
    instante(anio, mes + meses + 1, 1).getTime() - 86_400_000
  );
  const [, , ultimoDia] = partes(ultimoDelDestino);
  return instante(anio, mes + meses, Math.min(dia, ultimoDia));
}

/**
 * En cuál de los tres meses cae `ahora`, contando por calendario: el mes 2
 * empieza el día que se cumple un mes exacto desde el inicio.
 */
function mesDelRecorrido(inicio: Date, ahora: Date): number {
  for (let m = MESES_PROGRAMA - 1; m >= 1; m--) {
    if (ahora.getTime() >= sumarMeses(inicio, m).getTime()) return m + 1;
  }
  return 1;
}

/** Diferencia en días entre dos fechas, contando días de calendario en Bogotá. */
function diasEntre(desde: Date, hasta: Date): number {
  const [a1, m1, d1] = partes(desde);
  const [a2, m2, d2] = partes(hasta);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86_400_000);
}

/**
 * La fecha de inicio del estudiante. Si no tiene plan_started_at se usa su
 * primer ingreso, y si tampoco, la invitación. Siempre devuelve algo: un
 * recorrido vacío sería peor que uno aproximado, y el origen va marcado para
 * poder decirlo en pantalla.
 */
export function fechaDeInicio(
  estudiante: Pick<Student, 'plan_started_at' | 'first_login_at' | 'invited_at'>
): { fecha: Date; origen: Recorrido['origenInicio'] } {
  if (estudiante.plan_started_at) {
    return { fecha: new Date(estudiante.plan_started_at), origen: 'plan' };
  }
  if (estudiante.first_login_at) {
    return { fecha: new Date(estudiante.first_login_at), origen: 'primer-ingreso' };
  }
  return { fecha: new Date(estudiante.invited_at), origen: 'invitacion' };
}

export function calcularRecorrido(
  estudiante: Pick<Student, 'plan_started_at' | 'first_login_at' | 'invited_at'>,
  ahora: Date = new Date()
): Recorrido {
  const { fecha: inicio, origen } = fechaDeInicio(estudiante);
  const fin = sumarMeses(inicio, MESES_PROGRAMA);

  const diasTotales = Math.max(1, diasEntre(inicio, fin));
  const crudo = diasEntre(inicio, ahora);
  const diasTranscurridos = Math.min(diasTotales, Math.max(0, crudo));

  return {
    inicio,
    fin,
    origenInicio: origen,
    diasTranscurridos,
    diasTotales,
    diasRestantes: Math.max(0, diasTotales - diasTranscurridos),
    semanaActual: Math.min(
      Math.ceil(diasTotales / 7),
      Math.floor(diasTranscurridos / 7) + 1
    ),
    semanasTotales: Math.ceil(diasTotales / 7),
    porcentaje: Math.round((diasTranscurridos / diasTotales) * 100),
    // Por calendario y no por proporción: agosto tiene 31 días y septiembre
    // 30, así que repartir el avance en tercios iguales desfasa el mes.
    mesActual: mesDelRecorrido(inicio, ahora),
    porEmpezar: crudo < 0,
    terminado: crudo >= diasTotales,
  };
}

/** "15 de diciembre" — sin año, que en tres meses no hace falta. */
export function fechaBonita(d: Date): string {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const [, mes, dia] = partes(d);
  return `${dia} de ${meses[mes - 1]}`;
}

/** La clave YYYY-MM-DD en Bogotá, para comparar sin líos de zona. */
export function claveDe(d: Date): string {
  return claveLocal(d);
}

export interface EtapaRecorrido {
  mes: number;
  titulo: string;
  /** Qué se supone que está pasando en ese tramo. */
  foco: string;
}

/**
 * Los tres meses, con lo que toca en cada uno. No son los módulos (esos van
 * a su propio ritmo): es el arco del programa, para que el estudiante sepa
 * si va donde debería ir.
 */
export const ETAPAS: EtapaRecorrido[] = [
  {
    mes: 1,
    titulo: 'Fundamentos y producto',
    foco: 'Mentalidad, investigación de mercado y tu primer producto validado.',
  },
  {
    mes: 2,
    titulo: 'Tienda y creativos',
    foco: 'Montar la tienda, la landing que vende y tus primeros creativos.',
  },
  {
    mes: 3,
    titulo: 'Pauta y escalar',
    foco: 'Campañas, lectura de métricas y escalar lo que ya funciona.',
  },
];
