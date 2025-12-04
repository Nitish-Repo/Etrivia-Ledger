import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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

  constructor() { }

  ngOnInit() {}

}
