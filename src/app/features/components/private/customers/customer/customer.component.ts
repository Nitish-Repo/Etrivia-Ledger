import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '@app/core/app.service';
import { Customer, getCustomerMeta } from '@app/features/models';
import { CustomerService } from '@app/features/services/customer.service';
import { ModelMeta } from '@app/shared-services';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { addIcons } from 'ionicons';
import { addCircleOutline, pricetagOutline, saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent implements OnInit {
  private app = inject(AppService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(CustomerService);


  isCustomerSave = signal<boolean>(false);
      
  form!: FormGroup;
  isEdit = signal<boolean>(false);
  formMeta = new FormMeta();
  modelMeta!: ModelMeta[];
  customerTypeMeta!: ModelMeta;
  priceListMeta!: ModelMeta;

  // Default values for new product
  private readonly defaultProduct: Partial<Customer> = {
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
    this.form = this.app.meta.toFormGroup(this.defaultProduct, this.modelMeta);
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
        let productId = this.form.value['customerId'];
        this.isCustomerSave.set(true);
        if (productId) {
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
              this.form.reset(this.defaultProduct);
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
