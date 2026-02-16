/**
 * RoomList — Tabela de listagem de quartos.
 *
 * Decisões:
 * - SRP: Apenas exibe dados; ações delegadas via callbacks.
 * - Exibe: Número, Tipo, Preço, Disponibilidade (conforme requisito).
 * - E-mail de hóspede oculto na listagem (requisito de UI).
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomStatusBadge } from "./RoomStatusBadge";
import type { Room } from "@/types/entities";
import { ROOM_TYPE_LABELS, BED_TYPE_LABELS } from "@/types/entities";
import { Pencil, Trash2, Plus } from "lucide-react";

interface RoomListProps {
  rooms: Room[];
  isLoading: boolean;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function RoomList({ rooms, isLoading, onEdit, onDelete, onCreate }: RoomListProps) {
  /** Formata a lista de camas para exibição concisa */
  const formatBeds = (beds: Room["beds"]) => {
    if (beds.length === 0) return "—";
    const counts: Record<string, number> = {};
    beds.forEach((b) => {
      counts[b.type] = (counts[b.type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, count]) => `${count}× ${BED_TYPE_LABELS[type as keyof typeof BED_TYPE_LABELS]}`)
      .join(", ");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quartos</CardTitle>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Quarto
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Carregando...</p>
        ) : rooms.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum quarto cadastrado. Clique em "Novo Quarto" para começar.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Camas</TableHead>
                <TableHead>Preço/Diária</TableHead>
                <TableHead>Disponibilidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.number}</TableCell>
                  <TableCell>{ROOM_TYPE_LABELS[room.type]}</TableCell>
                  <TableCell className="text-sm">{formatBeds(room.beds)}</TableCell>
                  <TableCell>
                    {room.pricePerNight.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell>
                    <RoomStatusBadge status={room.availability} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(room)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(room.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
