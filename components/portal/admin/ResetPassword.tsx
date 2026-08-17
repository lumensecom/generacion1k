'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { KeyRound, Copy, Check } from 'lucide-react';
import { resetearPassword } from '@/app/portal/admin/actions';
import { Button } from '@/components/ui/button';

/**
 * Genera una contraseña nueva para quien perdió la suya.
 *
 * No hay recuperación por correo en el portal, así que este botón es el único
 * camino: sin él, un estudiante que pierda la clave se queda fuera hasta que
 * Juan se meta a la base de datos.
 *
 * La contraseña se muestra UNA vez y hay que copiarla. De la base solo sale el
 * hash, así que si se cierra sin copiarla toca generar otra.
 */
export function ResetPassword({ studentId, nombre }: { studentId: string; nombre: string }) {
  const [nueva, setNueva] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [pending, start] = useTransition();

  function generar() {
    if (nueva && !confirm(`¿Generar otra contraseña para ${nombre}? La anterior dejará de servir.`)) {
      return;
    }
    start(async () => {
      const r = await resetearPassword(studentId);
      if (r?.error) {
        toast.error(r.error);
        return;
      }
      setNueva(r.ok?.password ?? null);
      setCopiado(false);
    });
  }

  async function copiar() {
    if (!nueva) return;
    try {
      await navigator.clipboard.writeText(nueva);
      setCopiado(true);
      toast.success('Contraseña copiada');
    } catch {
      toast.error('No se pudo copiar. Selecciónala y cópiala a mano.');
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-2">
      <Button type="button" variant="subtle" size="sm" onClick={generar} disabled={pending}>
        <KeyRound className="h-3.5 w-3.5" />
        {pending ? 'Generando…' : nueva ? 'Generar otra' : 'Nueva contraseña'}
      </Button>

      {nueva && (
        <div className="rounded-xl border border-brand-yellow/30 bg-brand-yellow/[0.07] px-4 py-3 text-right">
          <p className="font-mono text-[10px] uppercase tracking-wider text-brand-yellow">
            Cópiala ahora — no se vuelve a mostrar
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="select-all font-mono text-[15px] font-bold text-white">{nueva}</code>
            <button
              type="button"
              onClick={copiar}
              aria-label="Copiar contraseña"
              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              {copiado ? <Check className="h-4 w-4 text-brand-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
