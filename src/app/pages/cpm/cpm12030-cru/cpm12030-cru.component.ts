import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';

import { untilDestroyed } from '@ngneat/until-destroy';
import { CPM12030Response, Cpm12030Service } from '@service/api/cpm/cpm12030.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

//5.1.2.3 顧客意見子類別維護 CRU
@Component({
  selector: 'app-cpm12030-cru',
  templateUrl: './cpm12030-cru.component.html',
  standalone: true,
  imports: [InputTextareaComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, DropdownComponent, ButtonComponent, NgIf, TranslateModule]
})
export class CPM12030CRUComponent extends BasicCruPageComponent<CPM12030Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    subCategoryCode: ['系統自動產生', [Validators.required, Validators.maxLength(10)]], // 子類別編號
    subCategoryName: [null, [Validators.required, Validators.maxLength(40)]], // 責任單位名稱類別名稱
    opinionCategory: [null, [Validators.required]], // 客戶意見主類別
    remark: [null], // 備註
  });
  opinionCategoryOptions = [
    { value: 1, label: '意見反映' },
    { value: 2, label: '廣告業務' },
    { value: 3, label: '活動、場地洽談' },
    { value: 4, label: '承租店櫃' },
    { value: 5, label: '合作提案' },
  ];

  constructor(
    private readonly cpm12030Service: Cpm12030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12030', this.dataForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const params = {
        ...frm.getRawValue()
      }
      const $request = this.isFormCreateable ? this.cpm12030Service.insertCPM12030(params) : this.cpm12030Service.updateCPM12030(params);
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
