import React, { useState, useEffect } from 'react';
import { RifaGrid } from './rifa/RifaGrid';
import { CheckoutModal } from './rifa/CheckoutModal';
import { SubirComprobante } from './rifa/SubirComprobante';
import { AdminView } from './rifa/AdminView';
import { Ticket as TicketIcon, UploadCloud, Shield } from 'lucide-react';

export const RifaApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'grid' | 'comprobante' | 'admin'>('grid');
  const [selectedNumbersForBooking, setSelectedNumbersForBooking] = useState<string[]>([]);
  const [bookingTotalPrice, setBookingTotalPrice] = useState<number>(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeToken, setActiveToken] = useState<string>('');

  useEffect(() => {
    const pathname = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const viewParam = params.get('view');
    const safeParam = params.get('safe') || params.get('secret');

    // Acceso administrativo oculto y exclusivo bajo la URL /rifa/safe/gestion
    const isSafeGestion =
      pathname === '/rifa/safe/gestion' ||
      pathname.endsWith('/safe/gestion') ||
      safeParam === 'gestion' ||
      viewParam === 'safe/gestion';

    if (isSafeGestion) {
      setCurrentView('admin');
    } else if (tokenParam) {
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

  const handleBackToGrid = () => {
    setCurrentView('grid');
    if (window.location.pathname.includes('/safe/gestion')) {
      window.history.pushState({}, '', '/rifa');
    }
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
      {/* Top Header - Sin enlaces externos a alicari.com.ar */}
      <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Título de la Rifa desacoplado */}
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm shadow-red-600/50" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">
              Rifa Shows de Bandas
            </span>
          </div>

          {/* Navegación Interna - Solo Grilla y Comprobante (Admin completamente oculto) */}
          <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
            <button
              onClick={handleBackToGrid}
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

            {/* Indicador exclusivo si se accedió por la URL oculta /rifa/safe/gestion */}
            {currentView === 'admin' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modo Gestión</span>
              </span>
            )}
          </nav>
        </div>
      </header>

      {/* Main View */}
      <main className="flex-1">
        {currentView === 'grid' && (
          <RifaGrid
            onContinue={handleStartBooking}
            onGoToComprobante={handleGoToComprobante}
          />
        )}

        {currentView === 'comprobante' && (
          <SubirComprobante
            initialToken={activeToken}
            onBackToGrid={handleBackToGrid}
          />
        )}

        {currentView === 'admin' && (
          <AdminView onBackToGrid={handleBackToGrid} />
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

      {/* Footer aislado sin enlaces de retorno ni accesos de admin */}
      <footer className="border-t border-neutral-800 bg-neutral-950/60 py-8 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-neutral-400 font-medium">
            Cobertura Audiovisual y Fotográfica de Shows en Vivo
          </p>
          <p>
            Rifa de 100 números únicos (00 al 99). Sorteo programado al completar la totalidad de los tickets.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default RifaApp;
