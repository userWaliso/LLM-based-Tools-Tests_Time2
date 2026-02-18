/**
 * useRooms — Hook Repository/Facade para gerenciamento de quartos.
 *
 * Padrões aplicados:
 * - Repository: Abstrai a fonte de dados (localStorage por ora, migrável para API).
 * - Facade: Expõe interface simples para componentes consumidores.
 * - SRP: Cada função tem responsabilidade única e bem definida.
 * - DRY: Validação de número único centralizada em assertUniqueNumber.
 *
 * Decisão: Usamos localStorage + React Query como cache layer.
 * Quando o Lovable Cloud for habilitado, basta trocar as funções
 * fetch/persist sem alterar a interface pública do hook.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Room } from "@/types/entities";

const STORAGE_KEY = "hotel_rooms";

// ─── Camada de Acesso a Dados (Repository) ────────────────────────

function fetchRooms(): Room[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function persistRooms(rooms: Room[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

// ─── Validação de Domínio (Domain Guard) ──────────────────────────
//
// Centraliza a regra de unicidade em um único ponto.
// excludeId: ao editar, ignora o próprio quarto na checagem.

function assertUniqueNumber(rooms: Room[], number: number, excludeId?: string): void {
  const conflict = rooms.some(
    (r) => r.number === number && r.id !== excludeId
  );
  if (conflict) {
    throw new Error(`Quarto nº ${number} já existe.`);
  }
}

// ─── Operações Atômicas do Repository ─────────────────────────────
//
// Cada função tem responsabilidade única: validar + persistir.
// São funções puras (sem efeitos além de localStorage), facilitando testes.

async function insertRoom(room: Room): Promise<Room> {
  const rooms = fetchRooms();
  assertUniqueNumber(rooms, room.number);
  persistRooms([...rooms, room]);
  return room;
}

async function replaceRoom(room: Room): Promise<Room> {
  const rooms = fetchRooms();
  assertUniqueNumber(rooms, room.number, room.id);
  persistRooms(rooms.map((r) => (r.id === room.id ? room : r)));
  return room;
}

async function removeRoom(id: string): Promise<string> {
  persistRooms(fetchRooms().filter((r) => r.id !== id));
  return id;
}

// ─── Hook Público (Facade) ─────────────────────────────────────────
//
// Mutations são thin: apenas orquestram Repository + invalidação de cache.
// Toda regra de negócio vive nas funções acima, não aqui.

export function useRooms() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["rooms"] });

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

  const createRoom = useMutation({ mutationFn: insertRoom, onSuccess: invalidate });
  const updateRoom = useMutation({ mutationFn: replaceRoom, onSuccess: invalidate });
  const deleteRoom = useMutation({ mutationFn: removeRoom, onSuccess: invalidate });

  return {
    rooms: roomsQuery.data ?? [],
    isLoading: roomsQuery.isLoading,
    createRoom: createRoom.mutateAsync,
    updateRoom: updateRoom.mutateAsync,
    deleteRoom: deleteRoom.mutateAsync,
    isCreating: createRoom.isPending,
    isUpdating: updateRoom.isPending,
  };
}
