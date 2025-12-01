import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { SidemenuPage } from '../sidemenu/sidemenu.page';

@Component({
  selector: 'app-manage-layout',
  templateUrl: './manage-layout.page.html',
  styleUrls: ['./manage-layout.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonRouterOutlet,
    SidemenuPage,
  ]
})
export class ManageLayoutPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
