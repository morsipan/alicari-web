import React, { useState, useEffect } from 'react';
import { RifaGrid } from './RifaGrid';
import { ReservationModal } from './ReservationModal';
import { PaymentModal } from './PaymentModal';
import { ComprobanteUpload } from './ComprobanteUpload';
import { Ticket as TicketIcon, UploadCloud, ArrowLeft, Camera, ShieldCheck } from 'lucide-react';

export const RifaApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'grid' | 'comprobante'>('grid');
  const [selectedNumbersForBooking, setSelectedNumbersForBooking] = useState<string[]>([]);
  const [bookingTotalPrice, setBookingTotalPrice] = useState<number>(0);

  // Modal states
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Success data from reservation
  const [lastToken, setLastToken] = useState<string>('');
  const [lastParticipantName, setLastParticipantName] = useState<string>('');
  const [lastParticipantEmail, setLastParticipantEmail] = useState<string>('');

  // Check URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const viewParam = params.get('view');

    if (tokenParam) {
      setLastToken(tokenParam);
      setCurrentView('comprobante');
    } else if (viewParam === 'comprobante') {
      setCurrentView('comprobante');
    }
  }, []);

  const handleStartReservation = (numbers: string[], total: number) => {
    setSelectedNumbersForBooking(numbers);
    setBookingTotalPrice(total);
    setIsReservationOpen(true);
  };

  const handleReservationSuccess = (token: string, name: string, email: string) => {
    setLastToken(token);
    setLastParticipantName(name);
    setLastParticipantEmail(email);
    setIsReservationOpen(false);
    setIsPaymentOpen(true);

    // Update URL with token without reloading
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('token', token);
    window.history.replaceState({}, '', newUrl.toString());
  };

  const handleGoToComprobante = (token?: string) => {
    if (token) setLastToken(token);
    setCurrentView('comprobante');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="index.html"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a alicari.com.ar</span>
            </a>
          </div>

          {/* Selector de Vistas / Pestañas */}
          <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
            <button
              onClick={() => setCurrentView('grid')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'grid'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <TicketIcon className="w-3.5 h-3.5" />
              <span>Elegir Números</span>
            </button>

            <button
              onClick={() => setCurrentView('comprobante')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'comprobante'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Subir Comprobante</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'grid' ? (
          <RifaGrid
            onContinueReservation={handleStartReservation}
            onGoToComprobante={(token) => handleGoToComprobante(token)}
          />
        ) : (
          <ComprobanteUpload
            initialToken={lastToken}
            onBackToGrid={() => setCurrentView('grid')}
          />
        )}
      </main>

      {/* Modal 1: Formulario de Reserva */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        selectedNumbers={selectedNumbersForBooking}
        totalPrice={bookingTotalPrice}
        onSuccess={handleReservationSuccess}
      />

      {/* Modal 2: Popup de Pago con Datos Bancarios */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        token={lastToken}
        participantName={lastParticipantName}
        participantEmail={lastParticipantEmail}
        selectedNumbers={selectedNumbersForBooking}
        totalPrice={bookingTotalPrice}
        onGoToComprobante={(token) => handleGoToComprobante(token)}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950/60 py-8 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-neutral-400 font-medium">
            ALICARI · Fotografía &amp; Dirección Audiovisual para Shows en Vivo
          </p>
          <p>
            Rifa de 100 números con sorteo por Lotería de la Ciudad o transmisión en vivo de Instagram al completar los números.
          </p>
          <p className="text-[11px] text-neutral-600">
            Buenos Aires, Argentina · Cobertura CABA y GBA (viáticos a coordinar si es otra zona).
          </p>
        </div>
      </footer>
    </div>
  );
};
export default RifaApp;

