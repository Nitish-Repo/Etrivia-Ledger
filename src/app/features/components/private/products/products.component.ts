import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '@app/features/models/product.model';
import { ProductService } from '@app/features/services/product.service';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import {
  IonHeader, IonContent, IonButton, IonToolbar, IonSearchbar, IonFab, IonFabButton, ActionSheetController,
  IonIcon, IonList, IonLabel, IonItem, IonText, IonNote, IonBadge
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { add, cubeOutline, ellipsisVertical, chevronForward, pencil, heart, eyeOff, trash, close, cube, heartDislike, eye } from 'ionicons/icons';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: true,
  imports: [IonNote, IonText, IonItem, IonLabel, IonList, IonIcon, IonFabButton,
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

  results = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allProducts = this.products();

    if (!query) return allProducts;

    return allProducts.filter(product =>
      product.productName.toLowerCase().includes(query)
    );
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

  loadProducts() {
    this.productService.getAllProducts().subscribe((x) => {
      this.products.set(x);
    })
  }

  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    this.searchQuery.set(target.value || '');
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

}
