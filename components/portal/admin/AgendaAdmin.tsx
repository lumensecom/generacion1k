'use client';

import { useState, useMemo, useTransition } from 'react';
import { CalendarPlus, Plus, Trash2, Check, AlertTriangle, UserCircle } from 'lucide-react';
import { programarSesionesAdmin } from '@/app/portal/admin/actions';
import { Agenda } from '@/components/portal/Agenda';
import { Button } from '@/components/ui/button';
import { plan as buscarPlan } from '@/lib/planes';
import {
  type Franja,
  type EventoAgenda,
  DIAS_SEMANA,
  construirAgenda,
  fechaDesdeInput,
  fechasDelPatron,
  franjaValida,
  claveFranja,
  fechaCorta,
  hora as formatearHora,
  diaISO,
} from '@/lib/agenda';
import type { Student, OneOnOneSession, GroupSession } from '@/lib/types';

const campo =
  'mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-[13.5px] text-white outline-none focus:border-brand-purple/60';

/** El lunes que viene: el arranque natural de un patrón semanal. */
function proximoLunes(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((8 - diaISO(d)) % 7 || 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Tres 1:1 a la semana es el ritmo del programa. Se pueden quitar o añadir,
// pero el formulario abre con las tres puestas para no teclear de más.
const FRANJAS_INICIALES: Franja[] = [
  { dia: 1, hora: '19:00' },
  { dia: 3, hora: '19:00' },
  { dia: 5, hora: '19:00' },
];

export function AgendaAdmin({
  estudiantes,
  sesiones,
  clases,
}: {
  estudiantes: Student[];
  sesiones: OneOnOneSession[];
  clases: GroupSession[];
}) {
  const [studentId, setStudentId] = useState(estudiantes[0]?.id ?? '');
  const estudiante = estudiantes.find((e) => e.id === studentId) ?? null;

  const eventos: EventoAgenda[] = useMemo(() => {
    const suyas = sesiones.filter((s) => s.student_id === studentId);
    // Juan no propone temas: eso es del estudiante, y la acción lo rechazaría.
    return construirAgenda(suyas, clases).map((e) => ({ ...e, puedeProponerTema: false }));
  }, [sesiones, clases, studentId]);

  const suyasCount = sesiones.filter((s) => s.student_id === studentId).length;

  if (estudiantes.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-bg-card px-5 py-8 text-center text-[14px] text-text-muted">
        Todavía no hay estudiantes. Créalos en Admin → Estudiantes y vuelve aquí a agendarles.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <label className="block rounded-2xl border border-brand-yellow/25 bg-brand-yellow/[0.04] p-5">
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-brand-yellow">
          <UserCircle className="h-3.5 w-3.5" /> Estudiante
        </span>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className={campo}
        >
          {estudiantes.map((e) => (
            <option key={e.id} value={e.id}>
              {e.full_name} — {e.email}
            </option>
          ))}
        </select>
        <span className="mt-2 block text-[12.5px] text-text-muted">
          {suyasCount > 0
            ? `${suyasCount} sesiones 1:1 agendadas. El calendario de abajo es el suyo.`
            : 'Sin sesiones todavía. Agéndaselas con el formulario de abajo.'}
        </span>
      </label>

      {estudiante && <ProgramarSesiones estudiante={estudiante} yaHay={suyasCount} />}

      <div>
        <h2 className="mb-4 font-display text-lg font-extrabold tracking-tight">
          Calendario de {estudiante?.full_name.split(' ')[0] ?? '—'}
        </h2>
        <Agenda eventos={eventos} />
      </div>
    </div>
  );
}

function ProgramarSesiones({ estudiante, yaHay }: { estudiante: Student; yaHay: number }) {
  const [franjas, setFranjas] = useState<Franja[]>(FRANJAS_INICIALES);
  const [desde, setDesde] = useState(proximoLunes);
  const [semanas, setSemanas] = useState(() => (buscarPlan(estudiante.plan)?.meses ?? 3) * 4);
  const [reemplazar, setReemplazar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const cambiar = (i: number, cambios: Partial<Franja>) =>
    setFranjas((f) => f.map((x, j) => (j === i ? { ...x, ...cambios } : x)));

  // La vista previa usa las mismas funciones que el servidor, así que lo que
  // se lee aquí es exactamente lo que se va a guardar.
  const previa = useMemo(() => {
    const base = fechaDesdeInput(desde);
    if (!base || semanas < 1) return null;
    const validas = franjas.filter(franjaValida);
    if (validas.length === 0) return null;
    const repetidas = new Set(validas.map(claveFranja)).size !== validas.length;
    const fechas = fechasDelPatron(base, validas, semanas);
    if (fechas.length === 0) return null;
    return { fechas, repetidas };
  }, [desde, franjas, semanas]);

  function enviar(formData: FormData) {
    setError(null);
    setOk(null);
    formData.set('studentId', estudiante.id);
    start(async () => {
      const r = await programarSesionesAdmin(formData);
      if (r?.error) setError(r.error);
      else if (r?.ok) {
        setOk(r.ok);
        setReemplazar(false);
      }
    });
  }

  return (
    <form action={enviar} className="rounded-2xl border border-brand-purple/25 bg-brand-purple/[0.05] p-6">
      <h2 className="flex items-center gap-2 font-display text-base font-extrabold">
        <CalendarPlus className="h-4 w-4 text-brand-purpleLight" /> Agendar sesiones 1:1
      </h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
        Elige el día y la hora de cada 1:1 de la semana. Ese patrón se repite hasta completar
        las semanas del plan. La clase grupal es aparte y le sale a todos.
      </p>

      <div className="mt-5 space-y-3">
        {franjas.map((f, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3">
            <span className="mb-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.07] font-mono text-[11px] text-text-secondary">
              {i + 1}
            </span>
            <label className="min-w-[130px] flex-1">
              <span className="text-[12.5px] font-bold text-text-secondary">Día</span>
              <select
                name="dia"
                value={f.dia}
                onChange={(e) => cambiar(i, { dia: Number(e.target.value) })}
                className={campo}
              >
                {DIAS_SEMANA.map((d) => (
                  <option key={d.valor} value={d.valor}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="w-[130px]">
              <span className="text-[12.5px] font-bold text-text-secondary">Hora</span>
              <input
                type="time"
                name="hora"
                value={f.hora}
                onChange={(e) => cambiar(i, { hora: e.target.value })}
                className={campo}
              />
            </label>
            <button
              type="button"
              onClick={() => setFranjas((x) => x.filter((_, j) => j !== i))}
              disabled={franjas.length === 1}
              aria-label={`Quitar la sesión ${i + 1}`}
              className="mb-1 rounded-lg p-2.5 text-text-muted transition-colors hover:bg-brand-danger/10 hover:text-brand-danger disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {franjas.length < 7 && (
        <button
          type="button"
          onClick={() => setFranjas((f) => [...f, { dia: 1, hora: '19:00' }])}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-semibold text-text-secondary transition-colors hover:border-brand-purple/50 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Añadir otra sesión semanal
        </button>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Desde</span>
          <input
            type="date"
            name="desde"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className={campo}
          />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Semanas</span>
          <input
            type="number"
            name="semanas"
            min={1}
            max={52}
            value={semanas}
            onChange={(e) => setSemanas(Number(e.target.value))}
            className={campo}
          />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Duración (min)</span>
          <select name="duracion" defaultValue={90} className={campo}>
            <option value={60}>60</option>
            <option value={90}>90</option>
            <option value={120}>120</option>
          </select>
        </label>
      </div>

      {previa && (
        <div className="mt-5 rounded-xl border border-border bg-bg-secondary/60 p-4">
          {previa.repetidas ? (
            <p className="flex items-center gap-2 text-[13px] text-brand-danger">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Hay dos horarios repetidos el mismo
              día. Cambia uno.
            </p>
          ) : (
            <>
              <p className="text-[13.5px] text-white">
                <span className="font-mono font-bold text-brand-purpleLight">
                  {previa.fechas.length}
                </span>{' '}
                sesiones, del {fechaCorta(previa.fechas[0])} al{' '}
                {fechaCorta(previa.fechas[previa.fechas.length - 1])}.
              </p>
              <p className="mt-2 font-mono text-[11.5px] leading-relaxed text-text-muted">
                Primeras:{' '}
                {previa.fechas
                  .slice(0, 4)
                  .map((f) => `${fechaCorta(f)} ${formatearHora(f.toISOString())}`)
                  .join(' · ')}
                {previa.fechas.length > 4 && ' …'}
              </p>
            </>
          )}
        </div>
      )}

      {yaHay > 0 && (
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-bg-secondary/60 p-4">
          <input
            type="checkbox"
            name="reemplazar"
            checked={reemplazar}
            onChange={(e) => setReemplazar(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-brand-purple"
          />
          <span>
            <span className="block text-[13px] font-bold text-white">
              Reemplazar las sesiones futuras
            </span>
            <span className="mt-0.5 block text-[12.5px] leading-relaxed text-text-muted">
              Borra las que aún no han pasado y las vuelve a crear con este patrón. Las ya
              marcadas como hechas no se tocan. Sin esto, solo se añade lo que falte.
            </span>
          </span>
        </label>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2.5 text-[13px] text-brand-danger">
          {error}
        </p>
      )}
      {ok && (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-brand-success/30 bg-brand-success/10 px-4 py-2.5 text-[13px] text-brand-success">
          <Check className="h-4 w-4 shrink-0" /> {ok}
        </p>
      )}

      <Button type="submit" className="mt-5" disabled={pending || previa?.repetidas}>
        {pending ? 'Agendando…' : reemplazar ? 'Reemplazar y agendar' : 'Agendar sesiones'}
      </Button>
    </form>
  );
}
