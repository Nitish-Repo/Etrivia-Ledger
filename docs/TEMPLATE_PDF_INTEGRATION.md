# Template & PDF Integration Guide ✅

This document explains how the template system and PDF generation work in this project and how to extract and reuse them in another Angular project.

---

## Overview 🔧

- Templates are stored in `public/templates` and listed via `templates.json`.
- `TemplateService` fetches template metadata and template HTML files and uses Handlebars to render HTML with `Invoice` data.
- `PdfService` converts the rendered HTML into a multi-page PDF using `html2canvas` and `jsPDF`.
- `TemplateSelector` and `Preview` components demonstrate how templates are selected, rendered, previewed, and exported to PDF.

---

## Where to copy files (what to reuse) 📁

Copy these items to the target project:

- `public/templates/` directory (includes `templates.json`, HTML templates like `modern-invoice.html`, and thumbnails)
- `src/app/models/invoice.model.ts` (Invoice shape and `TemplateMetadata`)
- `src/app/services/template.service.ts` (Handlebars rendering + HTTP helpers)
- `src/app/services/pdf.service.ts` (PDF generation with `html2canvas` + `jsPDF`)
- (Optional) `src/app/components/preview` and `src/app/components/template-selector` — for ready-made UI

---

## Dependencies & Install 📦

Install the following packages in your target project:

```bash
npm install handlebars jspdf html2canvas
# (Optional) types for dev-time (if needed)
npm i -D @types/jspdf
```

Also ensure `HttpClientModule` is imported in your Angular root module if using the `TemplateService`.

---

## Templates manifest (`templates.json`) ✨

Example (project's `public/templates/templates.json`):

```json
{
  "templates": [
    {
      "id": "modern",
      "name": "Modern Invoice",
      "description": "...",
      "filename": "modern-invoice.html",
      "thumbnailPath": "/templates/thumbnails/modern.avif",
      "category": "Professional"
    }
  ]
}
```

- `filename` is the file to fetch (GET `/templates/<filename>`).
- `thumbnailPath` is used by the gallery UI.

---

## TemplateService (what it does) 🔍

Key responsibilities:

- `getTemplates()` — GET `/templates/templates.json` and return `TemplateMetadata[]`.
- `getTemplate(filename)` — GET template HTML (`responseType: 'text'`).
- `renderTemplate(content, invoice)` — uses `Handlebars.compile` and returns rendered HTML string.
- `getAndRenderTemplate(filename, invoice)` — convenience method combining fetch + render.

Important notes:

- Template HTML is treated as raw HTML with Handlebars expressions like `{{company.name}}`, or loops for `items`.
- When injecting into the DOM use Angular's `DomSanitizer.bypassSecurityTrustHtml(...)` before binding with `[innerHTML]`.
- Handle rendering errors by catching exceptions from Handlebars (the service already throws a friendly error).

---

## Template HTML format & examples 🧩

- Templates use Handlebars placeholders matching `Invoice` model properties.
- Use loops for items, e.g.:

```html
{{#each items}}
  <tr>
    <td>{{description}}</td>
    <td>{{quantity}}</td>
    <td>{{unitPrice}}</td>
    <td>{{total}}</td>
  </tr>
{{/each}}
```

- If you want to control PDF page breaks, add elements with class `page-break` to represent individual PDF pages (see `PdfService.generatePdfWithPageBreaks`).

---

## PdfService (how it works) 📄

Two methods provided:

1. `generatePdf(element, filename)`
   - Renders the entire element into a single tall canvas via `html2canvas`.
   - Converts to PNG data URL and places on `jsPDF` pages, splitting into multiple pages if needed.

2. `generatePdfWithPageBreaks(element, filename)`
   - Looks for `.page-break` elements and renders each separately to more accurately handle page content.
   - Falls back to `generatePdf` when no `.page-break` elements exist.

Important considerations:

- Use `useCORS: true` in `html2canvas` if your templates load external images/fonts.
- High quality: the service uses `scale: 2` to improve image resolution (increasing this increases memory/time).
- PDF page size: A4 (210mm x 297mm) used in the project; adjust in `PdfService` if you need different paper sizes.
- If content overflows, `generatePdf` slices the image vertically to create subsequent pages.

---

## Integration example (Preview flow) 🔁

1. `TemplateSelector` lists templates from `getTemplates()`.
2. User selects a template -> route `/preview/:id`.
3. `PreviewComponent`:
   - loads templates + invoice data (this project uses `InvoiceService.generateMockInvoice()`)
   - finds selected template metadata
   - calls `templateService.getAndRenderTemplate(template.filename, invoice)`
   - sanitizes returned HTML and sets it into a preview container with `[innerHTML]`
4. User clicks "Download PDF" -> `PdfService.generatePdf(previewElement, filename)`

Notes:

- The `PreviewComponent` uses `@ViewChild('previewContent')` to obtain the DOM element for PDF rendering.
- Make sure any fonts/images referenced by the template are reachable from the browser (public folder) and allow cross-origin usage if loaded from different host.

---

## Copy checklist for reuse ✔️

1. Copy `public/templates/*` into the target project's `public` (or `assets`) folder and update `templatesBasePath` in `TemplateService` if necessary.
2. Copy `invoice.model.ts` or reconcile with your existing data model (ensure template placeholders map to your model fields).
3. Copy `template.service.ts` and import `HttpClientModule` in your AppModule.
4. Copy `pdf.service.ts` and install `jsPDF` + `html2canvas`.
5. (Optional) Copy `PreviewComponent` and `TemplateSelectorComponent` or re-use their logic in your UI.
6. Add routes that match the components (e.g., `/templates`, `/preview/:id`).
7. Test locally by previewing templates and exporting to PDF.

---

## Tips & Troubleshooting 💡

- If images are missing in the PDF, check CORS and `useCORS: true`. For external images consider inlining or hosting them under the same origin.
- If fonts are not rendered properly, prefer system-safe fonts or ensure web fonts are loaded before calling `html2canvas`.
- For very long pages, prefer splitting the template into `.page-break` elements to retain better control of pagination.
- For improved PDF fidelity consider server-side rendering (Puppeteer) if client-side generation isn't sufficient.

---

## Quick copy commands (example) ⛳

From your existing project root, a quick copy example (adjust paths) might look like:

```bash
# Copy templates
cp -r template-builder-poc/public/templates ./public/templates
# Copy services+models
cp template-builder-poc/src/app/services/template.service.ts ./src/app/services/
cp template-builder-poc/src/app/services/pdf.service.ts ./src/app/services/
cp template-builder-poc/src/app/models/invoice.model.ts ./src/app/models/
```

---

## Need it adapted? 🔁

If you want, I can:
- Create a small `template-extract` script that copies required files and updates import paths, or
- Scaffold a minimal Angular module (e.g., `InvoiceTemplatesModule`) to drop into your other project.

Tell me which you'd prefer and I’ll prepare it.

---

*Document generated from the current repository structure and code (TemplateService, PdfService, Preview and TemplateSelector components).*