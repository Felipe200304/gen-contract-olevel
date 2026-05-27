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
import type {
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";

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
      <Label htmlFor={name} className="mb-1.5">
        {label}
      </Label>
      <Input id={name} type={type} placeholder={placeholder} {...register(name)} />
      {errors[name] && (
        <p className="mt-1 text-sm text-destructive">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
}

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
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Contrato EVNTUM — Gerador por Franqueado
        </h1>
        <p className="mt-1 text-muted-foreground">
          Preencha os dados do franqueado e gere o contrato em PDF pronto para
          assinatura.
        </p>
      </header>

      <Card className="mb-6 bg-muted/40">
        <CardHeader>
          <CardTitle>CONTRATADA (O-LEVEL) — dados fixos</CardTitle>
          <CardDescription>
            Já preenchidos no contrato. Exibidos apenas para conferência.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
          <p>
            <span className="font-medium text-foreground">Razão social:</span>{" "}
            EDINEY MENDONÇA DA SILVA JUNIOR &amp; CIA LTDA (O-LEVEL)
          </p>
          <p>
            <span className="font-medium text-foreground">CNPJ:</span> 62.310.001/0001-90
          </p>
          <p className="sm:col-span-2">
            <span className="font-medium text-foreground">Sede:</span> Av. João
            Gualberto, 1.342, Sala 505, Alto da Glória, Curitiba/PR, CEP 80.030-000
          </p>
          <p>
            <span className="font-medium text-foreground">Representante:</span>{" "}
            Ediney Mendonça da Silva Junior (Sócio-Administrador)
          </p>
          <p>
            <span className="font-medium text-foreground">CPF:</span> 021.479.362-19
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados da empresa (FRANQUEADO)</CardTitle>
            <CardDescription>Contraparte que assina e contrata a licença.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField {...f} name="razaoSocial" label="Razão social (FRANQUEADO)" className="sm:col-span-2" />
            <TextField {...f} name="cnpj" label="CNPJ (FRANQUEADO)" placeholder="00.000.000/0001-00" />
            <TextField {...f} name="cidade" label="Cidade da assinatura" placeholder="Curitiba/PR" />
            <TextField
              {...f}
              name="endereco"
              label="Endereço da sede (FRANQUEADO)"
              className="sm:col-span-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Representante legal (FRANQUEADO)</CardTitle>
            <CardDescription>Quem assina o contrato em nome do franqueado.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField {...f} name="representanteNome" label="Nome do representante" className="sm:col-span-2" />
            <TextField {...f} name="representanteNacionalidade" label="Nacionalidade" />
            <TextField {...f} name="representanteEstadoCivil" label="Estado civil" />
            <TextField {...f} name="representanteProfissao" label="Profissão" />
            <TextField {...f} name="representanteCargo" label="Cargo na empresa" />
            <TextField {...f} name="representanteRG" label="RG do representante" />
            <TextField {...f} name="representanteCPF" label="CPF do representante" placeholder="000.000.000-00" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contatos e Encarregado de Dados (FRANQUEADO)</CardTitle>
            <CardDescription>
              E-mails oficiais do franqueado (Cláusula 17.2) e seu Encarregado de
              Dados/DPO (Anexo IV).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField {...f} name="emailOficial" label="E-mail oficial (FRANQUEADO)" type="email" />
            <TextField
              {...f}
              name="emailJuridicoFinanceiro"
              label="E-mail jurídico/financeiro (FRANQUEADO)"
              type="email"
            />
            <TextField {...f} name="dpoNome" label="Nome do Encarregado/DPO (FRANQUEADO)" />
            <TextField {...f} name="dpoEmail" label="E-mail do Encarregado/DPO (FRANQUEADO)" type="email" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opções comerciais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-2 block">Categoria inicial</Label>
              <Controller
                control={control}
                name="categoria"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="gap-2"
                  >
                    <label className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value="PEQUENA" /> Pequena — R$ 18,90 por
                      Contrato Emitido
                    </label>
                    <p className="ml-6 text-xs text-muted-foreground leading-relaxed">
                      Franquias pequenas (R$ 18,90/contrato):{" "}
                      Arquitetos da Pizza Uberlândia, Romancini e Ribeiro Buffet Ltda,
                      Arquitetos da Pizza Guarulhos, BÁRBARA BRUNA FACCA LOPES-ME,
                      Arquitetos da Pizza SAC Central, ADP RIO DE JANEIRO COMERCIO DE ALIMENTOS LTDA,
                      Arquitetos da Pizza Pouso Alegre, Arquitetos da Pizza Balneário Camboriú, Arquitetos da Pizza Mogi Mirim,
                      Arquitetos da Pizza Itu, Arquitetos da Pizza Florianópolis.
                    </p>
                    <label className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value="MEDIA_GRANDE" /> Média/Grande — R$
                      390,00/mês (fee fixo)
                    </label>
                  </RadioGroup>
                )}
              />
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assinatura (FRANQUEADO)</CardTitle>
            <CardDescription>Local e data em que o franqueado assina o contrato.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField {...f} name="dataAssinatura" label="Data de assinatura" type="date" />
            <div className="flex items-end">
              {isento !== null && (
                <p className="text-sm text-muted-foreground">
                  Taxa de Setup:{" "}
                  <span className="font-medium text-foreground">
                    {isento
                      ? "ISENTA (até 30/06/2026)"
                      : "R$ 589,90 (a partir de 01/07/2026)"}
                  </span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuração técnica (O-LEVEL)</CardTitle>
            <CardDescription>
              Sub-operador de cloud da O-LEVEL declarado no contrato (Cláusula 13.3).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TextField
              {...f}
              name="cloudProvider"
              label="Provedor de cloud / sub-operador (O-LEVEL)"
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <p className="mr-auto text-sm text-muted-foreground">
            Primeira mensalidade: <span className="font-medium">08/06/2026</span>
          </p>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Gerando PDF…" : "Gerar contrato em PDF"}
          </Button>
        </div>
      </form>
    </main>
  );
}
