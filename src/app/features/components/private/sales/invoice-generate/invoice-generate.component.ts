import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { TemplateService } from '@app/core/template-services/template.service';
import { AdditionalCharge, Sale, SaleItem } from '@app/features/models';
import { SaleAdditionalChargeService } from '@app/features/services/sale-additional-charge.service';
import { SaleItemService } from '@app/features/services/sale-item.service';
import { SaleService } from '@app/features/services/sale.service';
import { TemplateMetadata } from '@app/models/invoice.model';
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
  private templateService = inject(TemplateService);


  // openedAsModal = input<boolean>(false);
  @Input() openedAsModal = false;
  @Input() saleId!: string;

  sale = signal<Sale | null>(null);
  saleItems = signal<SaleItem[]>([]);
  saleAdditionalCharges = signal<AdditionalCharge[]>([]);

  templates = signal<TemplateMetadata[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);


  constructor() {
    addIcons({ close, personOutline });
  }

  ngOnInit() {
    this.getRequireData(this.saleId);
    this.loadTemplates();
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

  loadTemplates() {
    this.loading.set(true);
    this.error.set(null);
    
    this.templateService.getTemplates().subscribe({
      next: (templates) => {
        this.templates.set(templates);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load templates');
        this.loading.set(false);
      }
    });
  }

  selectTemplate(template: TemplateMetadata) {
    // this.router.navigate(['/preview', template.id]);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
