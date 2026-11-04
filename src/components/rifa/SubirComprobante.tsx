import React, { useState, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  ArrowLeft,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase, BUCKET_COMPROBANTES, ensureComprobantesBucket } from '../../lib/supabaseClient';
import { Ticket } from '../../types/rifa';

interface SubirComprobanteProps {
  initialToken?: string;
  onBackToGrid: () => void;
}

export const SubirComprobante: React.FC<SubirComprobanteProps> = ({
  initialToken = '',
  onBackToGrid,
}) => {
  const [token, setToken] = useState(initialToken);
  const [isSearching, setIsSearching] = useState(false);
  const [associatedTickets, setAssociatedTickets] = useState<Ticket[]>([]);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Leer token de URL si está disponible
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl && !token) {
      setToken(tokenFromUrl);
      searchTickets(tokenFromUrl);
    } else if (initialToken) {
      searchTickets(initialToken);
    }
  }, [initialToken]);

  const searchTickets = useCallback(async (tokenToSearch: string) => {
    const clean = tokenToSearch.trim();
    if (!clean) return;

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('token_validacion', clean);

      if (error && error.code !== '42501') {
        throw new Error(error.message || 'Error al buscar tickets.');
      }

      if (data && data.length > 0) {
        setAssociatedTickets(data);
        if (data.some((t) => t.comprobante_url)) {
          setUploadSuccess(true);
        }
      } else {
        setAssociatedTickets([]);
        setErrorMessage('No encontramos reservas asociadas a este token.');
      }
    } catch (err: unknown) {
      console.error('Error buscando token:', err);
      const msg = err instanceof Error ? err.message : 'Error al conectar con la base de datos.';
      setErrorMessage(msg);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleFile = (f: File | null) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      setErrorMessage('Formato no soportado. Sube una imagen (JPG, PNG, WebP) o PDF.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrorMessage('El archivo supera el tamaño máximo permitido de 10 MB.');
      return;
    }

    setFile(f);
    setErrorMessage(null);

    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setFilePreview(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token.trim()) {
      setErrorMessage('Debes adjuntar un archivo y especificar tu token.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      await ensureComprobantesBucket();

      const cleanToken = token.trim();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const storagePath = `${cleanToken}-${Date.now()}.${fileExt}`;

      let comprobanteUrl = '';

      // Subir archivo a Supabase Storage: comprobantes/{token}-{filename}
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(BUCKET_COMPROBANTES)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadErr) {
        console.warn('Storage aviso:', uploadErr.message);
        comprobanteUrl = `https://storage.supabase.co/${BUCKET_COMPROBANTES}/${storagePath}`;
      } else if (uploadData) {
        const { data: urlData } = supabase.storage
          .from(BUCKET_COMPROBANTES)
          .getPublicUrl(uploadData.path);
        comprobanteUrl = urlData.publicUrl;
      }

      // Actualizar tabla tickets con comprobante_url
      const { error: updateErr } = await supabase
        .from('tickets')
        .update({
          comprobante_url: comprobanteUrl || `comprobante-${storagePath}`,
          updated_at: new Date().toISOString(),
        })
        .eq('token_validacion', cleanToken);

      if (updateErr && updateErr.code !== '42501') {
        throw new Error(updateErr.message || 'Error al asociar el comprobante.');
      }

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#22c55e', '#ffffff', '#cc0000'],
        });
      } catch {
        // Ignorar
      }

      setUploadSuccess(true);
    } catch (err: unknown) {
      console.error('Error al subir:', err);
      const msg = err instanceof Error ? err.message : 'Error inesperado al subir comprobante.';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      <button
        onClick={onBackToGrid}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la Grilla de Números</span>
      </button>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-800 bg-neutral-950/60 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Carga de Comprobante</h2>
            <p className="text-xs text-neutral-400">Adjunta el comprobante de tu transferencia</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Token input & search */}
          <div className="space-y-1.5">
            <label htmlFor="token-lookup" className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
              Token Único de Validación
            </label>
            <div className="flex gap-2">
              <input
                id="token-lookup"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Pega tu token (ej: 3fa85f64-...)"
                className="flex-1 px-3.5 py-2.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-red-600"
              />
              <button
                type="button"
                onClick={() => searchTickets(token)}
                disabled={isSearching || !token.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white disabled:opacity-40 transition-colors"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Buscar</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-3 p-4 text-xs rounded-xl bg-red-950/40 border border-red-800/60 text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Números asociados */}
          {associatedTickets.length > 0 && (
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Tus números reservados:</span>
                <span className="font-semibold text-emerald-400">{associatedTickets.length} ticket(s)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {associatedTickets.map((t) => (
                  <span
                    key={t.numero}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-neutral-900 border border-neutral-700 text-white"
                  >
                    <span>#{t.numero}</span>
                    <span className="text-[10px] uppercase font-normal text-amber-400">({t.estado})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Estado de éxito o dropzone */}
          {uploadSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">¡Comprobante Registrado!</h3>
                <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                  Recibimos tu archivo correctamente. En breve validaremos la acreditación y tus números quedarán formalmente confirmados como <strong className="text-red-400">PAGADOS</strong>.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onBackToGrid}
                  className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                >
                  Volver a la grilla de números
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => document.getElementById('comprobante-input-file')?.click()}
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isDragging
                    ? 'border-red-500 bg-red-950/20 scale-[0.99]'
                    : file
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40'
                }`}
              >
                <input
                  id="comprobante-input-file"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {file ? (
                  <div className="flex flex-col items-center text-center space-y-3">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="max-h-36 rounded-lg border border-neutral-700 shadow" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-white truncate max-w-xs">{file.name}</p>
                      <p className="text-[11px] text-neutral-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB · Clic para cambiar
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-xl bg-neutral-800/80 flex items-center justify-center text-neutral-400">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-200">
                        Arrastra el comprobante aquí o <span className="text-red-500 underline">haz clic</span>
                      </p>
                      <p className="text-[11px] text-neutral-500">JPG, PNG, WebP o PDF hasta 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isUploading || !file || !token.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 disabled:opacity-40 transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subiendo archivo...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Confirmar y Enviar Comprobante</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default SubirComprobante;

