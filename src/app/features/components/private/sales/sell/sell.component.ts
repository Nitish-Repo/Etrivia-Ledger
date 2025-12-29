import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonSegment, IonSegmentButton, IonLabel, IonItemDivider, IonDatetime, IonModal, IonButtons, ActionSheetController, AlertController,
  IonButton, IonIcon, IonTextarea, IonSpinner, IonFooter, IonToolbar, IonItem, IonDatetimeButton, IonList, IonBadge, IonNote, IonText, IonAvatar, IonCard, ModalController, IonTabButton, IonTabBar } from '@ionic/angular/standalone';
import { ToolbarPage } from "@app/layouts/private/toolbar/toolbar.page";
import { Subject } from 'rxjs';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { ModelMeta } from '@app/shared-services';
import { AppService } from '@app/core/app.service';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { getAdditionalChargeMeta, getSaleItemMeta, getSaleMeta, calculateSaleTotals, Sale, SaleItem, AdditionalCharge, Customer } from '@app/features/models';
import { ActivatedRoute, Router } from '@angular/router';
import { InputComponent } from '@app/shared/input/input.component';
import { SelectComponent } from '@app/shared/select/select.component';
import { addIcons } from 'ionicons';
import { add, saveOutline, trash, ellipsisVertical, heart, personOutline, chevronForwardOutline, peopleOutline, listCircle, chevronForward, idCard, idCardOutline, receiptOutline, addCircleOutline } from 'ionicons/icons';
import { LuxonDateService } from '@app/core/luxon-Date.service';
import { BusinessSettingsService } from '@app/features/services/business-settings';
import { BusinessSettings } from '@app/features/models/business-settings.model';
import { BusinessInfoComponent } from '@app/features/components/private/business-info/business-info.component';
import { InvoiceNumberService } from '@app/features/services/invoice-number.service';
import { CustomersComponent } from '../../customers/customers.component';
import { ProductsComponent } from '../../products/products.component';
import { SaleItemDetailComponent } from '../sale-item-detail/sale-item-detail.component';
import { SaleService } from '@app/features/services/sale.service';
import { SaleItemService } from '@app/features/services/sale-item.service';
import { SaleAdditionalChargeService } from '@app/features/services/sale-additional-charge.service';
import { InvoiceGenerateComponent } from '../invoice-generate/invoice-generate.component';
import { TemplatesComponent } from '../../templates/templates.component';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss'],
  standalone: true,
  imports: [IonText, IonNote, IonBadge, IonList, IonDatetimeButton, IonItem,
    IonContent, IonHeader, IonSegment, IonSegmentButton, IonLabel, IonItemDivider,
    IonButton, IonIcon, IonTextarea, IonSpinner, IonFooter, IonToolbar, IonDatetime, IonModal, IonButtons,
    CommonModule, ReactiveFormsModule, ToolbarPage, InputComponent, SelectComponent, TranslateModule
  ]
})
export class SellComponent implements OnInit {
  private app = inject(AppService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private luxonDateService = inject(LuxonDateService)
  private businessSettingsService = inject(BusinessSettingsService);
  private modalCtrl = inject(ModalController);
  private invoiceNumberService = inject(InvoiceNumberService);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);
  private translate = inject(TranslateService);
  private saleService = inject(SaleService);
  private saleItemService = inject(SaleItemService);
  private saleAdditionalChargeService = inject(SaleAdditionalChargeService);
  private cdr = inject(ChangeDetectorRef);

  private destroy$: Subject<void> = new Subject<void>();

  // Business Settings
  businessSettings = signal<BusinessSettings | null>(null);

