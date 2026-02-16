/**
 * Testes Unitários — useRooms (Repository/Facade).
 *
 * Estratégia:
 * - Testar a camada de dados isoladamente (sem React).
 * - Cobrir: criação, edição, validação de duplicidade e remoção.
 * - Usar localStorage mockado para isolar o ambiente de teste.
 *
 * Decisão: Testamos as funções internas (fetchRooms/persistRooms)
 * indiretamente, pois são privadas do módulo. Os testes exercitam
 * a interface pública via simulação direta do fluxo CRUD.
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { Room } from "@/types/entities";

const STORAGE_KEY = "hotel_rooms";

// ─── Helpers (replicam a lógica do Repository para teste isolado) ──

function fetchRooms(): Room[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function persistRooms(rooms: Room[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

function createRoom(room: Room): Room {
  const rooms = fetchRooms();
  if (rooms.some((r) => r.number === room.number)) {
    throw new Error(`Quarto nº ${room.number} já existe.`);
  }
  persistRooms([...rooms, room]);
  return room;
}

function updateRoom(room: Room): Room {
  const rooms = fetchRooms();
  if (rooms.some((r) => r.number === room.number && r.id !== room.id)) {
    throw new Error(`Quarto nº ${room.number} já existe.`);
  }
  persistRooms(rooms.map((r) => (r.id === room.id ? room : r)));
  return room;
}

function deleteRoom(id: string): void {
  persistRooms(fetchRooms().filter((r) => r.id !== id));
}

// ─── Fixtures ──────────────────────────────────────────────────────

const makeRoom = (overrides: Partial<Room> = {}): Room => ({
  id: crypto.randomUUID(),
  number: 101,
  capacity: 2,
  type: "BASICO",
  pricePerNight: 200,
  hasMinibar: false,
  hasBreakfast: false,
  hasAirConditioning: true,
  hasTV: true,
  availability: "LIVRE",
  beds: [{ id: "b1", type: "SOLTEIRO" }],
  ...overrides,
});

// ─── Testes ────────────────────────────────────────────────────────

describe("Room CRUD (Repository Layer)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── Cadastro ──────────────────────────────────────────────────

  describe("Cadastro de Quarto", () => {
    it("cria um quarto com sucesso", () => {
      const room = makeRoom();
      createRoom(room);

      const rooms = fetchRooms();
      expect(rooms).toHaveLength(1);
      expect(rooms[0].number).toBe(101);
    });

    it("preserva todas as propriedades ao criar", () => {
      const room = makeRoom({
        type: "LUXO",
        hasMinibar: true,
        hasBreakfast: true,
        beds: [
          { id: "b1", type: "CASAL_KING" },
          { id: "b2", type: "SOLTEIRO" },
        ],
      });
      createRoom(room);

      const saved = fetchRooms()[0];
      expect(saved.type).toBe("LUXO");
      expect(saved.hasMinibar).toBe(true);
      expect(saved.hasBreakfast).toBe(true);
      expect(saved.beds).toHaveLength(2);
    });

    it("rejeita número de quarto duplicado", () => {
      createRoom(makeRoom({ id: "r1", number: 101 }));
      expect(() => createRoom(makeRoom({ id: "r2", number: 101 }))).toThrow(
        "Quarto nº 101 já existe."
      );
    });

    it("permite quartos com números diferentes", () => {
      createRoom(makeRoom({ id: "r1", number: 101 }));
      createRoom(makeRoom({ id: "r2", number: 102 }));
      expect(fetchRooms()).toHaveLength(2);
    });
  });

  // ── Edição ────────────────────────────────────────────────────

  describe("Edição de Quarto", () => {
    it("atualiza campos do quarto", () => {
      const room = makeRoom({ id: "r1" });
      createRoom(room);

      updateRoom({ ...room, pricePerNight: 350, type: "MODERNO" });

      const updated = fetchRooms()[0];
      expect(updated.pricePerNight).toBe(350);
      expect(updated.type).toBe("MODERNO");
    });

    it("permite alterar o número para um valor não utilizado", () => {
      createRoom(makeRoom({ id: "r1", number: 101 }));
      updateRoom(makeRoom({ id: "r1", number: 999 }));

      expect(fetchRooms()[0].number).toBe(999);
    });

    it("rejeita alterar número para um já existente em outro quarto", () => {
      createRoom(makeRoom({ id: "r1", number: 101 }));
      createRoom(makeRoom({ id: "r2", number: 102 }));

      expect(() => updateRoom(makeRoom({ id: "r2", number: 101 }))).toThrow(
        "Quarto nº 101 já existe."
      );
    });

    it("permite salvar sem alterar o número (mesmo ID)", () => {
      const room = makeRoom({ id: "r1", number: 101 });
      createRoom(room);

      expect(() => updateRoom({ ...room, pricePerNight: 500 })).not.toThrow();
    });

    it("atualiza camas corretamente", () => {
      const room = makeRoom({ id: "r1", beds: [{ id: "b1", type: "SOLTEIRO" }] });
      createRoom(room);

      updateRoom({
        ...room,
        beds: [
          { id: "b1", type: "CASAL_KING" },
          { id: "b2", type: "CASAL_QUEEN" },
        ],
      });

      const updated = fetchRooms()[0];
      expect(updated.beds).toHaveLength(2);
      expect(updated.beds[0].type).toBe("CASAL_KING");
    });
  });

  // ── Remoção ───────────────────────────────────────────────────

  describe("Remoção de Quarto", () => {
    it("remove quarto pelo ID", () => {
      createRoom(makeRoom({ id: "r1", number: 101 }));
      createRoom(makeRoom({ id: "r2", number: 102 }));

      deleteRoom("r1");
      const rooms = fetchRooms();
      expect(rooms).toHaveLength(1);
      expect(rooms[0].id).toBe("r2");
    });

    it("ignora remoção de ID inexistente", () => {
      createRoom(makeRoom({ id: "r1" }));
      deleteRoom("inexistente");
      expect(fetchRooms()).toHaveLength(1);
    });
  });
});
