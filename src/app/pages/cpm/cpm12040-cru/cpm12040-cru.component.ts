import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Cpm12040Data, Cpm12040Service } from '@service/api/cpm/cpm12040.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

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
    private readonly cpm12040Service: Cpm12040Service, // 注入服務
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

      $request.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        this.systemDataService.refreshSystemCodeByType('SUGG_SOURCE').subscribe(() => {
          if (this.isFormCreateable) {
            this.dataForm.reset();
          } else {
            this.onCancel();
          }
        });
      });
    })
  }
}
