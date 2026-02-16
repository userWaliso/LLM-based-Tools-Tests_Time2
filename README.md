# Avaliação Experimental: Amazon Q (Engenharia de Software)

Este repositório contém os resultados da avaliação da ferramenta Amazon Q, estruturados conforme o Protocolo para Avaliação Experimental (Engenharia de Software). O foco é documentar como a IA auxilia no ciclo de vida de desenvolvimento (SDLC) de um sistema de reserva hoteleira.

## 📋 Estrutura de Documentação e Rastreabilidade

A organização deste repositório segue uma lógica rigorosa de rastreabilidade entre o documento de diretrizes (protocolo) e o que foi produzido pela ferramenta.

### 1. Commits e Subtópicos

A rastreabilidade no histórico do Git é feita através do nome dos subtópicos definidos no documento de diretrizes.

* Padrão: [Nome do Subtópico]: prompt [y]
* Exemplo: Elicitação e estruturação de requisitos: prompt 1

### 2. Respostas do Chat (Outputs)

As respostas textuais, explicações e diálogos gerados no chat da ferramenta foram extraídos para arquivos específicos. A numeração aqui é sequencial e global por etapa.

* Nomenclatura: etapa[x]-output[y]
* Lógica: Se a Etapa 1 possui 6 prompts no total, os arquivos serão de etapa1-output1 a etapa1-output6, independentemente de qual subtópico pertençam dentro daquela etapa.

### 3. Artefatos Gerados

Os Artefatos (arquivos de código, diagramas, arquivos de configuração, etc.) são os produtos técnicos finais gerados pela ferramenta.

* Diferenciação: Ao contrário dos outputs de texto, os artefatos não são renomeados como "output".
* Nomenclatura: Eles mantêm o nome original gerado pela ferramenta (ex: QuartoService.ts, pom.xml, Hospede.java).
