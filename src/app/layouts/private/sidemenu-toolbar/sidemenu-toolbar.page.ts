import { Component, inject, input } from '@angular/core';
import {
  IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonHeader, IonContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { appsOutline, notificationsOutline, statsChartOutline } from 'ionicons/icons';
import { MenuController } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidemenu-toolbar',
  templateUrl: './sidemenu-toolbar.page.html',
  styleUrls: ['./sidemenu-toolbar.page.scss'],
  standalone: true,
  imports: [
    IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, TranslateModule
  ]
})
export class SidemenuToolbarPage {
  private menuCtrl = inject(MenuController);
  title = input<string>('Etrivia Ledger');


  constructor() {
    addIcons({ notificationsOutline, statsChartOutline, appsOutline });
  }

  openMenu() {
    this.menuCtrl.open();
  }
}
