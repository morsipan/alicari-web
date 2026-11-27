import React, { useEffect, useRef, useState } from 'react';

interface ScrollyStage {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  shortLabel: string;
}

const SCROLLY_STAGES: ScrollyStage[] = [
  {
    id: 'etapa-01',
    number: '01',
    eyebrow: 'Diseño Multimedia & UX/UI',
    title: 'La chispa y el criterio',
    description:
      'Toda solución empieza como una hipótesis en crudo: trazos, líneas de construcción y preguntas abiertas. Antes de escribir una sola línea de código, aplico criterio visual, arquitectura de información y diseño de experiencia de usuario para separar lo esencial del ruido.',
    imageSrc: '/images/labs/etapa-1-wireframe-lamparita.svg',
    imageAlt:
      'Ilustración vectorial wireframe de una lamparita con líneas de construcción editorial e interferencia sutil.',
    shortLabel: 'Criterio UX/UI',
  },
  {
    id: 'etapa-02',
    number: '02',
    eyebrow: 'AI Software Engineer',
    title: 'Estructura y arquitectura con IA',
    description:
      'Una vez validada la intención, la ingeniería de software asistida por IA transforma esa idea en flujos lógicos, modelado de datos, automatización y reglas de negocio reales. Cada módulo se conecta con precisión para resolver el problema operativo de raíz.',
    imageSrc: '/images/labs/etapa-2-rayos-conexiones.svg',
    imageAlt:
      'Ilustración vectorial de la lamparita encendida irradiando rayos rojos que conectan bloques modulares de arquitectura.',
    shortLabel: 'Arquitectura IA',
  },
  {
    id: 'etapa-03',
    number: '03',
    eyebrow: 'De la idea al sistema',
    title: 'Producto consolidado',
    description:
      'El recorrido culmina en sistemas sólidos, multiplataforma y listos para operar todos los días desde desktop o móvil. Ese mismo proceso da origen a las herramientas propias de Alicari Labs: Dale Te Pido, Dale Te Anoto y Matrify.',
    imageSrc: '/images/labs/etapa-3-prototipo-multidevice.svg',
    imageAlt:
      'Ilustración vectorial de la lamparita irradiando estable junto a un prototipo multidevice en escritorio y móvil.',
    shortLabel: 'Sistema real',
  },
];

