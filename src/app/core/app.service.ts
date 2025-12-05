import { Injectable } from '@angular/core';
import { AppNotificationService, ModelMetaService } from '@app/shared-services';
import { FormHelper } from '@app/shared-services/helpers/form.helper';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(
    public meta: ModelMetaService,
    public noty: AppNotificationService,
  ) { FormHelper.notyInit(this.noty); }


}
