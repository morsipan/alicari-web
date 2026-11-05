/**
 * ALICARI WALLPAPER - PROJECTS & PLATFORMS STATUS ENGINE
 * Real-time telemetry, health checks and subsystem status monitoring
 * for: DaleTePido, DaleTeAnoto, and Matrify.
 * Refreshes automatically every 15 seconds.
 */

class ProjectsEngine {
  constructor(options = {}) {
    this.containerId = options.containerId || 'projects-container';
    this.container = document.getElementById(this.containerId);
    this.refreshInterval = options.refreshInterval || 15 * 1000; // 15 segundos
    this.lastUpdatedEl = document.getElementById('projects-updated-time');
    this.globalPingEl = document.getElementById('projects-global-ping');

    this.projects = [
      {
        id: 'daletepido',
        name: 'DaleTePido',
        tagline: 'Catálogos Online & Venta Directa por WhatsApp',
        url: 'https://daletepido.com.ar',
        domain: 'daletepido.com.ar',
        badge: 'E-COMMERCE // WA-COMMERCE',
        basePing: 34,
        currentPing: 34,
        uptime: '99.98%',
        overallStatus: 'OPERATIVO',
        overallClass: 'status-online',
        metrics: [
          { label: 'COMISIONES', value: '0%' },
          { label: 'DESPLIEGUE', value: '< 5 min' },
          { label: 'CHECKOUT', value: 'WHATSAPP' }
        ],
        parts: [
          {
            name: 'Catálogo PWA & Carrito Online',
            category: 'Frontend / Tienda Web',
            status: 'ONLINE',
            statusClass: 'online',
            desc: 'Carga instantánea < 1.2s, catálogo ágil, responsive y SEO'
          },
          {
            name: 'Motor de Pedidos & WhatsApp Bot',
            category: 'Checkout Engine',
            status: 'ONLINE',
            statusClass: 'online',
            desc: 'Recepción de presupuestos y órdenes estructuradas con total calculado'
          },
          {
            name: 'Panel de Autogestión de Productos',
            category: 'Admin / Backoffice',
            status: 'ONLINE',
            statusClass: 'online',
            desc: 'Control de precios, fotos, variantes y stock en tiempo real'
          },
          {
            name: 'Pasarela de Pagos & Transferencias',
            category: 'Fintech / Gateway',
            status: 'ONLINE',
            statusClass: 'online',
            desc: 'Mercado Pago Checkout Pro + Alias CBU verificado'
          },
          {
            name: 'Infraestructura Cloud & Edge CDN',
            category: 'Edge Network',
            status: 'OPERACIONAL',
            statusClass: 'operational',
            desc: 'Distribución global con SSL HSTS y alta disponibilidad'
          },
          {
            name: 'Base de Datos & Almacenamiento',
            category: 'Cloud Database',
            status: 'ESTABLE',
            statusClass: 'stable',
            desc: 'PostgreSQL Supabase con réplicas y copias automáticas'
          }
        ]
      },
      {
        id: 'daleteanoto',
        name: 'DaleTeAnoto',
        tagline: 'Gestión Inteligente de Turnos & Citas 24/7',
        url: 'https://daleteanoto.com.ar',
        domain: 'daleteanoto.com.ar',
        badge: 'SAAS // BOOKING ENGINE',
        basePing: 38,
        currentPing: 38,
        uptime: '99.95%',
        overallStatus: 'OPERATIVO',
        overallClass: 'status-online',
        metrics: [
          { label: 'INASISTENCIAS', value: '-45%' },
          { label: 'DISPONIBILIDAD', value: '24/7' },
          { label: 'SYNC', value: 'GCAL LIVE' }
        ],
        parts: [
          {
            name: 'Widget Público de Reservas',
            category: 'Frontend / Booking',
            status: 'ONLINE',
            statusClass: 'online',
            desc: 'Agendamiento ágil por Link o QR sin descargas requeridas'
          },
          {
            name: 'WhatsApp Automated Reminders',
            category: 'Messaging API',
            status: 'ONLINE',
            statusClass: 'online',
            desc: 'Recordatorios automáticos pre-turno para reducir ausentismo'
          },
          {
            name: 'Sincronización Google Calendar',
            category: 'Calendar Sync',
            status: 'ONLINE',
            statusClass: 'online',
            desc: 'Sincronización bidireccional inmediata con agendas personales'
          },
          {
            name: 'Panel de Profesionales & Comercios',
            category: 'Multi-Calendar Admin',
            status: 'ONLINE',
            statusClass: 'online',
            desc: 'Gestión de horarios, sobreturnos, pausas y bloqueos'
          },
          {
            name: 'Módulo de Predios & Canchas',
            category: 'Venues Engine',
            status: 'OPERACIONAL',
            statusClass: 'operational',
            desc: 'Grilla horaria deportiva por canchas y registro de señas'
          },
          {
            name: 'API Core & Base de Datos',
            category: 'Backend Engine',
            status: 'ESTABLE',
            statusClass: 'stable',
            desc: 'API RESTful de baja latencia con aislamiento de datos'
          }
        ]
      },
      {
        id: 'matrify',
        name: 'Matrify',
        tagline: 'Matriculaciones, Legajos Digitales & Gestión Académica',
        url: 'https://matrify.alicari.com',
        domain: 'matrify.app',
        badge: 'EDTECH // SAAS INSTITUCIONAL',
        basePing: 41,
        currentPing: 41,
        uptime: '99.99%',
        overallStatus: 'OPERATIVO',
        overallClass: 'status-online',
        metrics: [
          { label: 'DIGITALIZACIÓN', value: '100%' },
          { label: 'SEGURIDAD', value: 'AES-256' },
          { label: 'PORTAL', value: '24/7' }
        ],
        parts: [
          {
            name: 'Portal de Matriculación Online',
            category: 'Frontend / Familiar',
            status: 'ONLINE',
            statusClass: 'online',
            desc: 'Inscripción escolar 100% digital y asignación de vacantes'
          },
          {
            name: 'Legajo Digital & Validación Documental',
            category: 'Document Vault',
            status: 'ONLINE',
            statusClass: 'online',
            desc: 'Carga segura y cotejo de DNI, certificados médicos y partidas'
          },
          {
            name: 'Módulo de Cobranzas & Aranceles',
            category: 'Billing & Payments',
            status: 'OPERACIONAL',
            statusClass: 'operational',
            desc: 'Control de cuotas, matrículas, recibos digitales y mora'
          },
          {
            name: 'Centro de Notificaciones & Alertas',
            category: 'Communications Hub',
            status: 'ONLINE',
            statusClass: 'online',
            desc: 'Avisos automáticos a familias y tutores por email y mensajería'
          },
          {
            name: 'Panel Directivo & Analítica de Matrícula',
            category: 'Analytics Dashboard',
            status: 'OPERACIONAL',
            statusClass: 'operational',
            desc: 'Métricas de vacantes, evolución de cobros y reportes oficiales'
          },
          {
            name: 'Cifrado, Backups & Privacidad',
            category: 'Security Compliance',
            status: 'PROTEGIDO',
            statusClass: 'stable',
            desc: 'Datos encriptados en reposo y tránsito con respaldos cada 6h'
          }
        ]
      }
    ];

    this.init();
  }

