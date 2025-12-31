import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonContent, IonHeader, IonFab, IonFabList, IonFabButton, IonIcon, IonLabel, IonButton, IonItem, IonAvatar, IonCard, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { ToolbarPage } from "@app/layouts/private/toolbar/toolbar.page";
import { addIcons } from 'ionicons';
import { add, analytics, createOutline, documentTextOutline, list } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { SidemenuToolbarPage } from "@app/layouts/private/sidemenu-toolbar/sidemenu-toolbar.page";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonCol, IonRow, IonGrid, IonCard, IonAvatar, IonButton, IonIcon, IonHeader, IonContent, SidemenuToolbarPage, IonItem, IonLabel],
})
export class HomePage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  constructor() {
    addIcons({ add, documentTextOutline, createOutline, analytics, list });
  }

  goToSellPage() {
    this.router.navigate(['/sell/new'], { relativeTo: this.route });
  }
}
