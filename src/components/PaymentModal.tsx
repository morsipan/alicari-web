import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Clock,
  ExternalLink,
  UploadCloud,
  MessageCircle,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { BANK_DETAILS, CONTACT_WHATSAPP } from '../lib/bankConfig';
import { formatCurrency } from '../lib/rifaPricing';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  participantName: string;
  participantEmail: string;
  selectedNumbers: string[];
  totalPrice: number;
  onGoToComprobante: (token: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  token,
  participantName,
  participantEmail,
  selectedNumbers,
  totalPrice,
  onGoToComprobante,
}) => {
  const [copiedField, setCopiedField] = useState<'alias' | 'cbu' | 'monto' | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, field: 'alias' | 'cbu' | 'monto') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola Agustín! Acabo de reservar los números ${selectedNumbers.map((n) => '#' + n).join(', ')} para la rifa del show. Mi nombre es ${participantName} y mi token de reserva es: ${token}. Adjunto comprobante.`
  );
  const whatsappUrl = `https://wa.me/${CONTACT_WHATSAPP}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100 animate-scaleUp max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con éxito */}
        <div className="px-6 py-5 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-1 text-[11px] font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span>¡Reserva generada con éxito!</span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-white">Datos de Transferencia Bancaria</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Banner de aviso de 48 horas */}
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs leading-relaxed space-y-1">
              <p className="font-semibold text-amber-300">
                Tus números quedan reservados durante 48 horas.
              </p>
              <p className="text-amber-200/90">
                Una vez realizada la transferencia, subí tu comprobante desde esta pantalla o usando el enlace con tu token personal enviado a <span className="underline font-mono text-white">{participantEmail}</span>.
              </p>
            </div>
          </div>

          {/* Resumen de la compra */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                Números reservados
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
            <div className="text-right">
              <span className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                Monto exacto a transferir
              </span>
              <div className="text-2xl font-black text-emerald-400">
                {formatCurrency(totalPrice)}
              </div>
            </div>
          </div>

          {/* Tarjeta con los datos bancarios para copiar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-500" />
              <span>Cuenta bancaria de destino</span>
            </h4>

            <div className="space-y-2.5">
              {/* Alias */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-neutral-500">Alias</span>
                  <span className="font-mono text-base font-bold text-white tracking-wide">
                    {BANK_DETAILS.alias}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(BANK_DETAILS.alias, 'alias')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-all active:scale-95"
                >
                  {copiedField === 'alias' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {/* CBU */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-neutral-500">CBU</span>
                  <span className="font-mono text-xs sm:text-sm font-semibold text-neutral-200 tracking-wider">
                    {BANK_DETAILS.cbu}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(BANK_DETAILS.cbu, 'cbu')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-all active:scale-95"
                >
                  {copiedField === 'cbu' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Titular y Banco */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-neutral-950/40 border border-neutral-800/60 text-neutral-400">
                <div>
                  <span className="block text-neutral-500 text-[10px] uppercase font-semibold">Titular</span>
                  <span className="text-neutral-200 font-medium">{BANK_DETAILS.titular}</span>
                </div>
                <div>
                  <span className="block text-neutral-500 text-[10px] uppercase font-semibold">Banco / Entidad</span>
                  <span className="text-neutral-200 font-medium">{BANK_DETAILS.banco}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Token de validación único */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
            <span className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
              Tu Token Único de Validación
            </span>
            <div className="flex items-center justify-between font-mono text-neutral-300 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
              <span className="truncate pr-2">{token}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(token, 'monto')}
                className="text-xs text-neutral-400 hover:text-white shrink-0"
              >
                {copiedField === 'monto' ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-950/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Notificar por WhatsApp</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-medium rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToComprobante(token);
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Subir Comprobante Ahora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

