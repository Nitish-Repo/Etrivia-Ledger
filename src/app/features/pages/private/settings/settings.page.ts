import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonList, IonListHeader, IonItem, IonLabel, IonRadioGroup, IonRadio
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { ThemeService, ThemeMode } from '@app/core/theme.service';
import { LanguageService } from '@app/core/language.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonRadioGroup,
    IonRadio,
    ToolbarPage,
    TranslateModule
  ]
})
export class SettingsPage {
  themeService = inject(ThemeService);
  lang = inject(LanguageService);
  
  selectedTheme = signal<ThemeMode>('auto');

  constructor() {
    this.selectedTheme.set(this.themeService.getThemeMode());
  }

  onThemeChange(event: any) {
    const mode = event.detail.value as ThemeMode;
    this.selectedTheme.set(mode);
    this.themeService.setThemeMode(mode);
  }

  onLanguageChange(event: any) {
    this.lang.change(event.detail.value);
  }
}
