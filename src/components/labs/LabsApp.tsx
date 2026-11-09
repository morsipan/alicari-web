import React, { useState } from 'react';
import { StippleTypography } from './StippleTypography';
import { LabsProjects } from './LabsProjects';
import {
  FlaskConical,
  Sparkles,
  Cpu,
  Terminal,
  Layers,
  ArrowDown,
  ExternalLink,
  MessageSquare,
  Compass,
  Zap,
} from 'lucide-react';

const PRESET_LINES = [
  { id: 'labs', label: 'ALICARI LABS', lines: ['ALICARI', 'LABS', 'RUNWAY // 2026'] },
  { id: 'signal', label: 'SIGNAL PROTOCOL', lines: ['SIGNAL', 'STIPPLE', 'CANVAS ENGINE'] },
  { id: 'projects', label: 'IN-HOUSE SUITE', lines: ['TE PIDO', 'TE ANOTO', 'MATRIFY'] },
];

export const LabsApp: React.FC = () => {
  const [activePreset, setActivePreset] = useState<string>('labs');
  const [currentLines, setCurrentLines] = useState<string[]>(PRESET_LINES[0].lines);
  const [stats, setStats] = useState<{ pointsCount: number; glyphsCount: number; cellSize: number }>({
    pointsCount: 0,
    glyphsCount: 0,
    cellSize: 2.4,
  });

  const handleSelectPreset = (preset: typeof PRESET_LINES[0]) => {
    setActivePreset(preset.id);
    setCurrentLines(preset.lines);
  };

  const scrollToProjects = () => {
    const el = document.getElementById('proyectos-labs');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const triggerContactModal = () => {
    const modalTrigger = document.querySelector('.js-contact-trigger') as HTMLElement | null;
    if (modalTrigger) {
      modalTrigger.click();
    } else {
      window.location.hash = '#contacto';
    }
  };

  return (
    <div className="min-h-screen bg-[#010101] text-[#f6f6f6] selection:bg-[#cc0000] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ── Runway Background Ambient Lighting ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#cc0000]/15 via-transparent to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-red-950/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* ── Runway Hero Header ────────────────────────────────────────── */}
        <section className="relative pt-24 sm:pt-28 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Status Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-white/10 text-xs font-mono tracking-wider text-neutral-300 mb-6 shadow-sm">
            <FlaskConical className="w-3.5 h-3.5 text-[#cc0000]" />
            <span className="text-white font-medium">ALICARI LABS</span>
            <span className="text-neutral-500">//</span>
            <span className="text-[#cc0000] font-semibold">DIVISIÓN EXPERIMENTAL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-anton uppercase tracking-tight text-white max-w-5xl leading-[0.95] mb-4">
            Laboratorio de Interfaces & Software
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl font-light leading-relaxed mb-8">
            Espacio dedicado a la investigación de tipografía computacional, micro-interacciones de alto rendimiento
            en Canvas/WebGL y productos digitales desarrollados in-house.
          </p>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-xl bg-neutral-950/90 border border-white/10 backdrop-blur-md mb-8">
            <span className="px-3 text-[11px] font-mono text-neutral-400 uppercase hidden sm:inline">PRESETS:</span>
            {PRESET_LINES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`min-h-[44px] px-4 py-2 rounded-lg font-mono text-xs tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#cc0000] ${
                  activePreset === p.id
                    ? 'bg-[#cc0000] text-white font-bold shadow-md shadow-red-900/40'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
                aria-pressed={activePreset === p.id}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Stipple Typography Canvas Runway ──────────────────────────── */}
        <section className="relative px-2 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
          <div className="relative rounded-2xl bg-neutral-950/90 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <StippleTypography
              key={`${activePreset}-${currentLines.join('-')}`}
              lines={currentLines}
              onStatsChange={setStats}
            />
          </div>

          {/* Quick jump anchor */}
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={scrollToProjects}
              className="min-h-[44px] px-4 py-2 flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
            >
              <span>EXPLORAR LOS 3 PROYECTOS IN-HOUSE</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#cc0000]" />
            </button>
          </div>
        </section>

        {/* ── 3 In-House Projects Showcase (Dale Te Pido, Dale Te Anoto, Matrify) */}
        <LabsProjects />

        {/* ── Engineering Manifesto / Technical Pillars ─────────────────── */}
        <section className="relative z-10 w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-neutral-400 uppercase mb-2">
              <Terminal className="w-3.5 h-3.5 text-[#cc0000]" />
              <span>LAB PHILOSOPHY & ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-anton uppercase tracking-tight text-white m-0">
              Criterio de Ingeniería en Alicari Labs
            </h2>
            <p className="text-sm text-neutral-400 mt-2 font-light">
              Desarrollamos tecnología con tres pilares innegociables: cero dependencias innecesarias,
              máxima velocidad percibida por el usuario y total independencia de pasarelas cuando agregan fricción.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-neutral-950/60 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-red-950/50 border border-red-500/20 flex items-center justify-center text-[#cc0000] mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-anton uppercase tracking-tight text-white mb-2">
                Sin Fricción de Checkout
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Reducimos el abandono eliminando pasos burocráticos. Integración directa con mensajería y canales nativos
                donde los usuarios ya interactúan todos los días.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-950/60 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-sky-400 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-anton uppercase tracking-tight text-white mb-2">
                Rendimiento a 60 FPS
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Muestreo nativo en Canvas con DPR restringido y fallback instantáneo a texto vivo. Animaciones fluidas
                diseñadas para no recalentar dispositivos ni consumir batería.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-950/60 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-emerald-400 mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-anton uppercase tracking-tight text-white mb-2">
                Digitalización Pragmática
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Del papel al flujo online en minutos. Soluciones como Matrify y Dale Te Anoto nacen de necesidades operativas
                reales comprobadas en el campo.
              </p>
            </div>
          </div>
        </section>

        {/* ── Early Access / Collaboration CTA Runway ───────────────────── */}
        <section className="relative z-10 w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="relative rounded-2xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-red-900/30 p-8 sm:p-12 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#cc0000_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-[#cc0000]/20 border border-[#cc0000]/40 text-[#ff4d4d] font-mono text-xs font-bold uppercase tracking-widest mb-4">
                CO-CREACIÓN & DESPLIEGUE
              </span>
              <h2 className="text-3xl sm:text-5xl font-anton uppercase tracking-tight text-white mb-4">
                ¿Querés implementar una de estas herramientas?
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed mb-8">
                Estamos coordinando las primeras pruebas beta para negocios y colegios interesados.
                Ponete en contacto para acceder a una demostración en vivo.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={triggerContactModal}
                  className="min-h-[48px] px-8 py-3 rounded-lg bg-[#cc0000] hover:bg-[#b00000] active:bg-[#900000] text-white font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 shadow-[0_0_25px_rgba(204,0,0,0.4)] flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>CONTACTAR AL LAB</span>
                </button>

                <a
                  href="index.html"
                  className="min-h-[48px] px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-medium tracking-wider transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                >
                  <Compass className="w-4 h-4" />
                  <span>VER PORTFOLIO GENERAL</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

