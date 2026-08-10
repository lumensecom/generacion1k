'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';

// Visor de código con botón de copiar. Se usa tanto en la ventana de cada
// sección de la anatomía como en la página de prompts.
//
// El resaltado se hace con una pasada de regex sobre el texto ya escapado.
// Es deliberadamente simple: meter una librería de highlight por unos
// bloques de Liquid costaría más kilobytes que todo el resto de la página.
export function BloqueCodigo({
  codigo,
  lenguaje = 'liquid',
  alto = 'max-h-[340px]',
}: {
  codigo: string;
  lenguaje?: 'liquid' | 'texto';
  alto?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copiar = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopiado(false), 1800);
    } catch {
      // Portapapeles bloqueado (http sin TLS, permisos). Se deja seleccionable.
    }
  }, [codigo]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-[#0B0B10]">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-muted">
          {lenguaje === 'liquid' ? 'HTML + Liquid' : 'Prompt'}
        </span>
        <button
          onClick={copiar}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-text-secondary transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Copiar código"
        >
          {copiado ? (
            <>
              <Check size={12} className="text-brand-success" /> Copiado
            </>
          ) : (
            <>
              <Copy size={12} /> Copiar
            </>
          )}
        </button>
      </div>

      <pre className={`${alto} overflow-auto px-4 py-4`}>
        <code
          className="whitespace-pre font-mono text-[11.5px] leading-[1.65] text-[#C8C8D4]"
          dangerouslySetInnerHTML={{ __html: resaltar(codigo, lenguaje) }}
        />
      </pre>
    </div>
  );
}

function escapar(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Se resalta sobre el texto YA escapado, así que los patrones buscan &lt;
// en vez de <. Cualquier cosa que se inyecte aquí ya pasó por escapar().
function resaltar(codigo: string, lenguaje: 'liquid' | 'texto') {
  const base = escapar(codigo);

  if (lenguaje === 'texto') {
    // En los prompts solo marcamos los huecos a reemplazar y los títulos.
    return base
      .replace(/(\{\{[A-ZÁÉÍÓÚÑ_]+\}\})/g, '<span style="color:#F59E0B;font-weight:600">$1</span>')
      .replace(/(\[[^\]\n]{2,60}\])/g, '<span style="color:#22D3EE">$1</span>')
      .replace(/^(═+|─+)$/gm, '<span style="color:#4B4B58">$&</span>')
      .replace(/^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{4,40}:)$/gm, '<span style="color:#A855F7;font-weight:600">$1</span>');
  }

  return (
    base
      // Comentarios de Liquid y de HTML
      .replace(
        /(\{%-?\s*comment[\s\S]*?endcomment\s*-?%\}|&lt;!--[\s\S]*?--&gt;)/g,
        '<span style="color:#5A5A68;font-style:italic">$1</span>'
      )
      // Etiquetas de lógica {% ... %}
      .replace(/(\{%-?[\s\S]*?-?%\})/g, '<span style="color:#A855F7">$1</span>')
      // Salidas {{ ... }}
      .replace(/(\{\{[\s\S]*?\}\})/g, '<span style="color:#22D3EE">$1</span>')
      // Huecos a reemplazar
      .replace(/(\[[A-ZÁÉÍÓÚÑ0-9_ÑñÁÉÍÓÚáéíóú][^\]\n]{0,60}\])/g, '<span style="color:#F59E0B">$1</span>')
      // Nombres de etiqueta HTML
      .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9-]*)/g, '$1<span style="color:#EC4899">$2</span>')
  );
}
