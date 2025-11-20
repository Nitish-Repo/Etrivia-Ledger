import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  home, homeOutline, grid, gridOutline, cube, cubeOutline, cart, cartOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.page.html',
  styleUrls: ['./footer.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FooterPage {
  selectedTab = signal<string>('home');

  constructor() {
    addIcons({
       home, homeOutline, grid, gridOutline, cube, cubeOutline, cart, cartOutline,
    });
  }

  setCurrentTab(event: any) {
    const tabName = event.tab;
    this.selectedTab.set(tabName);
  }
}
