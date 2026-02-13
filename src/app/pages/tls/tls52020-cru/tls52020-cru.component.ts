import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000 } from '@service/system/sys1000.service';
import { LogoAccorHosItem, Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ProductAutocompleteComponent } from '@shared/biz-components/product-autocomplete/product-autocomplete';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmountWithDecimals } from '@shared/componentkit/table-report/table-report.model';
import { PanelModule } from 'primeng/panel';
import { debounceTime, finalize, forkJoin, map, withLatestFrom } from 'rxjs';
import { IPOS2004DetailData, IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '../../../service/api/tls/tls52010.service';
import { ITLS52020Data, TLS52020Detail, TLS52020Request, Tls52020Service } from '../../../service/api/tls/tls52020.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { Column, createPaginationConfig, formatAmount } from '../../../shared/componentkit/table/table.model';
import { validateMinNumber } from '../../../shared/componentkit/table/validate-field.model';
// 2.5.2.3  進貨驗收作業CRU
@Component({
  selector: 'app-tls52020-cru',
  templateUrl: './tls52020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    NgIf,
    InputNumberComponent,
    CalendarComponent,
    InputTextareaComponent,
    TableReportComponent,
    DialogComponent,
    ProductAutocompleteComponent,
    TranslateModule,
    TableEditComponent,
    AsyncPipe
  ],
})
export class TLS52020CRUComponent extends BasicCruPageComponent<ITLS52020Data> implements OnInit {
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  dataForm = this.formBuilder.nonNullable.group({
    CRN_No: [{ value: '系統自動產生', disabled: true }], // 採購單號 (與 POS2016.PO_No 對應)
    VEN_No: [null as string | null, [Validators.required]], // 廠商編號 (與 POS2016.VEN_No 對應)
    LOGO_No: [null as string | null, [Validators.required]], // 品牌代碼 (與 POS2016.LOGO_No 對應)
    HOS_No: [null as string | null as string | null, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    CRN_TotalBuyNet: [{ value: 0, disabled: true }], // 採購金額
    CRN_TotalBuyTax: [{ value: 0, disabled: true }], //稅額
    CRN_TotalBuyAmt: [{ value: 0, disabled: true }], // 合計金額
    CRN_TotalSaleAmt: [{ value: 0, disabled: true }], //售價總計
    APPLY_USR_No: [{ value: this.user?.user_No, disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_USR_Name: [{ value: this.user?.user_Name, disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_Date: [new Date(), [Validators.required]], // 申請日期 (對應 POS2016.APPLY_Date)
    CRN_Remark: [null as string | null, [Validators.maxLength(200)]], // 採購單備註 (對應 POS2016.PO_Remark)
  });
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
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => getSYS1000('PLU_StockTaxType', value) },
    // 找到 editColumns 中的 CRN_SubQty 欄位，修改其 calculate 函數
    {
      field: 'CRN_SubQty',
      header: '數量',
      type: 'inputNumber',
      validate: [validateRequired, validateMinNumber(1)],
      width: '100px',
      calculate: (row) => {
        const subQty = Number(row.CRN_SubQty ?? 0);
        const buyPrc = Number(row.CRN_BuyPrc ?? 0); // 採購單價
        const salePrc = Number(row.CRN_SalePrc ?? 0); // 售價
        const taxType = row.PLU_StockTaxType; // 採購稅別

        // 退貨採購金額計算
        const buyNet = Math.round(subQty * buyPrc); // 採購淨額 (未稅小計)
        const buyTax = taxType === '1' ? Math.round(buyNet * 0.05) : 0; // 採購稅額 (假設稅率 5%)
        const buyAmt = buyNet + buyTax; // 採購合計 (含稅小計)

        // 售價小計計算
        const saleAmt = Math.round(subQty * salePrc);

        return {
          'CRN_BuyNet': buyNet,
          'CRN_BuyTax': buyTax, // 新增：明細採購稅額
          'CRN_BuyAmt': buyAmt, // 新增：明細採購合計 (雖然沒有顯示欄位，但便於提交和總計)
          'CRN_SaleAmt': saleAmt,
        };
      }
    },
    { field: 'CRN_BuyPrc', header: '單價', format: (v) => formatAmountWithDecimals(v, 2) },
    { field: 'CRN_BuyNet', header: '小計', format: formatAmount },
    { field: 'CRN_SalePrc', header: '售價', format: formatAmount },
    { field: 'CRN_SaleAmt', header: '售價小計', format: formatAmount },
    { field: 'CRN_Remark', header: '備註', type: 'input', width: '150px' },
  ];
  originalData: TLS52020Detail[] = [];
  data: TLS52020Detail[] = [];
  selectedItems: TLS52020Detail[] = [];

  validateEntireRow = (rowData: IPOS2004DetailData): { isValid: boolean, errorMessage: string; } => {
    const hasDuplicatePLU_MagNo = this.data.some((item: TLS52020Detail) =>
      item.PLU_MagNo === rowData.PLU_MagNo && item._TABLE_KEY !== rowData._TABLE_KEY);
    if (hasDuplicatePLU_MagNo) {
      return { isValid: false, errorMessage: '商品管理編號重複' };
    }

    return { isValid: true, errorMessage: '' };
  };

  onPLU_MagNoBlur(rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) {
    const venNo = this.dataForm.controls.VEN_No.value;
    const logoNo = this.dataForm.controls.LOGO_No.value;

    // 1. 立即檢查並退出
    if (!venNo || !logoNo || !value) {
      return;
    }
    const body = {
      VEN_No: venNo,
      queryNo: value,
      LOGO_No: logoNo,
    };

    // 2. 延遲執行 API 查詢，讓瀏覽器有時間處理 Tab 鍵焦點跳轉
    setTimeout(() => {
      // 再次檢查，防止在延遲期間，使用者清除了 VEN_No/LOGO_No
      if (!this.dataForm.controls.VEN_No.value || !this.dataForm.controls.LOGO_No.value || !value) {
        return;
      }

      this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {

        if (results.Data && results.Data.length > 0) {
          const newData = results.Data[0];
          const buyPrc = newData.PLU_SalePrc_UNI || 0;
          const salePrc = newData.PLU_SalePrc || 0;
          const taxType = newData.PLU_StockTaxType;
          const subQty = 1; // 預設數量為 1

          const buyNet = Math.round(subQty * buyPrc);
          const buyTax = taxType === '1' ? Math.round(buyNet * 0.05) : 0; // 計算稅額
          const buyAmt = buyNet + buyTax; // 計算合計
          const saleAmt = Math.round(subQty * salePrc); // 銷售小計

          const updatedProps = {
            ...newData, // 帶入所有查詢結果的屬性
            id: 0,
            PLU_MagNo: newData.PLU_MagNo,
            PLU_Name: newData.PLU_Name,
            PLU_No: newData.PLU_No,
            PLU_BoxQty: newData.PLU_BoxQty || 0,
            PLU_StockTaxType: newData.PLU_StockTaxType,
            PLU_TaxType: newData.PLU_TaxType,
            PLU_Unit: newData.PLU_Unit,
            UNIT_NAME: newData.UNIT_NAME,
            CRN_SubQty: subQty,
            CRN_BuyNet: buyNet,
            CRN_BuyTax: buyTax,
            CRN_BuyAmt: buyAmt,
            CRN_SaleAmt: saleAmt,
            CRN_BuyPrc: buyPrc,
            CRN_SalePrc: salePrc,
            CRN_Remark: ''
          };

          // *** 修正點 1：在原地更新行物件的屬性 ***
          Object.assign(this.data[index], updatedProps);

          // *** 修正點 2：替換 data 的引用，通知通用表格元件更新 ***
          this.data = [...this.data];

          this.calculateTotals();
          this.cdr.detectChanges();

        } else {
          this.messageService.errorBubble('查無該商品資訊');

          // *** 修正點 3：在原地清空欄位值 ***
          Object.assign(this.data[index], {
            PLU_MagNo: '',
            PLU_Name: '',
            PLU_No: '',
            UNIT_NAME: '',
            PLU_BoxQty: 0,
            PLU_StockTaxType: '',
            PLU_TaxType: '',
            CRN_SubQty: 0,
            CRN_BuyNet: 0,
            CRN_BuyTax: 0,
            CRN_BuyAmt: 0,
            CRN_SaleAmt: 0,
            CRN_BuyPrc: 0,
            CRN_SalePrc: 0,
            CRN_Remark: ''
          });

          // *** 修正點 4：替換 data 的引用，通知通用表格元件更新 ***
          this.data = [...this.data];
          this.calculateTotals();
          this.cdr.detectChanges();
        }
      });
    }, 50); // 延遲 50 毫秒
  }
  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls52020Service: Tls52020Service,
    private readonly cdr: ChangeDetectorRef,
    public readonly tls52010Service: Tls52010Service,
    private readonly dropdown: DropdownApiService
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS52020', this.dataForm);
    if (this.isFormEditable) {
      this.dataForm.controls.VEN_No.disable();
      this.dataForm.controls.LOGO_No.disable();
    }
    this.loadDropdownOptions();
    if (!this.isFormCreateable) {
      this.tls52020Service.queryPOS2032P({ CRN_No: this.dataForm.controls.CRN_No.value }).pipe(untilDestroyed(this)).subscribe(response => {
        this.data = response.Data;
        let totalSaleAmt = 0;
        this.data.forEach(item => {
          totalSaleAmt += item.CRN_SaleAmt || 0;
        });
        this.dataForm.controls.CRN_TotalSaleAmt.setValue(Math.round(totalSaleAmt));
        this.originalData = [...this.data];
      });
    }
    this.loadDialogData();
  }
  private loadDropdownOptions(): void {
    const { LOGO_No, HOS_No } = this.dataForm.controls;

    // 1. 取得完整資料並設定初始選項 (使用 forkJoin 模擬您的範本邏輯)
    forkJoin({
      // 獲取所有倉別 (用於構建 HOS_No 的基本選項列表)
      warehouse: this.dropdown.queryPos2034(),
      // 獲取品牌與倉別的完整對應關係 (使用新的 API)
      logoAccorHos: this.dropdown.queryLogoAccorHOS({}).pipe(
        // 將 Option[] 轉換為 LogoAccorHosItem[] (假設您的 API 回傳的是 Option 格式)
        map(options => options?.map(opt => opt as unknown as LogoAccorHosItem) ?? [])
      ),
    }).pipe(untilDestroyed(this)).subscribe(({ warehouse, logoAccorHos }) => {
      // a. 儲存完整的品牌-倉別關聯數據
      this.fullLogoAccorHosData = logoAccorHos;

      // b. 構建並儲存所有不重複的品牌選項 (從關聯數據中提取)
      const uniqueLogoNos = new Map<string | number, string>();
      logoAccorHos.forEach(item => {
        // 使用 LOGO_No 和 LOGO_CH_NAME
        if (!uniqueLogoNos.has(item.LOGO_No)) {
          uniqueLogoNos.set(item.LOGO_No, item.LOGO_CH_NAME);
        }
      });
      this.fullLogoOptions = Array.from(uniqueLogoNos).map(([value, label]) => ({
        value: value,
        label: `${value} - ${label}`,
      })).sort((a, b) => {
        const valA = String(a.value);
        const valB = String(b.value);
        return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
      });

      // c. 儲存所有倉別選項 (直接使用 queryPos2034 的結果)
      this.fullWarehouseOptions = warehouse || [];

      // 初始時，兩個選單都顯示所有選項
      this.filteredLogoOptions = this.fullLogoOptions;
      this.filteredWarehouseOptions = this.fullWarehouseOptions;

      // d. 初始化過濾：根據表單現有值進行雙向過濾 (用於編輯模式)
      this.filterWarehouseOptions(LOGO_No.value, { initialLoad: true });
      this.filterLogoOptions(HOS_No.value, { initialLoad: true });
    });

    // 2. 監聽 LOGO_No 變化 (觸發 HOS_No 過濾和建議值設定)
    LOGO_No.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((logoNo) => {
      // a. 過濾 HOS_No 的選項 (此函數內部會處理無效值重置)
      this.filterWarehouseOptions(logoNo);

      // b. 設置建議的 HOS_No (如果過濾後只剩下唯一的對應倉別)
      const associatedHOSNos = this.fullLogoAccorHosData
        .filter(item => item.LOGO_No === logoNo)
        .map(item => item.HOS_No);
      const uniqueAssociatedHOSNos = [...new Set(associatedHOSNos)];

      // 如果只有一個倉別對應，則自動帶入
      if (uniqueAssociatedHOSNos.length === 1 && HOS_No.value !== uniqueAssociatedHOSNos[0]) {
        HOS_No.setValue(uniqueAssociatedHOSNos[0], { emitEvent: false });
        // 接著呼叫 filterLogoOptions 來確保 LOGO_No 的選項列表維持一致
        this.filterLogoOptions(HOS_No.value);
      } else if (!logoNo) {
        // LOGO_No 被清除時，清空 HOS_No (重置邏輯已在 filterWarehouseOptions 內處理)
        if (HOS_No.value !== null) {
          HOS_No.setValue(null, { emitEvent: false });
          this.filterLogoOptions(null); // 清空 HOS_No，重置 LOGO_No 列表
        }
      }
      // 這裡不應包含 GetBudgetAmount/calculateTotals 等與品牌倉別無關的邏輯
      [this.data, this.selectedItems, this.dialogData] = [[], [], []];
      this.cdr.detectChanges(); // 觸發畫面更新
    });

    // 3. 監聽 HOS_No 變化 (觸發 LOGO_No 過濾和建議值設定)
    HOS_No.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((hosNo) => {
      // a. 過濾 LOGO_No 的選項 (此函數內部會處理無效值重置)
      this.filterLogoOptions(hosNo);

      // b. 設置建議的 LOGO_No (如果過濾後只剩下唯一的對應品牌)
      const associatedLOGONos = this.fullLogoAccorHosData
        .filter(item => item.HOS_No === hosNo)
        .map(item => item.LOGO_No);
      const uniqueAssociatedLOGONos = [...new Set(associatedLOGONos)];

      if (uniqueAssociatedLOGONos.length === 1 && LOGO_No.value !== uniqueAssociatedLOGONos[0]) {
        LOGO_No.setValue(uniqueAssociatedLOGONos[0], { emitEvent: false });
        // 接著呼叫 filterWarehouseOptions 來確保 HOS_No 的選項列表維持一致
        this.filterWarehouseOptions(LOGO_No.value);
      } else if (!hosNo) {
        // HOS_No 被清除時，清空 LOGO_No (重置邏輯已在 filterLogoOptions 內處理)
        if (LOGO_No.value !== null) {
          LOGO_No.setValue(null, { emitEvent: false });
          this.filterWarehouseOptions(null); // 清空 LOGO_No，重置 HOS_No 列表
        }
      }

      this.cdr.detectChanges(); // 觸發畫面更新
    });

    // 4. 監聽廠商編號變化 (邏輯不變)
    this.dataForm.controls.VEN_No.valueChanges.pipe(withLatestFrom(this.vendorOptions), untilDestroyed(this)).subscribe(() => {
      [this.data, this.selectedItems, this.dialogData] = [[], [], []];
    });
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
    let newOptions: Option[];
    if (associatedHOSNos.size > 0) {
      newOptions = this.fullWarehouseOptions.filter(warehouse =>
        associatedHOSNos.has(warehouse.value)
      );
    } else {
      // 如果 LOGO_No 查不到 HOS_No 關聯，則清空 HOS_No 選項列表
      newOptions = [];
    }

    // 3. 檢查當前 HOS_No 值是否仍有效 (重置無效值邏輯)
    const currentHOSNo = this.dataForm.controls.HOS_No.value;
    // 只有在非初始化載入時才執行重置邏輯
    if (currentHOSNo && !associatedHOSNos.has(currentHOSNo) && !options?.initialLoad) {
      // 如果當前值不在新的過濾列表中，則清空它
      this.dataForm.controls.HOS_No.setValue(null, { emitEvent: false });
    }

    this.filteredWarehouseOptions = newOptions;
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
    let newOptions: Option[];
    if (associatedLOGONos.size > 0) {
      newOptions = this.fullLogoOptions.filter(brand =>
        associatedLOGONos.has(brand.value)
      );
    } else {
      // 如果 HOS_No 查不到 LOGO_No 關聯，則清空 LOGO_No 選項列表
      newOptions = [];
    }

    // 3. 檢查當前 LOGO_No 值是否仍有效 (重置無效值邏輯)
    const currentLOGONo = this.dataForm.controls.LOGO_No.value;
    // 只有在非初始化載入時才執行重置邏輯
    if (currentLOGONo && !associatedLOGONos.has(currentLOGONo) && !options?.initialLoad) {
      // 如果當前值不在新的過濾列表中，則清空它
      this.dataForm.controls.LOGO_No.setValue(null, { emitEvent: false });
    }

    this.filteredLogoOptions = newOptions;
  }
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    CAT_LNo: [null], // 大分類代碼
    CAT_MNo: [{ value: null, disabled: true }], // 中分類代碼
    CAT_SNo: [{ value: null, disabled: true }], // 小分類代碼
    ...createPaginationConfig([{ field: 'PLU_No', order: 1 }]), // 分頁和排序參數
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
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : '應稅' },
    { field: 'PLU_SalePrc_UNI', header: '單價', showSort: false, format: formatAmount },
    { field: 'PLU_SalePrc', header: '售價', format: formatAmount },
  ];
  dialogLoading = false;
  loadDialogData() {
    // 獲取大分類下拉選項
    this.dropDownListService.queryPOS2003_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.CAT_LNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    });
    // 監聽大分類變化
    this.dialogQueryForm.controls.CAT_LNo.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value) => {
      if (value) {
        this.dropDownListService.queryPOS20031_DropDownList({ CAT_LNo: [value] }).pipe(untilDestroyed(this)).subscribe(response => {
          this.CAT_MNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
          this.dialogQueryForm.controls.CAT_MNo.enable();
        });
      } else {
        this.dialogQueryForm.controls.CAT_MNo.disable();
      }
      this.dialogQueryForm.controls.CAT_MNo.setValue(null); // 清空中分類選擇
      this.dialogQueryForm.controls.CAT_SNo.setValue(null); // 清空中分類選擇
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
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
      this.dialogLastQueryBody = body;
    })
  }
  // 在 TLS52020CRUComponent 內
  saveDialog() {
    this.dialogVisible = false;
    const newItems = this.selectedItemsDialog.map(item => {
      const buyPrc = item.PLU_SalePrc_UNI || 0;
      const salePrc = item.PLU_SalePrc || 0;
      const taxType = item.PLU_StockTaxType;
      const subQty = 1; // 預設數量為 1

      const buyNet = Math.round(subQty * buyPrc);
      const buyTax = taxType === '1' ? Math.round(buyNet * 0.05) : 0;
      const buyAmt = buyNet + buyTax;

      return {
        ...item,
        id: 0,
        CRN_SubQty: subQty,
        PLU_BoxQty: item.PLU_BoxQty === undefined || item.PLU_BoxQty === null ? 0 : item.PLU_BoxQty,
        CRN_BuyPrc: buyPrc,
        CRN_SalePrc: salePrc,
        CRN_Remark: '',
        CRN_BuyNet: buyNet, // 修正
        CRN_BuyTax: buyTax, // 新增
        CRN_BuyAmt: buyAmt, // 新增
        CRN_SaleAmt: Math.round(salePrc), // 修正
      };
    });

    this.data = [...this.data, ...newItems];

    this.selectedItemsDialog = [];
    this.selectedItems = [];

    // 呼叫計算總計
    this.calculateTotals();

    // 確保整個父層元件的視圖刷新，讓主表單的 CRN_TotalXXX 立即顯示更新的值
    this.cdr.detectChanges();
  }
  onDelete(selectedRows: TLS52020Detail[]) {
    this.data = this.data.filter(row => !selectedRows.includes(row));
    this.calculateTotals();
    this.cdr.detectChanges();
  }
  isRowSelectable(event: TLS52020Detail): boolean {
    return !this.data || !this.data.some((item: TLS52020Detail) => item.PLU_MagNo === event.PLU_MagNo);
  }
  // 總計計算邏輯
  calculateTotals(): void {
    let totalBuyNet = 0;
    let totalBuyTax = 0;
    let totalSaleAmt = 0;
    this.data.forEach(item => {
      totalBuyNet += item.CRN_BuyNet || 0; // 使用明細的淨額
      // 從明細 Item 中取得已計算的稅額 (需確保步驟 1, 2 已將此值存入)
      totalBuyTax += item.CRN_BuyTax || 0;
      totalSaleAmt += item.CRN_SaleAmt || 0; // 使用明細的售價小計
    });
    const totalBuyAmt = totalBuyNet + totalBuyTax;
    this.dataForm.controls.CRN_TotalBuyNet.setValue(Math.round(totalBuyNet));
    this.dataForm.controls.CRN_TotalBuyTax.setValue(Math.round(totalBuyTax));
    this.dataForm.controls.CRN_TotalBuyAmt.setValue(Math.round(totalBuyAmt));
    this.dataForm.controls.CRN_TotalSaleAmt.setValue(Math.round(totalSaleAmt));
    this.cdr.detectChanges();
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (this.data && this.data.length === 0) {
        this.messageService.errorBubble('明細至少要有一筆');
        this.loading = false;
        return;
      }
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }
      const formData = frm.getRawValue(); // 獲取所有表單值，包括 disabled 的
      const details: TLS52020Detail[] = this.data.map((item) => ({
        id: this.isFormCreateable ? 0 : item.id,
        CRN_No: this.dataForm.controls.CRN_No.value,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        HOS_No: this.dataForm.controls.HOS_No.value,
        PLU_MagNo: item.PLU_MagNo,
        PLU_No: item.PLU_No, // 國際條碼
        PLU_Name: item.PLU_Name,
        PLU_Unit: item.PLU_Unit,
        PLU_BoxQty: item.PLU_BoxQty || 0,
        PLU_StockTaxType: item.PLU_StockTaxType,
        PLU_TaxType: item.PLU_TaxType,
        CRN_SubQty: item.CRN_SubQty || 0, // 確保有值，使用之前計算好的 POD_SubQty
        CRN_BuyPrc: item.CRN_BuyPrc || 0, // 採購單價 (未稅進價)
        CRN_BuyNet: item.CRN_BuyNet || 0, // 採購淨額 (已計算過並取整數)
        CRN_SalePrc: item.CRN_SalePrc || 0, // 銷售單價 (含稅售價)
        CRN_SaleAmt: item.CRN_SaleAmt || 0, // 銷售金額 (已計算過並取整數)
        CRN_Remark: item.CRN_Remark || '', // 如果有明細備註欄位，請從 item 中取值
      }));
      // 再次計算總數量，或者從 calculateTotals 中取得
      const totalSubQty = details.reduce((sum, item) => sum + (item.CRN_SubQty || 0), 0);
      const submitData: TLS52020Request = {
        id: this.isFormCreateable ? undefined : this.rowdata?.id,
        CRN_No: formData.CRN_No,
        org_id: this.rowdata?.org_id || '',
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        VEN_No: formData.VEN_No,
        LOGO_No: formData.LOGO_No,
        HOS_No: formData.HOS_No,
        CRN_TaxType: this.rowdata?.CRN_TaxType || '1',
        CRN_Status: this.rowdata?.CRN_Status || '0',
        CRN_TotalSubQty: totalSubQty, // 使用計算後的總數量
        CRN_TotalBuyNet: this.dataForm.controls.CRN_TotalBuyNet.value,
        CRN_TotalBuyTax: this.dataForm.controls.CRN_TotalBuyTax.value,
        CRN_TotalBuyAmt: this.dataForm.controls.CRN_TotalBuyAmt.value,
        CRN_TotalSaleAmt: this.dataForm.controls.CRN_TotalSaleAmt.value,
        APPLY_Date: this.dataForm.controls.APPLY_Date.value,
        APPLY_USR_No: this.authService.currentUserValue?.user_No || '',
        APPLY_USR_Name: this.authService.currentUserValue?.user_Name || '', // 確保取到用戶姓名
        CRN_Remark: formData.CRN_Remark || '',
        YYYYMM: `${formData.APPLY_Date.getFullYear()}${(formData.APPLY_Date.getMonth() + 1).toString().padStart(2, '0')}`,
        Details: details, // 帶入轉換後的明細資料陣列
      };
      // 處理提交邏輯 (呼叫 insert 或 update)
      this.handleSubmit(frm, () => {
        const request$ = this.isFormCreateable
          ? this.tls52020Service.insertTLS52020(submitData)
          : this.tls52020Service.updateTLS52020(submitData);

        request$
          .pipe(finalize(() => this.loading = false), untilDestroyed(this))
          .subscribe({
            next: () => {
              this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '修改成功');
              if (this.isFormCreateable) {
                this.dataForm.reset();
              } else {
                this.onCancel();
              }
            }
          });
      });
    });
  }
  onReset() {
    this.data = [...this.originalData];
  }
}
