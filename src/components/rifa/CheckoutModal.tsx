import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Ticket as TicketIcon,
  Copy,
  Check,
  Clock,
  ExternalLink,
  UploadCloud,
  Building2,
  FileCheck2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from '../../lib/rifaPricing';
import { BANK_DETAILS } from '../../lib/bankConfig';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumbers: string[];
  totalPrice: number;
  onGoToComprobante: (token: string) => void;
  onReservationComplete?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedNumbers,
  totalPrice,
  onGoToComprobante,
  onReservationComplete,
}) => {
  // Step 1: Formulario, Step 2: Éxito con datos bancarios
  const [step, setStep] = useState<'form' | 'success'>('form');

  // Form State
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [aceptaViaticos, setAceptaViaticos] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'alias' | 'cbu' | 'token' | null>(null);

  // Generated tokens upon success
  const [generatedToken, setGeneratedToken] = useState<string>('');

  if (!isOpen) return null;

  const handleCopy = async (text: string, field: 'alias' | 'cbu' | 'token') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nombre.trim() || !telefono.trim() || !email.trim()) {
      setErrorMessage('Por favor completa todos los campos.');
      return;
    }

    if (!aceptaViaticos) {
      setErrorMessage('Debes aceptar la política de alcance y viáticos en CABA/GBA.');
      return;
    }

    if (selectedNumbers.length === 0) {
      setErrorMessage('No has seleccionado ningún número.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Control de Concurrencia: verificar que sigan disponibles
      const { data: currentTickets, error: checkError } = await supabase
        .from('tickets')
        .select('numero, estado, reserva_expira_en')
        .in('numero', selectedNumbers);

      if (checkError && checkError.code !== '42501') {
        throw new Error(checkError.message || 'Error al validar números.');
      }

      if (currentTickets && currentTickets.length > 0) {
        const now = Date.now();
        const occupied = currentTickets.filter((t) => {
          if (t.estado === 'pagado') return true;
          if (t.estado === 'reservado' && t.reserva_expira_en) {
            return new Date(t.reserva_expira_en).getTime() > now;
          }
          return false;
        });

        if (occupied.length > 0) {
          const takenStr = occupied.map((t) => `#${t.numero}`).join(', ');
          setErrorMessage(
            `Atención: los números ${takenStr} acaban de ser reservados o pagados por otro usuario en este instante. Por favor elige otros números disponibles.`
          );
          setIsLoading(false);
          return;
        }
      }

      // 2. Registrar participante
      const { data: partData, error: partError } = await supabase
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

      if (partError && partError.code !== '42501') {
        throw new Error(partError.message || 'Error al guardar los datos del participante.');
      }

      const participantId = partData?.id || crypto.randomUUID();
      const tokenValidacion = crypto.randomUUID();
      const expiraEn = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      // 3. Actualizar tickets en Supabase a 'reservado'
      const { data: updatedTickets, error: updateError } = await supabase
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

      if (updateError && updateError.code !== '42501') {
        throw new Error(updateError.message || 'Error al reservar los tickets seleccionados.');
      }

      // Si la concurrencia afectó algún número
      if (updatedTickets && updatedTickets.length < selectedNumbers.length && updateError?.code !== '42501') {
        setErrorMessage(
          'Uno de los números fue tomado milisegundos antes. La reserva se abortó para proteger la integridad de tu compra.'
        );
        setIsLoading(false);
        return;
      }

      // Éxito: disparar confetti
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#cc0000', '#ffffff', '#22c55e', '#facc15'],
        });
      } catch {
        // Ignorar
      }

      setGeneratedToken(tokenValidacion);
      setStep('success');
      onReservationComplete?.();
    } catch (err: unknown) {
      console.error('Error en proceso de reserva:', err);
      const msg = err instanceof Error ? err.message : 'Error inesperado al procesar la reserva.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setStep('form');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-100 animate-scaleUp max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500">
              {step === 'form' ? <TicketIcon className="w-5 h-5" /> : <FileCheck2 className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {step === 'form' ? 'Reservar Números' : '¡Reserva Confirmada!'}
              </h3>
              <p className="text-xs text-neutral-400">
                {step === 'form' ? 'Rifa Cobertura de Shows de Bandas' : 'Datos para completar la transferencia'}
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            disabled={isLoading}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 text-xs rounded-xl bg-red-950/40 border border-red-800/60 text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {step === 'form' ? (
            /* PASO 1: Formulario de Datos */
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Resumen */}
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between">
                <div>
                  <span className="block text-xs text-neutral-400 mb-1">
                    Números seleccionados ({selectedNumbers.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedNumbers.map((num) => (
                      <span
                        key={num}
                        className="inline-block px-2 py-0.5 text-xs font-mono font-bold rounded bg-red-950 text-red-300 border border-red-800/50"
                      >
                        #{num}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right pl-3 shrink-0">
                  <span className="block text-[11px] uppercase tracking-wider text-neutral-400">Total</span>
                  <span className="text-xl font-black text-red-500">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Inputs */}
              <div>
                <label htmlFor="checkout-nombre" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  id="checkout-nombre"
                  type="text"
                  required
                  placeholder="Tu nombre y apellido"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="checkout-tel" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Teléfono / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-tel"
                    type="tel"
                    required
                    placeholder="+54 9 11 ..."
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-email" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Checkbox Viáticos */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors">
                <input
                  type="checkbox"
                  required
                  checked={aceptaViaticos}
                  onChange={(e) => setAceptaViaticos(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 mt-0.5 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600 shrink-0"
                />
                <span className="text-xs text-neutral-300 leading-relaxed select-none">
                  Entiendo y acepto que la cobertura aplica a shows en vivo en <strong className="text-white">CABA/GBA</strong> (o viáticos a coordinar si es en otra zona).
                </span>
              </label>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isLoading}
                  className="px-4 py-2.5 text-xs font-medium rounded-xl text-neutral-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 disabled:opacity-40 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando y reservando...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirmar Reserva</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* PASO 2: Datos Bancarios & Token */
            <div className="space-y-4">
              {/* Banner 48 Horas */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed space-y-1">
                  <p className="font-semibold text-amber-300">
                    Tus números quedan reservados durante 48 horas.
                  </p>
                  <p className="text-amber-200/90">
                    Realiza la transferencia y sube tu comprobante para confirmar tu participación definitiva.
                  </p>
                </div>
              </div>

              {/* Resumen de Monto Exacto */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 block">Monto exacto a transferir</span>
                  <span className="text-xs font-mono text-neutral-300">
                    Números: {selectedNumbers.map((n) => '#' + n).join(', ')}
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {formatCurrency(totalPrice)}
                </div>
              </div>

              {/* Datos Bancarios con Copiado */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-neutral-500">Alias</span>
                    <span className="font-mono text-sm font-bold text-white">{BANK_DETAILS.alias}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(BANK_DETAILS.alias, 'alias')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                  >
                    {copiedField === 'alias' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'alias' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-neutral-500">CBU / CVU</span>
                    <span className="font-mono text-xs font-semibold text-neutral-200">{BANK_DETAILS.cbu}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(BANK_DETAILS.cbu, 'cbu')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                  >
                    {copiedField === 'cbu' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'cbu' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 flex justify-between">
                  <span>Titular: <strong className="text-white">{BANK_DETAILS.titular}</strong></span>
                  <span>Banco: <strong className="text-white">{BANK_DETAILS.banco}</strong></span>
                </div>
              </div>

              {/* Token de seguimiento */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                <span className="block text-[10px] uppercase text-neutral-500 font-semibold">Tu token de validación</span>
                <div className="flex items-center justify-between font-mono text-neutral-300 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
                  <span className="truncate pr-2">{generatedToken}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedToken, 'token')}
                    className="text-xs text-neutral-400 hover:text-white shrink-0"
                  >
                    {copiedField === 'token' ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Botón directo a Comprobante */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleModalClose();
                    onGoToComprobante(generatedToken);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Subir Comprobante con mi Token</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CheckoutModal;
