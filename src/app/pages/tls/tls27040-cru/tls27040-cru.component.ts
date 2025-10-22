import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule, FormBuilder, AbstractControl } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DatePipe, NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { TLS27040Data, TLS27040Service } from '@service/api/tls/tls27040.service';
// 假設這些模型/選項已在其他地方定義
import { CheckOptions, CrdTxnFgOptions, CTBC_TxnCodeOptions, CTBC_TxnTypeOptions, PayCrdTypeOptions, POS611XOptions, TxnTypeOptions } from '../tls27040/tls27040.model';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { finalize, Observable } from 'rxjs';
import { ApiResponse } from '@service/system/auth.service'; // 確保 AuthService 被導入

@Component({
  selector: 'app-tls27040-cru',
  templateUrl: './tls27040-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, InputNumberComponent, CalendarComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS27040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  POS611XOptions = POS611XOptions;

  // =========================================================================
  // 新增: 初始查詢相關屬性
  // =========================================================================
  isQueryValidated = false; // 控制下方詳細表單是否顯示
  initialQueryLoading = false;
  initialQuerySubmitted = false;

  initialQueryForm = this.formBuilder.group({
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]],
    TXN_No: ['', [Validators.required, Validators.maxLength(8)]],
    TXN_Date: [null as Date | null, [Validators.required]],
    tableName: [null as string | null, [Validators.required]],
  });
  // =========================================================================

  POS6118dataForm = this.formBuilder.nonNullable.group({
    tableName: ['', [Validators.required, Validators.maxLength(64)]],
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]], // 收銀機號
    TXN_No: [0, [Validators.required, Validators.max(99999999)]], // 交易流水號
    NCML_TxnDate: [null as Date | null, [Validators.required]], // 銷售日期
    NCML_Date: [new Date(), [Validators.required]], // 請款日期
    TLT_No: ['', [Validators.required, Validators.maxLength(12)]], // 專櫃編號
    NCML_PayCrdType: [null as string | null, [Validators.required, Validators.maxLength(2)]], // 付款卡類別
    NCML_TxnType: [null as string | null, [Validators.required, Validators.maxLength(2)]], // 交易類別
    NCML_TxnAmt: [0, [Validators.required, Validators.max(999999999999)]], // 交易金額
    NCML_CrdNo: ['', [Validators.maxLength(32)]],  // 卡號
    NCML_TmID: ['', [Validators.maxLength(8)]], // 收銀機代號
    NCML_BatCloseDate: [null as Date | null, [Validators.required]], // 批次結帳日期
    NCML_ApprovalCode: ['', [Validators.maxLength(6)]], // 授權碼
    NCML_Check: ['', [Validators.required, Validators.maxLength(2)]], // 輸入狀況
    NCML_CrdTxnFg: ['', [Validators.maxLength(1)]], // 卡交易類別
    NCML_TermNo: [null as string | null, [Validators.required, Validators.max(99)]], // 期數
    NCML_TxnTime: [null as Date | null, [Validators.required]], // 銷售時間
  });
  POS6119dataForm = this.formBuilder.nonNullable.group({
    tableName: ['', [Validators.required, Validators.maxLength(64)]],
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]], // 收銀機號
    TXN_No: [0, [Validators.required, Validators.max(99999999)]], // 交易流水號
    CTBC_TxnTime: [null as Date | null, [Validators.required]], // 銷售日期 (DateTime)
    TLT_No: ['', [Validators.required, Validators.maxLength(12)]], // 專櫃編號
    CTBC_Date: [new Date(), [Validators.required]],// 請款日期
    CTBC_DataType: [null as string | null, [Validators.maxLength(1)]], // 資料型態
    CTBC_CrdNo: ['', [Validators.maxLength(19)]], // 卡號
    CTBC_TmID: ['', [Validators.required, Validators.maxLength(8)]], // 收銀機代號
    CTBC_TxnCode: ['', [Validators.required, Validators.maxLength(2)]],// 交易代碼
    CTBC_TxnAmt: [null as number | null, [Validators.required, Validators.max(999999999999)]],// 交易金額
    CTBC_PayDate: [null as Date | null, [Validators.required]],// 入帳日
    CTBC_ApprovalCode: ['', [Validators.maxLength(6)]],// 授權碼
    CTBC_Check: ['', [Validators.required, Validators.maxLength(2)]],// 輸入狀況
    CTBC_TermNo: [null as string | null, [Validators.maxLength(2)]],// 期數
  });
  POS6119PdataForm = this.formBuilder.nonNullable.group({
    tableName: ['', [Validators.required, Validators.maxLength(64)]],
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]],// 收銀機號
    TXN_No: [0, [Validators.required, Validators.max(99999999)]],// 交易流水號
    CTBC_TxnDate: [null as Date | null, [Validators.required]],// 銷售日期
    TLT_No: ['', [Validators.required, Validators.maxLength(12)]], // 專櫃編號
    CTBC_Date: [new Date(), [Validators.required]], // 請款日期
    CTBC_CrdNo: ['', [Validators.maxLength(19)]], // 卡號
    CTBC_TxnAmt: [0, [Validators.required, Validators.max(999999999999)]], // 交易金額
    CTBC_TxnType: ['', [Validators.maxLength(2)]],  // 交易類別
    CTBC_PayDate: [null as Date | null, [Validators.required]], // 入帳日
    CTBC_TmID: ['', [Validators.maxLength(8)]], // 收銀機代號
    CTBC_ApprovalCode: ['', [Validators.maxLength(6)]], // 授權碼
    CTBC_Check: ['', [Validators.required, Validators.maxLength(2)]], // 輸入狀況
  });

  PayCrdTypeOptions = PayCrdTypeOptions;
  TxnTypeOptions = TxnTypeOptions;
  CrdTxnFgOptions = CrdTxnFgOptions;
  CheckOptions = CheckOptions;
  CTBC_TxnCodeOptions = CTBC_TxnCodeOptions;
  CTBC_TxnTypeOptions = CTBC_TxnTypeOptions;
  TermNoOptions = SystemOptionsService.getOptions('T109')

  constructor(
    private readonly tls27040Service: TLS27040Service,
    private readonly datePipe: DatePipe,
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
              TXN_No: Number(rawData.TXN_No),
              TLT_No: rawData.TLT_No,
              // NCML Fields Mapping
              NCML_PayCrdType: rawData.PayCrdType,
              NCML_TxnAmt: rawData.TxnAmt,
              NCML_CrdNo: rawData.CrdNo,
              NCML_TmID: rawData.TmID,
              NCML_ApprovalCode: rawData.ApprovalCode,
              NCML_TxnType: rawData.TxnType,
              NCML_CrdTxnFg: rawData.CrdTxnFg,
              NCML_Check: rawData.CheckStatus,
              NCML_TermNo: String(rawData.TermNo), // 期數可能為 number/string，統一轉為 string (下拉選單選項為 string)
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
              TXN_No: Number(rawData.TXN_No),
              tableName: rawData.tableName,
              // TXN_Date in rowdata is the Date object from initialQueryForm
              NCML_TxnDate: rawData.TxnDate,
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
              TXN_No: Number(rawData.TXN_No),
              TLT_No: rawData.TLT_No,
              // CTBC Fields Mapping
              CTBC_CrdNo: rawData.CrdNo,
              CTBC_TmID: rawData.TmID,
              CTBC_TxnCode: rawData.TxnType, // 交易類別碼 (猜測對應 TxnType)
              CTBC_TxnAmt: rawData.TxnAmt,
              CTBC_ApprovalCode: rawData.ApprovalCode,
              CTBC_Check: rawData.CheckStatus,
              CTBC_TermNo: String(rawData.TermNo),
              CTBC_DataType: rawData.CrdTxnFg, // 資料型態 (猜測對應 CrdTxnFg)
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

          if (this.isFormCreateable) {
            form.patchValue({
              ECR_No: rawData.ECR_No,
              TXN_No: Number(rawData.TXN_No),
              tableName: rawData.tableName,
              CTBC_TxnTime: rawData.TxnDate, // TXN_Date in rowdata is the Date object
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
              TXN_No: Number(rawData.TXN_No),
              TLT_No: rawData.TLT_No,
              // CTBC P Fields Mapping
              CTBC_CrdNo: rawData.CrdNo,
              CTBC_TxnAmt: rawData.TxnAmt,
              CTBC_TxnType: rawData.TxnType,
              CTBC_TmID: rawData.TmID,
              CTBC_ApprovalCode: rawData.ApprovalCode,
              CTBC_Check: rawData.CheckStatus,

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

          if (this.isFormCreateable) {
            form.patchValue({
              ECR_No: rawData.ECR_No,
              TXN_No: Number(rawData.TXN_No),
              tableName: rawData.tableName,
              CTBC_TxnDate: rawData.TxnDate, // TXN_Date in rowdata is the Date object
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

    // 格式化日期為字串 yyyy-MM-dd
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
              NCML_TermNo: Number(formValue.NCML_TermNo),
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
              CTBC_TxnTime: this.datePipe.transform(formValue.CTBC_TxnTime, 'yyyy-MM-dd HH:mm:ss'), // 日期時間轉換
              CTBC_TermNo: Number(formValue.CTBC_TermNo),
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
              CTBC_PayDate: this.datePipe.transform(formValue.CTBC_PayDate, 'yyyy-MM-dd')
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
