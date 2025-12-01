import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { ToolbarPage } from "@app/layouts/private/toolbar/toolbar.page";
import { Subject } from 'rxjs';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { ModelMeta } from '@app/shared-services';
import { AppService } from '@app/core/app.service';
import { getSellModelMeta } from '@app/features/models/sell.model';
import { FormHelper } from '@app/shared-services/helpers/form.helper';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.page.html',
  styleUrls: ['./sell.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, CommonModule, ReactiveFormsModule, ToolbarPage]
})
export class SellPage implements OnInit {
  private app = inject(AppService);
  // private token = inject(TokenService);
  // private route = inject(Router);

  private destroy$: Subject<void> = new Subject<void>();
  form!: FormGroup;
  formMeta = new FormMeta();
  modelMeta!: ModelMeta[];
  isLogin = signal<boolean>(false);

  constructor() { }

  ngOnInit() {
    this.modelMeta = getSellModelMeta();
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
        this.isLogin.set(true);
        // this.token.setToken("loggedIn");
        // this.route.navigate(['/home'], { replaceUrl: true });
        console.log(this.form.value);
      }, true);
    }

}
