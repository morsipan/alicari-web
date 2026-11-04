/**
 * ALICARI WALLPAPER - GOOGLE CALENDAR & AGENDA ENGINE
 * Parses iCal (.ics) private feeds and renders upcoming events across the next 5 days.
 * If a day has no events, it displays cleanly as "Libre".
 * 100% Client-side, private, and automatic live synchronization (15-second refresh).
 */

class AgendaEngine {
  constructor(options = {}) {
    this.containerId = options.containerId || 'calendar-widget';
    this.container = document.getElementById(this.containerId);
    this.storageKey = 'alicari_calendar_url';
    this.refreshInterval = options.refreshInterval || 15 * 1000; // 15 segundos

    // Priorizar URL en user-config.js si existe, luego localStorage
    const configUrl = (window.ALICARI_USER_CONFIG && window.ALICARI_USER_CONFIG.calendarUrl) ? window.ALICARI_USER_CONFIG.calendarUrl : '';
    this.calendarUrl = configUrl || localStorage.getItem(this.storageKey) || '';
    this.events = [];
    this.timer = null;

    this.init();
  }

  init() {
    if (this.calendarUrl) {
      this.fetchCalendar();
    } else {
      this.loadDefaultEvents();
      this.render();
    }

    // Intervalo de actualización automática cada 15 segundos
    setInterval(() => {
      if (this.calendarUrl) this.fetchCalendar();
      else this.render();
    }, this.refreshInterval);

    // Escuchar cambios de localStorage entre pestañas para auto-sync instantáneo
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.calendarUrl = e.newValue || '';
        if (this.calendarUrl) this.fetchCalendar();
        else {
          this.loadDefaultEvents();
          this.render();
        }
      }
    });
  }

  setCalendarUrl(url) {
    this.calendarUrl = (url || '').trim();
    if (this.calendarUrl) {
      localStorage.setItem(this.storageKey, this.calendarUrl);
      if (window.ALICARI_USER_CONFIG) window.ALICARI_USER_CONFIG.calendarUrl = this.calendarUrl;
      this.fetchCalendar();
    } else {
      localStorage.removeItem(this.storageKey);
      if (window.ALICARI_USER_CONFIG) window.ALICARI_USER_CONFIG.calendarUrl = '';
      this.loadDefaultEvents();
      this.render();
    }
  }

  getCalendarUrl() {
    return this.calendarUrl;
  }

  loadDefaultEvents() {
    const now = new Date();
    
    // Horas dinámicas distribuidas en los próximos 5 días
    const makeDayTime = (dayOffset, hours, minutes) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hours, minutes, 0, 0);
      return d;
    };

    this.events = [
      // Día 0 (Hoy)
      {
        id: 'demo-1',
        title: 'Daily Standup / Sincronización',
        start: makeDayTime(0, 10, 0),
        end: makeDayTime(0, 10, 30),
        location: 'Google Meet',
        isAllDay: false,
        isDemo: true
      },
      {
        id: 'demo-2',
        title: 'Revisión de Métricas & Mercados',
        start: makeDayTime(0, 15, 30),
        end: makeDayTime(0, 16, 30),
        location: 'Oficina / Sala A',
        isAllDay: false,
        isDemo: true
      },
      // Día 1 (Mañana)
      {
        id: 'demo-3',
        title: 'Sprint Review DaleTePido & Commerce',
        start: makeDayTime(1, 11, 0),
        end: makeDayTime(1, 12, 0),
        location: 'Google Meet',
        isAllDay: false,
        isDemo: true
      },
      // Día 2: Libre (sin eventos intencionalmente para mostrar estado "Libre")
      
      // Día 3:
      {
        id: 'demo-4',
        title: 'Planificación de Lanzamiento DaleTeAnoto / Matrify',
        start: makeDayTime(3, 16, 0),
        end: makeDayTime(3, 17, 30),
        location: 'Virtual',
        isAllDay: false,
        isDemo: true
      }
      // Día 4: Libre (sin eventos intencionalmente para mostrar estado "Libre")
    ];
  }

  async fetchCalendar() {
    if (!this.calendarUrl) return;

    try {
      this.setLoadingState(true);
      
      // Manejar feeds webcal:// y https://
      let fetchUrl = this.calendarUrl.replace(/^webcal:\/\//i, 'https://');
      
      // Intentar fetch directo con fallback a CORS proxy seguro si el navegador bloquea CORS
      let icsData = '';
      try {
        const res = await fetch(fetchUrl, { cache: 'no-cache' });
        if (res.ok) {
          icsData = await res.text();
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (corsErr) {
        // Fallback a proxy público de solo lectura CORS
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(fetchUrl)}`;
        const resProxy = await fetch(proxyUrl);
        if (resProxy.ok) {
          icsData = await resProxy.text();
        } else {
          throw new Error('No se pudo acceder al enlace del calendario');
        }
      }

      if (icsData) {
        this.events = this.parseICS(icsData);
        localStorage.setItem('alicari_calendar_cached_events', JSON.stringify(this.events));
      }
    } catch (err) {
      console.warn('[Agenda] Error sincronizando Google Calendar:', err.message);
      // Cargar eventos en caché si existen
      const cached = localStorage.getItem('alicari_calendar_cached_events');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          this.events = parsed.map(e => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end)
          }));
        } catch (e) {
          this.loadDefaultEvents();
        }
      } else {
        this.loadDefaultEvents();
      }
    } finally {
      this.setLoadingState(false);
      this.render();
    }
  }

  parseICS(icsText) {
    const lines = icsText.split(/\r\n|\n|\r/);
    const events = [];
    let currentEvent = null;

    // Desdoblar líneas partidas en RFC 5545
    const unfoldedLines = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
        line += lines[i + 1].substring(1);
        i++;
      }
      unfoldedLines.push(line);
    }

    const parseICSDate = (dateStr) => {
      if (!dateStr) return null;
      const clean = dateStr.replace(/^.*:/, '');
      if (clean.length === 8) { // YYYYMMDD (All day)
        const y = parseInt(clean.substring(0, 4), 10);
        const m = parseInt(clean.substring(4, 6), 10) - 1;
        const d = parseInt(clean.substring(6, 8), 10);
        return new Date(y, m, d, 0, 0, 0);
      }
      if (clean.includes('T')) {
        const [dPart, tPart] = clean.split('T');
        const y = parseInt(dPart.substring(0, 4), 10);
        const m = parseInt(dPart.substring(4, 6), 10) - 1;
        const d = parseInt(dPart.substring(6, 8), 10);
        const hh = parseInt(tPart.substring(0, 2), 10);
        const mm = parseInt(tPart.substring(2, 4), 10);
        const ss = parseInt(tPart.substring(4, 6) || '0', 10);

        if (clean.endsWith('Z')) {
          return new Date(Date.UTC(y, m, d, hh, mm, ss));
        }
        return new Date(y, m, d, hh, mm, ss);
      }
      return new Date(clean);
    };

    for (const line of unfoldedLines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        currentEvent = { isAllDay: false };
      } else if (line.startsWith('END:VEVENT')) {
        if (currentEvent && currentEvent.start && currentEvent.title) {
          if (!currentEvent.end) {
            // Default 1 hour if DTEND missing
            currentEvent.end = new Date(currentEvent.start.getTime() + 60 * 60 * 1000);
          }
          events.push(currentEvent);
        }
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith('SUMMARY')) {
          currentEvent.title = line.replace(/^SUMMARY[^:]*:/, '').trim() || 'Evento sin título';
        } else if (line.startsWith('DTSTART')) {
          currentEvent.start = parseICSDate(line);
          if (line.includes('VALUE=DATE')) currentEvent.isAllDay = true;
        } else if (line.startsWith('DTEND')) {
          currentEvent.end = parseICSDate(line);
        } else if (line.startsWith('LOCATION')) {
          currentEvent.location = line.replace(/^LOCATION[^:]*:/, '').trim();
        } else if (line.startsWith('UID')) {
          currentEvent.id = line.replace(/^UID[^:]*:/, '').trim();
        }
      }
    }

    // Filtrar sólo eventos desde hoy en adelante (próximos 5 días) y ordenar cronológicamente
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const limitDate = new Date(startOfToday.getTime() + 6 * 24 * 60 * 60 * 1000);

    return events
      .filter(ev => ev.start && ev.end && ev.end >= startOfToday && ev.start < limitDate)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  setLoadingState(loading) {
    const statusEl = document.getElementById('calendar-updated');
    if (statusEl) {
      statusEl.textContent = loading ? 'SYNCING...' : 'LIVE';
    }
  }

  formatTime(date) {
    if (!date) return '';
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  formatDayHeader(date, dayOffset) {
    if (!date) return '';
    const dayName = date.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase().replace('.', '');
    const dayNumber = date.getDate();
    const monthName = date.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase().replace('.', '');

    if (dayOffset === 0) {
      return `HOY • ${dayName} ${dayNumber} ${monthName}`;
    }
    if (dayOffset === 1) {
      return `MAÑANA • ${dayName} ${dayNumber} ${monthName}`;
    }
    return `${dayName} ${dayNumber} ${monthName}`;
  }

  getEventStatus(event) {
    const now = new Date();
    const start = new Date(event.start);
    const end = new Date(event.end);

    if (now >= start && now <= end) {
      return { label: 'EN CURSO', className: 'status-active', isCurrent: true };
    }

    const diffMinutes = Math.round((start - now) / (1000 * 60));
    if (diffMinutes > 0 && diffMinutes <= 60) {
      return { label: `EN ${diffMinutes} MIN`, className: 'status-soon', isSoon: true };
    }

    if (start.toDateString() === now.toDateString()) {
      return { label: 'HOY', className: 'status-today' };
    }

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (start.toDateString() === tomorrow.toDateString()) {
      return { label: 'MAÑANA', className: 'status-tomorrow' };
    }

    return { label: 'AGENDADO', className: 'status-upcoming' };
  }

  render() {
    if (!this.container) return;

    const listContainer = document.getElementById('calendar-events-list');
    const isConfigured = !!this.calendarUrl;

    const demoBadge = document.getElementById('calendar-mode-badge');
    if (demoBadge) {
      demoBadge.textContent = isConfigured ? 'GOOGLE CALENDAR' : 'MODO DEMO (SIN VINCULAR)';
      demoBadge.className = isConfigured ? 'box-sub-badge cal-badge-live font-mono' : 'box-sub-badge cal-badge-demo font-mono';
    }

    if (!listContainer) return;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Construir los próximos 5 días (Día 0 = Hoy, Día 1 = Mañana, ..., Día 4)
    const next5Days = [];
    for (let i = 0; i < 5; i++) {
      const dayStart = new Date(startOfToday.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayEvents = (this.events || []).filter(ev => {
        const s = new Date(ev.start);
        const e = new Date(ev.end);
        return s < dayEnd && e > dayStart;
      }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      next5Days.push({
        offset: i,
        date: dayStart,
        events: dayEvents
      });
    }

    let html = '';

    next5Days.forEach(day => {
      const dayTitle = this.formatDayHeader(day.date, day.offset);
      const hasEvents = day.events && day.events.length > 0;

      if (!hasEvents) {
        // Día libre sin eventos
        html += `
          <div class="calendar-day-block day-is-free">
            <div class="calendar-day-header font-mono">
              <div class="day-header-left">
                <span class="day-dot-indicator free"></span>
                <span class="day-title-text">${dayTitle}</span>
              </div>
              <span class="day-status-pill free font-mono">LIBRE</span>
            </div>
            <div class="calendar-day-free-box">
              <span class="free-icon-check">✓</span>
              <span class="free-main-text">Libre</span>
              <span class="free-sub-text font-mono">— Sin compromisos</span>
            </div>
          </div>
        `;
      } else {
        // Día con eventos
        let eventsHtml = '';
        day.events.forEach(ev => {
          const status = this.getEventStatus(ev);
          const startTime = ev.isAllDay ? 'Todo el día' : this.formatTime(new Date(ev.start));
          const endTime = ev.isAllDay ? '' : ` - ${this.formatTime(new Date(ev.end))}`;
          const locationBadge = ev.location ? `<span class="event-loc" title="${ev.location}">📍 ${ev.location}</span>` : '';

          eventsHtml += `
            <div class="calendar-event-row ${status.isCurrent ? 'event-is-current' : ''}">
              <div class="event-time-col font-mono">
                <span class="event-time-start">${startTime}</span>
                <span class="event-time-end">${endTime}</span>
              </div>

              <div class="event-details-col">
                <div class="event-title-row">
                  <span class="event-title" title="${ev.title}">${ev.title}</span>
                </div>
                ${locationBadge ? `<div class="event-meta-row">${locationBadge}</div>` : ''}
              </div>

              <div class="event-status-col">
                <span class="event-status-pill font-mono ${status.className}">${status.label}</span>
              </div>
            </div>
          `;
        });

        html += `
          <div class="calendar-day-block day-has-events">
            <div class="calendar-day-header font-mono">
              <div class="day-header-left">
                <span class="day-dot-indicator busy"></span>
                <span class="day-title-text">${dayTitle}</span>
              </div>
              <span class="day-status-pill busy font-mono">${day.events.length} ${day.events.length === 1 ? 'EVENTO' : 'EVENTOS'}</span>
            </div>
            <div class="calendar-day-events-list">
              ${eventsHtml}
            </div>
          </div>
        `;
      }
    });

    listContainer.innerHTML = html;
  }
}

window.AgendaEngine = AgendaEngine;
export default AgendaEngine;
