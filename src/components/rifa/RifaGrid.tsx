import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Search,
  UploadCloud,
  Database,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Ticket, TicketEstado } from '../../types/rifa';
import { calculateRifaPrice, formatCurrency } from '../../lib/rifaPricing';

interface RifaGridProps {
  onContinue: (selectedNumbers: string[], totalPrice: number) => void;
  onGoToComprobante: (token?: string) => void;
}

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
  onContinue,
  onGoToComprobante,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>(generateInitialTickets());
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'disponible' | 'reservado' | 'pagado'>('all');
  const [now, setNow] = useState<number>(Date.now());
  const [hasPermissionWarning, setHasPermissionWarning] = useState(false);

  // Auto-limpieza cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Función de auto-limpieza RPC si está creada en Supabase
  const callRpcLimpieza = async () => {
    try {
      await supabase.rpc('liberar_tickets_expirados');
    } catch {
      // Ignorar si no existe la función RPC en la BD
    }
  };

  // Carga y sincronización de tickets
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    await callRpcLimpieza();

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('numero', { ascending: true });

      if (error) {
        if (error.code === '42501') {
          setHasPermissionWarning(true);
        } else {
          console.warn('Consulta tickets aviso:', error.message);
        }
      } else if (data && data.length > 0) {
        const map = new Map<string, Ticket>();
        data.forEach((row: Ticket) => {
          const formatted = row.numero.toString().padStart(2, '0');
          map.set(formatted, {
            ...row,
            numero: formatted,
          });
        });

        const merged = generateInitialTickets().map((base) => map.get(base.numero) || base);
        setTickets(merged);
      }
    } catch (err) {
      console.error('Error al cargar tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Suscripción Realtime vía supabase.channel sobre la tabla 'tickets'
  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel('tickets-realtime-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const updated = payload.new as Ticket;
            const formatted = updated.numero?.toString().padStart(2, '0');

            setTickets((prev) =>
              prev.map((t) => (t.numero === formatted ? { ...t, ...updated, numero: formatted } : t))
            );

            // Si fue tomado por otro usuario, quitarlo de los seleccionados locales
            if (updated.estado !== 'disponible') {
              setSelectedNumbers((prev) => prev.filter((n) => n !== formatted));
            }
          } else {
            fetchTickets();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTickets]);

  // Cálculo del estado efectivo (auto-limpieza en cliente para reservas pasadas de 48 horas)
  const getEffectiveState = useCallback(
    (ticket: Ticket): TicketEstado => {
      if (ticket.estado === 'pagado') return 'pagado';
      if (ticket.estado === 'reservado') {
        if (ticket.reserva_expira_en) {
          const expiresAt = new Date(ticket.reserva_expira_en).getTime();
          if (expiresAt <= now) {
            return 'disponible'; // Expiró: vuelve a estar disponible
          }
        }
        return 'reservado';
      }
      return 'disponible';
    },
    [now]
  );

  const getCountdownString = (reservaExpiraEn?: string | null): string => {
    if (!reservaExpiraEn) return '48h';
    const diff = new Date(reservaExpiraEn).getTime() - now;
    if (diff <= 0) return 'Expirado';

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  };

  const handleToggleNumber = (numero: string, isAvailable: boolean) => {
    if (!isAvailable) return;

    setSelectedNumbers((prev) =>
      prev.includes(numero) ? prev.filter((n) => n !== numero) : [...prev, numero].sort()
    );
  };

  const handleSelectRandom = (count: number) => {
    const available = tickets
      .filter((t) => getEffectiveState(t) === 'disponible' && !selectedNumbers.includes(t.numero))
      .map((t) => t.numero);

    if (available.length === 0) return;

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, count);
    setSelectedNumbers((prev) => [...prev, ...picked].sort());
  };

  const pricing = useMemo(() => calculateRifaPrice(selectedNumbers.length), [selectedNumbers.length]);

  const stats = useMemo(() => {
    let disponibles = 0;
    let reservados = 0;
    let pagados = 0;

    tickets.forEach((t) => {
      const st = getEffectiveState(t);
      if (st === 'disponible') disponibles++;
      else if (st === 'reservado') reservados++;
      else if (st === 'pagado') pagados++;
    });

    return { disponibles, reservados, pagados };
  }, [tickets, getEffectiveState]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const st = getEffectiveState(t);
      if (filterState !== 'all' && st !== filterState) return false;
      if (searchTerm.trim() && !t.numero.includes(searchTerm.trim())) return false;
      return true;
    });
  }, [tickets, filterState, searchTerm, getEffectiveState]);

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 py-8 pb-36 text-white space-y-8 animate-fadeIn">
      {hasPermissionWarning && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Nota Supabase:</strong> Si no ves números reflejados, asegúrate de correr las políticas RLS (`GRANT SELECT ON tickets TO anon`). La vista opera con soporte local preventivo.
            </span>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center space-y-3.5 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rifa Shows de Bandas · 100 Tickets</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Cobertura Fotográfica &amp; Video <br />
          <span className="italic font-light text-neutral-300">para tu show en vivo</span>
        </h1>

        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg mx-auto">
          Elegí tus números para participar por la producción visual integral de tu próxima fecha. Números únicos del 00 al 99.
        </p>

        {/* Promoción */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 p-2 px-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl text-xs">
          <div className="px-3 py-1 rounded-xl bg-neutral-800/80 text-neutral-300">
            <span>1 número: </span>
            <strong className="text-white">$5.000</strong>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-950/80 border border-red-800/60 text-red-300">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>PROMO: </span>
            <strong className="text-white text-sm">3 por $12.000</strong>
            <span className="text-[10px] text-red-400 ml-1">(Ahorrás $3.000)</span>
          </div>
        </div>
      </div>

      {/* Controles de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <button
            onClick={() => setFilterState('all')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filterState === 'all'
                ? 'bg-neutral-800 border-neutral-600 text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <span>Todos (100)</span>
          </button>

          <button
            onClick={() => setFilterState('disponible')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              filterState === 'disponible'
                ? 'bg-neutral-800 border-zinc-500 text-zinc-100 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-zinc-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-zinc-300" />
            <span>Disponibles ({stats.disponibles})</span>
          </button>

          <button
            onClick={() => setFilterState('reservado')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              filterState === 'reservado'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Reservados ({stats.reservados})</span>
          </button>

          <button
            onClick={() => setFilterState('pagado')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              filterState === 'pagado'
                ? 'bg-red-950/40 border-red-500/50 text-red-300 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-red-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>Pagados ({stats.pagados})</span>
          </button>
        </div>

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
            onClick={() => handleSelectRandom(3)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">3 al azar</span>
            <span className="sm:hidden">Promo 3</span>
          </button>

          <button
            onClick={() => onGoToComprobante()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 transition-colors shrink-0"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Comprobante</span>
          </button>
        </div>
      </div>

      {/* GRILLA RESPONSIVE 10x10 DE NÚMEROS (00 al 99) */}
      <div className="bg-neutral-950/60 p-4 sm:p-6 rounded-3xl border border-neutral-800/80 shadow-2xl">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5">
          {filteredTickets.map((ticket) => {
            const status = getEffectiveState(ticket);
            const isSelected = selectedNumbers.includes(ticket.numero);
            const isAvailable = status === 'disponible';
            const countdown = status === 'reservado' ? getCountdownString(ticket.reserva_expira_en) : null;

            return (
              <button
                key={ticket.numero}
                type="button"
                disabled={!isAvailable}
                onClick={() => handleToggleNumber(ticket.numero, isAvailable)}
                aria-pressed={isSelected}
                aria-label={`Número ${ticket.numero}, estado ${status}`}
                className={`group relative flex flex-col items-center justify-center h-16 sm:h-20 rounded-xl font-mono transition-all select-none border ${
                  isSelected
                    ? 'bg-red-600 text-white border-white/60 shadow-lg shadow-red-600/40 scale-105 z-10'
                    : status === 'pagado'
                    ? 'bg-neutral-900/60 text-neutral-600 border-neutral-800/40 cursor-not-allowed opacity-50'
                    : status === 'reservado'
                    ? 'bg-amber-950/30 text-amber-300 border-amber-600/40 cursor-not-allowed'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border-neutral-800 hover:border-neutral-700 cursor-pointer hover:scale-105 active:scale-95'
                }`}
              >
                <span
                  className={`text-lg sm:text-xl font-bold tracking-tight ${
                    isSelected ? 'text-white' : status === 'disponible' ? 'text-neutral-100' : ''
                  }`}
                >
                  {ticket.numero}
                </span>

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
                      <span>{countdown}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-400 group-hover:text-zinc-200">Libre</span>
                  )}
                </div>

                {isSelected && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* BARRA FLOTANTE DE CHECKOUT */}
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto">
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/95 border border-neutral-800 backdrop-blur-xl shadow-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 shrink-0">
                <TicketIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-400 flex items-center gap-2">
                  <span>
                    {selectedNumbers.length === 0
                      ? 'Elige tus números'
                      : `${selectedNumbers.length} seleccionado${selectedNumbers.length > 1 ? 's' : ''}`}
                  </span>
                  {selectedNumbers.length > 0 && (
                    <button
                      onClick={() => setSelectedNumbers([])}
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

          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 shrink-0">
            {pricing.savingsMessage && (
              <div className="hidden md:block text-right">
                <span className="text-[11px] font-semibold text-emerald-400 block">
                  {pricing.savingsMessage}
                </span>
                <span className="text-[10px] text-neutral-400">Regular: {formatCurrency(pricing.regularTotal)}</span>
              </div>
            )}

            <button
              onClick={() => onContinue(selectedNumbers, pricing.total)}
              disabled={selectedNumbers.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <span>Continuar reserva</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RifaGrid;

