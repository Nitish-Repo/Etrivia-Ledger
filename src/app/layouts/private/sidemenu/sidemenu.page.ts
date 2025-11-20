import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule, RouterLinkActive } from '@angular/router';
import {
  IonMenu,
  IonAvatar,
  IonMenuToggle, IonFooter, IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, gridOutline, cubeOutline, cartOutline, logOutOutline, settingsOutline,
  home,
  moonOutline
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
  currentRoute: string = '';

  constructor(private router: Router) {
    addIcons({
      home, homeOutline, gridOutline, cubeOutline, cartOutline, logOutOutline, settingsOutline, moonOutline
    });
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      }
    });
    // Optional: track current route if needed
  }

  onLogout() {
    this.logoutClick.emit();
  }
  logout() { }
}
