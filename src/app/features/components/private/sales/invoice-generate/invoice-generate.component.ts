import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { AdditionalCharge, Sale, SaleItem } from '@app/features/models';
import { SaleAdditionalChargeService } from '@app/features/services/sale-additional-charge.service';
import { SaleItemService } from '@app/features/services/sale-item.service';
import { SaleService } from '@app/features/services/sale.service';
import {
  ModalController,
  IonHeader, IonContent, IonButton, IonToolbar, IonIcon, IonButtons, IonTitle
} from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { personOutline, close } from 'ionicons/icons';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-invoice-generate',
  templateUrl: './invoice-generate.component.html',
  styleUrls: ['./invoice-generate.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, CommonModule, TranslateModule]
})
export class InvoiceGenerateComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private saleService = inject(SaleService);
  private saleItemService = inject(SaleItemService);
  private saleAdditionalChargeService = inject(SaleAdditionalChargeService);


  // openedAsModal = input<boolean>(false);
  @Input() openedAsModal = false;
  @Input() saleId!: string;

  sale = signal<Sale | null>(null);
  saleItems = signal<SaleItem[]>([]);
  saleAdditionalCharges = signal<AdditionalCharge[]>([]);


  constructor() {
    addIcons({ close, personOutline });
  }

  ngOnInit() {
    this.getRequireData(this.saleId);
  }

  getRequireData(saleId: string) {
    forkJoin([
      this.saleService.getSaleById(saleId),
      this.saleItemService.getSaleItemsBySaleId(saleId),
      this.saleAdditionalChargeService.getAdditionalChargeBySaleId(saleId)
    ]).subscribe(([sale, saleItems, saleAdditionalCharges]) => {
      this.sale.set(sale);
      this.saleItems.set(saleItems);
      this.saleAdditionalCharges.set(saleAdditionalCharges);
      console.log("Sale",this.sale());
      console.log("saleItems",this.saleItems());
      console.log("saleAdditionalCharges",this.saleAdditionalCharges());
    });
    
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
