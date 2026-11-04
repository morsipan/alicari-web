import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  RotateCcw,
  Info,
  Layers,
  Database,
  Search,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Ticket, TicketEstado } from '../types/rifa';
import { calculateRifaPrice, formatCurrency } from '../lib/rifaPricing';

interface RifaGridProps {
  onContinueReservation: (selectedNumbers: string[], totalPrice: number) => void;
  onGoToComprobante: (token?: string) => void;
}

// Genera los 100 números estándar formateados '00' a '99'
const generateInitialTickets = (): Ticket[] => {
  return Array.from({ length: 100 }, (_, i) => ({
    numero: i.toString().padStart(2, '0'),
    estado: 'disponible' as TicketEstado,
    participante_id: null,
    reserva_expira_en: null,
    token_validacion: null,
    comprobante_url: null,
  }));
};

export const RifaGrid: React.FC<RifaGridProps> = ({
  onContinueReservation,
  onGoToComprobante,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>(generateInitialTickets());
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'disponible' | 'reservado' | 'pagado'>('all');
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  const [permissionNotice, setPermissionNotice] = useState(false);
  const [now, setNow] = useState<number>(Date.now());

  // Actualizar timer de expiración cada 30 segundos
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Cargar tickets desde Supabase
  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('numero', { ascending: true });

      if (error) {
        if (error.code === '42501') {
          // Permisos de tabla aún no otorgados en Supabase SQL Editor
          setPermissionNotice(true);
        } else {
          console.warn('Error al consultar tickets en Supabase:', error.message);
        }
      } else if (data && data.length > 0) {
        // Mapear datos asegurando los 100 números
        const ticketsMap = new Map<string, Ticket>();
        data.forEach((row: Ticket) => {
          ticketsMap.set(row.numero.toString().padStart(2, '0'), {
            numero: row.numero.toString().padStart(2, '0'),
            estado: row.estado || 'disponible',
            participante_id: row.participante_id,
            reserva_expira_en: row.reserva_expira_en,
            token_validacion: row.token_validacion,
            comprobante_url: row.comprobante_url,
          });
        });

        const merged = generateInitialTickets().map((base) => ticketsMap.get(base.numero) || base);
        setTickets(merged);
      }
    } catch (err) {
      console.error('Error cargando tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Suscripción Realtime a cambios en la tabla 'tickets'
  useEffect(() => {
    loadTickets();

    const channel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const updated = payload.new as Ticket;
            const updatedNum = updated.numero?.toString().padStart(2, '0');

            setTickets((prev) =>
              prev.map((t) => (t.numero === updatedNum ? { ...t, ...updated, numero: updatedNum } : t))
            );

            // Si el número actualizado estaba seleccionado y fue tomado, deseleccionarlo
            if (updated.estado !== 'disponible') {
              setSelectedNumbers((prev) => prev.filter((n) => n !== updatedNum));
            }
          } else {
            loadTickets();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTickets]);

  // Selección / Deselección de números disponibles
  const toggleSelectNumber = (numero: string, isAvailable: boolean) => {
    if (!isAvailable) return;

    setSelectedNumbers((prev) =>
      prev.includes(numero) ? prev.filter((n) => n !== numero) : [...prev, numero].sort()
    );
  };

  const selectRandomAvailable = (count: number) => {
    const available = tickets
      .filter((t) => getEffectiveStatus(t) === 'disponible' && !selectedNumbers.includes(t.numero))
      .map((t) => t.numero);

    if (available.length === 0) return;

    // Shuffle
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, count);
    setSelectedNumbers((prev) => [...prev, ...picked].sort());
  };

  const clearSelection = () => setSelectedNumbers([]);

  // Cálculo del estado efectivo considerando expiración de reservas (48hs)
  const getEffectiveStatus = useCallback(
    (ticket: Ticket): TicketEstado => {
      if (ticket.estado === 'pagado') return 'pagado';
      if (ticket.estado === 'reservado') {
        if (ticket.reserva_expira_en) {
          const expTime = new Date(ticket.reserva_expira_en).getTime();
          if (expTime <= now) {
            // Reserva expiró
            return 'disponible';
          }
        }
        return 'reservado';
      }
      return 'disponible';
    },
    [now]
  );

  // Formato de tiempo restante para tickets reservados
  const getRemainingTime = (expiraEn?: string | null): string | null => {
    if (!expiraEn) return null;
    const diff = new Date(expiraEn).getTime() - now;
    if (diff <= 0) return 'Expirado';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Cálculo de precios en tiempo real con promoción
  const pricing = useMemo(() => calculateRifaPrice(selectedNumbers.length), [selectedNumbers.length]);

  // Contadores de estado
  const stats = useMemo(() => {
    let disponibles = 0;
    let reservados = 0;
    let pagados = 0;

    tickets.forEach((t) => {
      const st = getEffectiveStatus(t);
      if (st === 'disponible') disponibles++;
      else if (st === 'reservado') reservados++;
      else if (st === 'pagado') pagados++;
    });

    return { disponibles, reservados, pagados };
  }, [tickets, getEffectiveStatus]);

  // Filtrado de números para la grilla
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const status = getEffectiveStatus(t);
      if (filterState !== 'all' && status !== filterState) return false;
      if (searchTerm.trim() && !t.numero.includes(searchTerm.trim())) return false;
      return true;
    });
  }, [tickets, filterState, searchTerm, getEffectiveStatus]);

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 py-8 pb-36 text-white space-y-8 animate-fadeIn">
      {/* Banner de ayuda SQL si Supabase requiere GRANT */}
      {permissionNotice && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Aviso de Permisos Supabase:</strong> Recuerda otorgar permisos de lectura/escritura a las tablas ejecutando el script RLS en el SQL Editor de Supabase.
            </span>
          </div>
          <button
            onClick={() => setShowSqlHelp(!showSqlHelp)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 shrink-0 transition-colors"
          >
            {showSqlHelp ? 'Ocultar SQL' : 'Ver SQL listo'}
          </button>
        </div>
      )}

      {showSqlHelp && (
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 space-y-2 overflow-x-auto">
          <p className="text-amber-400 font-semibold font-sans">Copia y pega este script en Supabase -&gt; SQL Editor:</p>
          <pre className="p-3 rounded bg-neutral-900 border border-neutral-800 text-emerald-400 text-[11px] overflow-x-auto select-all">
{`GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select a todos" ON public.tickets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir update a anon" ON public.tickets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir insert a anon" ON public.tickets FOR INSERT TO anon, authenticated WITH CHECK (true);

ALTER TABLE public.participantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir insert a todos" ON public.participantes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir select a todos" ON public.participantes FOR SELECT TO anon, authenticated USING (true);`}
          </pre>
        </div>
      )}

      {/* Hero Header de la Rifa */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rifa Exclusiva · 100 Números</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Cobertura Audiovisual <br />
          <span className="italic font-light text-neutral-300">para tu show en vivo</span>
        </h1>

        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xl mx-auto">
          Participá por la cobertura fotográfica y en video profesional de tu show. 100 números únicos (del 00 al 99).
        </p>

        {/* Tarjeta de precios & promo */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2 px-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-800/80">
            <span className="text-neutral-400">1 número:</span>
            <span className="font-bold text-white">$5.000</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-950/80 border border-red-800/60 text-red-300">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span className="font-bold">PROMO 3 números:</span>
            <span className="font-extrabold text-white text-sm">$12.000</span>
            <span className="text-[10px] text-red-400 ml-1">(Ahorrás $3.000)</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Leyenda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
        {/* Leyenda de Estados */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <button
            onClick={() => setFilterState('all')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              filterState === 'all'
                ? 'bg-neutral-800 border-neutral-600 text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <span>Todos</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-neutral-950">100</span>
          </button>

          <button
            onClick={() => setFilterState('disponible')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              filterState === 'disponible'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-emerald-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span>Disponibles</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-emerald-400">
              {stats.disponibles}
            </span>
          </button>

          <button
            onClick={() => setFilterState('reservado')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              filterState === 'reservado'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-amber-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span>Reservados</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-amber-400">
              {stats.reservados}
            </span>
          </button>

          <button
            onClick={() => setFilterState('pagado')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              filterState === 'pagado'
                ? 'bg-red-950/40 border-red-500/50 text-red-300 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-red-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm shadow-red-600/50" />
            <span>Pagados</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-red-400">
              {stats.pagados}
            </span>
          </button>
        </div>

        {/* Acciones rápidas & Búsqueda */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar ej: 07"
              value={searchTerm}
              maxLength={2}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-red-600"
            />
          </div>

          <button
            onClick={() => selectRandomAvailable(3)}
            title="Elegir 3 números al azar con promo"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Elegir 3 al azar</span>
            <span className="sm:hidden">Promo 3</span>
          </button>

          <button
            onClick={() => onGoToComprobante()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 transition-colors shrink-0"
          >
            <span>Subir comprobante</span>
          </button>
        </div>
      </div>

      {/* GRILLA RESPONSIVE 10x10 DE NÚMEROS (00 al 99) */}
      <div className="bg-neutral-950/60 p-4 sm:p-6 rounded-3xl border border-neutral-800/80 shadow-2xl">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5">
          {filteredTickets.map((ticket) => {
            const status = getEffectiveStatus(ticket);
            const isSelected = selectedNumbers.includes(ticket.numero);
            const isAvailable = status === 'disponible';
            const remaining = status === 'reservado' ? getRemainingTime(ticket.reserva_expira_en) : null;

            return (
              <button
                key={ticket.numero}
                type="button"
                disabled={!isAvailable}
                onClick={() => toggleSelectNumber(ticket.numero, isAvailable)}
                aria-pressed={isSelected}
                aria-label={`Número ${ticket.numero}, estado ${status}`}
                className={`group relative flex flex-col items-center justify-center h-16 sm:h-20 rounded-xl font-mono transition-all select-none border ${
                  isSelected
                    ? 'bg-red-600 text-white border-white/60 shadow-lg shadow-red-600/40 scale-105 z-10'
                    : status === 'pagado'
                    ? 'bg-neutral-900/60 text-neutral-600 border-neutral-800/40 cursor-not-allowed opacity-60'
                    : status === 'reservado'
                    ? 'bg-amber-950/30 text-amber-300 border-amber-600/40 cursor-not-allowed'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border-neutral-800 hover:border-neutral-700 cursor-pointer hover:scale-105 active:scale-95'
                }`}
              >
                {/* Número Principal */}
                <span
                  className={`text-lg sm:text-xl font-bold tracking-tight ${
                    isSelected ? 'text-white' : status === 'disponible' ? 'text-neutral-100' : ''
                  }`}
                >
                  {ticket.numero}
                </span>

                {/* Sub-badge de estado */}
                <div className="mt-1 text-[9px] uppercase font-sans font-semibold tracking-wider">
                  {isSelected ? (
                    <span className="text-white flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Elegido</span>
                    </span>
                  ) : status === 'pagado' ? (
                    <span className="text-red-500/80 flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Pagado</span>
                    </span>
                  ) : status === 'reservado' ? (
                    <span className="text-amber-400 flex items-center gap-0.5 text-[8.5px]">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{remaining || '48h'}</span>
                    </span>
                  ) : (
                    <span className="text-emerald-400/80 group-hover:text-emerald-300">Libre</span>
                  )}
                </div>

                {/* Indicador de esquina para seleccionados */}
                {isSelected && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white shadow-sm" />
                )}
              </button>
            );
          })}
        </div>

        {filteredTickets.length === 0 && (
          <div className="py-12 text-center text-neutral-500 text-sm">
            No se encontraron números con los filtros actuales.
          </div>
        )}
      </div>

      {/* BARRA FLOTANTE INFERIOR DE CHECKOUT (Sticky Bottom) */}
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto">
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/95 border border-neutral-800 backdrop-blur-xl shadow-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Lado izquierdo: Selección actual */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 shrink-0">
                <TicketIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-400 flex items-center gap-2">
                  <span>
                    {selectedNumbers.length === 0
                      ? 'Selecciona números de la grilla'
                      : `${selectedNumbers.length} número${selectedNumbers.length > 1 ? 's' : ''} seleccionado${
                          selectedNumbers.length > 1 ? 's' : ''
                        }`}
                  </span>
                  {selectedNumbers.length > 0 && (
                    <button
                      onClick={clearSelection}
                      className="text-neutral-500 hover:text-neutral-300 underline text-[11px]"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {formatCurrency(pricing.total)}
                </div>
              </div>
            </div>

            {/* Badges de números seleccionados */}
            {selectedNumbers.length > 0 && (
              <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto sm:border-l sm:border-neutral-800 sm:pl-3">
                {selectedNumbers.map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold rounded bg-red-600 text-white"
                  >
                    #{n}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Lado derecho: Aviso de ahorro y Botón Continuar */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 shrink-0">
            {pricing.savingsMessage && (
              <div className="hidden md:block text-right">
                <span className="text-[11px] font-semibold text-emerald-400 block">
                  {pricing.savingsMessage}
                </span>
                <span className="text-[10px] text-neutral-400">Precio normal: {formatCurrency(pricing.regularTotal)}</span>
              </div>
            )}

            <button
              onClick={() => onContinueReservation(selectedNumbers, pricing.total)}
              disabled={selectedNumbers.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <span>Continuar con la reserva</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
