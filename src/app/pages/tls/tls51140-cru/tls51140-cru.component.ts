import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { QueryTLS45030ResponseData } from '@service/api/tls/tls45030.service';
@Component({
  selector: 'app-tls51140-cru',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputTextComponent, InputNumberComponent, DropdownComponent, ButtonComponent, NgIf, TranslateModule],
  templateUrl: './tls51140-cru.component.html'
})
export class Tls51140CruComponent extends BasicCruPageComponent<QueryTLS45030ResponseData> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    SYS_StoreNo: [, [Validators.required, Validators.maxLength(10)]], // 收銀機所屬門市店號
    TXN_Date: [, [Validators.required]], // 交易日期
    ECR_No: [, [Validators.required, Validators.maxLength(6)]], // 收銀機號
    TXN_No: [, [Validators.required, Validators.maxLength(6)]], // 交易序號
    FNS_Class: [, [Validators.required, Validators.maxLength(2)]], // 班別

    FNS_DateTime: [, [Validators.required]], // 操作日期時間
    FNS_Op_Cod: [, [Validators.required, Validators.maxLength(8)]], // 收銀員編號
    FNS_Flag: [, [Validators.required]], // 方式 0=登入 1=開錢櫃 2=零用金 3=繳大鈔 4=關機清帳 5=授權 6=登出 8=變更密碼 9=開機

    FNS_Amount: [, [Validators.required, Validators.maxLength(8)]], // 金額，未輸入金額的操作則固定為零
    FNS_Data: ['', [Validators.maxLength(50)]], // 非銷售資料
    TLT_No: [, [Validators.maxLength(8)]], // 專櫃編號
  });

  constructor(
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS45030', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
  }
}
