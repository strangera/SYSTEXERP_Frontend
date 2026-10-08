import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IGetBudgetAmountRequest, IPODetail, IPOS2004DetailData, IQueryPOS2004DetailResponse, ITLS52010Data, ITLS52010Request, Tls52010Service } from '@service/api/tls/tls52010.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { LogoAccorHosItem, Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { ProductAutocompleteComponent } from '@shared/biz-components/product-autocomplete/product-autocomplete';
import { IQueryPOS2004DetailRequest } from '@shared/biz-components/product-autocomplete/product-autocomplete.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateMinNumber, validateRequired } from '@shared/components/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmountWithDecimals } from '@shared/components/table-report/table-report.model';
import { Column, formatAmount, formatAmountRoundToInteger } from '@others/component/table/table.model';
import { PanelModule } from 'primeng/panel';
import { debounceTime, distinctUntilChanged, finalize, forkJoin, map, of } from 'rxjs';

// 2.5.2.1  採購單維護作業 CRU
@Component({
  selector: 'app-tls52010-cru',
  templateUrl: './tls52010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    InputNumberComponent,
    CalendarComponent,
    InputTextareaComponent,
    TableReportComponent,
    DialogComponent,
    ProductAutocompleteComponent,
    TranslateModule,
    AsyncPipe,
    TableEditComponent
  ],
})
export class TLS52010CRUComponent extends BasicCruPageComponent<ITLS52010Data> implements OnInit {
  // === 表單群組 (與 POS2016 欄位對應) ===
  dataForm = this.formBuilder.nonNullable.group({
    PO_No: [{ value: '系統自動產生', disabled: true }], // 採購單號 (與 POS2016.PO_No 對應)
    VEN_No: [null as string | null, [Validators.required]], // 廠商編號 (與 POS2016.VEN_No 對應)
    LOGO_No: [null as string | null, [Validators.required]], // 品牌代碼 (與 POS2016.LOGO_No 對應)
    remainingBudgetAmount: [{ value: 0, disabled: true }], // 剩餘預算金額 (前端顯示用，不對應資料庫欄位)
    HOS_No: [null as string | null, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    PO_TotalBuyNet: [{ value: 0, disabled: true }], // 採購金額
    PO_TotalBuyTax: [{ value: 0, disabled: true }], //稅額
    PO_TotalBuyAmt: [{ value: 0, disabled: true }], // 合計金額
    PO_TotalSaleAmt: [{ value: 0, disabled: true }], //售價總計
    APPLY_USR_No: [{ value: this.user?.user_No, disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_USR_Name: [{ value: this.user?.user_Name, disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_Date: [new Date() as Date | null, [Validators.required]], // 申請日期 (移除 disabled: true)**
    PO_Remark: [null as string | null, [Validators.maxLength(200)]], // 採購單備註 (對應 POS2016.PO_Remark)
  });
  // === 下拉選單選項 ===
  vendorOptions = this.dropdown.queryPos2013TltTalent(); // 廠商下拉選單選項
  // 儲存【完整的品牌/倉別關聯數據】 (使用新的 API 查詢結果)
  fullLogoAccorHosData: LogoAccorHosItem[] = [];
  // 儲存所有【不重複的品牌】選項 (用於綁定到畫面上 LOGO_No 的選項)
  fullLogoOptions: Option[] = [];
  filteredLogoOptions: Option[] | null = null;
  // 儲存所有【不重複的倉別】選項 (用於綁定到畫面上 HOS_No 的選項)
  fullWarehouseOptions: Option[] = [];
  filteredWarehouseOptions: Option[] | null = null;
  editColumns: EditColumn[] = [
    {
      field: 'PLU_No', header: '國際條碼',
      width: '150px',
      type: 'input',
      onBlur: (rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) => this.onPLU_MagNoBlur(rowData, value, col, index),
      validate: [validateRequired],
    },
    { field: 'PLU_MagNo', header: '商品管理編號', },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => getSYS1000('PLU_StockTaxType', value) },
    {
      field: 'POD_SubQty',
      header: '數量',
      type: 'inputNumber',
      validate: [validateRequired, validateMinNumber(1)],
      width: '100px',
      onFocus: (rowData: IPOS2004DetailData, value: any, col: EditColumn, index: number) => { },
      calculate: (row) => {
        // 👇 加上 ?? 0 防呆
        const buyNet = Number(row.POD_SubQty ?? 0) * Number(row.PLU_SalePrc_UNI ?? 0);
        const buyTax = row.PLU_StockTaxType === '1' ? Math.round(buyNet * 0.05) : 0;
        const buyAmt = Math.round(buyNet + buyTax);
        const saleAmt = Math.round(Number(row.POD_SubQty ?? 0) * Number(row.PLU_SalePrc ?? 0));
        const saleTax = row.PLU_TaxType === '1' ? Math.round((Number(row.PLU_SalePrc ?? 0) * Number(row.POD_SubQty ?? 0)) / 21) : 0;
        return {
          'POD_BuyNet': buyNet,
          'POD_BuyTax': buyTax,
          'POD_BuyAmt': buyAmt,
          'POD_SaleAmt': saleAmt,
          'POD_SaleTax': saleTax,
        };
      }
    }, { field: 'PLU_SalePrc_UNI', header: '單價', format: (v) => formatAmountWithDecimals(v, 2) },
    { field: 'POD_BuyNet', header: '小計', format: formatAmountRoundToInteger },
    { field: 'PLU_SalePrc', header: '售價', format: formatAmount },
    { field: 'POD_SaleAmt', header: '售價小計', format: formatAmount },
    { field: 'POD_Remark', header: '備註', type: 'input', width: '150px' },
  ]
  originalData: IPOS2004DetailData[] = [];
  data: IPOS2004DetailData[] = [];
  selectedItems: IPOS2004DetailData[] = [];

  validateEntireRow = (rowData: IPOS2004DetailData): { isValid: boolean, errorMessage: string; } => {
    // 1. 如果商品編號還沒填入，先不檢查重複（交給 validateRequired 處理）
    if (!rowData.PLU_MagNo) {
      return { isValid: true, errorMessage: '' };
    }

    // 2. 檢查重複時，排除掉 key 為空的狀況，並確保比對的是「其他」行
    const hasDuplicatePLU_MagNo = this.data.some((item) =>
      item.PLU_MagNo === rowData.PLU_MagNo &&
      item._TABLE_KEY !== rowData._TABLE_KEY &&
      rowData._TABLE_KEY !== undefined // 確保目前的行有 key
    );

    if (hasDuplicatePLU_MagNo) {
      return { isValid: false, errorMessage: '商品已重複' };
    }

    return { isValid: true, errorMessage: '' };
  };

  onPLU_MagNoBlur(rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) {
    const venNo = this.dataForm.controls.VEN_No.value;
    const logoNo = this.dataForm.controls.LOGO_No.value;
    if (!venNo || !logoNo || !value) return;

    // 🎯【需求優化】：失焦當下立刻、同步帶入數量 1，不等 API 回傳
    const currentRow = this.data[index];
    if (currentRow) {
      currentRow.POD_SubQty = 1;
      this.calculateTotals();
      this.cdr.detectChanges();
    }

    const body = { VEN_No: venNo, queryNo: value, LOGO_No: logoNo };

    setTimeout(() => {
      if (!this.dataForm.controls.VEN_No.value || !this.dataForm.controls.LOGO_No.value || !value) return;

      this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
        const keyword = value.trim();
        const newData = results.Data?.find(d => d.PLU_No === keyword || d.PLU_MagNo === keyword || d.PLU_OrgPLUNo === keyword);
        if (newData) {
          const buyPrc = newData.PLU_SalePrc_UNI || 0;
          const salePrc = newData.PLU_SalePrc || 0;
          const taxType = newData.PLU_StockTaxType;

          // 這裡讀取使用者在 API 回傳前可能已經敲進去的新數量，若無則維持 1
          const subQty = currentRow?.POD_SubQty ?? 1;

          const buyNet = subQty * buyPrc;
          const buyTax = taxType === '1' ? Math.round(buyNet * 0.05) : 0;
          const buyAmt = Math.round(buyNet + buyTax);
          const saleAmt = Math.round(subQty * salePrc);
          const saleTax = newData.PLU_TaxType === '1' ? Math.round((salePrc * subQty) / 21) : 0;

          const updatedRow: IQueryPOS2004DetailResponse = {
            ...newData,
            id: 0,
            PLU_MagNo: newData.PLU_MagNo,
            PLU_Name: newData.PLU_Name,
            PLU_No: newData.PLU_No,
            UNIT_NAME: newData.UNIT_NAME,
            PLU_BoxQty: newData.PLU_BoxQty || 0,
            PLU_StockTaxType: newData.PLU_StockTaxType,
            PLU_TaxType: newData.PLU_TaxType,
            PLU_SalePrc_UNI: buyPrc,
            PLU_SalePrc: salePrc,
            POD_SubQty: subQty,
            POD_BuyNet: buyNet,
            POD_BuyTax: buyTax,
            POD_BuyAmt: buyAmt,
            POD_SaleAmt: saleAmt,
            POD_SaleTax: saleTax,
            POD_Remark: currentRow?.POD_Remark || ''
          };

          if (currentRow) {
            Object.assign(currentRow, updatedRow);
          }

          this.data = [...this.data];
          this.calculateTotals();
          this.cdr.detectChanges();

          // // 🎯 確保 API 更新完 DOM 結構後，焦點依然穩固全選在數量格
          // setTimeout(() => {
          //   if (!this.tableEditComponent) return;
          //   const tableEl = document.querySelector(`[table-edit-id] .p-datatable-tbody`);
          //   if (tableEl && tableEl.children[index]) {
          //     const targetRow = tableEl.children[index];
          //     const quantityInput = targetRow.querySelector('.p-inputnumber-input') as HTMLInputElement;
          //     if (quantityInput) {
          //       // 如果目前的焦點已經不在這行，或者使用者已經打完字，就不要重複搶焦點
          //       if (document.activeElement === quantityInput) {
          //         quantityInput.select();
          //       } else {
          //         quantityInput.focus();
          //         quantityInput.select();
          //       }
          //     }
          //   }
          // }, 40);

        } else {
          this.messageService.errorBubble(`查無國際條碼「${keyword}」，請確認條碼是否輸入完整`);
          if (currentRow) {
            Object.assign(currentRow, {
              PLU_MagNo: '', PLU_Name: '', PLU_No: '', UNIT_NAME: '', PLU_BoxQty: 0,
              PLU_StockTaxType: '', PLU_TaxType: '', PLU_SalePrc_UNI: 0, PLU_SalePrc: 0,
              POD_SubQty: 0, POD_BuyNet: 0, POD_SaleAmt: 0,
            });
          }
          this.data = [...this.data];
          this.calculateTotals();
          this.cdr.detectChanges();
        }
      });
    }, 50);
  }

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly dropdown: DropdownApiService,
    public readonly tls52010Service: Tls52010Service,
    private readonly cdr: ChangeDetectorRef
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS52010', this.dataForm);
    if (this.isFormEditable) {
      const { VEN_No, LOGO_No } = this.dataForm.controls;
      VEN_No.disable();
      LOGO_No.disable();
    }
    if (!this.isFormCreateable) {
      this.loading = false;
      this.tls52010Service.queryPOS2017({ PO_No: this.dataForm.controls.PO_No.value }).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data.map(item => ({
          ...item,
          PLU_SalePrc_UNI: item.POD_BuyPrc,
          PLU_SalePrc: item.POD_SalePrc
        }));
        this.originalData = [...this.data];
        this.calculateTotals();
        this.cdr.detectChanges();
      });
      this.GetBudgetAmount();
      this.loadDropdownOptions();
    } else {
      this.loadDropdownOptions();
    }
    this.loadDialogData();
  }
  private loadDropdownOptions(): void {
    const { VEN_No, LOGO_No, HOS_No, APPLY_Date } = this.dataForm.controls;

    // --- A. 初始資料載入 (保留原本的倉別與關聯資料) ---
    forkJoin({
      warehouse: this.dropdown.queryPos2034(),
      logoAccorHos: this.dropdown.queryLogoAccorHOS({}).pipe(
        map(options => options?.map(opt => opt as unknown as LogoAccorHosItem) ?? [])
      ),
    }).pipe(untilDestroyed(this)).subscribe(({ warehouse, logoAccorHos }) => {
      this.fullLogoAccorHosData = logoAccorHos;
      this.fullWarehouseOptions = warehouse || [];

      // 初始品牌清單 (由 queryPluLogo 取得完整清單，之後會被動態覆蓋)
      this.dropdown.queryPluLogo().subscribe(res => {
        this.fullLogoOptions = res || [];
        this.filteredLogoOptions = this.fullLogoOptions;
      });

      this.filteredWarehouseOptions = this.fullWarehouseOptions;
    });

    // --- B. [廠商 ↔ 品牌] 雙向連動 ---

    // 1. 監聽廠商變動 -> 更新品牌清單
    VEN_No.valueChanges.pipe(debounceTime(300), untilDestroyed(this), distinctUntilChanged()).subscribe(venNo => {
      if (venNo) {
        // 調用雙向 API：由廠商查品牌
        this.dropdown.queryLogoByVen(venNo).subscribe(opts => {
          this.filteredLogoOptions = opts;
          // 如果當前品牌不在新清單內，清空它
          if (LOGO_No.value && !opts?.some(o => o.value === LOGO_No.value)) {
            LOGO_No.setValue(null, { emitEvent: false });
          }
        });
      } else {
        this.filteredLogoOptions = this.fullLogoOptions;
      }
      this.resetDetails();
    });

    // 2. 監聽品牌變動 -> 更新廠商清單 + 原本的倉別過濾
    LOGO_No.valueChanges.pipe(debounceTime(300), untilDestroyed(this), distinctUntilChanged()).subscribe(logoNo => {
      if (logoNo) {
        // (1) 更新廠商下拉選單 (雙向連動新加的)
        this.dropdown.queryVenByLogo(logoNo).subscribe(opts => {
          this.vendorOptions = of(opts);
          if (VEN_No.value && !opts?.some(o => o.value === VEN_No.value)) {
            VEN_No.setValue(null, { emitEvent: false });
          }
        });

        // (2) 執行原本的倉別過濾邏輯
        this.filterWarehouseOptions(logoNo);

        // 自動帶入倉別 (原本邏輯)
        const associatedHOS = this.fullLogoAccorHosData.filter(i => i.LOGO_No === logoNo).map(i => i.HOS_No);
        if (associatedHOS.length === 1 && HOS_No.value !== associatedHOS[0]) {
          HOS_No.setValue(associatedHOS[0], { emitEvent: false });
        }
      } else {
        // 品牌清空時的處理
        this.vendorOptions = this.dropdown.queryPos2013TltTalent();
        this.filterWarehouseOptions(null);
        HOS_No.setValue(null, { emitEvent: false });
      }

      this.GetBudgetAmount();
      this.resetDetails();
    });

    // --- C. [品牌 ↔ 倉別] 雙向連動 (原本邏輯，微調以配合廠商) ---

    HOS_No.valueChanges.pipe(debounceTime(300), untilDestroyed(this), distinctUntilChanged()).subscribe(hosNo => {
      this.filterLogoOptions(hosNo);

      const associatedLogo = this.fullLogoAccorHosData.filter(i => i.HOS_No === hosNo).map(i => i.LOGO_No);
      if (associatedLogo.length === 1 && LOGO_No.value !== associatedLogo[0]) {
        LOGO_No.setValue(associatedLogo[0]); // 這裡觸發 LOGO 變動，進而也會去過濾廠商
      } else if (!hosNo) {
        // 倉別清空不一定要清空品牌，除非業務需求
      }
      this.cdr.detectChanges();
    });

    // 監聽日期 (預算)
    APPLY_Date.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe(() => this.GetBudgetAmount());

    // 確保在非新增模式（編輯模式）下也能載入預算金額
    if (!this.isFormCreateable) {
      this.GetBudgetAmount();
    }
  }
  // 抽取重複的清空 logic
  private resetDetails() {
    this.calculateTotals();
    this.data = [];
    this.selectedItems = [];
    this.dialogData = [];
  }

  /** 新增成功後選擇「繼續新增」時，還原表單與明細（不含重整整頁） */
  private resetFormForContinueNew(): void {
    this.dataForm.patchValue({
      PO_No: '系統自動產生',
      VEN_No: null,
      LOGO_No: null,
      HOS_No: null,
      remainingBudgetAmount: 0,
      PO_TotalBuyNet: 0,
      PO_TotalBuyTax: 0,
      PO_TotalBuyAmt: 0,
      PO_TotalSaleAmt: 0,
      APPLY_USR_No: this.user?.user_No ?? null,
      APPLY_USR_Name: this.user?.user_Name ?? null,
      APPLY_Date: new Date(),
      PO_Remark: null,
    });
    this.remainingBudgetAmount = 0;
    this.resetDetails();
    this.originalData = [];
    this.filteredLogoOptions = this.fullLogoOptions;
    this.filteredWarehouseOptions = this.fullWarehouseOptions;
    this.vendorOptions = this.dropdown.queryPos2013TltTalent();
    this.cdr.detectChanges();
  }
  /**
 * 根據選定的品牌代碼 (LOGO_No) 過濾倉別 (HOS_No) 選項
 * @param logoNo 選定的 LOGO_No
 * @param options 選項 (可選，用於初始載入時的特殊處理)
 */
  private filterWarehouseOptions(logoNo: string | null, options?: { initialLoad?: boolean }): void {
    if (!this.fullLogoAccorHosData || !this.fullWarehouseOptions) return;

    if (!logoNo) {
      // LOGO_No 清除時，HOS_No 顯示所有選項
      this.filteredWarehouseOptions = this.fullWarehouseOptions;
      return;
    }

    // 1. 取得所有與該 LOGO_No 關聯的 HOS_No
    const associatedHOSNos = new Set(
      this.fullLogoAccorHosData
        .filter(item => item.LOGO_No === logoNo)
        .map(item => item.HOS_No)
    );

    // 2. 過濾 HOS_No 選項
    if (associatedHOSNos.size > 0) {
      this.filteredWarehouseOptions = this.fullWarehouseOptions.filter(warehouse =>
        associatedHOSNos.has(warehouse.value)
      );
    } else {
      // 如果 LOGO_No 查不到 HOS_No 關聯，則清空 HOS_No 選項列表
      this.filteredWarehouseOptions = [];
    }

    // 3. 檢查當前 HOS_No 值是否仍有效
    const currentHOSNo = this.dataForm.controls.HOS_No.value;
    if (currentHOSNo && !associatedHOSNos.has(currentHOSNo) && !options?.initialLoad) {
      // 如果當前值不在新的過濾列表中，則清空它
      this.dataForm.controls.HOS_No.setValue(null, { emitEvent: false });
    }
  }

  /**
 * 根據選定的倉別 (HOS_No) 過濾品牌代碼 (LOGO_No) 選項
 * @param hosNo 選定的 HOS_No
 * @param options 選項 (可選，用於初始載入時的特殊處理)
 */
  private filterLogoOptions(hosNo: string | null, options?: { initialLoad?: boolean }): void {
    if (!this.fullLogoAccorHosData || !this.fullLogoOptions) return;

    if (!hosNo) {
      // HOS_No 清除時，LOGO_No 顯示所有選項
      this.filteredLogoOptions = this.fullLogoOptions;
      return;
    }

    // 1. 取得所有與該 HOS_No 關聯的 LOGO_No
    const associatedLOGONos = new Set(
      this.fullLogoAccorHosData
        .filter(item => item.HOS_No === hosNo)
        .map(item => item.LOGO_No)
    );

    // 2. 過濾 LOGO_No 選項
    if (associatedLOGONos.size > 0) {
      this.filteredLogoOptions = this.fullLogoOptions.filter(brand =>
        associatedLOGONos.has(brand.value)
      );
    } else {
      // 如果 HOS_No 查不到 LOGO_No 關聯，則清空 LOGO_No 選項列表
      this.filteredLogoOptions = [];
    }

    // 3. 檢查當前 LOGO_No 值是否仍有效
    const currentLOGONo = this.dataForm.controls.LOGO_No.value;
    if (currentLOGONo && !associatedLOGONos.has(currentLOGONo) && !options?.initialLoad) {
      // 如果當前值不在新的過濾列表中，則清空它
      this.dataForm.controls.LOGO_No.setValue(null, { emitEvent: false });
    }
  }
  GetBudgetAmount(): void {// 獲取剩餘預算金額
    const { LOGO_No, APPLY_Date } = this.dataForm.controls;
    if (!LOGO_No.value || !APPLY_Date.value) return;
    const applyYearMonth = `${APPLY_Date.value.getFullYear()}${(APPLY_Date.value.getMonth() + 1).toString().padStart(2, '0')}`;
    const budgetRequest: IGetBudgetAmountRequest = { LOGO_No: LOGO_No.value ?? '', YYYYMM: applyYearMonth };
    this.tls52010Service.GetBudgetAmount(budgetRequest).pipe(untilDestroyed(this)).subscribe(response => {
      this.dataForm.controls.remainingBudgetAmount.setValue(response.Data);
      this.remainingBudgetAmount = response.Data;
    });
  }
  // 選擇商品相關
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    CAT_LNo: [null], // 大分類代碼
    CAT_MNo: [{ value: null, disabled: true }], // 中分類代碼
    CAT_SNo: [{ value: null, disabled: true }], // 小分類代碼
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'PLU_No', order: 1 }]],
  });
  totalRecords = 0;
  CAT_LNoOptions: IDropdownItem[] = [];
  CAT_MNoOptions: IDropdownItem[] = [];
  CAT_SNoOptions: IDropdownItem[] = [];
  dialogData: IQueryPOS2004DetailResponse[] = [];
  dialogLastQueryBody: IQueryPOS2004DetailRequest | null = null;
  selectedItemsDialog: IQueryPOS2004DetailResponse[] = [];
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : value === '1' ? '應稅' : '' },
    { field: 'PLU_SalePrc_UNI', header: '單價', showSort: false, format: formatAmount },
    { field: 'PLU_SalePrc', header: '售價', format: formatAmount },
  ]
  dialogLoading = false;
  loadDialogData() {
    // 獲取大分類下拉選項
    this.dropDownListService.queryPOS2003_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.CAT_LNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    });
    // 監聽大分類變化
    this.dialogQueryForm.controls.CAT_LNo.valueChanges.pipe(
      debounceTime(300),
      untilDestroyed(this)
    ).subscribe((value) => {
      // 1. 先重置後續分類的選項與值
      this.CAT_MNoOptions = [];
      this.CAT_SNoOptions = [];
      this.dialogQueryForm.controls.CAT_MNo.setValue(null);
      this.dialogQueryForm.controls.CAT_SNo.setValue(null);

      if (value) {
        this.dropDownListService.queryPOS20031_DropDownList({ CAT_LNo: [value] })
          .pipe(untilDestroyed(this))
          .subscribe(response => {
            this.CAT_MNoOptions = response.Data.map(item => ({
              ...item,
              label: `${item.No} - ${item.Name}`
            }));
            // 2. 先 Enable 才能確保 UI 選項能被選取
            this.dialogQueryForm.controls.CAT_MNo.enable();
            // 3. 強制變更偵測，讓 PrimeNG 渲染新的 Options
            this.cdr.detectChanges();
          });
      } else {
        this.dialogQueryForm.controls.CAT_MNo.disable();
      }
    });
    // 監聽中分類變化
    this.dialogQueryForm.controls.CAT_MNo.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value) => {
      if (value && this.dialogQueryForm.controls.CAT_LNo.value) {
        this.dropDownListService.queryPOS20032_DropDownList({
          CATList: [
            {
              CAT_LNo: this.dialogQueryForm.controls.CAT_LNo.value,
              CAT_MNo: value
            }
          ]
        }).pipe(untilDestroyed(this)).subscribe(response => {
          this.CAT_SNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
        });
        this.dialogQueryForm.controls.CAT_SNo.enable();
      } else {
        this.dialogQueryForm.controls.CAT_SNo.disable();
      }
      this.dialogQueryForm.controls.CAT_SNo.setValue(null); // 清空中分類選擇
    });
  }
  onQuery(frm: FormGroup) {
    this.dialogLoading = true;
    const body = {
      ...frm.getRawValue(),
      VEN_No: this.dataForm.controls.VEN_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
    }
    this.tls52010Service.queryPOS2004Detail(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
      this.dialogLastQueryBody = body;
    })
  }
  saveDialog() {
    this.dialogVisible = false;
    const newItems = this.selectedItemsDialog.map(item => {
      const buyPrc = item.PLU_SalePrc_UNI || 0;
      const salePrc = item.PLU_SalePrc || 0;
      const taxType = item.PLU_StockTaxType;
      const subQty = 1; // 預設數量為 1

      const buyNet = subQty * buyPrc;
      const buyTax = taxType === '1' ? Math.round(buyNet * 0.05) : 0;
      const buyAmt = Math.round(buyNet + buyTax);
      const saleAmt = Math.round(subQty * salePrc);
      const saleTax = item.PLU_TaxType === '1' ? Math.round((salePrc * subQty) / 21) : 0;
      return {
        ...item,
        id: 0,
        POD_BuyNet: buyNet, // 修正
        POD_BuyTax: buyTax, // 新增
        POD_BuyAmt: buyAmt, // 新增
        POD_SaleAmt: saleAmt, // 修正
        POD_SaleTax: saleTax, // 新增
        PLU_BoxQty: item.PLU_BoxQty === undefined || item.PLU_BoxQty === null ? 0 : item.PLU_BoxQty,
        POD_SubQty: subQty, // 修正為 1
        POD_Remark: ''
      }
    });
    this.data = [
      ...this.data,
      ...newItems as any
    ];
    this.calculateTotals();
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.cdr.detectChanges();
  }

  isRowSelectable(event: IPOS2004DetailData): boolean {
    return !this.data || !this.data.some((item: IPOS2004DetailData) => item.PLU_MagNo === event.PLU_MagNo);
  }

  // 總計計算邏輯
  calculateTotals(): void {
    let totalBuyNet = 0;
    let totalBuyTax = 0; // 總額彙總
    let totalSaleAmt = 0;

    try {
      this.data.forEach(item => {
        const subQty = Number(item.POD_SubQty) || 0;
        const buyPrc = Number(item.PLU_SalePrc_UNI) || 0;
        const salePrc = Number(item.PLU_SalePrc) || 0;

        // 重新計算明細行的小計（未稅）
        const buyNet = subQty * buyPrc;

        // 重新計算明細行的稅額（應稅 = 5%，免稅 = 0）
        const rowTax = item.PLU_StockTaxType === '1' ? Math.round(buyNet * 0.05) : 0;

        // 重新計算明細行的含稅合計
        const rowBuyAmt = buyNet + rowTax;

        // 重新計算銷售小計
        const rowSaleAmt = Math.round(subQty * salePrc);

        // 更新回物件，確保 TableEditComponent 顯示的是重算後的數值
        item.POD_BuyNet = buyNet;
        item.POD_BuyTax = rowTax;
        item.POD_BuyAmt = rowBuyAmt;
        item.POD_SaleAmt = rowSaleAmt;

        // 累加到表單總計
        totalBuyNet += Math.round(buyNet);
        totalBuyTax += rowTax;
        totalSaleAmt += rowSaleAmt;
      });
    } catch (e) {
      console.error(e);
      totalBuyNet = totalBuyTax = totalSaleAmt = 0;
    }
    // 採購金額 = 小計總和 (取整)
    const finalBuyNet = totalBuyNet;
    // 總稅額 = 稅額總和 (因為 rowTax 已經 round，所以這一定是整數)
    const finalBuyTax = totalBuyTax;
    // 合計金額 = 採購金額 + 總稅額
    const finalTotalAmt = finalBuyNet + finalBuyTax;
    this.dataForm.patchValue({
      PO_TotalBuyNet: finalBuyNet,
      PO_TotalBuyTax: finalBuyTax,
      PO_TotalBuyAmt: finalTotalAmt,
      PO_TotalSaleAmt: Math.round(totalSaleAmt)
    });
    this.cdr.detectChanges();
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (this.data && this.data.length === 0) {
        this.messageService.errorBubble('明細至少要有一筆');
        this.loading = false
        return;
      }
      const valid = this.tableEditComponent.validateAndShowErrors()
      if (!valid) { this.loading = false; return; }
      const formData = frm.getRawValue(); // 獲取所有表單值，包括 disabled 的
      if (formData.remainingBudgetAmount < formData.PO_TotalBuyAmt) {
        this.messageService.errorBubble('採購金額不能大於剩餘預算金額');
        this.loading = false
        return;
      }
      const details: IPODetail[] = this.data.map((item) => ({
        id: this.isFormCreateable ? 0 : item.id,
        PO_No: this.dataForm.controls.PO_No.value,
        POD_SeqNo: item.POD_SeqNo,
        HOS_No: this.dataForm.controls.HOS_No.value,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        PLU_MagNo: item.PLU_MagNo,
        PLU_No: item.PLU_No,
        PLU_Name: item.PLU_Name,
        PLU_Unit: item.PLU_Unit,
        PLU_BoxQty: item.PLU_BoxQty || 0,
        PLU_StockTaxType: item.PLU_StockTaxType,
        POD_SaleTax: item.POD_SaleTax || 0,
        PLU_TaxType: item.PLU_TaxType,
        POD_SubQty: item.POD_SubQty || 0, // 確保有值，使用之前計算好的 POD_SubQty
        POD_BuyPrc: item.PLU_SalePrc_UNI || 0, // 採購單價 (未稅進價)
        POD_BuyNet: item.POD_BuyNet || 0, // 採購淨額 (已計算過並取整數)
        POD_BuyTax: item.PLU_StockTaxType === '1' ? Math.round(Number(item.POD_BuyNet || 0) * 0.05) : 0, // 採購稅額 (已計算過並取整數)
        POD_BuyAmt: Math.round(Number(item.POD_BuyNet || 0) + Number(item.POD_BuyTax || 0)), // 採購金額 (含稅合計，做四捨五入)
        POD_SalePrc: item.PLU_SalePrc || 0, // 銷售單價 (含稅售價)
        POD_SaleAmt: item.POD_SaleAmt || 0, // 銷售金額 (已計算過並取整數)
        POD_Remark: item.POD_Remark || '', // 如果有明細備註欄位，請從 item 中取值
      }));
      // 再次計算總數量，或者從 calculateTotals 中取得
      const totalSubQty = details.reduce((sum, item) => sum + (item.POD_SubQty || 0), 0);
      const submitData: ITLS52010Request = {
        id: this.isFormCreateable ? undefined : this.rowdata?.id,
        org_id: this.rowdata?.org_id || null,
        ODM_TaxType: this.rowdata?.ODM_TaxType || '1',
        PO_No: formData.PO_No,
        PO_Status: this.rowdata?.PO_Status || '0',
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        VEN_No: formData.VEN_No,
        LOGO_No: formData.LOGO_No,
        HOS_No: formData.HOS_No,
        PO_TotalBuyNet: formData.PO_TotalBuyNet,
        PO_TotalBuyTax: formData.PO_TotalBuyTax,
        PO_TotalBuyAmt: formData.PO_TotalBuyAmt,
        PO_TotalSubQty: totalSubQty, // 使用計算後的總數量
        PO_TotalSaleAmt: formData.PO_TotalSaleAmt,
        APPLY_Date: formData.APPLY_Date,
        APPLY_USR_No: this.authService.currentUserValue?.user_No || '',
        APPLY_USR_Name: this.authService.currentUserValue?.user_Name || '', // 確保取到用戶姓名
        PO_Remark: formData.PO_Remark,
        BudgetAmount: formData.remainingBudgetAmount, // 這裡應該是實際的預算金額，而不是剩餘預算金額。
        YYYYMM: `${formData.APPLY_Date.getFullYear()}${(formData.APPLY_Date.getMonth() + 1).toString().padStart(2, '0')}`,
        Details: details, // 帶入轉換後的明細資料陣列
      };
      // 處理提交邏輯 (呼叫 insert 或 update)
      const request$ = this.isFormCreateable ? this.tls52010Service.insertTLS52010(submitData) : this.tls52010Service.updateTLS52010(submitData);
      request$.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        if (this.isFormCreateable) {
          const poNo = (res.Message ?? '').trim();
          this.messageService.confirm({
            header: '新增成功',
            message: `採購單號：<strong>${poNo || '—'}</strong>`,
            icon: 'check',
            showIcon: true,
            acceptLabel: '返回',
            accept: () => this.onCancel(),
            rejectLabel: '繼續新增',
            reject: () => this.resetFormForContinueNew(),
          });
        } else {
          this.messageService.successBubble(res.Message);
          this.onCancel();
        }
      });
    });
  }
  remainingBudgetAmount = 0;
  onReset() {
    // 如果剩餘預算也需要格式化（例如加上 $ 符號或「金額: 」），也可以比照辦理
    this.dataForm.controls.remainingBudgetAmount.setValue(this.remainingBudgetAmount, { emitEvent: false });
    // 還原資料列表
    this.data = [...this.originalData];
  }
}
