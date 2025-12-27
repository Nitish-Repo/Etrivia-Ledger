import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { TemplateService } from '@app/core/template-services/template.service';
import { TemplateMetadata } from '@app/models/invoice.model';
import { ModalController, IonHeader, IonContent, IonButton, IonToolbar, IonIcon, IonButtons, IonTitle, IonSegment, IonSegmentButton, IonLabel, IonSegmentView, IonSegmentContent } from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { personOutline, close } from 'ionicons/icons';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  standalone: true,
  imports: [IonLabel, IonSegmentButton, IonSegment, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, CommonModule, TranslateModule, IonSegmentView, IonSegmentContent]
})
export class TemplatesComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private templateService = inject(TemplateService);

  @Input() openedAsModal = false;

  templates = signal<TemplateMetadata[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);


 constructor() {
     addIcons({ close });
   }
 

  ngOnInit() {
    this.loadTemplates();
   }

  loadTemplates() {
    this.loading.set(true);
    this.error.set(null);

    this.templateService.getTemplates().subscribe({
      next: (templates) => {
        this.templates.set(templates);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load templates');
        this.loading.set(false);
      }
    });
  }

  selectTemplate(template: TemplateMetadata) {
    // this.router.navigate(['/preview', template.id]);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }


}
