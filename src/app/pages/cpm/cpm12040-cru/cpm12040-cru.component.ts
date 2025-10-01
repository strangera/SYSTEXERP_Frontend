import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Cpm12040Data, Cpm12040Service } from '@service/api/cpm/cpm12040.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';

//5.1.2.4 顧客意見來源維護 CRU
@Component({
  selector: 'app-cpm12040-cru',
  templateUrl: './cpm12040-cru.component.html',
  standalone: true,
  imports: [TranslateModule, CalendarComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class CPM12040CRUComponent extends BasicCruPageComponent<Cpm12040Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ID: [{ value: null, disabled: true }],
    SYS_Code: [{ value: '系統自動編號', disabled: true }], // 意見來源代碼
    SYS_Name: [null, [Validators.required, Validators.maxLength(60)]], // 意見來源名稱
    // 系統資訊欄位 (唯讀)
    CRT_Date: [{ value: null as Date | null, disabled: true }],
    CRT_USR_No: [{ value: null, disabled: true }],
    CRT_USR_Name: [{ value: null, disabled: true }],
    UPD_Date: [{ value: null as Date | null, disabled: true }],
    UPD_USR_No: [{ value: null, disabled: true }],
    UPD_USR_Name: [{ value: null, disabled: true }],
  });

  // ----------------------------------------------------------------
  constructor(
    private cpm12040Service: Cpm12040Service, // 注入服務
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM12040', this.dataForm);
  }

  /** 提交新增或修改 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 根據表單狀態決定呼叫新增或修改 API
      const $request = this.isFormCreateable
        ? this.cpm12040Service.insertCPM12040(frm.getRawValue())
        : this.cpm12040Service.updateCPM12040(frm.getRawValue());

      $request.pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      ).subscribe(res => {
        this.messageService.successBubble(res.Message);

        if (this.isFormCreateable) {
          // 新增成功後清空表單
          this.dataForm.reset();
        } else {
          // 修改成功後返回列表頁
          this.onCancel();
        }
      });
    })
  }
}
