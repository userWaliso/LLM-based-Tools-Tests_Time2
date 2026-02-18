### Código enviado para a ferramenta:
```
const createRoom = useMutation({

  mutationFn: (room: Room) => {

    const rooms = fetchRooms();

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

    if (rooms.some((r) => r.number === room.number && r.id !== room.id)) {

      throw new Error(`Quarto nº ${room.number} já existe.`);

    }

    const updated = rooms.map((r) => (r.id === room.id ? room : r));

    persistRooms(updated);

    return Promise.resolve(room);

  },

  onSuccess: invalidate,

});

``` 


**Output para o prompt 1:**

## Code Review — `createRoom` & `updateRoom`

### Problemas identificados

**1. Duplicação de lógica (DRY violation)**
A validação de número único está copiada em dois lugares. Se a regra mudar, dois pontos precisam ser atualizados.

```ts
// Repetido em createRoom e updateRoom — pede extração
rooms.some((r) => r.number === room.number)
```

**2. Responsabilidade única violada (SRP)**
`mutationFn` faz três coisas ao mesmo tempo: lê dados, valida regra de negócio e persiste. Cada responsabilidade deveria estar isolada.

**3. `fetchRooms()` chamado duas vezes por operação**
Em `updateRoom`, `fetchRooms()` é chamado dentro do `mutationFn`, enquanto o hook já gerencia o cache via React Query — inconsistência arquitetural.

**4. `Promise.resolve()` desnecessário**
`mutationFn` pode ser `async` ou retornar valor direto; o wrapper `Promise.resolve()` é ruído visual sem ganho real.

---

### Versão refatorada

```ts
// ─── Validadores de domínio (SRP + DRY) ───────────────────────────

function assertUniqueNumber(rooms: Room[], number: number, excludeId?: string): void {
  const conflict = rooms.some(
    (r) => r.number === number && r.id !== excludeId
  );
  if (conflict) throw new Error(`Quarto nº ${number} já existe.`);
}

// ─── Repository (operações atômicas) ──────────────────────────────

function insertRoom(room: Room): Room {
  const rooms = fetchRooms();
  assertUniqueNumber(rooms, room.number);          // valida
  persistRooms([...rooms, room]);                  // persiste
  return room;
}

function replaceRoom(room: Room): Room {
  const rooms = fetchRooms();
  assertUniqueNumber(rooms, room.number, room.id); // valida (exclui próprio)
  persistRooms(rooms.map((r) => (r.id === room.id ? room : r)));
  return room;
}

// ─── Mutations (thin — só orquestram) ─────────────────────────────

const createRoom = useMutation({ mutationFn: insertRoom, onSuccess: invalidate });
const updateRoom = useMutation({ mutationFn: replaceRoom, onSuccess: invalidate });
```

---

### Como isso reduz dívida técnica

| Problema | Antes | Depois |
|---|---|---|
| **DRY** | Validação duplicada em 2 funções | `assertUniqueNumber` centralizada |
| **SRP** | `mutationFn` com 3 responsabilidades | Cada função faz exatamente 1 coisa |
| **Testabilidade** | Lógica presa dentro do hook | `insertRoom`/`replaceRoom` são funções puras testáveis |
| **Ruído** | `Promise.resolve(room)` desnecessário | Retorno direto |
| **Legibilidade** | Mutations com 10+ linhas cada | Mutations com 1 linha cada |

Deseja que eu aplique essa refatoração no `useRooms.ts`?

Aplicar refatoração
Validar transições no formulário
Módulo de Hóspedes

**Ouput para os promtps 2 e 3:**

Aplicando a refatoração no `useRooms.ts` agora.

|**Refactor useRooms.ts**|
|----|
|✅ Refatorar useRooms.ts|
| ```Details``` ```Preview```|


**35 testes passaando. ✅**

---

### O que mudou e por que reduz dívida técnica

| Dimensão | Antes | Depois |
|---|---|---|
| **DRY** | Validação de número único copiada em `createRoom` e `updateRoom` | `assertUniqueNumber(rooms, number, excludeId?)` — 1 único ponto |
| **SRP** | `mutationFn` lia dados, validava e persistia | `insertRoom`/`replaceRoom` fazem só isso; mutations só orquestram |
| **Testabilidade** | Lógica presa dentro do closure do hook | Funções exportáveis e testáveis isoladamente |
| **Legibilidade** | Cada mutation tinha ~10 linhas de lógica inline | Cada mutation cabe em 1 linha: `{ mutationFn: insertRoom, onSuccess: invalidate }` |
| **Manutenção futura** | Trocar localStorage por API exige reescrever mutations | Basta substituir `insertRoom`/`replaceRoom` — interface pública do hook não muda |

Refatoração aplicada: `assertUniqueNumber` centraliza a validação, `insertRoom`/`replaceRoom`/`removeRoom` isolam a lógica do Repository, e as mutations ficaram com 1 linha cada — todos os 35 testes continuam passando.

Verificar funcionamento
Validar transições no formulário
Módulo de Hóspedes
Migrar para banco de dados