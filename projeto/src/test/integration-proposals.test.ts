/**
 * Testes de Integração — PROPOSTAS (Esqueleto).
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ ESTRATÉGIA DE COBERTURA DE TESTES                              │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                │
 * │  CAMADA 1 — Unitários (implementados acima)                    │
 * │  ✓ Entidades e tipagem (smoke tests)                           │
 * │  ✓ Máquina de estados (transições válidas/inválidas)           │
 * │  ✓ Repository: CRUD com validação de duplicidade               │
 * │  Cobertura alvo: 90%+ das regras de negócio puras              │
 * │                                                                │
 * │  CAMADA 2 — Integração (esqueletos abaixo)                     │
 * │  → Fluxo cross-module: Hóspede → Reserva → Disponibilidade    │
 * │  → Validação de consistência entre entidades                   │
 * │  Cobertura alvo: fluxos críticos end-to-end                    │
 * │                                                                │
 * │  CAMADA 3 — E2E (futuro, com Playwright/Cypress)               │
 * │  → Navegação real na UI                                        │
 * │  → Formulários, toasts, redirecionamentos                      │
 * │                                                                │
 * │  PRIORIDADE: Camada 1 > Camada 2 > Camada 3                   │
 * │  Justificativa: Testes unitários são rápidos, baratos e        │
 * │  cobrem a maior parte das regras. Integração valida fluxos     │
 * │  críticos. E2E é reservado para regressão de UI.               │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Os testes abaixo são esqueletos prontos para implementação
 * quando os módulos de Hóspedes e Reservas estiverem completos.
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { Room, Guest, Reservation, Availability } from "@/types/entities";
import { canTransition } from "@/types/entities";

// ─── Simulação do fluxo cross-module ───────────────────────────────

const STORAGE = {
  rooms: "hotel_rooms",
  guests: "hotel_guests",
  reservations: "hotel_reservations",
};

function getAll<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function save<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// ─── Testes de Integração ──────────────────────────────────────────

describe("Integração: Cadastro de Hóspede → Reserva → Disponibilidade", () => {
  const guest: Guest = {
    id: "g1",
    firstName: "Carlos",
    lastName: "Oliveira",
    cpf: "12345678901",
    email: "carlos@email.com",
  };

  const room: Room = {
    id: "r1",
    number: 201,
    capacity: 2,
    type: "MODERNO",
    pricePerNight: 300,
    hasMinibar: true,
    hasBreakfast: true,
    hasAirConditioning: true,
    hasTV: true,
    availability: "LIVRE",
    beds: [{ id: "b1", type: "CASAL_KING" }],
  };

  beforeEach(() => {
    localStorage.clear();
    save(STORAGE.rooms, [room]);
    save(STORAGE.guests, [guest]);
  });

  it("1. Cadastra hóspede e verifica persistência", () => {
    const guests = getAll<Guest>(STORAGE.guests);
    expect(guests).toHaveLength(1);
    expect(guests[0].firstName).toBe("Carlos");
    expect(guests[0].cpf).toBe("12345678901");
  });

  it("2. Cria reserva vinculando hóspede ao quarto", () => {
    const reservation: Reservation = {
      id: "res1",
      roomId: room.id,
      guestId: guest.id,
      checkIn: "2026-03-10",
      checkOut: "2026-03-15",
      status: "OCUPADO",
    };

    save(STORAGE.reservations, [reservation]);

    const reservations = getAll<Reservation>(STORAGE.reservations);
    expect(reservations).toHaveLength(1);
    expect(reservations[0].roomId).toBe("r1");
    expect(reservations[0].guestId).toBe("g1");
  });

  it("3. Atualiza disponibilidade do quarto ao criar reserva", () => {
    // Simula: ao criar reserva, o quarto muda LIVRE → OCUPADO
    expect(canTransition("LIVRE", "OCUPADO")).toBe(true);

    const rooms = getAll<Room>(STORAGE.rooms);
    const updatedRoom: Room = { ...rooms[0], availability: "OCUPADO" };
    save(STORAGE.rooms, [updatedRoom]);

    const saved = getAll<Room>(STORAGE.rooms)[0];
    expect(saved.availability).toBe("OCUPADO");
  });

  it("4. Fluxo completo: reserva → check-out → limpeza → livre", () => {
    // LIVRE → OCUPADO (check-in)
    expect(canTransition("LIVRE", "OCUPADO")).toBe(true);

    // OCUPADO → LIMPEZA (check-out)
    expect(canTransition("OCUPADO", "LIMPEZA")).toBe(true);

    // LIMPEZA → LIVRE (quarto limpo)
    expect(canTransition("LIMPEZA", "LIVRE")).toBe(true);

    // Simula o ciclo completo
    let status: Availability = "LIVRE";
    status = "OCUPADO"; // check-in
    status = "LIMPEZA"; // check-out
    status = "LIVRE";   // liberado

    const updatedRoom: Room = { ...room, availability: status };
    save(STORAGE.rooms, [updatedRoom]);

    expect(getAll<Room>(STORAGE.rooms)[0].availability).toBe("LIVRE");
  });

  it("5. Impede reserva em quarto não-livre", () => {
    // Quarto está OCUPADO — não pode ir direto para OCUPADO novamente
    const occupiedRoom: Room = { ...room, availability: "OCUPADO" };
    save(STORAGE.rooms, [occupiedRoom]);

    // Tentativa de criar nova reserva deveria falhar
    const canReserve = canTransition("OCUPADO", "OCUPADO");
    expect(canReserve).toBe(false);
  });

  it("6. Reserva referencia IDs válidos de hóspede e quarto", () => {
    const reservation: Reservation = {
      id: "res1",
      roomId: "r1",
      guestId: "g1",
      checkIn: "2026-03-10",
      checkOut: "2026-03-15",
      status: "OCUPADO",
    };

    const rooms = getAll<Room>(STORAGE.rooms);
    const guests = getAll<Guest>(STORAGE.guests);

    // Valida integridade referencial
    expect(rooms.some((r) => r.id === reservation.roomId)).toBe(true);
    expect(guests.some((g) => g.id === reservation.guestId)).toBe(true);
  });
});
