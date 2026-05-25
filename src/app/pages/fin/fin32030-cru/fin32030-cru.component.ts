import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from "@shared/componentkit/calendar-range/calendar-range.component";
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';
import {
  FIN32030Service,
  InsertFIN32030CompleteRequest,
  QueryAbatAcctResponse,
  QueryCapItemDropdownResponse,
  QueryFIN32030ARResponse,
  QueryFIN32030Response
} from '../../../service/api/fin/fin32030.service';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, formatAmountWithFraction, formatDate } from '../../../shared/componentkit/table/table.model';


// 擴展應收帳款類型,添加收款金額欄位
interface ARWithRCVAmt extends QueryFIN32030ARResponse {
  RCV_Amt?: number | null;
  STO_No?: string | null;
  RCV_Date?: string | null;
  Id?: number | null; // 編輯模式時需要的 ID
}

//1.3.2.3 收款沖帳維護 CRU
@Component({
  selector: 'app-fin32030-cru',
  templateUrl: './fin32030-cru.component.html',
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

  // 票據總金額（來自收款明細中「應收票據」會計科目的金額）
  billTotalAmountControl = new FormControl<number | null>({ value: 0, disabled: true });

  // 步驟3: 應收帳款表格資料 (從對話框選擇後自動帶入,不可手動編輯)
  step4TableData: ARWithRCVAmt[] = [];
  // 當前正在編輯的列索引 (用於彈跳視窗選擇後替換)
  currentEditingRowIndex: number | null = null;
  step4Columns: EditColumn[] = [
    {
      field: 'ARS_ID',
      header: '應收ID',
      type: 'input',
      maxLength: 50,
      placeholder: '點擊選擇...',
      onFocus: (_rowData: ARWithRCVAmt, _value: string | null, _col: EditColumn, index: number) => {
        // 點擊時開啟彈跳視窗
        if (!this.isFormReadable) {
          this.openARDialogForRow(index);
        }
      },
      disabled: () => this.isFormReadable // 檢視模式不可點擊
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
      minFractionDigits: 0,
      maxFractionDigits: 0,
      min: 0,
      textAlign: 'right',
      aggregate: 'sum',
      format: (value: number) => value?.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0',
      disabled: () => this.isFormReadable // 檢視模式不可編輯,新增/編輯模式可編輯
    }
  ];

  // 應收未收查詢對話框
  showARDialog = false;
  arDialogLoading = false;
  arDialogTotalRecords = 0;
  arDialogSelectedItem: QueryFIN32030ARResponse | null = null; // 單選模式下選中的資料
  arQueryForm = this.formBuilder.group({
    ARS_ID: [''],
    VEN_No: [null as string | null],
    DateFrom: [null as Date | null],
    DateTo: [null as Date | null],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'VEN_No', order: 1 }]],
  });
  arDialogData: QueryFIN32030ARResponse[] = [];
  arDialogColumns: Column[] = [
    { field: 'ARS_ID', header: '應收ID', visible: true },
    { field: 'VEN_No', header: '廠客代號', visible: true },
    { field: 'VEN_Name', header: '廠客名稱', visible: true },
    { field: 'ARS_Amt', header: '應收金額', visible: true, format: formatAmountWithFraction, align: 'right' },
    { field: 'ARS_Date', header: '立帳日', visible: true, format: formatDate },
    { field: 'PaidAmt', header: '已收款金額', visible: true, format: formatAmountWithFraction, align: 'right' },
    { field: 'UnpaidAmt', header: '未收款金額', visible: true, format: formatAmountWithFraction, align: 'right' },
    { field: 'PTA_Date', header: '預計收款日', visible: true, format: formatDate },
    { field: 'NoteDesc', header: '摘要', visible: true },
  ];

  // 步驟2: 收款項目表格資料
  step2TableData: any[] = [];
  step2Columns: EditColumn[] = [
    {
      field: 'CAP_Item',
      header: '收款代號',
      type: 'input',
      maxLength: 50,
      placeholder: '直接輸入，或雙擊欄位查詢...',
      // onFocus: (_rowData: any, _value: string | null, _col: EditColumn, index: number) => {
      //   if (!this.isFormReadable) {
      //     this.openCapItemDialogForRow(index);
      //   }
      // },
      // 1. 利用內建的 calculate 處理手動輸入：只要代號一變更，立刻自動匹配並帶出名稱！
      calculate: (rowData: any, newValue: string) => {
        if (!newValue) {
          return {
            CAP_Item: null,
            CAP_Name: null,
            AccNo: null,
            ABAT_YN: null,
            AbatAcct: null
          };
        }

        // 從前端預載的快取中匹配資料
        const matchedItem = this.capItemAllData.find(item => item.CAP_Item === newValue);

        if (matchedItem) {
          // 核心：回傳新物件，底層 table-edit 會立刻將這些欄位同步更新到畫面上！
          return {
            CAP_Item: matchedItem.CAP_Item || '',
            CAP_Name: matchedItem.CAP_Name || '',
            AccNo: matchedItem.AccNo || '',
            ABAT_YN: matchedItem.ABAT_YN || '',
            AbatAcct: '' // 收款項目變更，清空舊的沖帳代號
          };
        } else {
          // 找不到代號時，不清除原本打的字，但回傳清空隔壁名稱，方便使用者知道打錯了
          return {
            CAP_Name: '⚠️ 找不到此代號',
            AccNo: null,
            ABAT_YN: null,
            AbatAcct: null
          };
        }
      },
      // 利用 onFocus 監聽原生 HTML 的 dblclick (雙擊) 事件來決定要不要開 Dialog
      onFocus: (_rowData: any, _value: string | null, _col: EditColumn, index: number) => {
        if (this.isFormReadable) return;

        // 取得當前聚焦的 input 元素
        const activeElement = document.activeElement as HTMLInputElement;
        if (activeElement && activeElement.tagName === 'INPUT') {

          // 檢查是否已經綁定過雙擊事件，避免重複綁定
          if (!(activeElement as any)._hasDblClickBound) {
            (activeElement as any)._hasDblClickBound = true;

            // 監聽雙擊事件：只有在使用者 double click 時才觸發彈窗
            activeElement.addEventListener('dblclick', () => {
              this.openCapItemDialogForRow(index);
            });
          }
        }
      },
      // 支援直接手動輸入，當滑鼠離開或 Tab 離開時觸發
      onBlur: (rowData: any, value: string | null, _col: EditColumn, index: number) => {
        if (!value) return;

        // 從前端已經載入的完整選單中，尋找完全符合輸入代號的資料
        const matchedItem = this.capItemAllData.find(item => item.CAP_Item === value);

        if (matchedItem) {
          // 找到了，比照 Dialog 選擇的邏輯，把名稱、科目與沖帳屬性帶進來
          this.step2TableData[index] = {
            ...this.step2TableData[index],
            CAP_Item: matchedItem.CAP_Item || '',
            CAP_Name: matchedItem.CAP_Name || '',
            AccNo: matchedItem.AccNo || '',
            ABAT_YN: matchedItem.ABAT_YN || '',
            AbatAcct: '', // 收款項目變更，清空舊的沖帳代號
          };
          this.step2TableData = [...this.step2TableData]; // 觸發變更檢測
          this.calculateBillTotalAmount(); // 重新計算票據總金額
        } else {
          // 輸入錯誤的代號時給予警示，並清空錯誤的值
          this.messageService.warnBubble(`找不到收款代號: "${value}"，請重新輸入或雙擊欄位進行查詢`);

          this.step2TableData[index] = {
            ...this.step2TableData[index],
            CAP_Item: null,
            CAP_Name: null,
            AccNo: null,
            ABAT_YN: null,
            AbatAcct: null
          };
          this.step2TableData = [...this.step2TableData];
          this.calculateBillTotalAmount();
        }
      },
      disabled: () => this.isFormReadable,
      // validate: [
      //   (value: string) => ({
      //     isValid: !!value,
      //     errorMessage: ['收款項目為必填']
      //   })
      // ],
      validate: [validateRequired]
    },
    {
      field: 'CAP_Name',
      header: '收款名稱',
      type: 'input',
      disabled: () => true
    },
    {
      field: 'ARS_Amt',
      header: '收款金額',
      type: 'inputNumber',
      minFractionDigits: 0,
      maxFractionDigits: 0,
      min: 0,
      textAlign: 'right',
      aggregate: 'sum',
      format: (value: number) => value?.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0',
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
    },
    {
      field: 'AbatAcct',
      header: '沖帳代號',
      type: 'input',
      maxLength: 50,
      placeholder: '點擊選擇...',
      onFocus: (_rowData: any, _value: string | null, _col: EditColumn, index: number) => {
        if (!this.isFormReadable) {
          this.openAbatAcctDialogForRow(index);
        }
      },
      disabled: (_value: any, _index?: number, rowData?: any) => {
        if (this.isFormReadable) return true;
        // 沒有選擇收款項目時不可點擊，或非立沖科目(ABAT_YN != 'Y')時不可點擊
        return !rowData?.AccNo || rowData?.ABAT_YN !== 'Y';
      }
    },
  ];

  // 步驟3: 票據資訊表格資料
  step3TableData: any[] = [];
  step3FooterData: { CHK_Amt?: number } = {}; // 票據明細的 footer 資料
  step3DefaultInsertData: { CHK_Type: string; Ticket_YN: string; AccNo?: string | null } = { CHK_Type: '1', Ticket_YN: 'N' }; // 票據種類預設支票，是否客票預設否
  step3Columns: EditColumn[] = [
    {
      field: 'CHK_No',
      header: '票據號碼',
      type: 'input',
      maxLength: 50,
      width: '120px',
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
      width: '280px'
    },
    {
      field: 'BNK_All',
      header: '銀行代號',
      type: 'dropdown',
      options: () => this.bankBranchOptions,
      optionLabel: 'label',
      optionValue: 'value',
      showClear: true,
      width: '250px',
      // panelStyle: { 'min-width': '420px' },
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
      field: 'BNK_AccNo',
      header: '客戶銀行帳號',
      type: 'input',
      maxLength: 20,
      width: '130px',
      onBlur: (rowData, value) => {
        const accLen = rowData.ACC_LEN || 0;
        if (value && accLen > 0 && value.length !== accLen) {
          this.messageService.warnBubble(`客戶銀行帳號須為 ${accLen} 碼（目前 ${value.length} 碼）`);
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
      dateFormat: 'yy/mm/dd',
      width: '105px'
    },
    {
      field: 'CHK_ExpireDate',
      header: '到期日',
      type: 'date',
      dateFormat: 'yy/mm/dd',
      width: '105px',
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
      dateFormat: 'yy/mm/dd',
      width: '105px'
    },
    {
      field: 'CHK_Amt',
      header: '票面金額',
      type: 'inputNumber',
      minFractionDigits: 0,
      maxFractionDigits: 0,
      min: 0,
      textAlign: 'right',
      aggregate: 'sum',
      format: (value: number) => value?.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0',
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
      width: '85px',
      defaultValueFunction: () => '1'
    },
    {
      field: 'Ticket_YN',
      header: '是否客票',
      type: 'dropdown',
      options: () => this.ticketYNOptions,
      optionLabel: 'label',
      optionValue: 'value',
      width: '85px',
      defaultValueFunction: () => 'N'
    },
    {
      field: 'CHK_Comment',
      header: '備註',
      type: 'input',
      maxLength: 200
    }
  ];

  // 收款項目查詢對話框
  @ViewChild('capItemDialogTable') capItemDialogTable!: TableComponent;
  showCapItemDialog = false;
  capItemDialogLoading = false;
  capItemDialogSelectedItem: QueryCapItemDropdownResponse | null = null;
  currentEditingCapItemRowIndex: number | null = null;
  capItemAllData: QueryCapItemDropdownResponse[] = [];
  capItemDialogData: QueryCapItemDropdownResponse[] = [];
  capItemFilterForm = this.formBuilder.group({
    CAP_ItemFilter: [null as string | null],
    AccNoFilter: [null as string | null],
  });
  capItemFilterOptions: { label: string; value: string }[] = [];
  accNoFilterOptions: { label: string; value: string }[] = [];
  capItemDialogColumns: Column[] = [
    { field: 'CAP_Item', header: '收款代號', visible: true },
    { field: 'CAP_Name', header: '收款名稱', visible: true },
    { field: 'AccNo', header: '會計科目代號', visible: true },
    { field: 'AccCName', header: '會計科目名稱', visible: true },
  ];

  // 沖帳代號查詢對話框
  @ViewChild('abatAcctDialogTable') abatAcctDialogTable!: TableComponent;
  showAbatAcctDialog = false;
  abatAcctDialogLoading = false;
  abatAcctDialogSelectedItem: QueryAbatAcctResponse | null = null;
  currentEditingAbatAcctRowIndex: number | null = null;
  abatAcctDialogData: QueryAbatAcctResponse[] = [];
  abatAcctFilterForm = this.formBuilder.group({
    VouNo: [''],
    PTA: [''],
    VEN_No: [null as string | null],
  });
  abatAcctVendorOptions: { label: string; value: string }[] = [];
  abatAcctDialogColumns: Column[] = [
    { field: 'VouNo', header: '傳票號碼', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'DebitAmt', header: '借方(餘額)', visible: true, format: formatAmountWithFraction, align: 'right' },
    { field: 'CreditAmt', header: '貸方(餘額)', visible: true, format: formatAmountWithFraction, align: 'right' },
    { field: 'PTA', header: '立沖代號', visible: true },
    { field: 'VEN_No', header: '廠商代號', visible: true },
    { field: 'VEN_ShortName', header: '廠商簡稱', visible: true },
  ];
  private currentAbatAcctAccNo: string | null = null; // 當前開啟沖帳對話框的科目代號

  // 收款項目下拉選項 (格式: CAP_Item - CAP_Name)
  recvItemOptions: { label: string; value: string; Voucher_Type?: string | null }[] = [];

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
      // this.step2TableData = [{
      //   CAP_Item: '',
      //   CAP_Name: '',
      //   AccNo: '',
      //   ARS_Amt: null,
      //   NoteDesc: '',
      //   AbatAcct: ''
      // }];
      this.step2TableData = [];
    }

    // 載入下拉選單資料，完成後再載入收款資料
    this.loadDropdownOptions();
  }

  // ----------------------------------------------------------------
  // 按鈕切換控制
  // ----------------------------------------------------------------

  /** 切換顯示的步驟 */
  switchButton(buttonID: number): void {
    // 非檢視模式才需要卡控順序和驗證
    if (!this.isFormReadable) {
      // 切換到步驟3(應收帳款確認)時，需要驗證票據資訊
      if (buttonID === 3) {
        // 檢查是否有應收票據項目 (Voucher_Type=2)
        /** ↓↓↓選擇應收帳款要卡控票據資訊，0524整測：卡控先mark起來↓↓↓ */
        // if (this.hasVoucherType2Item()) {
        //   // 有應收票據項目，必須檢查票據資訊
        //   if (!this.hasValidCheckData()) {
        //     this.messageService.errorBubble('收款項目包含應收票據，請先填寫至少一筆票據資訊');
        //     // 自動導向到票據資訊步驟
        //     this.buttonID = 2;
        //     this.cdr.detectChanges();
        //     return;
        //   }

        //   // 檢查票據總金額是否等於票據明細總計
        //   const billTotal = this.billTotalAmountControl.value || 0;
        //   const checkTotal = this.totalCheckAmount;
        //   if (billTotal !== checkTotal) {
        //     const billTotalStr = billTotal.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        //     const checkTotalStr = checkTotal.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        //     this.messageService.errorBubble(`票據總金額(${billTotalStr})與票據明細總計(${checkTotalStr})不符`);
        //     this.buttonID = 2;
        //     this.cdr.detectChanges();
        //     return;
        //   }
        // }
        /** ↑↑↑選擇應收帳款要卡控票據資訊，0524整測：卡控先mark起來↑↑↑ */
      }
    }

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

  /** 檢查收款項目是否有 Voucher_Type=2 (應收票據) 的項目 */
  hasVoucherType2Item(): boolean {
    return this.step2TableData.some(item => {
      if (!item.CAP_Item) return false;
      const recvItem = this.recvItemOptions.find(opt => opt.value === item.CAP_Item);
      return recvItem?.Voucher_Type === '2';
    });
  }

  /** 檢查票據資訊是否至少有一筆有效資料 */
  hasValidCheckData(): boolean {
    // 過濾掉自動插入的候選行和空白行
    const validChecks = this.step3TableData.filter(check => {
      const isCandidate = (check as any)._isAutoInsertCandidate;
      const hasCheckNo = !!check.CHK_No;
      return !isCandidate && hasCheckNo;
    });
    return validChecks.length > 0;
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

  /** 打開應收未收查詢對話框 (針對特定列) */
  openARDialogForRow(rowIndex: number): void {
    this.currentEditingRowIndex = rowIndex;
    this.showARDialog = true;
    // 重置查詢表單
    this.arQueryForm.reset({
      ARS_ID: '',
      VEN_No: null,
      DateFrom: null,
      DateTo: null,
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'VEN_No', order: 1 }],
    });
    // 清空查詢結果和選中資料
    this.arDialogData = [];
    this.arDialogTotalRecords = 0;
    this.arDialogSelectedItem = null;
    // 預設顯示全部資料，並傳入當前值供預選
    const currentARS_ID = this.step4TableData[rowIndex]?.ARS_ID;
    this.onQueryAR(currentARS_ID || undefined);
  }

  /** 打開應收未收查詢對話框 (舊方法，保留相容性) */
  openARDialog(): void {
    this.openARDialogForRow(-1); // -1 表示新增模式
  }

  /** 關閉應收未收查詢對話框 */
  closeARDialog(): void {
    this.showARDialog = false;
    this.arDialogData = [];
    this.arDialogSelectedItem = null;
  }

  /** 當選擇應收帳款列時 (單選模式) */
  onARRowSelect(event: { data?: QueryFIN32030ARResponse }): void {
    if (event.data) {
      this.arDialogSelectedItem = event.data;
    }
  }

  /** 查詢應收未收 */
  onQueryAR(preSelectARS_ID?: string): void {
    const formValue = this.arQueryForm.value;

    // 有效的排序欄位列表（對應後端 queryFIN32030ARResponse 的欄位）
    const validSortFields = ['ARS_ID', 'VEN_No', 'VEN_Name', 'ARS_Amt', 'ARS_Date', 'PaidAmt', 'UnpaidAmt', 'PTA_Date', 'NoteDesc'];

    // 過濾並清理 SortBy 參數，只保留有效欄位
    let sortBy = formValue.SortBy;
    if (sortBy && Array.isArray(sortBy)) {
      sortBy = sortBy.filter((sort: any) => validSortFields.includes(sort.field));
      if (sortBy.length === 0) {
        sortBy = [{ field: 'VEN_No', order: 1 }]; // 預設排序
      }
    } else {
      sortBy = [{ field: 'VEN_No', order: 1 }]; // 預設排序
    }

    const queryParams = {
      ARS_ID: formValue.ARS_ID || undefined,
      VEN_No: formValue.VEN_No || undefined,
      DateFrom: formValue.DateFrom ? (formValue.DateFrom as Date).toISOString() : undefined,
      DateTo: formValue.DateTo ? (formValue.DateTo as Date).toISOString() : undefined,
      PageIndex: formValue.pageIndex ?? 1,
      PageSize: formValue.pageSize ?? 30,
      SortBy: sortBy,
    };

    this.arDialogLoading = true;
    this.fin32030Service.queryFIN32030AR(queryParams)
      .pipe(
        finalize(() => this.arDialogLoading = false),
        untilDestroyed(this)
      )
      .subscribe(response => {
        // 過濾掉已選擇的應收帳款 (不可重複選擇，但排除當前編輯列)
        const selectedIds = this.step4TableData
          .filter((_, idx) => idx !== this.currentEditingRowIndex)
          .map(item => item.ARS_ID);
        this.arDialogData = response.Data.filter(ar => !selectedIds.includes(ar.ARS_ID));
        this.arDialogTotalRecords = response.TotalCount;

        // 預選已選擇的應收帳款
        if (preSelectARS_ID) {
          const match = this.arDialogData.find(item => item.ARS_ID === preSelectARS_ID);
          if (match) {
            this.arDialogSelectedItem = match;
            setTimeout(() => {
              if (this.arDialogTable?.dt) {
                this.arDialogTable.selectedItems = match;
                this.arDialogTable.dt.selection = match;
              }
            }, 100);
          }
        }
      });
  }

  /** 確認選擇應收帳款 (點擊確定按鈕) - 單選模式 */
  confirmARSelection(): void {
    // 優先使用 onARRowSelect 設定的選中資料，否則從 table 組件取得
    let selectedAR: QueryFIN32030ARResponse | null = this.arDialogSelectedItem;

    // 如果沒有透過 select 事件選中，嘗試從 table 組件取得
    if (!selectedAR) {
      const rawSelected = this.arDialogTable?.selectedItems;
      if (Array.isArray(rawSelected)) {
        selectedAR = rawSelected.length > 0 ? rawSelected[0] : null;
      } else if (rawSelected) {
        selectedAR = rawSelected as QueryFIN32030ARResponse;
      }
    }

    if (!selectedAR) {
      this.messageService.errorBubble('請選擇一筆應收帳款');
      return;
    }

    // 檢查是否已經在表格中（排除當前編輯的列和空白候選列）
    const existingIndex = this.step4TableData.findIndex((item, idx) =>
      item.ARS_ID === selectedAR!.ARS_ID &&
      idx !== this.currentEditingRowIndex &&
      !(item as ARWithRCVAmt & { _isAutoInsertCandidate?: boolean })._isAutoInsertCandidate
    );

    if (existingIndex !== -1) {
      this.messageService.errorBubble('此應收帳款已存在於其他列');
      return;
    }

    // 檢查是否為有效的編輯索引（排除候選列）
    const isValidEditIndex = this.currentEditingRowIndex !== null &&
      this.currentEditingRowIndex >= 0 &&
      this.currentEditingRowIndex < this.step4TableData.length &&
      !(this.step4TableData[this.currentEditingRowIndex] as ARWithRCVAmt & { _isAutoInsertCandidate?: boolean })._isAutoInsertCandidate;

    if (isValidEditIndex) {
      // 替換現有列資料（保留原有 Id）
      const currentRow = this.step4TableData[this.currentEditingRowIndex!];
      const originalId = currentRow.Id; // 保留原有的 Id（用於後端判斷是 update）

      this.step4TableData[this.currentEditingRowIndex!] = {
        ...selectedAR,
        Id: originalId, // 保留原有 Id
        RCV_Amt: selectedAR.UnpaidAmt || 0 // 預設收款金額為未收款金額
      };

      // 觸發變更檢測
      this.step4TableData = [...this.step4TableData];
      this.messageService.successBubble('已更新應收帳款');
    } else {
      // 新增一筆資料
      const newData: ARWithRCVAmt = {
        ...selectedAR,
        RCV_Amt: selectedAR.UnpaidAmt || 0 // 預設收款金額為未收款金額
      };
      this.step4TableData = [...this.step4TableData, newData];
      this.messageService.successBubble('已新增應收帳款');
    }

    this.showARDialog = false;
    this.currentEditingRowIndex = null;
    this.arDialogSelectedItem = null;
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
    // 計算票據總金額：收款明細中「應收票據」會計科目 (Voucher_Type = '2') 的金額
    this.calculateBillTotalAmount();
  }

  // ----------------------------------------------------------------
  // 收款項目對話框相關
  // ----------------------------------------------------------------

  /** 打開收款項目查詢對話框 (針對特定列) */
  openCapItemDialogForRow(rowIndex: number): void {
    this.currentEditingCapItemRowIndex = rowIndex;
    this.showCapItemDialog = true;
    this.capItemFilterForm.reset();
    this.capItemDialogSelectedItem = null;
    this.capItemDialogData = [];
    // 預設查詢全部，並傳入當前值供預選
    const currentCapItem = this.step2TableData[rowIndex]?.CAP_Item;
    this.onQueryCapItems(currentCapItem || undefined);
  }

  /** 關閉收款項目查詢對話框 */
  closeCapItemDialog(): void {
    this.showCapItemDialog = false;
    this.capItemDialogSelectedItem = null;
  }

  /** 查詢收款項目 (呼叫 API) */
  onQueryCapItems(preSelectCapItem?: string): void {
    const filters = this.capItemFilterForm.value;
    const params: { CAP_Item?: string; AccNo?: string } = {};

    if (filters.CAP_ItemFilter) {
      params.CAP_Item = filters.CAP_ItemFilter;
    }
    if (filters.AccNoFilter) {
      params.AccNo = filters.AccNoFilter;
    }

    this.capItemDialogLoading = true;
    this.fin32030Service.queryCapItemDropdown(params)
      .pipe(
        finalize(() => this.capItemDialogLoading = false),
        untilDestroyed(this)
      )
      .subscribe(response => {
        this.capItemDialogData = response.Data || [];

        // 預選已選擇的項目
        if (preSelectCapItem) {
          const match = this.capItemDialogData.find(item => item.CAP_Item === preSelectCapItem);
          if (match) {
            this.capItemDialogSelectedItem = match;
            setTimeout(() => {
              if (this.capItemDialogTable?.dt) {
                this.capItemDialogTable.selectedItems = match;
                this.capItemDialogTable.dt.selection = match;
              }
            }, 100);
          }
        }
      });
  }

  /** 收款項目選擇事件 */
  onCapItemRowSelect(event: { data?: QueryCapItemDropdownResponse }): void {
    if (event.data) {
      this.capItemDialogSelectedItem = event.data;
    }
  }

  /** 確認選擇收款項目 */
  confirmCapItemSelection(): void {
    let selected: QueryCapItemDropdownResponse | null = this.capItemDialogSelectedItem;

    if (!selected) {
      const rawSelected = this.capItemDialogTable?.selectedItems;
      if (Array.isArray(rawSelected)) {
        selected = rawSelected.length > 0 ? rawSelected[0] : null;
      } else if (rawSelected) {
        selected = rawSelected as QueryCapItemDropdownResponse;
      }
    }

    if (!selected) {
      this.messageService.errorBubble('請選擇一個收款項目');
      return;
    }

    const rowIndex = this.currentEditingCapItemRowIndex;

    // 檢查是否為有效的現有列索引（排除候選列）
    const isValidEditIndex = rowIndex !== null &&
      rowIndex >= 0 &&
      rowIndex < this.step2TableData.length &&
      !this.step2TableData[rowIndex]?._isAutoInsertCandidate;

    if (isValidEditIndex) {
      // 替換現有列資料（同時清空沖帳代號，因為收款項目變更了）
      this.step2TableData[rowIndex!] = {
        ...this.step2TableData[rowIndex!],
        CAP_Item: selected.CAP_Item || '',
        CAP_Name: selected.CAP_Name || '',
        AccNo: selected.AccNo || '',
        ABAT_YN: selected.ABAT_YN || '',
        AbatAcct: '', // 清空沖帳代號
      };
      this.step2TableData = [...this.step2TableData];
    } else {
      // 新增一筆資料（來自候選列或新增模式）
      const newData = {
        CAP_Item: selected.CAP_Item || '',
        CAP_Name: selected.CAP_Name || '',
        AccNo: selected.AccNo || '',
        ABAT_YN: selected.ABAT_YN || '',
        ARS_Amt: null,
        NoteDesc: '',
        AbatAcct: ''
      };
      this.step2TableData = [...this.step2TableData, newData];
    }

    // 重新計算票據總金額
    this.calculateBillTotalAmount();

    this.showCapItemDialog = false;
    this.currentEditingCapItemRowIndex = null;
    this.capItemDialogSelectedItem = null;
  }

  // ----------------------------------------------------------------
  // 沖帳代號對話框相關
  // ----------------------------------------------------------------

  /** 打開沖帳代號查詢對話框 (針對特定列) */
  openAbatAcctDialogForRow(rowIndex: number): void {
    // 取得當前列的 AccNo
    const rowData = this.step2TableData[rowIndex];
    if (!rowData?.AccNo) {
      this.messageService.errorBubble('請先選擇收款項目');
      return;
    }

    this.currentEditingAbatAcctRowIndex = rowIndex;
    this.currentAbatAcctAccNo = rowData.AccNo ?? null;
    this.showAbatAcctDialog = true;
    this.abatAcctFilterForm.reset();
    this.abatAcctDialogSelectedItem = null;
    this.abatAcctDialogData = [];
    // 廠商下拉直接使用已載入的 POS2013 全廠商清單
    this.abatAcctVendorOptions = [...this.vendorOptions];

    const currentAbatAcct = rowData.AbatAcct;

    // 查詢沖帳代號
    this.abatAcctDialogLoading = true;
    this.fin32030Service.queryAbatAcct({ AccNo: rowData.AccNo })
      .pipe(
        finalize(() => this.abatAcctDialogLoading = false),
        untilDestroyed(this)
      )
      .subscribe(response => {
        this.abatAcctDialogData = response.Data || [];

        // 預選已選擇的沖帳代號
        if (currentAbatAcct) {
          const match = this.abatAcctDialogData.find(item => item.PTA === currentAbatAcct);
          if (match) {
            this.abatAcctDialogSelectedItem = match;
            setTimeout(() => {
              if (this.abatAcctDialogTable?.dt) {
                this.abatAcctDialogTable.selectedItems = match;
                this.abatAcctDialogTable.dt.selection = match;
              }
            }, 100);
          }
        }
      });
  }

  /** 關閉沖帳代號查詢對話框 */
  closeAbatAcctDialog(): void {
    this.showAbatAcctDialog = false;
    this.abatAcctDialogSelectedItem = null;
  }

  /** 沖帳代號篩選 (server-side) */
  filterAbatAcct(): void {
    const filters = this.abatAcctFilterForm.value;
    this.abatAcctDialogLoading = true;
    this.fin32030Service.queryAbatAcct({
      AccNo: this.currentAbatAcctAccNo,
      VouNo: filters.VouNo || null,
      PTA: filters.PTA || null,
      VEN_No: filters.VEN_No || null,
    })
      .pipe(
        finalize(() => this.abatAcctDialogLoading = false),
        untilDestroyed(this)
      )
      .subscribe(response => {
        this.abatAcctDialogData = response.Data || [];
      });
  }

  /** 沖帳代號選擇事件 */
  onAbatAcctRowSelect(event: { data?: QueryAbatAcctResponse }): void {
    if (event.data) {
      this.abatAcctDialogSelectedItem = event.data;
    }
  }

  /** 確認選擇沖帳代號 */
  confirmAbatAcctSelection(): void {
    let selected: QueryAbatAcctResponse | null = this.abatAcctDialogSelectedItem;

    if (!selected) {
      const rawSelected = this.abatAcctDialogTable?.selectedItems;
      if (Array.isArray(rawSelected)) {
        selected = rawSelected.length > 0 ? rawSelected[0] : null;
      } else if (rawSelected) {
        selected = rawSelected as QueryAbatAcctResponse;
      }
    }

    if (!selected) {
      this.messageService.errorBubble('請選擇一筆沖帳代號');
      return;
    }

    const rowIndex = this.currentEditingAbatAcctRowIndex;
    if (rowIndex !== null && rowIndex >= 0 && rowIndex < this.step2TableData.length) {
      this.step2TableData[rowIndex] = {
        ...this.step2TableData[rowIndex],
        AbatAcct: selected.PTA || '',
      };
      this.step2TableData = [...this.step2TableData];
    }

    this.showAbatAcctDialog = false;
    this.currentEditingAbatAcctRowIndex = null;
    this.abatAcctDialogSelectedItem = null;
  }

  /** 計算票據總金額，並同步更新票據預設 AccNo */
  private calculateBillTotalAmount(): void {
    let totalAmount = 0;
    let voucherType2AccNo: string | null = null;
    for (const item of this.step2TableData) {
      if (item.CAP_Item) {
        const recvItem = this.recvItemOptions.find(opt => opt.value === item.CAP_Item);
        // Voucher_Type = '2' 為應收票據科目
        if (recvItem?.Voucher_Type === '2') {
          totalAmount += item.ARS_Amt || 0;
          // 取第一個應收票據科目的 AccNo 作為票據預設值
          if (voucherType2AccNo === null && item.AccNo) {
            voucherType2AccNo = item.AccNo;
          }
        }
      }
    }
    this.billTotalAmountControl.setValue(totalAmount);
    // 更新票據新增行的預設 AccNo（當值有變化時才更新，避免觸發不必要的 ngOnChanges）
    if (this.step3DefaultInsertData.AccNo !== voucherType2AccNo) {
      this.step3DefaultInsertData = { ...this.step3DefaultInsertData, AccNo: voucherType2AccNo };
    }
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
            value: item.CAP_Item || '',
            Voucher_Type: item.Voucher_Type
          }));

          // 儲存完整資料供對話框使用
          this.capItemAllData = results.recvItems.Data;

          // 建立收款代號/名稱篩選選項
          this.capItemFilterOptions = results.recvItems.Data.map(item => ({
            label: `${item.CAP_Item || ''} - ${item.CAP_Name || ''}`,
            value: item.CAP_Item || ''
          }));

          // 建立會計科目篩選選項 (去重)
          const accNoMap = new Map<string, string>();
          results.recvItems.Data.forEach(item => {
            if (item.AccNo) {
              accNoMap.set(item.AccNo, item.AccCName || '');
            }
          });
          this.accNoFilterOptions = Array.from(accNoMap.entries()).map(([accNo, accCName]) => ({
            label: `${accNo} - ${accCName}`,
            value: accNo
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
            this.step2TableData = (recvData.RecvItems as any[]).map((item: any) => {
              const capItemData = this.capItemAllData.find(opt => opt.CAP_Item === item.CAP_Item);
              return {
                CAP_Item: item.CAP_Item || '',
                CAP_Name: capItemData?.CAP_Name || item.CAP_Name || '',
                AccNo: capItemData?.AccNo || item.AccNo || '',
                ABAT_YN: capItemData?.ABAT_YN || '',
                ARS_Amt: item.RCV_Amt || 0, // API 使用 RCV_Amt
                NoteDesc: item.NoteDesc || '',
                AbatAcct: item.AbatAcct || ''
              };
            });
            console.log('收款項目明細載入完成:', this.step2TableData);
            // 計算票據總金額
            this.calculateBillTotalAmount();
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
                  AccNo: check.AccNo || this.step3DefaultInsertData.AccNo || '',
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
            // API 回傳的欄位: ARS_No (不是 ARS_ID), id (小寫，不是大寫 Id)
            this.step4TableData = (recvData.Receipts as any[]).map((receipt: any) => ({
              Id: receipt.id || receipt.Id || null, // 編輯模式需要的 ID (後端回傳小寫 id)
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

    /** ↓↓↓選擇應收帳款要卡控票據資訊，0524整測：卡控先mark起來↓↓↓ */
    // 檢查是否有應收票據項目，若有則必須填寫票據資訊
    // if (this.hasVoucherType2Item()) {
    //   if (!this.hasValidCheckData()) {
    //     this.messageService.errorBubble('收款項目包含應收票據，請先填寫至少一筆票據資訊');
    //     this.buttonID = 2; // 導向到票據資訊步驟
    //     return;
    //   }

    //   // 檢查票據總金額是否等於票據明細總計
    //   const billTotal = this.billTotalAmountControl.value || 0;
    //   const checkTotal = this.totalCheckAmount;
    //   if (billTotal !== checkTotal) {
    //     const billTotalStr = billTotal.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    //     const checkTotalStr = checkTotal.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    //     this.messageService.errorBubble(`票據總金額(${billTotalStr})與票據明細總計(${checkTotalStr})不符`);
    //     this.buttonID = 2; // 導向到票據資訊步驟
    //     return;
    //   }
    // }
    /** ↑↑↑選擇應收帳款要卡控票據資訊，0524整測：卡控先mark起來↑↑↑ */

    if (this.step4TableData.length === 0) {
      this.messageService.errorBubble('請至少新增一筆應收帳款');
      return;
    }

    this.loading = true;

    const step1Value = this.step1Form.getRawValue();

    // 準備收款項目明細
    const recvDetails = this.step2TableData
      .filter((item: { CAP_Item?: string; ARS_Amt?: number }) => item.CAP_Item && item.ARS_Amt !== null && item.ARS_Amt !== undefined)
      .map((item: { CAP_Item: string; ARS_Amt: number; NoteDesc?: string; AbatAcct?: string }) => ({
        CAP_Item: item.CAP_Item,
        ARS_Amt: item.ARS_Amt,
        NoteDesc: item.NoteDesc || null,
        AbatAcct: item.AbatAcct || null
      }));

    // 準備票據明細
    const checkDetails = this.step3TableData
      .filter((check: { CHK_No?: string }) => check.CHK_No)
      .map((check: {
        CHK_No: string;
        VEN_No?: string;
        BNK_All?: string;
        BNK_No?: string;
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
        BNK_No: check.BNK_All || check.BNK_No || '', // 使用 BNK_All (完整銀行代號)
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
        ARS_Status: 'N'
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
        Status: 'N',
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
      // 編輯模式需要處理兩種情況：
      // 1. 有 Id 的舊資料 → 使用 Update 格式 (ARRecvAcctUpdateDetailItem)
      // 2. 沒有 Id 的新資料 → 使用 Insert 格式 (ARRecvAcctDetailItem)，後端會呼叫 Insert SP

      console.log('編輯模式 - step4TableData 原始資料:', this.step4TableData);

      // 舊資料：有 Id，使用 Update 格式
      const existingARDetails = this.step4TableData
        .filter((ar: ARWithRCVAmt) => {
          const hasId = ar.Id !== null && ar.Id !== undefined;
          const hasRcvAmt = ar.RCV_Amt !== null && ar.RCV_Amt !== undefined;
          console.log(`過濾檢查 - ARS_ID: ${ar.ARS_ID}, Id: ${ar.Id}, hasId: ${hasId}, RCV_Amt: ${ar.RCV_Amt}, hasRcvAmt: ${hasRcvAmt}`);
          return hasId && hasRcvAmt;
        })
        .map((ar: ARWithRCVAmt) => ({
          Id: ar.Id!,
          ARS_Amt: ar.RCV_Amt || 0,
          CHK_No: null
        }));

      // 新資料：沒有 Id，使用 Insert 格式（與新增模式相同）
      const newARDetails = this.step4TableData
        .filter((ar: ARWithRCVAmt) => !ar.Id && ar.ARS_ID && ar.RCV_Amt !== null && ar.RCV_Amt !== undefined)
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
          ARS_Status: 'N'
        }));

      // 合併舊資料（有 Id，Update 格式）和新資料（沒有 Id，Insert 格式）
      // 後端會根據是否有 Id 來決定呼叫 Insert 或 Update SP
      const allARDetails = [...existingARDetails, ...newARDetails];

      console.log('編輯模式 - 舊資料(有Id):', existingARDetails.length, '筆');
      console.log('編輯模式 - 新資料(無Id):', newARDetails.length, '筆');
      console.log('編輯模式 - 送出的 ARDetails:', allARDetails);
      console.log('編輯模式 - existingARDetails:', existingARDetails);
      console.log('編輯模式 - newARDetails:', newARDetails);

      const updateRequest: any = {
        STO_No: '', // 後端會自動填入
        RCV_No: step1Value.RCV_No || '',
        RCV_Date: step1Value.RCV_Date.toISOString(),
        Sales_Id: step1Value.Sales_Id || null,
        CompNo: '', // 後端會自動填入
        VouNo: null,
        Remark: step1Value.Remark || null,
        Status: 'N',
        UserId: '', // 後端會自動填入
        UserName: '', // 後端會自動填入
        RecvDetails: recvDetails,
        CheckDetails: checkDetails.length > 0 ? checkDetails : null,
        ARDetails: allARDetails.length > 0 ? allARDetails : null
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
