import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '@app/core/app.service';
import { getProductMeta, Product } from '@app/features/models/product.model';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { ModelMeta } from '@app/shared-services';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { IonHeader, IonContent, IonText, IonButton, IonSpinner, IonTextarea } from "@ionic/angular/standalone";
import { of, Subject, switchMap } from 'rxjs';
import { InputComponent } from "@app/shared/input/input.component";
import { addIcons } from 'ionicons';
import { pricetagOutline } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { getProductInventoryMeta, ProductInventory } from '@app/features/models/product-inventory.model';
import { ProductService } from '@app/features/services/product.service';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  standalone: true,
  imports: [IonTextarea, IonSpinner, IonButton, IonText, IonContent, IonHeader, CommonModule, ToolbarPage, ReactiveFormsModule, InputComponent]
})
export class ProductComponent implements OnInit {
  private app = inject(AppService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ProductService);

  private destroy$: Subject<void> = new Subject<void>();

  isProductSave = signal<boolean>(false);

  form!: FormGroup;
  inventoryForm!: FormGroup;
  isEdit = signal<boolean>(false);
  formMeta = new FormMeta();
  modelMeta!: ModelMeta[];
  inventoryMeta!: ModelMeta[];


  constructor() {
    addIcons({
      pricetagOutline
    });
  }

  ngOnInit() {
    this.modelMeta = getProductMeta();
    this.inventoryMeta = getProductInventoryMeta();
    this.route.params.subscribe((x) => {
      if (x['id']) {
        let productId = x['id'];
        this.buildProductForm(productId);
      } else {
        this.buildNewProductForm();
      }
    });
  }

  private buildNewProductForm() {
    this.form = this.app.meta.toFormGroup({ isActive: true }, this.modelMeta);
    this.inventoryForm = this.app.meta.toFormGroup({}, this.inventoryMeta);
  }

  private buildProductForm(productId: string) {
    this.isEdit.set(true);
    this.service.getProductById(productId).subscribe((y) => {
      this.form = this.app.meta.toFormGroup(y, this.modelMeta);
    });

    this.service.getProductInventoryByProductId(productId).subscribe((y) => {
      this.inventoryForm = this.app.meta.toFormGroup(y, this.inventoryMeta);
    });
  }

  onSubmit() {
    FormHelper.submit(this.form, this.formMeta, () => {
      this.isProductSave.set(true);
      // this.token.setToken("loggedIn");
      // this.route.navigate(['/home'], { replaceUrl: true });
      console.log(this.form.value);
      this.isProductSave.set(false);
      this.formMeta.submitProcessing = false;
    }, true);
  }

  saveProduct(addMore?: boolean) {
    FormHelper.submit(
      this.form,
      this.formMeta,
      () => {
        let productId = this.form.value['productId'];
        if (productId) {
          // edit
          if (this.form.value.isInventory === true) {
            let productInventory = this.inventoryForm.value;
            productInventory.productId = productId;
            this.service.updateProductInventory(productInventory).subscribe();
          }
          this.service.updateProduct(this.form.value).subscribe((x) => {
            // this.app.noty.notifyUpdated('Product has been');

            // Check if the component was opened within a dialog, and close it
            // if (this.data && this.data.isDialog) {
            //   this.dialog.closeAll();
            // } else {
              this.router.navigate(['../'], { relativeTo: this.route });
            // }
          });
        } else {
          // add
          this.service
            .addProduct(this.form.value)
            .pipe(
              switchMap((x: Product | any) => {
                let productInventory = this.inventoryForm.value;
                productInventory.productId = x.productId;
                // save inventory if managing inventory for this product
                if (x.isInventory === true) {
                  return this.service.addProductInventory(productInventory);
                } else {
                  return of(x);
                }
              })
            )
            .subscribe((x: Product | ProductInventory | any) => {
              // this.app.noty.notifyClose('Product has been added');
              if (addMore) {
                this.form = this.app.meta.toFormGroup(
                  { isActive: true },
                  this.modelMeta
                );
                this.inventoryForm.reset();
                this.form.markAsPristine();
                this.form.markAsUntouched();
                this.form.updateValueAndValidity();
                // this.cdr.markForCheck();
              } else {
                this.form.reset();
                this.inventoryForm.reset();

                // Check if the component was opened within a dialog, and close it
                // if (this.data && this.data.isDialog) {
                //   this.dialog.closeAll();
                // } else {
                  this.router.navigate(['../', x.productId], {
                    relativeTo: this.route,
                  });
                // }
              }
            });
        }
      },
      true
    );
  }

}

