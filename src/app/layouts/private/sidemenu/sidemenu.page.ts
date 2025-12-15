import { Component, OnInit, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule, RouterLinkActive } from '@angular/router';
import {
  IonMenu, IonAvatar, IonMenuToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  home, homeOutline, grid, gridOutline, cube, cubeOutline, cart, cartOutline, logOut, logOutOutline, 
  settings, settingsOutline,
  peopleOutline,
  people,
  business,
  businessOutline,
  peopleCircle,
  peopleCircleOutline
} from 'ionicons/icons';
import { IONIC_COMMON_IMPORTS } from '@app/shared/ionic-imports';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.page.html',
  styleUrls: ['./sidemenu.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonMenu,
    IonAvatar,
    IonMenuToggle,
    ...IONIC_COMMON_IMPORTS
  ]
})
export class SidemenuPage implements OnInit {
  @Output() logoutClick = new EventEmitter<void>();
  
  private router = inject(Router);
  
  currentRoute = signal<string>('');

  constructor() {
    addIcons({
      home, homeOutline, grid, gridOutline, cube, cubeOutline, cart, cartOutline, logOut, logOutOutline, 
      settings, settingsOutline, people, peopleOutline, peopleCircle, peopleCircleOutline
    });
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute.set(event.urlAfterRedirects);
      }
    });
  }

  onLogout() {
    this.logoutClick.emit();
  }

  logout() { }
}
