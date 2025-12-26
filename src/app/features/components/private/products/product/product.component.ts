import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '@app/core/app.service';
import { getProductMeta, Product, DiscountType } from '@app/features/models/product.model';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { ModelMeta } from '@app/shared-services';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { ModalController, IonHeader, IonContent, IonButton, IonSpinner, IonTextarea, IonIcon, IonToggle, IonItem, IonList, IonSegment, IonSegmentButton, IonLabel, IonSegmentView, IonSegmentContent, IonFooter, IonToolbar, IonTabBar, IonTabButton, IonItemDivider, IonButtons, IonTitle } from "@ionic/angular/standalone";
import { of, Subject, switchMap } from 'rxjs';
import { InputComponent } from "@app/shared/input/input.component";
import { addIcons } from 'ionicons';
import { addCircleOutline, pricetagOutline, saveOutline, close } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { getProductInventoryMeta, ProductInventory } from '@app/features/models/product-inventory.model';
import { ProductService } from '@app/features/services/product.service';
import { SelectComponent } from "@app/shared/select/select.component";
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  standalone: true,
  imports: [IonTitle, IonButtons, IonItemDivider, IonFooter, IonLabel, IonSegmentButton, IonSegment, IonList, IonItem, IonToggle, IonIcon, IonTextarea, IonSpinner, IonContent, IonHeader, CommonModule, ToolbarPage, ReactiveFormsModule, InputComponent, SelectComponent, IonTabBar, IonTabButton, TranslateModule, IonButton, IonToolbar]
})
export class ProductComponent implements OnInit {
  private app = inject(AppService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  private modalCtrl = inject(ModalController);

  @Input() openedAsModal = false;
  private destroy$: Subject<void> = new Subject<void>();

  isProductSave = signal<boolean>(false);
  segment = signal<string>('first');

  form!: FormGroup;
  isEdit = signal<boolean>(false);
  formMeta = new FormMeta();
  modelMeta!: ModelMeta[];
  inventoryMeta!: ModelMeta[];
  unitMeasureMeta!: ModelMeta;
  discountTypeMeta!: ModelMeta;
  saleTaxTypeMeta!: ModelMeta;
  purchaseTaxTypeMeta!: ModelMeta;

  // Default values for new product
  private readonly defaultProduct: Partial<Product> = {
    isActive: true,
    discountType: DiscountType.PERCENTAGE,
    isInventory: false,
  };


  constructor() {
    addIcons({close,addCircleOutline,saveOutline,pricetagOutline});
  }

  ngOnInit() {
    this.modelMeta = getProductMeta();

    // Find metadata for select components
    this.unitMeasureMeta = this.modelMeta.find(m => m.key === 'unitMeasure')!;
    this.discountTypeMeta = this.modelMeta.find(m => m.key === 'discountType')!;
    this.saleTaxTypeMeta = this.modelMeta.find(m => m.key === 'saleTaxType')!;
    this.purchaseTaxTypeMeta = this.modelMeta.find(m => m.key === 'purchaseTaxType')!;

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
    this.form = this.app.meta.toFormGroup(this.defaultProduct, this.modelMeta);
  }

  private buildProductForm(productId: string) {
    this.isEdit.set(true);
    this.service.getProductById(productId).subscribe((y) => {
      this.form = this.app.meta.toFormGroup(y, this.modelMeta);
    });

  }

  onSubmit(addMore?: boolean) {
    console.log(this.form.value);

    FormHelper.submit(
      this.form,
      this.formMeta,
      () => {
        let productId = this.form.value['productId'];
        this.isProductSave.set(true);
        if (productId) {
          this.service.updateProduct(this.form.value).subscribe((x) => {
            this.app.noty.presentToast(`Product has been updated.`, 3000, 'top', 'success');
            this.isProductSave.set(false);
            this.formMeta.submitProcessing = false;
            this.router.navigate(['../'], { relativeTo: this.route });
          });
        } else {
          // add
          this.service.addProduct(this.form.value).subscribe((x: Product | ProductInventory | any) => {
            this.app.noty.presentToast(`Product has been added.`, 3000, 'top', 'success');
            if (addMore) {
              this.isProductSave.set(false);
              this.formMeta.submitProcessing = false;
              // Reset form with default values
              this.form.reset(this.defaultProduct);
              this.form.markAsPristine();
              this.form.markAsUntouched();
              this.form.updateValueAndValidity();
            } else {
              if (this.openedAsModal) {
                this.modalCtrl.dismiss(x)
              } else {
                this.form.reset();
                this.isProductSave.set(false);
                this.formMeta.submitProcessing = false;
                this.router.navigate(['../'], {
                  relativeTo: this.route,
                });
              }
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

  closeModal() {
    this.modalCtrl.dismiss();
  }

}

