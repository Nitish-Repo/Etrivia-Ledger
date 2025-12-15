import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { IrsControl } from '@app/shared-services';
import { IonInput, IonIcon, IonInputPasswordToggle } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonInput, IonIcon, IonInputPasswordToggle, TranslateModule]
})
export class InputComponent implements OnInit {
  @Input() form!: AbstractControl;
  @Input() name!: string;
  @Input() label?: string;
  @Input() type: string = 'text';
  @Input() helperText?: string;
  @Input() labelPlacement?: string;
  @Input() iconSlot?: string;
  @Input() errorText: string = "Enter Value";
  @Input() iconName!: string;
  @Input() email!: boolean;

  @Input() labelPosition: 'fixed' | 'floating' | 'stacked' = 'floating';
  @Input() fill?: string;
  @Input() placeholder?: string;
  // @Input() control?: FormControl;

  @Input() maxlength!: number;
  @Input() minlength!: number;
  @Input() counter!: boolean;
  @Input() minlengthErrorMessage?: string;
  @Input() pattern!: string;
  @Input() patternErrorMessage?: string;
  @Input() required!: boolean;

  control!: IrsControl;
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onValueChange = new EventEmitter<any>(true);

  /**
   * Initialize input component and get form control
   */
  ngOnInit(): void {
    console.log(`[INPUT] Initializing input component for field: ${this.name}`);
    
    // Default type is text
    if (!this.type) {
      this.type = 'text';
    }

    // Defensive check for form existence
    if (!this.form) {
      console.error(`[INPUT] Form is undefined for input: ${this.name}`);
      return;
    }

    this.control = this.form.get(this.name) as IrsControl;

    if (!this.control) {
      console.error(`[INPUT] Control with name (${this.name}) is not found in form`);
    } else {
      console.log(`[INPUT] Control ${this.name} initialized successfully`);
    }
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['form'] && this.form) {
  //     this.control = this.form.get(this.name) as IrsControl;

  //     if (this.control) {
  //       this.control.valueChanges
  //         .pipe(startWith(this.control.value))
  //         .subscribe((value) => {
  //           this.onValueChange.emit(value);
  //         });
  //     }
  //   }
  // }

  valueChanged() {
    // this.onValueChange.emit(this.control.value);
  }
  onBlur() {
    // Custom blur logic
  }

  onChange(event: any) {
    // Custom change logic
  }

  onInput(event: any) {
    // Custom input logic
  }

  /**
   * Get error message for the input field
   * @returns Error message string or empty string (let ion-input handle with errorText)
   */
  getErrorText(): string {
    // Return empty string to let the template handle error text via translate pipe
    return '';
  }
}
