'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { LayoutDashboard, BookOpen, TrendingUp, Users, UserCircle, ShieldCheck, LogOut, CalendarDays, LifeBuoy } from 'lucide-react';
import { logoutAction } from '@/app/portal/actions';
import { cn } from '@/lib/utils';

const links = [
  { href: '/portal/inicio', label: 'Inicio', icon: LayoutDashboard },
  { href: '/portal/modulos', label: 'Módulos', icon: BookOpen },
  { href: '/portal/mi-progreso', label: 'Mi progreso', icon: TrendingUp },
  { href: '/portal/clases', label: 'Clase grupal', icon: CalendarDays },
  { href: '/portal/ayuda', label: 'Ayuda', icon: LifeBuoy },
  { href: '/portal/mentores', label: 'Aliado', icon: Users },
  { href: '/portal/perfil', label: 'Perfil', icon: UserCircle },
];

export function PortalNav({ name, role }: { name: string; role: 'student' | 'admin' }) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-bg-primary/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/portal/inicio" className="flex flex-shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-pink font-display text-xs font-extrabold text-white">
            1K
          </span>
          <span className="hidden font-display text-sm font-extrabold tracking-tight sm:inline">
            Generación<span className="text-brand-purpleLight">Elite</span>
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors',
                  active ? 'bg-brand-purple/15 text-brand-purpleLight' : 'text-text-secondary hover:text-white'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
          {role === 'admin' && (
            <Link
              href="/portal/admin"
              className={cn(
                'flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors',
                pathname.startsWith('/portal/admin')
                  ? 'bg-brand-yellow/15 text-brand-yellow'
                  : 'text-brand-yellow/80 hover:text-brand-yellow'
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="hidden text-xs font-semibold text-text-secondary md:inline">{name.split(' ')[0]}</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => logoutAction())}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-text-muted transition-colors hover:border-brand-danger/40 hover:text-brand-danger"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
