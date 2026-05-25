import { NextResponse } from "next/server";
import { contractSchema } from "@/lib/fields";
import { fillContract } from "@/lib/fill";
import { htmlDocument, renderPdf } from "@/lib/render";

export const runtime = "nodejs";
export const maxDuration = 60;

function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);
}

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = contractSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const markdown = fillContract(parsed.data);

    if (new URL(req.url).searchParams.get("format") === "md") {
      return new NextResponse(markdown, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    const html = htmlDocument(markdown);
    const pdf = await renderPdf(html);
    const filename = `contrato-evntum-${slug(parsed.data.razaoSocial) || "franqueado"}.pdf`;

    return new NextResponse(pdf as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao gerar PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
