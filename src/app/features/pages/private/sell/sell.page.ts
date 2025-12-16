import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { ToolbarPage } from "@app/layouts/private/toolbar/toolbar.page";
import { Subject } from 'rxjs';
import { FormMeta } from '@app/shared-services/models/form-meta';
import { ModelMeta } from '@app/shared-services';
import { AppService } from '@app/core/app.service';
import { FormHelper } from '@app/shared-services/helpers/form.helper';
import { TranslateModule } from '@ngx-translate/core';
import { getAdditionalChargeMeta, getSaleItemMeta, getSaleMeta } from '@app/features/models';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.page.html',
  styleUrls: ['./sell.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, CommonModule, ReactiveFormsModule, ToolbarPage, TranslateModule]
})
export class SellPage implements OnInit {
  private app = inject(AppService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private destroy$: Subject<void> = new Subject<void>();
  form!: FormGroup;
  isEdit = signal<boolean>(false);
  formMeta = new FormMeta();
  saleModelMeta!: ModelMeta[];
  SaleItemModelMeta!: ModelMeta[];
  additionalChargeModelMeta!: ModelMeta[];
  isLogin = signal<boolean>(false);

  constructor() { }

  ngOnInit() {
    this.saleModelMeta = getSaleMeta();
    this.SaleItemModelMeta = getSaleItemMeta();
    this.additionalChargeModelMeta = getAdditionalChargeMeta();

    // Find metadata for select components
    // this.unitMeasureMeta = this.modelMeta.find(m => m.key === 'unitMeasure')!;
    // this.discountTypeMeta = this.modelMeta.find(m => m.key === 'discountType')!;
    // this.saleTaxTypeMeta = this.modelMeta.find(m => m.key === 'saleTaxType')!;
    // this.purchaseTaxTypeMeta = this.modelMeta.find(m => m.key === 'purchaseTaxType')!;

    this.route.params.subscribe((x) => {
      if (x['id']) {
        let saleId = x['id'];
        this.buildSellForm(saleId);
      } else {
        this.buildNewSellForm();
      }
    });
  }

  private buildNewSellForm() {
    this.form = this.app.meta.toFormGroup({}, this.saleModelMeta);
  }

  private buildSellForm(saleId: string) {
    this.isEdit.set(true);
    // this.service.getProductById(productId).subscribe((y) => {
    //   this.form = this.app.meta.toFormGroup(y, this.modelMeta);
    // });

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
