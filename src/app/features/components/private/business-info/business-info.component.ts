import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '@app/core/app.service';
import { BusinessSettings, getBusinessSettingsMeta } from '@app/features/models/business-settings.model';
import { BusinessSettingsService } from '@app/features/services/business-settings';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { InputComponent } from '@app/shared/input/input.component';
import { ModelMeta } from '@app/shared-services';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { 
  IonHeader, 
  IonContent, 
  IonButton, 
  IonSpinner, 
  IonTextarea, 
  IonIcon, 
  IonToggle, 
  IonItem, 
  IonList, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel, 
  IonFooter, 
  IonTabBar, 
  IonTabButton, 
  IonItemDivider 
} from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-business-info',
  templateUrl: './business-info.component.html',
  styleUrls: ['./business-info.component.scss'],
  standalone: true,
  imports: [
    IonItemDivider,
    IonFooter,
    IonLabel,
    IonSegmentButton,
    IonSegment,
    IonList,
    IonItem,
    IonToggle,
    IonIcon,
    IonTextarea,
    IonSpinner,
    IonContent,
    IonHeader,
    CommonModule,
    ToolbarPage,
    ReactiveFormsModule,
    InputComponent,
    IonTabBar,
    IonTabButton,
    TranslateModule
  ]
})
export class BusinessInfoComponent implements OnInit {
  private app = inject(AppService);
  private router = inject(Router);
  private service = inject(BusinessSettingsService);

  isBusinessSave = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  segment = signal<string>('first');

  form!: FormGroup;
  formMeta = new FormMeta();
  modelMeta!: ModelMeta[];

  // Default values for business settings
  private readonly defaultBusiness: Partial<BusinessSettings> = {
    enableCess: false,
    defaultGstRate: 18,
    financialYearStart: '04-01',
    invoicePrefix: 'INV'
  };

  constructor() {
    addIcons({ saveOutline });
  }

  ngOnInit() {
    this.modelMeta = getBusinessSettingsMeta();
    this.loadBusinessSettings();
  }

  private loadBusinessSettings() {
    // Check if settings exist, if yes load them, otherwise use defaults
    this.service.getBusinessSettings().subscribe((settings) => {
      if (settings) {
        this.isEdit.set(true);
        this.form = this.app.meta.toFormGroup(settings, this.modelMeta);
      } else {
        this.buildNewBusinessForm();
      }
    });
  }

  private buildNewBusinessForm() {
    this.form = this.app.meta.toFormGroup(this.defaultBusiness, this.modelMeta);
  }

  onSubmit() {
    console.log(this.form.value);

    FormHelper.submit(
      this.form,
      this.formMeta,
      () => {
        this.isBusinessSave.set(true);
        
        // Save business settings
        this.service.saveBusinessSettingsAndReturn(this.form.value).subscribe({
          next: (savedSettings) => {
            this.isBusinessSave.set(false);
            this.formMeta.submitProcessing = false;
            this.app.noty.presentToast('Business information saved successfully', 3000, 'top', 'success');
            this.router.navigate(['/private/home']);
          },
          error: (error) => {
            this.isBusinessSave.set(false);
            this.formMeta.submitProcessing = false;
            console.error('Error saving business settings:', error);
            this.app.noty.presentToast('Error saving business information', 3000, 'top', 'danger');
          }
        });
      }
    );
  }
}
