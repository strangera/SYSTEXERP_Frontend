import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';

import { untilDestroyed } from '@ngneat/until-destroy';
import { CPM12020Response, Cpm12020Service } from '@service/api/cpm/cpm12020.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

//5.1.2.2 顧客意見責任單位維護 CRU
@Component({
  selector: 'app-cpm12020-cru',
  templateUrl: './cpm12020-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class CPM12020CRUComponent extends BasicCruPageComponent<CPM12020Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    opinionCode: ['系統自動產生', [Validators.required, Validators.maxLength(10)]], // 顧客意見責任單位編號
    unitName: [null, [Validators.required, Validators.maxLength(40)]], // 責任單位名稱類別名稱
  });
  constructor(
    private readonly cpm12020Service: Cpm12020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12020', this.dataForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const params = {
        ...frm.getRawValue()
      }
      const $request = this.isFormCreateable ? this.cpm12020Service.insertCPM12020(params) : this.cpm12020Service.updateCPM12020(params);
      $request.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else {
          this.onCancel();
        }
      })
    })
  }
}
