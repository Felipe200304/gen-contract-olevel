"use client";

import { useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  contractSchema,
  defaultValues,
  isSetupIsento,
  type ContractData,
} from "@/lib/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import {
  Building2,
  User,
  Mail,
  Settings2,
  CalendarDays,
  FileText,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";

type FieldName = keyof ContractData;

function TextField({
  name,
  label,
  register,
  errors,
  type = "text",
  placeholder,
  className,
}: {
  name: FieldName;
  label: string;
  register: UseFormRegister<ContractData>;
  errors: FieldErrors<ContractData>;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={name} className="mb-1.5 text-sm font-medium">
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        className="h-9"
        {...register(name)}
      />
      {errors[name] && (
        <p className="mt-1 text-xs text-destructive">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const SMALL_FRANCHISES = [
  "Arquitetos da Pizza Uberlândia",
  "Romancini e Ribeiro Buffet Ltda",
  "Arquitetos da Pizza Guarulhos",
  "BÁRBARA BRUNA FACCA LOPES-ME",
  "Arquitetos da Pizza SAC Central",
  "ADP RIO DE JANEIRO COMERCIO DE ALIMENTOS LTDA",
  "Arquitetos da Pizza Pouso Alegre",
  "Arquitetos da Pizza Balneário Camboriú",
  "Arquitetos da Pizza Mogi Mirim",
  "Arquitetos da Pizza Itu",
  "Arquitetos da Pizza Florianópolis",
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ContractData>({
    resolver: zodResolver(contractSchema),
    defaultValues,
  });

  const dataAssinatura = watch("dataAssinatura");
  const isento = dataAssinatura ? isSetupIsento(dataAssinatura) : null;

  const onSubmit: SubmitHandler<ContractData> = async (data) => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Falha (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers
          .get("Content-Disposition")
          ?.match(/filename="(.+?)"/)?.[1] ?? "contrato-evntum.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Contrato gerado com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar contrato.");
    } finally {
      setLoading(false);
    }
  };

  const f = { register, errors };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight">
                Gerador de Contrato EVNTUM
              </h1>
              <p className="text-xs text-muted-foreground">
                Preencha os dados do franqueado para gerar o PDF pronto para assinatura
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 space-y-5">

        {/* O-Level fixed data */}
        <div className="rounded-xl border bg-primary/5 px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">CONTRATADA (O-LEVEL) — dados fixos</span>
          </div>
          <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Razão social</dt>
              <dd className="font-medium">EDINEY MENDONÇA DA SILVA JUNIOR &amp; CIA LTDA (O-LEVEL)</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">CNPJ</dt>
              <dd className="font-medium">62.310.001/0001-90</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Sede</dt>
              <dd className="font-medium">Av. João Gualberto, 1.342, Sala 505, Alto da Glória, Curitiba/PR, CEP 80.030-000</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Representante</dt>
              <dd className="font-medium">Ediney Mendonça da Silva Junior (Sócio-Administrador)</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">CPF</dt>
              <dd className="font-medium">021.479.362-19</dd>
            </div>
          </dl>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <SectionCard icon={Building2} title="Dados da empresa (FRANQUEADO)" description="Contraparte que assina e contrata a licença.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField {...f} name="razaoSocial" label="Razão social" className="sm:col-span-2" />
              <TextField {...f} name="cnpj" label="CNPJ" placeholder="00.000.000/0001-00" />
              <TextField {...f} name="cidade" label="Cidade da assinatura" placeholder="Curitiba/PR" />
              <TextField {...f} name="endereco" label="Endereço da sede" className="sm:col-span-2" />
            </div>
          </SectionCard>

          <SectionCard icon={User} title="Representante legal (FRANQUEADO)" description="Quem assina o contrato em nome do franqueado.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField {...f} name="representanteNome" label="Nome completo" className="sm:col-span-2" />
              <TextField {...f} name="representanteNacionalidade" label="Nacionalidade" />
              <TextField {...f} name="representanteEstadoCivil" label="Estado civil" />
              <TextField {...f} name="representanteProfissao" label="Profissão" />
              <TextField {...f} name="representanteCargo" label="Cargo na empresa" />
              <TextField {...f} name="representanteRG" label="RG" />
              <TextField {...f} name="representanteCPF" label="CPF" placeholder="000.000.000-00" />
            </div>
          </SectionCard>

          <SectionCard icon={Mail} title="Contatos e Encarregado de Dados" description="E-mails oficiais (Cláusula 17.2) e DPO do franqueado (Anexo IV).">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField {...f} name="emailOficial" label="E-mail oficial" type="email" />
              <TextField {...f} name="emailJuridicoFinanceiro" label="E-mail jurídico/financeiro" type="email" />
              <TextField {...f} name="dpoNome" label="Nome do Encarregado/DPO" />
              <TextField {...f} name="dpoEmail" label="E-mail do Encarregado/DPO" type="email" />
            </div>
          </SectionCard>

          <SectionCard icon={Settings2} title="Opções comerciais">
            <div className="space-y-5">
              <div>
                <Label className="mb-3 block text-sm font-medium">Categoria inicial</Label>
                <Controller
                  control={control}
                  name="categoria"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="gap-3"
                    >
                      {/* Pequena */}
                      <div className={`rounded-lg border p-4 transition-colors ${field.value === "PEQUENA" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                        <label className="flex cursor-pointer items-start gap-3">
                          <RadioGroupItem value="PEQUENA" className="mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">Pequena</span>
                              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">R$ 18,90/contrato</span>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1.5">Franquias nesta categoria:</p>
                              <div className="flex flex-wrap gap-1">
                                {SMALL_FRANCHISES.map((name) => (
                                  <span
                                    key={name}
                                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                                  >
                                    <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* Média/Grande */}
                      <div className={`rounded-lg border p-4 transition-colors ${field.value === "MEDIA_GRANDE" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                        <label className="flex cursor-pointer items-center gap-3">
                          <RadioGroupItem value="MEDIA_GRANDE" />
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Média/Grande</span>
                            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">R$ 390,00/mês (fee fixo)</span>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={CalendarDays} title="Assinatura" description="Data em que o franqueado assina o contrato.">
            <div className="grid gap-4 sm:grid-cols-2 items-end">
              <TextField {...f} name="dataAssinatura" label="Data de assinatura" type="date" />
              {isento !== null && (
                <div className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${isento ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                  <span className="font-medium">
                    Taxa de Setup:{" "}
                    {isento ? "ISENTA (até 30/06/2026)" : "R$ 589,90 (a partir de 01/07/2026)"}
                  </span>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard icon={Settings2} title="Configuração técnica (O-LEVEL)" description="Sub-operador de cloud declarado no contrato (Cláusula 13.3).">
            <TextField {...f} name="cloudProvider" label="Provedor de cloud / sub-operador" />
          </SectionCard>

          {/* Footer action */}
          <div className="flex items-center justify-between rounded-xl border bg-background px-5 py-4 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Primeira mensalidade:{" "}
              <span className="font-semibold text-foreground">08/06/2026</span>
            </p>
            <Button type="submit" size="lg" disabled={loading} className="gap-2 min-w-44">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando PDF…
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Gerar contrato em PDF
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
