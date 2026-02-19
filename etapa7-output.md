**Ouput para Plano de projeto:**

## Cronograma de Sprints — Hotel Manager

Baseado no escopo definido (Quartos ✅, Hóspedes 🔲, Reservas 🔲) e nos padrões já estabelecidos no código.

---

### 🏃 Sprint 1 — Módulo de Hóspedes `(concluído parcialmente)`
**Duração:** 1 semana | **Capacidade:** 21 pts

| # | Tarefa | Tipo | Pts |
|---|--------|------|-----|
| 1.1 | Tipos `Guest` + `useGuests` hook (Repository pattern) | Backend | 3 |
| 1.2 | `GuestForm` com máscara de CPF + validação Zod | Frontend | 5 |
| 1.3 | `GuestList` com busca por nome/CPF | Frontend | 5 |
| 1.4 | `GuestsPage` orquestrando lista ↔ formulário | Frontend | 2 |
| 1.5 | Testes unitários: hook + validação de CPF duplicado | Teste | 3 |
| 1.6 | Testes de integração: CRUD completo | Teste | 3 |

**Total: 21 pts** — risco baixo, padrão idêntico ao módulo de Quartos.

---

### 🏃 Sprint 2 — Módulo de Reservas (core)
**Duração:** 1 semana | **Capacidade:** 26 pts

| # | Tarefa | Tipo | Pts |
|---|--------|------|-----|
| 2.1 | Tipos `Reservation` + `useReservations` hook | Backend | 3 |
| 2.2 | Integração com máquina de estados (`canTransition`) | Backend | 5 |
| 2.3 | `ReservationForm`: select de quarto livre + hóspede | Frontend | 8 |
| 2.4 | `ReservationList` com status colorido | Frontend | 5 |
| 2.5 | Atualização automática de `availability` do quarto | Backend | 5 |

**Total: 26 pts** — risco médio (coordenação entre 3 entidades).

---

### 🏃 Sprint 3 — Dashboard + Qualidade
**Duração:** 1 semana | **Capacidade:** 21 pts

| # | Tarefa | Tipo | Pts |
|---|--------|------|-----|
| 3.1 | Dashboard com KPIs (quartos livres, ocupação %) | Frontend | 8 |
| 3.2 | Validação máquina de estados no `RoomForm` (`canTransition`) | Frontend | 3 |
| 3.3 | Filtros e busca em todas as listagens | Frontend | 5 |
| 3.4 | Testes E2E com Playwright (fluxos críticos) | Teste | 5 |

**Total: 21 pts**

---

### 🏃 Sprint 4 — Persistência Real (opcional)
**Duração:** 1 semana | **Capacidade:** 26 pts

| # | Tarefa | Tipo | Pts |
|---|--------|------|-----|
| 4.1 | Habilitar Lovable Cloud (PostgreSQL + Auth) | Infra | 3 |
| 4.2 | Migrar hooks: `localStorage` → tabelas reais | Backend | 8 |
| 4.3 | RLS policies por usuário autenticado | Segurança | 8 |
| 4.4 | Autenticação (login/logout) | Auth | 7 |

**Total: 26 pts** — risco baixo graças ao Repository pattern já isolado.

---

### 📊 Resumo Executivo

```
Sprint 1 │████████████████████░│ 21 pts │ Hóspedes
Sprint 2 │█████████████████████████░│ 26 pts │ Reservas
Sprint 3 │████████████████████░│ 21 pts │ Dashboard
Sprint 4 │█████████████████████████░│ 26 pts │ Cloud (opt.)
─────────────────────────────────────────────────
Total    │ ~94 pts │ 4 semanas │ 1 dev
```

> **Referência de escala:** 1 pt ≈ 1h de desenvolvimento focado.
> O Repository pattern já implementado reduz o esforço do Sprint 4 em ~40% — a troca `localStorage → DB` afeta apenas as funções `fetchRooms/persistRooms`, não os hooks nem a UI.

**Recomendação:** iniciar pelo Sprint 1 agora, já que o padrão está consolidado e o risco é mínimo.

Iniciar Sprint 1 — Hóspedes
Validar estados no RoomForm
Iniciar Sprint 2 — Reservas
Migrar para Lovable Cloud

**Output para Gestão de riscos e Governança e qualidade:**

## Matriz de Riscos & KPIs — Hotel Manager

---

## 🔴 Riscos Técnicos

| ID | Risco | Prob. | Impacto | Nível |
|----|-------|-------|---------|-------|
| RT-01 | Perda de dados com `localStorage` (limpeza do browser) | Alta | Alto | 🔴 Crítico |
| RT-02 | Inconsistência entre entidades (reserva com quarto/hóspede deletado) | Média | Alto | 🔴 Crítico |
| RT-03 | Máquina de estados violada via edição direta no `localStorage` | Média | Médio | 🟡 Moderado |
| RT-04 | Bundle size crescendo sem code splitting por módulo | Baixa | Médio | 🟡 Moderado |
| RT-05 | Race condition no React Query ao invalidar múltiplas queries | Baixa | Baixo | 🟢 Baixo |

