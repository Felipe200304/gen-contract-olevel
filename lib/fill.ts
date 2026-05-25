import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type ContractData,
  formatDateExtenso,
  formatDateNumeric,
  isSetupIsento,
} from "./fields";

const templatePath = join(process.cwd(), "templates", "contrato.template.md");

const CHK_ON = "(X)";
const CHK_OFF = "( )";

export function fillContract(data: ContractData): string {
  const template = readFileSync(templatePath, "utf8");
  const isento = isSetupIsento(data.dataAssinatura);

  const tokens: Record<string, string> = {
    razaoSocial: data.razaoSocial,
    cnpj: data.cnpj,
    endereco: data.endereco,
    representanteNome: data.representanteNome,
    representanteNacionalidade: data.representanteNacionalidade,
    representanteEstadoCivil: data.representanteEstadoCivil,
    representanteProfissao: data.representanteProfissao,
    representanteRG: data.representanteRG,
    representanteCPF: data.representanteCPF,
    representanteCargo: data.representanteCargo,
    emailOficial: data.emailOficial,
    emailJuridicoFinanceiro: data.emailJuridicoFinanceiro,
    dpoNome: data.dpoNome,
    dpoEmail: data.dpoEmail,
    cloudProvider: data.cloudProvider,
    cidade: data.cidade,
    dataExtenso: formatDateExtenso(data.dataAssinatura),
    dataNumerica: formatDateNumeric(data.dataAssinatura),
    dataInicio: formatDateNumeric(data.dataInicio),

    chkCatPequena: data.categoria === "PEQUENA" ? CHK_ON : CHK_OFF,
    chkCatMediaGrande: data.categoria === "MEDIA_GRANDE" ? CHK_ON : CHK_OFF,
    chkSetupIsento: isento ? CHK_ON : CHK_OFF,
    chkSetupPago: isento ? CHK_OFF : CHK_ON,
    chkSuporteBasico: data.suporte === "BASICO" ? CHK_ON : CHK_OFF,
    chkSuportePremium: data.suporte === "PREMIUM" ? CHK_ON : CHK_OFF,
    chkApiNao: data.apiOficial ? CHK_OFF : CHK_ON,
    chkApiSim: data.apiOficial ? CHK_ON : CHK_OFF,
  };

  const filled = template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    if (key in tokens) return tokens[key];
    throw new Error(`Token sem valor no template: ${match}`);
  });

  return filled;
}
