import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Product } from '@app/features/models/product.model';
import { ProductService } from '@app/features/services/product.service';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { IonHeader, IonContent, IonButton, IonToolbar, IonSearchbar, IonFab, IonFabButton, IonIcon, IonList, IonLabel, IonItem, IonText, IonNote } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { add, cubeOutline, ellipsisVertical, chevronForward } from 'ionicons/icons';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: true,
  imports: [IonNote, IonText, IonItem, IonLabel, IonList, IonIcon, IonFabButton, IonFab, IonSearchbar, IonToolbar, IonButton, IonContent, IonHeader, CommonModule, ToolbarPage, RouterModule]
})
export class ProductsComponent implements OnInit {
  private router = inject(Router);
  private productService = inject(ProductService);

  products: Product[] = [];
  public results: Product[] = [];

  constructor() {
    addIcons({cubeOutline,ellipsisVertical,chevronForward,add});
  }

  ngOnInit() {
    this.productService.getAllProducts().subscribe((x) => {
      this.products = x;
      this.results = [...x];
    })

  }

  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    this.results = this.products!.filter((d) => d.productName.toLowerCase().includes(query));
  }

}
