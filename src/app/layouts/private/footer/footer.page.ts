import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, AfterViewInit, OnInit } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  GestureController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import {
  home, homeOutline, grid, gridOutline, cube, cubeOutline, cart, cartOutline,
  settings,
  settingsOutline,
} from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';

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
    IonLabel,
    TranslateModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FooterPage implements OnInit {
  selectedTab = signal<string>('home');
  hideTabBar = signal<boolean>(false);
  private tabs = ['home', 'dashboard', 'sell'];
  
  // Add URLs here where you want to hide the tab bar
  private hideTabBarRoutes: string[] = [
    '/product/',
    '/product-add',
    '/customer/',
    '/customer-add',
    '/supplier/',
    '/supplier-add',
    '/sales',
    '/sell/new',
    // Add more routes as needed
  ];

  constructor(private router: Router, private gestureCtrl: GestureController) {
    addIcons({ home, homeOutline, grid, gridOutline, cube, cubeOutline, cart, cartOutline, settings, settingsOutline });
  }

  ngOnInit() {
    // Hide tab bar on specified routes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.url;
      const shouldHide = this.hideTabBarRoutes.some(route => url.includes(route));
      this.hideTabBar.set(shouldHide);
    });
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     const el = document.querySelector('ion-router-outlet');
  //     if (el) {
  //       this.gestureCtrl.create({
  //         el, gestureName: 'swipe-tabs', threshold: 15, direction: 'x',
  //         onEnd: (d) => {
  //           if (Math.abs(d.deltaX) > Math.abs(d.deltaY) && Math.abs(d.deltaX) > 50) {
  //             const i = this.tabs.indexOf(this.selectedTab());
  //             if (d.deltaX > 0 && i > 0) this.nav(i - 1);
  //             else if (d.deltaX < 0 && i < this.tabs.length - 1) this.nav(i + 1);
  //           }
  //         }
  //       }, true).enable();
  //     }
  //   }, 500);
  // }

  setCurrentTab(e: any) { this.selectedTab.set(e.tab); }
  
  // private nav(i: number) {
  //   this.selectedTab.set(this.tabs[i]);
  //   this.router.navigate([`/${this.tabs[i]}`]);
  // }
}
