import Link from 'next/link';
import { LayoutGrid, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Las dos caras del programa: los módulos, que se recorren en orden y se
 * aprueban, y los frameworks, que son procesos a los que se vuelve.
 *
 * Son enlaces y no estado de cliente para que cada una tenga su URL: un
 * framework se comparte y se abre desde el móvil a mitad de una tarea.
 */
export function PestanasPrograma({ activa }: { activa: 'modulos' | 'frameworks' }) {
  const items = [
    { id: 'modulos', href: '/portal/modulos', label: 'Módulos', icon: LayoutGrid },
    { id: 'frameworks', href: '/portal/frameworks', label: 'Frameworks', icon: Workflow },
  ] as const;

  return (
    <div className="mb-8 inline-flex gap-1.5 rounded-2xl border border-light-border bg-light-card p-1.5">
      {items.map((i) => (
        <Link
          key={i.id}
          href={i.href}
          className={cn(
            'flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-bold transition-colors',
            activa === i.id
              ? 'bg-brand-purple text-white'
              : 'text-light-text2 hover:text-light-text'
          )}
        >
          <i.icon className="h-4 w-4" /> {i.label}
        </Link>
      ))}
    </div>
  );
}
