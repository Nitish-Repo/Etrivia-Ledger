import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { IonHeader, IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  imports: [IonContent, IonHeader, CommonModule, ToolbarPage]
})
export class CustomersComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
