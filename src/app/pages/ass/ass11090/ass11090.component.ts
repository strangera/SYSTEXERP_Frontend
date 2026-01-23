import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { ASS11090Service } from '../../../service/api/ass/ass11090.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { ASS11090Data } from './ass11090.model';
import { Option } from '../../../service/utility/dropdown-api.model';

// 3.1.1.9 資材中分類會計科目維護作業
@Component({
  selector: 'app-ass11090',
  templateUrl: './ass11090.component.html',
  styleUrl: './ass11090.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    TableComponent,
    TranslateModule
  ]
})
export class ASS11090Component extends BasicQueryPageComponent<ASS11090Data> implements OnInit {
  // 查詢表單
  queryForm = this.formBuilder.group({
    // 大分類代碼/名稱（合併為單一下拉，value: No）
    BigCategoryCode: [null],
    // 中分類代碼/名稱（合併為單一下拉，value: No）
    MidCategoryCode: [null],
    // 所屬會計科目(借)
    AccountingDebitCode: [null], // 所屬會計科目(借)（下拉選單）
    // 所屬會計科目(貸)
    AccountingCreditCode: [null], // 所屬會計科目(貸)（下拉選單）
    // 進項稅額科目(借)
    InputTaxDebitCode: [null], // 進項稅額科目(借)（下拉選單）
    // 費用科目
    ExpenseAccountCode: [null], // 費用科目（下拉選單）
    // 累計折舊科目(貸)
    AccumulatedDepreciationCreditCode: [null], // 累計折舊科目(貸)（下拉選單）
    // 折舊科目(借)
    DepreciationDebitCode: [null], // 折舊科目(借)（下拉選單）
    // 折舊年限
    DepreciationLife: ['', [Validators.maxLength(2)]], // 折舊年限（文字輸入框）
    // 分頁和排序參數
    ...createPaginationConfig([{ field: 'BigCategoryCode', order: 1 }]),
  });

  totalRecords = 0;
  data: ASS11090Data[] = [];
  selectedItems: ASS11090Data[] = [];

  // 下拉選單選項
  bigCategoryOptions: Option[] = []; // 大分類下拉選單（API 尚未開發，先保留欄位）
  midCategoryOptions: Option[] = []; // 中分類下拉選單（API 尚未開發，先保留欄位）
  accountingDebitOptions: Option[] = []; // 所屬會計科目(借)下拉選單
  accountingCreditOptions: Option[] = []; // 所屬會計科目(貸)下拉選單
  inputTaxDebitOptions: Option[] = []; // 進項稅額科目(借)下拉選單
  expenseAccountOptions: Option[] = []; // 費用科目下拉選單
  accumulatedDepreciationCreditOptions: Option[] = []; // 累計折舊科目(貸)下拉選單
  depreciationDebitOptions: Option[] = []; // 折舊科目(借)下拉選單

  // 表格欄位定義
  columns: Column[] = [
    { field: 'BigCategoryCode', header: '大分類代碼', visible: true, showSort: true },
    { field: 'BigCategoryName', header: '大分類名稱', visible: true, showSort: true },
    { field: 'MidCategoryCode', header: '中分類代碼', visible: true, showSort: true },
    { field: 'MidCategoryName', header: '中分類名稱', visible: true, showSort: true },
    { field: 'AccountingDebitCode', header: '會計科目(借)代碼', visible: true, showSort: true },
    { field: 'AccountingDebitName', header: '會計科目(借)', visible: true, showSort: true },
    { field: 'AccountingCreditCode', header: '所屬會計科目(貸)代碼', visible: true, showSort: true },
    { field: 'AccountingCreditName', header: '所屬會計科目(貸)', visible: true, showSort: true },
    { field: 'InputTaxDebitCode', header: '進項稅額科目(借)代碼', visible: true, showSort: true },
    { field: 'InputTaxDebitName', header: '進項稅額科目(借)', visible: true, showSort: true },
    { field: 'ExpenseAccountCode', header: '費用科目代碼', visible: true, showSort: true },
    { field: 'ExpenseAccountName', header: '費用科目', visible: true, showSort: true },
    { field: 'AccumulatedDepreciationCreditCode', header: '累計折舊科目(貸)代碼', visible: true, showSort: true },
    { field: 'AccumulatedDepreciationCreditName', header: '累計折舊科目(貸)', visible: true, showSort: true },
    { field: 'DepreciationDebitCode', header: '折舊科目(借)代碼', visible: true, showSort: true },
    { field: 'DepreciationDebitName', header: '折舊科目(借)', visible: true, showSort: true },
    { field: 'DepreciationLife', header: '折舊年限', visible: true, showSort: true },
    { field: 'Description', header: '說明', visible: true, showSort: true },
  ];

  constructor(
    private ass11090Service: ASS11090Service,
    private dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11090', 'ass/ass11090cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  // 載入下拉選單選項
  loadDropdownOptions(): void {
    // 載入會計科目下拉選單（使用 queryGLS1005_DropDownList）
    // 所有會計科目相關的下拉選單都使用同一個 API
    this.dropdownApiService.queryGls1005().subscribe({
      next: (options) => {
        if (options) {
          // 所有會計科目相關的下拉選單共用同一組資料
          this.accountingDebitOptions = options;
          this.accountingCreditOptions = options;
          this.inputTaxDebitOptions = options;
          this.expenseAccountOptions = options;
          this.accumulatedDepreciationCreditOptions = options;
          this.depreciationDebitOptions = options;
        }
      },
      error: (err) => {
        console.error('載入會計科目下拉選單失敗:', err);
      }
    });

    // 大分類和中分類下拉選單的 API 尚未開發完畢，先留空
    // 待 API 開發完成後，可在此處載入：
    // this.loadBigCategoryOptions();
    // this.loadMidCategoryOptions();
  }

  // 提交查詢
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      // 準備查詢參數，只傳入代碼（value），不傳入 label
      const queryParams: any = {
        BigCategoryCode: frm.value.BigCategoryCode || undefined,
        MidCategoryCode: frm.value.MidCategoryCode || undefined,
        AccountingDebitCode: frm.value.AccountingDebitCode || undefined,
        AccountingCreditCode: frm.value.AccountingCreditCode || undefined,
        InputTaxDebitCode: frm.value.InputTaxDebitCode || undefined,
        ExpenseAccountCode: frm.value.ExpenseAccountCode || undefined,
        AccumulatedDepreciationCreditCode: frm.value.AccumulatedDepreciationCreditCode || undefined,
        DepreciationDebitCode: frm.value.DepreciationDebitCode || undefined,
        DepreciationLife: frm.value.DepreciationLife || undefined,
        // 分頁和排序參數
        PageSize: frm.value.pageSize,
        PageIndex: frm.value.pageIndex,
        SortBy: frm.value.SortBy,
      };

      // 移除 undefined 值
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
          delete queryParams[key];
        }
      });

      this.ass11090Service.queryASS11090(queryParams).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            console.error('API error:', response.Status, response.Message);
            this.messageService.errorBubble(`查詢失敗: ${response.Message}`);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err) => {
          console.error('API error:', err);
          this.messageService.errorBubble('查詢失敗');
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  // 判斷行是否可選
  isRowSelectable(rowData: ASS11090Data): boolean {
    return true; // 所有行都可選
  }
}
