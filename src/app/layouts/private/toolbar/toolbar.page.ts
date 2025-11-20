import { Component, inject, input } from '@angular/core';
import {
  IonToolbar, IonButtons, IonButton, IonIcon, IonTitle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { appsOutline, notificationsOutline, statsChartOutline } from 'ionicons/icons';
import { MenuController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.page.html',
  styleUrls: ['./toolbar.page.scss'],
  standalone: true,
  imports: [
    IonToolbar, IonButtons, IonButton, IonIcon, IonTitle,
  ]
})
export class ToolbarPage {
  private menuCtrl = inject(MenuController);
  title = input<string>('Etrivia Ledger');


  constructor() {
    addIcons({ notificationsOutline, statsChartOutline, appsOutline });
  }

  openMenu() {
    this.menuCtrl.open();
  }
}
