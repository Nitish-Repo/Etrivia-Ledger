import { Component } from '@angular/core';
import { 
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline, statsChartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.page.html',
  styleUrls: ['./toolbar.page.scss'],
  standalone: true,
  imports: [
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonMenuButton
  ]
})
export class ToolbarPage {
  constructor() {
    addIcons({ notificationsOutline, statsChartOutline });
  }
}
