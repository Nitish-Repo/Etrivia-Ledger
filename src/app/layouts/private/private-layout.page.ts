import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { SidemenuPage } from './sidemenu/sidemenu.page';
import { FooterPage } from './footer/footer.page';
import { AppSettingService } from '@app/core/app-setting.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  templateUrl: './private-layout.page.html',
  styleUrls: ['./private-layout.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonRouterOutlet, SidemenuPage, FooterPage]
})
export class PrivateLayoutPage {
  private appSettingService = inject(AppSettingService);
  private router = inject(Router);

  isDesktop = signal(false);
  hideFooter = signal(false);

  showFooter = computed(() => !this.isDesktop() && !this.hideFooter());

  hideFooterUrls = ['/products', '/customers'];

  ngOnInit() {
    this.isDesktop.set(
      this.appSettingService.getSettings().AppPlatformSetting.isDesktop
    );

    // Initial page check
    this.updateFooterVisibility(this.router.url);

    // Single router event listener
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.updateFooterVisibility(e.urlAfterRedirects);
      });
  }

  private updateFooterVisibility(url: string) {
    const shouldHide = this.hideFooterUrls.some(path => url.startsWith(path));
    this.hideFooter.set(shouldHide);
  }

  logout() {
    console.log('Logout clicked');
  }
}
