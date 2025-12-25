import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppService } from '@app/core/app.service';
import { Customer } from '@app/features/models';
import { CustomerService } from '@app/features/services/customer.service';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import {
  InfiniteScrollCustomEvent, ModalController,
  IonHeader, IonContent, IonButton, IonToolbar, IonSearchbar, IonFab, IonFabButton, ActionSheetController,
  IonIcon, IonList, IonLabel, IonItem, IonText, IonNote, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent, IonButtons, IonTitle } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { add, ellipsisVertical, chevronForward, pencil, heart, eyeOff, trash, close, cube, heartDislike, eye, personOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomerComponent } from './customer/customer.component';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  standalone: true,
  imports: [IonTitle, IonButtons, IonInfiniteScrollContent, IonInfiniteScroll, IonNote, IonItem, IonLabel, IonList, IonIcon, IonFabButton,
    IonFab, IonSearchbar, IonToolbar, IonButton, IonContent, IonHeader, IonBadge, CommonModule,
    ToolbarPage, RouterModule, TranslateModule]
})
export class CustomersComponent implements OnInit {
  private app = inject(AppService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(CustomerService);
  private actionSheetCtrl = inject(ActionSheetController);
  private translate = inject(TranslateService);
  private modalCtrl = inject(ModalController);

  // Input to explicitly set modal mode
  @Input() openedAsModal = false;

  customers = signal<Customer[]>([]);
  searchQuery = signal<string>('');

  page = signal(0);
  limit = 20;
  loading = signal(false);
  noMoreData = signal(false);


  results = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allCustomers = this.customers();

    // Filter by search query
    let filtered = query
      ? allCustomers.filter(customer => customer.customerName.toLowerCase().includes(query))
      : allCustomers;

    // Sort customers
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
    this.loadCustomers(true); // Reset on each view enter to avoid duplicates
  }

  loadCustomers(reset = false) {
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

      // Append new customers
      this.customers.set([...this.customers(), ...data]);

      this.loading.set(false);
    });
  }


  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const value = target.value || '';

    this.searchQuery.set(value);

    // Reload from page 0
    this.loadCustomers(true);
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
    if (this.openedAsModal) {
      this.modalCtrl.dismiss(customer);
    } else {
      this.router.navigate([`./${customer.customerId}`], { relativeTo: this.route, });
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  addNewCustomer(){
    this.router.navigate(['./new'], { relativeTo: this.route });
  }

  async navigateToAddCustomer() {
    const modal = await this.modalCtrl.create({
      component: CustomerComponent,
      componentProps: {
        openedAsModal: true
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      console.log("Selected customer", data);
      // this.loadCustomers(true);
    }
  }

  async presentActionSheet(event: Event, customer: Customer) {
    event.stopPropagation();
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.instant('button.actions'),
      buttons: [
        {
          text: this.translate.instant('page.customers.edit'),
          icon: 'pencil',
          handler: () => this.updateCustomer(customer)
        },
        // {
        //   text: customer.isfavourite ? this.translate.instant('button.remove_from_favourite') : this.translate.instant('button.mark_as_favourite'),
        //   icon: customer.isfavourite ? 'heart-dislike' : 'heart',
        //   handler: () => this.toggleFavourite(customer)
        // },
        {
          text: customer.isActive ? this.translate.instant('button.mark_as_inactive') : this.translate.instant('button.mark_as_active'),
          icon: customer.isActive ? 'eye-off' : 'eye',
          handler: () => this.toggleActive(customer)
        },
        {
          text: this.translate.instant('button.delete'),
          role: 'destructive',
          icon: 'trash',
          handler: () => this.deleteCustomer(customer)
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
        const updatedProducts = this.customers().map(c =>
          c.customerId === updatedCustomer.customerId ? updatedCustomer : c
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

    this.loadCustomers();

    setTimeout(() => {
      event.target.complete();
    }, 300);
  }

}
