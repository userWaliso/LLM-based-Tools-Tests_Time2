/**
 * RoomStatusBadge — Componente de apresentação para status de disponibilidade.
 *
 * Decisão: Usa tokens semânticos do design system (--status-*)
 * mapeados via className condicional. Evita cores hardcoded.
 *
 * SRP: Apenas renderiza o badge, sem lógica de negócio.
 */

import { Badge } from "@/components/ui/badge";
import type { Availability } from "@/types/entities";
import { AVAILABILITY_LABELS } from "@/types/entities";

const statusStyles: Record<Availability, string> = {
  LIVRE: "bg-status-available text-white border-transparent",
  OCUPADO: "bg-status-occupied text-white border-transparent",
  MANUTENCAO: "bg-status-maintenance text-white border-transparent",
  LIMPEZA: "bg-status-cleaning text-white border-transparent",
};

interface RoomStatusBadgeProps {
  status: Availability;
}

export function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {AVAILABILITY_LABELS[status]}
    </Badge>
  );
}
