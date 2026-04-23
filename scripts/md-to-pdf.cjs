const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { marked } = require('marked');

const [, , mdPath, pdfPath] = process.argv;
if (!mdPath || !pdfPath) {
  console.error('Uso: node md-to-pdf.cjs <arquivo.md> <saida.pdf>');
  process.exit(1);
}

const md = fs.readFileSync(mdPath, 'utf-8');
const body = marked.parse(md);

const css = `
  @page { size: A4; margin: 18mm 16mm 20mm 16mm; }
  body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 10.5pt; line-height: 1.55; color: #222; max-width: 100%; }
  h1 { color: #1e40af; font-size: 20pt; margin-top: 0; border-bottom: 2px solid #1e40af; padding-bottom: 6pt; }
  h2 { color: #1e3a8a; font-size: 14pt; margin-top: 18pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 3pt; page-break-after: avoid; }
  h3 { color: #334155; font-size: 11.5pt; margin-top: 12pt; page-break-after: avoid; }
  p, li { margin: 4pt 0; }
  ul, ol { padding-left: 18pt; }
  li { margin: 2pt 0; }
  strong { color: #111; }
  code { background: #f1f5f9; padding: 1pt 4pt; border-radius: 3pt; font-size: 9.5pt; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 10pt; page-break-inside: avoid; }
  th, td { border: 1px solid #cbd5e1; padding: 6pt 8pt; text-align: left; vertical-align: top; }
  th { background: #e0e7ff; color: #1e3a8a; font-weight: 600; }
  tr:nth-child(even) td { background: #f8fafc; }
  blockquote { border-left: 3px solid #3b82f6; margin: 6pt 0; padding: 4pt 12pt;
    background: #eff6ff; color: #1e3a8a; font-style: italic; }
  hr { border: none; border-top: 1px solid #cbd5e1; margin: 14pt 0; }
  em { color: #475569; }
  a { color: #1d4ed8; }
  h2, h3, table, blockquote { break-inside: avoid; }
`;

const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>${path.basename(mdPath)}</title>
<style>${css}</style></head>
<body>${body}</body></html>`;

const htmlPath = path.join(require('os').tmpdir(), 'manual-' + Date.now() + '.html');
fs.writeFileSync(htmlPath, html, 'utf-8');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
const pdfAbs = path.resolve(pdfPath);

execFileSync(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--print-to-pdf=' + pdfAbs,
  htmlUrl,
], { stdio: 'inherit' });

fs.unlinkSync(htmlPath);
console.log('PDF gerado:', pdfAbs);
