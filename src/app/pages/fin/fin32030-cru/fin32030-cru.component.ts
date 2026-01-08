import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from "@shared/componentkit/calendar-range/calendar-range.component";
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import {
  FIN32030Service,
  QueryFIN32030ARResponse,
  QueryFIN32030Response
} from '../../../service/api/fin/fin32030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '../../../shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '../../../shared/componentkit/table-edit/table-edit.model';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, formatAmountWithFraction, formatDate } from '../../../shared/componentkit/table/table.model';

// 擴展應收帳款類型,添加收款金額欄位
interface ARWithRCVAmt extends QueryFIN32030ARResponse {
  RCV_Amt?: number | null;
}

// 收款項目 JSON 格式
interface RecvItemFromJson {
  id?: number;
  mid?: number;
  STO_No?: string;
  RCV_No?: string;
  CAP_Item?: string;
  RCV_Amt?: number;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  CAP_Name?: string;
  Item_AccNo?: string;
  NoteDesc?: string;
}

// 票據 JSON 格式
interface CheckFromJson {
  id?: number;
  mid?: number;
  STO_No?: string;
  CHK_No?: string;
  VEN_No?: string;
  BNK_No?: string;
  BNK_BranchNo?: string;
  CHK_Status?: string;
  CHK_ColleDate?: string;
  CHK_BNK_No?: string;
  CHK_ReceDate?: string;
  RCV_No?: string;
  CHK_ExpireDate?: string;
  CHK_Amt?: number;
  CHK_Type?: string;
  Gurantee_YN?: string;
  Ticket_YN?: string;
  ORG_ID?: string;
  Tran_Status?: string;
  AccNo?: string;
  VouNo_received?: string;
  PTA?: string;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  BNK_AccNo?: string;
  CHK_PreDate?: string;
  CHK_Comment?: string;
}

// 應收沖帳 JSON 格式
interface ReceiptFromJson {
  id?: number;
  mid?: number;
  STO_No?: string;
  RCV_No?: string;
  RCV_Date?: string;
  VEN_No?: string;
  ARS_No?: string;
  ARS_Amt?: number;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  NoteDesc?: string;
}

//1.3.2.3 收款沖帳維護 CRU
@Component({
  selector: 'app-fin32030-cru',
  templateUrl: './fin32030-cru.component.html',
  styleUrl: './fin32030-cru.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    TranslateModule,
    TableEditComponent,
    TableComponent,
    DialogModule,
    CalendarRangeComponent
  ]
})
export class FIN32030CRUComponent extends BasicCruPageComponent<QueryFIN32030Response> implements OnInit {
  // 按鈕切換控制
  buttonID = 1; // 預設顯示第一個步驟

  // ViewChild for Dialog Table
  @ViewChild('arDialogTable') arDialogTable!: TableComponent;

  // 步驟1: 基本資料表單
  step1Form = this.formBuilder.nonNullable.group({
    RCV_No: ['', [Validators.maxLength(20)]], // 收款單號
    RCV_Date: [new Date(), [Validators.required]], // 收款日期
    Sales_Id: [null as string | null], // 業務員代號
    Remark: ['', [Validators.maxLength(100)]], // 備註
  });

  // 步驟3: 應收帳款表格資料 (從對話框選擇後自動帶入,不可手動編輯)
  step4TableData: ARWithRCVAmt[] = [];
  step4Columns: EditColumn[] = [
    {
      field: 'ARS_ID',
      header: '應收ID',
      type: 'input',
      maxLength: 50,
      disabled: () => true // 不可編輯,由對話框帶入
    },
    {
      field: 'VEN_No',
      header: '廠客代號',
      type: 'input',
      maxLength: 20,
      disabled: () => true // 不可編輯,由對話框帶入
    },
    {
      field: 'NoteDesc',
      header: '摘要代號',
      type: 'input',
      maxLength: 100,
      disabled: () => true // 不可編輯,由對話框帶入
    },
    {
      field: 'RCV_Amt',
      header: '收款金額',
      type: 'inputNumber',
      minFractionDigits: 2,
      maxFractionDigits: 2,
      min: 0,
      textAlign: 'right',
      aggregate: 'sum',
      format: (value: number) => value?.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
      disabled: () => true // 不可編輯,由對話框帶入
    }
  ];