export const LabsScrollytelling: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Listen to prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Native IntersectionObserver for smooth stage tracking (no scrolljacking)
  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') return;

    const elements = stageRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (elements.length === 0) return;

    const ratios = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let bestIdx = -1;
        let bestRatio = 0;
        elements.forEach((el, idx) => {
          const r = ratios.get(el) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestIdx = idx;
          }
        });

        if (bestIdx !== -1) {
          setActiveIndex(bestIdx);
        }
      },
      {
        rootMargin: '-28% 0px -32% 0px',
        threshold: [0, 0.15, 0.35, 0.6, 0.85, 1],
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [reducedMotion]);

  const scrollToStage = (index: number) => {
    const el = stageRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      setActiveIndex(index);
    }
  };

  return (
    <section
      aria-labelledby="labs-scrollytelling-heading"
      className="w-full bg-[#F6F6F6] text-[#1C1C1C] border-b border-[#e8e6e1] py-14 sm:py-20"
    >
      {/* Scoped composited-only micro-animation for Stage 01 subtle interference */}
      <style>{`
        @keyframes labsWireframeInterference {
          0%, 100% { opacity: 1; transform: translate3d(0, 0, 0); }
          22% { opacity: 0.96; transform: translate3d(0.6px, -0.3px, 0); }
          24% { opacity: 0.91; transform: translate3d(-0.7px, 0.2px, 0); }
          26% { opacity: 0.99; transform: translate3d(0, 0, 0); }
          64% { opacity: 0.97; transform: translate3d(-0.5px, -0.2px, 0); }
          66% { opacity: 0.92; transform: translate3d(0.8px, 0.3px, 0); }
          68% { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .labs-stage1-interference {
          animation: labsWireframeInterference 4.6s ease-in-out infinite;
          will-change: opacity, transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .labs-stage1-interference {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      <div className="px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto">
        {/* Section Intro */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-[#8a8a8a] uppercase mb-2 m-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CC0000]" aria-hidden="true" />
              <span>Proceso · De la hipótesis al producto</span>
            </p>
            <h2
              id="labs-scrollytelling-heading"
              className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#1C1C1C] m-0"
            >
              Cómo se construye cada sistema
            </h2>
          </div>

          <span className="text-[11px] uppercase tracking-[0.14em] text-[#8a8a8a] tabular-nums">
            01 → 03 · Recorrido
          </span>
        </div>

        {/* Reduced Motion Fallback: Static, stacked, fully legible 3 stages */}
        {reducedMotion ? (
          <div className="space-y-10">
            {SCROLLY_STAGES.map((stage) => (
              <article
                key={stage.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center bg-white rounded-2xl border border-[#e8e6e1] p-5 sm:p-8"
              >
                <div className="lg:col-span-5 space-y-2.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#CC0000] font-medium m-0">
                    Etapa {stage.number} · {stage.eyebrow}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-medium tracking-[-0.015em] text-[#1C1C1C] m-0">
                    {stage.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#4a4a4a] font-light leading-relaxed m-0">
                    {stage.description}
                  </p>
                </div>
                <div className="lg:col-span-7">
                  <div className="w-full aspect-[16/9] rounded-xl border border-[#eceae4] bg-[#F6F6F6] overflow-hidden">
                    <img
                      src={stage.imageSrc}
                      alt={stage.imageAlt}
                      className="w-full h-full object-contain block"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Standard Interactive Scrollytelling: Sticky visual on Desktop, Stacked on Mobile/Tablet */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Narrative Steps Column */}
            <div className="lg:col-span-5 space-y-8 lg:space-y-0">
              {SCROLLY_STAGES.map((stage, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <div
                    key={stage.id}
                    ref={(el) => {
                      stageRefs.current[idx] = el;
                    }}
                    className="lg:min-h-[54vh] flex flex-col justify-center"
                  >
                    <article
                      className={`rounded-2xl lg:rounded-none lg:rounded-r-xl bg-white lg:bg-transparent border border-[#e8e6e1] lg:border-0 lg:border-l-2 p-5 sm:p-6 lg:py-4 lg:pl-6 lg:pr-2 transition-opacity duration-300 ${
                        isActive
                          ? 'lg:border-[#CC0000] opacity-100'
                          : 'lg:border-[#dedbd3] lg:opacity-45'
                      }`}
                    >
                      {/* Mobile & Tablet Inline Graphic (< lg) */}
                      <div className="lg:hidden mb-5 w-full aspect-[16/9] rounded-xl border border-[#eceae4] bg-[#F6F6F6] overflow-hidden">
                        <img
                          src={stage.imageSrc}
                          alt={stage.imageAlt}
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          className={`w-full h-full object-contain block ${
                            idx === 0 && isActive ? 'labs-stage1-interference' : ''
                          }`}
                        />
                      </div>

                      <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-medium m-0 mb-2">
                        <span
                          className={`tabular-nums ${
                            isActive ? 'text-[#CC0000]' : 'text-[#8a8a8a]'
                          }`}
                        >
                          Etapa {stage.number}
                        </span>
                        <span className="text-[#c5c2b9]" aria-hidden="true">
                          /
                        </span>
                        <span className="text-[#666666]">{stage.eyebrow}</span>
                      </p>

                      <h3 className="text-xl sm:text-2xl font-medium tracking-[-0.015em] text-[#1C1C1C] m-0 mb-3">
                        {stage.title}
                      </h3>

                      <p className="text-sm sm:text-[0.95rem] text-[#4a4a4a] font-light leading-relaxed m-0">
                        {stage.description}
                      </p>
                    </article>
                  </div>
                );
              })}
            </div>

            {/* Sticky Visual Stage (Desktop >= 1024px) */}
            <div className="hidden lg:block lg:col-span-7 sticky top-28">
              <div className="rounded-2xl border border-[#e5e2dc] bg-[#F6F6F6] shadow-[0_14px_40px_rgba(28,28,28,0.05)] overflow-hidden">
                {/* 16:9 Layered SVG Canvas */}
                <div className="relative w-full aspect-[16/9] bg-[#F6F6F6] overflow-hidden">
                  {SCROLLY_STAGES.map((stage, idx) => {
                    const isActive = activeIndex === idx;
                    const offsetY = idx < activeIndex ? -8 : idx > activeIndex ? 8 : 0;
                    return (
                      <div
                        key={stage.id}
                        aria-hidden={!isActive}
                        className="absolute inset-0 w-full h-full transition-[opacity,transform] duration-500 ease-out"
                        style={{
                          opacity: isActive ? 1 : 0,
                          transform: isActive
                            ? 'translate3d(0, 0, 0) scale(1)'
                            : `translate3d(0, ${offsetY}px, 0) scale(0.985)`,
                          pointerEvents: isActive ? 'auto' : 'none',
                        }}
                      >
                        <img
                          src={stage.imageSrc}
                          alt={stage.imageAlt}
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          className={`w-full h-full object-contain block ${
                            idx === 0 && isActive ? 'labs-stage1-interference' : ''
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Quiet Editorial Stage Selector / Progress Bar */}
                <div
                  className="grid grid-cols-3 border-t border-[#e5e2dc] bg-white"
                  role="tablist"
                  aria-label="Etapas del proceso de desarrollo"
                >
                  {SCROLLY_STAGES.map((stage, idx) => {
                    const isActive = activeIndex === idx;
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => scrollToStage(idx)}
                        className={`relative min-h-[48px] px-4 py-3 text-left border-0 bg-transparent cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#CC0000] ${
                          idx > 0 ? 'border-l border-[#efede8]' : ''
                        }`}
                      >
                        {/* Active top hairline indicator (composited scaleX) */}
                        <span
                          aria-hidden="true"
                          className="absolute top-0 left-0 right-0 h-[2px] bg-[#CC0000] origin-left transition-transform duration-300"
                          style={{ transform: isActive ? 'scaleX(1)' : 'scaleX(0)' }}
                        />
                        <span
                          className={`block text-[10px] uppercase tracking-[0.14em] tabular-nums ${
                            isActive ? 'text-[#CC0000] font-semibold' : 'text-[#8a8a8a]'
                          }`}
                        >
                          {stage.number}
                        </span>
                        <span
                          className={`block text-xs mt-0.5 truncate ${
                            isActive ? 'text-[#1C1C1C] font-medium' : 'text-[#666666] font-light'
                          }`}
                        >
                          {stage.shortLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
