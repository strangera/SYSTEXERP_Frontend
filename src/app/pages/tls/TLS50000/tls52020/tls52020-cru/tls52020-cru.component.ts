import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount, formatAmountRoundToInteger } from '@others/component/table/table.model';
import { validateMinNumber } from '@others/component/table/validate-field.model';
import { IPOS2004DetailData, IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { ITLS52020Data, TLS52020Detail, TLS52020Request, Tls52020Service } from '@service/api/tls/tls52020.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { LogoAccorHosItem, Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { ProductAutocompleteComponent } from '@shared/biz-components/product-autocomplete/product-autocomplete';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateRequired } from '@shared/components/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmountWithDecimals } from '@shared/components/table-report/table-report.model';
import { PanelModule } from 'primeng/panel';
import { debounceTime, distinctUntilChanged, finalize, forkJoin, map, of } from 'rxjs';
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
  fullLogoAccorHosData: LogoAccorHosItem[] = [];
  fullLogoOptions: Option[] = [];
  filteredLogoOptions: Option[] | null = null;
  fullWarehouseOptions: Option[] = [];
  filteredWarehouseOptions: Option[] | null = null;
  editColumns: EditColumn[] = [
    {
      field: 'PLU_No', header: '國際條碼', width: '150px', type: 'input', validate: [validateRequired],
      onBlur: (rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) => this.onPLU_MagNoBlur(rowData, value, col, index)
    },
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => getSYS1000('PLU_StockTaxType', value) },
    {
      field: 'CRN_SubQty', header: '數量', type: 'inputNumber', validate: [validateRequired, validateMinNumber(1)], width: '100px',
      calculate: (row) => {
        const subQty = Number(row.CRN_SubQty ?? 0);
        const buyPrc = Number(row.CRN_BuyPrc ?? 0);
        const salePrc = Number(row.CRN_SalePrc ?? 0);
        const buyNet = subQty * buyPrc;
        const buyTax = row.PLU_StockTaxType === '1' ? Math.round(buyNet * 0.05) : 0;
        const buyAmt = Math.round(buyNet + buyTax);
        const saleAmt = Math.round(subQty * salePrc);
        return {
          'CRN_BuyNet': buyNet,
          'CRN_BuyTax': buyTax,
          'CRN_BuyAmt': buyAmt,
          'CRN_SaleAmt': saleAmt,
        };
      }
    },
    { field: 'CRN_BuyPrc', header: '單價', format: (v) => formatAmountWithDecimals(v, 2) },
    { field: 'CRN_BuyNet', header: '小計', format: formatAmountRoundToInteger },
    { field: 'CRN_SalePrc', header: '售價', format: formatAmount },
    { field: 'CRN_SaleAmt', header: '售價小計', format: formatAmount },
    { field: 'CRN_Remark', header: '備註', type: 'input', width: '150px' },
  ];
  originalData: TLS52020Detail[] = [];
  data: TLS52020Detail[] = [];
  selectedItems: TLS52020Detail[] = [];
  validateEntireRow = (rowData: IPOS2004DetailData): { isValid: boolean, errorMessage: string; } => {
    // 1. 如果商品編號還沒填入，先不檢查重複（交給 validateRequired 處理）
    if (!rowData.PLU_MagNo) return { isValid: true, errorMessage: '' };
    // 2. 檢查重複時，排除掉 key 為空的狀況，並確保比對的是「其他」行
    const hasDuplicatePLU_MagNo = this.data.some((item: TLS52020Detail) =>
      item.PLU_MagNo === rowData.PLU_MagNo &&
      item._TABLE_KEY !== rowData._TABLE_KEY &&
      rowData._TABLE_KEY !== undefined // 確保目前的行有 key
    );
    if (hasDuplicatePLU_MagNo) return { isValid: false, errorMessage: '商品已重複' };
    return { isValid: true, errorMessage: '' };
  };

  onPLU_MagNoBlur(rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) {
    const venNo = this.dataForm.controls.VEN_No.value;
    const logoNo = this.dataForm.controls.LOGO_No.value;
    // 1. 立即檢查並退出
    if (!venNo || !logoNo || !value) return;

    // 🎯【核心優化】：失焦當下立刻、同步帶入數量 1，不等 API 回傳
    const currentRow = this.data[index];
    if (currentRow) {
      currentRow.CRN_SubQty = 1;
      this.calculateTotals();
      this.cdr.detectChanges();
    }

    const body = { VEN_No: venNo, queryNo: value, LOGO_No: logoNo };

    // 2. 延遲執行 API 查詢，讓瀏覽器有時間處理 Tab 鍵焦點跳轉
    setTimeout(() => {
      // 再次檢查，防止在延遲期間，使用者清除了 VEN_No/LOGO_No
      if (!this.dataForm.controls.VEN_No.value || !this.dataForm.controls.LOGO_No.value || !value) return;
      this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
        const keyword = value.trim();
        const newData = results.Data?.find(d => d.PLU_No === keyword || d.PLU_MagNo === keyword || d.PLU_OrgPLUNo === keyword);
        if (newData) {
          const buyPrc = newData.PLU_SalePrc_UNI || 0;
          const salePrc = newData.PLU_SalePrc || 0;
          const taxType = newData.PLU_StockTaxType;

          // 💡 讀取使用者在 API 回傳前可能已經敲進去的新數量，若無則維持剛剛給的 1
          const subQty = currentRow?.CRN_SubQty ?? 1;

          const buyNet = subQty * buyPrc;
          const buyTax = taxType === '1' ? Math.round(buyNet * 0.05) : 0; // 計算稅額
          const buyAmt = Math.round(buyNet + buyTax); // 計算合計
          const saleAmt = Math.round(subQty * salePrc); // 銷售小計
          const originalKey = this.data[index]._TABLE_KEY;

          const updatedProps = {
            ...newData, // 帶入所有查詢結果的屬性
            _TABLE_KEY: originalKey,
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
            CRN_Remark: currentRow?.CRN_Remark || '' // 避免覆蓋打字途中的備註
          };

          // 在原地更新行物件的屬性
          Object.assign(this.data[index], updatedProps);
          // 替換 data 的引用，通知通用表格元件更新
          this.data = [...this.data];
          this.calculateTotals();
          this.cdr.detectChanges();

          // // 🎯 當成功查到商品並自動帶入後，等 DOM 渲染完自動全選數量
          // setTimeout(() => {
          //   const tableEl = document.querySelector(`[table-edit-id] .p-datatable-tbody`);
          //   if (tableEl && tableEl.children[index]) {
          //     const targetRow = tableEl.children[index];
          //     const quantityInput = targetRow.querySelector('.p-inputnumber-input') as HTMLInputElement;
          //     if (quantityInput) {
          //       if (document.activeElement === quantityInput) {
          //         quantityInput.select();
          //       } else {
          //         quantityInput.focus();
          //         quantityInput.select(); // 執行全選，讓使用者按 2 直接覆蓋 1
          //       }
          //     }
          //   }
          // }, 40);

        } else {
          this.messageService.errorBubble(`查無國際條碼「${keyword}」，請確認條碼是否輸入完整`);
          // 在原地清空欄位值
          Object.assign(this.data[index], {
            PLU_MagNo: '', PLU_Name: '', PLU_No: '', UNIT_NAME: '', PLU_BoxQty: 0,
            PLU_StockTaxType: '', PLU_TaxType: '', CRN_SubQty: 0, CRN_BuyNet: 0,
            CRN_BuyTax: 0, CRN_BuyAmt: 0, CRN_SaleAmt: 0, CRN_BuyPrc: 0, CRN_SalePrc: 0, CRN_Remark: ''
          });
          // 替換 data 的引用，通知通用表格元件更新
          this.data = [...this.data];
          this.calculateTotals();
          this.cdr.detectChanges();
        }
      });
    }, 50);
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
        this.calculateTotals();
        this.cdr.detectChanges();
      });
    }
    this.loadDialogData();
  }
  private loadDropdownOptions(): void {
    const { VEN_No, LOGO_No, HOS_No } = this.dataForm.controls;

    // 1. 取得初始資料 (倉別與品牌倉別關聯)
    forkJoin({
      warehouse: this.dropdown.queryPos2034(),
      logoAccorHos: this.dropdown.queryLogoAccorHOS({}).pipe(
        map(options => options?.map(opt => opt as unknown as LogoAccorHosItem) ?? [])
      ),
    }).pipe(untilDestroyed(this)).subscribe(({ warehouse, logoAccorHos }) => {
      this.fullLogoAccorHosData = logoAccorHos;
      this.fullWarehouseOptions = warehouse || [];

      // 取得初始完整品牌清單 (供廠商未選時使用)
      this.dropdown.queryPluLogo().subscribe(res => {
        this.fullLogoOptions = res || [];
        // 如果目前沒選廠商也沒選倉別，則顯示全部
        if (!VEN_No.value && !HOS_No.value) {
          this.filteredLogoOptions = this.fullLogoOptions;
        }
      });

      this.filteredWarehouseOptions = this.fullWarehouseOptions;

      // 編輯模式初始過濾
      if (!this.isFormCreateable) {
        this.filterWarehouseOptions(LOGO_No.value, { initialLoad: true });
        this.filterLogoOptions(HOS_No.value, { initialLoad: true });
      }
    });

    // --- A. [廠商 ↔ 品牌] 雙向連動 (非同步 API) ---

    // 1. 監聽廠商變動 -> 觸發品牌選單更新
    VEN_No.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      untilDestroyed(this)
    ).subscribe(venNo => {
      if (venNo) {
        this.dropdown.queryLogoByVen(venNo).subscribe(opts => {
          this.filteredLogoOptions = opts;
          // 檢查現有品牌是否在廠商代理範圍內
          if (LOGO_No.value && !opts?.some(o => o.value === LOGO_No.value)) {
            LOGO_No.setValue(null, { emitEvent: false });
          }
        });
      } else {
        this.filteredLogoOptions = this.fullLogoOptions;
      }
      this.clearDetails();
    });

    // 2. 監聽品牌變動 -> 觸發廠商選單更新 + 倉別過濾
    LOGO_No.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      untilDestroyed(this)
    ).subscribe(logoNo => {
      if (logoNo) {
        // (1) 更新廠商選項
        this.dropdown.queryVenByLogo(logoNo).subscribe(opts => {
          this.vendorOptions = of(opts);
          if (VEN_No.value && !opts?.some(o => o.value === VEN_No.value)) {
            VEN_No.setValue(null, { emitEvent: false });
          }
        });

        // (2) 過濾倉別並自動帶入 (原本邏輯)
        this.filterWarehouseOptions(logoNo);
        const associatedHOS = this.fullLogoAccorHosData
          .filter(i => String(i.LOGO_No) === String(logoNo))
          .map(i => i.HOS_No);

        if (associatedHOS.length === 1 && HOS_No.value !== associatedHOS[0]) {
          HOS_No.setValue(associatedHOS[0], { emitEvent: false });
          this.filterLogoOptions(associatedHOS[0]);
        }
      } else {
        // 清空時還原
        this.vendorOptions = this.dropdown.queryPos2013TltTalent();
        this.filterWarehouseOptions(null);
        if (HOS_No.value) HOS_No.setValue(null, { emitEvent: false });
      }
      this.clearDetails();
      this.cdr.detectChanges();
    });

    // --- B. [品牌 ↔ 倉別] 雙向連動 (前端靜態過濾) ---

    HOS_No.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      untilDestroyed(this)
    ).subscribe(hosNo => {
      this.filterLogoOptions(hosNo);

      if (hosNo) {
        const associatedLogo = this.fullLogoAccorHosData
          .filter(i => i.HOS_No === hosNo)
          .map(i => i.LOGO_No);

        // 如果該倉別只對應一個品牌，自動帶入品牌 (這會進一步觸發廠商更新)
        if (associatedLogo.length === 1 && String(LOGO_No.value) !== String(associatedLogo[0])) {
          LOGO_No.setValue(associatedLogo[0]);
        }
      }
      this.cdr.detectChanges();
    });
  }

  /** 抽取重複的清空明細邏輯 */
  private clearDetails() {
    this.data = [];
    this.selectedItems = [];
    this.dialogData = [];
    this.calculateTotals();
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
      const buyNet = subQty * buyPrc;
      const buyTax = taxType === '1' ? Math.round(buyNet * 0.05) : 0;
      const buyAmt = Math.round(buyNet + buyTax);
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
    this.calculateTotals();
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

    try {
      this.data.forEach(item => {
        // 確保取得數值
        const subQty = Number(item.CRN_SubQty) || 0;
        const buyPrc = Number(item.CRN_BuyPrc) || 0;
        const salePrc = Number(item.CRN_SalePrc) || 0;

        // 明細小計 (不在此處 round，保留原始計算值給顯示或後續用)
        const buyNet = subQty * buyPrc;
        // 明細稅額 (依據稅別四捨五入)
        const rowTax = item.PLU_StockTaxType === '1' ? Math.round(buyNet * 0.05) : 0;
        // 明細含稅小計
        const rowBuyAmt = buyNet + rowTax;
        // 銷售小計
        const rowSaleAmt = Math.round(subQty * salePrc);

        // 回填明細物件
        item.CRN_BuyNet = buyNet;
        item.CRN_BuyTax = rowTax;
        item.CRN_BuyAmt = rowBuyAmt;
        item.CRN_SaleAmt = rowSaleAmt;

        // === 核心修正點：逐行取整後累加 ===
        totalBuyNet += Math.round(buyNet);
        totalBuyTax += rowTax; // rowTax 已經 round 過了
        totalSaleAmt += rowSaleAmt;
      });
    } catch (e) {
      console.error(e);
    }

    // 更新表單總計
    const finalBuyNet = totalBuyNet;
    const finalBuyTax = totalBuyTax;
    const finalBuyAmt = finalBuyNet + finalBuyTax;

    this.dataForm.patchValue({
      CRN_TotalBuyNet: finalBuyNet,
      CRN_TotalBuyTax: finalBuyTax,
      CRN_TotalBuyAmt: finalBuyAmt,
      CRN_TotalSaleAmt: Math.round(totalSaleAmt)
    });

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
      if (!valid) { this.loading = false; return; }
      const formData = frm.getRawValue();
      // 確保 Details 轉換時帶入計算後的稅額與進價合計
      const details: TLS52020Detail[] = this.data.map((item) => {
        // 即時確保稅額有被算出 (防禦性計算)
        const buyNet = item.CRN_BuyNet || 0;
        const buyTax = item.PLU_StockTaxType === '1' ? Math.round(buyNet * 0.05) : 0;
        return {
          id: this.isFormCreateable ? 0 : item.id,
          CRN_No: this.dataForm.controls.CRN_No.value,
          SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
          HOS_No: this.dataForm.controls.HOS_No.value,
          PLU_MagNo: item.PLU_MagNo,
          PLU_No: item.PLU_No,
          PLU_Name: item.PLU_Name,
          PLU_Unit: item.PLU_Unit,
          PLU_BoxQty: item.PLU_BoxQty || 0,
          PLU_StockTaxType: item.PLU_StockTaxType,
          PLU_TaxType: item.PLU_TaxType,
          CRN_SubQty: item.CRN_SubQty || 0,
          CRN_BuyPrc: item.CRN_BuyPrc || 0,
          CRN_BuyNet: buyNet,            // 傳送未稅小計
          CRN_BuyTax: buyTax,            // 修正：補上傳送稅額
          CRN_BuyAmt: Math.round(buyNet + buyTax), // 修正：補上傳送進價合計 (含稅)
          CRN_SalePrc: item.CRN_SalePrc || 0,
          CRN_SaleAmt: item.CRN_SaleAmt || 0,
          CRN_Remark: item.CRN_Remark || '',
        };
      });
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
        CRN_TotalSubQty: totalSubQty,
        CRN_TotalBuyNet: this.dataForm.controls.CRN_TotalBuyNet.value,
        CRN_TotalBuyTax: this.dataForm.controls.CRN_TotalBuyTax.value,
        CRN_TotalBuyAmt: this.dataForm.controls.CRN_TotalBuyAmt.value,
        CRN_TotalSaleAmt: this.dataForm.controls.CRN_TotalSaleAmt.value,
        APPLY_Date: this.dataForm.controls.APPLY_Date.value,
        APPLY_USR_No: this.authService.currentUserValue?.user_No || '',
        APPLY_USR_Name: this.authService.currentUserValue?.user_Name || '',
        CRN_Remark: formData.CRN_Remark || '',
        YYYYMM: `${formData.APPLY_Date.getFullYear()}${(formData.APPLY_Date.getMonth() + 1).toString().padStart(2, '0')}`,
        Details: details,
      };
      const request$ = this.isFormCreateable
        ? this.tls52020Service.insertTLS52020(submitData)
        : this.tls52020Service.updateTLS52020(submitData);

      request$.pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      ).subscribe(res => {
        if (this.isFormCreateable) {
          // 取得回傳的進貨單號 (假設 Message 回傳的是單號)
          const crnNo = (res.Message ?? '').trim();

          this.messageService.confirm({
            header: '新增成功',
            message: `退貨單號：<strong>${crnNo || '—'}</strong>`,
            icon: 'check',
            showIcon: true,
            acceptLabel: '返回',
            accept: () => this.onCancel(),
            rejectLabel: '繼續新增',
            reject: () => this.resetFormForContinueNew(),
          });
        } else {
          this.messageService.successBubble(res.Message || '修改成功');
          this.onCancel();
        }
      });
    });
  }

  /** 新增成功後選擇「繼續新增」時，還原表單與明細 */
  private resetFormForContinueNew(): void {
    this.dataForm.patchValue({
      CRN_No: '系統自動產生',
      VEN_No: null,
      LOGO_No: null,
      HOS_No: null,
      CRN_TotalBuyNet: 0,
      CRN_TotalBuyTax: 0,
      CRN_TotalBuyAmt: 0,
      CRN_TotalSaleAmt: 0,
      APPLY_USR_No: this.user?.user_No ?? null,
      APPLY_USR_Name: this.user?.user_Name ?? null,
      APPLY_Date: new Date(),
      CRN_Remark: null,
    });

    this.clearDetails(); // 清空 data 陣列與計算總額
    this.vendorOptions = this.dropdown.queryPos2013TltTalent(); // 還原廠商下拉選單
    this.filteredLogoOptions = this.fullLogoOptions;
    this.filteredWarehouseOptions = this.fullWarehouseOptions;

    this.cdr.detectChanges();
  }
  onReset() { this.data = [...this.originalData]; }
}
