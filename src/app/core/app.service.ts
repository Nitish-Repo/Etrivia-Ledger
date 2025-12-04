import { Injectable } from '@angular/core';
import { AppNotificationService, ModelMetaService } from '@app/shared-services';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { StorageService } from './local-stroage-services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(
    public meta: ModelMetaService,
    public noty: AppNotificationService,
    public storage: StorageService,
  ) { FormHelper.notyInit(this.noty); }


}
