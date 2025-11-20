import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { UsersComponent } from '../features/components/users/users.component';
import { ToolbarPage } from "@app/layouts/private/toolbar/toolbar.page";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, UsersComponent, ToolbarPage],
})
export class HomePage {
  constructor() {}
}
