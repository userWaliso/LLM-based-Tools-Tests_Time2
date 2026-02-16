/**
 * RoomsPage — Página de Gestão de Quartos.
 *
 * Orquestra os componentes RoomList e RoomForm.
 * Usa estado local para controlar o modo (lista vs. formulário).
 * 
 * SRP: Apenas coordena navegação entre lista e formulário;
 * lógica de dados delegada ao hook useRooms.
 */

import { useState } from "react";
import { useRooms } from "@/hooks/useRooms";
import { RoomList } from "@/components/rooms/RoomList";
import { RoomForm } from "@/components/rooms/RoomForm";
import type { Room } from "@/types/entities";
import { useToast } from "@/hooks/use-toast";

type PageMode = { view: "list" } | { view: "form"; room?: Room };

export default function RoomsPage() {
  const [mode, setMode] = useState<PageMode>({ view: "list" });
  const { rooms, isLoading, createRoom, updateRoom, deleteRoom, isCreating, isUpdating } = useRooms();
  const { toast } = useToast();

  const handleSubmit = async (room: Room) => {
    try {
      if (mode.view === "form" && mode.room) {
        await updateRoom(room);
        toast({ title: "Quarto atualizado com sucesso!" });
      } else {
        await createRoom(room);
        toast({ title: "Quarto cadastrado com sucesso!" });
      }
      setMode({ view: "list" });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRoom(id);
      toast({ title: "Quarto removido." });
    } catch {
      toast({ title: "Erro ao remover quarto.", variant: "destructive" });
    }
  };

  if (mode.view === "form") {
    return (
      <div className="p-6">
        <RoomForm
          defaultValues={mode.room}
          onSubmit={handleSubmit}
          onCancel={() => setMode({ view: "list" })}
          isSubmitting={isCreating || isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <RoomList
        rooms={rooms}
        isLoading={isLoading}
        onEdit={(room) => setMode({ view: "form", room })}
        onDelete={handleDelete}
        onCreate={() => setMode({ view: "form" })}
      />
    </div>
  );
}
