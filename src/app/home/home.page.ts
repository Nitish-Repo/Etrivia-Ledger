import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { UsersComponent } from '../features/components/users/users.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, UsersComponent],
})
export class HomePage {
  constructor() {}
}
