'use client';

import { useState, useTransition } from 'react';
import { UserPlus, Copy, Check, KeyRound } from 'lucide-react';
import { crearEstudiante } from '@/app/portal/admin/actions';
import { Button } from '@/components/ui/button';

/**
 * Alta de estudiantes desde el panel.
 *
 * La contraseña se muestra UNA sola vez, al crearla: a partir de ahí solo
 * queda el hash en la base y no hay forma de recuperarla. De ahí el aviso
 * y el botón de copiar — si Juan cierra esto sin copiarla, toca resetearla.
 */
export function CrearEstudiante() {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creado, setCreado] = useState<{ email: string; password: string; nombre: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [pending, start] = useTransition();

  function enviar(formData: FormData) {
    setError(null);
    start(async () => {
      const r = await crearEstudiante(formData);
      if (r.error) return setError(r.error);
      if (r.ok) {
        setCreado(r.ok);
        setAbierto(false);
      }
    });
  }

  async function copiar() {
    if (!creado) return;
    const texto = `Portal Generación 1K\nCorreo: ${creado.email}\nContraseña: ${creado.password}`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Portapapeles bloqueado: el texto sigue visible y seleccionable.
    }
  }

  return (
    <div className="mb-6">
      {creado && (
        <div className="mb-5 rounded-2xl border border-brand-success/35 bg-brand-success/[0.08] p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-extrabold text-brand-success">
            <KeyRound className="h-4 w-4" /> Cuenta creada para {creado.nombre}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
            Cópiale estos datos ahora y mándaselos. La contraseña no se puede volver a ver —
            si la pierdes, tendrás que generarle una nueva.
          </p>
          <div className="mt-4 space-y-2 rounded-xl border border-border bg-bg-primary p-4 font-mono text-[13px]">
            <p>
              <span className="text-text-muted">Correo: </span>
              <span className="select-all text-white">{creado.email}</span>
            </p>
            <p>
              <span className="text-text-muted">Contraseña: </span>
              <span className="select-all text-brand-yellow">{creado.password}</span>
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" onClick={copiar} variant="subtle">
              {copiado ? <Check className="mr-2 h-4 w-4 text-brand-success" /> : <Copy className="mr-2 h-4 w-4" />}
              {copiado ? 'Copiado' : 'Copiar datos'}
            </Button>
            <Button type="button" variant="subtle" onClick={() => setCreado(null)}>
              Ya los guardé
            </Button>
          </div>
        </div>
      )}

      {!abierto ? (
        <Button type="button" onClick={() => setAbierto(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Crear estudiante
        </Button>
      ) : (
        <form action={enviar} className="rounded-2xl border border-border bg-bg-card p-6">
          <h3 className="font-display text-base font-extrabold">Nuevo estudiante</h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[12.5px] font-bold text-text-secondary">Nombre completo</span>
              <input
                name="fullName"
                required
                minLength={2}
                className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-4 py-2.5 text-[14px] text-white outline-none focus:border-brand-purple/60"
              />
            </label>
            <label className="block">
              <span className="text-[12.5px] font-bold text-text-secondary">Correo</span>
              <input
                name="email"
                type="email"
                required
                className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-4 py-2.5 text-[14px] text-white outline-none focus:border-brand-purple/60"
              />
            </label>
            <label className="block">
              <span className="text-[12.5px] font-bold text-text-secondary">
                WhatsApp <span className="font-normal text-text-muted">(opcional)</span>
              </span>
              <input
                name="phone"
                className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-4 py-2.5 text-[14px] text-white outline-none focus:border-brand-purple/60"
              />
            </label>
            <label className="block">
              <span className="text-[12.5px] font-bold text-text-secondary">
                Contraseña <span className="font-normal text-text-muted">(vacío = se genera sola)</span>
              </span>
              <input
                name="password"
                minLength={8}
                placeholder="mínimo 8 caracteres"
                className="mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-4 py-2.5 text-[14px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2.5 text-[13px] text-brand-danger">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? 'Creando…' : 'Crear cuenta'}
            </Button>
            <Button type="button" variant="subtle" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
