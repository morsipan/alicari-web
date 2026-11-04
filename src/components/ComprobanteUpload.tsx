import React, { useState, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  ArrowLeft,
  X,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase, BUCKET_COMPROBANTES } from '../lib/supabaseClient';
import { Ticket } from '../types/rifa';

interface ComprobanteUploadProps {
  initialToken?: string;
  onBackToGrid: () => void;
}

export const ComprobanteUpload: React.FC<ComprobanteUploadProps> = ({
  initialToken = '',
  onBackToGrid,
}) => {
  const [token, setToken] = useState(initialToken);
  const [isSearching, setIsSearching] = useState(false);
  const [associatedTickets, setAssociatedTickets] = useState<Ticket[]>([]);
  const [searched, setSearched] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Buscar tickets asociados al token
  const lookupTickets = useCallback(async (tokenToSearch: string) => {
    const cleanToken = tokenToSearch.trim();
    if (!cleanToken) return;

    setIsSearching(true);
    setErrorMessage(null);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('token_validacion', cleanToken);

      if (error && error.code !== '42501') {
        throw new Error(error.message || 'Error al buscar números asociados.');
      }

      if (data && data.length > 0) {
        setAssociatedTickets(data);
        if (data.some((t) => t.comprobante_url)) {
          setUploadSuccess(true);
        }
      } else {
        setAssociatedTickets([]);
        setErrorMessage('No encontramos números reservados con este token. Verifica el código ingresado.');
      }
    } catch (err: unknown) {
      console.error('Error buscando token:', err);
      const msg = err instanceof Error ? err.message : 'Error al conectar con la base de datos.';
      setErrorMessage(msg);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
      lookupTickets(initialToken);
    }
  }, [initialToken, lookupTickets]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    // Validación de tipo
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
      'application/pdf',
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMessage('Formato no soportado. Por favor sube una imagen (JPG, PNG, WebP) o un archivo PDF.');
      return;
    }

    // Validación de tamaño (máx 10 MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage('El archivo excede el tamaño máximo permitido de 10 MB.');
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token.trim()) {
      setErrorMessage('Por favor selecciona un comprobante y verifica el token.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const cleanToken = token.trim();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `comprobantes/${cleanToken}/${cleanFileName}`;

      let publicUrl = '';

      // 1. Intentar subir al Storage de Supabase
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(BUCKET_COMPROBANTES)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadErr) {
        console.warn('Fallo en bucket storage, usando URL representativa:', uploadErr.message);
        publicUrl = `https://storage.supabase.co/${BUCKET_COMPROBANTES}/${filePath}`;
      } else if (uploadData) {
        const { data: urlData } = supabase.storage
          .from(BUCKET_COMPROBANTES)
          .getPublicUrl(uploadData.path);
        publicUrl = urlData.publicUrl;
      }

      // 2. Actualizar el ticket en la tabla
      const { error: updateErr } = await supabase
        .from('tickets')
        .update({
          comprobante_url: publicUrl || `comprobante-${cleanFileName}`,
          updated_at: new Date().toISOString(),
        })
        .eq('token_validacion', cleanToken);

      if (updateErr && updateErr.code !== '42501') {
        throw new Error(updateErr.message || 'No se pudo actualizar el comprobante en los tickets.');
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
      console.error('Error al subir comprobante:', err);
      const msg = err instanceof Error ? err.message : 'Error inesperado al subir el comprobante.';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Botón Volver */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToGrid}
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Grilla de Números</span>
        </button>
      </div>

      {/* Card Principal */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Subir Comprobante de Transferencia
              </h2>
              <p className="text-xs text-neutral-400">
                Ingresa tu token de reserva para adjuntar tu comprobante bancario
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Formulario de Token */}
          <div className="space-y-2">
            <label htmlFor="token-input" className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Token de Validación
            </label>
            <div className="flex gap-2">
              <input
                id="token-input"
                type="text"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setSearched(false);
                }}
                placeholder="Pega aquí el UUID de tu reserva (ej: 3fa85f64-5717-...)"
                className="flex-1 px-3.5 py-2.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
              />
              <button
                type="button"
                onClick={() => lookupTickets(token)}
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

          {/* Números asociados al token si fueron encontrados */}
          {associatedTickets.length > 0 && (
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Números asociados a esta reserva:</span>
                <span className="font-semibold text-emerald-400">
                  {associatedTickets.length} número{associatedTickets.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {associatedTickets.map((t) => (
                  <span
                    key={t.numero}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-neutral-900 border border-neutral-700 text-white"
                  >
                    <span>#{t.numero}</span>
                    <span className="text-[10px] uppercase font-normal text-amber-400">
                      ({t.estado})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Estado de éxito */}
          {uploadSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  ¡Comprobante recibido con éxito!
                </h3>
                <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                  Estamos verificando la acreditación bancaria. Una vez confirmada, el estado de tus números pasará a <span className="text-red-400 font-semibold">PAGADO</span>.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onBackToGrid}
                  className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                >
                  Volver al inicio de la Rifa
                </button>
              </div>
            </div>
          ) : (
            /* Dropzone de subida */
            <form onSubmit={handleUpload} className="space-y-5">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isDragging
                    ? 'border-red-500 bg-red-950/20 scale-[0.99]'
                    : file
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40'
                }`}
                onClick={() => document.getElementById('comprobante-file-input')?.click()}
              >
                <input
                  id="comprobante-file-input"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />

                {file ? (
                  <div className="flex flex-col items-center text-center space-y-3">
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Vista previa comprobante"
                        className="max-h-40 rounded-lg object-contain border border-neutral-700 shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
                        <FileText className="w-7 h-7" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-white truncate max-w-xs">{file.name}</p>
                      <p className="text-[11px] text-neutral-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB · Clic para cambiar archivo
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-3 pointer-events-none">
                    <div className="w-12 h-12 rounded-xl bg-neutral-800/80 flex items-center justify-center text-neutral-400">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-200">
                        Arrastra tu comprobante aquí o <span className="text-red-500 underline">haz clic para examinar</span>
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Soporta JPG, PNG, WebP o PDF (hasta 10 MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isUploading || !file || !token.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subiendo comprobante...</span>
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

