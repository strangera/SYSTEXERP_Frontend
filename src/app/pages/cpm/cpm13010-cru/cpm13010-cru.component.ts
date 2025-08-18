import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Cpm13010Service, QueryCPM13010Response } from '../../../service/api/cpm/cpm13010.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgIf } from '@angular/common';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';

@Component({
  selector: 'app-cpm13010-cru',
  templateUrl: './cpm13010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    NgIf,
    CalendarComponent,
    TranslateModule,
    InputNumberComponent
  ],
})
// 5.11.7 專櫃停車費折抵設定作業 (新增/修改)
export class CPM13010CRUComponent extends BasicCruPageComponent<QueryCPM13010Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    PKNG_SeqNo: [{ value: null as number | null, disabled: true }], // 序號，自動產生，不可編輯
    PKNG_SaleAmt: [0, [Validators.required, Validators.min(0), Validators.max(99999999)]],
    PKNG_DiscHour: [0, [Validators.required, Validators.min(0), Validators.max(999)]],
    PKNG_Status: [{ value: 'A', disabled: true }], // 狀態，新增時為 'A'，不可編輯

    CRT_Date: [{ value: null as Date | null, disabled: true }],
    CRT_USR_No: [{ value: '', disabled: true }],
    CRT_USR_Name: [{ value: '', disabled: true }],
    UPD_Date: [{ value: null as Date | null, disabled: true }],
    UPD_USR_No: [{ value: '', disabled: true }],
    UPD_USR_Name: [{ value: '', disabled: true }],
  });

  constructor(
    private cpm13010Service: Cpm13010Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM13010', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (this.isFormCreateable) {
        this.cpm13010Service.insertCPM13010(frm.value)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(res => {
            if (res.Status === '0000') {
              this.dataForm.reset(); // 新增成功後清空表單
              this.messageService.successBubble(res.Message || '新增成功');
            } else {
              this.messageService.errorBubble(res.Message || '新增失敗');
            }
          });
      } else if (this.isFormEditable) {
        const payload = {
          ...frm.value,
          ID: this.rowdata?.ID
        }
        this.cpm13010Service.updateCPM13010(payload)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(res => {
            if (res.Status === '0000') {
              this.onCancel();
              this.messageService.successBubble(res.Message || '更新成功');
            } else {
              this.messageService.errorBubble(res.Message || '更新失敗');
            }
          });
      }
    });
  }
}
