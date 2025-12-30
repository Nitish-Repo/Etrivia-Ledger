import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, OnInit, signal, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InvoiceService } from '@app/core/template-services/invoice.service';
import { PdfService } from '@app/core/template-services/pdf.service';
import { TemplateService } from '@app/core/template-services/template.service';
import { AdditionalCharge, BusinessSettings, Customer, Sale, SaleItem } from '@app/features/models';
import { BusinessSettingsService } from '@app/features/services/business-settings';
import { CustomerService } from '@app/features/services/customer.service';
import { SaleAdditionalChargeService } from '@app/features/services/sale-additional-charge.service';
import { SaleItemService } from '@app/features/services/sale-item.service';
import { SaleService } from '@app/features/services/sale.service';
import { Invoice, TemplateMetadata } from '@app/models/invoice.model';
import {
  ModalController, ActionSheetController,
  IonHeader, IonContent, IonButton, IonToolbar, IonIcon, IonButtons, IonTitle, IonFooter, IonChip, IonLabel, IonItem
} from "@ionic/angular/standalone";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { personOutline, close, paperPlaneOutline, downloadOutline, printOutline, createOutline, ellipsisHorizontalOutline, documentTextOutline, imageOutline } from 'ionicons/icons';
import { forkJoin, firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';


@Component({
  selector: 'app-generate-invoice',
  templateUrl: './generate-invoice.component.html',
  styleUrls: ['./generate-invoice.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, CommonModule, TranslateModule, IonContent, IonFooter, IonItem, IonLabel, IonChip]
})
export class GenerateInvoiceComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private saleService = inject(SaleService);
  private invoiceService = inject(InvoiceService);
  private actionSheetCtrl = inject(ActionSheetController);
  private translate = inject(TranslateService);

  // openedAsModal = input<boolean>(false);
  @Input() openedAsModal = false;
  @Input() saleId!: string;

  sale = signal<Sale | null>(null);
  renderingPng = signal(false);
  pngPreview = signal<string | null>(null);
  loading = signal(true);
  generating = signal(false);

  constructor() {
    addIcons({ close, paperPlaneOutline, downloadOutline, printOutline, createOutline, ellipsisHorizontalOutline, personOutline, documentTextOutline, imageOutline });
  }

  ngOnInit() {
    this.saleService.getSaleById(this.saleId).subscribe((sale) => {
      if (sale) {
        this.sale.set(sale);
        this.getPngPreview(sale);
      }
    })
  }

  async getPngPreview(sale: Sale) {
    this.renderingPng.set(true);
    try {
      const dataUrl = await this.invoiceService.getPngPreview(sale, { format: 'jpeg', quality: 1.85, scale: 2 });
      this.pngPreview.set(dataUrl);
    } catch (err) {
      console.error('PNG preview error:', err);
    } finally {
      this.renderingPng.set(false);
    }
  }

  async presentActionDownloadSheet(event: Event) {
    event.stopPropagation();
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.instant('button.actions'),
      buttons: [
        // {
        //   text: this.translate.instant('page.customers.edit'),
        //   icon: 'pencil',
        //   handler: () => this.updateCustomer(customer)
        // },
        {
          text: "Download As Picture",
          icon: 'image-outline',
          handler: () => this.downloadImage(this.sale()!)
        },
        {
          text: "Download As Pdf",
          icon: 'document-text-outline',
          handler: () => this.downloadPdf(this.sale()!)
        },

        {
          text: this.translate.instant('button.cancel'),
          role: 'cancel',
          icon: 'close'
        },
      ],
    });

    await actionSheet.present();

  }

  downloadImage(sale: Sale) {
    this.invoiceService.generateImageandSave(sale);
  }

  downloadPdf(sale: Sale) {
    this.invoiceService.generatePdfandSave(sale);
  }

  sendInvoice(sale: Sale) {
    this.invoiceService.savePdfandShare(sale);
  }




  closeModal() {
    this.modalCtrl.dismiss();
  }

}
