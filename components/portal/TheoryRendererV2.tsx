import { AnimatedHeading } from '@/components/animated/AnimatedHeading';
import { AnimatedParagraph } from '@/components/animated/AnimatedParagraph';
import { AnimatedList } from '@/components/animated/AnimatedList';
import { StatCard } from '@/components/animated/StatCard';
import { ComparisonBlock } from '@/components/animated/ComparisonBlock';
import { Timeline } from '@/components/animated/Timeline';
import { AnimatedDiagram } from '@/components/animated/AnimatedDiagram';
import { InfoCallout } from '@/components/animated/InfoCallout';
import { ExampleCard } from '@/components/animated/ExampleCard';
import { ToolCard } from '@/components/animated/ToolCard';
import { ToolExplainer } from '@/components/animated/explainers/ToolExplainer';
import type { TheoryBlock2 } from '@/lib/modules-content';

export function TheoryRendererV2({ blocks, accentColor }: { blocks: TheoryBlock2[]; accentColor: string }) {
  return (
    <div className="space-y-9">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <AnimatedHeading key={i} level={block.level ?? 2}>
                {block.text}
              </AnimatedHeading>
            );

          case 'paragraph':
            return <AnimatedParagraph key={i}>{block.content}</AnimatedParagraph>;

          case 'list':
            return <AnimatedList key={i} type={block.variant} items={block.items} accentColor={accentColor} />;

          case 'stats':
            return (
              <div key={i} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {block.items.map((stat, j) => (
                  <StatCard
                    key={j}
                    number={stat.number}
                    label={stat.label}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    accentColor={accentColor}
                  />
                ))}
              </div>
            );

          case 'diagram':
            return (
              <div key={i} className="rounded-2xl border border-border bg-bg-card p-6">
                <AnimatedDiagram steps={block.steps} accentColor={accentColor} />
              </div>
            );

          case 'callout':
            return (
              <InfoCallout key={i} type={block.variant}>
                {block.content}
              </InfoCallout>
            );

          case 'example':
            return (
              <ExampleCard key={i} company={block.company} accentColor={accentColor}>
                {block.content}
              </ExampleCard>
            );

          case 'comparison':
            return <ComparisonBlock key={i} columns={block.columns} />;

          case 'timeline':
            return <Timeline key={i} steps={block.steps} accentColor={accentColor} />;

          case 'toolExplainer':
            return <ToolExplainer key={i} tool={block.tool} accentColor={accentColor} />;

          case 'toolGrid':
            return (
              <div key={i}>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-text-muted">Herramientas</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {block.tools.map((tool) => (
                    <ToolCard key={tool.name} {...tool} accentColor={accentColor} />
                  ))}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
