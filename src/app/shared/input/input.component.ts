import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { IrsControl } from '@app/shared-services';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
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
   * @returns Error message string
   */
  getErrorText(): string {
    // Defensive check for control existence
    if (!this.control) {
      return 'Enter the value';
    }

    const fieldName = this.label || this.placeholder || this.control.label || 'This field';

    if (this.control.invalid && (this.control.dirty || this.control.touched)) {
      if (this.control.errors?.['required']) {
        return `${fieldName} is required.`;
      }
      if (this.control.errors?.['minlength']) {
        return this.minlengthErrorMessage || `${fieldName} Minimum length is ${this.control.errors['minlength'].requiredLength}.`;
      }
      if (this.control.errors?.['maxlength']) {
        return `${fieldName} Maximum length is ${this.control.errors['maxlength'].requiredLength}.`;
      }
      if (this.control.errors?.['pattern']) {
        return this.patternErrorMessage || `Invalid ${this.type} format.`;
      }
    }
    return 'Enter the value';
  }
}
