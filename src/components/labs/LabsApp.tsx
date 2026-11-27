import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Code2,
  FileText,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import { TechLogoRow, type TechKey } from './TechLogoRow';
import { DotRevealHeadline, type DotRevealLineSpec } from './DotRevealHeadline';
import { LabsScrollBackground } from './LabsScrollBackground';

const LABS_HEADLINE_LINES: DotRevealLineSpec[] = [
  { text: 'ALICARI' },
  { text: 'LABS.', accent: true },
  { text: 'SISTEMAS.' },
];

export interface LabSystem {
  id: string;
  index: string;
  name: string;
  tagline: string;
  domain: string;
  url: string;
  logo: string;
  logoBg: 'dark' | 'light';
  logoHeight: string;
  category: string;
  summary: string;
  problem: string;
  operationalFlow: string;
  uxAndAutomation: string;
  role: string;
  highlights: { label: string; value: string }[];
  capabilities: string[];
  architecture: string[];
  techLogos: TechKey[];
  techStack: string[];
}

export const LAB_SYSTEMS: LabSystem[] = [
  {
    id: 'dale-te-pido',
    index: '01',
    name: 'Dale Te Pido',
    tagline:
      'Sistema de catálogo web ágil para ventas directas por WhatsApp sin fricción de checkout.',
    domain: 'daletepido.com.ar',
    url: 'https://daletepido.com.ar',
    logo: '/images/logos/daletepido-logo.png',
    logoBg: 'dark',
    logoHeight: '26px',
    category: 'Comercio Directo · Catálogo Web & Automatización',
    summary:
      'Sistema web de pedidos concebido para comercios locales y gastronómicos que necesitan vender rápido desde el celular. El cliente arma su carrito visual con variantes y envía un pedido estructurado directo al WhatsApp del negocio, eliminando registros obligatorios, pasarelas lentas y comisiones por venta.',
    problem:
      'Los e-commerce tradicionales imponen comisiones por transacción y checkouts con múltiples pasos que provocan abandonos masivos en compras cotidianas y locales.',
    operationalFlow:
      'Navegación de catálogo optimizado para móvil → selección de productos, variantes y zona de envío → compilación determinista del resumen → envío en 1 clic al chat de WhatsApp del comercio.',
    uxAndAutomation:
      'Interfaz de carga inmediata orientada a una mano, generación automática de kit imprimible en PDF vectorial con QR para local físico y soporte guiado con asistente virtual jAIme.',
    role: 'AI Developer · Arquitectura Full-Stack · Diseño UX/UI & Branding',
    highlights: [
      { label: 'Comisión por venta', value: '0%' },
      { label: 'Armado de pedido', value: '< 45 s' },
      { label: 'Checkout', value: 'Directo WA' },
      { label: 'Asistencia', value: 'jAIme 24/7' },
    ],
    capabilities: [
      'Compilación automática del pedido con cantidades, variantes, subtotal y cálculo de envío por zona.',
      'Panel de administración en tiempo real para precios, stock, categorías e identidad visual.',
      'Exportación automática de piezas gráficas en PDF vectorial con código QR para mostrador y vidriera.',
      'Asistente virtual integrado con IA para acompañar la configuración y operación diaria del comercio.',
    ],
    architecture: [
      'Aplicación web progresiva (PWA) ligera optimizada para redes móviles y baja latencia',
      'Persistencia en PostgreSQL con sincronización en tiempo real mediante Supabase',
      'Motor determinista de serialización de pedidos hacia protocolo WhatsApp Business',
      'Despliegue perimetral en Edge CDN con caché inteligente de activos multimedia',
    ],
    techLogos: ['nextjs', 'typescript', 'tailwindcss', 'supabase', 'whatsapp', 'vercel'],
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'WhatsApp Protocol', 'IA'],
  },
  {
    id: 'dale-te-anoto',
    index: '02',
    name: 'Dale Te Anoto',
    tagline:
      'Sistema de gestión y reserva de turnos autogestionada sin pasarelas de pago obligatorias.',
    domain: 'daleteanoto.com.ar',
    url: 'https://daleteanoto.com.ar',
    logo: '/images/logos/daleteanoto-logo.png',
    logoBg: 'light',
    logoHeight: '32px',
    category: 'Gestión de Agenda · Turnera Autogestionada',
    summary:
      'Plataforma de reservas diseñada para profesionales independientes, consultorios, barberías y espacios de servicios. Permite autogestionar citas en dos pasos sin exigir tarjeta de crédito ni cuentas previas, sincronizando la agenda en tiempo real para evitar superposiciones.',
    problem:
      'Muchas turneras bloquean la reserva detrás de pasarelas de pago obligatorias o formularios extensos, generando fricción innecesaria con clientes habituales y pérdida de citas.',
    operationalFlow:
      'Selección de servicio y profesional → consulta de franjas disponibles en tiempo real → confirmación inmediata sin fricción → sincronización bidireccional y recordatorio preventivo.',
    uxAndAutomation:
      'Flujo mobile-first de dos toques, motor de reglas de disponibilidad horaria, bloqueo de feriados y automatización de avisos preventivos para reducir el ausentismo.',
    role: 'AI Developer · Arquitectura de Sincronización · Sistema UX/UI',
    highlights: [
      { label: 'Flujo de reserva', value: '2 pasos' },
      { label: 'Pago obligatorio', value: 'No requiere' },
      { label: 'Calendario', value: 'Sync en vivo' },
      { label: 'Operación', value: 'Autogestión' },
    ],
    capabilities: [
      'Motor de disponibilidad configurable con intervalos flexibles (15, 30, 45 y 60 minutos).',
      'Sincronización bidireccional con Google Calendar que previene dobles reservas al instante.',
      'Disparo automático de confirmaciones y recordatorios preventivos por WhatsApp y correo.',
      'Panel operativo para gestionar agenda diaria, sobreturnos, descansos y días no laborables.',
    ],
    architecture: [
      'Motor de validación y resolución de solapamientos horarios en tiempo real',
      'Integración mediante webhooks con Google Calendar API para consistencia bidireccional',
      'Tareas programadas serverless para notificaciones preventivas previas a cada cita',
      'Interfaz responsive accesible diseñada bajo criterios WCAG 2.1 AA',
    ],
    techLogos: ['react', 'typescript', 'tailwindcss', 'googlecalendar', 'postgresql', 'vercel'],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Google Calendar API', 'PostgreSQL', 'Edge Functions'],
  },
  {
    id: 'matrify',
    index: '03',
    name: 'Matrify',
    tagline:
      'Sistema integral para la digitalización del proceso de inscripción y matriculación estudiantil, reemplazando el papel por un flujo online.',
    domain: 'matrify.vercel.app',
    url: 'https://matrify.vercel.app',
    logo: '/images/logos/matrify-logo.svg',
    logoBg: 'light',
    logoHeight: '28px',
    category: 'EdTech · Digitalización & Gestión Institucional',
    summary:
      'Suite modular para instituciones educativas que reemplaza planillas impresas, carpetas físicas y carga manual por un circuito 100% digital. Unifica captación, carga documental, firma electrónica de familias y emisión automatizada de legajos estudiantiles.',
    problem:
      'Las secretarías escolares enfrentan cada ciclo lectivo cuellos de botella por formularios manuscritos, documentación extraviada y semanas de transcripción manual.',
    operationalFlow:
      'Alta y declaración jurada guiada por etapas → carga y pre-validación de DNI y certificados → firma electrónica de tutores → emisión automática de legajo oficial en PDF.',
    uxAndAutomation:
      'Experiencia clara para familias desde cualquier dispositivo con guardado de borrador, procesamiento asistido de documentos y trazabilidad completa por alumno para dirección y secretaría.',
    role: 'AI Developer · Arquitectura de Producto · UX/UI & Flujos Documentales',
    highlights: [
      { label: 'Formularios papel', value: '0%' },
      { label: 'Legajo oficial', value: 'PDF automático' },
      { label: 'Validación', value: 'Asistida' },
      { label: 'Acceso', value: 'Multi-rol' },
    ],
    capabilities: [
      'Inscripción modular por etapas con guardado automático de avance y continuidad multidispositivo.',
      'Compresión y pre-validación guiada de DNI, partidas de nacimiento y certificados médicos.',
      'Módulo de firma electrónica para familias y autoridades con registro auditable.',
      'Generación y exportación masiva de legajos oficiales foliados en PDF listos para archivo.',
    ],
    architecture: [
      'Procesamiento y optimización de imágenes documentales en el navegador antes del envío',
      'Motor serverless de ensamblado de legajos PDF vectoriales con sellado de tiempo',
      'Control de acceso basado en roles para dirección, secretaría, preceptores y familias',
      'Registro de auditoría inmutable para seguimiento del estado de cada matrícula',
    ],
    techLogos: ['nextjs', 'react', 'typescript', 'tailwindcss', 'cloudflare', 'vercel'],
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'PDF Engine', 'Cloud Storage'],
  },
];

