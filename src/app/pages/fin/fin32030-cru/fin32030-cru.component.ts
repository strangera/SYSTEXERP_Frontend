import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from "@shared/componentkit/calendar-range/calendar-range.component";
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';
import {
  FIN32030Service,
  InsertFIN32030CompleteRequest,
  QueryFIN32030ARResponse,
  QueryFIN32030Response,
  UpdateFIN32030CompleteRequest
} from '../../../service/api/fin/fin32030.service';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
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
  STO_No?: string | null;
  RCV_Date?: string | null;
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
      type: 'dropdown',
      options: () => this.vendorOptions,
      optionLabel: 'label',
      optionValue: 'value',
      showClear: true,
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
      optionLabel: 'label', // 顯示格式: CAP_Item - CAP_Name
      optionValue: 'value', // 值為 CAP_Item
      showClear: true,
      validate: [
        (value: string) => ({
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
        (value: number) => ({
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
  step3FooterData: { CHK_Amt?: number } = {}; // 票據明細的 footer 資料
  step3Columns: EditColumn[] = [
    {
      field: 'CHK_No',
      header: '票據號碼',
      type: 'input',
      maxLength: 50,
      validate: [
        (value: string) => ({
          isValid: !!value,
          errorMessage: ['票據號碼為必填']
        })
      ]
    },
    {
      field: 'VEN_No',
      header: '廠客代號',
      type: 'dropdown',
      options: () => this.vendorOptions,
      optionLabel: 'label',
      optionValue: 'value',
      showClear: true,
      width: '250px'
    },
    {
      field: 'BNK_All',
      header: '銀行代號',
      type: 'dropdown',
      options: () => this.bankBranchOptions,
      optionLabel: 'label',
      optionValue: 'value',
      showClear: true,
      width: '300px',
      calculate: (_rowData, newValue: string) => {
        // 選擇銀行後自動帶入分行代號和帳號長度
        const selectedBank = this.bankBranchOptions.find(b => b.value === newValue);
        if (selectedBank) {
          console.log('選擇銀行:', selectedBank.label, 'ACC_LEN:', selectedBank.ACC_LEN);
          return {
            BNK_No: selectedBank.BNK_No,
            BNK_BranchNo: selectedBank.BNK_BranchNo,
            ACC_LEN: selectedBank.ACC_LEN || 0,
            ACC_LEN_MAX: selectedBank.ACC_LEN_MAX || 0
          };
        } else {
          return {
            BNK_No: '',
            BNK_BranchNo: '',
            ACC_LEN: 0,
            ACC_LEN_MAX: 0,
            BNK_AccNo: '' // 清空帳號
          };
        }
      },
      validate: [
        (value: string) => ({
          isValid: !!value,
          errorMessage: ['銀行代號為必填']
        })
      ]
    },
    {
      field: 'BNK_BranchNo',
      header: '分行代號',
      type: 'input',
      disabled: () => true // 自動帶入,不可編輯
    },
    {
      field: 'BNK_AccNo',
      header: '客戶銀行帳號',
      type: 'input',
      maxLength: 20,
      onBlur: (rowData, value) => {
        // 即時驗證：離開欄位時檢查長度
        const accLen = rowData.ACC_LEN || 0;
        if (value && accLen > 0 && value.length !== accLen) {
          // 顯示提示訊息但不阻擋
          console.warn(`客戶銀行帳號長度不符 - 預期: ${accLen} 碼，實際: ${value.length} 碼`);
        }
      },
      validate: [
        (value: string, rowData) => {
          if (!value) return { isValid: true, errorMessage: [] }; // 非必填

          const accLen = rowData.ACC_LEN || 0;
          if (accLen > 0 && value.length !== accLen) {
            return { isValid: false, errorMessage: [`客戶銀行帳號必須為 ${accLen} 碼（目前 ${value.length} 碼）`] };
          }

          return { isValid: true, errorMessage: [] };
        }
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
        (value: Date) => ({
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

  // 收款項目下拉選項 (格式: CAP_Item - CAP_Name)
  recvItemOptions: { label: string; value: string }[] = [];

  // 業務員下拉選項 (格式: Sales_Id - User_Name)
  salesOptions: { label: string; value: string }[] = [];

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

  // 銀行分行下拉選項 (格式: BNK_All - BNK_Name (BNK_BranchName))
  bankBranchOptions: {
    label: string;
    value: string;
    BNK_No: string;
    BNK_BranchNo: string;
    ACC_LEN?: number;
    ACC_LEN_MAX?: number;
  }[] = [];

  // 廠客代號下拉選項 (格式: VEN_No - Name)
  vendorOptions: { label: string; value: string }[] = [];

  constructor(
    private readonly fin32030Service: FIN32030Service,
    private readonly dropDownListService: DropDownListService,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN32030', this.step1Form);

    // 初始化一筆空白收款項目資料(避免表格錯位)
    if (this.isFormCreateable) {
      this.step2TableData = [{
        CAP_Item: null,
        ARS_Amt: null,
        NoteDesc: ''
      }];
    }

    // 載入下拉選單資料，完成後再載入收款資料
    this.loadDropdownOptions();
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
    const total = this.step3TableData.reduce((sum, item) => sum + (item.CHK_Amt || 0), 0);
    console.log('totalCheckAmount 計算:', total, '資料:', this.step3TableData);
    return total;
  }

  /** 票據資訊表格資料變更事件 */
  onStep3DataChange(data: { CHK_Amt?: number; _isAutoInsertCandidate?: boolean }[]): void {
    this.step3TableData = data;

    // 重新計算票據總金額
    const totalAmount = this.step3TableData
      .filter(item => !item._isAutoInsertCandidate) // 排除新增候選行
      .reduce((sum, item) => sum + (item.CHK_Amt || 0), 0);
    this.step3FooterData = { CHK_Amt: totalAmount };
  }

  // ----------------------------------------------------------------
  // API 資料載入
  // ----------------------------------------------------------------

  /** 載入下拉選單資料 */
  loadDropdownOptions(): void {
    // 使用 forkJoin 等待所有下拉選單載入完成
    forkJoin({
      recvItems: this.fin32030Service.queryCapItemDropdown(),
      vendors: this.dropDownListService.queryPOS2013_DropDownList({ VEN_Flag: '1' }),
      banks: this.fin32030Service.queryBankBranchDropdown(),
      sales: this.fin32030Service.queryARS1001Dropdown()
    })
      .pipe(untilDestroyed(this))
      .subscribe(results => {
        // 載入收款項目下拉選單
        if (results.recvItems.Data) {
          this.recvItemOptions = results.recvItems.Data.map(item => ({
            label: `${item.CAP_Item || ''} - ${item.CAP_Name || ''}`,
            value: item.CAP_Item || ''
          }));
          console.log('收款項目下拉選單載入完成:', this.recvItemOptions.length, '筆');
        }

        // 載入廠客代號下拉選單
        if (results.vendors.Data) {
          this.vendorOptions = results.vendors.Data.map(item => ({
            label: `${item.VEN_No || ''} - ${item.Name || ''}`,
            value: item.VEN_No || ''
          }));
          console.log('廠客代號下拉選單載入完成:', this.vendorOptions.length, '筆');
        }

        // 載入銀行分行下拉選單
        if (results.banks.Data) {
          this.bankBranchOptions = results.banks.Data.map(item => ({
            label: `${item.BNK_All || ''} - ${item.BNK_Name || ''}${item.BNK_BranchName ? `(${item.BNK_BranchName})` : ''}`,
            value: item.BNK_All || '',
            BNK_No: item.BNK_No || '',
            BNK_BranchNo: item.BNK_BranchNo || '',
            ACC_LEN: item.ACC_LEN || 0,
            ACC_LEN_MAX: item.ACC_LEN_MAX || 0
          }));
          console.log('銀行分行下拉選單載入完成:', this.bankBranchOptions.length, '筆');
        }

        // 載入業務員下拉選單
        if (results.sales.Data) {
          this.salesOptions = results.sales.Data.map(item => ({
            label: `${item.Sales_Id || ''} - ${item.User_Name || ''}`,
            value: item.Sales_Id || ''
          }));
          console.log('業務員下拉選單載入完成:', this.salesOptions.length, '筆');
        }

        // 所有下拉選單載入完成後，如果是檢視/編輯模式，載入收款資料
        if ((this.isFormReadable || this.isFormEditable) && this.rowdata) {
          const headerData = this.rowdata as QueryFIN32030Response;
          this.loadRecvData(headerData);

          // 檢視模式才需要禁用表單
          if (this.isFormReadable) {
            this.step1Form.disable();
          }
        }
      });
  }

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
          if (recvData.RecvItems && recvData.RecvItems.length > 0) {
            // API 回傳的欄位: RCV_Amt (不是 ARS_Amt), CAP_Name (不是 CAP_ItemName)
            this.step2TableData = (recvData.RecvItems as any[]).map((item: any) => ({
              CAP_Item: item.CAP_Item || '',
              ARS_Amt: item.RCV_Amt || 0, // API 使用 RCV_Amt
              NoteDesc: item.NoteDesc || ''
            }));
            console.log('收款項目明細載入完成:', this.step2TableData);
          }

          // 載入票據明細 (步驟3)
          if (recvData.Checks && recvData.Checks.length > 0) {
            console.log('API 回傳的原始票據資料:', JSON.parse(JSON.stringify(recvData.Checks)));

            // API 回傳的是完整的票據欄位結構
            this.step3TableData = (recvData.Checks as any[])
              .filter((check: any) => check !== null) // 過濾掉 null 的資料
              .map((check: any) => {
                // 優先使用 API 提供的 BNK_All，如果沒有則使用 BNK_No（因為 BNK_No 可能已經是完整代號）
                const bnkAll = check.BNK_All || check.BNK_No || '';
                const bnkNo = check.BNK_No || '';
                const bnkBranchNo = check.BNK_BranchNo || '';

                console.log('票據資料 -', {
                  CHK_No: check.CHK_No,
                  原始BNK_All: check.BNK_All,
                  原始BNK_No: check.BNK_No,
                  原始BNK_BranchNo: check.BNK_BranchNo,
                  使用的BNK_All: bnkAll
                });

                // 從 bankBranchOptions 找到對應的銀行資料以取得帳號長度
                const selectedBank = this.bankBranchOptions.find(b => b.value === bnkAll);

                if (!selectedBank && bnkAll) {
                  console.warn(`找不到銀行選項: "${bnkAll}"，前5個可用選項:`,
                    this.bankBranchOptions.slice(0, 5).map(b => b.value));
                } else if (selectedBank) {
                  console.log(`找到銀行: ${selectedBank.label}, ACC_LEN: ${selectedBank.ACC_LEN}`);
                }

                const accLen = selectedBank?.ACC_LEN || 0;
                const accLenMax = selectedBank?.ACC_LEN_MAX || 0;

                console.log(`設定 rowData - ACC_LEN: ${accLen}, ACC_LEN_MAX: ${accLenMax}`);

                return {
                  CHK_No: check.CHK_No || '',
                  CHK_Type: check.CHK_Type || '1',
                  CHK_Amt: check.CHK_Amt || 0,
                  Ticket_YN: check.Ticket_YN || 'N',
                  BNK_All: bnkAll, // 銀行代號 (用於 dropdown 的 value)
                  BNK_No: selectedBank?.BNK_No || bnkNo,
                  BNK_BranchNo: selectedBank?.BNK_BranchNo || bnkBranchNo,
                  BNK_AccNo: check.BNK_AccNo || '',
                  ACC_LEN: accLen,
                  ACC_LEN_MAX: accLenMax,
                  VEN_No: check.VEN_No || '',
                  CHK_ReceDate: check.CHK_ReceDate ? new Date(check.CHK_ReceDate) : null,
                  CHK_ExpireDate: check.CHK_ExpireDate ? new Date(check.CHK_ExpireDate) : null,
                  CHK_PreDate: check.CHK_PreDate ? new Date(check.CHK_PreDate) : null,
                  CHK_Comment: check.CHK_Comment || '',
                  AccNo: check.AccNo || '',
                  ORG_ID: check.ORG_ID || '',
                  ProjectNo: check.ProjectNo || ''
                };
              });

            // 計算票據總金額
            const totalAmount = this.step3TableData.reduce((sum, item) => sum + (item.CHK_Amt || 0), 0);
            this.step3FooterData = { CHK_Amt: totalAmount };

            console.log('票據明細載入完成 - 筆數:', this.step3TableData.length);
            console.log('票據明細載入完成 - 資料:', this.step3TableData);
            console.log('票據明細 CHK_Amt 值:', this.step3TableData.map(x => x.CHK_Amt));
            console.log('票據明細 Footer 資料:', this.step3FooterData);
          }

          // 載入應收沖帳明細 (步驟4)
          if (recvData.Receipts && recvData.Receipts.length > 0) {
            // API 回傳的欄位: ARS_No (不是 ARS_ID), 沒有 VEN_Name、WriteOffAmt 等欄位
            this.step4TableData = (recvData.Receipts as any[]).map((receipt: any) => ({
              ARS_ID: receipt.ARS_No || '', // API 使用 ARS_No (不是 ARS_ID)
              VEN_No: receipt.VEN_No || '', // 廠客代號
              ARS_Amt: receipt.ARS_Amt || 0, // 應收金額
              RCV_Amt: receipt.ARS_Amt || 0, // 收款金額(預設等於應收金額)
              STO_No: receipt.STO_No || '',
              RCV_Date: receipt.RCV_Date || ''
            }));
            console.log('應收沖帳明細載入完成:', this.step4TableData);
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

  /** 最終提交 (步驟3完成後) - 使用 Complete API 一次處理收款、票據、帳款 */
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

    // 準備收款項目明細
    const recvDetails = this.step2TableData
      .filter((item: { CAP_Item?: string; ARS_Amt?: number }) => item.CAP_Item && item.ARS_Amt !== null && item.ARS_Amt !== undefined)
      .map((item: { CAP_Item: string; ARS_Amt: number; NoteDesc?: string }) => ({
        CAP_Item: item.CAP_Item,
        ARS_Amt: item.ARS_Amt,
        NoteDesc: item.NoteDesc || null
      }));

    // 準備票據明細
    const checkDetails = this.step3TableData
      .filter((check: { CHK_No?: string }) => check.CHK_No)
      .map((check: {
        CHK_No: string;
        VEN_No?: string;
        BNK_No: string;
        BNK_BranchNo: string;
        BNK_AccNo?: string;
        CHK_ReceDate?: Date;
        CHK_ExpireDate: Date;
        CHK_PreDate?: Date;
        CHK_Amt: number;
        CHK_Type?: string;
        Ticket_YN?: string;
        CHK_Comment?: string;
        AccNo?: string;
        ORG_ID?: string;
        ProjectNo?: string;
      }) => ({
        CHK_No: check.CHK_No,
        VEN_No: check.VEN_No || null,
        BNK_No: check.BNK_No,
        BNK_BranchNo: check.BNK_BranchNo,
        BNK_AccNo: check.BNK_AccNo || null,
        CHK_ReceDate: check.CHK_ReceDate ? check.CHK_ReceDate.toISOString() : null,
        CHK_ExpireDate: check.CHK_ExpireDate.toISOString(),
        CHK_PreDate: check.CHK_PreDate ? check.CHK_PreDate.toISOString() : null,
        CHK_Amt: check.CHK_Amt,
        CHK_Type: check.CHK_Type || null,
        Ticket_YN: check.Ticket_YN || null,
        CHK_Comment: check.CHK_Comment || null,
        AccNo: check.AccNo || null,
        ORG_ID: check.ORG_ID || null,
        ProjectNo: check.ProjectNo || null
      }));

    // 準備應收沖帳明細
    const arDetails = this.step4TableData
      .filter((ar: ARWithRCVAmt) => ar.ARS_ID && ar.RCV_Amt !== null && ar.RCV_Amt !== undefined)
      .map((ar: ARWithRCVAmt) => ({
        STO_No: '', // 後端會自動填入
        RCV_No: step1Value.RCV_No || '',
        RCV_Date: step1Value.RCV_Date.toISOString(),
        VEN_No: ar.VEN_No || '',
        ARS_No: ar.ARS_ID || '',
        Remit_No: null,
        Check_No: null,
        CHK_No: null,
        ARS_Amt: ar.RCV_Amt || 0,
        ARS_Status: 'A'
      }));

    // 新增模式：使用 insertFIN32030Complete
    if (this.isFormCreateable) {
      const insertRequest: InsertFIN32030CompleteRequest = {
        STO_No: '', // 後端會自動填入
        RCV_No: null, // 後端自動產生
        RCV_Date: step1Value.RCV_Date.toISOString(),
        Sales_Id: step1Value.Sales_Id || null,
        CompNo: '', // 後端會自動填入
        VouNo: null,
        Remark: step1Value.Remark || null,
        Status: 'A',
        UserId: '', // 後端會自動填入
        UserName: '', // 後端會自動填入
        RecvDetails: recvDetails,
        CheckDetails: checkDetails.length > 0 ? checkDetails : null,
        ARDetails: arDetails.length > 0 ? arDetails : null
      };

      this.fin32030Service.insertFIN32030Complete(insertRequest)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: () => {
            this.messageService.successBubble('新增收款沖帳成功');
            setTimeout(() => {
              this.onCancel();
            }, 500);
          },
          error: () => {
            this.loading = false;
          }
        });
    }
    // 編輯模式：使用 updateFIN32030Complete
    else {
      const updateRequest: UpdateFIN32030CompleteRequest = {
        STO_No: '', // 後端會自動填入
        RCV_No: step1Value.RCV_No || '',
        RCV_Date: step1Value.RCV_Date.toISOString(),
        Sales_Id: step1Value.Sales_Id || null,
        CompNo: '', // 後端會自動填入
        VouNo: null,
        Remark: step1Value.Remark || null,
        Status: 'A',
        UserId: '', // 後端會自動填入
        UserName: '', // 後端會自動填入
        RecvDetails: recvDetails,
        CheckDetails: checkDetails.length > 0 ? checkDetails : null,
        ARDetails: null // 編輯模式的應收沖帳明細由後端處理
      };

      this.fin32030Service.updateFIN32030Complete(updateRequest)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: () => {
            this.messageService.successBubble('更新收款沖帳成功');
            setTimeout(() => {
              this.onCancel();
            }, 500);
          },
          error: () => {
            this.loading = false;
          }
        });
    }
  }
}
