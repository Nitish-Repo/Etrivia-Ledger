import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonList, IonListHeader, IonItem, IonLabel, IonRadioGroup, IonRadio
} from '@ionic/angular/standalone';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { ThemeService, ThemeMode } from '@app/core/theme.service';

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
    ToolbarPage
  ]
})
export class SettingsPage {
  themeService = inject(ThemeService);
  selectedTheme = signal<ThemeMode>('auto');

  constructor() {
    this.selectedTheme.set(this.themeService.getThemeMode());
  }

  onThemeChange(event: any) {
    const mode = event.detail.value as ThemeMode;
    this.selectedTheme.set(mode);
    this.themeService.setThemeMode(mode);
  }
}
