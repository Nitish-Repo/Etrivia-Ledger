import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
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
  IonItemDivider,
  ModalController,
  IonButtons,
  IonTitle, IonRippleEffect,
  IonToolbar, IonAvatar, IonGrid, IonRow, IonCol } from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { saveOutline, close, addOutline, imageOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-business-info',
  templateUrl: './business-info.component.html',
  styleUrls: ['./business-info.component.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid, IonRippleEffect,
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
    IonButtons,
    IonTitle,
    IonToolbar,
    IonButton,
    CommonModule,
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
  private modalCtrl = inject(ModalController);
  private cdr = inject(ChangeDetectorRef)

  isBusinessSave = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  segment = signal<string>('first');
  logoPreview = signal<string | null>(null);

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
    addIcons({close,addOutline,saveOutline,imageOutline});
  }

  ngOnInit() {
    this.modelMeta = getBusinessSettingsMeta();
    this.buildBusinessForm();
  }

  private buildBusinessForm() {
    this.service.getBusinessSettings().subscribe({
      next: (settings) => {
        if (settings) {
          this.isEdit.set(true);
          this.form = this.app.meta.toFormGroup(settings, this.modelMeta);
          // Set logo preview if logo exists
          if (settings.logoUrl) {
            this.logoPreview.set(settings.logoUrl);
          }
          this.cdr.detectChanges();
        } else {
          this.buildNewBusinessForm();
        }
      },
      error: (error) => {
        console.error('Error loading business settings:', error);
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
            this.modalCtrl.dismiss({ saved: true, data: savedSettings });
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

  async selectLogo() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        width: 400,
        height: 400,
        promptLabelHeader: 'Select Logo',
        promptLabelPhoto: 'From Gallery',
        promptLabelPicture: 'Take Photo'
      });
      
      if (image.dataUrl) {
        this.form.patchValue({ logoUrl: image.dataUrl });
        this.logoPreview.set(image.dataUrl);
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error selecting logo:', error);
      // User cancelled or error occurred
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
