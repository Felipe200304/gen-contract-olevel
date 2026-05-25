import MarkdownIt from "markdown-it";
import puppeteer from "puppeteer";

const md = new MarkdownIt({ html: false, linkify: true, typographer: false });

const PRINT_CSS = `
  @page { size: A4; margin: 22mm 18mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 10.5pt; line-height: 1.5; color: #111; margin: 0;
    text-align: justify; -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  h1 { font-size: 15pt; text-align: center; margin: 0 0 14px; line-height: 1.3; }
  h2 { font-size: 12.5pt; margin: 22px 0 8px; border-bottom: 1px solid #ccc; padding-bottom: 3px; page-break-after: avoid; }
  h3 { font-size: 11pt; margin: 14px 0 6px; page-break-after: avoid; }
  p { margin: 0 0 8px; }
  strong { font-weight: 700; }
  hr { border: 0; border-top: 1px solid #ddd; margin: 16px 0; }
  ul, ol { margin: 0 0 8px; padding-left: 22px; }
  li { margin: 0 0 4px; }
  blockquote {
    margin: 10px 0; padding: 8px 12px; border-left: 4px solid #b91c1c;
    background: #fef2f2; page-break-inside: avoid; text-align: left;
  }
  blockquote p { margin: 0 0 4px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9pt; page-break-inside: avoid; }
  th, td { border: 1px solid #999; padding: 5px 7px; text-align: left; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 700; }
  code { font-family: "Courier New", monospace; font-size: 9pt; background: #f3f4f6; padding: 1px 3px; }
`;

export function htmlDocument(markdown: string): string {
  const body = md.render(markdown);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${PRINT_CSS}</style></head><body>${body}</body></html>`;
}

export async function renderPdf(html: string): Promise<Uint8Array> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "22mm", bottom: "22mm", left: "18mm", right: "18mm" },
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate:
        '<div style="font-size:8px;width:100%;text-align:center;color:#888;font-family:Georgia,serif;">EVNTUM · O-LEVEL — pág. <span class="pageNumber"></span>/<span class="totalPages"></span></div>',
    });
  } finally {
    await browser.close();
  }
}
