import { FormGroup } from "@angular/forms";
import { AppNotificationService } from "../services";
import { FormMeta } from "../models/form-meta";

export class FormHelper {

  private static alertService: AppNotificationService; // init this when app init

  // call this method to initialize notification alerts
  public static notyInit(alertServie: AppNotificationService) {
    FormHelper.alertService = alertServie;
  }

  public static submit(form: FormGroup, formMeta: FormMeta, submitFunc: Function, doNotCheckPristine = false) {
    formMeta.serverErrorMessage = undefined;
    formMeta.successMessage = undefined;
    formMeta.isFireValidation = true;
    formMeta.submitProcessing = true;

    form.markAllAsTouched();

    if (!form.invalid) {
      try {
        if (form.pristine && !doNotCheckPristine) {
          formMeta.submitProcessing = false;
          console.log('Form is unchanged');
          FormHelper.alertService.presentToast('Form is unchanged', 1000, 'top', 'danger');
        } else {
          submitFunc();
        }
      } catch (e) {
        formMeta.submitProcessing = false;
        console.log('Server is not reachable');
      }
    } else {
      formMeta.submitProcessing = false;
      console.log('Invalid form could not be submit');
      if (FormHelper.alertService) {
        FormHelper.alertService.presentToast('Invalid form could not be submit', 1000, 'top', 'danger');
      }

    }
  }
}
