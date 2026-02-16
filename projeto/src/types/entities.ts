/**
 * Entidades do domínio — Sistema de Reservas de Hotel
 *
 * Princípios aplicados:
 * - SRP: Cada tipo representa uma única entidade do domínio.
 * - OCP: Enums permitem extensão sem modificar código existente.
 * - Tipagem forte com union types e readonly para imutabilidade.
 */

// ─── Enumerações de Domínio ────────────────────────────────────────

/** Tipos de quarto com faixas de preço distintas (Strategy Pattern) */
export type RoomType = "BASICO" | "MODERNO" | "LUXO";

/** Tipos de cama disponíveis */
export type BedType = "SOLTEIRO" | "CASAL_KING" | "CASAL_QUEEN";

/**
 * Status de disponibilidade do quarto.
 * Segue máquina de estados:
 *   LIVRE → OCUPADO | MANUTENCAO
 *   OCUPADO → LIMPEZA | MANUTENCAO
 *   LIMPEZA → LIVRE
 *   MANUTENCAO → LIVRE
 */
export type Availability = "LIVRE" | "OCUPADO" | "MANUTENCAO" | "LIMPEZA";

// ─── Entidades ─────────────────────────────────────────────────────

/** Cama — componente do Composite Pattern dentro de Room */
export interface Bed {
  readonly id: string;
  type: BedType;
}

/**
 * Quarto — entidade raiz do módulo de quartos.
 * Contém amenidades como campos booleanos (evita tabela auxiliar
 * desnecessária para um domínio pequeno e estável).
 */
export interface Room {
  readonly id: string;
  number: number;
  capacity: number;
  type: RoomType;
  pricePerNight: number;
  hasMinibar: boolean;
  hasBreakfast: boolean;
  hasAirConditioning: boolean;
  hasTV: boolean;
  availability: Availability;
  beds: Bed[];
}

/**
 * Hóspede — entidade raiz do módulo de hóspedes.
 * CPF armazenado sem máscara para normalização; formatação na UI.
 */
export interface Guest {
  readonly id: string;
  firstName: string;
  lastName: string;
  cpf: string;
  email: string;
}

/**
 * Reserva — entidade associativa entre Quarto e Hóspede.
 * O preço total é calculado (derivado) a partir das diárias × preço do quarto.
 */
export interface Reservation {
  readonly id: string;
  roomId: string;
  guestId: string;
  checkIn: string; // ISO date string
  checkOut: string;
  status: Availability;
}

// ─── Tipos Auxiliares ──────────────────────────────────────────────

/** Labels amigáveis para exibição na UI */
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  BASICO: "Básico",
  MODERNO: "Moderno",
  LUXO: "Luxo",
};

export const BED_TYPE_LABELS: Record<BedType, string> = {
  SOLTEIRO: "Solteiro",
  CASAL_KING: "Casal King",
  CASAL_QUEEN: "Casal Queen",
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  LIVRE: "Livre",
  OCUPADO: "Ocupado",
  MANUTENCAO: "Manutenção",
  LIMPEZA: "Limpeza",
};

/**
 * Máquina de estados — transições válidas de disponibilidade.
 * Encapsula regra de negócio crítica de forma declarativa.
 */
export const VALID_TRANSITIONS: Record<Availability, Availability[]> = {
  LIVRE: ["OCUPADO", "MANUTENCAO"],
  OCUPADO: ["LIMPEZA", "MANUTENCAO"],
  LIMPEZA: ["LIVRE"],
  MANUTENCAO: ["LIVRE"],
};

export function canTransition(from: Availability, to: Availability): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
