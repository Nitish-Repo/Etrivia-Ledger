import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AppService } from '@app/core/app.service';
import { Sale } from '@app/features/models';
import { SaleService } from '@app/features/services/sale.service';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import {
  InfiniteScrollCustomEvent, ModalController,
  IonHeader, IonContent, IonButton, IonToolbar, IonSearchbar, IonFab, IonFabButton, ActionSheetController,
  IonIcon, IonList, IonLabel, IonItem, IonText, IonNote, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent, IonButtons, IonTitle
} from "@ionic/angular/standalone";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { add, ellipsisVertical, chevronForward, trash, close, receiptOutline, printOutline, pencil, print } from 'ionicons/icons';
import { SellComponent } from './sell/sell.component';
import { AlertController } from '@ionic/angular/standalone';
import { InvoiceGenerateComponent } from './invoice-generate/invoice-generate.component';
import { GenerateInvoiceComponent } from './generate-invoice/generate-invoice.component';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonContent, IonSearchbar, IonList, IonItem, IonLabel, IonNote, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent, IonFab, IonFabButton, CommonModule, ToolbarPage, RouterModule, TranslateModule, IonButtons]
})
export class SalesComponent implements OnInit {
  private app = inject(AppService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(SaleService);
  private actionSheetCtrl = inject(ActionSheetController);
  private translate = inject(TranslateService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  @Input() openedAsModal = false;

  sales = signal<Sale[]>([]);
  searchQuery = signal<string>('');

  page = signal(0);
  limit = 20;
  loading = signal(false);
  noMoreData = signal(false);

  results = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const all = this.sales();

    if (!query) return all;

    return all.filter(s => (s.invoiceNumber || '').toLowerCase().includes(query) || (s.customerName || '').toLowerCase().includes(query));
  });

  constructor() {
    addIcons({ receiptOutline, ellipsisVertical, chevronForward, add, trash, close, pencil, print});
  }

  ngOnInit() {
    // handled by ionViewWillEnter
  }

  ionViewWillEnter() {
    this.loadSales(true);
  }

  loadSales(reset = false) {
    if (this.loading()) return;

    this.loading.set(true);

    if (reset) {
      this.page.set(0);
      this.sales.set([]);
      this.noMoreData.set(false);
    }

    this.service.getSalePaginated(this.page(), this.limit, this.searchQuery()).subscribe(data => {
      if (data.length < this.limit) this.noMoreData.set(true);
      this.sales.set([...this.sales(), ...data]);
      this.loading.set(false);
    });
  }

  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const value = target.value || '';
    this.searchQuery.set(value);
    this.loadSales(true);
  }

  updateSale(sale: Sale) {
    if (this.openedAsModal) {
      this.modalCtrl.dismiss(sale);
    } else {
      this.router.navigate([`./${sale.saleId}`], { relativeTo: this.route });
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  addNewSale() {
    if (this.openedAsModal) {
      this.navigateToAddSale();
    } else {
      this.router.navigate(['./new'], { relativeTo: this.route });
    }
  }

  async navigateToAddSale() {
    const modal = await this.modalCtrl.create({
      component: SellComponent,
      componentProps: { openedAsModal: true },
      cssClass: 'sales-fullscreen-modal',
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) this.loadSales(true);
  }

  async presentActionSheet(event: Event, sale: Sale) {
    event.stopPropagation();
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.instant('button.actions'),
      buttons: [
        {
          text: this.translate.instant('button.edit'),
          icon: 'pencil',
          handler: () => this.updateSale(sale)
        },
        {
          text: this.translate.instant('button.print'),
          icon: 'print',
          handler: () => this.printInvoice(sale)
        },
        {
          text: this.translate.instant('button.delete'),
          role: 'destructive',
          icon: 'trash',
          handler: () => this.confirmDeleteSale(sale)
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

  private async confirmDeleteSale(sale: Sale) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('alert.confirm'),
      message: this.translate.instant('alert.are_you_sure_delete'),
      buttons: [
        { text: this.translate.instant('button.cancel'), role: 'cancel' },
        { text: this.translate.instant('button.delete'), role: 'destructive', handler: () => this.deleteSale(sale) }
      ]
    });

    await alert.present();
  }

  private deleteSale(sale: Sale) {
    this.service.deleteSaleAndReturn(sale.saleId!).subscribe((deletedSale) => {
      if (deletedSale) {
        const updated = this.sales().filter(s => s.saleId !== deletedSale.saleId);
        this.sales.set(updated);
        this.app.noty.presentToast(`Sale has been deleted.`, 3000, 'top', 'success');
      }
    });
  }

  private toggleStatus(sale: Sale) {
    const newStatus = sale.status === 'COMPLETED' ? 'DRAFT' : 'COMPLETED';
    sale.status = newStatus as any;

    this.service.updateSaleAndReturn(sale).subscribe((updated) => {
      if (updated) {
        const updatedList = this.sales().map(s => s.saleId === updated.saleId ? updated : s);
        this.sales.set(updatedList);
        this.app.noty.presentToast(`Sale status updated.`, 3000, 'top', 'success');
      }
    });
  }

  private async printInvoice(sale: Sale) {
    const modal = await this.modalCtrl.create({
      component: GenerateInvoiceComponent,
      componentProps: { openedAsModal: true, saleId: sale.saleId },
      cssClass: 'full-screen-modal',
      // breakpoints: [0, 1],
      // initialBreakpoint: 1
    });

    await modal.present();
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    if (this.noMoreData()) {
      event.target.complete();
      return;
    }

    this.page.update(p => p + 1);
    this.loadSales();

    setTimeout(() => {
      event.target.complete();
    }, 300);
  }

}

