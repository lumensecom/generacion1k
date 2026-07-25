import { AlertTriangle, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { FadeInText } from '@/components/animated/FadeInText';
import { SlideInBlock } from '@/components/animated/SlideInBlock';
import { StaggerList } from '@/components/animated/StaggerList';
import { AnimatedNumber } from '@/components/animated/AnimatedNumber';
import { cn } from '@/lib/utils';
import type { TheoryBlock } from '@/lib/types';

const calloutMeta = {
  yellow: { icon: Sparkles, cls: 'border-brand-yellow/35 bg-brand-yellow/8 text-brand-yellow' },
  green: { icon: CheckCircle2, cls: 'border-brand-success/35 bg-brand-success/8 text-brand-success' },
  red: { icon: AlertTriangle, cls: 'border-brand-danger/35 bg-brand-danger/8 text-brand-danger' },
  purple: { icon: Info, cls: 'border-brand-purple/35 bg-brand-purple/8 text-brand-purpleLight' },
} as const;

export function TheoryRenderer({ blocks }: { blocks: TheoryBlock[] }) {
  if (!blocks || blocks.length === 0) {
    return <p className="text-sm text-text-secondary">Este módulo todavía no tiene contenido teórico.</p>;
  }

  return (
    <div className="space-y-8">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'text':
            return (
              <FadeInText key={i} delay={i * 0.05}>
                {block.heading && (
                  <h3 className="mb-2 font-display text-lg font-extrabold tracking-tight">{block.heading}</h3>
                )}
                <p className="leading-relaxed text-text-secondary">{block.body}</p>
              </FadeInText>
            );

          case 'stat':
            return (
              <SlideInBlock key={i} delay={i * 0.05}>
                <div className="rounded-2xl border border-border bg-bg-card p-6 text-center">
                  <div className="font-mono text-4xl font-medium text-brand-yellow">
                    <AnimatedNumber value={parseFloat(block.number) || 0} suffix={block.number.replace(/^-?[\d.]+/, '')} />
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-widest text-text-muted">{block.label}</p>
                </div>
              </SlideInBlock>
            );

          case 'compare':
            return (
              <SlideInBlock key={i} delay={i * 0.05}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-white/2 p-5">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-brand-danger">Antes</p>
                    <ul className="space-y-2 text-sm text-text-muted">
                      {block.before.map((line, j) => (
                        <li key={j}>✗ {line}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-brand-purple/30 bg-brand-purple/8 p-5">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-brand-success">Después</p>
                    <ul className="space-y-2 text-sm font-medium text-white">
                      {block.after.map((line, j) => (
                        <li key={j}>✓ {line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </SlideInBlock>
            );

          case 'list':
            return (
              <div key={i}>
                {block.heading && <h3 className="mb-3 font-display text-lg font-extrabold">{block.heading}</h3>}
                <StaggerList
                  as="ul"
                  className="space-y-2"
                  itemClassName="flex items-start gap-2 text-sm text-text-secondary"
                >
                  {block.items.map((li, j) => (
                    <span key={j} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-purpleLight" />
                      {li}
                    </span>
                  ))}
                </StaggerList>
              </div>
            );

          case 'callout': {
            const meta = calloutMeta[block.variant];
            const Icon = meta.icon;
            return (
              <FadeInText key={i} delay={i * 0.05}>
                <div className={cn('flex items-start gap-3 rounded-2xl border p-5', meta.cls)}>
                  <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-medium leading-relaxed">{block.text}</p>
                </div>
              </FadeInText>
            );
          }

          case 'timeline':
            return (
              <div key={i} className="space-y-5 border-l border-border pl-6">
                {block.items.map((it, j) => (
                  <SlideInBlock key={j} delay={j * 0.08} className="relative">
                    <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-purpleLight" />
                    <p className="font-mono text-[10px] uppercase tracking-widest text-brand-purpleLight">
                      {it.label}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">{it.text}</p>
                  </SlideInBlock>
                ))}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
