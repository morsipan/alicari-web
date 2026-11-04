import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://wzejbitrmseinafskrki.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZWpiaXRybXNlaW5hZnNrcmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NTk3ODUsImV4cCI6MjEwOTMzNTc4NX0.rY0K2QuMb8ZlpmCeKbTYKXasn7sDFaLMAWyVpVZvFfs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const BUCKET_COMPROBANTES = 'comprobantes';

/**
 * Verifica si el bucket 'comprobantes' existe en Supabase Storage.
 * Si no existe o no se puede listar, intenta crearlo como bucket público (public: true).
 */
export async function ensureComprobantesBucket(): Promise<boolean> {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (!listError && buckets) {
      const exists = buckets.some((b) => b.name === BUCKET_COMPROBANTES || b.id === BUCKET_COMPROBANTES);
      if (exists) return true;
    }

    const { error: createError } = await supabase.storage.createBucket(BUCKET_COMPROBANTES, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    });

    if (createError) {
      // Si ya existe o falta permiso administrativo, continuamos sin bloquear
      console.warn('Bucket comprobantes aviso:', createError.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('No se pudo verificar el bucket comprobantes de forma administrativa:', err);
    return false;
  }
}
