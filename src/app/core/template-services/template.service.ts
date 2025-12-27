import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import * as Handlebars from 'handlebars';
import { Invoice, TemplateMetadata } from '@app/models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private templatesBasePath = '/assets/templates';
  private defaultTemplateId = '01f3e5b2-8a67-7a00-a123-000000000001';

  constructor(private http: HttpClient) { }

  /**
   * Fetches the list of available templates from the manifest
   */
  getTemplates(): Observable<TemplateMetadata[]> {
    return this.http.get<{ templates: TemplateMetadata[] }>(`${this.templatesBasePath}/templates.json`)
      .pipe(map(response => response.templates));
  }

  getTemplateMetadataWithFallback(templateId?: string): Observable<TemplateMetadata> {
    if (templateId) {
      return this.getTemplates().pipe(
        map(templates => {
          const template = templates.find(t => t.templateId === templateId);
          if (!template) throw new Error('Template not found');
          return template;
        })
      );
    } else {
      return this.getTemplates().pipe(
        map(templates => {
          const template = templates.find(t => t.templateId === this.defaultTemplateId);
          if (!template) throw new Error('Template not found');
          return template;
        })
      );
    }
  }

  /**
   * Fetches a specific template by filename
   */
  getTemplateByFilename(filename: string): Observable<string> {
    return this.http.get(`${this.templatesBasePath}/${filename}`, { responseType: 'text' });
  }

  /**
   * Compiles a Handlebars template and renders it with invoice data
   */
  renderTemplate(templateContent: string, invoice: Invoice): string {
    try {
      // Compile the template
      const template = Handlebars.compile(templateContent);

      // Render with invoice data
      return template(invoice);
    } catch (error) {
      console.error('Error rendering template:', error);
      throw new Error('Failed to render template');
    }
  }

  /**
   * Convenience method to get and render a template in one call
   */
  getAndRenderTemplate(filename: string, invoice: Invoice): Observable<string> {
    return this.getTemplateByFilename(filename).pipe(
      map(templateContent => this.renderTemplate(templateContent, invoice))
    );
  }
}
