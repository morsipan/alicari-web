import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  MessageCircle,
  FileText,
  Search,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Ticket, Participante } from '../../types/rifa';
import { formatCurrency } from '../../lib/rifaPricing';

interface AdminViewProps {
  onBackToGrid: () => void;
}

const ADMIN_PIN = 'Astor2018+';

export const AdminView: React.FC<AdminViewProps> = ({ onBackToGrid }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('rifa_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [participantesMap, setParticipantesMap] = useState<Record<string, Participante>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'pendientes' | 'reservados' | 'pagados' | 'todos'>('pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Autenticación por PIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('rifa_admin_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Carga de tickets y participantes
  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setActionSuccessMsg(null);

    try {
      // 1. Obtener todos los tickets
      const { data: ticketsData, error: tErr } = await supabase
        .from('tickets')
        .select('*')
        .order('numero', { ascending: true });

      if (tErr && tErr.code !== '42501') {
        console.warn('Error cargando tickets:', tErr.message);
      } else if (ticketsData) {
        setTickets(ticketsData);
      }

      // 2. Obtener participantes
      const { data: partsData, error: pErr } = await supabase
        .from('participantes')
        .select('*');

      if (!pErr && partsData) {
        const pMap: Record<string, Participante> = {};
        partsData.forEach((p: Participante) => {
          if (p.id) pMap[p.id] = p;
        });
        setParticipantesMap(pMap);
      }
    } catch (err) {
      console.error('Error cargando datos de admin:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated, loadAdminData]);

  // Acción: Confirmar Pago de un ticket
  const handleConfirmPayment = async (numero: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('tickets')
        .update({
          estado: 'pagado',
          updated_at: new Date().toISOString(),
        })
        .eq('numero', numero);

      if (error && error.code !== '42501') {
        throw error;
      }

      setTickets((prev) =>
        prev.map((t) => (t.numero === numero ? { ...t, estado: 'pagado' } : t))
      );
      setActionSuccessMsg(`¡Número #${numero} confirmado como PAGADO exitosamente!`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al confirmar pago');
    } finally {
      setIsLoading(false);
    }
  };

  // Acción: Liberar un ticket reservado (volver a 'disponible')
  const handleReleaseTicket = async (numero: string) => {
    if (!window.confirm(`¿Estás seguro de liberar el número #${numero}? Volverá a estar disponible para compra.`)) {
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('tickets')
        .update({
          estado: 'disponible',
          participante_id: null,
          reserva_expira_en: null,
          token_validacion: null,
          comprobante_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('numero', numero);

      if (error && error.code !== '42501') {
        throw error;
      }

      setTickets((prev) =>
        prev.map((t) =>
          t.numero === numero
            ? {
                ...t,
                estado: 'disponible',
                participante_id: null,
                reserva_expira_en: null,
                token_validacion: null,
                comprobante_url: null,
              }
            : t
        )
      );
      setActionSuccessMsg(`Número #${numero} liberado y disponible nuevamente.`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al liberar número');
    } finally {
      setIsLoading(false);
    }
  };

  // Acción: Marcar número como Pagado manual (venta en efectivo/directa)
  const handleMarkDirectPayment = async (numero: string) => {
    const nombre = prompt(`Ingresa el nombre de quién compró el #${numero} (o dejar vacío):`, 'Venta Directa');
    if (nombre === null) return;

    try {
      setIsLoading(true);
      let participantId: string | null = null;

      if (nombre.trim()) {
        const { data: pData } = await supabase
          .from('participantes')
          .insert([{ nombre: nombre.trim(), telefono: '-', email: 'directo@manual' }])
          .select()
          .single();
        if (pData) participantId = pData.id;
      }

      const { error } = await supabase
        .from('tickets')
        .update({
          estado: 'pagado',
          participante_id: participantId,
          updated_at: new Date().toISOString(),
        })
        .eq('numero', numero);

      if (error && error.code !== '42501') throw error;

      setTickets((prev) =>
        prev.map((t) => (t.numero === numero ? { ...t, estado: 'pagado', participante_id: participantId } : t))
      );
      setActionSuccessMsg(`Número #${numero} marcado como PAGADO.`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar venta directa');
    } finally {
      setIsLoading(false);
    }
  };

  // Métricas
  const metrics = useMemo(() => {
    let pagados = 0;
    let reservados = 0;
    let conComprobante = 0;
    let disponibles = 0;

    tickets.forEach((t) => {
      if (t.estado === 'pagado') pagados++;
      else if (t.estado === 'reservado') {
        reservados++;
        if (t.comprobante_url) conComprobante++;
      } else {
        disponibles++;
      }
    });

    const recaudadoAprox = pagados * 5000; // base estimada
    return { pagados, reservados, conComprobante, disponibles, recaudadoAprox };
  }, [tickets]);

  // Filtrado de tickets
  const filteredList = useMemo(() => {
    return tickets.filter((t) => {
      if (activeFilter === 'pendientes') {
        return t.estado === 'reservado' && !!t.comprobante_url;
      }
      if (activeFilter === 'reservados') {
        return t.estado === 'reservado';
      }
      if (activeFilter === 'pagados') {
        return t.estado === 'pagado';
      }
      return true; // 'todos'
    }).filter((t) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const part = t.participante_id ? participantesMap[t.participante_id] : null;
      return (
        t.numero.includes(term) ||
        (part?.nombre && part.nombre.toLowerCase().includes(term)) ||
        (part?.email && part.email.toLowerCase().includes(term)) ||
        (part?.telefono && part.telefono.includes(term))
      );
    });
  }, [tickets, activeFilter, searchTerm, participantesMap]);

  // Vista de Login si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fadeIn">
        <button
          onClick={onBackToGrid}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Rifa</span>
        </button>

        <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/10 text-red-500 border border-red-600/20">
            <Shield className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Gestión de la Rifa</h2>
            <p className="text-xs text-neutral-400">
              Ingresa la clave de acceso para administrar tickets y confirmar pagos
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label htmlFor="admin-pin" className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Clave de Acceso
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-pin"
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Introduce tu clave"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-red-600"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                  title={showPin ? 'Ocultar clave' : 'Mostrar clave'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pinError && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Clave incorrecta. Por favor inténtalo de nuevo.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/20"
            >
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    sessionStorage.removeItem('rifa_admin_auth');
    setIsAuthenticated(false);
    onBackToGrid();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fadeIn pb-24">
      {/* Barra superior de admin */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Panel de Control de la Rifa</h1>
            <p className="text-xs text-neutral-400">Confirmación y gestión de pagos en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Cerrar sesión de gestión"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
          <button
            onClick={onBackToGrid}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la Grilla</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Métricas Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
            Comprobantes Pendientes
          </span>
          <div className="text-2xl font-black text-amber-400">{metrics.conComprobante}</div>
          <span className="text-[11px] text-neutral-500">listos para revisar</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
            Total Pagados
          </span>
          <div className="text-2xl font-black text-red-500">{metrics.pagados} / 100</div>
          <span className="text-[11px] text-neutral-500">tickets confirmados</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
            En Reserva (48h)
          </span>
          <div className="text-2xl font-black text-amber-300">{metrics.reservados}</div>
          <span className="text-[11px] text-neutral-500">a la espera de pago</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
            Recaudación Confirmada
          </span>
          <div className="text-2xl font-black text-emerald-400">
            {formatCurrency(metrics.recaudadoAprox)}
          </div>
          <span className="text-[11px] text-neutral-500">monto cobrado</span>
        </div>
      </div>

      {/* Tabs de Filtro & Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setActiveFilter('pendientes')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'pendientes'
                ? 'bg-amber-500 text-black font-bold shadow'
                : 'text-neutral-400 hover:text-white bg-neutral-950/60'
            }`}
          >
            🔔 Con Comprobante ({metrics.conComprobante})
          </button>
          <button
            onClick={() => setActiveFilter('reservados')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'reservados'
                ? 'bg-neutral-800 text-white font-bold'
                : 'text-neutral-400 hover:text-white bg-neutral-950/60'
            }`}
          >
            Reservados ({metrics.reservados})
          </button>
          <button
            onClick={() => setActiveFilter('pagados')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'pagados'
                ? 'bg-neutral-800 text-white font-bold'
                : 'text-neutral-400 hover:text-white bg-neutral-950/60'
            }`}
          >
            Pagados ({metrics.pagados})
          </button>
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'todos'
                ? 'bg-neutral-800 text-white font-bold'
                : 'text-neutral-400 hover:text-white bg-neutral-950/60'
            }`}
          >
            Todos los 100
          </button>
        </div>

        <div className="relative sm:w-60">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-red-600"
          />
        </div>
      </div>

      {/* Lista de Tickets para Gestionar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="divide-y divide-neutral-800/80">
          {filteredList.map((ticket) => {
            const part = ticket.participante_id ? participantesMap[ticket.participante_id] : null;
            const hasProof = !!ticket.comprobante_url;
            const isReserved = ticket.estado === 'reservado';
            const isPaid = ticket.estado === 'pagado';
            const isAvailable = ticket.estado === 'disponible';

            return (
              <div
                key={ticket.numero}
                className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-neutral-950/40 transition-colors"
              >
                {/* Lado Izquierdo: Número y Datos del Participante */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-xl shrink-0 border ${
                      isPaid
                        ? 'bg-red-950 text-red-300 border-red-800/60'
                        : isReserved
                        ? 'bg-amber-950/60 text-amber-300 border-amber-600/50'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    <span>#{ticket.numero}</span>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-tighter">
                      {ticket.estado}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {part?.nombre || (isAvailable ? 'Número Disponible' : 'Sin datos')}
                      </span>
                      {hasProof && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <FileText className="w-3 h-3" />
                          <span>Comprobante adjunto</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {part?.telefono && (
                        <span>
                          Tel: <strong className="text-neutral-200">{part.telefono}</strong>
                        </span>
                      )}
                      {part?.email && (
                        <span>
                          Email: <strong className="text-neutral-200">{part.email}</strong>
                        </span>
                      )}
                      {ticket.token_validacion && (
                        <span className="font-mono text-[10px] text-neutral-500 truncate max-w-xs">
                          Token: {ticket.token_validacion}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Derecho: Acciones rápidas */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  {/* Botón WhatsApp si tiene teléfono */}
                  {part?.telefono && part.telefono !== '-' && (
                    <a
                      href={`https://wa.me/${part.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hola ${part.nombre}! Te escribo por tu número #${ticket.numero} en la rifa de cobertura de shows de ALICARI.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40 text-xs"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}

                  {/* Ver comprobante si existe */}
                  {hasProof && (
                    <a
                      href={ticket.comprobante_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ver Comprobante</span>
                    </a>
                  )}

                  {/* Botón Confirmar Pago */}
                  {isReserved && (
                    <button
                      onClick={() => handleConfirmPayment(ticket.numero)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmar Pago</span>
                    </button>
                  )}

                  {/* Botón Liberar */}
                  {(isReserved || isPaid) && (
                    <button
                      onClick={() => handleReleaseTicket(ticket.numero)}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Liberar</span>
                    </button>
                  )}

                  {/* Botón Venta Directa en efectivo si está disponible */}
                  {isAvailable && (
                    <button
                      onClick={() => handleMarkDirectPayment(ticket.numero)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                    >
                      <span>Venta directa</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="py-16 text-center text-neutral-500 text-sm">
              No hay tickets que coincidan con el filtro seleccionado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminView;

