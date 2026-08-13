'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { ArrowRight, Lock, Check } from 'lucide-react';
import { marcarVideoVisto } from '@/app/portal/onboarding/actions';
import { VideoPlayer, puedeMedirProgreso } from '@/components/portal/VideoPlayer';
import { Button } from '@/components/ui/button';

// Se considera visto al 90%. Los últimos segundos suelen ser la despedida, y
// exigir el 100% deja el botón bloqueado a quien cierre un pelo antes.
const VISTO = 0.9;

export function OnboardingVideo({ url, nombre }: { url: string | null; nombre: string }) {
  // En un iframe de YouTube o Loom no hay forma de saber cuánto lleva visto.
  // En ese caso el botón sale abierto: es preferible a dejar encerrado a un
  // estudiante en una puerta que no puede cruzar. Igual pasa si Juan todavía
  // no ha pegado el enlace del video.
  const medible = !!url && puedeMedirProgreso(url);
  const [visto, setVisto] = useState(!medible);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Red de seguridad. La medición dentro del iframe de Bunny depende de que
  // su reproductor conteste por player.js, y eso no se puede dar por hecho:
  // basta un cambio suyo o una biblioteca configurada distinto para que no
  // llegue un solo evento. Si a los 75 segundos no ha llegado NINGUNO, la
  // integración está rota y el botón se abre.
  //
  // No es un agujero para saltarse el video: mientras lleguen eventos, la
  // puerta sigue cerrada hasta el 90%. Solo distingue "está rota" de "no la
  // ha visto", y ante la duda prefiere dejar entrar. Un estudiante atrapado
  // en una puerta que no puede cruzar es mucho peor que uno que se la salta.
  const huboEvento = useRef(false);
  useEffect(() => {
    if (!medible) return;
    const t = setTimeout(() => {
      if (!huboEvento.current) setVisto(true);
    }, 75_000);
    return () => clearTimeout(t);
  }, [medible]);

  function entrar() {
    setError(null);
    start(async () => {
      const r = await marcarVideoVisto();
      if (r?.error) setError(r.error);
    });
  }

  return (
    <div className="w-full max-w-3xl">
      <VideoPlayer
        url={url}
        titulo="Bienvenido a Generación 1K Elite"
        vacio="El video de bienvenida está en camino. Puedes entrar al portal mientras tanto."
        onProgreso={
          medible
            ? (f) => {
                huboEvento.current = true;
                if (f >= VISTO) setVisto(true);
              }
            : undefined
        }
      />

      <div className="mt-8 flex flex-col items-center gap-4">
        <Button type="button" onClick={entrar} disabled={!visto || pending} className="min-w-[260px]">
          {!visto ? (
            <>
              <Lock className="mr-2 h-4 w-4" /> Mira el video para continuar
            </>
          ) : (
            <>
              {pending ? 'Abriendo…' : 'Entrar al portal'}
              {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
            </>
          )}
        </Button>

        {medible && visto && (
          <p className="flex items-center gap-1.5 text-[13px] text-brand-success">
            <Check className="h-4 w-4" /> Listo, {nombre}. Ya tienes todo desbloqueado.
          </p>
        )}
        {medible && !visto && (
          <p className="text-[12.5px] text-text-muted">
            El botón se activa cuando termines el video.
          </p>
        )}
        {error && <p className="text-[13px] text-brand-danger">{error}</p>}
      </div>
    </div>
  );
}
