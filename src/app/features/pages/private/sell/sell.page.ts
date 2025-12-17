import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonSegment, IonSegmentButton, IonLabel, IonItemDivider, IonDatetime, IonModal, IonButtons,
  IonButton, IonIcon, IonTextarea, IonSpinner, IonFooter, IonToolbar, IonItem, IonDatetimeButton, IonList, IonBadge, IonNote, IonText } from '@ionic/angular/standalone';
import { ToolbarPage } from "@app/layouts/private/toolbar/toolbar.page";
import { Subject } from 'rxjs';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { ModelMeta } from '@app/shared-services';
import { AppService } from '@app/core/app.service';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { TranslateModule } from '@ngx-translate/core';
import { getAdditionalChargeMeta, getSaleItemMeta, getSaleMeta, Sale, SaleItem, AdditionalCharge } from '@app/features/models';
import { ActivatedRoute, Router } from '@angular/router';
import { InputComponent } from '@app/shared/input/input.component';
import { SelectComponent } from '@app/shared/select/select.component';
import { addIcons } from 'ionicons';
import { add, saveOutline, trash, ellipsisVertical, heart } from 'ionicons/icons';
import { LuxonDateService } from '@app/core/luxon-Date.service';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.page.html',
  styleUrls: ['./sell.page.scss'],
  standalone: true,
  imports: [IonText, IonNote, IonBadge, IonList, IonDatetimeButton, IonItem, 
    IonContent, IonHeader, IonSegment, IonSegmentButton, IonLabel, IonItemDivider,
    IonButton, IonIcon, IonTextarea, IonSpinner, IonFooter, IonToolbar, IonDatetime, IonModal, IonButtons,
    CommonModule, ReactiveFormsModule, ToolbarPage, InputComponent, SelectComponent, TranslateModule
  ]
})
export class SellPage implements OnInit {
  private app = inject(AppService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private luxonDateService = inject (LuxonDateService)

  private destroy$: Subject<void> = new Subject<void>();
  
  // Forms
  saleForm!: FormGroup;
  private saleItemFormsArray = signal<FormGroup[]>([]);
  private additionalChargeFormsArray = signal<FormGroup[]>([]);
  
  saleItemForms = computed(() => this.saleItemFormsArray());
  additionalChargeForms = computed(() => this.additionalChargeFormsArray());
  
  // UI State
  segment = signal<string>('invoice');
  isEdit = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  
  // Metadata
  formMeta = new FormMeta();
  saleModelMeta!: ModelMeta[];
  saleItemModelMeta!: ModelMeta[];
  additionalChargeModelMeta!: ModelMeta[];
  
  // Select metadata for dropdowns
  customerMeta!: ModelMeta;
  invoiceDiscountTypeMeta!: ModelMeta;
  paymentStatusMeta!: ModelMeta;
  saleTypeMeta!: ModelMeta;
  statusMeta!: ModelMeta;
  
  productMeta!: ModelMeta;
  itemTaxTypeMeta!: ModelMeta;
  itemDiscountTypeMeta!: ModelMeta;
  
  chargeTaxTypeMeta!: ModelMeta;

  // Default values
  private readonly defaultSale: Partial<Sale> = {
    invoiceDate : this.luxonDateService.now().toUTC().startOf('day').toISO() || new Date().toISOString().split('T')[0],
    subtotal: 0,
    taxableAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    totalAmount: 0,
    roundOff: 0,
    grandTotal: 0,
    paidAmount: 0,
    dueAmount: 0
  };

  constructor() {
    addIcons({add,heart,ellipsisVertical,trash,saveOutline});
  }

  ngOnInit() {
    this.saleModelMeta = getSaleMeta();
    this.saleItemModelMeta = getSaleItemMeta();
    this.additionalChargeModelMeta = getAdditionalChargeMeta();

    // Find metadata for select components
    this.customerMeta = this.saleModelMeta.find(m => m.key === 'customerId')!;
    this.invoiceDiscountTypeMeta = this.saleModelMeta.find(m => m.key === 'invoiceDiscountType')!;
    this.paymentStatusMeta = this.saleModelMeta.find(m => m.key === 'paymentStatus')!;
    this.saleTypeMeta = this.saleModelMeta.find(m => m.key === 'saleType')!;
    this.statusMeta = this.saleModelMeta.find(m => m.key === 'status')!;
    
    this.productMeta = this.saleItemModelMeta.find(m => m.key === 'productId')!;
    this.itemTaxTypeMeta = this.saleItemModelMeta.find(m => m.key === 'taxType')!;
    this.itemDiscountTypeMeta = this.saleItemModelMeta.find(m => m.key === 'discountType')!;
    
    this.chargeTaxTypeMeta = this.additionalChargeModelMeta.find(m => m.key === 'taxType')!;

    this.route.params.subscribe((x) => {
      if (x['id']) {
        let saleId = x['id'];
        this.buildSellForm(saleId);
      } else {
        this.buildNewSellForm();
      }
    });
  }

  private buildNewSellForm() {
    this.saleForm = this.app.meta.toFormGroup(this.defaultSale, this.saleModelMeta);

    // Initialize with one sale item
    const itemForms: FormGroup[] = [];
    itemForms.push(this.app.meta.toFormGroup({}, this.saleItemModelMeta));
    this.saleItemFormsArray.set(itemForms);

    // Initialize with one additional charge (can be empty)
    const chargeForms: FormGroup[] = [];
    chargeForms.push(this.app.meta.toFormGroup({}, this.additionalChargeModelMeta));
    this.additionalChargeFormsArray.set(chargeForms);
  }

  private buildSellForm(saleId: string) {
    this.isEdit.set(true);
    // TODO: Load sale data from service
    // this.service.getSaleById(saleId).subscribe((sale) => {
    //   this.saleForm = this.app.meta.toFormGroup(sale, this.saleModelMeta);
    //   
    //   // Load sale items
    //   this.service.getSaleItems(saleId).subscribe((items) => {
    //     const itemForms = items.map(item => this.app.meta.toFormGroup(item, this.saleItemModelMeta));
    //     this.saleItemFormsArray.set(itemForms);
    //   });
    //   
    //   // Load additional charges
    //   this.service.getAdditionalCharges(saleId).subscribe((charges) => {
    //     const chargeForms = charges.map(charge => this.app.meta.toFormGroup(charge, this.additionalChargeModelMeta));
    //     this.additionalChargeFormsArray.set(chargeForms);
    //   });
    // });
  }

  onDateChange(event: any, controlName: string) {
    const selectedDate = event.detail.value; // ISO string from ion-datetime
    const utcDate = this.luxonDateService.toDateTime(selectedDate).startOf('day').toISO();
    this.saleForm.get(controlName)?.setValue(utcDate);
  }

  addSaleItem() {
    const currentForms = this.saleItemFormsArray();
    const newForm = this.app.meta.toFormGroup({}, this.saleItemModelMeta);
    this.saleItemFormsArray.set([...currentForms, newForm]);
  }

  removeSaleItem(index: number) {
    const currentForms = this.saleItemFormsArray();
    if (currentForms.length > 1) {
      currentForms.splice(index, 1);
      this.saleItemFormsArray.set([...currentForms]);
    }
  }

  addAdditionalCharge() {
    const currentForms = this.additionalChargeFormsArray();
    const newForm = this.app.meta.toFormGroup({}, this.additionalChargeModelMeta);
    this.additionalChargeFormsArray.set([...currentForms, newForm]);
  }

  removeAdditionalCharge(index: number) {
    const currentForms = this.additionalChargeFormsArray();
    if (currentForms.length > 1) {
      currentForms.splice(index, 1);
      this.additionalChargeFormsArray.set([...currentForms]);
    }
  }

  onSubmit() {
    FormHelper.submit(this.saleForm, this.formMeta, () => {
      this.isSubmitting.set(true);
      
      const saleData: Sale = this.saleForm.value;
      const saleItems: SaleItem[] = this.saleItemFormsArray().map(f => f.value);
      const additionalCharges: AdditionalCharge[] = this.additionalChargeFormsArray()
        .map(f => f.value)
        .filter(c => c.chargeName && c.amount); // Only include charges with data

      console.log('Sale Data:', saleData);
      console.log('Sale Items:', saleItems);
      console.log('Additional Charges:', additionalCharges);

      // TODO: Implement save logic
      // if (this.isEdit()) {
      //   // Update existing sale
      // } else {
      //   // Create new sale
      //   this.saleService.addSaleAndReturn(saleData).subscribe(sale => {
      //     // Add sale items
      //     this.saleService.addSaleItemsAndReturn(saleItems).subscribe();
      //     // Add additional charges
      //     this.saleService.addAdditionalChargesAndReturn(additionalCharges).subscribe();
      //   });
      // }

      setTimeout(() => {
        this.isSubmitting.set(false);
      }, 1000);
    }, true);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
