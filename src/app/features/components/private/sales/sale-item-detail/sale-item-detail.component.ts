import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalController, IonHeader, IonContent, IonButton, IonToolbar, IonButtons, IonTitle, IonFooter, IonIcon, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/angular/standalone";
import { AppService } from '@app/core/app.service';
import { ModelMeta } from '@app/shared-services';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { InputComponent } from '@app/shared/input/input.component';
import { SelectComponent } from '@app/shared/select/select.component';
import { TranslateModule } from '@ngx-translate/core';
import { getSaleItemMeta, Product, SaleItem } from '@app/features/models';
import { addIcons } from 'ionicons';
import { add, close } from 'ionicons/icons';

@Component({
    selector: 'app-sale-item-detail',
    templateUrl: './sale-item-detail.component.html',
    styleUrls: ['./sale-item-detail.component.scss'],
    standalone: true,
    imports: [IonCardContent, IonCardTitle, IonCardHeader, IonCard, 
        IonSpinner, IonIcon, IonTitle, IonButtons, IonFooter, IonContent, IonHeader, IonButton, IonToolbar,
        CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, TranslateModule
    ]
})
export class SaleItemDetailComponent implements OnInit {
    private app = inject(AppService);
    private modalCtrl = inject(ModalController);

    @Input() productData!: Product; // Product selected from the list

    form!: FormGroup;
    formMeta = new FormMeta();
    modelMeta!: ModelMeta[];
    unitMeta?: ModelMeta;
    taxTypeMeta!: ModelMeta;
    discountTypeMeta!: ModelMeta;
    isSubmitting = signal<boolean>(false);


    constructor() {
        addIcons({ add, close });
    }

    ngOnInit() {
        this.modelMeta = getSaleItemMeta();

        // Initialize all metadata for selects - filter for the correct controlType
        this.unitMeta = this.modelMeta.find(m => m.key === 'unit')!;
        this.taxTypeMeta = this.modelMeta.find(m => m.key === 'taxType')!;
        this.discountTypeMeta = this.modelMeta.find(m => m.key === 'discountType')!;

        // Pre-fill form with product data
        const itemData = {
            productId: this.productData?.productId,
            productName: this.productData?.productName,
            hsnCode: this.productData?.hsnCode,
            quantity: 1, // Default quantity
            unit: this.productData?.unitMeasure,
            pricePerUnit: this.productData?.mrp,
            taxType: this.productData?.saleTaxType || 'INCLUSIVE',
            gstRate: this.productData?.saleGstRate || 0,
            cessRate: this.productData?.saleCessRate || 0,
            discountType: 'PERCENTAGE',
            discountValue: 0
        };
        this.form = this.app.meta.toFormGroup(itemData, this.modelMeta);

        // Initial calculation
        this.updateCalculatedFields();
        // Subscribe to form changes for live calculation
        this.form.valueChanges.subscribe(() => this.updateCalculatedFields());
    }

    updateCalculatedFields() {
        this.calculateItemAmounts(this.form.value);
    }

    onSubmit() {
        console.log("saving sale items", this.form.value)
        FormHelper.submit(this.form, this.formMeta, () => {
            this.isSubmitting.set(true);
            const formValue = this.form.value;
            // const calculatedData = this.calculateItemAmounts(formValue);
            this.modalCtrl.dismiss(formValue);
        }, true);
    }

    private calculateItemAmounts(itemData: SaleItem) {
        const quantity = itemData.quantity || 0;
        const pricePerUnit = itemData.pricePerUnit || 0;
        const discountType = itemData.discountType || 'PERCENTAGE';
        const discountValue = itemData.discountValue || 0;
        const taxType = itemData.taxType || 'INCLUSIVE';
        const gstRate = itemData.gstRate || 0;
        const cessRate = itemData.cessRate || 0;

        // Calculate base amount
        const baseAmount = quantity * pricePerUnit;

        // Calculate discount amount
        let discountAmount = 0;
        if (discountType === 'PERCENTAGE') {
            discountAmount = (baseAmount * discountValue) / 100;
        } else {
            discountAmount = discountValue;
        }

        // Amount after discount
        const amountAfterDiscount = baseAmount - discountAmount;

        // Calculate taxable amount and GST based on tax type
        let taxableAmount = 0;
        let gstAmount = 0;
        let totalAmount = 0;

        if (taxType === 'INCLUSIVE') {
            // GST is included in the price
            totalAmount = amountAfterDiscount;
            taxableAmount = totalAmount / (1 + (gstRate / 100));
            gstAmount = totalAmount - taxableAmount;
        } else {
            // GST is exclusive
            taxableAmount = amountAfterDiscount;
            gstAmount = (taxableAmount * gstRate) / 100;
            totalAmount = taxableAmount + gstAmount;
        }

        // Calculate CESS
        const cessAmount = (taxableAmount * cessRate) / 100;
        totalAmount += cessAmount;

        // Split GST into CGST/SGST (assuming intra-state for now)
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;
        const igst = 0; // Would be gstAmount for inter-state

        // Patch calculated values into the form
        this.form.patchValue({
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            taxableAmount: parseFloat(taxableAmount.toFixed(2)),
            cgst: parseFloat(cgst.toFixed(2)),
            sgst: parseFloat(sgst.toFixed(2)),
            igst: parseFloat(igst.toFixed(2)),
            cess: parseFloat(cessAmount.toFixed(2)),
            totalAmount: parseFloat(totalAmount.toFixed(2))
        }, { emitEvent: false });
        // No return needed
    }

    closeModal() {
        this.modalCtrl.dismiss();
    }
}
