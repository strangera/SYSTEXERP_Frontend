import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24010Service, QueryFIN24010Response } from '@service/api/fin/fin24010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
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
  VEN_BNK_No_ParamOptions = this.dropDown.queryAps1001_DropDownList(); // 匯款銀行代號
  CTRLYNOptions = [{ label: '是', value: 'Y' }, { label: '否', value: 'N' }]; // 票據禁止背書轉讓 (Y/N)
  AccNoOptions = this.dropDown.queryGls1005(); // 會計科目代號
  SubDetailNoOptions = this.dropDown.queryGLS1016(); // 對象別編號
  VEN_No_Options = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商編號
  ACP_StatusOptions = getSYS1000Options('ACP_Status'); // 應付帳款狀態

  // 設定欄位狀態：根據 API 判斷，無法修改的欄位設為 disabled: true
  dataForm = this.formBuilder.nonNullable.group({
    ACP_No: [{ value: null, disabled: true }], // 應付ID/帳款編號 (唯讀)
    org_id: [{ value: null, disabled: true }], // 組織代碼 (唯讀)
    ACP_YYYYMM: [{ value: null, disabled: true }], // 應付帳款年月 (唯讀)
    acp_termno: [{ value: null, disabled: true }], // 帳款帳次 (唯讀)
    ACP_Date: [{ value: null, disabled: true }], // 立帳日期 (唯讀)
    VEN_No: [{ value: null, disabled: true }], // 廠商編號 (唯讀)
    VEN_Name: [{ value: null, disabled: true }], // 廠商名稱 (唯讀)
    VEN_Uniform: [{ value: null, disabled: true }], // 統一編號 (唯讀)
    AccNo: [{ value: null, disabled: true }], // 會計科目代號 (唯讀)
    ACP_SourceNo: [null], // 帳款來源單號 (Editable: SourceNo)
    ACP_Amt: [{ value: null, disabled: true }], // 應付金額 (唯讀)
    PTA_Amt: [{ value: null, disabled: true }], // 沖帳金額 (唯讀)
    ACP_Balance: [{ value: null, disabled: true }], // 應付餘額 (唯讀)
    ACP_ReserveAmt: [{ value: null, disabled: true }], // 保留款金額 (唯讀)
    RetReserveAmt: [{ value: null, disabled: true }], // 退保留款金額 (唯讀)
    VEN_PayType: [null], // 付款方式 (Editable: PayType)
    Full_VEN_BNK_No: [null], // 匯款銀行代號 (Editable: BankNo, 對應 `VEN_BNK_No`)
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
    private readonly datePipe: DatePipe,
    private readonly route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN24010', this.dataForm);

    // 路徑一：FIN24010 list → 編輯/檢視，router state 已由 initializePage patchValue，結束
    if (this.rowdata) return;

    // 路徑二：FIN34030 廠客/付款總表 → 新分頁，使用 localStorage handoff（同 FIN32010 模式）
    const handoff = this.readHandoffLocal();
    if (handoff?.arsId) {
      this.loading = true;
      this.fin24010Service.queryFIN24010({ ACP_No: handoff.arsId })
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe({
          next: res => {
            const data = res?.Data?.[0];
            if (data) {
              this.dataForm.patchValue(data as any);
              this.dataForm.disable();
            } else {
              this.messageService.warnBubble('查無資料。');
            }
            localStorage.removeItem('FIN24010_CRU_HANDOFF');
          },
          error: () => {
            this.messageService.errorBubble('載入應付帳款資料失敗。');
            localStorage.removeItem('FIN24010_CRU_HANDOFF');
          }
        });
      return;
    }

    // 路徑三：FIN29120 → 新分頁，使用 query param ?acpId=
    // 全域 LowerCaseUrlSerializer 會把整個 URL（含 query key/value）轉小寫，
    // 故 key 需容錯小寫、value 需轉回大寫（與 fin13050-cru 的 handleQueryParams 同套處理）。
    const acpNoRaw = this.route.snapshot.queryParams['acpId'] ?? this.route.snapshot.queryParams['acpid'];
    const acpNoFromQuery = acpNoRaw ? String(acpNoRaw).trim().toUpperCase() : '';
    if (acpNoFromQuery) {
      this.loading = true;
      this.fin24010Service.queryFIN24010({ ACP_No: acpNoFromQuery })
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe({
          next: res => {
            const data = res?.Data?.[0];
            if (data) {
              this.dataForm.patchValue(data as any);
              this.dataForm.disable();
            } else {
              this.messageService.warnBubble('查無資料。');
            }
          }
        });
    }
  }

  private readHandoffLocal(): { arsId?: string; fromRoute?: string } | null {
    try {
      const raw = localStorage.getItem('FIN24010_CRU_HANDOFF');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return { arsId: obj?.arsId, fromRoute: obj?.fromRoute };
    } catch {
      return null;
    }
  }

  onSubmit(form: FormGroup): void {
    // 處理只有特定欄位需要傳給 updateFIN24010 API 的邏輯
    const updateBody = {
      ACP_No: form.get('ACP_No')?.value,
      PayType: form.get('VEN_PayType')?.value,
      BankNo: form.get('Full_VEN_BNK_No')?.value,
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
