import { Component, inject } from '@angular/core';
import { IonContent, IonHeader, IonFab, IonFabList, IonFabButton, IonIcon, IonLabel, IonButton } from '@ionic/angular/standalone';
import { ToolbarPage } from "@app/layouts/private/toolbar/toolbar.page";
import { addIcons } from 'ionicons';
import { add, createOutline, documentTextOutline } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonButton, IonIcon, IonHeader, IonContent, ToolbarPage],
})
export class HomePage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  constructor() {
    addIcons({ add, documentTextOutline, createOutline });
  }

  goToSellPage() {
    this.router.navigate(['/sell/new'], { relativeTo: this.route });
  }
}
