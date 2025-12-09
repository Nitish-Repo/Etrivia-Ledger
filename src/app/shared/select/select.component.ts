import { CommonModule } from '@angular/common';
import { Component, input, Input, OnInit } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { IrsControl } from '@app/shared-services';
import { IonSelect, IonSelectOption } from "@ionic/angular/standalone";

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonSelect, IonSelectOption]
})
export class SelectComponent implements OnInit {
  @Input() form!: AbstractControl;
  @Input() name!: string;
  fill = input<string>('outline');
  interface = input<string>('popover');
  label = input<string>();
  labelPlacement = input<string>();

  control!: IrsControl;

  constructor() { }

  ngOnInit() { }

}