### Planos de Mitigação Técnica

**RT-01 — Perda de dados**
```
Curto prazo:  Export/Import JSON na UI (botão "Backup")
Médio prazo:  Migrar para Lovable Cloud (PostgreSQL persistente)
Trigger:      Sprint 4 ou primeiro relato de perda de dados
```

**RT-02 — Integridade referencial**
```typescript
// Implementar guard no useReservations antes de deletar Guest/Room:
function assertNoActiveReservations(entityId: string, field: "roomId" | "guestId") {
  const reservations = fetchReservations();
  const blocked = reservations.some((r) => r[field] === entityId && r.status === "OCUPADO");
  if (blocked) throw new Error("Entidade possui reservas ativas.");
}
```

**RT-03 — Estado corrompido**
```typescript
// Adicionar schema de validação na leitura do localStorage:
function fetchRooms(): Room[] {
  const data = localStorage.getItem(STORAGE_KEY);
  const parsed = data ? JSON.parse(data) : [];
  return parsed.filter(isValidRoom); // Zod.safeParse por item
}
```

**RT-04 — Bundle size**
```tsx
// Lazy loading por rota (já preparado no App.tsx):
const GuestsPage  = lazy(() => import("@/pages/GuestsPage"));
const ReservationsPage = lazy(() => import("@/pages/ReservationsPage"));
```

---

## 🟠 Riscos Gerenciais

| ID | Risco | Prob. | Impacto | Nível |
|----|-------|-------|---------|-------|
| RG-01 | Scope creep: multi-hotel, multi-usuário antes da v1 | Alta | Alto | 🔴 Crítico |
| RG-02 | Sprint 2 (Reservas) subestimado pela complexidade cross-module | Média | Médio | 🟡 Moderado |
| RG-03 | Dívida técnica acumulada sem revisão entre sprints | Média | Médio | 🟡 Moderado |
| RG-04 | Ausência de ambiente de staging antes do deploy | Baixa | Alto | 🟡 Moderado |

### Planos de Mitigação Gerencial

**RG-01 — Scope creep**
```
Política: Definition of Done inclui critério "single-hotel scope"
Processo: Toda nova feature passa por filtro: "resolve dor do hotel único?"
Backlog:  Features multi-tenant vão para roadmap v2, nunca para sprint atual
```

**RG-02 — Sprint 2 subestimado**
```
Buffer:   +3 pts de reserva no Sprint 2 (já considerado: 26 pts)
Fallback: Se atrasar, entregar ReservationForm sem atualização automática
          de availability (desacoplar os 5 pts do item 2.5)
```

**RG-03 — Dívida técnica**
```
Ritual:   20% da capacidade de cada sprint reservado para refactor
Gatilho:  Qualquer arquivo > 200 linhas entra na fila de refatoração
Métrica:  Nenhum TODO/FIXME acumula por mais de 1 sprint
```

---

## 📊 KPIs de Qualidade

### Código
| KPI | Meta | Ferramenta |
|-----|------|-----------|
| Cobertura de testes unitários | ≥ 90% nas regras de negócio | Vitest + coverage |
| Cobertura de integração | 100% nos fluxos críticos | Vitest |
| Zero erros de TypeScript | `strict: true` sempre verde | `tsc --noEmit` |
| Complexidade ciclomática | ≤ 10 por função | ESLint complexity rule |
| Tamanho de arquivo | ≤ 200 linhas | ESLint max-lines |

### Performance (Core Web Vitals)
| KPI | Meta | Ferramenta |
|-----|------|-----------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID / INP | < 100ms | Web Vitals |
| CLS | < 0.1 | Lighthouse |
| Bundle inicial | < 200kb gzip | Vite build --report |

### Produto
| KPI | Meta | Como medir |
|-----|------|-----------|
| Fluxo de check-in completo | ≤ 5 cliques | Teste de usabilidade |
| Tempo para cadastrar quarto | ≤ 60 segundos | Observação direta |
| Taxa de erros de formulário | < 5% dos submits | Toast de erro / sucesso |
| Zero perda de dados em 30 dias | 100% integridade | Log de operações |

### Observabilidade (alinhado à estratégia RED/USE)
```json
// Estrutura de log estruturado para cada operação:
{
  "timestamp": "ISO-8601",
  "module": "rooms | guests | reservations",
  "operation": "create | update | delete",
  "durationMs": 42,
  "status": "success | error",
  "errorCode": "DUPLICATE_NUMBER | INVALID_TRANSITION | null"
}
```

---

## ✅ Definition of Done (por feature)

```
□ Tipos TypeScript definidos em entities.ts
□ Hook Repository com assertUniqueXxx centralizado
□ Componentes com < 150 linhas cada
□ Testes unitários cobrindo casos feliz + erro
□ Teste de integração para o fluxo crítico
□ Zero warnings no console em produção
□ Responsivo em 375px (mobile) e 1280px (desktop)
□ Acessível: labels em inputs, aria quando necessário
```

Iniciar Sprint 1 — Hóspedes
Implementar guards de integridade
Configurar métricas de qualidade
Eliminar risco RT-01 com Cloud