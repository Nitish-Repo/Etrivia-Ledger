import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class AppSettingService {

  readonly settings = {
    AppPlatformSetting: {
      // isDesktop: Capacitor.getPlatform() === "web",
      isDesktop: false,
    }
  }

  constructor() { }

  getSettings() {
    return this.settings;
  }


}
