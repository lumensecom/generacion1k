'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, Circle, Download, FileText, Link2, PlayCircle, Video as VideoIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TheoryRenderer } from '@/components/portal/TheoryRenderer';
import { markVideoWatched, togglePracticeItem, saveNotes, markModuleCompleted } from '@/app/portal/modulos/actions';
import { cn } from '@/lib/utils';
import type { ModuleResource, ModuleRow, StudentProgress, TheoryBlock } from '@/lib/types';

function loomEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://www.loom.com/embed/${match[1]}`;
}

export function ModuleTabsClient({
  module: mod,
  resources,
  progress,
  prevSlug,
  nextSlug,
}: {
  module: ModuleRow;
  resources: ModuleResource[];
  progress: StudentProgress | null;
  prevSlug: string | null;
  nextSlug: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [videoWatched, setVideoWatched] = useState(Boolean(progress?.video_watched));
  const [checked, setChecked] = useState<Set<number>>(
    new Set(((progress?.practice_checked_items as unknown as number[]) ?? []))
  );
  const [completed, setCompleted] = useState(Boolean(progress?.module_completed));
  const [notes, setNotes] = useState(progress?.student_notes ?? '');
  const notesTimer = useRef<ReturnType<typeof setTimeout>>();

  const checklist = (mod.practice_checklist as unknown as string[]) ?? [];
  const embedUrl = loomEmbedUrl(mod.loom_url);
  const theoryBlocks = (mod.theory_content as unknown as TheoryBlock[]) ?? [];

  function handleNotesChange(value: string) {
    setNotes(value);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      startTransition(async () => {
        await saveNotes(mod.slug, value);
      });
    }, 900);
  }

  useEffect(() => () => notesTimer.current && clearTimeout(notesTimer.current), []);

  function handleMarkVideo() {
    setVideoWatched(true);
    startTransition(async () => {
      await markVideoWatched(mod.slug);
    });
  }

  function handleToggleItem(idx: number) {
    const next = new Set(checked);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setChecked(next);
    startTransition(async () => {
      const result = await togglePracticeItem(mod.slug, idx, checklist.length);
      if (result?.practiceCompleted) toast.success('¡Práctica completada!');
    });
  }

  function handleComplete() {
    setCompleted(true);
    startTransition(async () => {
      await markModuleCompleted(mod.slug);
      toast.success('Módulo marcado como completado');
      if (nextSlug) router.push(`/portal/modulos/${nextSlug}`);
    });
  }

  return (
    <div>
      <Tabs defaultValue="teoria">
        <TabsList className="mb-8 flex-wrap">
          <TabsTrigger value="teoria">Teoría</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="practica">Práctica</TabsTrigger>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
        </TabsList>

        <TabsContent value="teoria">
          <TheoryRenderer blocks={theoryBlocks} />
        </TabsContent>

        <TabsContent value="video">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-bg-card">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                frameBorder="0"
                allowFullScreen
                className="h-full w-full"
                title={mod.title}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-text-muted">
                <VideoIcon className="h-8 w-8" />
                <p className="text-sm">Video en camino — Juan lo está grabando.</p>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant={videoWatched ? 'subtle' : 'primary'}
            className="mt-5"
            onClick={handleMarkVideo}
            disabled={videoWatched || pending}
          >
            {videoWatched ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-brand-success" /> Video visto
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" /> Marcar video como visto
              </>
            )}
          </Button>

          <div className="mt-8">
            <p className="mb-2 text-sm font-bold text-text-secondary">Tus notas (privadas, solo tú y Juan)</p>
            <Textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Escribe lo que quieras recordar de este módulo…"
            />
          </div>
        </TabsContent>

        <TabsContent value="practica">
          {checklist.length === 0 ? (
            <p className="text-sm text-text-secondary">Este módulo todavía no tiene práctica asignada.</p>
          ) : (
            <div className="space-y-3">
              {checklist.map((item, idx) => {
                const isChecked = checked.has(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleItem(idx)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border px-5 py-4 text-left text-sm transition-colors',
                      isChecked
                        ? 'border-brand-success/40 bg-brand-success/8 text-white'
                        : 'border-border bg-bg-card text-text-secondary hover:border-brand-purple/40'
                    )}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-success" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-text-muted" />
                    )}
                    {item}
                  </button>
                );
              })}
              <p className="pt-2 text-xs text-text-muted">
                {checked.size} de {checklist.length} completados
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recursos">
          {resources.length === 0 ? (
            <p className="text-sm text-text-secondary">Todavía no hay recursos para este módulo.</p>
          ) : (
            <div className="space-y-3">
              {resources.map((r) => (
                <a
                  key={r.id}
                  href={r.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-border bg-bg-card px-5 py-4 transition-colors hover:border-brand-purple/40"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    {r.file_type === 'link' ? (
                      <Link2 className="h-4 w-4 text-brand-purpleLight" />
                    ) : (
                      <FileText className="h-4 w-4 text-brand-purpleLight" />
                    )}
                    {r.name}
                  </span>
                  <Download className="h-4 w-4 text-text-muted" />
                </a>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-8">
        {prevSlug ? (
          <Link href={`/portal/modulos/${prevSlug}`}>
            <Button type="button" variant="ghost">
              ← Módulo anterior
            </Button>
          </Link>
        ) : (
          <span />
        )}

        <Button type="button" onClick={handleComplete} disabled={completed || pending} size="lg">
          {completed ? 'Completado ✓' : nextSlug ? 'Marcar completado y continuar →' : 'Marcar completado'}
        </Button>
      </div>
    </div>
  );
}
