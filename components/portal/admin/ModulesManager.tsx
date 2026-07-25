'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { ChevronDown, Lock, Unlock } from 'lucide-react';
import { toggleModuleLock, updateModuleLoomUrl, updateModuleContent } from '@/app/portal/admin/actions';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ModuleRow } from '@/lib/types';

function ModuleEditor({ mod }: { mod: ModuleRow }) {
  const [loomUrl, setLoomUrl] = useState(mod.loom_url ?? '');
  const [theoryJson, setTheoryJson] = useState(JSON.stringify(mod.theory_content ?? [], null, 2));
  const [checklist, setChecklist] = useState(((mod.practice_checklist as unknown as string[]) ?? []).join('\n'));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function saveLoom() {
    startTransition(async () => {
      await updateModuleLoomUrl(mod.id, loomUrl);
      toast.success('Link de Loom guardado');
    });
  }

  function saveContent() {
    setError(null);
    startTransition(async () => {
      const result = await updateModuleContent(mod.id, theoryJson, checklist);
      if (result?.error) setError(result.error);
      else toast.success('Contenido del módulo guardado');
    });
  }

  return (
    <div className="space-y-5 border-t border-border p-6">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Link de Loom</label>
        <div className="flex gap-2">
          <Input value={loomUrl} onChange={(e) => setLoomUrl(e.target.value)} placeholder="https://www.loom.com/share/..." />
          <Button type="button" variant="subtle" onClick={saveLoom} disabled={pending}>
            Guardar
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
          Contenido teórico (JSON de bloques)
        </label>
        <Textarea
          value={theoryJson}
          onChange={(e) => setTheoryJson(e.target.value)}
          className="min-h-[180px] font-mono text-xs"
        />
        <p className="text-[11px] text-text-muted">
          Tipos soportados: text, stat, compare, list, callout, timeline. Ej: {'{"type":"callout","variant":"purple","text":"..."}'}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
          Checklist de práctica (un ítem por línea)
        </label>
        <Textarea value={checklist} onChange={(e) => setChecklist(e.target.value)} className="min-h-[120px]" />
      </div>

      {error && <p className="text-sm font-medium text-brand-danger">{error}</p>}

      <Button type="button" onClick={saveContent} disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar contenido'}
      </Button>
    </div>
  );
}

export function ModulesManager({ modules }: { modules: ModuleRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggleLock(mod: ModuleRow) {
    startTransition(async () => {
      await toggleModuleLock(mod.id, !mod.is_locked);
    });
  }

  return (
    <div className="space-y-3">
      {modules.map((mod) => {
        const open = openId === mod.id;
        return (
          <div key={mod.id} className="overflow-hidden rounded-2xl border border-border bg-bg-card">
            <div className="flex items-center gap-4 p-5">
              <span className="font-mono text-xs text-text-muted">{String(mod.order_index).padStart(2, '0')}</span>
              <div className="flex-1">
                <p className="font-display text-sm font-extrabold">{mod.title}</p>
                {mod.subtitle && <p className="text-xs text-text-muted">{mod.subtitle}</p>}
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleToggleLock(mod)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide',
                  mod.is_locked ? 'bg-brand-danger/12 text-brand-danger' : 'bg-brand-success/12 text-brand-success'
                )}
              >
                {mod.is_locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                {mod.is_locked ? 'Bloqueado' : 'Disponible'}
              </button>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : mod.id)}
                className="rounded-lg border border-border p-2 text-text-secondary hover:text-white"
                aria-label="Editar módulo"
              >
                <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
              </button>
            </div>
            {open && <ModuleEditor mod={mod} />}
          </div>
        );
      })}
    </div>
  );
}
