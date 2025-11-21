import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IONIC_COMMON_IMPORTS } from '@app/shared/ionic-imports';
import { Subject } from 'rxjs';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { ModelMeta } from '@app/shared-services';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { getLoginMeta } from 'src/app/features/models/login.model';
import { AppService } from '@app/services/app.service';
import { InputComponent } from '@app/shared/input/input.component';
import { TokenService } from '@app/core/token.service';

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
  private app = inject(AppService);
  private token = inject(TokenService);
  private route = inject(Router);

  private destroy$: Subject<void> = new Subject<void>();
  form!: FormGroup;
  formMeta = new FormMeta();
  modelMeta!: ModelMeta[];
  roleOptions!: { value: string; label: string; }[];
  isLogin = signal<boolean>(false);


  ngOnInit() {
    this.modelMeta = getLoginMeta();
    this.form = this.app.meta.toFormGroup(
      { 
        deviceTokenValue: "this.pushNotifications.FCM_Token", 
        platform: "Web"
      }, 
      this.modelMeta
    );
   
  }

    onSubmit() {
    FormHelper.submit(this.form, this.formMeta, () => {
      this.token.setToken("loggedIn");
      this.route.navigate(['/home'], { replaceUrl: true });
      this.isLogin = signal<boolean>(true);
      console.log(this.form.value)
    }), true;
  }


}
