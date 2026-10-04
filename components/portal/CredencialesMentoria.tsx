'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Las llaves de la cuenta compartida de la mentoría.
 *
 * Va plegado porque no es lo primero que el estudiante necesita cada día,
 * pero abre en un clic desde el panel principal y no hay que ir a buscarlo a
 * ninguna otra pantalla.
 *
 * La contraseña llega como prop desde el servidor, nunca desde una constante
 * de cliente: un chunk de /_next/static/ se sirve sin sesión.
 */

export interface HerramientaVista {
  id: string;
  nombre: string;
  queHace: string;
  url: string;
  color: string;
  aPedido?: boolean;
}

export function CredencialesMentoria({
  correo,
  clave,
  activas,
  faltantes,
  aPedido,
  linkPedir,
}: {
  correo: string;
  clave: string;
  activas: HerramientaVista[];
  faltantes: HerramientaVista[];
  aPedido: HerramientaVista[];
  /** WhatsApp de Juan con el mensaje ya escrito. */
  linkPedir: string;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <section className="overflow-hidden rounded-3xl border border-brand-yellow/25 bg-gradient-to-br from-brand-yellow/[0.07] via-bg-card to-bg-card">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={abierto}
      >
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-brand-yellow/30 bg-brand-yellow/12 text-brand-yellow">
          <KeyRound className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[17px] font-extrabold tracking-tight">
            Tus herramientas de la mentoría
          </h2>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            {activas.length === 0
              ? 'Pide tus accesos por WhatsApp'
              : `${activas.map((h) => h.nombre).join(' · ')} — con la cuenta del programa`}
          </p>
        </div>

        <span
          className={cn(
            'flex-shrink-0 rounded-xl border border-brand-yellow/30 px-3.5 py-2 text-[12.5px] font-extrabold text-brand-yellow transition-colors',
            abierto && 'bg-brand-yellow/10'
          )}
        >
          {abierto ? 'Ocultar' : 'Ver accesos'}
        </span>
      </button>

      {abierto && (
        <div className="space-y-5 border-t border-white/8 px-6 pb-6 pt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <CampoCopiable etiqueta="Correo" valor={correo} />
            <CampoCopiable etiqueta="Contraseña" valor={clave} secreto />
          </div>

          <p className="rounded-xl border border-white/8 bg-bg-secondary px-4 py-3 text-[12.5px] leading-relaxed text-text-secondary">
            Es una cuenta de Google compartida con el resto del grupo. Entras con ese
            correo y esa clave, usas la herramienta y cierras sesión. No le cambies la
            contraseña ni la configuración: dejarías a tus compañeros por fuera.
          </p>

          {activas.length > 0 && (
            <div>
              <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                Activas para ti
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {activas.map((h) => (
                  <a
                    key={h.id}
                    href={h.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-start gap-3 rounded-2xl border border-border bg-bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-white/25"
                  >
                    <span
                      className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: h.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-[14px] font-extrabold">
                        {h.nombre}
                        <ExternalLink className="h-3 w-3 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                      <span className="mt-1 block text-[12.5px] leading-snug text-text-secondary">
                        {h.queHace}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {(faltantes.length > 0 || aPedido.length > 0) && (
            <div>
              <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                Se piden a Juan
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[...faltantes, ...aPedido].map((h) => (
                  <div
                    key={h.id}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-bg-card/60 p-4"
                  >
                    <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-text-muted" />
                    <div className="min-w-0 flex-1">
                      <span className="block text-[14px] font-extrabold text-text-secondary">
                        {h.nombre}
                      </span>
                      <span className="mt-1 block text-[12.5px] leading-snug text-text-muted">
                        {h.queHace}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <a
            href={linkPedir}
            target="_blank"
            rel="noreferrer noopener"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-success py-3.5 text-[14px] font-extrabold text-black transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Pedirle un acceso a Juan por WhatsApp
          </a>
        </div>
      )}
    </section>
  );
}

function CampoCopiable({
  etiqueta,
  valor,
  secreto = false,
}: {
  etiqueta: string;
  valor: string;
  secreto?: boolean;
}) {
  const [visible, setVisible] = useState(!secreto);
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-bg-secondary px-4 py-3">
      <span className="block font-mono text-[9.5px] uppercase tracking-wider text-text-muted">
        {etiqueta}
      </span>

      <div className="mt-1.5 flex items-center gap-2">
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-[14px] font-bold',
            visible ? 'text-white' : 'tracking-[0.2em] text-text-muted'
          )}
        >
          {visible ? valor : '•'.repeat(10)}
        </span>

        {secreto && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="flex-shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            aria-label={visible ? 'Ocultar la contraseña' : 'Mostrar la contraseña'}
          >
            {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(valor).then(
              () => {
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2000);
              },
              () => toast.error('No se pudo copiar.')
            );
          }}
          className="flex-shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
          aria-label={`Copiar ${etiqueta.toLowerCase()}`}
        >
          {copiado ? (
            <Check className="h-3.5 w-3.5 text-brand-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
