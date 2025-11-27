import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24010Service, QueryFIN24010Response } from '@service/api/fin/fin24010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-fin24010-cru',
  templateUrl: './fin24010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    InputTextComponent,
    DropdownComponent,
    InputNumberComponent,
    AsyncPipe,
    CalendarComponent
  ]
})
export class FIN24010CRUComponent extends BasicCruPageComponent<QueryFIN24010Response> implements OnInit {
  // 下拉選單/多選列表的 Options 宣告 (參考查詢頁面)
  Org_IdOptions = this.dropDown.querySys3100(); // 組織代碼
  PayTypeOptions = [{ label: '電匯', value: '1' }, { label: '開票', value: '2' }, { label: '現金', value: '3' }] // 付款方式 1:電匯,2:開票,3:現金
  VEN_BNK_No_ParamOptions = this.dropDown.queryAps1001NoBranch(); // 匯款銀行代號
  CTRLYNOptions = [{ label: '是', value: 'Y' }, { label: '否', value: 'N' }]; // 票據禁止背書轉讓 (Y/N)
  AccNoOptions = this.dropDown.queryGls1005(); // 會計科目代號
  SubDetailNoOptions = this.dropDown.queryGLS1016(); // 對象別編號
  VEN_No_Options = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商代號

  // 設定欄位狀態：根據 API 判斷，無法修改的欄位設為 disabled: true
  dataForm = this.formBuilder.nonNullable.group({
    ACP_No: [{ value: null, disabled: true }], // 應付ID/帳款編號 (唯讀)
    org_id: [{ value: null, disabled: true }], // 組織代碼 (唯讀)
    ACP_YYYYMM: [{ value: null, disabled: true }], // 應付帳款年月 (唯讀)
    acp_termno: [{ value: null, disabled: true }], // 帳款帳次 (唯讀)
    ACP_Date: [{ value: null, disabled: true }], // 立帳日期 (唯讀)
    VEN_No: [{ value: null, disabled: true }], // 廠商代號 (唯讀)
    VEN_Name: [{ value: null, disabled: true }], // 廠商名稱 (唯讀)
    VEN_Uniform: [{ value: null, disabled: true }], // 統一編號 (唯讀)
    AccNo: [{ value: null, disabled: true }], // 會計科目代號 (唯讀)
    ACP_SourceNo: [null], // 帳款來源單號 (Editable: SourceNo)
    ACP_Amt: [{ value: null, disabled: true }], // 應付金額 (唯讀)
    PTA_Amt: [{ value: null, disabled: true }], // 沖帳金額 (唯讀)
    ACP_Balance: [{ value: null, disabled: true }], // 應付餘額 (唯讀)
    ACP_ReserveAmt: [{ value: null, disabled: true }], // 保留款金額 (唯讀)
    VEN_PayType: [null], // 付款方式 (Editable: PayType)
    VEN_BNK_No: [null], // 匯款銀行代號 (Editable: BankNo, 對應 `VEN_BNK_No`)
    VEN_BNK_BranchNo: [{ value: null, disabled: true }], // 匯款銀行分行代號 (唯讀)
    VEN_BankAccountNo: [null], // 銀行帳號 (Editable: BankAcc, 對應 `VEN_BankAccountNo`)
    VEN_AccountName: [null], // 帳戶名稱 (Editable: AccName, 對應 `VEN_AccountName`)
    ACP_ExpectPayDate: [null], // 預計付款日 (Editable: ExpectPayDate)
    VEN_CheckTitle: [null], // 票據抬頭 (非 API 欄位，視為唯讀)
    VEN_CTRLYN: [null], // 票據禁止背書轉讓 (Editable: CtrlYN)
    Bank_Name: [{ value: null, disabled: true }], // 公司銀行名稱 (唯讀)
    Bank_BranchName: [{ value: null, disabled: true }], // 公司銀行分行名稱 (唯讀)
    Bank_AccName: [{ value: null, disabled: true }], // 公司銀行帳戶名稱 (唯讀)
    VouNo: [{ value: null, disabled: true }], // 傳票號碼 (唯讀)
    Vou_PostFlag: [{ value: null, disabled: true }], // 傳票過帳旗標 (唯讀)
    Vou_PostFlagName: [{ value: null, disabled: true }], // 傳票過帳狀態中文說明 (唯讀)
    ACP_Status: [{ value: null, disabled: true }], // 應付帳款狀態 (唯讀)
    SubDetailNo: [{ value: null, disabled: true }], // 對象別編號 (唯讀)
    CRT_Date: [{ value: null, disabled: true }], // 建立日期 (唯讀)
    CRT_USR_No: [{ value: null, disabled: true }], // 建立人員 (唯讀)
    CRT_USR_Name: [{ value: null, disabled: true }], // 建立人員姓名 (唯讀)
    UPD_Date: [{ value: null, disabled: true }], // 變更日期 (唯讀)
    UPD_USR_No: [{ value: null, disabled: true }], // 變更人員 (唯讀)
    UPD_USR_Name: [{ value: null, disabled: true }], // 變更人員姓名 (唯讀)
    POS_VEN_BNK_No: [{ value: null, disabled: true }], // POS2013 廠商銀行代碼 (唯讀)
    POS_VEN_BankAccountNo: [{ value: null, disabled: true }], // POS2013 廠商銀行帳號 (唯讀)
    POS_VEN_AccountName: [{ value: null, disabled: true }], // POS2013 廠商帳戶名稱 (唯讀)
    Diff_BNK_No: [{ value: null, disabled: true }], // 銀行代碼是否不同 (唯讀)
    Diff_BankAccountNo: [{ value: null, disabled: true }], // 銀行帳號是否不同 (唯讀)
    Diff_AccountName: [{ value: null, disabled: true }], // 帳戶名稱是否不同 (唯讀)
    NoteDesc: [null], // 摘要 (Editable: NoteDesc)
  })

  constructor(
    private readonly fin24010Service: Fin24010Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN24010', this.dataForm);
  }

  onSubmit(form: FormGroup): void {
    // 處理只有特定欄位需要傳給 updateFIN24010 API 的邏輯
    const updateBody = {
      ACP_No: form.get('ACP_No')?.value,
      PayType: form.get('VEN_PayType')?.value,
      BankNo: form.get('VEN_BNK_No')?.value,
      BankAcc: form.get('VEN_BankAccountNo')?.value,
      AccName: form.get('VEN_AccountName')?.value,
      ExpectPayDate: this.datePipe.transform(form.get('ACP_ExpectPayDate')?.value, 'yyyy-MM-dd') as string, // 假設後端會處理日期格式
      NoteDesc: form.get('NoteDesc')?.value,
      SourceNo: form.get('ACP_SourceNo')?.value,
      CtrlYN: form.get('VEN_CTRLYN')?.value,
      VEN_CheckTitle: form.get('VEN_CheckTitle')?.value
    };

    this.fin24010Service.updateFIN24010(updateBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      this.messageService.successBubble(res.Message);
      this.onCancel();
    });
  }
}