  selectedCustomer = signal<Customer | null>(null);

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
    invoiceDate: this.luxonDateService.now().toUTC().startOf('day').toISO() || new Date().toISOString().split('T')[0],
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
    addIcons({idCardOutline,idCard,receiptOutline,ellipsisVertical,add,trash,addCircleOutline,saveOutline,listCircle,chevronForward,personOutline,chevronForwardOutline,peopleOutline,heart});
  }

  ngOnInit() {
    // this.loadBusinessSettings();
    // this.loadNextInvoiceNumber();
    // this.saleModelMeta = getSaleMeta();
    // this.saleItemModelMeta = getSaleItemMeta();
    // this.additionalChargeModelMeta = getAdditionalChargeMeta();

    // // Find metadata for select components
    // this.customerMeta = this.saleModelMeta.find(m => m.key === 'customerId')!;
    // this.invoiceDiscountTypeMeta = this.saleModelMeta.find(m => m.key === 'invoiceDiscountType')!;
    // this.paymentStatusMeta = this.saleModelMeta.find(m => m.key === 'paymentStatus')!;
    // this.saleTypeMeta = this.saleModelMeta.find(m => m.key === 'saleType')!;
    // this.statusMeta = this.saleModelMeta.find(m => m.key === 'status')!;

    // this.productMeta = this.saleItemModelMeta.find(m => m.key === 'productId')!;
    // this.itemTaxTypeMeta = this.saleItemModelMeta.find(m => m.key === 'taxType')!;
    // this.itemDiscountTypeMeta = this.saleItemModelMeta.find(m => m.key === 'discountType')!;

    // this.chargeTaxTypeMeta = this.additionalChargeModelMeta.find(m => m.key === 'taxType')!;

    // this.route.params.subscribe((x) => {
    //   if (x['id']) {
    //     let saleId = x['id'];
    //     this.buildSellForm(saleId);
    //   } else {
    //     this.buildNewSellForm();
    //   }
    // });
  }

  ionViewWillEnter() {
    this.loadBusinessSettings();
    this.loadNextInvoiceNumber();
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
    // Initialize form
    this.saleForm = this.app.meta.toFormGroup(this.defaultSale, this.saleModelMeta);

    // Listen for invoice discount changes
    this.saleForm.get('invoiceDiscountType')?.valueChanges.subscribe(() => this.updateInvoiceTotals());
    this.saleForm.get('invoiceDiscountValue')?.valueChanges.subscribe(() => this.updateInvoiceTotals());

    // Initialize with empty sale items array - user will add via modal
    this.saleItemFormsArray.set([]);

    // Initialize with one additional charge (can be empty)
    const chargeForms: FormGroup[] = [];
    const initialChargeForm = this.app.meta.toFormGroup({}, this.additionalChargeModelMeta);
    initialChargeForm.valueChanges.subscribe(() => this.updateInvoiceTotals());
    chargeForms.push(initialChargeForm);
    this.additionalChargeFormsArray.set(chargeForms);

    // update totals for the initial empty state
    this.updateInvoiceTotals();
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
    newForm.valueChanges.subscribe(() => this.updateInvoiceTotals());
    this.saleItemFormsArray.set([...currentForms, newForm]);
    this.updateInvoiceTotals();
  }

  removeSaleItem(index: number) {
    const currentForms = this.saleItemFormsArray();
    if (index < 0 || index >= currentForms.length) return; // guard invalid index

    currentForms.splice(index, 1);
    // allow empty list (remove last item as well)
    this.saleItemFormsArray.set([...currentForms]);
    this.updateInvoiceTotals();
  }

  addAdditionalCharge() {
    const currentForms = this.additionalChargeFormsArray();
    const newForm = this.app.meta.toFormGroup({}, this.additionalChargeModelMeta);
    newForm.valueChanges.subscribe(() => this.updateInvoiceTotals());
    this.additionalChargeFormsArray.set([...currentForms, newForm]);
    this.updateInvoiceTotals();
  }

  removeAdditionalCharge(index: number) {
    const currentForms = this.additionalChargeFormsArray();
    if (currentForms.length > 1) {
      currentForms.splice(index, 1);
      this.additionalChargeFormsArray.set([...currentForms]);
      this.updateInvoiceTotals();
    }
  }

  private async confirmDelete() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('alert.confirm'),
      message: this.translate.instant('alert.are_you_sure_delete'),
      buttons: [
        {
          text: this.translate.instant('button.cancel'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('button.delete'),
          role: 'destructive',
          handler: () => true
        }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role !== 'cancel';
  }

  private updateInvoiceTotals() {
    // Gather sale items from forms
    const items: SaleItem[] = this.saleItemFormsArray().map(f => f.value);

    const invoiceDiscountType = this.saleForm.get('invoiceDiscountType')?.value;
    const invoiceDiscountValue = this.saleForm.get('invoiceDiscountValue')?.value || 0;

    const totals = calculateSaleTotals(items, invoiceDiscountType, invoiceDiscountValue);

    // Include additional charges (if any) in totals
    const charges = this.additionalChargeFormsArray().map(f => f.value);
    const additionalTaxable = charges.reduce((s, c) => s + (c.taxableAmount || c.amount || 0), 0);
    const additionalCgst = charges.reduce((s, c) => s + (c.cgst || 0), 0);
    const additionalSgst = charges.reduce((s, c) => s + (c.sgst || 0), 0);
    const additionalIgst = charges.reduce((s, c) => s + (c.igst || 0), 0);
    const additionalCess = charges.reduce((s, c) => s + (c.cess || 0), 0);
    const additionalTotal = charges.reduce((s, c) => s + (c.totalAmount || c.amount || 0), 0);

    // Adjust totalAmount by subtracting invoice discount amount and adding charges
    const discount = totals.TotalDiscountAmount || 0;
    const totalAmountBefore = (totals.totalAmount || 0) + additionalTotal;
    const totalAmountAfterDiscount = totalAmountBefore - discount;

    const taxableAmount = (totals.taxableAmount || 0) + additionalTaxable;
    const cgst = (totals.cgst || 0) + additionalCgst;
    const sgst = (totals.sgst || 0) + additionalSgst;
    const igst = (totals.igst || 0) + additionalIgst;
    const cess = (totals.cess || 0) + additionalCess;

    const roundOff = Math.round(totalAmountAfterDiscount) - totalAmountAfterDiscount;
    const grandTotal = Math.round(totalAmountAfterDiscount);

    this.saleForm.patchValue({
      subtotal: totals.subtotal || 0,
      TotalDiscountAmount: discount,
      taxableAmount: parseFloat(taxableAmount.toFixed(2)) || 0,
      cgst: parseFloat(cgst.toFixed(2)) || 0,
      sgst: parseFloat(sgst.toFixed(2)) || 0,
      igst: parseFloat(igst.toFixed(2)) || 0,
      cess: parseFloat(cess.toFixed(2)) || 0,
      totalAmount: parseFloat(totalAmountAfterDiscount.toFixed(2)),
      roundOff: parseFloat(roundOff.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2))
    }, { emitEvent: false });
  }

  onSubmit() {
    console.log('Sale Data:', this.saleForm.value);
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
        this.saleService.addSaleAndReturn(saleData).subscribe(sale => {
          // Add sale items
          this.saleItemService.addSaleItemsAndReturn(saleItems, sale!).subscribe();
          // Add additional charges
          this.saleAdditionalChargeService.addAdditionalChargesAndReturn(additionalCharges, sale!).subscribe();
          this.navigateToInvoiceGenerate(sale?.saleId!);
        });

      setTimeout(() => {
        this.isSubmitting.set(false);
      }, 1000);
    }, true);
  }

  private loadBusinessSettings() {
    this.businessSettingsService.getBusinessSettings().subscribe({
      next: (settings) => {
        this.businessSettings.set(settings);
      },
      error: (error) => {
        console.error('Error loading business settings:', error);
      }
    });
  }

  private loadNextInvoiceNumber() {
    this.invoiceNumberService.getNextInvoiceNumberPreview().subscribe({
      next: (invoiceNumber) => {
        // If form already exists, set the invoice number into the form so UI shows it
        if (this.saleForm) {
          this.saleForm.get('invoiceNumber')?.setValue(invoiceNumber);
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading invoice number:', error);
      }
    });
  }

  async navigateToInvoiceGenerate(saleId : string) {
    const modal = await this.modalCtrl.create({
      component: InvoiceGenerateComponent,
      cssClass: 'full-screen-modal',
      componentProps: {
        openedAsModal: true,
        saleId: saleId
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.saved) {
      // Reload business settings after saving
      this.loadBusinessSettings();
    }
  }

  async navigateToBusinessInfo() {
    const modal = await this.modalCtrl.create({
      component: BusinessInfoComponent,
      cssClass: 'full-screen-modal',
      componentProps: {}
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.saved) {
      // Reload business settings after saving
      this.loadBusinessSettings();
    }
  }

  async navigateToSelectTemplate() {
    const modal = await this.modalCtrl.create({
      component: TemplatesComponent,
      cssClass: 'full-screen-modal',
      componentProps: {
        openedAsModal: true
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.saved) {
      // Reload business settings after saving
      // this.loadBusinessSettings();
    }
  }

  async navigateToAddCustomer() {
    const modal = await this.modalCtrl.create({
      component: CustomersComponent,
      cssClass: 'full-screen-modal',
      componentProps: {
        openedAsModal: true
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss<Customer>();
    if (data) {
      const customer = data as Customer;
      this.selectedCustomer.set(customer);
      this.saleForm.patchValue({
        customerId: customer.customerId,
        customerName: customer.customerName,
        customerGstin: customer.gstin
      });
      this.saleForm.get('customerId')?.markAsTouched();
    }
  }

  async navigateToAddProduct() {
    // Step 1: Open products list modal to select product
    const productsModal = await this.modalCtrl.create({
      component: ProductsComponent,
      cssClass: 'full-screen-modal',
      componentProps: {
        openedAsModal: true
      }
    });

    await productsModal.present();
    const { data: selectedProduct } = await productsModal.onWillDismiss();

    if (selectedProduct) {
      console.log("Selected Product", selectedProduct);

      // Step 2: Open item detail modal to edit quantity, price, etc.
      const itemDetailModal = await this.modalCtrl.create({
        component: SaleItemDetailComponent,
        cssClass: 'full-screen-modal',
        componentProps: {
          product: selectedProduct
        }
      });

      await itemDetailModal.present();
      const { data: itemData } = await itemDetailModal.onWillDismiss();

      if (itemData) {
        console.log("Item Data to Add", itemData);
        // Add the customized item to sale
        this.addSaleItemFromData(itemData);
      } else {
        this.navigateToAddProduct();
      }
    }
  }

  private addSaleItemFromData(itemData: SaleItem) {
    const currentForms = this.saleItemFormsArray();
    const newForm = this.app.meta.toFormGroup(itemData, this.saleItemModelMeta);
    // listen to individual item changes so totals update live
    newForm.valueChanges.subscribe(() => this.updateInvoiceTotals());
    this.saleItemFormsArray.set([...currentForms, newForm]);
    this.updateInvoiceTotals();
  }

  async presentItemActionSheet(event: Event, itemForm: FormGroup) {
    event.stopPropagation();
    const index = this.saleItemForms().indexOf(itemForm as any);
    if (index === -1) return;

    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.instant('button.actions'),
      buttons: [
        {
          text: this.translate.instant('button.edit'),
          icon: 'pencil',
          handler: async () => {
            await this.editSaleItem(index);
          }
        },
        {
          text: this.translate.instant('button.delete'),
          role: 'destructive',
          icon: 'trash',
          handler: async () => {
            const confirmed = await this.confirmDelete();
            if (confirmed) this.removeSaleItem(index);
          }
        },
        {
          text: this.translate.instant('button.cancel'),
          role: 'cancel',
          icon: 'close'
        }
      ]
    });

    await actionSheet.present();

  }

  async editSaleItem(index: number) {
    const itemForms = this.saleItemFormsArray();
    const current = itemForms[index];
    if (!current) return;

    const itemData = current.value;
    const modal = await this.modalCtrl.create({
      component: SaleItemDetailComponent,
      componentProps: { saleItem: itemData }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      // Patch updated values into existing form
      current.patchValue(data);
      // re-set the array to trigger reactive updates if needed
      this.saleItemFormsArray.set([...itemForms]);
      this.updateInvoiceTotals();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

