// Transforma o contrato-fonte (templates/contrato.source.md) em um template
// tokenizado (templates/contrato.template.md) com {{placeholders}}.
// Reexecutar sempre que o contrato-fonte mudar: `node scripts/build-template.mjs`
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "templates/contrato.source.md"), "utf8");

const unambiguous = [
  ["[RAZÃO SOCIAL DO FRANQUEADO]", "{{razaoSocial}}"],
  ["[CNPJ DO FRANQUEADO]", "{{cnpj}}"],
  ["[ENDEREÇO COMPLETO]", "{{endereco}}"],
  ["[NOME DO REPRESENTANTE LEGAL]", "{{representanteNome}}"],
  ["[NACIONALIDADE]", "{{representanteNacionalidade}}"],
  ["[ESTADO CIVIL]", "{{representanteEstadoCivil}}"],
  ["[PROFISSÃO]", "{{representanteProfissao}}"],
  ["[RG]", "{{representanteRG}}"],
  ["[E-MAIL OFICIAL DO FRANQUEADO]", "{{emailOficial}}"],
  ["[E-MAIL JURÍDICO/FINANCEIRO DO FRANQUEADO]", "{{emailJuridicoFinanceiro}}"],
  ["[NOME DO ENCARREGADO DO FRANQUEADO - A DEFINIR]", "{{dpoNome}}"],
  ["[E-MAIL DO ENCARREGADO DO FRANQUEADO - A DEFINIR]", "{{dpoEmail}}"],
  ["[AWS / GCP / Azure / outro - DEFINIR]", "{{cloudProvider}}"],
  // ordem: tokens longos de DATA antes do curto "[DATA]"
  ["[DATA POR EXTENSO]", "{{dataExtenso}}"],
  ["[DATA NUMÉRICA]", "{{dataNumerica}}"],
  ["[DATA]", "{{dataNumerica}}"],
  ["[CIDADE]", "{{cidade}}"],
  ["[CARGO]", "{{representanteCargo}}"],
];

let out = src;
for (const [from, to] of unambiguous) out = out.split(from).join(to);

// CPF do representante na qualificação do preâmbulo (sem prefixo "CPF: ")
out = out.replace("CPF/MF sob o n. **[CPF]**", "CPF/MF sob o n. **{{representanteCPF}}**");

// Blocos ambíguos de [NOME]/[CPF], resolvidos por contexto e ordem:
// (A) assinatura do Anexo V
out = out.replace(
  "Representante: [NOME]\nCPF: [CPF]",
  "Representante: {{representanteNome}}\nCPF: {{representanteCPF}}",
);
// (B) assinatura principal do FRANQUEADO
out = out.replace(
  "Nome do Representante: {{representanteNome}}\nCPF: [CPF]\nCargo: {{representanteCargo}}",
  "Nome do Representante: {{representanteNome}}\nCPF: {{representanteCPF}}\nCargo: {{representanteCargo}}",
);
// (C) testemunhas: o que sobrar de [NOME]/[CPF] são as 2 testemunhas -> linhas em branco
out = out.split("Nome: [NOME]").join("Nome: ___________________________");
out = out.split("CPF: [CPF]").join("CPF: ___________________________");

// Opções (checkboxes) -> tokens que a fill() resolve para "(X)" ou "( )"
const options = [
  [/\( \) CATEGORIA PEQUENA/, "{{chkCatPequena}} CATEGORIA PEQUENA"],
  [/\( \) CATEGORIA MÉDIA\/GRANDE/, "{{chkCatMediaGrande}} CATEGORIA MÉDIA/GRANDE"],
  [/\( \) Assinatura até 30\/06\/2026/, "{{chkSetupIsento}} Assinatura até 30/06/2026"],
  [/\( \) Assinatura a partir de 01\/07\/2026/, "{{chkSetupPago}} Assinatura a partir de 01/07/2026"],
  [/\( \) Suporte Básico/, "{{chkSuporteBasico}} Suporte Básico"],
  [/\( \) Suporte Premium/, "{{chkSuportePremium}} Suporte Premium"],
  [/\( \) NÃO adoto a API oficial/, "{{chkApiNao}} NÃO adoto a API oficial"],
  [/\( \) SIM, adoto a API oficial/, "{{chkApiSim}} SIM, adoto a API oficial"],
  [/\*\*DATA DE INÍCIO\*\*: _+/, "**DATA DE INÍCIO**: {{dataInicio}}"],
];
for (const [re, to] of options) out = out.replace(re, to);

writeFileSync(join(root, "templates/contrato.template.md"), out, "utf8");

const leftovers = [...out.matchAll(/\[[A-ZÀ-Ú][^\]]*\]/g)].map((m) => m[0]);
const tokens = [...new Set([...out.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
console.log("template gerado:", "templates/contrato.template.md");
console.log("tokens:", tokens.sort().join(", "));
if (leftovers.length) console.warn("PLACEHOLDERS NÃO RESOLVIDOS:", [...new Set(leftovers)]);
else console.log("OK: nenhum placeholder [..] remanescente");
