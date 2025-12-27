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

  constructor(private http: HttpClient) {}

  /**
   * Fetches the list of available templates from the manifest
   */
  getTemplates(): Observable<TemplateMetadata[]> {
    return this.http.get<{ templates: TemplateMetadata[] }>(`${this.templatesBasePath}/templates.json`)
      .pipe(map(response => response.templates));
  }

  /**
   * Fetches a specific template by filename
   */
  getTemplate(filename: string): Observable<string> {
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
    return this.getTemplate(filename).pipe(
      map(templateContent => this.renderTemplate(templateContent, invoice))
    );
  }
}
