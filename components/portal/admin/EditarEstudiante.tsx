'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, AlertTriangle, X } from 'lucide-react';
import { actualizarEstudiante, borrarEstudiante } from '@/app/portal/admin/actions';
import { Button } from '@/components/ui/button';
import type { Student } from '@/lib/types';

const campo =
  'mt-1.5 w-full rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-[13.5px] text-white outline-none focus:border-brand-purple/60';

/**
 * Editar los datos del estudiante y, por separado, borrarlo.
 *
 * El borrado vive en su propia zona y con otro color a propósito: desactivar
 * el acceso y borrar la cuenta se parecen al leerlos por encima, y son cosas
 * muy distintas. Una se deshace con un clic; la otra no se deshace.
 */
export function EditarEstudiante({ student }: { student: Student }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [zonaBorrado, setZonaBorrado] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function guardar(fd: FormData) {
    setError(null);
    fd.set('id', student.id);
    start(async () => {
      const r = await actualizarEstudiante(fd);
      if (r?.error) return setError(r.error);
      toast.success(r?.ok ?? 'Guardado');
      setAbierto(false);
      router.refresh();
    });
  }

  function borrar() {
    setError(null);
    start(async () => {
      const r = await borrarEstudiante(student.id, confirmacion);
      if (r?.error) return setError(r.error);
      toast.success(r?.ok ?? 'Borrado');
      router.push('/portal/admin');
    });
  }

  if (!abierto) {
    return (
      <Button type="button" variant="subtle" size="sm" onClick={() => setAbierto(true)}>
        <Pencil className="h-3.5 w-3.5" /> Editar datos
      </Button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-base font-extrabold">Datos del estudiante</h3>
        <button
          type="button"
          onClick={() => { setAbierto(false); setZonaBorrado(false); setError(null); }}
          aria-label="Cerrar"
          className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form action={guardar} className="space-y-4">
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">Nombre completo</span>
          <input name="fullName" defaultValue={student.full_name} className={campo} />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">
            Correo <span className="font-normal text-text-muted">— es con lo que entra al portal</span>
          </span>
          <input name="email" type="email" defaultValue={student.email} className={campo} />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-bold text-text-secondary">
            WhatsApp <span className="font-normal text-text-muted">(opcional)</span>
          </span>
          <input name="phone" defaultValue={student.phone ?? ''} placeholder="+57…" className={campo} />
        </label>

        {error && !zonaBorrado && (
          <p className="rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2.5 text-[13px] text-brand-danger">
            {error}
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </form>

      {/* ---- Zona de borrado ---- */}
      <div className="mt-8 rounded-xl border border-brand-danger/30 bg-brand-danger/[0.05] p-5">
        <p className="flex items-center gap-2 font-display text-[14px] font-extrabold text-brand-danger">
          <AlertTriangle className="h-4 w-4" /> Borrar la cuenta
        </p>

        {!zonaBorrado ? (
          <>
            <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
              Si solo quieres que no pueda entrar, usa{' '}
              <strong className="text-white">Desactivar acceso</strong>: se deshace cuando quieras
              y conserva todo su progreso. Borrar es definitivo.
            </p>
            <button
              type="button"
              onClick={() => setZonaBorrado(true)}
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-danger transition-opacity hover:opacity-75"
            >
              <Trash2 className="h-3.5 w-3.5" /> Quiero borrarla de todas formas
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
              Se borra <strong className="text-white">todo su rastro</strong> y no hay forma de
              recuperarlo: progreso y lecciones, intentos de test, check-ins y racha, preguntas,
              reuniones, sesiones 1:1, votos de encuesta y su actividad.
            </p>
            <label className="mt-4 block">
              <span className="text-[12.5px] font-bold text-text-secondary">
                Escribe <code className="font-mono text-white">{student.email}</code> para confirmar
              </span>
              <input
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                autoComplete="off"
                className={campo}
              />
            </label>

            {error && (
              <p className="mt-3 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2.5 text-[13px] text-brand-danger">
                {error}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="danger"
                onClick={borrar}
                disabled={pending || confirmacion.trim().toLowerCase() !== student.email.toLowerCase()}
              >
                <Trash2 className="h-4 w-4" /> {pending ? 'Borrando…' : 'Borrar definitivamente'}
              </Button>
              <Button type="button" variant="subtle" onClick={() => { setZonaBorrado(false); setError(null); }}>
                Cancelar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
