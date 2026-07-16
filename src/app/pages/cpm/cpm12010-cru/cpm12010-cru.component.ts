import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Cpm12010Data, Cpm12010Service } from '@service/api/cpm/cpm12010.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

//5.1.2.1 顧客意見類別維護 CRU
@Component({
  selector: 'app-cpm12010-cru',
  templateUrl: './cpm12010-cru.component.html',
  standalone: true,
  imports: [TranslateModule, CalendarComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class CPM12010CRUComponent extends BasicCruPageComponent<Cpm12010Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ID: [{ value: null, disabled: true }],
    KIND_ID: [{ value: '系統自動編號', disabled: true }], // 客戶意見類別編號
    KIND_Name: [null, [Validators.required, Validators.maxLength(60)]], // 類別名稱
    CRT_Date: [{ value: null as Date | null, disabled: true }], // 建立日期
    CRT_USR_No: [{ value: null, disabled: true }], // 建立人員
    CRT_USR_Name: [{ value: null, disabled: true }],
    UPD_Date: [{ value: null as Date | null, disabled: true }],
    UPD_USR_No: [{ value: null, disabled: true }],
    UPD_USR_Name: [{ value: null, disabled: true }],
  });
  // ----------------------------------------------------------------
  constructor(
    private cpm12010Service: Cpm12010Service, // 注入服務
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM12010', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const $request = this.isFormCreateable ? this.cpm12010Service.insertCPM12010(frm.getRawValue()) : this.cpm12010Service.updateCPM12010(frm.getRawValue());
      $request.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else {
          this.onCancel();
        }
      });
    })
  }
}