export const LabsApp: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<LabSystem | null>(null);

  useEffect(() => {
    if (!selectedSystem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedSystem(null);
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedSystem]);

  return (
    <div className="relative min-h-screen text-[#010101] selection:bg-[#cc0000] selection:text-white overflow-x-clip">
      {/* ── Fixed GSAP ScrollTrigger Vector Motion Graphics Background (z-0) */}
      <LabsScrollBackground />

      {/* ── Foreground Editorial Content (relative z-10) ───────────────── */}
      <main className="relative z-10">
        {/* ── Editorial Header & Stipple-to-Solid DotReveal Headline ───── */}
        <header className="pt-16 pb-24 md:pt-24 md:pb-36 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="max-w-2xl lg:max-w-[640px]">
            <p className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-[#666666] uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000]" aria-hidden="true" />
              <span>Alicari Labs · AI Developer · Diseño Multimedia & UX/UI</span>
            </p>

            <DotRevealHeadline
              lines={LABS_HEADLINE_LINES}
              accessibleHeading="Alicari Labs — Sistemas digitales diseñados y construidos de punta a punta."
              className="mb-8"
            />

            <p className="text-base sm:text-lg text-[#3a3a3a] font-light leading-relaxed mb-8 bg-[#F6F6F6]/80 backdrop-blur-[2px] rounded-xl p-3 -mx-3">
              Alicari Labs reúne los sistemas propios que desarrollo como{' '}
              <strong className="font-medium text-[#010101]">AI Developer</strong>, apalancados en mi
              experiencia en{' '}
              <strong className="font-medium text-[#010101]">Diseño Multimedia y UX/UI</strong>. Cada
              plataforma nace de un problema operativo concreto y se resuelve combinando arquitectura
              de producto, automatización e interfaces claras sin fricción.
            </p>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-5 pt-5 border-t border-[#dedbd3]/90 bg-[#F6F6F6]/75 backdrop-blur-[2px] rounded-xl p-3 -mx-3">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.12em] text-[#78756e] mb-1">Perfil</dt>
                <dd className="text-xs sm:text-sm font-medium text-[#010101] m-0">AI Developer + UX/UI</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.12em] text-[#78756e] mb-1">Foco</dt>
                <dd className="text-xs sm:text-sm font-medium text-[#010101] m-0">Sistemas & IA</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.12em] text-[#78756e] mb-1">Sistemas</dt>
                <dd className="text-xs sm:text-sm font-medium text-[#010101] m-0">3 en producción</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.12em] text-[#78756e] mb-1">Criterio</dt>
                <dd className="text-xs sm:text-sm font-medium text-[#010101] m-0">Producto & UX</dd>
              </div>
            </dl>
          </div>
        </header>

        {/* ── Systems Showcase (Airy Left-Anchored Editorial Runway) ───── */}
        <section
          aria-label="Sistemas desarrollados en Alicari Labs"
          className="py-20 md:py-32 pb-28 md:pb-44 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto"
        >
          <div className="max-w-xl lg:max-w-[580px] mb-16 md:mb-24 bg-[#F6F6F6]/80 backdrop-blur-[2px] rounded-xl p-3 -mx-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8a8a8a] m-0 mb-2">
              01 — 03 · Sistemas Operativos
            </p>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#010101] m-0">
              Sistemas en Alicari Labs
            </h2>
            <p className="text-sm text-[#555555] font-light mt-2 m-0 leading-relaxed">
              Arquitectura, flujos operativos, automatización y experiencia de usuario aplicada a problemas reales.
            </p>
          </div>

          <div className="space-y-24 md:space-y-40 max-w-xl lg:max-w-[580px]">
            {LAB_SYSTEMS.map((system) => (
              <article
                key={system.id}
                className="bg-[#F6F6F6]/82 hover:bg-white/92 backdrop-blur-[3px] rounded-2xl border border-[#dedbd3]/90 hover:border-[#cfccc4] p-6 sm:p-7 transition-all duration-300 shadow-[0_6px_28px_rgba(1,1,1,0.03)] hover:shadow-[0_14px_38px_rgba(1,1,1,0.06)]"
              >
                {/* Top Bar: Official Logo + Index */}
                <div className="flex items-center justify-between gap-4 pb-5 mb-5 border-b border-[#e5e2dc]">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`px-3 py-2 rounded-lg border flex items-center shrink-0 ${
                        system.logoBg === 'dark'
                          ? 'bg-[#010101] border-[#010101]'
                          : 'bg-white border-[#e5e2dc]'
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
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#78756e] m-0 truncate">
                        {system.category}
                      </p>
                      <h3 className="text-xl font-medium tracking-[-0.015em] text-[#010101] m-0 mt-0.5">
                        {system.name}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium tracking-[0.14em] text-[#8a8a8a] tabular-nums shrink-0">
                    SYS / {system.index}
                  </span>
                </div>

                {/* Concise Copy */}
                <p className="text-base text-[#010101] font-normal leading-snug m-0 mb-3">
                  {system.tagline}
                </p>

                <p className="text-sm text-[#4a4a4a] font-light leading-relaxed m-0 mb-5">
                  {system.summary}
                </p>

                {/* Compact Operational Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  {system.highlights.map((item) => (
                    <div
                      key={item.label}
                      className="px-2.5 py-2 rounded-lg bg-white/75 border border-[#e6e4de]"
                    >
                      <div className="text-xs sm:text-sm font-medium text-[#010101] truncate">
                        {item.value}
                      </div>
                      <div className="text-[9px] uppercase tracking-[0.08em] text-[#78756e] mt-0.5 leading-tight truncate">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Official Tech SVG Logos */}
                <div className="pb-5 mb-5 border-b border-[#e5e2dc]">
                  <TechLogoRow items={system.techLogos} />
                </div>

                {/* Compact Action Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <a
                    href={system.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[44px] px-4 py-2.5 rounded-lg bg-[#010101] hover:bg-[#cc0000] text-white text-xs font-medium tracking-[0.1em] uppercase transition-colors flex items-center justify-center gap-2 no-underline focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:ring-offset-2"
                    aria-label={`Abrir sitio oficial de ${system.name} en una nueva pestaña`}
                  >
                    <span>{system.domain}</span>
                    <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedSystem(system)}
                    className="sm:w-auto min-h-[44px] px-4 py-2.5 rounded-lg bg-white/85 hover:bg-white text-[#010101] text-xs font-medium tracking-[0.1em] uppercase border border-[#dedbd3] transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#010101] focus:ring-offset-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#78756e]" aria-hidden="true" />
                    <span>Detalle</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

      {/* ── Technical Specification Modal ──────────────────────────────── */}
      {selectedSystem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="system-modal-title"
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-[2px] animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedSystem(null);
            }
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white border border-[#e8e6e1] p-6 sm:p-8 text-[#010101] shadow-2xl animate-scaleUp">
            <button
              type="button"
              onClick={() => setSelectedSystem(null)}
              className="absolute top-5 right-5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-[#f6f6f6] hover:bg-[#e8e6e1] text-[#010101] border-0 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
              aria-label="Cerrar ficha técnica"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pr-12">
              <div
                className={`px-3 py-2 rounded-lg border flex items-center shrink-0 ${
                  selectedSystem.logoBg === 'dark'
                    ? 'bg-[#010101] border-[#010101]'
                    : 'bg-[#fafafa] border-[#e8e6e1]'
                }`}
              >
                <img
                  src={selectedSystem.logo}
                  alt={selectedSystem.name}
                  style={{ height: '24px', width: 'auto' }}
                  className="block object-contain"
                />
              </div>
              <span className="text-[11px] uppercase tracking-[0.12em] text-[#8a8a8a]">
                {selectedSystem.category}
              </span>
            </div>

            <h3
              id="system-modal-title"
              className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#010101] mb-2"
            >
              {selectedSystem.name}
            </h3>

            <p className="text-sm sm:text-base text-[#4a4a4a] font-light leading-relaxed mb-6">
              {selectedSystem.tagline}
            </p>

            {/* Problem & Operational Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-[#fafaf8] border border-[#eceae4]">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] font-medium text-[#cc0000] mb-1.5">
                  <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Problema Operativo</span>
                </div>
                <p className="text-xs text-[#4a4a4a] font-light leading-relaxed m-0">
                  {selectedSystem.problem}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#fafaf8] border border-[#eceae4]">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] font-medium text-[#010101] mb-1.5">
                  <Workflow className="w-3.5 h-3.5 text-[#cc0000]" aria-hidden="true" />
                  <span>Flujo & UX</span>
                </div>
                <p className="text-xs text-[#4a4a4a] font-light leading-relaxed m-0">
                  {selectedSystem.operationalFlow}
                </p>
              </div>
            </div>

            {/* Architecture */}
            <div className="mb-6">
              <h4 className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#8a8a8a] mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#cc0000]" aria-hidden="true" />
                <span>Arquitectura Técnica</span>
              </h4>
              <ul className="space-y-2 list-none p-0 m-0 text-xs sm:text-sm text-[#333333] font-light">
                {selectedSystem.architecture.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#cc0000] mt-2 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Capabilities */}
            <div className="mb-6">
              <h4 className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#8a8a8a] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#010101]" aria-hidden="true" />
                <span>Capacidades del Sistema</span>
              </h4>
              <ul className="space-y-2 list-none p-0 m-0 text-xs sm:text-sm text-[#333333] font-light">
                {selectedSystem.capabilities.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check
                      className="w-4 h-4 text-[#010101] mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stack */}
            <div className="mb-8">
              <h4 className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#8a8a8a] mb-3">
                Tecnologías
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedSystem.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded text-xs bg-[#f6f6f6] text-[#010101] border border-[#e8e6e1]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-[#e8e6e1]">
              <button
                type="button"
                onClick={() => setSelectedSystem(null)}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-lg bg-[#f6f6f6] hover:bg-[#e8e6e1] text-[#010101] text-xs font-medium uppercase tracking-[0.1em] border-0 cursor-pointer transition-colors"
              >
                Cerrar
              </button>

              <a
                href={selectedSystem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[44px] px-6 py-2 rounded-lg bg-[#010101] hover:bg-[#cc0000] text-white text-xs font-medium uppercase tracking-[0.1em] no-underline transition-colors flex items-center justify-center gap-2"
              >
                <span>Ir a {selectedSystem.domain}</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};
