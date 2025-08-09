import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
// 2.4.6.4 收銀機異動排程維護 CRU
@Component({
  selector: 'app-tls46040-cru',
  templateUrl: './tls46040-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, CalendarComponent, DropdownComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS46040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ECR_SchNo: [, [Validators.required, Validators.maxLength(20)]], // 排程編號
    ECR_SchDate: [, [Validators.required]], // 設定啟用日期
    ECR_SchStatus: [, [Validators.required, Validators.maxLength(2)]], // 排程狀態
    SYS_StoreNo: [, [Validators.required, Validators.maxLength(10)]], // 收銀機所屬門市店號
    ECR_No: [, [Validators.required, Validators.maxLength(6)]], // 收銀機號
    ORG_ECR_TLT_No: [, [Validators.maxLength(20)]], // 原機台所屬專櫃編號
    ECR_TLT_No: [, [Validators.maxLength(20)]], // 新機台所屬專櫃編號，若為空白則代表不修改
    ORG_ECR_USR_No: [, [Validators.maxLength(8)]], // 原機台所屬收銀員
    ECR_USR_No: [, [Validators.maxLength(8)]], // 新機台所屬收銀員，若為空白則代表不修改
    ORG_ECR_TmplNo: [, [Validators.maxLength(20)]], // 原環境變數編號
    ECR_TmplNo: [, [Validators.maxLength(20)]], // 新環境變數編號，若為空白則代表不修改
    ORG_ECR_Status: [, [Validators.maxLength(2)]], // 原收銀機狀態
    ECR_Status: [, [Validators.maxLength(2)]], // 新收銀機狀態，若為空白則代表不修改
    ECR_SchFinTime: [], // 異動作業完成時間
    CRT_Date: [], // 建立日期
    CRT_USR_No: [, [Validators.maxLength(8)]], // 建立人員
    CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
    UPD_Date: [], // 變更日期
    UPD_USR_No: [, [Validators.maxLength(8)]], // 變更人員
    UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名
  });
  // ----------------------------------------------------------------
  ECR_SchStatus_Options: any[] = [
    { value: 'A', label: '啟用' }, // 預設值為A
    { value: 'C', label: '取消' },
  ];

  constructor(
    private translate: TranslateService,
    //
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS46040', this.dataForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
  }
}
