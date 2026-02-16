Vou implementar os tipos e o módulo de Gestão de Quartos completo. Primeiro, preciso verificar o design system atual.

# Implement room management module

---
|View implementation details|
|------|
|- ✅ Define hotel theme and types|
|- ✅ Build Room management module|
|- ✅ Setup routing and layout|
|Hide details -- Preview|

---


Módulo de Gestão de Quartos implementado com arquitetura SOLID e clean code. Aqui está o resumo das decisões:

| Arquivo | Padrão/Princípio | Decisão |
|---|---|---|
| `src/types/entities.ts` | **SRP + OCP** | Entidades (`Room`, `Guest`, `Reservation`) separadas com enums extensíveis e máquina de estados declarativa para `Availability` |
| `src/hooks/useRooms.ts` | **Repository + Facade** | Hook abstrai localStorage (migrável para API); interface pública simples (`rooms`, `createRoom`, `updateRoom`) |
| `src/components/rooms/RoomForm.tsx` | **OCP + DRY** | Formulário reutilizável para criação e edição via `defaultValues`; validação Zod; checkboxes via componente auxiliar `AmenityCheckbox` |
| `src/components/rooms/BedSection.tsx` | **Composite** | Lista dinâmica de camas manipulada como subcoleção independente |
| `src/components/rooms/RoomStatusBadge.tsx` | **SRP** | Badge puro de apresentação usando tokens semânticos `--status-*` |
| `src/components/rooms/RoomList.tsx` | **SRP + ISP** | Tabela com callbacks mínimas; formatação de camas encapsulada |
| `src/pages/RoomsPage.tsx` | **SRP** | Orquestrador: alterna entre lista e formulário; delega dados ao hook |

A paleta verde/azul foi aplicada via design tokens HSL no `index.css` e `tailwind.config.ts`.

Verificar funcionamento end-to-end
Implementar módulo de Hóspedes
Implementar módulo de Reservas
Migrar para banco de dados com Cloud
