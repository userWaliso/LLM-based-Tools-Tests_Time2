/**
 * BedSection — Gerenciamento dinâmico de camas (Composite Pattern).
 *
 * Permite adicionar/remover camas de diferentes tipos.
 * Usa o padrão Composite: a lista de camas é manipulada como coleção
 * dentro do formulário pai, sem acoplamento direto.
 *
 * SRP: Apenas lida com a sub-coleção de camas.
 */

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Bed, BedType } from "@/types/entities";
import { BED_TYPE_LABELS } from "@/types/entities";
import { Plus, Trash2 } from "lucide-react";

interface BedSectionProps {
  beds: Bed[];
  onChange: (beds: Bed[]) => void;
}

export function BedSection({ beds, onChange }: BedSectionProps) {
  const addBed = () => {
    onChange([...beds, { id: crypto.randomUUID(), type: "SOLTEIRO" }]);
  };

  const removeBed = (id: string) => {
    onChange(beds.filter((b) => b.id !== id));
  };

  const updateBedType = (id: string, type: BedType) => {
    onChange(beds.map((b) => (b.id === id ? { ...b, type } : b)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Camas</label>
        <Button type="button" variant="outline" size="sm" onClick={addBed}>
          <Plus className="mr-1 h-3 w-3" />
          Adicionar
        </Button>
      </div>

      {beds.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma cama adicionada.</p>
      )}

      {beds.map((bed) => (
        <div key={bed.id} className="flex items-center gap-2">
          <Select value={bed.type} onValueChange={(v) => updateBedType(bed.id, v as BedType)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(BED_TYPE_LABELS) as BedType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {BED_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="ghost" size="icon" onClick={() => removeBed(bed.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}
