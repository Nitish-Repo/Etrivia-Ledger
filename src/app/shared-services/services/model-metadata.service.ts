import { Injectable } from '@angular/core';
import { FormControl, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { IrsValidators } from '../helpers';
import { ModelMeta } from '../models/model-metadata';

@Injectable({
  providedIn: 'root'
})
export class ModelMetaService {

  toFormGroup(model: any, modelMetaList: ModelMeta[], disabled: boolean = false): FormGroup {
    const group: any = {};
    modelMetaList.forEach((modelMeta) => {

      // when not nested means Simple FormGroup
      if (!modelMeta.obj) {

        // prepare validations
        const validationArray: any[] = [];
        if (modelMeta.required) {
          validationArray.push(Validators.required);
        }

        if (modelMeta.requiredTrue) {
          validationArray.push(Validators.requiredTrue);
        }

        if (modelMeta.email) {
          validationArray.push(IrsValidators.customEmail);
        }

        if (modelMeta.validateEqual) {
          validationArray.push(IrsValidators.matchOtherValidator(modelMeta.validateEqual));
        }

        if (modelMeta.minLength) {
          validationArray.push(Validators.minLength(modelMeta.minLength));
        }

        if (modelMeta.maxLength) {
          validationArray.push(Validators.maxLength(modelMeta.maxLength));
        }

        if (modelMeta.pattern && modelMeta.errorMessage) {
          validationArray.push(IrsValidators.patternValidator(modelMeta.pattern, modelMeta.errorMessage));
        }
        else if (modelMeta.pattern) {
          validationArray.push(Validators.pattern(modelMeta.pattern));
        }

        if (modelMeta.noWhitespace) {
          validationArray.push(IrsValidators.noWhitespace); // ✅ Correct place
        }

        // create form control
        if (model) {
          group[modelMeta.key] = new FormControl({ value: model[modelMeta.key], disabled: modelMeta.disabled || disabled }, validationArray);
        } else {
          group[modelMeta.key] = new FormControl({ value: undefined, disabled: disabled }, validationArray);
        }

        // hook additional data with form control
        if (modelMeta.label) {
          group[modelMeta.key].label = modelMeta.label;
        }
        if (modelMeta.desc) {
          group[modelMeta.key].desc = modelMeta.desc;
        }
      }
      // When nested FormGroup
      else if (modelMeta.obj) {
        group[modelMeta.key] = this.toFormGroup(model ? model[modelMeta.key] : undefined, modelMeta.obj, disabled);
      }

    });

    return new FormGroup(group);
  }

  toFormGroupFromModel(model: any, markAllRequired?: boolean): FormGroup {
    const group: any = {};
    Object.keys(model).forEach(key => {

      const validationArray: any[] = [];
      if (markAllRequired) {
        validationArray.push(Validators.required);
      }
      group[key] = new FormControl((model[key] === false ? false : (model[key])), validationArray);
    });

    return new FormGroup(group);
  }
}
