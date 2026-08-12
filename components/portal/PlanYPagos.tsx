import { Wallet, CalendarRange, CheckCircle2 } from 'lucide-react';
import { plan as buscarPlan, sesionesDelEstudiante, formatearDinero, estadoDePago } from '@/lib/planes';
import type { Student } from '@/lib/types';

/**
 * Resumen del plan y del estado de pago que ve el estudiante en su perfil.
 * Solo lectura: los importes los edita Juan desde el panel de admin.
 */
export function PlanYPagos({ student }: { student: Student }) {
  const p = buscarPlan(student.plan);
  const sesiones = sesionesDelEstudiante(student.plan, student.sessions_total);
  const pago = estadoDePago(student.amount_paid_cents, student.amount_total_cents);
  const pendiente = Math.max(0, student.amount_total_cents - student.amount_paid_cents);

  if (!p) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-6">
        <p className="text-[14px] text-text-muted">
          Tu plan todavía no está asignado. Juan lo configura al confirmar tu cupo.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-brand-purple/25 bg-gradient-to-b from-brand-purple/[0.08] to-transparent p-6">
        <CalendarRange className="mb-3 h-5 w-5 text-brand-purpleLight" />
        <h3 className="font-display text-lg font-extrabold tracking-tight">{p.nombre}</h3>
        <p className="mt-1 text-[13.5px] text-text-secondary">
          {p.meses} meses · {sesiones} sesiones 1:1
        </p>
        {student.plan_started_at && (
          <p className="mt-3 font-mono text-[11.5px] text-text-muted">
            Empezaste el{' '}
            {new Date(`${student.plan_started_at}T12:00:00`).toLocaleDateString('es-CO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-bg-card p-6">
        <Wallet className="mb-3 h-5 w-5 text-brand-yellow" />
        <h3 className="font-display text-lg font-extrabold tracking-tight">Pagos</h3>

        {student.amount_total_cents > 0 ? (
          <>
            <p className="mt-1 text-[13.5px] text-text-secondary">
              <span className="font-mono text-white">
                {formatearDinero(student.amount_paid_cents, student.currency)}
              </span>{' '}
              de {formatearDinero(student.amount_total_cents, student.currency)}
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className={pago.alDia ? 'h-full bg-brand-success' : 'h-full bg-brand-yellow'}
                style={{ width: `${pago.pct}%` }}
              />
            </div>

            <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px]">
              {pago.alDia ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-success" />
                  <span className="text-brand-success">{pago.etiqueta}</span>
                </>
              ) : (
                <span className="text-text-muted">
                  {pago.etiqueta} · quedan {formatearDinero(pendiente, student.currency)}
                </span>
              )}
            </p>
          </>
        ) : (
          <p className="mt-1 text-[13.5px] text-text-muted">Sin importe registrado todavía.</p>
        )}

        {student.payment_notes && (
          <p className="mt-4 whitespace-pre-wrap border-t border-border/70 pt-3 text-[12.5px] leading-relaxed text-text-secondary">
            {student.payment_notes}
          </p>
        )}
      </div>
    </div>
  );
}
