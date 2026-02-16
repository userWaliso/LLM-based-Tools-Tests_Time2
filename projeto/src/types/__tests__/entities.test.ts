/**
 * Testes Unitários — Entidades de Domínio e Máquina de Estados.
 *
 * Estratégia:
 * - Validar regras de negócio puras (sem dependência de UI ou React).
 * - Cobrir a máquina de estados de disponibilidade exaustivamente.
 * - Garantir que transições inválidas são rejeitadas.
 */

import { describe, it, expect } from "vitest";
import {
  canTransition,
  VALID_TRANSITIONS,
  ROOM_TYPE_LABELS,
  BED_TYPE_LABELS,
  AVAILABILITY_LABELS,
} from "@/types/entities";
import type { Availability, Room, Guest, Reservation } from "@/types/entities";

// ─── Máquina de Estados de Disponibilidade ─────────────────────────

describe("canTransition (State Machine)", () => {
  it("LIVRE → OCUPADO é válida", () => {
    expect(canTransition("LIVRE", "OCUPADO")).toBe(true);
  });

  it("LIVRE → MANUTENCAO é válida", () => {
    expect(canTransition("LIVRE", "MANUTENCAO")).toBe(true);
  });

  it("LIVRE → LIMPEZA é inválida", () => {
    expect(canTransition("LIVRE", "LIMPEZA")).toBe(false);
  });

  it("OCUPADO → LIMPEZA é válida", () => {
    expect(canTransition("OCUPADO", "LIMPEZA")).toBe(true);
  });

  it("OCUPADO → MANUTENCAO é válida", () => {
    expect(canTransition("OCUPADO", "MANUTENCAO")).toBe(true);
  });

  it("OCUPADO → LIVRE é inválida (deve passar por LIMPEZA)", () => {
    expect(canTransition("OCUPADO", "LIVRE")).toBe(false);
  });

  it("LIMPEZA → LIVRE é válida", () => {
    expect(canTransition("LIMPEZA", "LIVRE")).toBe(true);
  });

  it("LIMPEZA → OCUPADO é inválida", () => {
    expect(canTransition("LIMPEZA", "OCUPADO")).toBe(false);
  });

  it("MANUTENCAO → LIVRE é válida", () => {
    expect(canTransition("MANUTENCAO", "LIVRE")).toBe(true);
  });

  it("MANUTENCAO → OCUPADO é inválida", () => {
    expect(canTransition("MANUTENCAO", "OCUPADO")).toBe(false);
  });

  it("cobre todas as transições válidas declaradas", () => {
    const allStatuses: Availability[] = ["LIVRE", "OCUPADO", "MANUTENCAO", "LIMPEZA"];
    for (const from of allStatuses) {
      for (const to of VALID_TRANSITIONS[from]) {
        expect(canTransition(from, to)).toBe(true);
      }
    }
  });
});

// ─── Labels de UI ──────────────────────────────────────────────────

describe("Labels", () => {
  it("ROOM_TYPE_LABELS possui 3 tipos", () => {
    expect(Object.keys(ROOM_TYPE_LABELS)).toHaveLength(3);
  });

  it("BED_TYPE_LABELS possui 3 tipos", () => {
    expect(Object.keys(BED_TYPE_LABELS)).toHaveLength(3);
  });

  it("AVAILABILITY_LABELS possui 4 status", () => {
    expect(Object.keys(AVAILABILITY_LABELS)).toHaveLength(4);
  });
});

// ─── Tipagem de Entidades (Smoke Tests) ────────────────────────────

describe("Entity shapes", () => {
  it("Room aceita todos os campos obrigatórios", () => {
    const room: Room = {
      id: "r1",
      number: 101,
      capacity: 2,
      type: "BASICO",
      pricePerNight: 150,
      hasMinibar: false,
      hasBreakfast: true,
      hasAirConditioning: true,
      hasTV: false,
      availability: "LIVRE",
      beds: [{ id: "b1", type: "CASAL_KING" }],
    };
    expect(room.id).toBe("r1");
    expect(room.beds).toHaveLength(1);
  });

  it("Guest aceita todos os campos obrigatórios", () => {
    const guest: Guest = {
      id: "g1",
      firstName: "Maria",
      lastName: "Silva",
      cpf: "12345678901",
      email: "maria@test.com",
    };
    expect(guest.cpf).toHaveLength(11);
  });

  it("Reservation conecta Room e Guest", () => {
    const reservation: Reservation = {
      id: "res1",
      roomId: "r1",
      guestId: "g1",
      checkIn: "2026-03-01",
      checkOut: "2026-03-05",
      status: "OCUPADO",
    };
    expect(reservation.roomId).toBe("r1");
    expect(reservation.guestId).toBe("g1");
  });
});
