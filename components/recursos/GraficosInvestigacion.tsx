// Ilustraciones del recurso de investigación de mercado.
//
// Todo es SVG en línea: pesa menos que una imagen, se ve nítido en cualquier
// pantalla y el texto de dentro se puede leer y traducir. Nada es decorativo
// — cada gráfico explica algo que en párrafo costaría diez líneas.

const MORADO = '#A855F7';
const MORADO_O = '#7C3AED';
const ORO = '#F5C518';
const VERDE = '#10B981';
const ROJO = '#F87171';
const BORDE = '#2A2A34';
const TEXTO = '#B4B4BE';
const APAGADO = '#75757F';

/* ─────────── 1. El embudo: tres preguntas que filtran ───────────
   En HTML y no en SVG a propósito: <text> no ajusta líneas, así que una
   frase larga se sale de la caja o hay que cortarla a mitad de palabra.
   El estrechamiento se hace con anchos en porcentaje, que además se
   adapta al móvil solo. */
export function EmbudoValidacion() {
  const pasos = [
    {
      t: '¿Existe alguien vendiéndolo?',
      s: 'Si nadie lo vende, casi nunca es una oportunidad: suele ser que ya lo intentaron y no funcionó.',
      color: '#A855F7',
      ancho: 'w-full',
    },
    {
      t: '¿Lleva tiempo vendiéndolo?',
      s: 'Un anuncio activo hace tres meses es dinero que alguien decidió seguir gastando. Eso no se finge.',
      color: '#7C3AED',
      ancho: 'w-full sm:w-[84%]',
    },
    {
      t: '¿Cómo lo está vendiendo?',
      s: 'Aquí está el oro: los formatos, los ángulos y —sobre todo— lo que nadie está diciendo todavía.',
      color: '#F5C518',
      ancho: 'w-full sm:w-[68%]',
    },
  ];
  return (
    <figure className="my-10">
      <div className="flex flex-col items-center gap-3">
        {pasos.map((p, i) => (
          <div key={i} className="contents">
            <div
              className={`${p.ancho} rounded-2xl border p-5`}
              style={{ borderColor: `${p.color}55`, background: `${p.color}12` }}
            >
              <div className="flex items-start gap-3.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-extrabold text-black"
                  style={{ background: p.color }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[15.5px] font-extrabold leading-snug text-white">{p.t}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">{p.s}</p>
                </div>
              </div>
            </div>
            {i < pasos.length - 1 && (
              <svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true" className="shrink-0">
                <path d="M9 1 L9 13 M4 9 l5 5 l5 -5" stroke="#2A2A34" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <figcaption className="mt-4 text-center text-[12.5px] text-text-muted">
        Cada filtro descarta productos. El que llega abajo ya no es una corazonada.
      </figcaption>
    </figure>
  );
}

/* ─────────── 2. La biblioteca de anuncios, anotada ─────────── */
export function BibliotecaAnotada() {
  const notas = [
    { n: 1, x: 26, y: 46, t: 'El nombre del producto, no tu marca' },
    { n: 2, x: 232, y: 46, t: 'Cambia el país: aquí y fuera' },
    { n: 3, x: 26, y: 118, t: 'Fecha de inicio = cuánto lleva vivo' },
    { n: 4, x: 232, y: 118, t: 'Varias versiones = les funciona' },
  ];
  return (
    <figure className="my-10">
      <svg viewBox="0 0 400 300" className="w-full" role="img" aria-label="Biblioteca de anuncios de Meta con los cuatro puntos que hay que mirar">
        <rect x="8" y="8" width="384" height="284" rx="14" fill="#101014" stroke={BORDE} />
        <g>
          <circle cx="26" cy="26" r="4" fill="#3A3A44" /><circle cx="40" cy="26" r="4" fill="#3A3A44" /><circle cx="54" cy="26" r="4" fill="#3A3A44" />
          <rect x="74" y="20" width="300" height="13" rx="6" fill="#18181F" />
          <text x="82" y="30" fontSize="8.5" fill={APAGADO}>facebook.com/ads/library</text>
        </g>
        {/* buscador y país */}
        <rect x="20" y="52" width="200" height="26" rx="8" fill="#16161C" stroke={MORADO} strokeOpacity="0.55" />
        <text x="32" y="69" fontSize="10.5" fill="#fff">cinturón anticólicos</text>
        <rect x="228" y="52" width="152" height="26" rx="8" fill="#16161C" stroke={ORO} strokeOpacity="0.55" />
        <text x="240" y="69" fontSize="10.5" fill="#fff">Colombia ▾</text>
        {/* tarjetas de anuncio */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={20 + i * 122} y="96" width="110" height="112" rx="10" fill="#16161C" stroke={BORDE} />
            <rect x={20 + i * 122} y="96" width="110" height="58" rx="10" fill={MORADO_O} opacity={0.1 + i * 0.05} />
            <circle cx={75 + i * 122} cy="125" r="13" fill="none" stroke={MORADO} strokeOpacity="0.7" strokeWidth="1.4" />
            <path d={`M${71 + i * 122} 119 l10 6 l-10 6 z`} fill={MORADO} />
            <rect x={28 + i * 122} y="162" width="60" height="6" rx="3" fill={VERDE} opacity="0.55" />
            <text x={28 + i * 122} y="184" fontSize="8" fill={APAGADO}>Activo desde</text>
            <text x={28 + i * 122} y="196" fontSize="9" fontWeight="700" fill={VERDE}>{['12 mar', '4 ene', '28 feb'][i]}</text>
          </g>
        ))}
        {/* llamadas */}
        {notas.map((a) => (
          <g key={a.n}>
            <circle cx={a.x} cy={a.y} r="9" fill={ORO} />
            <text x={a.x} y={a.y + 3.5} textAnchor="middle" fontSize="10" fontWeight="800" fill="#0A0A0A">{a.n}</text>
          </g>
        ))}
        <g>
          {notas.map((a, i) => (
            <text key={a.n} x="20" y={236 + i * 15} fontSize="9.5" fill={TEXTO}>
              <tspan fill={ORO} fontWeight="700">{a.n}. </tspan>{a.t}
            </text>
          ))}
        </g>
      </svg>
      <figcaption className="mt-3 text-center text-[12.5px] text-text-muted">
        Cuatro datos por anuncio. Con veinte anuncios ya tienes un mapa del mercado.
      </figcaption>
    </figure>
  );
}

/* ─────────── 3. El iceberg del dolor (lo importante) ─────────── */
export function IcebergDelDolor() {
  return (
    <figure className="my-10">
      <svg viewBox="0 0 400 330" className="w-full" role="img" aria-label="Iceberg: el dolor visible frente al dolor profundo">
        {/* agua */}
        <rect x="0" y="96" width="400" height="234" fill={MORADO_O} opacity="0.07" />
        <line x1="0" y1="96" x2="400" y2="96" stroke={MORADO} strokeOpacity="0.45" strokeDasharray="5 4" />
        <text x="8" y="90" fontSize="9.5" fill={MORADO} fontWeight="700">LO QUE TODOS ANUNCIAN</text>
        <text x="8" y="112" fontSize="9.5" fill={ORO} fontWeight="700">LO QUE NADIE ESTÁ DICIENDO</text>

        {/* punta */}
        <path d="M200 20 L246 96 L154 96 Z" fill="#E8E8F0" opacity="0.92" />
        <text x="200" y="76" textAnchor="middle" fontSize="11" fontWeight="800" fill="#101016">&ldquo;Se me cae el pelo&rdquo;</text>

        {/* masa sumergida */}
        <path d="M154 96 L246 96 L300 190 L268 300 L132 300 L100 190 Z" fill={MORADO_O} opacity="0.3" />
        <path d="M154 96 L246 96 L300 190 L268 300 L132 300 L100 190 Z" fill="none" stroke={MORADO} strokeOpacity="0.5" />

        <text x="200" y="140" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">&ldquo;Me veo diez años mayor&rdquo;</text>
        <text x="200" y="190" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">&ldquo;Evito las fotos y los espejos&rdquo;</text>
        <text x="200" y="240" textAnchor="middle" fontSize="12" fontWeight="800" fill={ORO}>&ldquo;Ella dejó de mirarme&rdquo;</text>
        <text x="200" y="262" textAnchor="middle" fontSize="9.5" fill={TEXTO}>el que de verdad mueve la compra</text>

        <path d="M330 120 L330 236 m-5 -8 l5 8 l5 -8" stroke={ORO} strokeOpacity="0.6" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <text x="338" y="180" fontSize="9" fill={ORO} transform="rotate(90 338 180)">+ profundidad</text>
      </svg>
      <figcaption className="mt-3 text-center text-[12.5px] leading-relaxed text-text-muted">
        Tu competencia le habla a la punta. Los comentarios de TikTok y Reddit te dan lo de abajo.
      </figcaption>
    </figure>
  );
}

/* ─────────── 4. De datos crudos a ángulos ─────────── */
export function FlujoDatosAngulos() {
  const fuentes = [
    { t: 'Ads Library', s: 'copys + formatos', c: MORADO },
    { t: 'TikTok', s: 'comentarios', c: ORO },
    { t: 'Reddit', s: 'reseñas largas', c: VERDE },
  ];
  return (
    <figure className="my-10">
      <svg viewBox="0 0 400 220" className="w-full" role="img" aria-label="Las tres fuentes se juntan en un documento y la IA saca los ángulos">
        {fuentes.map((f, i) => (
          <g key={i}>
            <rect x="12" y={14 + i * 62} width="104" height="46" rx="10" fill={f.c} opacity="0.12" />
            <rect x="12" y={14 + i * 62} width="104" height="46" rx="10" fill="none" stroke={f.c} strokeOpacity="0.5" />
            <text x="64" y={35 + i * 62} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">{f.t}</text>
            <text x="64" y={50 + i * 62} textAnchor="middle" fontSize="9" fill={APAGADO}>{f.s}</text>
            <path d={`M120 ${37 + i * 62} L166 110 m-6 -3 l6 3 l-4 5`} stroke={BORDE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        ))}
        <rect x="168" y="84" width="76" height="52" rx="10" fill="#16161C" stroke={BORDE} />
        <text x="206" y="106" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">1 doc</text>
        <text x="206" y="120" textAnchor="middle" fontSize="8.5" fill={APAGADO}>todo junto</text>
        <path d="M248 110 L282 110 m-6 -4 l6 4 l-6 4" stroke={BORDE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="286" y="76" width="102" height="68" rx="12" fill={ORO} opacity="0.13" />
        <rect x="286" y="76" width="102" height="68" rx="12" fill="none" stroke={ORO} strokeOpacity="0.55" />
        <text x="337" y="100" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={ORO}>La IA agrupa</text>
        <text x="337" y="116" textAnchor="middle" fontSize="9" fill={TEXTO}>patrones, no ideas</text>
        <text x="337" y="130" textAnchor="middle" fontSize="9" fill={TEXTO}>inventadas</text>
      </svg>
      <figcaption className="mt-3 text-center text-[12.5px] text-text-muted">
        La IA no inventa el ángulo: lo encuentra en lo que la gente ya escribió.
      </figcaption>
    </figure>
  );
}

/* ─────────── 5. Genérico vs basado en datos ─────────── */
export function ComparativaAngulos() {
  return (
    <div className="my-10 grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-brand-danger/25 bg-brand-danger/[0.05] p-5">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-brand-danger">Ángulo genérico</span>
        <p className="mt-3 font-display text-[16px] font-extrabold leading-snug text-white">
          &ldquo;Recupera tu cabello con nuestro tratamiento natural&rdquo;
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
          Sale de la cabeza de quien escribe. Es lo mismo que dicen los otros veinte anuncios,
          así que compite solo por precio.
        </p>
      </div>
      <div className="rounded-2xl border border-brand-yellow/30 bg-brand-yellow/[0.06] p-5">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-brand-yellow">Ángulo con dato detrás</span>
        <p className="mt-3 font-display text-[16px] font-extrabold leading-snug text-white">
          &ldquo;Dejé de salir en las fotos de mi propia familia&rdquo;
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
          Sale de un comentario real repetido 40 veces. Nadie lo está usando, y quien lo vive
          siente que le hablan a él.
        </p>
      </div>
    </div>
  );
}
