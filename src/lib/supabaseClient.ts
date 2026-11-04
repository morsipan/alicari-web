import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://wzejbitrmseinafskrki.supabase.co';

const SUPABASE_ANON_KEY =
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
