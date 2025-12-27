import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { TemplateService } from '@app/core/template-services/template.service';
import { BusinessSettings } from '@app/features/models';
import { BusinessSettingsService } from '@app/features/services/business-settings';
import { TemplateMetadata } from '@app/models/invoice.model';
import { ModalController, IonHeader, IonContent, IonButton, IonToolbar, IonIcon, IonButtons, IonTitle, IonSegment, IonSegmentButton, IonLabel, IonGrid, IonRow, IonCol, IonSegmentView, IonSegmentContent } from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { personOutline, close, trash, checkmarkCircle } from 'ionicons/icons';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid, IonLabel, IonSegmentButton, IonSegment, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, CommonModule, TranslateModule, IonSegmentView, IonSegmentContent]
})
export class TemplatesComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private templateService = inject(TemplateService);
  private businessService = inject(BusinessSettingsService);

  @Input() openedAsModal = false;

  templates = signal<TemplateMetadata[]>([]);
  businessSetting = signal<BusinessSettings | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);


  constructor() {
    addIcons({ close, checkmarkCircle, trash });
  }


  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.loading.set(true);
    this.error.set(null);

    forkJoin([
      this.templateService.getTemplates(),
      this.businessService.getBusinessSettings()
    ]).subscribe({
      next: ([templates, businessSetting]) => {
        this.templates.set(templates);
        this.businessSetting.set(businessSetting);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load templates');
        this.loading.set(false);
      }
    })
    
  }


  selectTemplate(template: TemplateMetadata) {
    const key: keyof BusinessSettings = 'templateId';
    this.businessService.updateBusinessSettingAndReturn(key, template.templateId).subscribe({
      next: () => {
        const current = this.businessSetting() ?? ({} as BusinessSettings);
        this.businessSetting.set({ ...current, templateId: template.templateId } as BusinessSettings);
        console.log("updated Setting", this.businessSetting());
        this.closeModal();
      },
      error: (err) => {
        console.error('Failed to update template setting', err);
      }
    });

    // this.router.navigate(['/preview', template.id]);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }


}
