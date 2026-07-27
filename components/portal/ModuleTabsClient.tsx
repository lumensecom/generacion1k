'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Download,
  Link2,
  PlayCircle,
  Rocket,
  Video as VideoIcon,
} from 'lucide-react';
import { TabsAnimated, TabPanel } from '@/components/animated/TabsAnimated';
import { InteractiveChecklist } from '@/components/animated/InteractiveChecklist';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TheoryRenderer } from '@/components/portal/TheoryRenderer';
import { TheoryRendererV2 } from '@/components/portal/TheoryRendererV2';
import { TestFlow } from '@/components/portal/TestFlow';
import { markVideoWatched, togglePracticeItem, saveNotes, markModuleCompleted } from '@/app/portal/modulos/actions';
import type { ModuleResource, ModuleRow, StudentProgress, TestAttemptRow, TheoryBlock } from '@/lib/types';
import type { ModuleContent } from '@/lib/modules-content';

function loomEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://www.loom.com/embed/${match[1]}`;
}

export function ModuleTabsClient({
  module: mod,
  content,
  resources,
  progress,
  latestAttempt,
  prevSlug,
  nextSlug,
}: {
  module: ModuleRow;
  content: ModuleContent | null;
  resources: ModuleResource[];
  progress: StudentProgress | null;
  latestAttempt: TestAttemptRow | null;
  prevSlug: string | null;
  nextSlug: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState('intro');
  const [videoWatched, setVideoWatched] = useState(Boolean(progress?.video_watched));
  const [checked, setChecked] = useState<Set<number>>(
    new Set(((progress?.practice_checked_items as unknown as number[]) ?? []))
  );
  const [completed, setCompleted] = useState(Boolean(progress?.module_completed));
  const [notes, setNotes] = useState(progress?.student_notes ?? '');
  const [retaking, setRetaking] = useState(!latestAttempt);
  const notesTimer = useRef<ReturnType<typeof setTimeout>>();

  const accentColor = content?.accentColor ?? '#7C3AED';
  const checklist = content?.practiceChecklist ?? ((mod.practice_checklist as unknown as string[]) ?? []);
  const embedUrl = loomEmbedUrl(mod.loom_url);
  const legacyTheoryBlocks = (mod.theory_content as unknown as TheoryBlock[]) ?? [];

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

  const tabs = [
    { value: 'intro', label: 'Introducción', icon: <Rocket className="h-3.5 w-3.5" /> },
    { value: 'teoria', label: 'Teoría', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { value: 'video', label: 'Video', icon: <VideoIcon className="h-3.5 w-3.5" /> },
    { value: 'practica', label: 'Práctica', icon: <ClipboardCheck className="h-3.5 w-3.5" /> },
    ...(content ? [{ value: 'test', label: 'Test', icon: <CheckCircle2 className="h-3.5 w-3.5" /> }] : []),
    { value: 'recursos', label: 'Recursos', icon: <FileText className="h-3.5 w-3.5" /> },
  ];

  return (
    <div>
      <TabsAnimated tabs={tabs} active={tab} onChange={setTab} accentColor={accentColor} className="mb-8" />

      <TabPanel value="intro" active={tab}>
        <div className="rounded-2xl border border-border bg-bg-card p-8 text-center sm:p-12">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-text-muted">
            Antes de empezar
          </p>
          <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            {content?.introLine1 ?? mod.title}
          </h2>
          {content?.introLine2 && <p className="mt-3 text-text-secondary">{content.introLine2}</p>}
          <Button type="button" size="lg" className="mt-8" onClick={() => setTab('teoria')}>
            Comenzar el módulo
          </Button>
        </div>
      </TabPanel>

      <TabPanel value="teoria" active={tab}>
        {content ? (
          <TheoryRendererV2 blocks={content.theory} accentColor={accentColor} />
        ) : (
          <TheoryRenderer blocks={legacyTheoryBlocks} />
        )}
      </TabPanel>

      <TabPanel value="video" active={tab}>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-bg-card">
          {embedUrl ? (
            <iframe src={embedUrl} frameBorder="0" allowFullScreen className="h-full w-full" title={mod.title} />
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
      </TabPanel>

      <TabPanel value="practica" active={tab}>
        {checklist.length === 0 ? (
          <p className="text-sm text-text-secondary">Este módulo todavía no tiene práctica asignada.</p>
        ) : (
          <InteractiveChecklist items={checklist} checked={checked} onToggle={handleToggleItem} accentColor={accentColor} />
        )}
      </TabPanel>

      {content && (
        <TabPanel value="test" active={tab}>
          {!retaking && latestAttempt ? (
            <div className="rounded-2xl border border-border bg-bg-card p-8 text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 font-mono text-lg font-medium text-white"
                style={{ borderColor: latestAttempt.passed ? '#10B981' : accentColor }}
              >
                {latestAttempt.score}/{latestAttempt.total_questions}
              </div>
              <h3 className="font-display text-xl font-extrabold text-white">
                {latestAttempt.passed ? 'Ya aprobaste este test' : 'Todavía no aprobaste este test'}
              </h3>
              <p className="mt-2 text-sm text-text-secondary">
                Intento #{latestAttempt.attempt_number} ·{' '}
                {new Date(latestAttempt.completed_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
              </p>
              <Button type="button" variant="ghost" className="mt-6" onClick={() => setRetaking(true)}>
                Volver a intentar
              </Button>
            </div>
          ) : (
            <TestFlow
              slug={mod.slug}
              questions={content.test}
              accentColor={accentColor}
              nextSlug={nextSlug}
              onReviewTheory={() => setTab('teoria')}
            />
          )}
        </TabPanel>
      )}

      <TabPanel value="recursos" active={tab}>
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
      </TabPanel>

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
