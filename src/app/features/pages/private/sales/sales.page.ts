import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ToolbarPage } from "@app/layouts/private/toolbar/toolbar.page";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.page.html',
  styleUrls: ['./sales.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, CommonModule, FormsModule, ToolbarPage, TranslateModule]
})
export class SalesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
