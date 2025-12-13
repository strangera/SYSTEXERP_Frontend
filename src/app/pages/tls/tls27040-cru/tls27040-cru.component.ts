import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS27040Data, TLS27040Service } from '@service/api/tls/tls27040.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
// 假設這些模型/選項已在其他地方定義
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { formatTxnNo } from '@shared/models/system/query-form.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 確保 AuthService 被導入
import { finalize, Observable } from 'rxjs';
import { POS6118_TxnTypeOptions, pos6118TxnFgOptions, POS6119_TxnCodeOptions, POS6119P_TxnTypeOptions, pos6119pTxnFgOptions, pos6119TxnFgOptions, POS611XOptions } from '../tls27040/tls27040.model';

@Component({
  selector: 'app-tls27040-cru',
  templateUrl: './tls27040-cru.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, InputNumberComponent, CalendarComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS27040CRUComponent extends BasicCruPageComponent<TLS27040Data> implements OnInit {
  POS611XOptions = POS611XOptions;  // 收單行
  TLT_NoOptions = this.dropdown.queryTltTalent();   // 專櫃編號
  ECR_NoOptions = this.dropdown.queryPos1002();   // ECR編號
  // =========================================================================
  isQueryValidated = false;       // 控制下方詳細表單是否顯示
  initialQueryLoading = false;    // 控制下方詳細表單是否顯示
  initialQuerySubmitted = false;  // 控制下方詳細表單是否顯示

  initialQueryForm = this.formBuilder.group({
    ECR_No: [null as string | null, [Validators.required, Validators.maxLength(10)]],
    TXN_No: [null as string | null, [Validators.maxLength(8)]],
    TXN_Date: [null as Date | null, [Validators.required]],
    tableName: [null as string | null, [Validators.required]],
  });
  // =========================================================================

  POS6118dataForm = this.formBuilder.nonNullable.group({
    tableName: [null as string | null, [Validators.required, Validators.maxLength(64)]],
    ECR_No: [null as string | null, [Validators.required, Validators.maxLength(10)]], // 收銀機號
    TXN_No: [null as number | null, [Validators.required, Validators.maxLength(8)]], // 交易流水號
    NCML_TxnDate: [null as Date | null, [Validators.required]], // 銷售日期
    NCML_Date: [new Date(), [Validators.required]], // 請款日期
    TLT_No: [null as string | null, [Validators.required]], // 專櫃編號
    NCML_PayCrdType: [null as string | null, [Validators.required, Validators.maxLength(2)]], // 支付卡別簡碼
    CRD_Type: [null as string | null, [Validators.required, Validators.maxLength(6)]], // 卡別
    NCML_TxnType: [null as string | null, [Validators.required, Validators.maxLength(2)]], // 交易類別
    NCML_TxnAmt: [null as number | null, [Validators.required, Validators.max(999999999999)]], // 交易金額
    NCML_CrdNo: [null as string | null, [Validators.maxLength(32)]],  // 卡號
    NCML_TmID: [null as string | null, [Validators.maxLength(8)]], // 收銀機代號
    NCML_BatCloseDate: [null as Date | null, [Validators.required]], // 批次結帳日期
    NCML_ApprovalCode: [null as string | null, [Validators.maxLength(6)]], // 授權碼
    NCML_EntryFg: [null as string | null, [Validators.required, Validators.maxLength(2)]], // 輸入狀況
    NCML_CrdTxnFg: [null as string | null, [Validators.maxLength(1)]], // 交易類別
    NCML_TermNo: [null as string | null, [Validators.max(99)]], // 期數
    // NCML_TermNo: ['', [Validators.max(99)]],// 期數
    NCML_TxnTime: [null as Date | null, [Validators.required]], // 銷售時間
  });
  POS6119dataForm = this.formBuilder.nonNullable.group({
    tableName: [null as string | null, [Validators.required, Validators.maxLength(64)]],
    ECR_No: [null as string | null, [Validators.required, Validators.maxLength(10)]], // 收銀機號
    TXN_No: [null as number | null, [Validators.required, Validators.maxLength(8)]], // 交易流水號
    CTBC_TxnTime: [null as Date | null, [Validators.required]], // 銷售日期 (DateTime)
    TLT_No: [null as string | null, [Validators.required]], // 專櫃編號
    CTBC_Date: [new Date(), [Validators.required]],// 請款日期
    CTBC_DataType: [null as string | null, [Validators.required, Validators.maxLength(1)]], // 資料型態
    CRD_Type: [null as string | null, [Validators.required, Validators.maxLength(6)]], // 卡別
    CTBC_CrdNo: [null as string | null, [Validators.maxLength(19)]], // 卡號
    CTBC_TmID: [null as string | null, [Validators.required, Validators.maxLength(8)]], // 收銀機代號
    CTBC_TxnCode: [null as string | null, [Validators.required, Validators.maxLength(2)]],// 交易代碼
    CTBC_TxnAmt: [null as number | null, [Validators.required, Validators.max(999999999999)]],// 交易金額
    CTBC_PayDate: [null as Date | null, [Validators.required]],// 入帳日
    CTBC_ApprovalCode: [null as string | null, [Validators.maxLength(6)]],// 授權碼
    CTBC_EntryFg: [null as string | null, [Validators.required, Validators.maxLength(2)]],// 輸入狀況
    CTBC_TermNo: [null as string | null, [Validators.maxLength(2)]],
    // CTBC_TermNo: ['', [Validators.maxLength(2)]],// 期數
  });
  POS6119PdataForm = this.formBuilder.nonNullable.group({
    tableName: [null as string | null, [Validators.required, Validators.maxLength(64)]],
    ECR_No: [null as string | null, [Validators.required, Validators.maxLength(10)]],// 收銀機號
    TXN_No: [null as number | null, [Validators.required, Validators.maxLength(8)]],// 交易流水號
    CRD_Type: [null as string | null, [Validators.required, Validators.maxLength(6)]], // 卡別
    CTBC_TxnDate: [null as Date | null, [Validators.required]],// 銷售日期
    TLT_No: [null as string | null, [Validators.required]], // 專櫃編號
    CTBC_Date: [new Date(), [Validators.required]], // 請款日期
    CTBC_CrdNo: [null as string | null, [Validators.maxLength(19)]], // 卡號
    CTBC_TxnAmt: [null as number | null, [Validators.required, Validators.max(999999999999)]], // 交易金額
    CTBC_TxnType: [null as string | null, [Validators.maxLength(2)]],  // 交易類別
    CTBC_PayDate: [null as Date | null, [Validators.required]], // 入帳日
    CTBC_TmID: [null as string | null, [Validators.maxLength(8)]], // 收銀機代號
    CTBC_ApprovalCode: [null as string | null, [Validators.maxLength(6)]], // 授權碼
    CTBC_EntryFg: [null as string | null, [Validators.required, Validators.maxLength(2)]], // 輸入狀況
  });

  PayCrdTypeOptions = getSYS1000Options('NCML_PayCrdType');
  CRDTypeOptions = getSYS1000Options('CRD_Type');
  CheckOptions = getSYS1000Options('CTBC_Check');
  EntryFgOptions = getSYS1000Options('EntryFg');
  POS6118_TxnTypeOptions = POS6118_TxnTypeOptions;
  POS6119_TxnCodeOptions = POS6119_TxnCodeOptions;
  POS6119P_TxnTypeOptions = POS6119P_TxnTypeOptions;
  pos6118TxnFgOptions = pos6118TxnFgOptions;
  pos6119TxnFgOptions = pos6119TxnFgOptions;
  pos6119pTxnFgOptions = pos6119pTxnFgOptions;
  TermNoOptions = getSYS1000Options('T109');

  constructor(
    private readonly tls27040Service: TLS27040Service,
    private readonly datePipe: DatePipe,
    private readonly dropdown: DropdownApiService
  ) { super(); }

  /**
   * 將 YYYY-MM-DD 或 HH:mm:ss 或 YYYY-MM-DD HH:mm:ss 格式字串轉換為 Date 物件，以便 Calendar 元件使用
   * @param dateStr 日期時間字串
   * @returns Date 物件或 null
   */
  private parseDateString(dateStr: string | Date | null | undefined): Date | null {
    if (!dateStr || (typeof dateStr === 'string' && dateStr.toLowerCase() === 'null') || dateStr === '0000-00-00') return null;

    if (dateStr instanceof Date) return dateStr;

    // 處理日期格式 (YYYY-MM-DD)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // 加上 T00:00:00 避免時區問題
      return new Date(dateStr + 'T00:00:00');
    }

    // 處理時間格式 (HH:mm:ss)
    if (dateStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const today = new Date();
      const [h, m, s] = dateStr.split(':').map(Number);
      // 設置今天的日期並加上時間
      today.setHours(h, m, s, 0);
      return today;
    }

    // 處理日期時間格式 (YYYY-MM-DD HH:mm:ss)
    const dateObj = new Date(dateStr.replace(/-/g, '/')); // 替換 - 為 / 以兼容 Safari
    if (!isNaN(dateObj.getTime())) {
      return dateObj;
    }

    return null;
  }

  ngOnInit(): void {
    // 這裡僅調用 initializePage 初始化基本資訊 (ProgNo, rowdata, crudstatus)，但不傳遞 form 避免錯誤的自動 patchValue
    this.initializePage('TLS27040');

    // 判斷是否為新增模式
    if (this.isFormCreateable) {
      this.isQueryValidated = false;// 初始進入新增模式，尚未通過驗證
    } else {
      // 讀取或修改模式，直接初始化詳細表單並處理資料轉換
      this.isQueryValidated = true;
      this.initializeDetailForm();
    }
  }

  // 將原 ngOnInit 中初始化詳細表單的邏輯抽出，並處理資料轉換和手動 patchValue
  initializeDetailForm() {
    if (!this.rowdata) {
      // 即使是 Read/Edit 模式，也需要 rowdata，理論上不該發生
      this.formTitle = '資料載入錯誤';
      return;
    }

    // 假設 rowdata 為通用結構 TLS27040Data
    const rawData = this.rowdata as TLS27040Data;
    let targetForm: FormGroup;
    let mappedData: any = {};

    switch (rawData.tableName) {
      case 'POS6118':
        {
          targetForm = this.POS6118dataForm;
          // Read/Edit 模式下的資料轉換與填值
          if (!this.isFormCreateable) {
            mappedData = {
              tableName: rawData.tableName,
              ECR_No: rawData.ECR_No,
              TXN_No: formatTxnNo(rawData.TXN_No),
              TLT_No: rawData.TLT_No,
              // NCML Fields Mapping
              NCML_PayCrdType: rawData.PayCrdType,
              CRD_Type: rawData.CRD_Type,
              NCML_TxnAmt: rawData.TxnAmt,
              NCML_CrdNo: rawData.CrdNo,
              NCML_TmID: rawData.TmID,
              NCML_ApprovalCode: rawData.ApprovalCode,
              NCML_TxnType: rawData.TxnType,
              NCML_CrdTxnFg: rawData.CrdTxnFg,
              NCML_Check: rawData.CheckStatus,
              NCML_TermNo: rawData.TermNo ?? null,
              NCML_EntryFg: rawData.EntryFg,
              // Date/Time Conversions
              NCML_TxnDate: this.parseDateString(rawData.TxnDate),
              NCML_Date: this.parseDateString(rawData.ReqDate),
              NCML_BatCloseDate: this.parseDateString(rawData.BatCloseDate),
              NCML_TxnTime: this.parseDateString(rawData.TxnTime),
            };
            targetForm.patchValue(mappedData);
          }

          // 處理欄位狀態
          const form = this.POS6118dataForm;
          form.get('tableName')?.disable();
          form.get('ECR_No')?.disable();
          form.get('TXN_No')?.disable();

          // 在 Create 模式下 (通過 initialQuerySubmit 觸發)
          if (this.isFormCreateable) {
            form.patchValue({
              ECR_No: rawData.ECR_No,
              TXN_No: rawData.TXN_No ? Number(rawData.TXN_No) : Number('99999999'), // 無輸交易序號時，給入99999999
              tableName: rawData.tableName,
              // TXN_Date in rawData (this.rowdata) 應該是 TxnDate 屬性
              NCML_TxnDate: rawData.TXN_Date,
            });
            form.get('NCML_TxnDate')?.disable();
          }

          // Read 模式下需手動 disable 所有欄位
          if (this.isFormReadable) form.disable();
          break;
        }
      case 'POS6119':
        {
          targetForm = this.POS6119dataForm;
          // Read/Edit 模式下的資料轉換與填值
          if (!this.isFormCreateable) {
            mappedData = {
              tableName: rawData.tableName,
              ECR_No: rawData.ECR_No,
              TXN_No: formatTxnNo(rawData.TXN_No),
              TLT_No: rawData.TLT_No,
              // CTBC Fields Mapping
              CRD_Type: rawData.CRD_Type,
              CTBC_CrdNo: rawData.CrdNo,
              CTBC_TmID: rawData.TmID,
              CTBC_TxnCode: rawData.TxnType, // 交易類別碼 (猜測對應 TxnType)
              CTBC_TxnAmt: rawData.TxnAmt,
              CTBC_ApprovalCode: rawData.ApprovalCode,
              CTBC_Check: rawData.CheckStatus,
              CTBC_TermNo: rawData.TermNo ?? null,
              CTBC_DataType: rawData.CrdTxnFg, // 資料型態 (猜測對應 CrdTxnFg)
              CTBC_EntryFg: rawData.EntryFg,
              // Date/Time Conversions
              // 銷售日期/時間 (DateTimeOne) 欄位，需組合 Date 和 Time
              CTBC_TxnTime: this.parseDateString(rawData.TxnDate + ' ' + rawData.TxnTime),
              CTBC_Date: this.parseDateString(rawData.ReqDate),
              CTBC_PayDate: this.parseDateString(rawData.BatCloseDate),
            };
            targetForm.patchValue(mappedData);
          }

          // 處理欄位狀態
          const form = this.POS6119dataForm;
          form.get('tableName')?.disable();
          form.get('ECR_No')?.disable();
          form.get('TXN_No')?.disable();
          form.get('TLT_No')?.enable();
          if (this.isFormCreateable) {
            form.patchValue({
              ECR_No: rawData.ECR_No,
              TXN_No: rawData.TXN_No ? Number(rawData.TXN_No) : Number('99999999'), // 無輸交易序號時，給入99999999
              tableName: rawData.tableName,
              CTBC_TxnTime: rawData.TXN_Date, // TXN_Date in rowdata is the Date object
            });
            form.get('CTBC_TxnTime')?.disable();
          }

          if (this.isFormReadable) form.disable();
          break;
        }
      case 'POS6119P':
        {
          targetForm = this.POS6119PdataForm;
          // Read/Edit 模式下的資料轉換與填值
          if (!this.isFormCreateable) {
            mappedData = {
              tableName: rawData.tableName,
              ECR_No: rawData.ECR_No,
              TXN_No: formatTxnNo(rawData.TXN_No),
              TLT_No: rawData.TLT_No,
              // CTBC P Fields Mapping
              CTBC_CrdNo: rawData.CrdNo,
              CTBC_TxnAmt: rawData.TxnAmt,
              CTBC_TxnType: rawData.TxnType,
              CTBC_TmID: rawData.TmID,
              CTBC_ApprovalCode: rawData.ApprovalCode,
              CTBC_Check: rawData.CheckStatus,
              CRD_Type: rawData.CRD_Type,
              CTBC_EntryFg: rawData.EntryFg,
              // Date/Time Conversions
              CTBC_TxnDate: this.parseDateString(rawData.TxnDate),
              CTBC_Date: this.parseDateString(rawData.ReqDate),
              CTBC_PayDate: this.parseDateString(rawData.BatCloseDate),
            };
            targetForm.patchValue(mappedData);
          }

          // 處理欄位狀態
          const form = this.POS6119PdataForm;
          form.get('tableName')?.disable();
          form.get('ECR_No')?.disable();
          form.get('TXN_No')?.disable();
          form.get('TLT_No')?.enable();
          if (this.isFormCreateable) {
            form.patchValue({
              ECR_No: rawData.ECR_No,
              TXN_No: rawData.TXN_No ? Number(rawData.TXN_No) : Number('99999999'), // 無輸交易序號時，給入99999999
              tableName: rawData.tableName,
              CTBC_TxnDate: rawData.TXN_Date, // TXN_Date in rowdata is the Date object
            });
            form.get('CTBC_TxnDate')?.disable();
          }

          if (this.isFormReadable) form.disable();
          break;
        }
    }
  }

  // =========================================================================
  // 初始查詢邏輯
  // =========================================================================
  onInitialQuerySubmit(frm: FormGroup) {
    this.initialQuerySubmitted = true;
    this.initialQueryLoading = true;
    if (!frm.valid) {
      this.initialQueryLoading = false;
      return;
    }
    const formValue = frm.getRawValue();
    const formattedDate = this.datePipe.transform(formValue.TXN_Date, 'yyyy-MM-dd');
    const body = {
      ...formValue,
      TXN_Date: formattedDate, // 使用格式化後的日期
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo,
    };
    // 呼叫 API 檢查是否可以新增
    this.tls27040Service.queryInsCheck(body).pipe(finalize(() => this.initialQueryLoading = false)).subscribe(res => {
      if (res.Data === true) {
        this.messageService.successBubble(res.Message || '驗證成功，請繼續輸入詳細資料。');

        // 1. 設定 rowdata：這對於後續的 initializeDetailForm 判斷要用哪個 Form 是關鍵
        this.rowdata = {
          ...this.rowdata, // 保留原有的 rowdata (可能包含 ID 等資訊)
          tableName: formValue.tableName,
          ECR_No: formValue.ECR_No,
          TXN_No: formValue.TXN_No,
          TXN_Date: formValue.TXN_Date, // 傳遞原始 Date 物件給 initializeDetailForm 使用
        } as TLS27040Data; // 確保型別包含這些欄位

        // 2. 顯示詳細表單
        this.isQueryValidated = true;

        // 3. 初始化並帶入初始查詢值到詳細表單
        this.initializeDetailForm();
      } else {
        this.messageService.warnBubble(res.Message || '資料重複或條件不符，無法新增。');
      }
    });
  }
  // =========================================================================

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      let apiCall: Observable<ApiResponse<number>> | undefined = undefined;

      // 由於 initialQueryForm 已經設定了 rowdata?.tableName，這裡直接使用
      switch (this.rowdata?.tableName) {
        case 'POS6118':
          {
            // 1. 確保所有 DateOnly 欄位被轉換為 'yyyy-MM-dd' 格式
            const formattedNcmlDate = this.datePipe.transform(formValue.NCML_Date, 'yyyy-MM-dd');
            const formattedTxnDate = this.datePipe.transform(formValue.NCML_TxnDate, 'yyyy-MM-dd');
            const formattedBatCloseDate = this.datePipe.transform(formValue.NCML_BatCloseDate, 'yyyy-MM-dd');

            // 2. 修正 NCML_TxnTime：
            //    將交易日期 (NCML_TxnDate) 和交易時間 (NCML_TxnTime) 結合，
            //    生成後端 System.DateTime 所需的完整 ISO 8601 格式字串 (YYYY-MM-DDTHH:mm:ss)
            const formattedTxnTimeOnly = this.datePipe.transform(formValue.NCML_TxnTime, 'HH:mm:ss');
            const fullTxnDateTime = `${formattedTxnDate}T${formattedTxnTimeOnly}`;

            // 3. 構造完整的請求 body
            //    注意：更新操作的 ID 必須包含在 body 中，因為後端 DTO (updatePOS6118Request) 包含了 ID 欄位。
            const requestBody = {
              // 透過 spread operator 帶入 formValue 中未手動轉換的字串/數值欄位
              ...formValue,

              // 確保 ID 被正確賦予
              ID: this.rowdata?.ID as number,

              // 覆蓋並修正日期/時間欄位
              NCML_Date: formattedNcmlDate,
              NCML_BatCloseDate: formattedBatCloseDate,
              NCML_TxnDate: formattedTxnDate, // 仍保留 DateOnly 格式

              // 修正後的 DateTime 格式，解決轉換錯誤
              NCML_TxnTime: fullTxnDateTime,

              // 確保數值欄位是正確的 Number 類型
              NCML_TermNo: formValue.NCML_TermNo != null ? Number(formValue.NCML_TermNo) : null,

              NCML_Check: 'Y',
            };

            if (this.isFormCreateable) {
              apiCall = this.tls27040Service.insertPOS6118(requestBody);
            } else {
              apiCall = this.tls27040Service.updatePOS6118(requestBody);
            }
            break;
          }
        case 'POS6119':
          {
            const body = {
              ...formValue,
              // 確保將 Date 物件轉換為 yyyy-MM-dd 字串
              CTBC_Date: this.datePipe.transform(formValue.CTBC_Date, 'yyyy-MM-dd'),
              CTBC_PayDate: this.datePipe.transform(formValue.CTBC_PayDate, 'yyyy-MM-dd'),
              CTBC_TxnTime: formValue.CTBC_TxnTime, // 日期時間轉換
              CTBC_TermNo: formValue.CTBC_TermNo != null ? Number(formValue.CTBC_TermNo) : null,
              CTBC_Check: 'Y'
            };
            if (this.isFormCreateable) {
              apiCall = this.tls27040Service.insertPOS6119(body);
            } else {
              apiCall = this.tls27040Service.updatePOS6119({ ID: this.rowdata?.ID as number, ...body });
            }
            break;
          }
        case 'POS6119P':
          {
            const body = {
              ...formValue,
              // 確保將 Date 物件轉換為 yyyy-MM-dd 字串
              CTBC_Date: this.datePipe.transform(formValue.CTBC_Date, 'yyyy-MM-dd'),
              CTBC_TxnDate: this.datePipe.transform(formValue.CTBC_TxnDate, 'yyyy-MM-dd'),
              CTBC_PayDate: this.datePipe.transform(formValue.CTBC_PayDate, 'yyyy-MM-dd'),
              CTBC_Check: 'Y'
            };
            if (this.isFormCreateable) {
              apiCall = this.tls27040Service.insertPOS6119P(body);
            } else {
              apiCall = this.tls27040Service.updatePOS6119P({ ID: this.rowdata?.ID as number, ...body });
            }
            break;
          }
      }
      // 統一處理 API 呼叫
      if (apiCall) {
        apiCall.pipe(finalize(() => this.loading = false)).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.onCancel();
        });
      }
    });
  }
}
