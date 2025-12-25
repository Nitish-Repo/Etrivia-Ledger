import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalController, IonHeader, IonContent, IonButton, IonToolbar, IonButtons, IonTitle, IonFooter, IonIcon, IonSpinner } from "@ionic/angular/standalone";
import { AppService } from '@app/core/app.service';
import { ModelMeta } from '@app/shared-services';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { InputComponent } from '@app/shared/input/input.component';
import { SelectComponent } from '@app/shared/select/select.component';
import { TranslateModule } from '@ngx-translate/core';
import { getSaleItemMeta, Product } from '@app/features/models';
import { addIcons } from 'ionicons';
import { add, close } from 'ionicons/icons';

@Component({
    selector: 'app-sale-item-detail',
    templateUrl: './sale-item-detail.component.html',
    styleUrls: ['./sale-item-detail.component.scss'],
    standalone: true,
    imports: [
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
    }

    onSubmit() {
        FormHelper.submit(this.form, this.formMeta, () => {
            this.isSubmitting.set(true);
            // Return the form data to parent
            setTimeout(() => {
                this.modalCtrl.dismiss(this.form.value);
            }, 100);
        }, true);
    }

    closeModal() {
        this.modalCtrl.dismiss();
    }
}
