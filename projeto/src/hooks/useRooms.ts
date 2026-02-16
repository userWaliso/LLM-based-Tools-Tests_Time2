/**
 * useRooms — Hook Repository/Facade para gerenciamento de quartos.
 *
 * Padrões aplicados:
 * - Repository: Abstrai a fonte de dados (localStorage por ora, migrável para API).
 * - Facade: Expõe interface simples para componentes consumidores.
 * - SRP: Separação clara entre acesso a dados e lógica de UI.
 *
 * Decisão: Usamos localStorage + React Query como cache layer.
 * Quando o Lovable Cloud for habilitado, basta trocar as funções
 * fetch/persist sem alterar a interface pública do hook.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Room } from "@/types/entities";

const STORAGE_KEY = "hotel_rooms";

// ─── Funções de acesso a dados (Repository) ────────────────────────

function fetchRooms(): Room[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function persistRooms(rooms: Room[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

// ─── Hook Público (Facade) ─────────────────────────────────────────

export function useRooms() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["rooms"] });

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

  const createRoom = useMutation({
    mutationFn: (room: Room) => {
      const rooms = fetchRooms();
      // Validação: número de quarto deve ser único
      if (rooms.some((r) => r.number === room.number)) {
        throw new Error(`Quarto nº ${room.number} já existe.`);
      }
      persistRooms([...rooms, room]);
      return Promise.resolve(room);
    },
    onSuccess: invalidate,
  });

  const updateRoom = useMutation({
    mutationFn: (room: Room) => {
      const rooms = fetchRooms();
      // Validação: número único (exceto o próprio quarto)
      if (rooms.some((r) => r.number === room.number && r.id !== room.id)) {
        throw new Error(`Quarto nº ${room.number} já existe.`);
      }
      const updated = rooms.map((r) => (r.id === room.id ? room : r));
      persistRooms(updated);
      return Promise.resolve(room);
    },
    onSuccess: invalidate,
  });

  const deleteRoom = useMutation({
    mutationFn: (id: string) => {
      const rooms = fetchRooms().filter((r) => r.id !== id);
      persistRooms(rooms);
      return Promise.resolve(id);
    },
    onSuccess: invalidate,
  });

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
