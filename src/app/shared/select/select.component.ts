import { CommonModule } from '@angular/common';
import { Component, input, signal, effect, inject, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroupDirective, ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { ModelMeta } from '@app/shared-services';
import { IonSelect, IonSelectOption } from "@ionic/angular/standalone";

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonSelect, IonSelectOption],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent {
  readonly meta = input<ModelMeta | undefined>();
  readonly control = signal<FormControl | null>(null);
  
  // Ionic specific inputs
  readonly fill = input<'outline' | 'solid'>('outline');
  readonly interface = input<'action-sheet' | 'popover' | 'alert'>('popover');
  readonly labelPlacement = input<'start' | 'end' | 'fixed' | 'stacked' | 'floating'>('floating');

  private readonly controlContainer = inject(ControlContainer, {
    optional: false,
    host: false,
  }) as ControlContainer | null;

  @Output() onSelectionChange = new EventEmitter<any>(true);

  private readonly init = effect(() => {
    const m = this.meta();
    if (!m) {
      this.control.set(null);
      return;
    }

    if (!this.controlContainer) {
      console.warn('SelectComponent: No parent form found. Make sure this component is inside a form.');
      this.control.set(null);
      return;
    }

    const parentForm = (this.controlContainer as FormGroupDirective)?.form;
    if (!parentForm) {
      console.warn('SelectComponent: Parent form is not initialized.');
      this.control.set(null);
      return;
    }

    const c = parentForm.get(m.key) as FormControl | null;
    if (!c) {
      console.warn(`SelectComponent: Control with name "${m.key}" not found in parent form.`);
      this.control.set(null);
      return;
    }

    this.control.set(c);
  });

  selectionChange(event: any) {
    this.onSelectionChange.emit(event?.detail?.value);
  }
}
