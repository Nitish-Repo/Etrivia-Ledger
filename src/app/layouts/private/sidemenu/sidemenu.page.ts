import { Component, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule, RouterLinkActive } from '@angular/router';
import {
  IonMenu, IonAvatar, IonMenuToggle, IonFooter, IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  home, homeOutline, grid, gridOutline, cube, cubeOutline, cart, cartOutline, logOut, logOutOutline, 
  settings, settingsOutline,moon, moonOutline
} from 'ionicons/icons';
import { IONIC_COMMON_IMPORTS } from '@app/shared/ionic-imports';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.page.html',
  styleUrls: ['./sidemenu.page.scss'],
  standalone: true,
  imports: [IonToggle, IonFooter,
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
  
  currentRoute = signal<string>('');

  constructor(private router: Router) {
    addIcons({
      home, homeOutline, grid, gridOutline, cube, cubeOutline, cart, cartOutline, logOut, logOutOutline, 
      settings, settingsOutline, moon, moonOutline
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
