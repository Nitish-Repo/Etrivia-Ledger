import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Product } from '@app/features/models/product.model';
import { ProductService } from '@app/features/services/product.service';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { IonHeader, IonContent, IonButton, IonToolbar, IonSearchbar, IonFab, IonFabButton, IonIcon, IonList, IonLabel, IonItem, IonText, IonNote } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { add, cubeOutline, ellipsisVertical, chevronForward } from 'ionicons/icons';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: true,
  imports: [IonNote, IonText, IonItem, IonLabel, IonList, IonIcon, IonFabButton, IonFab, IonSearchbar, IonToolbar, IonButton, IonContent, IonHeader, CommonModule, ToolbarPage, RouterModule]
})
export class ProductsComponent implements OnInit, ViewWillEnter {
  private router = inject(Router);
  private productService = inject(ProductService);

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
    addIcons({cubeOutline,ellipsisVertical,chevronForward,add});
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

}