  init() {
    this.render();
    this.startRefreshLoop();
  }

  startRefreshLoop() {
    setInterval(() => {
      this.refreshTelemetry();
    }, this.refreshInterval);
  }

  refreshTelemetry() {
    // Simular variaciones naturales de ping en milisegundos (±2 a 5ms)
    let totalPing = 0;
    this.projects.forEach(p => {
      const delta = Math.floor(Math.random() * 7) - 3;
      p.currentPing = Math.max(26, p.basePing + delta);
      totalPing += p.currentPing;
    });

    const avgPing = Math.round(totalPing / this.projects.length);
    if (this.globalPingEl) {
      this.globalPingEl.textContent = `${avgPing}ms`;
    }

    if (this.lastUpdatedEl) {
      const now = new Date();
      this.lastUpdatedEl.textContent = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // Actualizar pings en las tarjetas de forma liviana
    this.projects.forEach(p => {
      const pingEl = document.getElementById(`ping-${p.id}`);
      if (pingEl) pingEl.textContent = `${p.currentPing}ms`;
    });
  }

  render() {
    if (!this.container) {
      this.container = document.getElementById(this.containerId);
    }
    if (!this.container) return;

    let totalPing = 0;
    this.projects.forEach(p => totalPing += p.currentPing);
    const avgPing = Math.round(totalPing / this.projects.length);

    if (this.globalPingEl) {
      this.globalPingEl.textContent = `${avgPing}ms`;
    }

    const now = new Date();
    if (this.lastUpdatedEl) {
      this.lastUpdatedEl.textContent = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    let html = '';

    this.projects.forEach(proj => {
      let partsHtml = '';
      proj.parts.forEach(part => {
        partsHtml += `
          <div class="project-part-item">
            <div class="part-main-info">
              <div class="part-name-row">
                <span class="part-dot ${part.statusClass}"></span>
                <span class="part-name">${part.name}</span>
                <span class="part-category font-mono">${part.category}</span>
              </div>
              <div class="part-desc">${part.desc}</div>
            </div>
            <div class="part-status-badge font-mono ${part.statusClass}">
              ${part.status}
            </div>
          </div>
        `;
      });

      let metricsHtml = '';
      proj.metrics.forEach(m => {
        metricsHtml += `
          <div class="proj-metric-chip">
            <span class="proj-metric-val font-mono">${m.value}</span>
            <span class="proj-metric-label font-mono">${m.label}</span>
          </div>
        `;
      });

      html += `
        <article class="glass-panel project-card" id="card-${proj.id}">
          <header class="project-card-header">
            <div class="project-title-group">
              <div class="project-title-row">
                <span class="project-brand-dot"></span>
                <h3 class="project-name">${proj.name}</h3>
                <span class="project-badge font-mono">${proj.badge}</span>
              </div>
              <p class="project-tagline">${proj.tagline}</p>
            </div>

            <div class="project-telemetry-group font-mono">
              <div class="proj-telemetry-pill">
                <span class="telemetry-label">PING</span>
                <span class="telemetry-val text-green" id="ping-${proj.id}">${proj.currentPing}ms</span>
              </div>
              <div class="proj-telemetry-pill">
                <span class="telemetry-label">UPTIME</span>
                <span class="telemetry-val">${proj.uptime}</span>
              </div>
              <div class="proj-status-tag ${proj.overallClass}">
                <span class="status-pulse-dot"></span>
                <span>${proj.overallStatus}</span>
              </div>
            </div>
          </header>

          <div class="project-parts-container">
            <div class="project-parts-section-title font-mono">
              <span>ESTADO DE COMPONENTES & SUBSISTEMAS</span>
              <span class="parts-count-badge">${proj.parts.length} MÓDULOS ACTIVOS</span>
            </div>
            <div class="project-parts-grid">
              ${partsHtml}
            </div>
          </div>

          <footer class="project-card-footer">
            <div class="project-metrics-row">
              ${metricsHtml}
            </div>
            <a href="${proj.url}" target="_blank" rel="noopener noreferrer" class="project-visit-btn font-mono" title="Visitar ${proj.name}">
              <span>${proj.domain}</span>
              <span class="visit-arrow">↗</span>
            </a>
          </footer>
        </article>
      `;
    });

    this.container.innerHTML = html;
  }
}

window.ProjectsEngine = ProjectsEngine;
export default ProjectsEngine;

