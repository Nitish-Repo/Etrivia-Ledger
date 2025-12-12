import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppService } from '@app/core/app.service';
import { Customer } from '@app/features/models';
import { CustomerService } from '@app/features/services/customer.service';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import {
  InfiniteScrollCustomEvent,
  IonHeader, IonContent, IonButton, IonToolbar, IonSearchbar, IonFab, IonFabButton, ActionSheetController,
  IonIcon, IonList, IonLabel, IonItem, IonText, IonNote, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { add, ellipsisVertical, chevronForward, pencil, heart, eyeOff, trash, close, cube, heartDislike, eye, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  standalone: true,
  imports: [IonInfiniteScrollContent, IonInfiniteScroll, IonNote, IonText, IonItem, IonLabel, IonList, IonIcon, IonFabButton,
    IonFab, IonSearchbar, IonToolbar, IonButton, IonContent, IonHeader, IonBadge, CommonModule,
    ToolbarPage, RouterModule]
})
export class CustomersComponent implements OnInit {
  private app = inject(AppService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(CustomerService);
  private actionSheetCtrl = inject(ActionSheetController);

  customers = signal<Customer[]>([]);
  searchQuery = signal<string>('');

  page = signal(0);
  limit = 20;
  loading = signal(false);
  noMoreData = signal(false);


  results = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allProducts = this.customers();

    // Filter by search query
    let filtered = query
      ? allProducts.filter(product => product.customerName.toLowerCase().includes(query))
      : allProducts;

    // Sort products
    return filtered;
    // return this.sortCustomers(filtered);
  });

  constructor() {
    addIcons({ personOutline, ellipsisVertical, chevronForward, add, pencil, heart, eyeOff, trash, close, cube, heartDislike, eye });
  }

  ngOnInit() {
    // Data loading handled by ionViewWillEnter
  }

  ionViewWillEnter() {
    this.loadProducts(true); // Reset on each view enter to avoid duplicates
  }

  loadProducts(reset = false) {
    if (this.loading()) return;

    this.loading.set(true);

    if (reset) {
      this.page.set(0);
      this.customers.set([]);
      this.noMoreData.set(false);
    }

    this.service.getCustomersPaginated(
      this.page(),
      this.limit,
      this.searchQuery()
    ).subscribe(data => {
      if (data.length < this.limit) this.noMoreData.set(true);

      // Append new products
      this.customers.set([...this.customers(), ...data]);

      this.loading.set(false);
    });
  }


  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const value = target.value || '';

    this.searchQuery.set(value);

    // Reload from page 0
    this.loadProducts(true);
  }


  // private sortCustomers(customers: Customer[]): Customer[] {
  //   return customers.sort((a, b) => {
  //     // First priority: Favourites (1 = favourite, 0 = not favourite)
  //     const favDiff = (b.isfavourite ? 1 : 0) - (a.isfavourite ? 1 : 0);
  //     if (favDiff !== 0) return favDiff;

  //     // Second priority: Active status (1 = active, 0 = inactive)
  //     const activeDiff = (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
  //     return activeDiff;
  //   });
  // }

  updateCustomer(customer: Customer) {
    this.router.navigate([`./${customer.customerId}`], { relativeTo: this.route, })
  }

  async presentActionSheet(event: Event, customer: Customer) {
    event.stopPropagation();
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Customer Actions',
      buttons: [
        {
          text: 'Edit Customer',
          icon: 'pencil',
          handler: () => this.updateCustomer(customer)
        },
        // {
        //   text: customer.isfavourite ? 'Remove from Favourite' : 'Mark as Favourite',
        //   icon: customer.isfavourite ? 'heart-dislike' : 'heart',
        //   handler: () => this.toggleFavourite(customer)
        // },
        {
          text: customer.isActive ? 'Mark as Inactive' : 'Mark as Active',
          icon: customer.isActive ? 'eye-off' : 'eye',
          handler: () => this.toggleActive(customer)
        },
        {
          text: 'Delete Customer',
          role: 'destructive',
          icon: 'trash',
          handler: () => this.deleteCustomer(customer)
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

  deleteCustomer(customer: Customer) {
    this.service.deleteCustomerAndReturn(customer.customerId!).subscribe((deletedCustomer) => {
      console.log(deletedCustomer);
      if (deletedCustomer) {
        const updatedCustomers = this.customers().filter(c => c.customerId !== deletedCustomer.customerId);
        this.customers.set(updatedCustomers);
        this.app.noty.presentToast(`Customer has been deleted.`, 3000, 'top', 'success');
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

  toggleActive(customer: Customer) {
    customer.isActive = !customer.isActive;
    this.service.updateCustomerAndReturn(customer).subscribe((updatedCustomer) => {
      if (updatedCustomer) {
        const updatedProducts = this.customers().map(p =>
          p.customerId === updatedCustomer.customerId ? updatedCustomer : p
        );
        this.customers.set(updatedProducts);
        this.app.noty.presentToast(`Customer has been updated.`, 3000, 'top', 'success');
      }
    });
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    if (this.noMoreData()) {
      event.target.complete();
      return;
    }

    this.page.update(p => p + 1);

    this.loadProducts();

    setTimeout(() => {
      event.target.complete();
    }, 300);
  }

}
