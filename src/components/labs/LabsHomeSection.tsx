import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { TechLogoRow, type TechKey } from './TechLogoRow';

interface HomeLabSystem {
  id: string;
  index: string;
  name: string;
  category: string;
  description: string;
  highlight: string;
  domain: string;
  url: string;
  logo: string;
  logoBg: 'dark' | 'light';
  logoHeight: string;
  techLogos: TechKey[];
}

const HOME_LAB_SYSTEMS: HomeLabSystem[] = [
  {
    id: 'dale-te-pido',
    index: '01',
    name: 'Dale Te Pido',
    category: 'Comercio Directo · WhatsApp',
    description:
      'Catálogo web para ventas directas por WhatsApp sin fricción de checkout, registros obligatorios ni comisiones por venta.',
    highlight: 'Pedidos estructurados en 1 clic',
    domain: 'daletepido.com.ar',
    url: 'https://daletepido.com.ar',
    logo: '/images/logos/daletepido-logo.png',
    logoBg: 'dark',
    logoHeight: '22px',
    techLogos: ['nextjs', 'typescript', 'tailwindcss', 'supabase', 'whatsapp', 'vercel'],
  },
  {
    id: 'dale-te-anoto',
    index: '02',
    name: 'Dale Te Anoto',
    category: 'Gestión de Agenda · Turnera',
    description:
      'Gestión y reserva de turnos autogestionada sin pasarelas de pago obligatorias, con sincronización en vivo con Google Calendar.',
    highlight: 'Reserva fluida en 2 pasos',
    domain: 'daleteanoto.com.ar',
    url: 'https://daleteanoto.com.ar',
    logo: '/images/logos/daleteanoto-logo.png',
    logoBg: 'light',
    logoHeight: '28px',
    techLogos: ['react', 'typescript', 'tailwindcss', 'googlecalendar', 'postgresql', 'vercel'],
  },
  {
    id: 'matrify',
    index: '03',
    name: 'Matrify',
    category: 'EdTech · Gestión Escolar',
    description:
      'Digitalización integral del proceso de inscripción y matriculación estudiantil, reemplazando el papel por un flujo online.',
    highlight: 'Firma electrónica y legajo PDF',
    domain: 'matrify.vercel.app',
    url: 'https://matrify.vercel.app',
    logo: '/images/logos/matrify-logo.svg',
    logoBg: 'light',
    logoHeight: '24px',
    techLogos: ['nextjs', 'react', 'typescript', 'tailwindcss', 'cloudflare', 'vercel'],
  },
];

export const LabsHomeSection: React.FC = () => {
  return (
    <section
      id="alicari-labs"
      aria-labelledby="labs-home-heading"
      className="relative w-full bg-[#eae8e2] text-[#010101] border-y border-[#d6d3ca] py-20 sm:py-28 overflow-x-hidden"
    >
      {/* Subtle architectural top accent rule for visual separation from portfolio */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#cc0000] via-[#cc0000]/40 to-transparent"
      />

      <div className="mx-auto max-w-[1440px] px-[clamp(1.5rem,5vw,6rem)]">
        {/* High-Presence Editorial Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end pb-12 mb-12 border-b border-[#d6d3ca]">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/85 border border-[#d6d3ca] text-[11px] font-medium tracking-[0.16em] text-[#4a4a4a] uppercase mb-5">
              <span className="w-2 h-2 rounded-full bg-[#cc0000]" aria-hidden="true" />
              <span>AI Developer · Diseño Multimedia & UX/UI</span>
            </div>

            <h2
              id="labs-home-heading"
              className="text-4xl sm:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.035em] leading-[0.98] text-[#010101] m-0"
            >
              Alicari{' '}
              <span className="text-[#cc0000]">Labs</span>
            </h2>
          </div>

          <div className="lg:col-span-5 flex flex-col items-start lg:items-end gap-5">
            <p className="text-sm sm:text-base text-[#3a3a3a] font-normal leading-relaxed m-0 lg:text-right max-w-xl">
              Espacio dedicado al desarrollo de <strong className="font-semibold text-[#010101]">sistemas propios</strong>:
              arquitectura de producto, automatización y experiencia de usuario diseñados y construidos de punta a punta.
            </p>

            <a
              href="/labs"
              className="inline-flex items-center gap-2.5 min-h-[46px] px-6 py-2.5 rounded-full bg-[#010101] hover:bg-[#cc0000] text-white text-xs font-medium tracking-[0.14em] uppercase no-underline transition-colors shadow-[0_6px_20px_rgba(1,1,1,0.12)]"
            >
              <span>Explorar Alicari Labs</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* 3 Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
          {HOME_LAB_SYSTEMS.map((system) => (
            <article
              key={system.id}
              className="group relative bg-white rounded-2xl border border-[#dedbd3] hover:border-[#010101]/25 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_12px_rgba(1,1,1,0.03)] hover:shadow-[0_18px_40px_rgba(1,1,1,0.08)] overflow-hidden"
            >
              {/* Top subtle accent line on hover */}
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[2px] bg-[#cc0000] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
              />

              <div>
                {/* Logo & Index */}
                <div className="flex items-center justify-between gap-3 pb-5 mb-5 border-b border-[#efede8]">
                  <div
                    className={`px-3.5 py-2 rounded-lg border flex items-center shrink-0 ${
                      system.logoBg === 'dark'
                        ? 'bg-[#010101] border-[#010101]'
                        : 'bg-[#f8f8f6] border-[#e6e4de]'
                    }`}
                  >
                    <img
                      src={system.logo}
                      alt={`Logotipo oficial de ${system.name}`}
                      style={{ height: system.logoHeight, width: 'auto' }}
                      className="block max-w-[140px] object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[11px] font-semibold tracking-[0.16em] text-[#8a8a8a] tabular-nums">
                    SYS / {system.index}
                  </span>
                </div>

                {/* Meta & Title */}
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#7a7a7a] font-medium m-0 mb-1.5">
                  {system.category}
                </p>

                <h3 className="text-xl sm:text-[1.35rem] font-semibold tracking-[-0.02em] text-[#010101] m-0 mb-2.5">
                  {system.name}
                </h3>

                <p className="text-sm text-[#4a4a4a] font-light leading-relaxed m-0 mb-5">
                  {system.description}
                </p>

                <TechLogoRow items={system.techLogos} className="mb-5" />
              </div>

              {/* Footer: Highlight & Live Link */}
              <div className="pt-4 border-t border-[#efede8] flex flex-col gap-3">
                <span className="inline-flex items-center gap-2 text-xs text-[#4a4a4a] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000] shrink-0" aria-hidden="true" />
                  <span>{system.highlight}</span>
                </span>

                <a
                  href={system.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between min-h-[42px] px-3.5 rounded-lg bg-[#f6f6f4] group-hover:bg-[#010101] text-[#010101] group-hover:text-white text-xs font-medium tracking-[0.08em] uppercase no-underline transition-colors"
                  aria-label={`Visitar ${system.name} en ${system.domain}`}
                >
                  <span>{system.domain}</span>
                  <ArrowUpRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
