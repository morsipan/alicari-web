import React, { useState } from 'react';
import {
  ExternalLink,
  Smartphone,
  Calendar,
  GraduationCap,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  X,
  MessageSquare,
} from 'lucide-react';

export interface LabProject {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  completion: number;
  category: string;
  description: string;
  problem: string;
  solution: string;
  metrics: { label: string; value: string }[];
  features: string[];
  techStack: string[];
  architecture: string[];
  icon: React.ReactNode;
  accentColor: string;
  demoUrl?: string;
}

export const LAB_PROJECTS: LabProject[] = [
  {
    id: 'dale-te-pido',
    name: 'Dale Te Pido',
    tagline: 'Catálogo web para ventas directas por WhatsApp sin pasarela ni comisiones.',
    badge: '90% Completado • Beta Activa',
    completion: 90,
    category: 'E-Commerce Ágil // Retail & Gastro',
    accentColor: '#25D366', // WhatsApp green accent
    icon: <Smartphone className="w-6 h-6 text-[#25D366]" />,
    description:
      'Solución ligera y sin fricción de venta para pequeños comercios y negocios gastronómicos. Los clientes arman su carrito visualmente en el navegador y con un solo toque envían el pedido estructurado con resumen de precios directamente al WhatsApp del negocio.',
    problem:
      'Las plataformas tradicionales de e-commerce imponen comisiones abusivas (5% al 15% por venta), checkout tedioso con registros obligatorios y pasarelas bancarias lentas que provocan abandonos masivos de carritos en compras rápidas o locales.',
    solution:
      'Eliminación total del checkout bancario obligatorio: catálogo ultra-rápido PWA, selección de variantes, cálculo inteligente de costo de envío según barrio/zona y generación instantánea del mensaje estructurado de WhatsApp.',
    metrics: [
      { label: 'Tiempo de armado de pedido', value: '< 45s' },
      { label: 'Comisiones por venta', value: '0%' },
      { label: 'Aumento en conversión', value: '+34%' },
      { label: 'Peso del bundle', value: '< 65kb' },
    ],
    features: [
      'Catálogo visual ultra-rápido optimizado para smartphones.',
      'Generador de mensaje formateado con emojis, cantidades y desglose total.',
      'Cálculo de envío personalizable por franjas horarias o zonas.',
      'Panel administrativo simple para modificar precios y stock en segundos.',
      'PWA instalable sin necesidad de App Store ni Google Play.',
    ],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase Realtime', 'WhatsApp Cloud Protocol', 'Vite'],
    architecture: [
      'Frontend PWA en Vite + Tailwind con estado offline',
      'Base de datos Supabase / PostgreSQL con sincronización instantánea',
      'Formateador determinista de URI whatsapp://send y api.whatsapp.com',
      'Despliegue serverless perimetral (Edge CDN) con caché ultra-baja latencia',
    ],
  },
  {
    id: 'dale-te-anoto',
    name: 'Dale Te Anoto',
    tagline: 'Turnera ágil y gestión de citas sin obligatoriedad de cobro por adelantado.',
    badge: '90% Completado • Pruebas de Campo',
    completion: 90,
    category: 'Booking & Agenda // Servicios',
    accentColor: '#38bdf8', // Sky blue
    icon: <Calendar className="w-6 h-6 text-sky-400" />,
    description:
      'Sistema intuitivo de reserva de citas y gestión de disponibilidad horaria diseñado para profesionales independientes, consultorios médicos, estéticas, barberías y talleres.',
    problem:
      'La mayoría de las turneras exigen tarjeta de crédito para reservar o tienen interfaces sobrecargadas con configuraciones engorrosas que alejan a clientes habituales que solo desean apartar una hora rápidamente.',
    solution:
      'Flujo de reserva en dos pasos: el cliente escoge servicio y horario disponible en tiempo real, recibe recordatorio automático y el profesional gestiona su agenda integrada bidireccionalmente con Google Calendar.',
    metrics: [
      { label: 'Pasos de reserva', value: '2 clics' },
      { label: 'Reducción de ausentismo', value: '42%' },
      { label: 'Citas confirmadas', value: '3x' },
      { label: 'Sincronización Calendar', value: 'Instantánea' },
    ],
    features: [
      'Selector de turnos con intervalos configurables (15m, 30m, 45m, 60m).',
      'Reglas de anticipación mínima y bloqueo de días festivos.',
      'Sincronización en tiempo real con Google Calendar (evita dobles reservas).',
      'Recordatorios automáticos vía WhatsApp y Email con opción de reprogramación.',
      'Dashboard del profesional con vista de agenda diaria y métricas de concurrencia.',
    ],
    techStack: ['React 19', 'Tailwind CSS', 'Google Calendar API', 'Node.js Edge Functions', 'PostgreSQL'],
    architecture: [
      'Motor de validación de solapamiento horario en tiempo real',
      'Webhook receptor para cambios de agenda en Google Calendar',
      'Servicio cron de notificaciones preventivas previas a la cita',
      'Portal responsive accesible con navegación por teclado y lectores de pantalla',
    ],
  },
  {
    id: 'matrify',
    name: 'Matrify',
    tagline: 'Digitalización integral de la matriculación estudiantil y legajos académicos.',
    badge: '90% Completado • Piloto Institucional',
    completion: 90,
    category: 'EdTech // Automatización Institucional',
    accentColor: '#cc0000', // Alicari red
    icon: <GraduationCap className="w-6 h-6 text-[#cc0000]" />,
    description:
      'Plataforma integral para colegios, institutos y academias terciarias que transforma el engorroso proceso de matriculación manual en papel en un flujo digital fluido, auditable y con validez legal.',
    problem:
      'Las secretarías educativas colapsan a principio de año con formularios impresos ilegibles, fotocopias de DNI y certificados perdidos, largas filas de padres y semanas dedicadas a la carga manual de datos.',
    solution:
      'Un entorno web accesible donde las familias completan la declaración jurada, suben comprobantes con pre-validación visual, firman electrónicamente y el colegio genera legajos PDF estandarizados con un clic.',
    metrics: [
      { label: 'Uso de papel impreso', value: '0%' },
      { label: 'Horas de secretaría', value: '-85%' },
      { label: 'Trazabilidad de legajos', value: '100%' },
      { label: 'Satisfacción familiar', value: '98%' },
    ],
    features: [
      'Formulario modular por pasos con guardado automático de borrador.',
      'Carga guiada de fotos y escaneos de documentación con compresión en el cliente.',
      'Validación asistida de DNI, partidas de nacimiento y fichas médicas.',
      'Módulo de firma digital para tutores y autoridades directivas.',
      'Exportación en lote de legajos oficiales en formato PDF con foliado.',
    ],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'PDF-Lib', 'Cloudflare R2 Storage', 'Tesseract OCR'],
    architecture: [
      'Procesamiento y compresión de imágenes en el cliente (Sharp / Web Worker)',
      'Generación serverless de PDFs combinados con sellado de tiempo',
      'Control de accesos basado en roles (Directores, Preceptores, Tutores)',
      'Registro inmutable de auditoría para cambios de legajos estudiantiles',
    ],
  },
];

