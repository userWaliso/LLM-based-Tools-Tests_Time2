# Avaliação Experimental: Lovable (Engenharia de Software)

Este repositório documenta os resultados da avaliação da ferramenta **Lovable**, seguindo o **Protocolo para Avaliação Experimental**. Devido às características operacionais e aos limites de uso da ferramenta, a metodologia de entrada e a sistemática de documentação foram adaptadas para garantir a eficiência do experimento.

## ⚙️ Metodologia de Interação (Concatenação de Prompts)

Diferente de outras ferramentas de IA, o Lovable possui um limite diário de mensagens (prompts). Para otimizar a avaliação e manter a fluidez do desenvolvimento sem comprometer o conteúdo do protocolo, foi utilizada a técnica de **concatenação de prompts**:

* **Agrupamento:** Vários prompts de um mesmo subtópico ou etapa foram consolidados em um único envio (input).

## 📋 Estrutura de Documentação e Rastreabilidade

A organização dos arquivos e o histórico de versões seguem as definições abaixo para garantir a transparência do processo:

### 1. Respostas do Chat (Outputs)
As respostas textuais, explicações técnicas e diálogos gerados pelo chat da ferramenta estão centralizados em arquivos Markdown específicos por etapa.

* **Nomenclatura:** `etapa[x]-output.md`
* **Organização Interna:**
    * **Para prompts agrupados:** O documento é dividido por tópicos identificados como `Output para subatividade [x], subatividade [y]...`, facilitando a localização da resposta para cada instrução do protocolo.
    * **Para etapas de envio único:** Caso todos os prompts da etapa tenham sido enviados em um único bloco sem divisões lógicas, o arquivo apresenta o conteúdo de forma contínua.

### 2. Artefatos Gerados
Os artefatos técnicos (arquivos de código-fonte, componentes de interface, configurações de banco de dados, etc.) são os produtos finais da ferramenta.

* **Nomenclatura:** Os arquivos foram mantidos com os **nomes originais** gerados automaticamente pelo Lovable (ex: `App.tsx`, `index.css`, componentes do Supabase, etc.).
* **Distribuição:** Os artefatos foram integrados ao repositório conforme o fluxo de desenvolvimento da ferramenta. A separação destes arquivos por fase é feita através do **histórico de commits**, onde cada versão reflete o estado do projeto ao final de uma etapa específica.

### 3. Rastreabilidade de Commits
Dada a natureza do fluxo de trabalho (múltiplos prompts por interação), a rastreabilidade no histórico do Git foi organizada por blocos de entrega.

* **Padrão de Commit:** `etapa [x]`
* **Conteúdo do Commit:** Cada commit registra todos os artefatos produzidos ou modificados, além do respectivo arquivo de output, representando o estado final daquela etapa do protocolo.

---
