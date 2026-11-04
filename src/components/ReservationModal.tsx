import React, { useState } from 'react';
import { X, AlertCircle, Loader2, ShieldCheck, Ticket as TicketIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabaseClient';
import { formatCurrency } from '../lib/rifaPricing';
import { VIATICOS_DISCLAIMER } from '../lib/bankConfig';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumbers: string[];
  totalPrice: number;
  onSuccess: (token: string, participantName: string, participantEmail: string) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  selectedNumbers,
  totalPrice,
  onSuccess,
}) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [aceptaViaticos, setAceptaViaticos] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nombre.trim() || !telefono.trim() || !email.trim()) {
      setErrorMessage('Por favor completa todos los campos de contacto.');
      return;
    }

    if (!aceptaViaticos) {
      setErrorMessage('Debes aceptar la política de viáticos y alcance para continuar.');
      return;
    }

    if (selectedNumbers.length === 0) {
      setErrorMessage('No hay números seleccionados.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verificación de concurrencia: asegurar que sigan disponibles
      const { data: currentTickets, error: checkErr } = await supabase
        .from('tickets')
        .select('numero, estado, reserva_expira_en')
        .in('numero', selectedNumbers);

      if (checkErr && checkErr.code !== '42501') {
        throw new Error(checkErr.message || 'Error al verificar disponibilidad de números.');
      }

      if (currentTickets && currentTickets.length > 0) {
        const now = new Date().getTime();
        const taken = currentTickets.filter((t) => {
          if (t.estado === 'pagado') return true;
          if (t.estado === 'reservado' && t.reserva_expira_en) {
            return new Date(t.reserva_expira_en).getTime() > now;
          }
          return false;
        });

        if (taken.length > 0) {
          const takenNumbers = taken.map((t) => `#${t.numero}`).join(', ');
          setErrorMessage(
            `Lo sentimos: los números ${takenNumbers} acaban de ser tomados por otro participante. Por favor elige otros números disponibles.`
          );
          setIsLoading(false);
          return;
        }
      }

      // 2. Insertar participante
      const { data: partData, error: partErr } = await supabase
        .from('participantes')
        .insert([
          {
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            email: email.trim().toLowerCase(),
          },
        ])
        .select()
        .single();

      if (partErr && partErr.code !== '42501') {
        throw new Error(partErr.message || 'No se pudo registrar tus datos de participante.');
      }

      const participantId = partData?.id || crypto.randomUUID();
      const tokenValidacion = crypto.randomUUID();
      const expiraEn = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      // 3. Actualizar tickets seleccionados con estado 'reservado'
      const { data: updatedTickets, error: updateErr } = await supabase
        .from('tickets')
        .update({
          estado: 'reservado',
          participante_id: participantId,
          reserva_expira_en: expiraEn,
          token_validacion: tokenValidacion,
          updated_at: new Date().toISOString(),
        })
        .in('numero', selectedNumbers)
        .eq('estado', 'disponible')
        .select();

      if (updateErr && updateErr.code !== '42501') {
        throw new Error(updateErr.message || 'No se pudieron reservar los números seleccionados.');
      }

      // Concurrencia estricta: si la cantidad actualizada es menor a la esperada
      if (updatedTickets && updatedTickets.length < selectedNumbers.length && updateErr?.code !== '42501') {
        setErrorMessage(
          'Uno de los números seleccionados fue reservado en este mismo instante. Tu reserva no se completó para evitar duplicaciones.'
        );
        setIsLoading(false);
        return;
      }

      // Confetti de celebración
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#cc0000', '#ffffff', '#22c55e', '#eab308'],
        });
      } catch {
        // Ignorar si canvas no está disponible
      }

      onSuccess(tokenValidacion, nombre.trim(), email.trim());
    } catch (err: unknown) {
      console.error('Error durante la reserva:', err);
      const msg = err instanceof Error ? err.message : 'Ocurrió un error inesperado al procesar la reserva.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/80 bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500">
              <TicketIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-white">Completar Reserva</h3>
              <p className="text-xs text-neutral-400">Rifa Cobertura de Shows en Vivo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 text-xs rounded-xl bg-red-950/40 border border-red-800/60 text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Resumen de números y total */}
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Números seleccionados ({selectedNumbers.length}):</span>
              <span className="font-semibold text-white">Total a transferir</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                {selectedNumbers.map((num) => (
                  <span
                    key={num}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-red-950/60 text-red-300 border border-red-800/40"
                  >
                    #{num}
                  </span>
                ))}
              </div>
              <div className="text-2xl font-bold tracking-tight text-red-500 shrink-0 pl-3">
                {formatCurrency(totalPrice)}
              </div>
            </div>
          </div>

          {/* Campos del participante */}
          <div className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-xs font-medium text-neutral-300 mb-1.5">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                id="nombre"
                type="text"
                required
                placeholder="Ej: Laura Martínez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="telefono" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Teléfono / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  id="telefono"
                  type="tel"
                  required
                  placeholder="Ej: +54 9 11 1234-5678"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Checkbox de Viáticos y Alcance (Requerido) */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 cursor-pointer hover:border-neutral-700 transition-colors">
              <input
                type="checkbox"
                required
                checked={aceptaViaticos}
                onChange={(e) => setAceptaViaticos(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 mt-0.5 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600 focus:ring-offset-neutral-900 shrink-0"
              />
              <span className="text-xs text-neutral-300 leading-relaxed select-none">
                <span className="font-medium text-white">Política de Viáticos: </span>
                {VIATICOS_DISCLAIMER}
              </span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs font-medium rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reservando...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirmar y Ver Datos de Pago</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
