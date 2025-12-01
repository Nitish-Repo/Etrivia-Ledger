import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { SidemenuPage } from './sidemenu/sidemenu.page';

@Component({
  selector: 'app-private-layout-component',
  templateUrl: './private-layout.component.html',
  styleUrls: ['./private-layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonRouterOutlet,
    SidemenuPage,
  ]
})
export class PrivateLayoutComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
