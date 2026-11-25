import React, { useState } from 'react';
import {
  ExternalLink,
  Code2,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Cpu,
  Smartphone,
  Calendar,
  GraduationCap,
  Sparkles,
  X,
  FileText,
  Clock,
  Check,
} from 'lucide-react';

export interface ProductionProject {
  id: string;
  name: string;
  tagline: string;
  domain: string;
  url: string;
  logo: string;
  logoBg?: 'dark' | 'light';
  logoHeight: string;
  category: string;
  badge: string;
  summary: string;
  problem: string;
  solution: string;
  role: string;
  metrics: { label: string; value: string }[];
  keyFeatures: string[];
  techStack: string[];
  architecture: string[];
}

export const PRODUCTION_PROJECTS: ProductionProject[] = [
  {
    id: 'dale-te-pido',
    name: 'Dale! Te Pido',
    tagline: 'Catálogo web para ventas ágiles y directas por WhatsApp sin checkout.',
    domain: 'daletepido.com.ar',
    url: 'https://daletepido.com.ar',
    logo: '/images/logos/daletepido-logo.png',
    logoBg: 'dark',
    logoHeight: '28px',
    category: 'E-Commerce Directo // Solución Comercial',
    badge: 'EN PRODUCCIÓN // EN VIVO',
    summary:
      'Plataforma de comercio ágil diseñada para pequeños negocios y locales gastronómicos. Los clientes navegan un catálogo visual de ultra-baja latencia, eligen variantes y envían el pedido estructurado con totales exactos directamente al chat de WhatsApp del vendedor, eliminando pasarelas bancarias y comisiones intermedias.',
    problem:
      'Las plataformas tradicionales de e-commerce imponen comisiones de hasta 15% por venta y obligan a procesos de registro y checkout tediosos que generan más del 70% de abandono en compras locales y cotidianas.',
    solution:
      'Catálogo PWA instantáneo con sincronización directa a WhatsApp. El comerciante cobra directo a su cuenta bancaria o alias sin intermediación financiera, y gestiona stock y precios en tiempo real.',
    role: 'AI Developer · Full-Stack & Architecture · UX/UI & Branding',
    metrics: [
      { label: 'Comisiones por venta', value: '0%' },
      { label: 'Tiempo de armado de pedido', value: '< 45 seg' },
      { label: 'Peso del bundle', value: '< 65 KB' },
      { label: 'Soporte inteligente', value: 'jAIme 24/7' },
    ],
    keyFeatures: [
      'Generador de mensaje formateado con emojis, cantidades, variantes y desglose de precios.',
      'Cálculo automático de costos de envío por zonas y franjas horarias.',
      'Panel de control en tiempo real para actualización de precios, fotos y stock.',
      'Kit imprimible descargable en PDF vectorial con QR para mostrador y vidriera.',
      'Asistente virtual jAIme impulsado por IA para resolución de consultas operativas.',
    ],
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase Realtime', 'WhatsApp Business Protocol', 'Vite'],
    architecture: [
      'Frontend PWA con caché perimetral optimizada para smartphones',
      'Base de datos PostgreSQL con sincronización instantánea vía Supabase',
      'Motor formateador de URI seguro para WhatsApp (sin exponer datos sensibles)',
      'Despliegue perimetral en Edge CDN con latencias de carga menores a 200ms',
    ],
  },
  {
    id: 'dale-te-anoto',
    name: 'Dale! Te Anoto',
    tagline: 'Sistema de gestión de turnos y citas autogestionadas sin pasarelas de pago obligatorias.',
    domain: 'daleteanoto.com.ar',
    url: 'https://daleteanoto.com.ar',
    logo: '/images/logos/daleteanoto-logo.png',
    logoBg: 'light',
    logoHeight: '34px',
    category: 'Booking & Agenda // Servicios Profesionales',
    badge: 'EN PRODUCCIÓN // EN VIVO',
    summary:
      'Sistema intuitivo de reserva de citas y gestión de turnos para profesionales independientes, consultorios médicos, barberías y salones de estética. Facilita la reserva inmediata sin barreras de pago por adelantado, integrando recordatorios automatizados y sincronización en tiempo real.',
    problem:
      'Las soluciones de turnos convencionales fuerzan el cobro por adelantado con tarjeta o poseen interfaces complejas que ahuyentan a clientes recurrentes que solo buscan apartar un horario disponible.',
    solution:
      'Reserva en dos pasos: selección de servicio y confirmación de franja horaria en tiempo real, sincronizada automáticamente con Google Calendar y respaldada por notificaciones preventivas.',
    role: 'Full-Stack Developer · Calendar Sync Architecture · UX/UI System',
    metrics: [
      { label: 'Pasos de reserva', value: '2 clics' },
      { label: 'Sincronización', value: 'Google Calendar' },
      { label: 'Reducción de inasistencias', value: '-40%' },
      { label: 'Requisitos de pago previo', value: '0' },
    ],
    keyFeatures: [
      'Selector de turnos con intervalos dinámicos configurables (15m, 30m, 45m, 60m).',
      'Sincronización bidireccional con Google Calendar para evitar solapamientos.',
      'Notificaciones y confirmaciones preventivas automáticas por WhatsApp y email.',
      'Panel del profesional con agenda diaria, gestión de sobreturnos y bloqueo de feriados.',
      'Diseño mobile-first pensado para interacción táctil rápida con una sola mano.',
    ],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Google Calendar API', 'Edge Functions', 'PostgreSQL'],
    architecture: [
      'Motor de resolución y validación de disponibilidad horaria en microsegundos',
      'Webhooks de sincronización continua con la suite de Google Workspace',
      'Servicio cron de recordatorios preventivos previos al turno asignado',
      'Componentes accesibles diseñados bajo estándares WCAG 2.1 AA',
    ],
  },
  {
    id: 'matrify',
    name: 'Matrify',
    tagline: 'Plataforma integral para la digitalización y matriculación estudiantil online, reemplazando el papel.',
    domain: 'matrify.vercel.app',
    url: 'https://matrify.vercel.app',
    logo: '/images/logos/matrify-logo.svg',
    logoBg: 'light',
    logoHeight: '32px',
    category: 'EdTech // Automatización Escolar Institucional',
    badge: 'PLATAFORMA INSTITUCIONAL // EN VIVO',
    summary:
      'Ecosistema integral diseñado para colegios, institutos y centros educativos que moderniza todo el ciclo de admisión y matriculación escolar. Reemplaza el papeleo físico y las largas filas en secretaría por un flujo 100% digital, seguro y con plena validez administrativa.',
    problem:
      'Las secretarías escolares colapsan anualmente procesando miles de formularios impresos manuscritos, fotocopias extraviadas y semanas de transcripción manual proensa a errores.',
    solution:
      'Plataforma modular con declaraciones juradas digitales, validación guiada de documentación (DNI, vacunas, actas), firma electrónica legal de tutores y generación automática de legajos PDF oficiales.',
    role: 'Product Architect · AI Document Workflows · End-to-End Development',
    metrics: [
      { label: 'Uso de formularios físicos', value: '0%' },
      { label: 'Tiempo de secretaría', value: '-85%' },
      { label: 'Firma electrónica', value: '100% Validez' },
      { label: 'Generación de legajos', value: 'Automática' },
    ],
    keyFeatures: [
      'Formulario por pasos con guardado automático de progreso y reanudación multidispositivo.',
      'Carga y compresión inteligente de certificados y documentos en el navegador.',
      'Pre-validación asistida de DNI, partidas de nacimiento y aptos físicos.',
      'Módulo de firma electrónica para padres, tutores y directivos escolares.',
      'Exportación unificada en lote de legajos PDF oficiales con foliado y sellado de tiempo.',
    ],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'PDF-Lib', 'Cloudflare Storage', 'OCR & Document Processing'],
    architecture: [
      'Pipeline de compresión y sanitización de documentos en el cliente antes de la subida',
      'Generador serverless de legajos PDF vectoriales de alta fidelidad',
      'Sistema de permisos granulares por rol (Directores, Preceptores, Familias)',
      'Registro inmutable de trazabilidad y auditoría de cambios documentales',
    ],
  },
];

