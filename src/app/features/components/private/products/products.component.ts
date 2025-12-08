import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Product } from '@app/features/models/product.model';
import { ProductService } from '@app/features/services/product.service';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { IonHeader, IonContent, IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, CommonModule, ToolbarPage, RouterModule]
})
export class ProductsComponent  implements OnInit {
  private router = inject(Router);
  private productService = inject(ProductService);

  products?: Product[];

  constructor() { }

  ngOnInit() {
    this.productService.getAllProducts().subscribe((x)=>{
      this.products = x
    })
    
  }

}