  // 應收未收查詢對話框
  showARDialog = false;
  arDialogLoading = false;
  arDialogTotalRecords = 0;
  arQueryForm = this.formBuilder.group({
    STO_No: [''],
    VEN_No: [''],
    DateFrom: [null as Date | null],
    DateTo: [null as Date | null],
    pageSize: [20],
    pageIndex: [1],
    SortBy: [[{ field: 'VEN_No', order: 1 }]],
  });
  arDialogData: QueryFIN32030ARResponse[] = [];
  arDialogColumns: Column[] = [
    { field: 'ARS_ID', header: '應收ID', visible: true },
    { field: 'VEN_No', header: '廠客代號', visible: true },
    { field: 'VEN_Name', header: '廠客名稱', visible: true },
    { field: 'ARS_Amt', header: '應收金額', visible: true, format: formatAmountWithFraction, style: 'text-align: right' },
    { field: 'ARS_Date', header: '立帳日', visible: true, format: formatDate },
    { field: 'PaidAmt', header: '已收款金額', visible: true, format: formatAmountWithFraction, style: 'text-align: right' },
    { field: 'UnpaidAmt', header: '未收款金額', visible: true, format: formatAmountWithFraction, style: 'text-align: right' },
    { field: 'PTA_Date', header: '預計收款日', visible: true, format: formatDate },
    { field: 'NoteDesc', header: '摘要', visible: true },
  ];

  // 步驟2: 收款項目表格資料
  step2TableData: any[] = [];
  step2Columns: EditColumn[] = [
    {
      field: 'CAP_Item',
      header: '收款項目',
      type: 'dropdown',
      options: () => this.recvItemOptions,
      optionLabel: 'CAP_Name', // 使用 CAP_Name 作為顯示欄位
      optionValue: 'CAP_Item',
      showClear: true,
      validate: [
        (value: any) => ({
          isValid: !!value,
          errorMessage: ['收款項目為必填']
        })
      ]
    },
    {
      field: 'ARS_Amt',
      header: '收款金額',
      type: 'inputNumber',
      minFractionDigits: 2,
      maxFractionDigits: 2,
      min: 0,
      textAlign: 'right',
      aggregate: 'sum',
      format: (value: number) => value?.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
      validate: [
        (value: any) => ({
          isValid: value !== null && value !== undefined && value >= 0,
          errorMessage: ['收款金額為必填且必須大於等於0']
        })
      ]
    },
    {
      field: 'NoteDesc',
      header: '備註',
      type: 'input',
      maxLength: 100
    }
  ];

  // 步驟3: 票據資訊表格資料
  step3TableData: any[] = [];
  step3Columns: EditColumn[] = [
    {
      field: 'CHK_No',
      header: '票據號碼',
      type: 'input',
      maxLength: 50,
      validate: [
        (value: any) => ({
          isValid: !!value,
          errorMessage: ['票據號碼為必填']
        })
      ]
    },
    {
      field: 'VEN_No',
      header: '廠客代號',
      type: 'input'
    },
    {
      field: 'BNK_No',
      header: '全省銀行代號',
      type: 'input',
      validate: [
        (value: any) => ({
          isValid: !!value,
          errorMessage: ['全省銀行代號為必填']
        })
      ]
    },
    {
      field: 'BNK_AccNo',
      header: '客戶銀行帳號',
      type: 'input'
    },
    {
      field: 'BNK_BranchNo',
      header: '分行代號',
      type: 'input',
      validate: [
        (value: any) => ({
          isValid: !!value,
          errorMessage: ['分行代號為必填']
        })
      ]
    },
    {
      field: 'CHK_ReceDate',
      header: '收票日',
      type: 'date',
      dateFormat: 'yy/mm/dd'
    },
    {
      field: 'CHK_ExpireDate',
      header: '到期日',
      type: 'date',
      dateFormat: 'yy/mm/dd',
      validate: [
        (value: any) => ({
          isValid: !!value,
          errorMessage: ['到期日為必填']
        })
      ]
    },
    {
      field: 'CHK_PreDate',
      header: '預兌日',
      type: 'date',
      dateFormat: 'yy/mm/dd'
    },
    {
      field: 'CHK_Amt',
      header: '票面金額',
      type: 'inputNumber',
      minFractionDigits: 2,
      maxFractionDigits: 2,
      min: 0,
      textAlign: 'right',
      aggregate: 'sum',
      format: (value: number) => value?.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
      validate: [
        (value: any) => ({
          isValid: value !== null && value !== undefined && value >= 0,
          errorMessage: ['票面金額為必填且必須大於等於0']
        })
      ]
    },
    {
      field: 'CHK_Type',
      header: '票據種類',
      type: 'dropdown',
      options: () => this.checkTypeOptions,
      optionLabel: 'label',
      optionValue: 'value',
      defaultValueFunction: () => '1'
    },
    {
      field: 'Ticket_YN',
      header: '是否客票',
      type: 'dropdown',
      options: () => this.ticketYNOptions,
      optionLabel: 'label',
      optionValue: 'value',
      defaultValueFunction: () => 'N'
    },
    {
      field: 'CHK_Comment',
      header: '備註',
      type: 'input',
      maxLength: 200
    }
  ];

