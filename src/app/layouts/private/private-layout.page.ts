import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { SidemenuPage } from './sidemenu/sidemenu.page';
import { FooterPage } from './footer/footer.page';

@Component({
  selector: 'app-private-layout',
  templateUrl: './private-layout.page.html',
  styleUrls: ['./private-layout.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonRouterOutlet,
    SidemenuPage,
    FooterPage
  ]
})
export class PrivateLayoutPage {
  logout() {
    console.log('Logout clicked');
    // Implement your logout logic here
    // Example:
    // this.authService.logout();
    // this.router.navigate(['/login']);
  }
}
