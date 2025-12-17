import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { SidemenuToolbarPage } from "@app/layouts/private/sidemenu-toolbar/sidemenu-toolbar.page";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonHeader, IonContent, CommonModule, FormsModule, SidemenuToolbarPage]
})
export class DashboardPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
