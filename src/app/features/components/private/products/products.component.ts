import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '@app/features/models/product.model';
import { ProductService } from '@app/features/services/product.service';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import {
  InfiniteScrollCustomEvent,
  IonHeader, IonContent, IonButton, IonToolbar, IonSearchbar, IonFab, IonFabButton, ActionSheetController,
  IonIcon, IonList, IonLabel, IonItem, IonText, IonNote, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { add, cubeOutline, ellipsisVertical, chevronForward, pencil, heart, eyeOff, trash, close, cube, heartDislike, eye } from 'ionicons/icons';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: true,
  imports: [IonInfiniteScrollContent, IonInfiniteScroll, IonNote, IonText, IonItem, IonLabel, IonList, IonIcon, IonFabButton,
    IonFab, IonSearchbar, IonToolbar, IonButton, IonContent, IonHeader, IonBadge, CommonModule,
    ToolbarPage, RouterModule]
})
export class ProductsComponent implements OnInit, ViewWillEnter {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private actionSheetCtrl = inject(ActionSheetController);

  products = signal<Product[]>([]);
  searchQuery = signal<string>('');

  page = signal(0);
  limit = 20;
  loading = signal(false);
  noMoreData = signal(false);


  results = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allProducts = this.products();

    // Filter by search query
    let filtered = query
      ? allProducts.filter(product => product.productName.toLowerCase().includes(query))
      : allProducts;

    // Sort products
    return this.sortProducts(filtered);
  });

  constructor() {
    addIcons({ cubeOutline, ellipsisVertical, chevronForward, add, pencil, heart, eyeOff, trash, close, cube, heartDislike, eye });
  }

  ngOnInit() {
    // Data loading handled by ionViewWillEnter
  }

  ionViewWillEnter() {
    this.loadProducts();
  }

  // loadProducts() {
  //   this.productService.getAllProducts().subscribe((x) => {
  //     this.products.set(x);
  //   })
  // }

  loadProducts(reset = false) {
    if (this.loading()) return;

    this.loading.set(true);

    if (reset) {
      this.page.set(0);
      this.products.set([]);
      this.noMoreData.set(false);
    }

    this.productService.getProductsPaginated(
      this.page(),
      this.limit,
      this.searchQuery()
    ).subscribe(data => {
      if (data.length < this.limit) this.noMoreData.set(true);

      // Append new products
      this.products.set([...this.products(), ...data]);

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


  private sortProducts(products: Product[]): Product[] {
    return products.sort((a, b) => {
      // First priority: Favourites (1 = favourite, 0 = not favourite)
      const favDiff = (b.isfavourite ? 1 : 0) - (a.isfavourite ? 1 : 0);
      if (favDiff !== 0) return favDiff;

      // Second priority: Active status (1 = active, 0 = inactive)
      const activeDiff = (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
      return activeDiff;
    });
  }

  updateProduct(product: Product) {
    this.router.navigate([`./${product.productId}`], { relativeTo: this.route, })
  }

  async presentActionSheet(event: Event, product: Product) {
    event.stopPropagation();
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Product Actions',
      buttons: [
        {
          text: 'Edit Product',
          icon: 'pencil',
          handler: () => this.updateProduct(product)
        },
        {
          text: product.isfavourite ? 'Remove from Favourite' : 'Mark as Favourite',
          icon: product.isfavourite ? 'heart-dislike' : 'heart',
          handler: () => this.toggleFavourite(product)
        },
        {
          text: product.isActive ? 'Mark as Inactive' : 'Mark as Active',
          icon: product.isActive ? 'eye-off' : 'eye',
          handler: () => this.toggleActive(product)
        },
        {
          text: 'Delete Product',
          role: 'destructive',
          icon: 'trash',
          handler: () => this.deleteProduct(product)
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

  deleteProduct(product: Product) {
    this.productService.deleteProductAndReturn(product.productId!).subscribe((deletedProduct) => {
      console.log(deletedProduct);
      if (deletedProduct) {
        const updatedProducts = this.products().filter(p => p.productId !== deletedProduct.productId);
        this.products.set(updatedProducts);
      };

    });
  }

  addFavouriteProduct(product: Product) {
    product.isfavourite = true;
    this.productService.updateProductAndReturn(product).subscribe((updatedProduct) => {
      if (updatedProduct) {
        // Replace the product with the updated one from database
        const updatedProducts = this.products().map(p =>
          p.productId === updatedProduct.productId ? updatedProduct : p
        );
        this.products.set(updatedProducts);
      }
    });
  }

  toggleFavourite(product: Product) {
    product.isfavourite = !product.isfavourite;
    this.productService.updateProductAndReturn(product).subscribe((updatedProduct) => {
      if (updatedProduct) {
        const updatedProducts = this.products().map(p =>
          p.productId === updatedProduct.productId ? updatedProduct : p
        );
        this.products.set(updatedProducts);
      }
    });
  }

  setInactive(product: Product) {
    product.isActive = false;
    this.productService.updateProductAndReturn(product).subscribe((updatedProduct) => {
      if (updatedProduct) {
        // Replace the product with the updated one from database
        const updatedProducts = this.products().map(p =>
          p.productId === updatedProduct.productId ? updatedProduct : p
        );
        this.products.set(updatedProducts);
      }
    });
  }

  toggleActive(product: Product) {
    product.isActive = !product.isActive;
    this.productService.updateProductAndReturn(product).subscribe((updatedProduct) => {
      if (updatedProduct) {
        const updatedProducts = this.products().map(p =>
          p.productId === updatedProduct.productId ? updatedProduct : p
        );
        this.products.set(updatedProducts);
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
