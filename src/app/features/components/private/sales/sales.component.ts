import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { ToolbarPage } from "@app/layouts/private/toolbar/toolbar.page";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, CommonModule, ReactiveFormsModule, ToolbarPage, TranslateModule]
})
export class SalesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

