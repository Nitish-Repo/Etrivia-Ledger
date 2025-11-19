import { Injectable } from '@angular/core';
import { Toast } from '@capacitor/toast';
// import { ToastController } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class AppNotificationService {
  constructor(
    private toastController: ToastController,
    private platform: Platform
  ) { }

  async presentToast(message: string, duration: number = 1000, position: 'top' | 'middle' | 'bottom' = 'bottom', color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: position,
      color: color,
    });

    await toast.present();
  }

  async showErrorToast(message: string, duration: number = 1000, position: 'top' | 'bottom' = 'bottom') {
    if (this.platform.is('capacitor')) {
      console.log('In mobile toast');
      await Toast.show({
        text: message,
        duration: duration > 1000 ? 'long' : 'short',
        position: position,
      });
    } else {
      console.log('In web toast');
      const toast = await this.toastController.create({
        message: message,
        duration: duration,
        position: position,
        color: 'danger',
      });
      toast.present();
    }
  }
  async showSuccessToast(message: string, duration: number = 1000, position: 'top' | 'bottom' = 'bottom') {
    if (this.platform.is('capacitor')) {
      console.log('In mobile toast');
      await Toast.show({
        text: message,
        duration: duration > 1000 ? 'long' : 'short',
        position: position,
      });
    } else {
      console.log('In web toast');
      const toast = await this.toastController.create({
        message: message,
        duration: duration,
        position: position,
        color: 'success',
      });
      toast.present();
    }
  }

  // async showSuccessToast(message: string, duration: number = 1000) {
  //   const toast = await this.toastController.create({
  //     message: message,
  //     duration: duration,
  //     position: 'top',
  //     color: 'success',
  //   });
  //   toast.present();
  // }
}
