import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { SidemenuPage } from './sidemenu/sidemenu.page';
import { FooterPage } from './footer/footer.page';
import { AppSettingService } from '@app/core/app-setting.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs';

@Component({
  selector: 'app-private-layout',
  templateUrl: './private-layout.page.html',
  styleUrls: ['./private-layout.page.scss'],
  standalone: true,
  // changeDetection:ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonRouterOutlet,
    SidemenuPage,
    FooterPage
  ]
})
export class PrivateLayoutPage {
  private appSettingService = inject(AppSettingService);
  private router = inject(Router)

  isDesktop = signal<boolean>(false);
  hideFooter = signal<boolean>(false);
  showFooter = computed(() =>{
    return !(this.isDesktop() || this.hideFooter())
  })


  hideFooterUrls: string[] = ['/products', '/customers'];

  ngOnInit() {
    const desktop =
      this.appSettingService.getSettings().AppPlatformSetting.isDesktop;

    this.isDesktop.set(desktop);

    // Check initial URL
    this.updateFooterVisibility(this.router.url);

    // Listen for navigation changes
    this.router.events
      .pipe(tap(console.log), filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateFooterVisibility(event.urlAfterRedirects);
      });
  }

   private updateFooterVisibility(url: string) {
    const shouldHide = this.hideFooterUrls.some(path =>
      url.startsWith(path)
    );
    this.hideFooter.set(shouldHide);
  }

  logout() {
    console.log('Logout clicked');
    // Implement your logout logic here
    // Example:
    // this.authService.logout();
    // this.router.navigate(['/login']);
  }
}
