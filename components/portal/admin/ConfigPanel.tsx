'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { toggleActiveGeneration, updateAccessCode, updateOnboardingVideo } from '@/app/portal/admin/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function ConfigPanel({
  initialActive,
  initialCode,
  initialVideo,
  generation,
}: {
  initialActive: boolean;
  initialCode: string;
  initialVideo: string;
  generation: string;
}) {
  const [active, setActive] = useState(initialActive);
  const [code, setCode] = useState(initialCode);
  const [video, setVideo] = useState(initialVideo);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      await toggleActiveGeneration(next);
      toast.success(next ? 'Acceso abierto para la generación' : 'Acceso cerrado — nadie más podrá entrar con la clave');
    });
  }

  function handleSaveCode() {
    setError(null);
    startTransition(async () => {
      const result = await updateAccessCode(code);
      if (result?.error) setError(result.error);
      else toast.success('Clave de acceso actualizada');
    });
  }

  function handleSaveVideo() {
    setError(null);
    startTransition(async () => {
      const result = await updateOnboardingVideo(video);
      if (result?.error) setError(result.error);
      else toast.success(video.trim() ? 'Video de bienvenida actualizado' : 'Video de bienvenida quitado');
    });
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="rounded-2xl border border-border bg-bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-sm font-extrabold">Acceso de la generación {generation}</p>
            <p className="mt-1 text-xs text-text-muted">
              Si lo desactivas, nadie nuevo podrá entrar con la clave — los que ya tienen sesión no se ven afectados.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            disabled={pending}
            className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${
              active ? 'bg-brand-success' : 'bg-white/15'
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg-card p-6">
        <Label htmlFor="accessCode">Clave de acceso general</Label>
        <div className="mt-2 flex gap-2">
          <Input id="accessCode" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="button" variant="subtle" onClick={handleSaveCode} disabled={pending}>
            Guardar
          </Button>
        </div>
        {error && <p className="mt-2 text-sm font-medium text-brand-danger">{error}</p>}
        <p className="mt-2 text-xs text-text-muted">Compártela con los nuevos estudiantes al confirmar su cupo.</p>
      </div>

      <div className="rounded-2xl border border-border bg-bg-card p-6">
        <Label htmlFor="onboardingVideo">Video de bienvenida</Label>
        <div className="mt-2 flex gap-2">
          <Input
            id="onboardingVideo"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://res.cloudinary.com/.../video/upload/..."
          />
          <Button type="button" variant="subtle" onClick={handleSaveVideo} disabled={pending}>
            Guardar
          </Button>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Es la primera pantalla del estudiante después del cuestionario, y no puede entrar al
          resto del portal sin terminarlo. Si lo dejas vacío, la pantalla deja pasar sin más.
        </p>
      </div>
    </div>
  );
}
