import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  homeOutline, gridOutline, cubeOutline, cartOutline
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
  constructor() {
    addIcons({
      homeOutline, gridOutline, cubeOutline, cartOutline
    });
  }
}
