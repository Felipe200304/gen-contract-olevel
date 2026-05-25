import { z } from "zod";

const requiredStr = (label: string) =>
  z.string().trim().min(1, `${label} é obrigatório`);

export const contractSchema = z.object({
  // Qualificação do FRANQUEADO
  razaoSocial: requiredStr("Razão social"),
  cnpj: requiredStr("CNPJ"),
  endereco: requiredStr("Endereço"),
  representanteNome: requiredStr("Nome do representante"),
  representanteNacionalidade: requiredStr("Nacionalidade"),
  representanteEstadoCivil: requiredStr("Estado civil"),
  representanteProfissao: requiredStr("Profissão"),
  representanteRG: requiredStr("RG"),
  representanteCPF: requiredStr("CPF do representante"),
  representanteCargo: requiredStr("Cargo do representante"),

  // Comunicações (Cláusula 17.2)
  emailOficial: z.string().trim().email("E-mail oficial inválido"),
  emailJuridicoFinanceiro: z.string().trim().email("E-mail jurídico/financeiro inválido"),

  // Encarregado / DPO (Anexo IV)
  dpoNome: requiredStr("Nome do encarregado (DPO)"),
  dpoEmail: z.string().trim().email("E-mail do encarregado inválido"),

  // Assinatura
  cidade: requiredStr("Cidade"),
  dataAssinatura: requiredStr("Data de assinatura"), // yyyy-mm-dd

  // Opções comerciais
  categoria: z.enum(["PEQUENA", "MEDIA_GRANDE"]),
  suporte: z.enum(["BASICO", "PREMIUM"]),
  apiOficial: z.boolean(),
  dataInicio: requiredStr("Data de início"), // yyyy-mm-dd

  // Configuração (default O-LEVEL preenchido no formulário)
  cloudProvider: requiredStr("Provedor de cloud"),
});

export type ContractData = z.infer<typeof contractSchema>;

export const defaultValues: Partial<ContractData> = {
  razaoSocial: "",
  cnpj: "",
  endereco: "",
  representanteNome: "",
  representanteNacionalidade: "brasileiro(a)",
  representanteEstadoCivil: "",
  representanteProfissao: "",
  representanteRG: "",
  representanteCPF: "",
  representanteCargo: "Sócio-Administrador",
  emailOficial: "",
  emailJuridicoFinanceiro: "",
  dpoNome: "",
  dpoEmail: "",
  cidade: "Curitiba/PR",
  dataAssinatura: "",
  categoria: "PEQUENA",
  suporte: "BASICO",
  apiOficial: false,
  dataInicio: "",
  cloudProvider: "Amazon Web Services, Inc. (AWS)",
};

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "2026-05-25" -> "25/05/2026" */
export function formatDateNumeric(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** "2026-05-25" -> "25 de maio de 2026" */
export function formatDateExtenso(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(d)} de ${MESES[Number(m) - 1]} de ${y}`;
}

/** Taxa de Setup é isenta para assinaturas até 30/06/2026 (Cláusula 6.10). */
export function isSetupIsento(dataAssinaturaIso: string): boolean {
  return dataAssinaturaIso < "2026-07-01";
}
