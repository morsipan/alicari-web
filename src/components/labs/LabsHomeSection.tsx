import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

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
}

const HOME_LAB_SYSTEMS: HomeLabSystem[] = [
  {
    id: 'dale-te-pido',
    index: '01',
    name: 'Dale Te Pido',
    category: 'Comercio Directo · WhatsApp',
    description:
      'Catálogo web ágil para ventas directas por WhatsApp sin fricción de checkout, registros obligatorios ni comisiones por transacción.',
    highlight: 'Pedidos estructurados en 1 clic',
    domain: 'daletepido.com.ar',
    url: 'https://daletepido.com.ar',
    logo: '/images/logos/daletepido-logo.png',
    logoBg: 'dark',
    logoHeight: '22px',
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
  },
  {
    id: 'matrify',
    index: '03',
    name: 'Matrify',
    category: 'EdTech · Gestión Escolar',
    description:
      'Digitalización integral del proceso de inscripción y matriculación estudiantil, reemplazando el papel por un flujo online auditable.',
    highlight: 'Firma electrónica y legajo PDF',
    domain: 'matrify.vercel.app',
    url: 'https://matrify.vercel.app',
    logo: '/images/logos/matrify-logo.svg',
    logoBg: 'light',
    logoHeight: '24px',
  },
];

export const LabsHomeSection: React.FC = () => {
  return (
    <section
      id="alicari-labs"
      aria-labelledby="labs-home-heading"
      className="w-full bg-[#f6f6f6] text-[#010101] border-t border-[#e8e6e1] py-16 sm:py-24 overflow-x-hidden"
    >
      <div className="mx-auto max-w-[1440px] px-[clamp(1.5rem,5vw,6rem)]">
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-[#8a8a8a] uppercase mb-3 m-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000]" aria-hidden="true" />
              <span>Alicari Labs · Sistemas Propios</span>
            </p>

            <h2
              id="labs-home-heading"
              className="text-2xl sm:text-4xl font-medium tracking-[-0.02em] text-[#010101] leading-[1.12] m-0 mb-4"
            >
              Desarrollo de sistemas propios desde una mirada de producto.
            </h2>

            <p className="text-sm sm:text-base text-[#4a4a4a] font-light leading-relaxed m-0">
              En <strong className="font-medium text-[#010101]">Alicari Labs</strong> diseño y
              desarrollo sistemas propios como{' '}
              <strong className="font-medium text-[#010101]">AI Developer</strong>, combinando
              arquitectura técnica y automatización con mi experiencia en{' '}
              <strong className="font-medium text-[#010101]">Diseño Multimedia y UX/UI</strong>.
            </p>
          </div>

          <a
            href="/labs"
            className="inline-flex items-center gap-2 self-start lg:self-end min-h-[44px] px-5 py-2.5 rounded-full bg-white hover:bg-[#010101] text-[#010101] hover:text-white border border-[#dedbd3] hover:border-[#010101] text-xs font-medium tracking-[0.12em] uppercase no-underline transition-colors shrink-0"
          >
            <span>Ver Alicari Labs</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>

        {/* 3 Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOME_LAB_SYSTEMS.map((system) => (
            <article
              key={system.id}
              className="group bg-white rounded-xl border border-[#e8e6e1] hover:border-[#cfccc4] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_32px_rgba(1,1,1,0.05)]"
            >
              <div>
                {/* Logo & Index */}
                <div className="flex items-center justify-between gap-3 pb-5 mb-5 border-b border-[#efede8]">
                  <div
                    className={`px-3 py-2 rounded-lg border flex items-center shrink-0 ${
                      system.logoBg === 'dark'
                        ? 'bg-[#010101] border-[#010101]'
                        : 'bg-[#fafafa] border-[#e8e6e1]'
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
                  <span className="text-[11px] font-medium tracking-[0.14em] text-[#8a8a8a] tabular-nums">
                    {system.index}
                  </span>
                </div>

                {/* Meta & Title */}
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#8a8a8a] m-0 mb-1.5">
                  {system.category}
                </p>

                <h3 className="text-lg sm:text-xl font-medium tracking-[-0.015em] text-[#010101] m-0 mb-2.5">
                  {system.name}
                </h3>

                <p className="text-sm text-[#4a4a4a] font-light leading-relaxed m-0 mb-5">
                  {system.description}
                </p>
              </div>

              {/* Footer: Highlight & Live Link */}
              <div className="pt-4 border-t border-[#efede8] flex flex-col gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#666666] font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000] shrink-0" aria-hidden="true" />
                  <span>{system.highlight}</span>
                </span>

                <a
                  href={system.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between min-h-[40px] text-xs font-medium tracking-[0.08em] uppercase text-[#010101] hover:text-[#cc0000] no-underline transition-colors"
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