  // 收款項目下拉選項 (從查詢結果中取得)
  recvItemOptions: { CAP_Item?: string | null; CAP_Name?: string | null }[] = [];

  // 業務員下拉選項 (TODO: 需要從 API 載入)
  salesOptions: any[] = [];

  // 票據種類選項
  checkTypeOptions = [
    { label: '支票', value: '1' },
    { label: '本票', value: '2' },
    { label: '匯票', value: '3' }
  ];

  // 是否客票選項
  ticketYNOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ];

  // 銀行下拉選項 (TODO: 需要從 API 載入)
  bankOptions: any[] = [];
  branchOptions: any[] = [];

  constructor(
    private readonly fin32030Service: FIN32030Service,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN32030', this.step1Form);

    // TODO: 載入業務員選項
    // this.loadSalesOptions();

    // 初始化一筆空白收款項目資料(避免表格錯位)
    if (this.isFormCreateable) {
      this.step2TableData = [{
        CAP_Item: null,
        ARS_Amt: null,
        NoteDesc: ''
      }];
    }

    // 檢視/編輯模式：載入收款資料
    if ((this.isFormReadable || this.isFormEditable) && this.rowdata) {
      const headerData = this.rowdata as QueryFIN32030Response;
      this.loadRecvData(headerData);

      // 檢視模式才需要禁用表單
      if (this.isFormReadable) {
        this.step1Form.disable();
      }
    }
  }

  // ----------------------------------------------------------------
  // 按鈕切換控制
  // ----------------------------------------------------------------

  /** 切換顯示的步驟 */
  switchButton(buttonID: number): void {
    this.buttonID = buttonID;

    // 切換到步驟2(票據明細)時,強制重新賦值以觸發 table-edit 的 ngOnChanges
    if (buttonID === 2 && this.step3TableData.length > 0) {
      setTimeout(() => {
        this.step3TableData = [...this.step3TableData];
        this.cdr.detectChanges();
        console.log('切換到步驟2 - 強制更新 step3TableData');
      }, 0);
    }
  }

  /** 驗證步驟1: 收款基本資料與收款項目 */
  validateStep1(): boolean {
    this.step1Form.markAllAsTouched();
    if (this.step1Form.invalid) {
      this.messageService.errorBubble('請填寫必填欄位');
      return false;
    }
    if (this.step2TableData.length === 0) {
      this.messageService.errorBubble('請至少新增一個收款項目');
      return false;
    }
    return true;
  }

  // ----------------------------------------------------------------
  // 應收帳款相關 (步驟3使用)
  // ----------------------------------------------------------------

  /** 打開應收未收查詢對話框 */
  openARDialog(): void {
    this.showARDialog = true;
    // 重置查詢表單
    this.arQueryForm.reset({
      STO_No: '',
      VEN_No: '',
      DateFrom: null,
      DateTo: null,
      pageSize: 20,
      pageIndex: 1,
      SortBy: [{ field: 'VEN_No', order: 1 }],
    });
    // 清空查詢結果
    this.arDialogData = [];
    this.arDialogTotalRecords = 0;
  }

  /** 關閉應收未收查詢對話框 */
  closeARDialog(): void {
    this.showARDialog = false;
    this.arDialogData = [];
  }

  /** 查詢應收未收 */
  onQueryAR(): void {
    const formValue = this.arQueryForm.value;

    const queryParams = {
      STO_No: formValue.STO_No || undefined,
      VEN_No: formValue.VEN_No || undefined,
      DateFrom: formValue.DateFrom ? (formValue.DateFrom as Date).toISOString() : undefined,
      DateTo: formValue.DateTo ? (formValue.DateTo as Date).toISOString() : undefined,
      PageIndex: formValue.pageIndex ?? 1,
      PageSize: formValue.pageSize ?? 20,
      SortBy: formValue.SortBy || undefined,
    };

    this.arDialogLoading = true;
    this.fin32030Service.queryFIN32030AR(queryParams)
      .pipe(
        finalize(() => this.arDialogLoading = false),
        untilDestroyed(this)
      )
      .subscribe(response => {
        // 過濾掉已選擇的應收帳款 (不可重複選擇)
        const selectedIds = this.step4TableData.map(item => item.ARS_ID);
        this.arDialogData = response.Data.filter(ar => !selectedIds.includes(ar.ARS_ID));
        this.arDialogTotalRecords = response.TotalCount;
      });
  }

  /** 確認選擇應收帳款 (點擊確定按鈕) */
  confirmARSelection(): void {
    const selected = this.arDialogTable?.selectedItems as QueryFIN32030ARResponse[];

    if (!selected || selected.length === 0) {
      this.messageService.errorBubble('請至少選擇一筆應收帳款');
      return;
    }

    // 檢查是否有重複 (雙重保險)
    const selectedIds = this.step4TableData.map(item => item.ARS_ID);
    const newItems = selected.filter(item => !selectedIds.includes(item.ARS_ID));

    if (newItems.length === 0) {
      this.messageService.errorBubble('所選應收帳款已存在');
      return;
    }

    // 將選中的應收帳款加入表格 (使用 UnpaidAmt 作為 RCV_Amt)
    const newData: ARWithRCVAmt[] = newItems.map(ar => ({
      ...ar,
      RCV_Amt: ar.UnpaidAmt || 0 // 預設收款金額為未收款金額
    }));

    // 使用新陣列來觸發 Angular 變更檢測
    this.step4TableData = [...this.step4TableData, ...newData];

    this.showARDialog = false;
    this.messageService.successBubble(`已新增 ${newItems.length} 筆應收帳款`);
  }

  /** 應收帳款表格資料變更事件 */
  onStep4DataChange(data: ARWithRCVAmt[]): void {
    this.step4TableData = data;
  }

  /** 計算應收帳款總金額 */
  get totalARAmount(): number {
    return this.step4TableData.reduce((sum: number, item: ARWithRCVAmt) => sum + (item.RCV_Amt || 0), 0);
  }

  // ----------------------------------------------------------------
  // 收款項目相關 (步驟1使用)
  // ----------------------------------------------------------------

  /** 計算收款項目總金額 */
  get totalItemAmount(): number {
    return this.step2TableData.reduce((sum, item) => sum + (item.ARS_Amt || 0), 0);
  }

  /** 收款項目表格資料變更事件 */
  onStep2DataChange(data: any[]): void {
    this.step2TableData = data;
  }

  // ----------------------------------------------------------------
  // 票據資訊相關 (步驟2使用)
  // ----------------------------------------------------------------

  /** 計算票據總金額 */
  get totalCheckAmount(): number {
    return this.step3TableData.reduce((sum, item) => sum + (item.CHK_Amt || 0), 0);
  }

  /** 票據資訊表格資料變更事件 */
  onStep3DataChange(data: any[]): void {
    this.step3TableData = data;
  }

  // ----------------------------------------------------------------
  // API 資料載入
  // ----------------------------------------------------------------

  /** 載入收款資料 (檢視/編輯模式) */
  loadRecvData(headerData: QueryFIN32030Response): void {
    this.fin32030Service.queryFIN32030RecvAll({ RCV_No: headerData.RCV_No })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        if (response.Data && response.Data.length > 0) {
          const recvData = response.Data[0];

          // 填入步驟1表單資料
          this.step1Form.patchValue({
            RCV_No: recvData.RCV_No || '',
            RCV_Date: recvData.RCV_Date ? new Date(recvData.RCV_Date) : new Date(),
            Sales_Id: recvData.Sales_Id,
            Remark: recvData.Remark || ''
          });

          // 清空所有表格資料(避免與初始化的空白資料混在一起)
          this.step2TableData = [];
          this.step3TableData = [];
          this.step4TableData = [];

          // 載入收款項目明細 (步驟2)
          if (recvData.RecvItemsJson) {
            try {
              const recvItems: RecvItemFromJson[] = JSON.parse(recvData.RecvItemsJson);
              this.step2TableData = recvItems.map((item: RecvItemFromJson) => ({
                CAP_Item: item.CAP_Item,
                ARS_Amt: item.RCV_Amt, // 注意:API 回傳的是 RCV_Amt 不是 ARS_Amt
                NoteDesc: item.NoteDesc || ''
              }));
              console.log('收款項目明細載入完成:', this.step2TableData);

              // 從收款項目中提取下拉選項 (去重複)
              const uniqueItems = new Map<string, { CAP_Item: string; CAP_Name: string }>();
              recvItems.forEach(item => {
                if (item.CAP_Item && item.CAP_Name) {
                  uniqueItems.set(item.CAP_Item, {
                    CAP_Item: item.CAP_Item,
                    CAP_Name: item.CAP_Name
                  });
                }
              });
              this.recvItemOptions = Array.from(uniqueItems.values());
            } catch (e) {
              console.error('解析收款項目明細失敗:', e);
              this.messageService.errorBubble('載入收款項目明細失敗');
            }
          }

          // 載入票據明細 (步驟3)
          if (recvData.ChecksJson) {
            try {
              const checks: CheckFromJson[] = JSON.parse(recvData.ChecksJson);
              this.step3TableData = checks.map((check: CheckFromJson) => ({
                CHK_No: check.CHK_No,
                CHK_Type: check.CHK_Type || '1',
                CHK_Amt: check.CHK_Amt,
                Ticket_YN: check.Ticket_YN || 'N',
                BNK_No: check.BNK_No,
                BNK_BranchNo: check.BNK_BranchNo,
                BNK_AccNo: check.BNK_AccNo || '',
                VEN_No: check.VEN_No || '',
                CHK_ReceDate: check.CHK_ReceDate ? new Date(check.CHK_ReceDate) : null,
                CHK_ExpireDate: check.CHK_ExpireDate ? new Date(check.CHK_ExpireDate) : null,
                CHK_PreDate: check.CHK_PreDate ? new Date(check.CHK_PreDate) : null,
                CHK_Comment: check.CHK_Comment || ''
              }));
              console.log('票據明細載入完成 - 筆數:', this.step3TableData.length);
              console.log('票據明細載入完成 - 資料:', this.step3TableData);
              console.log('票據明細 CHK_Amt 值:', this.step3TableData.map(x => x.CHK_Amt));
            } catch (e) {
              console.error('解析票據明細失敗:', e);
              this.messageService.errorBubble('載入票據明細失敗');
            }
          }

          // 載入應收沖帳明細 (步驟4)
          if (recvData.ReceiptsJson) {
            try {
              const receipts: ReceiptFromJson[] = JSON.parse(recvData.ReceiptsJson);
              this.step4TableData = receipts.map((receipt: ReceiptFromJson) => ({
                ARS_ID: receipt.ARS_No, // 應收ID
                VEN_No: receipt.VEN_No, // 廠客代號
                NoteDesc: receipt.NoteDesc || '', // 摘要
                RCV_Amt: receipt.ARS_Amt, // 收款金額
                // 保留其他可能需要的欄位
                RCV_Date: receipt.RCV_Date,
                STO_No: receipt.STO_No
              }));
            } catch (e) {
              console.error('解析應收沖帳明細失敗:', e);
              this.messageService.errorBubble('載入應收沖帳明細失敗');
            }
          }

          // 強制創建新陣列參考並延遲觸發變更檢測
          setTimeout(() => {
            console.log('觸發變更檢測前 - step2TableData 筆數:', this.step2TableData.length);
            console.log('觸發變更檢測前 - step3TableData 筆數:', this.step3TableData.length);

            // 創建新陣列參考以確保 ngOnChanges 被觸發
            this.step2TableData = [...this.step2TableData];
            this.step3TableData = [...this.step3TableData];
            this.step4TableData = [...this.step4TableData];

            this.cdr.detectChanges();
            console.log('已觸發變更檢測');
          }, 100);
        }
      });
  }

  // ----------------------------------------------------------------
  // 表單提交
  // ----------------------------------------------------------------

  /** 最終提交 (步驟3完成後) */
  onFinalSubmit(): void {
    // 驗證所有步驟
    this.step1Form.markAllAsTouched();

    if (this.step1Form.invalid) {
      this.messageService.errorBubble('請填寫所有必填欄位');
      return;
    }

    if (this.step2TableData.length === 0) {
      this.messageService.errorBubble('請至少新增一個收款項目');
      return;
    }

    if (this.step4TableData.length === 0) {
      this.messageService.errorBubble('請至少新增一筆應收帳款');
      return;
    }

    this.loading = true;

    const step1Value = this.step1Form.getRawValue();

    // 準備收款資料
    const recvRequest = {
      STO_No: '', // TODO: 從登入使用者取得組織代號
      RCV_No: step1Value.RCV_No || this.generateRCVNo(),
      RCV_Date: step1Value.RCV_Date.toISOString(),
      Sales_Id: step1Value.Sales_Id,
      CompNo: '', // TODO: 從登入使用者取得公司代號
      VouNo: null,
      Remark: step1Value.Remark,
      Status: 'A',
      UserId: '', // TODO: 從登入使用者取得
      UserName: '', // TODO: 從登入使用者取得
      Detail: this.step2TableData.map((item: any) => ({
        CAP_Item: item.CAP_Item,
        ARS_Amt: item.ARS_Amt,
        NoteDesc: item.NoteDesc
      }))
    };

    // 先儲存收款資料
    const recvApiCall = this.isFormCreateable
      ? this.fin32030Service.insertFIN32030Recv(recvRequest)
      : this.fin32030Service.updateFIN32030Recv(recvRequest);

    recvApiCall
      .pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          // 如果有票據資料，繼續儲存票據
          if (this.step3TableData && this.step3TableData.length > 0) {
            this.submitCheckData(recvRequest.RCV_No, this.step3TableData);
          } else {
            this.messageService.successBubble(
              this.isFormCreateable ? '新增收款沖帳成功' : '更新收款沖帳成功'
            );
            setTimeout(() => {
              this.onCancel();
            }, 500);
          }
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  /** 提交票據資料 */
  private submitCheckData(rcvNo: string, checks: any[]): void {
    const checkRequest = {
      STO_No: '', // TODO: 從登入使用者取得組織代號
      RCV_No: rcvNo,
      Sales_Id: this.step1Form.value.Sales_Id || '',
      UserId: '', // TODO: 從登入使用者取得
      UserName: '', // TODO: 從登入使用者取得
      Checks: checks.map((check: any) => ({
        CHK_No: check.CHK_No,
        VEN_No: check.VEN_No,
        BNK_No: check.BNK_No,
        BNK_BranchNo: check.BNK_BranchNo,
        BNK_AccNo: check.BNK_AccNo,
        CHK_ReceDate: check.CHK_ReceDate,
        CHK_ExpireDate: check.CHK_ExpireDate,
        CHK_PreDate: check.CHK_PreDate,
        CHK_Amt: check.CHK_Amt,
        CHK_Type: check.CHK_Type,
        Ticket_YN: check.Ticket_YN,
        CHK_Comment: check.CHK_Comment,
        AccNo: check.AccNo,
        ORG_ID: check.ORG_ID,
        ProjectNo: check.ProjectNo
      }))
    };

    const checkApiCall = this.isFormCreateable
      ? this.fin32030Service.insertFIN32030Check(checkRequest)
      : this.fin32030Service.updateFIN32030Check(checkRequest);

    checkApiCall
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.messageService.successBubble(
            this.isFormCreateable ? '新增收款沖帳成功(含票據)' : '更新收款沖帳成功(含票據)'
          );
          setTimeout(() => {
            this.onCancel();
          }, 500);
        },
        error: () => {
          this.messageService.errorBubble('票據資料儲存失敗');
        }
      });
  }

  /** 產生收款單號 (R+YYYYMMDDXXX) */
  private generateRCVNo(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `R${year}${month}${day}${random}`;
  }
}
