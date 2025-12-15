import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '@app/core/app.service';
import { Customer, getCustomerMeta } from '@app/features/models';
import { CustomerService } from '@app/features/services/customer.service';
import { ModelMeta } from '@app/shared-services';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { addIcons } from 'ionicons';
import { addCircleOutline, pricetagOutline, saveOutline } from 'ionicons/icons';
import { IonHeader, IonContent, IonButton, IonSpinner, IonTextarea, IonIcon, IonToggle, IonItem, IonList, IonSegment, IonSegmentButton, IonLabel, IonSegmentView, IonSegmentContent, IonFooter, IonToolbar, IonTabBar, IonTabButton, IonItemDivider } from "@ionic/angular/standalone";
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { CommonModule } from '@angular/common';
import { InputComponent } from '@app/shared/input/input.component';
import { SelectComponent } from '@app/shared/select/select.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  standalone: true,
  imports: [IonItemDivider, IonFooter, IonLabel, IonSegmentButton, IonSegment, IonIcon, IonSpinner, IonContent, IonHeader, CommonModule, ToolbarPage, ReactiveFormsModule, InputComponent, SelectComponent, IonSegment, IonSegmentContent, IonTabBar, IonTabButton, IonSegmentView, TranslateModule]
})
export class CustomerComponent implements OnInit {
  private app = inject(AppService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(CustomerService);


  isCustomerSave = signal<boolean>(false);
  segment = signal<string>('first');
      
  form!: FormGroup;
  isEdit = signal<boolean>(false);
  formMeta = new FormMeta();
  modelMeta!: ModelMeta[];
  customerTypeMeta!: ModelMeta;
  priceListMeta!: ModelMeta;

  // Default values for new customer
  private readonly defaultCustomer: Partial<Customer> = {
    isActive: true,
    
  };


  constructor() {
    addIcons({
      pricetagOutline, addCircleOutline, saveOutline
    });
  }

  ngOnInit() {
    this.modelMeta = getCustomerMeta();

    // Find metadata for select components
    this.customerTypeMeta = this.modelMeta.find(m => m.key === 'customerType')!;
    this.priceListMeta = this.modelMeta.find(m => m.key === 'priceList')!;

    this.route.params.subscribe((x) => {
      if (x['id']) {
        let customerId = x['id'];
        this.buildCustomerForm(customerId);
      } else {
        this.buildNewCustomerForm();
      }
    });
  }

  private buildNewCustomerForm() {
    this.form = this.app.meta.toFormGroup(this.defaultCustomer, this.modelMeta);
  }

  private buildCustomerForm(customerId: string) {
    this.isEdit.set(true);
    this.service.getCustomerById(customerId).subscribe((y) => {
      this.form = this.app.meta.toFormGroup(y, this.modelMeta);
    });

  }

  onSubmit(addMore?: boolean) {
    console.log(this.form.value);

    FormHelper.submit(
      this.form,
      this.formMeta,
      () => {
        let customerId = this.form.value['customerId'];
        this.isCustomerSave.set(true);
        if (customerId) {
          this.service.updateCustomerAndReturn(this.form.value).subscribe((x) => {
            this.app.noty.presentToast(`Customer has been updated.`, 3000, 'top', 'success');
            this.isCustomerSave.set(false);
            this.formMeta.submitProcessing = false;
            this.router.navigate(['../'], { relativeTo: this.route });
          });
        } else {
          // add
          this.service.addCustomerAndReturn(this.form.value).subscribe((x) => {
            this.app.noty.presentToast(`Customer has been added.`, 3000, 'top', 'success');
            if (addMore) {
              this.isCustomerSave.set(false);
              this.formMeta.submitProcessing = false;
              // Reset form with default values
              this.form.reset(this.defaultCustomer);
              this.form.markAsPristine();
              this.form.markAsUntouched();
              this.form.updateValueAndValidity();
            } else {
              this.form.reset();
              this.isCustomerSave.set(false);
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
