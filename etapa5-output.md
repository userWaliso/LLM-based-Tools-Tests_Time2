**Output para Plano de implantação:**

## Pipeline de Deploy Proposto

graph LR
    DEV["👨‍💻 DeveloperPush to main"] --> GH["GitHubTrigger CI"]

    subgraph "CI/CD — GitHub Actions"
        GH --> LINT["🔍 LintESLint + TypeScript"]
        LINT --> TEST["🧪 TestVitest (unit + integration)"]
        TEST --> BUILD["📦 Buildvite build"]
        BUILD --> DOCKER["🐳 DockerBuild image"]
        DOCKER --> PUSH["☁️ PushContainer Registry"]
    end

    PUSH --> STAGING["🟡 StagingDeploy automático"]
    STAGING -->|"Aprovação manual"| PROD["🟢 ProductionDeploy"]

### Estrutura do Pipeline

**1. Dockerfile (multi-stage)**

```dockerfile
# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Produção — Nginx serve o SPA
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**2. GitHub Actions (`.github/workflows/deploy.yml`)**

```yaml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx tsc --noEmit          # Type check
      - run: npx eslint src/           # Lint
      - run: npx vitest run            # Testes
      - run: npm run build             # Build

  docker:
    needs: ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
```

**3. Estratégia de ambientes**

| Ambiente | Trigger | Aprovação |
|---|---|---|
| **Staging** | Push em `main` | Automático |
| **Production** | Release tag `v*` | Manual (GitHub Environment Protection) |

**4. Alternativa com Lovable Cloud**

Se preferir evitar infra própria, o Lovable já oferece deploy integrado — basta clicar **Publish**. O pipeline CI (lint + test) ainda é recomendado via GitHub Actions para garantir qualidade antes do merge.

### Decisões Justificadas

- **Multi-stage Docker**: imagem final ~25MB (nginx:alpine), sem node_modules em produção
- **CI antes do Docker**: falha rápido em erros de tipo/teste sem gastar tempo com build de imagem
- **Staging com aprovação para prod**: segurança contra deploys acidentais

Criar Dockerfile + nginx.conf
Criar workflow GitHub Actions
Implementar módulo de Hóspedes

**Output para Monitoramento e Gestão de incidentes:**

## 📊 Métricas, Logs e Runbook de Resposta a Falhas

### 1. Métricas a Monitorar

| Categoria | Métrica | Ferramenta | Alerta |
|---|---|---|---|
| **Disponibilidade** | Uptime (%) — Health check HTTP 200 | UptimeRobot / Prometheus `probe_success` | < 99.5% → P1 |
| **Latência** | p50, p95, p99 de resposta | Nginx `request_time` + Prometheus histogram | p95 > 500ms → P2 |
| **Erros** | Taxa de 5xx / 4xx | Nginx logs + Grafana | 5xx > 1% do tráfego → P1 |
| **Saturação** | CPU, memória do container | cAdvisor / Docker stats | CPU > 80% por 5min → P2 |
| **Frontend** | Core Web Vitals (LCP, FID, CLS) | `web-vitals` lib → analytics | LCP > 2.5s → P3 |
| **Negócio** | Quartos cadastrados/dia, reservas/hora | Custom events no app | Queda > 50% vs média → P3 |

---

### 2. Estratégia de Logs

```
┌─────────────┐    ┌──────────────┐    ┌───────────┐
│  App (React) │───▶│  Nginx JSON  │───▶│  Loki /   │
│  console.log │    │  access_log  │    │  ELK Stack│
└─────────────┘    └──────────────┘    └─────┬─────┘
                                             │
                                       ┌─────▼─────┐
                                       │  Grafana   │
                                       │ Dashboards │
                                       └───────────┘
```

**Formato estruturado (JSON):**
```json
{
  "timestamp": "ISO8601",
  "level": "error|warn|info",
  "service": "hotel-frontend",
  "message": "Falha ao criar quarto",
  "context": { "roomNumber": "101", "userId": "abc" },
  "traceId": "uuid"
}
```

**Níveis de log:**
- `error` → Falhas que impedem operação (salvar quarto, carregar lista)
- `warn` → Degradação (localStorage cheio, retry de query)
- `info` → Ações de negócio (quarto criado, reserva confirmada)

---

### 3. Runbook de Resposta a Falhas

#### 🔴 P1 — Aplicação Indisponível (downtime)

| Passo | Ação | Responsável | SLA |
|---|---|---|---|
| 1 | Verificar status do container: `docker ps` e `docker logs` | Engenheiro de plantão | 5 min |
| 2 | Verificar Nginx: `curl -I https://app/health` | Engenheiro de plantão | 5 min |
| 3 | Se container parado → `docker compose up -d` | Engenheiro de plantão | 10 min |
| 4 | Se erro persistir → rollback para última imagem estável: `docker pull app:last-stable && docker compose up -d` | Tech Lead | 15 min |
| 5 | Comunicar stakeholders via canal #incidentes | Engenheiro de plantão | 20 min |
| 6 | Post-mortem em até 48h | Time completo | 48h |

#### 🟡 P2 — Latência Alta / Saturação

| Passo | Ação |
|---|---|
| 1 | Verificar `docker stats` para CPU/memória |
| 2 | Analisar logs Nginx por endpoints lentos |
| 3 | Se CPU alta → escalar réplicas ou aumentar limites |
| 4 | Se memória → investigar memory leaks no app (React Query cache) |

#### 🟠 P3 — Erros de Negócio / Frontend

| Passo | Ação |
|---|---|
| 1 | Consultar logs filtrados por `level=error` no Grafana/Loki |
| 2 | Reproduzir cenário localmente |
| 3 | Corrigir → PR → CI verde → deploy automático em staging |
| 4 | Validar em staging → promover para produção |

---

### 4. Escalação

graph TD
    A[Alerta Disparado] --> B{Severidade?}
    B -->|P1 - Downtime| C[Engenheiro de Plantão]
    C -->|Não resolvido em 15min| D[Tech Lead]
    D -->|Não resolvido em 30min| E[CTO + Fornecedor Infra]
    B -->|P2 - Degradação| F[Engenheiro do Time]
    F -->|Não resolvido em 1h| D
    B -->|P3 - Negócio| G[Backlog Sprint Atual]

---

### 5. Checklist de Implementação

| Item | Status |
|---|---|
| Health check endpoint (`/health`) no Nginx | 📋 A fazer |
| Logs JSON no Nginx (`access_log`) | 📋 A fazer |
| Dashboard Grafana com métricas base | 📋 A fazer |
| Alertas configurados (Alertmanager/PagerDuty) | 📋 A fazer |
| `web-vitals` integrado no React | 📋 A fazer |
| Canal de incidentes (#incidentes) criado | 📋 A fazer |
| Rodízio de plantão definido | 📋 A fazer |

Essa estratégia segue o modelo **RED** (Rate, Errors, Duration) para serviços e **USE** (Utilization, Saturation, Errors) para infraestrutura.

Criar nginx.conf com health check
Adicionar web-vitals ao frontend
Implementar módulo de Hóspedes