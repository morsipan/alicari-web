import React, { useState, useEffect } from 'react';
import { RifaGrid } from './rifa/RifaGrid';
import { CheckoutModal } from './rifa/CheckoutModal';
import { SubirComprobante } from './rifa/SubirComprobante';
import { Ticket as TicketIcon, UploadCloud, ArrowLeft } from 'lucide-react';

export const RifaApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'grid' | 'comprobante'>('grid');
  const [selectedNumbersForBooking, setSelectedNumbersForBooking] = useState<string[]>([]);
  const [bookingTotalPrice, setBookingTotalPrice] = useState<number>(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeToken, setActiveToken] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const viewParam = params.get('view');

    if (tokenParam) {
      setActiveToken(tokenParam);
      setCurrentView('comprobante');
    } else if (viewParam === 'comprobante') {
      setCurrentView('comprobante');
    }
  }, []);

  const handleStartBooking = (numbers: string[], total: number) => {
    setSelectedNumbersForBooking(numbers);
    setBookingTotalPrice(total);
    setIsCheckoutOpen(true);
  };

  const handleGoToComprobante = (token?: string) => {
    if (token) {
      setActiveToken(token);
      const url = new URL(window.location.href);
      url.searchParams.set('token', token);
      window.history.replaceState({}, '', url.toString());
    }
    setCurrentView('comprobante');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a
            href="index.html"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a alicari.com.ar</span>
          </a>

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
              <span>Grilla de Números</span>
            </button>

            <button
              onClick={() => handleGoToComprobante(activeToken)}
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

      {/* Main View */}
      <main className="flex-1">
        {currentView === 'grid' ? (
          <RifaGrid
            onContinue={handleStartBooking}
            onGoToComprobante={handleGoToComprobante}
          />
        ) : (
          <SubirComprobante
            initialToken={activeToken}
            onBackToGrid={() => setCurrentView('grid')}
          />
        )}
      </main>

      {/* Modal de Checkout / Reserva / Datos bancarios */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedNumbers={selectedNumbersForBooking}
        totalPrice={bookingTotalPrice}
        onGoToComprobante={handleGoToComprobante}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950/60 py-8 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-neutral-400 font-medium">
            ALICARI · Fotografía &amp; Dirección Audiovisual para Shows en Vivo
          </p>
          <p>
            Rifa de 100 números para cobertura de shows en CABA / GBA.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default RifaApp;
