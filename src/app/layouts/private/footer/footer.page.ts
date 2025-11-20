import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, AfterViewInit } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  GestureController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
export class FooterPage implements AfterViewInit {
  selectedTab = signal<string>('home');
  private tabs = ['home', 'dashboard', 'product', 'sell'];

  constructor(private router: Router, private gestureCtrl: GestureController) {
    addIcons({ home, homeOutline, grid, gridOutline, cube, cubeOutline, cart, cartOutline });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const el = document.querySelector('ion-router-outlet');
      if (el) {
        this.gestureCtrl.create({
          el, gestureName: 'swipe-tabs', threshold: 15, direction: 'x',
          onEnd: (d) => {
            if (Math.abs(d.deltaX) > Math.abs(d.deltaY) && Math.abs(d.deltaX) > 50) {
              const i = this.tabs.indexOf(this.selectedTab());
              if (d.deltaX > 0 && i > 0) this.nav(i - 1);
              else if (d.deltaX < 0 && i < this.tabs.length - 1) this.nav(i + 1);
            }
          }
        }, true).enable();
      }
    }, 500);
  }

  setCurrentTab(e: any) { this.selectedTab.set(e.tab); }
  
  private nav(i: number) {
    this.selectedTab.set(this.tabs[i]);
    this.router.navigate([`/${this.tabs[i]}`]);
  }
}
