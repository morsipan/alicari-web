export type TicketEstado = 'disponible' | 'reservado' | 'pagado';

export interface Ticket {
  numero: string; // '00' a '99'
  estado: TicketEstado;
  participante_id?: string | null;
  reserva_expira_en?: string | null;
  token_validacion?: string | null;
  comprobante_url?: string | null;
  updated_at?: string | null;
}

export interface Participante {
  id?: string;
  nombre: string;
  telefono: string;
  email: string;
  created_at?: string;
}

export interface RifaConfig {
  id?: string;
  titulo: string;
  descripcion?: string;
  precio_unitario: number; // 5000
  precio_promo_3: number; // 12000
  total_numeros: number; // 100
  activa: boolean;
  alias_bancario: string;
  cbu_bancario: string;
  titular_bancario: string;
}

export interface RifaPricingCalculation {
  count: number;
  promoPacks: number;
  individualCount: number;
  total: number;
  regularTotal: number;
  discount: number;
  savingsMessage?: string;
}
