/**
 * RoomForm — Formulário de cadastro e edição de quartos.
 *
 * Decisões:
 * - Usa react-hook-form + Zod para validação (validação em duas camadas: frontend + futuro DB).
 * - OCP: O formulário aceita `defaultValues` para reutilização em criação e edição.
 * - ISP: Props mínimas — apenas onSubmit, onCancel e valores iniciais opcionais.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BedSection } from "./BedSection";

import type { Room, RoomType, Bed, Availability } from "@/types/entities";
import { ROOM_TYPE_LABELS, AVAILABILITY_LABELS } from "@/types/entities";

// ─── Schema de Validação (Zod) ─────────────────────────────────────

const roomSchema = z.object({
  number: z.coerce.number().int().positive("Número deve ser positivo"),
  capacity: z.coerce.number().int().min(1, "Capacidade mínima: 1"),
  type: z.enum(["BASICO", "MODERNO", "LUXO"] as const),
  pricePerNight: z.coerce.number().positive("Preço deve ser positivo"),
  availability: z.enum(["LIVRE", "OCUPADO", "MANUTENCAO", "LIMPEZA"] as const),
  hasMinibar: z.boolean(),
  hasBreakfast: z.boolean(),
  hasAirConditioning: z.boolean(),
  hasTV: z.boolean(),
});

type RoomFormData = z.infer<typeof roomSchema>;

// ─── Props ─────────────────────────────────────────────────────────

interface RoomFormProps {
  defaultValues?: Room;
  onSubmit: (room: Room) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function RoomForm({ defaultValues, onSubmit, onCancel, isSubmitting }: RoomFormProps) {
  const isEditing = !!defaultValues;

  const [beds, setBeds] = useState<Bed[]>(defaultValues?.beds ?? []);

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      number: defaultValues?.number ?? 0,
      capacity: defaultValues?.capacity ?? 1,
      type: defaultValues?.type ?? "BASICO",
      pricePerNight: defaultValues?.pricePerNight ?? 0,
      availability: defaultValues?.availability ?? "LIVRE",
      hasMinibar: defaultValues?.hasMinibar ?? false,
      hasBreakfast: defaultValues?.hasBreakfast ?? false,
      hasAirConditioning: defaultValues?.hasAirConditioning ?? false,
      hasTV: defaultValues?.hasTV ?? false,
    },
  });

  const handleSubmit = async (data: RoomFormData) => {
    const room: Room = {
      id: defaultValues?.id ?? crypto.randomUUID(),
      number: data.number,
      capacity: data.capacity,
      type: data.type,
      pricePerNight: data.pricePerNight,
      availability: data.availability,
      hasMinibar: data.hasMinibar,
      hasBreakfast: data.hasBreakfast,
      hasAirConditioning: data.hasAirConditioning,
      hasTV: data.hasTV,
      beds,
    };
    await onSubmit(room);
  };

  // ─── Componente auxiliar para checkboxes de amenidades ────────────
  const AmenityCheckbox = ({ name, label }: { name: keyof RoomFormData; label: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center gap-2 space-y-0">
          <FormControl>
            <Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} />
          </FormControl>
          <FormLabel className="font-normal">{label}</FormLabel>
        </FormItem>
      )}
    />
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Quarto" : "Cadastrar Quarto"}</CardTitle>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            {/* Dados principais */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Quarto</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((t) => (
                          <SelectItem key={t} value={t}>
                            {ROOM_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerNight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço por Diária (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="250.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disponibilidade</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(AVAILABILITY_LABELS) as Availability[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          {AVAILABILITY_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amenidades — checkboxes usando componente auxiliar (DRY) */}
            <div>
              <Label className="mb-3 block">Amenidades</Label>
              <div className="grid grid-cols-2 gap-3">
                <AmenityCheckbox name="hasMinibar" label="Frigobar" />
                <AmenityCheckbox name="hasBreakfast" label="Café da Manhã" />
                <AmenityCheckbox name="hasAirConditioning" label="Ar-Condicionado" />
                <AmenityCheckbox name="hasTV" label="TV" />
              </div>
            </div>

            {/* Camas — seção dinâmica (Composite Pattern) */}
            <BedSection beds={beds} onChange={setBeds} />
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
