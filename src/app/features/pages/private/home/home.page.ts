import { Component } from '@angular/core';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { ToolbarPage } from "@app/layouts/private/toolbar/toolbar.page";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonContent, ToolbarPage],
})
export class HomePage {
  constructor() {}
}
