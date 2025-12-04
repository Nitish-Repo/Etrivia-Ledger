import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '@app/core/app.service';
import { getProductMeta } from '@app/features/models/product.model';
import { ToolbarPage } from '@app/layouts/private/toolbar/toolbar.page';
import { ModelMeta } from '@app/shared-services';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { IonHeader, IonContent, IonText, IonButton, IonSpinner, IonTextarea } from "@ionic/angular/standalone";
import { Subject } from 'rxjs';
import { InputComponent } from "@app/shared/input/input.component";
import { addIcons } from 'ionicons';
import { pricetagOutline } from 'ionicons/icons';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  standalone: true,
  imports: [IonTextarea, IonSpinner, IonButton, IonText, IonContent, IonHeader, CommonModule, ToolbarPage, ReactiveFormsModule, InputComponent]
})
export class ProductComponent implements OnInit {
  private app = inject(AppService);
  // private token = inject(TokenService);
  // private route = inject(Router);

  private destroy$: Subject<void> = new Subject<void>();
  form!: FormGroup;
  formMeta = new FormMeta();
  modelMeta!: ModelMeta[];
  isProductSave = signal<boolean>(false);

  constructor() {
      addIcons({
        pricetagOutline
      });
    }

  ngOnInit() {
    this.modelMeta = getProductMeta();
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
      this.isProductSave.set(true);
      // this.token.setToken("loggedIn");
      // this.route.navigate(['/home'], { replaceUrl: true });
      console.log(this.form.value);
      this.isProductSave.set(false);
      this.formMeta.submitProcessing = false;
    }, true);
  }

}

