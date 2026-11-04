export type TicketEstado = 'disponible' | 'reservado' | 'pagado';

export interface Ticket {
  numero: string; // "00" .. "99"
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

export interface RifaPricingCalculation {
  count: number;
  promoPacks: number; // Groups of 3
  individualCount: number; // Remaining single tickets
  total: number;
  regularTotal: number;
  discount: number;
  savingsMessage?: string;
}

export interface ReservationData {
  nombre: string;
  telefono: string;
  email: string;
  aceptaViaticos: boolean;
  numeros: string[];
}

export interface BankDetails {
  alias: string;
  cbu: string;
  titular: string;
  banco: string;
  cuit: string;
}

