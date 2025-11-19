import { Validators, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';

export class IrsValidators extends Validators {
  /*
  * Validator that performs email validation.
  */
  static customEmail(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    return Validators.email(control);
  }

  static matchOtherValidator(otherControlName: string) {
    let thisControl: FormControl;
    let otherControl: FormControl;

    return function matchOtherValidate(control: FormControl) {
      if (!control.parent) {
        return null;
      }

      // Initializing the validator.
      if (!thisControl) {
        thisControl = control;
        otherControl = control.parent.get(otherControlName) as FormControl;
        if (!otherControl) {
          throw new Error('matchOtherValidator(): other control is not found in parent group');
        }
        otherControl.valueChanges.subscribe(() => {
          thisControl.updateValueAndValidity();
        });
      }

      if (!otherControl) {
        return null;
      }

      if (otherControl.value !== thisControl.value) {
        return {
          matchOther: true
        };
      }

      return null;

    };

  }

  static patternValidator(pattern: string, errorMessage: string) {
    let thisControl: FormControl;

    return function patternValidator(control: FormControl) {
      if (!control.parent) {
        return null;
      }

      // Initializing the validator.
      if (!thisControl) {
        thisControl = control;
      }

      if (control.value && !control.value.match(pattern)) {
        console.log(control.value.match(pattern));
        return {
          'pattern': true,
          'errorMessage': errorMessage
        };
      }

      return null;

    };

  }



  static customEmailTest(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    return Validators.email(control);
  }

  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    if (control.value != null && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }
}


// temporary moved in this file, because dedicated file is throwing build error somehow
export class ControlHelper {

  public static setValue(control: AbstractControl | null, value: any): void {
    if (control) {
      control.setValue(value);
    }
  }

  public static changeRequired(control: AbstractControl | null, isRequired?: boolean | null): void {
    if (control) {
      if (isRequired) {
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
      } else {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    }
  }

}

