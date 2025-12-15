import { Component, inject, OnInit, signal } from '@angular/core';
import { addCircleOutline, pricetagOutline, saveOutline } from 'ionicons/icons';
import { IonHeader, IonContent, IonButton, IonSpinner, IonTextarea, IonIcon, IonToggle, IonItem, IonList, IonSegment, IonSegmentButton, IonLabel, IonSegmentView, IonSegmentContent, IonFooter, IonToolbar, IonTabBar, IonTabButton, IonItemDivider } from "@ionic/angular/standalone";
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { AppService } from '@app/core/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from '@app/features/services/supplier.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { ModelMeta } from '@app/shared-services';
import { getSupplierMeta, Supplier } from '@app/features/models';
import { addIcons } from 'ionicons';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { CommonModule } from '@angular/common';
import { InputComponent } from '@app/shared/input/input.component';
import { SelectComponent } from '@app/shared/select/select.component';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss'],
  standalone: true,
  imports: [IonItemDivider, IonFooter, IonLabel, IonSegmentButton, IonSegment, IonIcon, IonSpinner, IonContent, IonHeader, CommonModule, ToolbarPage, ReactiveFormsModule, InputComponent, IonSegment, IonSegmentContent, IonTabBar, IonTabButton, IonSegmentView]
})
export class SupplierComponent implements OnInit {
  private app = inject(AppService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(SupplierService);


  isSupplierSave = signal<boolean>(false);

  form!: FormGroup;
  isEdit = signal<boolean>(false);
  formMeta = new FormMeta();
  modelMeta!: ModelMeta[];
 

  // Default values for new supplier
  private readonly defaultSupplier: Partial<Supplier> = {
    isActive: true,

  };


  constructor() {
    addIcons({
      pricetagOutline, addCircleOutline, saveOutline
    });
  }

  ngOnInit() {
    this.modelMeta = getSupplierMeta();
    
    this.route.params.subscribe((x) => {
      if (x['id']) {
        let supplierId = x['id'];
        this.buildSupplierForm(supplierId);
      } else {
        this.buildNewSupplierForm();
      }
    });
  }

  private buildNewSupplierForm() {
    this.form = this.app.meta.toFormGroup(this.defaultSupplier, this.modelMeta);
  }

  private buildSupplierForm(supplierId: string) {
    this.isEdit.set(true);
    this.service.getSupplierById(supplierId).subscribe((y) => {
      this.form = this.app.meta.toFormGroup(y, this.modelMeta);
    });

  }

  onSubmit(addMore?: boolean) {
    console.log(this.form.value);

    FormHelper.submit(
      this.form,
      this.formMeta,
      () => {
        let supplierId = this.form.value['supplierId'];
        this.isSupplierSave.set(true);
        if (supplierId) {
          this.service.updateSupplierAndReturn(this.form.value).subscribe((x) => {
            this.app.noty.presentToast(`Supplier has been updated.`, 3000, 'top', 'success');
            this.isSupplierSave.set(false);
            this.formMeta.submitProcessing = false;
            this.router.navigate(['../'], { relativeTo: this.route });
          });
        } else {
          // add
          this.service.addSupplierAndReturn(this.form.value).subscribe((x) => {
            this.app.noty.presentToast(`Supplier has been added.`, 3000, 'top', 'success');
            if (addMore) {
              this.isSupplierSave.set(false);
              this.formMeta.submitProcessing = false;
              // Reset form with default values
              this.form.reset(this.defaultSupplier);
              this.form.markAsPristine();
              this.form.markAsUntouched();
              this.form.updateValueAndValidity();
            } else {
              this.form.reset();
              this.isSupplierSave.set(false);
              this.formMeta.submitProcessing = false;
              this.router.navigate(['../'], {
                relativeTo: this.route,
              });
            }
          });
        }
      },
      true
    );
  }

  handleUnitChange(event: any) {
    console.log('Unit of Measure changed:', event);
  }

  handleDiscountTypeChange(event: any) {
    console.log('Discount Type changed:', event);
  }

}