export const LabsApp: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProductionProject | null>(null);

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#010101] selection:bg-[#cc0000] selection:text-white font-sans antialiased">
      {/* ── Page Header / Professional Positioning ─────────────────────── */}
      <section className="pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#e8e6e1]">
        <div className="max-w-4xl">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e8e6e1] text-[11px] font-mono tracking-widest text-[#8a8a8a] uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000]" />
            <span>ALICARI LABS // PRODUCT ENGINEERING</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#010101] leading-[1.05] mb-6">
            Software propio y herramientas de producción.
          </h1>

          <p className="text-lg sm:text-xl text-[#4a4a4a] font-normal leading-relaxed mb-8">
            Herramientas activas en producción diseñadas y desarrolladas de punta a punta. Soluciones que combinan
            lógica de <strong className="text-[#010101] font-semibold">AI Developer</strong> con más de dos décadas de trayectoria
            en <strong className="text-[#010101] font-semibold">Diseño Multimedia y UX/UI</strong>, enfocadas en resolver fricciones
            reales de negocio con una experiencia de usuario impecable.
          </p>

          {/* Core Strengths Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#e8e6e1]">
            <div>
              <div className="text-xs font-mono text-[#8a8a8a] uppercase tracking-wider mb-1">Capacidad</div>
              <div className="text-sm font-semibold text-[#010101]">Desarrollo End-to-End</div>
            </div>
            <div>
              <div className="text-xs font-mono text-[#8a8a8a] uppercase tracking-wider mb-1">Enfoque UX</div>
              <div className="text-sm font-semibold text-[#010101]">Cero Fricción de Uso</div>
            </div>
            <div>
              <div className="text-xs font-mono text-[#8a8a8a] uppercase tracking-wider mb-1">Estado</div>
              <div className="text-sm font-semibold text-[#010101] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                100% Funcional
              </div>
            </div>
            <div>
              <div className="text-xs font-mono text-[#8a8a8a] uppercase tracking-wider mb-1">Stack</div>
              <div className="text-sm font-semibold text-[#010101]">React · TypeScript · Cloud</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The 3 Production Projects Showcase ─────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#010101] m-0">
              Herramientas Activas en Producción
            </h2>
            <p className="text-sm text-[#666666] mt-1 font-normal">
              Tres plataformas independientes desarrolladas y operativas en la web.
            </p>
          </div>
          <div className="text-xs font-mono text-[#8a8a8a]">
            3 DE 3 OPERATIVAS // ALTA DISPONIBILIDAD
          </div>
        </div>

        {/* Projects Cards List */}
        <div className="space-y-10">
          {PRODUCTION_PROJECTS.map((project, index) => (
            <article
              key={project.id}
              className="bg-white rounded-2xl border border-[#e8e6e1] p-6 sm:p-10 transition-all duration-300 hover:shadow-xl hover:border-[#d5d2c9] flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-between"
            >
              {/* Left Column: Brand, Tagline, Problem / Solution */}
              <div className="flex-1 w-full">
                {/* Header: Logo & Badge */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  {/* Brand Logo Container */}
                  <div
                    className={`px-4 py-2.5 rounded-xl flex items-center border ${
                      project.logoBg === 'dark'
                        ? 'bg-[#010101] border-[#010101]'
                        : 'bg-[#fafafa] border-[#e8e6e1]'
                    }`}
                  >
                    <img
                      src={project.logo}
                      alt={`Logotipo oficial de ${project.name}`}
                      style={{ height: project.logoHeight, width: 'auto' }}
                      className="block object-contain"
                    />
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6f6f6] border border-[#e8e6e1] text-[11px] font-mono tracking-wider font-semibold text-[#010101]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {project.badge}
                  </span>
                </div>

                <div className="text-xs font-mono text-[#8a8a8a] uppercase tracking-wider mb-2">
                  {project.category}
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-[#010101] tracking-tight mb-3">
                  {project.name}
                </h3>

                <p className="text-base sm:text-lg text-[#010101] font-medium leading-snug mb-4">
                  {project.tagline}
                </p>

                <p className="text-sm text-[#4a4a4a] leading-relaxed mb-6 font-normal">
                  {project.summary}
                </p>

                {/* Problem vs Solution compact pills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e8e6e1]">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#cc0000] mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Problema Resuelto
                    </div>
                    <p className="text-xs text-[#555555] leading-relaxed">
                      {project.problem}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e8e6e1]">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Implementación Técnica
                    </div>
                    <p className="text-xs text-[#555555] leading-relaxed">
                      {project.solution}
                    </p>
                  </div>
                </div>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] font-mono text-[#8a8a8a] mr-1">STACK:</span>
                  {project.techStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#f6f6f6] text-[#010101] border border-[#e8e6e1]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Key Metrics, Capabilities & Actions */}
              <div className="w-full lg:w-80 shrink-0 flex flex-col justify-between pt-4 lg:pt-0 lg:border-l lg:border-[#e8e6e1] lg:pl-10">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {project.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="p-3 rounded-xl bg-[#fafafa] border border-[#e8e6e1]">
                      <div className="text-lg font-bold font-mono text-[#010101]">{m.value}</div>
                      <div className="text-[10px] font-mono text-[#8a8a8a] uppercase mt-0.5 leading-tight">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Role / Leadership */}
                <div className="mb-6 p-3 rounded-xl bg-white border border-[#e8e6e1]">
                  <div className="text-[10px] font-mono text-[#8a8a8a] uppercase tracking-wider mb-1">
                    Rol & Responsabilidad
                  </div>
                  <div className="text-xs font-semibold text-[#010101] leading-tight">
                    {project.role}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[46px] px-5 py-2.5 rounded-xl bg-[#010101] hover:bg-[#222222] active:bg-[#333333] text-white font-mono text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#010101]"
                    aria-label={`Visitar sitio web oficial de ${project.name}`}
                  >
                    <span>VISITAR {project.domain.toUpperCase()}</span>
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-[#fafafa] active:bg-[#f0f0f0] text-[#010101] font-mono text-xs tracking-wider border border-[#e8e6e1] transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                  >
                    <FileText className="w-4 h-4 text-[#8a8a8a]" />
                    <span>VER FICHA TÉCNICA</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Professional Synergy / Profile Backing ─────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#e8e6e1]">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#e8e6e1] p-8 sm:p-12">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#cc0000] uppercase font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PERFIL PROFESIONAL & METODOLOGÍA</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#010101] mb-4">
            Ingeniería de Producto con Criterio de Diseño
          </h2>

          <p className="text-base sm:text-lg text-[#4a4a4a] leading-relaxed font-normal mb-8">
            El desarrollo de herramientas no se limita a escribir código funcional; radica en entender la psicología
            del usuario y concebir arquitecturas resilientes. Cada una de estas soluciones refleja mi capacidad de
            integrar modelos de inteligencia artificial, pipelines modernos de React y sistemas de diseño consistentes
            en productos listos para el mercado.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#e8e6e1]">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#f6f6f6] border border-[#e8e6e1] flex items-center justify-center text-[#010101] mb-3">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#010101] mb-1">AI & Edge Computing</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Automatización de tareas complejas, OCR y microservicios serverless de respuesta instantánea.
              </p>
            </div>

            <div>
              <div className="w-8 h-8 rounded-lg bg-[#f6f6f6] border border-[#e8e6e1] flex items-center justify-center text-[#010101] mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#010101] mb-1">Diseño UX/UI Editorial</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Interfaces limpias, jerarquías visuales intuitivas y sistemas de diseño consistentes que no confunden.
              </p>
            </div>

            <div>
              <div className="w-8 h-8 rounded-lg bg-[#f6f6f6] border border-[#e8e6e1] flex items-center justify-center text-[#010101] mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#010101] mb-1">Pragmatismo de Negocio</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Herramientas enfocadas en conversión real, reduciendo pasos innecesarios y comisiones parasitarias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Technical Modal / Ficha Técnica Completa ───────────────────── */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-proj-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#e8e6e1] p-6 sm:p-8 text-[#010101] shadow-2xl animate-scaleUp"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d5d2c9 #f6f6f6',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-[#f6f6f6] hover:bg-[#e8e6e1] text-[#010101] transition-colors focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
              aria-label="Cerrar ficha técnica"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2.5 rounded-xl border flex items-center ${
                  selectedProject.logoBg === 'dark'
                    ? 'bg-[#010101] border-[#010101]'
                    : 'bg-[#f6f6f6] border-[#e8e6e1]'
                }`}
              >
                <img
                  src={selectedProject.logo}
                  alt={selectedProject.name}
                  style={{ height: '24px', width: 'auto' }}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#f6f6f6] text-[#010101] border border-[#e8e6e1]">
                  {selectedProject.badge}
                </span>
              </div>
            </div>

            <h3 id="modal-proj-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-[#010101] mb-2">
              {selectedProject.name}
            </h3>

            <p className="text-sm sm:text-base text-[#4a4a4a] font-medium leading-relaxed mb-6">
              {selectedProject.tagline}
            </p>

            {/* Architecture Highlights */}
            <div className="mb-6">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8a8a8a] mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#cc0000]" />
                Arquitectura de Software
              </h4>
              <ul className="space-y-2 text-xs text-[#4a4a4a]">
                {selectedProject.architecture.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Capabilities */}
            <div className="mb-6">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8a8a8a] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Capacidades Clave
              </h4>
              <ul className="space-y-2 text-xs text-[#4a4a4a]">
                {selectedProject.keyFeatures.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack */}
            <div className="mb-8">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8a8a8a] mb-3">
                Tecnologías Implementadas
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.techStack.map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2.5 py-1 rounded text-xs font-mono bg-[#f6f6f6] text-[#010101] border border-[#e8e6e1]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#e8e6e1]">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-xl bg-[#f6f6f6] hover:bg-[#e8e6e1] text-[#010101] font-mono text-xs tracking-wider transition-colors"
              >
                CERRAR
              </button>

              <a
                href={selectedProject.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[44px] px-6 py-2 rounded-xl bg-[#010101] hover:bg-[#222222] text-white font-mono text-xs font-semibold tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>PROBAR {selectedProject.domain.toUpperCase()}</span>
                <ArrowUpRight className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
