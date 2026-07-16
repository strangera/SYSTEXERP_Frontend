import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Cpm13010Service, QueryCPM13010Response } from '../../../service/api/cpm/cpm13010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

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
    InputNumberComponent,
    DropdownComponent
  ],
})
// 5.11.7 專櫃停車費折抵設定作業 (新增/修改)
export class CPM13010CRUComponent extends BasicCruPageComponent<QueryCPM13010Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    PKNG_SeqNo: [{ value: null as number | null, disabled: true }], // 序號，自動產生，不可編輯
    PKNG_SaleAmt: [0, [Validators.required, Validators.min(1), Validators.max(99999999)]],
    PKNG_DiscHour: [0, [Validators.required, Validators.min(1), Validators.max(999)]],
    PKNG_Status: [{ value: 'A', disabled: true }], // 狀態，新增時為 'A'，不可編輯

    CRT_Date: [{ value: null as Date | null, disabled: true }],
    CRT_USR_No: [{ value: '', disabled: true }],
    CRT_USR_Name: [{ value: '', disabled: true }],
    UPD_Date: [{ value: null as Date | null, disabled: true }],
    UPD_USR_No: [{ value: '', disabled: true }],
    UPD_USR_Name: [{ value: '', disabled: true }],
  });

  PKNG_StatusOptions = [{ label: '生效', value: 'A' }, { label: '刪除', value: 'D' }];

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
