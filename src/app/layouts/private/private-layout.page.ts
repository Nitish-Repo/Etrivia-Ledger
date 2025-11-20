import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { 
  IonRouterOutlet,
  GestureController
} from '@ionic/angular/standalone';
import { ToolbarPage } from './toolbar/toolbar.page';
import { SidemenuPage } from './sidemenu/sidemenu.page';
import { FooterPage } from './footer/footer.page';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-private-layout',
  templateUrl: './private-layout.page.html',
  styleUrls: ['./private-layout.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonRouterOutlet,
    ToolbarPage,
    SidemenuPage,
    FooterPage
  ]
})
export class PrivateLayoutPage implements OnInit, AfterViewInit {
  currentRoute: string = '';
  
  private tabRoutes = ['home', 'dashboard', 'product', 'sell'];
  private currentTabIndex = 0;

  constructor(
    private router: Router,
    private gestureCtrl: GestureController
  ) {
    // Icons are now registered in child components
  }

  ngOnInit() {
    // Track route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
      const route = this.currentRoute.split('/')[1];
      const index = this.tabRoutes.indexOf(route);
      if (index !== -1) {
        this.currentTabIndex = index;
      }
    });
  }

  ngAfterViewInit() {
    // Setup swipe gestures after view is initialized
    setTimeout(() => {
      this.setupSwipeGesture();
    }, 1000);
  }

  private setupSwipeGesture() {
    const contentEl = document.querySelector('#main-content ion-content');
    
    if (!contentEl) {
      console.warn('Content element not found for swipe gestures');
      return;
    }

    const gesture = this.gestureCtrl.create({
      el: contentEl,
      gestureName: 'swipe-tabs',
      threshold: 25,
      direction: 'x',
      passive: false,
      onEnd: (detail) => {
        const deltaX = detail.deltaX;
        const deltaY = detail.deltaY;

        // Only trigger if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
          
          if (deltaX > 0 && this.currentTabIndex > 0) {
            // Swipe right - previous tab
            this.navigateToTab(this.currentTabIndex - 1);
          } else if (deltaX < 0 && this.currentTabIndex < this.tabRoutes.length - 1) {
            // Swipe left - next tab
            this.navigateToTab(this.currentTabIndex + 1);
          }
        }
      }
    }, true);

    gesture.enable();
    console.log('✅ Swipe gestures enabled');
  }

  private navigateToTab(index: number) {
    if (index >= 0 && index < this.tabRoutes.length) {
      this.currentTabIndex = index;
      this.router.navigate([`/${this.tabRoutes[index]}`]);
    }
  }

  logout() {
    console.log('Logout clicked');
    // Implement your logout logic here
    // Example:
    // this.authService.logout();
    // this.router.navigate(['/login']);
  }
}
