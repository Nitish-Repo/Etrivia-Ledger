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

@Component({
  selector: 'app-invoice-generate',
  templateUrl: './invoice-generate.component.html',
  styleUrls: ['./invoice-generate.component.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonChip, IonFooter, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, CommonModule, TranslateModule]
})
export class InvoiceGenerateComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private saleService = inject(SaleService);
  private saleItemService = inject(SaleItemService);
  private saleAdditionalChargeService = inject(SaleAdditionalChargeService);
  private businessService = inject(BusinessSettingsService);
  private templateService = inject(TemplateService);
  private invoiceService = inject(InvoiceService);
  private pdfService = inject(PdfService);
  private sanitizer = inject(DomSanitizer);
  private actionSheetCtrl = inject(ActionSheetController);
  private translate = inject(TranslateService);
  private customerService = inject(CustomerService);

  // openedAsModal = input<boolean>(false);
  @Input() openedAsModal = false;
  @Input() saleId!: string;

  sale = signal<Sale | null>(null);
  saleItems = signal<SaleItem[]>([]);
  saleAdditionalCharges = signal<AdditionalCharge[]>([]);

  currentTemplate = signal<TemplateMetadata | null>(null);
  renderedHtml = signal<SafeHtml>('');
  loading = signal(true);
  generating = signal(false);
  renderingPng = signal(false);
  pngPreview = signal<string | null>(null);
  error = signal<string | null>(null);

  private invoice: Invoice | null = null;
  @ViewChild('previewContent') previewContent!: ElementRef<HTMLElement>;


  constructor() {
    addIcons({ close, paperPlaneOutline, downloadOutline, printOutline, createOutline, ellipsisHorizontalOutline, personOutline, documentTextOutline, imageOutline });
  }

  ngOnInit() {
    this.saleService.getSaleById(this.saleId).subscribe((sale) => {
      this.getRequireData(sale!);
    })
  }

  getRequireData(sale: Sale) {
    forkJoin([
      this.saleService.getSaleById(sale.saleId!),
      this.saleItemService.getSaleItemsBySaleId(sale.saleId!),
      this.saleAdditionalChargeService.getAdditionalChargeBySaleId(sale.saleId!),
      this.businessService.getBusinessSettings(),
      this.customerService.getCustomerById(sale.customerId)
    ]).subscribe({
      next: ([sale, saleItems, saleAdditionalCharges, businessSetting, customer]) => {
        this.sale.set(sale);
        this.saleItems.set(saleItems);
        this.saleAdditionalCharges.set(saleAdditionalCharges);
        if (businessSetting?.templateId) {
            this.loadTemplateAndInvoice(businessSetting.templateId, sale!, saleItems, saleAdditionalCharges, businessSetting ?? undefined, customer ?? undefined)
          } else {
            this.loadTemplateAndInvoice(undefined, sale!, saleItems, saleAdditionalCharges, businessSetting ?? undefined, customer ?? undefined);
          }

        console.log("Sale", this.sale());
        console.log("saleItems", this.saleItems());
        console.log("saleAdditionalCharges", this.saleAdditionalCharges());
      },
      error: (err: any) => {
        this.error.set(err?.message || 'Failed to load templates');
        this.loading.set(false);
      }
    });

  }


  loadTemplateAndInvoice(templateId?: string, sale?: Sale, saleItems?: SaleItem[], saleAdditionalCharges?: AdditionalCharge[], businessSetting?: BusinessSettings, customer?: Customer) {
    this.loading.set(true);
    this.error.set(null);

    // Load template metadata (with fallback) and generate invoice data
    forkJoin({
      template: this.templateService.getTemplateMetadataWithFallback(templateId),
      invoice: new Promise<Invoice>(resolve => {
        if (sale && saleItems) {
          resolve(this.invoiceService.generateInvoiceFromSale(sale, saleItems, saleAdditionalCharges || [], businessSetting, customer));
        } else {
          resolve(this.invoiceService.generateMockInvoice());
        }
      })
    }).subscribe({
      next: ({ template, invoice }) => {

        if (!template) {
          this.error.set('Template not found');
          this.loading.set(false);
          return;
        }

        this.currentTemplate.set(template);
        this.invoice = invoice;

        // Load and render the template
        this.templateService.getAndRenderTemplate(template.filename, invoice).subscribe({
          next: (html) => {
            this.renderedHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Failed to render template: ' + err.message);
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        this.error.set('Failed to load data: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  async downloadPdf() {
    if (!this.previewContent || !this.currentTemplate() || !this.invoice) {
      return;
    }

    this.generating.set(true);

    try {
      const element = this.previewContent.nativeElement;
      const filename = `invoice-${this.invoice.invoiceNumber}-${this.currentTemplate()!.templateId}.pdf`;

      // await this.pdfService.generatePdf(element, filename);
      // element is the preview container (@ViewChild('previewContent').nativeElement)
      await this.pdfService.generatePdf(element, filename, { useA4: true, scale: 2 });

      this.generating.set(false);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
      this.generating.set(false);
    }
  }


  selectTemplate(template: TemplateMetadata) {
    // this.router.navigate(['/preview', template.id]);
  }

  closeModal() {
    this.modalCtrl.dismiss();
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
          handler: () => this.downloadPng()
        },
        {
          text: "Download As Pdf",
          icon: 'document-text-outline',
          handler: () => this.downloadPdf()
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

  downloadPng() { }


}
