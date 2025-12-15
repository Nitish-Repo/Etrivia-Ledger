import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppService } from '@app/core/app.service';
import { Supplier } from '@app/features/models';
import { SupplierService } from '@app/features/services/supplier.service';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import {
  InfiniteScrollCustomEvent,
  IonHeader, IonContent, IonButton, IonToolbar, IonSearchbar, IonFab, IonFabButton, ActionSheetController,
  IonIcon, IonList, IonLabel, IonItem, IonText, IonNote, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { add, ellipsisVertical, chevronForward, pencil, heart, eyeOff, trash, close, cube, heartDislike, eye, personOutline } from 'ionicons/icons';


@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss'],
  standalone: true,
  imports: [IonInfiniteScrollContent, IonInfiniteScroll, IonNote, IonItem, IonLabel, IonList, IonIcon, IonFabButton,
    IonFab, IonSearchbar, IonToolbar, IonButton, IonContent, IonHeader, IonBadge, CommonModule,
    ToolbarPage, RouterModule]
})
export class SuppliersComponent implements OnInit {
  private app = inject(AppService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(SupplierService);
  private actionSheetCtrl = inject(ActionSheetController);

  suppliers = signal<Supplier[]>([]);
  searchQuery = signal<string>('');

  page = signal(0);
  limit = 20;
  loading = signal(false);
  noMoreData = signal(false);


  results = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allSuppliers = this.suppliers();

    // Filter by search query
    let filtered = query
      ? allSuppliers.filter(supplier => supplier.supplierName.toLowerCase().includes(query))
      : allSuppliers;

    // Sort suppliers
    return filtered;
    // return this.sortSuppliers(filtered);
  });

  constructor() {
    addIcons({ personOutline, ellipsisVertical, chevronForward, add, pencil, heart, eyeOff, trash, close, cube, heartDislike, eye });
  }

  ngOnInit() {
    // Data loading handled by ionViewWillEnter
  }

  ionViewWillEnter() {
    this.loadSuppliers(true); // Reset on each view enter to avoid duplicates
  }

  loadSuppliers(reset = false) {
    if (this.loading()) return;

    this.loading.set(true);

    if (reset) {
      this.page.set(0);
      this.suppliers.set([]);
      this.noMoreData.set(false);
    }

    this.service.getSupplierPaginated(
      this.page(),
      this.limit,
      this.searchQuery()
    ).subscribe(data => {
      if (data.length < this.limit) this.noMoreData.set(true);

      // Append new suppliers
      this.suppliers.set([...this.suppliers(), ...data]);

      this.loading.set(false);
    });
  }


  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const value = target.value || '';

    this.searchQuery.set(value);

    // Reload from page 0
    this.loadSuppliers(true);
  }


  // private sortSuppliers(suppliers: Suppliers[]): Customer[] {
  //   return suppliers.sort((a, b) => {
  //     // First priority: Favourites (1 = favourite, 0 = not favourite)
  //     const favDiff = (b.isfavourite ? 1 : 0) - (a.isfavourite ? 1 : 0);
  //     if (favDiff !== 0) return favDiff;

  //     // Second priority: Active status (1 = active, 0 = inactive)
  //     const activeDiff = (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
  //     return activeDiff;
  //   });
  // }

  updateSupplier(supplier: Supplier) {
    this.router.navigate([`./${supplier.supplierId}`], { relativeTo: this.route, })
  }

  async presentActionSheet(event: Event, supplier: Supplier) {
    event.stopPropagation();
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Supplier Actions',
      buttons: [
        {
          text: 'Edit Supplier',
          icon: 'pencil',
          handler: () => this.updateSupplier(supplier)
        },
        // {
        //   text: supplier.isfavourite ? 'Remove from Favourite' : 'Mark as Favourite',
        //   icon: supplier.isfavourite ? 'heart-dislike' : 'heart',
        //   handler: () => this.toggleFavourite(supplier)
        // },
        {
          text: supplier.isActive ? 'Mark as Inactive' : 'Mark as Active',
          icon: supplier.isActive ? 'eye-off' : 'eye',
          handler: () => this.toggleActive(supplier)
        },
        {
          text: 'Delete Customer',
          role: 'destructive',
          icon: 'trash',
          handler: () => this.deleteSupplier(supplier)
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close'
        },
      ],
    });

    await actionSheet.present();

  }

  deleteSupplier(supplier: Supplier) {
    this.service.deleteSupplierAndReturn(supplier.supplierId!).subscribe((deletedSupplier) => {
      console.log(deletedSupplier);
      if (deletedSupplier) {
        const updatedSuppliers = this.suppliers().filter(s => s.supplierId !== deletedSupplier.supplierId);
        this.suppliers.set(updatedSuppliers);
        this.app.noty.presentToast(`Supplier has been deleted.`, 3000, 'top', 'success');
      };

    });
  }

  // toggleFavourite(customer: Customer) {
  //   customer.isfavourite = !customer.isfavourite;
  //   this.service.updateCustomerAndReturn(customer).subscribe((updatedCustomer) => {
  //     if (updatedCustomer) {
  //       const updatedProducts = this.customers().map(p =>
  //         p.customerId === updatedCustomer.customerId ? updatedCustomer : p
  //       );
  //       this.customers.set(updatedProducts);
  //       this.app.noty.presentToast(`Customer has been updated.`, 3000, 'top', 'success');
  //     }
  //   });
  // }

  toggleActive(supplier: Supplier) {
    supplier.isActive = !supplier.isActive;
    this.service.updateSupplierAndReturn(supplier).subscribe((updatedSupplier) => {
      if (updatedSupplier) {
        const updatedSuppliers = this.suppliers().map(s =>
          s.supplierId === updatedSupplier.supplierId ? updatedSupplier : s
        );
        this.suppliers.set(updatedSuppliers);
        this.app.noty.presentToast(`Supplier has been updated.`, 3000, 'top', 'success');
      }
    });
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    if (this.noMoreData()) {
      event.target.complete();
      return;
    }

    this.page.update(p => p + 1);

    this.loadSuppliers();

    setTimeout(() => {
      event.target.complete();
    }, 300);
  }

}
