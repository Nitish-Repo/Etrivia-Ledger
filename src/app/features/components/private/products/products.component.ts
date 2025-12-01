import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { IonHeader, IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  imports: [IonContent, IonHeader, CommonModule, ToolbarPage]
})
export class ProductsComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
