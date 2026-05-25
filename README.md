# EVNTUM — Gerador de Contrato por Franqueado

Ferramenta interna para preencher dinamicamente o contrato de licença do software **EVNTUM** com os dados de cada franqueado e gerar o **PDF** pronto para assinatura.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind v4 + shadcn/ui
- Validação: react-hook-form + zod
- PDF: markdown-it (md → HTML) + Puppeteer (HTML → PDF, A4)

## Como funciona

```
templates/contrato.source.md    contrato-fonte (cópia do contrato oficial)
        │  scripts/build-template.mjs  (tokeniza placeholders e opções)
        ▼
templates/contrato.template.md  template com {{tokens}}
        │  lib/fill.ts           (preenche tokens + checkboxes derivados)
        ▼
markdown preenchido → lib/render.ts (HTML + CSS impressão → Puppeteer) → PDF
```

A API `POST /api/generate` recebe o JSON do formulário, valida (zod), preenche e devolve o PDF.
Use `?format=md` para inspecionar o markdown preenchido (preview/debug).

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
```

## Atualizar o contrato

Se o contrato oficial mudar:

```bash
cp ../contrato-evntum-arquitetos-pizza.md templates/contrato.source.md
node scripts/build-template.mjs   # regenera o template e valida placeholders
```

O script avisa se sobrar algum placeholder `[..]` não mapeado.

## Campos derivados (automáticos)

- **Taxa de Setup**: isenta se a assinatura for até 30/06/2026, senão R$ 589,90 (Cláusula 6.10).
- **Checkboxes** de categoria, suporte e API oficial: marcados conforme o formulário.
- **Primeira mensalidade**: fixa em 08/06/2026 (Cláusula 6.4.1).
- **Datas**: a data de assinatura vira extenso ("25 de maio de 2026") e numérica.
