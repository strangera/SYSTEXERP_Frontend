import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';

import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS2J010Service } from '@service/api/tls/tls2j010.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls2j010-cru',
  templateUrl: './tls2j010-cru.component.html',
  styleUrl: './tls2j010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, TranslateModule]
})
export class TLS2J010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    CHG_ItemName: ['', [Validators.required, Validators.maxLength(10)]],
  });
  // ----------------------------------------------------------------
  constructor(
    private tls2j010Service: TLS2J010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2J010', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const isEditMode = !!this.rowdata?.ID;
      this.loading = true;
      if (isEditMode) {
        // 更新模式
        const updatePayload = {
          ID: this.rowdata.ID,
          CHG_ItemName: formValue.CHG_ItemName?.trim() || ''
        };

        this.tls2j010Service.updateTLS2J010(updatePayload)
          .pipe(
            untilDestroyed(this),
            finalize(() => (this.loading = false))
          )
          .subscribe({
            next: (res) => {
              console.log(' 更新 API 回應:', res);
              if (res?.Status === '0000') {
                this.messageService.successBubble('更新成功');
                this.onCancel(); // 返回列表頁面
              } else {
                this.messageService.errorBubble('更新失敗: ' + (res?.Message || '未知錯誤'));
              }
            },

          });
      } else {
        // 新增模式
        const insertPayload = {
          CHG_ItemName: formValue.CHG_ItemName?.trim() || ''
        };

        this.tls2j010Service.insertTLS2J010(insertPayload)
          .pipe(
            untilDestroyed(this),
            finalize(() => (this.loading = false))
          )
          .subscribe({
            next: (res) => {
              if (res?.Status === '0000') {
                this.messageService.successBubble('新增成功');
                this.onCancel();
              } else {
                this.messageService.errorBubble('新增失敗: ' + (res?.Message || '未知錯誤'));
              }
            },

          });
      }
    });
  }
}
