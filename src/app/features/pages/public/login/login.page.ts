import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IONIC_COMMON_IMPORTS } from '@app/shared/ionic-imports';
import { Subject } from 'rxjs';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { ModelMeta } from '@app/shared-services';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { getLoginMeta } from 'src/app/features/models/login.model';
import { AppService } from '@app/services/app.service';
import { InputComponent } from '@app/shared/input/input.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    ...IONIC_COMMON_IMPORTS
  ]
})
export class LoginPage implements OnInit {
  private destroy$: Subject<void> = new Subject<void>();
  form!: FormGroup;
  formMeta = new FormMeta();
  modelMeta!: ModelMeta[];
  roleOptions!: { value: string; label: string; }[];
  isLogin = signal<boolean>(false);

  // ✅ Modern Angular 20: Use inject() instead of constructor DI
  private app = inject(AppService);

  ngOnInit() {
     console.log('[LOGIN] ngOnInit started');
    
    // Initialize form data immediately to prevent undefined errors
    console.log('[LOGIN] Pre-initializing form data');
    this.modelMeta = getLoginMeta();
    this.form = this.app.meta.toFormGroup(
      { 
        deviceTokenValue: "this.pushNotifications.FCM_Token", 
        platform: "Web"
      }, 
      this.modelMeta
    );
    console.log('[LOGIN] Form pre-initialized');
   
  }

    onSubmit() {
    FormHelper.submit(this.form, this.formMeta, () => {
      this.isLogin = signal<boolean>(true);
      console.log(this.form.value)
  
    }), true;
  }


}