export const LabsProjects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<LabProject | null>(null);

  const triggerContactModal = () => {
    // Open existing site contact modal if available
    const modalTrigger = document.querySelector('.js-contact-trigger') as HTMLElement | null;
    if (modalTrigger) {
      modalTrigger.click();
    } else {
      window.location.hash = '#contacto';
    }
  };

  return (
    <section id="proyectos-labs" className="relative z-10 w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-widest text-[#cc0000] uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ALICARI PROPRIETARY LABS // 2026</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-anton uppercase tracking-tight text-white m-0">
            Proyectos en Desarrollo Activo
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-2xl font-light">
            Tres desarrollos in-house llevados al <strong className="text-white font-medium">90% de completitud</strong>, concebidos
            para eliminar fricciones reales en comercio, agendas y gestión educativa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-400">STATUS:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            3 PROYECTOS LISTOS PARA PILOTO
          </span>
        </div>
      </div>

      {/* ── Projects Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {LAB_PROJECTS.map((proj) => (
          <article
            key={proj.id}
            className="group relative flex flex-col justify-between rounded-xl bg-neutral-950/80 border border-white/10 hover:border-white/25 transition-all duration-300 hover:shadow-[0_0_30px_rgba(204,0,0,0.12)] overflow-hidden"
          >
            {/* Top accent line */}
            <div
              className="h-1 w-full transition-all duration-300 group-hover:h-1.5"
              style={{ backgroundColor: proj.accentColor }}
            />

            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                    {proj.icon}
                  </div>
                  <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                    {proj.badge}
                  </span>
                </div>

                <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-1">
                  {proj.category}
                </div>

                <h3 className="text-2xl font-anton uppercase tracking-tight text-white group-hover:text-neutral-100 transition-colors m-0">
                  {proj.name}
                </h3>

                <p className="text-sm font-medium text-neutral-300 mt-2 mb-4 leading-snug">
                  {proj.tagline}
                </p>

                <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed mb-6 font-light">
                  {proj.description}
                </p>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
                    <span>Avance técnico</span>
                    <span className="text-white font-bold">{proj.completion}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${proj.completion}%`,
                        backgroundColor: proj.accentColor,
                      }}
                    />
                  </div>
                </div>

                {/* Highlight Metrics */}
                <div className="grid grid-cols-2 gap-2.5 py-3 px-3 rounded-lg bg-white/[0.03] border border-white/5 mb-6">
                  {proj.metrics.slice(0, 2).map((m, mIdx) => (
                    <div key={mIdx}>
                      <div className="text-base sm:text-lg font-bold font-mono text-white">{m.value}</div>
                      <div className="text-[10px] font-mono text-neutral-400 uppercase leading-tight">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {proj.techStack.slice(0, 4).map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-neutral-300 border border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                  {proj.techStack.length > 4 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-neutral-500">
                      +{proj.techStack.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedProject(proj)}
                  className="flex-1 min-h-[44px] px-4 py-2 flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-mono text-xs tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                  aria-label={`Ver ficha técnica y detalles de ${proj.name}`}
                >
                  <Code2 className="w-4 h-4 text-neutral-300" />
                  <span>VER DETALLE</span>
                </button>

                <button
                  type="button"
                  onClick={triggerContactModal}
                  className="min-h-[44px] px-3.5 py-2 flex items-center justify-center rounded-lg bg-[#cc0000] hover:bg-[#b00000] active:bg-[#900000] text-white font-mono text-xs tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label={`Solicitar acceso anticipado a ${proj.name}`}
                  title="Solicitar prueba / piloto"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* ── Technical Modal / Ficha Técnica Completa ───────────────────── */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-proj-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-neutral-950 border border-white/20 p-6 sm:p-8 text-white shadow-2xl animate-scaleUp"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#404040 #171717',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
              aria-label="Cerrar ficha técnica"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                {selectedProject.icon}
              </div>
              <div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-white/10 text-neutral-300">
                  {selectedProject.badge}
                </span>
                <span className="block font-mono text-[11px] text-neutral-500 uppercase mt-1">
                  {selectedProject.category}
                </span>
              </div>
            </div>

            <h3 id="modal-proj-title" className="text-3xl sm:text-4xl font-anton uppercase tracking-tight text-white mb-2">
              {selectedProject.name}
            </h3>
            <p className="text-base text-neutral-300 font-medium mb-6">
              {selectedProject.tagline}
            </p>

            {/* Problem & Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-red-500/20">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#cc0000] uppercase mb-2">
                  <Zap className="w-4 h-4" />
                  <span>Problema que resuelve</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-light">
                  {selectedProject.problem}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/80 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Nuestra Solución</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-light">
                  {selectedProject.solution}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {selectedProject.metrics.map((m, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-lg font-bold font-mono text-white">{m.value}</div>
                  <div className="text-[10px] font-mono text-neutral-400 uppercase mt-1">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="mb-6">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#cc0000]" />
                Funcionalidades Principales
              </h4>
              <ul className="space-y-2 text-xs text-neutral-300">
                {selectedProject.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Architecture & Tech Stack */}
            <div className="mb-8">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                Arquitectura & Stack
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedProject.techStack.map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2.5 py-1 rounded text-xs font-mono bg-white/10 text-white border border-white/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <ul className="space-y-1.5 text-xs text-neutral-400 font-mono">
                {selectedProject.architecture.map((arch, aIdx) => (
                  <li key={aIdx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                    <span>{arch}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div className="text-xs text-neutral-400 font-mono">
                ¿Querés implementarlo en tu negocio o probar una demo privada?
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs tracking-wider transition-colors"
                >
                  CERRAR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProject(null);
                    triggerContactModal();
                  }}
                  className="flex-1 sm:flex-none min-h-[44px] px-5 py-2 rounded-lg bg-[#cc0000] hover:bg-[#b00000] active:bg-[#900000] text-white font-mono text-xs font-bold tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>SOLICITAR DEMO / PILOTO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

