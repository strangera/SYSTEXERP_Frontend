import { Tls56020Service } from '../../../service/api/tls/tls56020.service';

import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { LogoAccorHosItem, Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { PanelModule } from 'primeng/panel';
import { debounceTime, finalize, forkJoin, map } from 'rxjs';
import { IPODetail, IPOS2004DetailData, IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, ITLS52010Data, Tls52010Service } from '../../../service/api/tls/tls52010.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { DropdownTableComponent, FieldsConfig } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// 2.5.2.1  採購單維護作業 CRU
@Component({
  selector: 'app-tls56020-cru',
  templateUrl: './tls56020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    NgClass,
    NgIf,
    InputNumberComponent,
    CalendarComponent,
    InputTextareaComponent,
    TableComponent,
    DialogComponent,
    DropdownTableComponent,
    TranslateModule,
    AsyncPipe,
    TableEditComponent
  ],
})
export class TLS56020CRUComponent extends BasicCruPageComponent<ITLS52010Data> implements OnInit {
  // === 表單群組 (與 POS2016 欄位對應) ===
  dataForm = this.formBuilder.nonNullable.group({
    SPM_No: [{ value: '系統自動產生', disabled: true }], // 領用單號 (與 POS2016.SPM_No 對應)
    LOGO_No: [null as string | null, [Validators.required]], // 品牌代碼 (與 POS2016.LOGO_No 對應)
    HOS_No: [null as string | null, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    org_id: [null as string | null, [Validators.required]],
    PO_TotalBuyNet: [{ value: 0, disabled: true }], // 採購金額
    PO_TotalBuyTax: [{ value: 0, disabled: true }], //稅額
    PO_TotalBuyAmt: [{ value: 0, disabled: true }], // 合計金額
    PO_TotalSaleAmt: [{ value: 0, disabled: true }], //售價總計
    APPLY_USR_No: [''], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_USR_Name: [''], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_Date: [new Date() as Date | null, [Validators.required]], // 申請日期 (移除 disabled: true)**
    PO_Remark: [null as string | null, [Validators.maxLength(200)]], // 採購單備註 (對應 POS2016.PO_Remark)
    SPM_Type: [null as string | null], // 領用類別
    SPM_remark: [''],


  });
  issuanceTypeOptions: { label: string; value: string }[] = [
    { label: '贈品領用', value: '1' },
    { label: '公關活動', value: '2' },
  ];
  userOptions: { label: string; value: string }[] = [];
  departmentOptions: { label: string, value: string }[] = [];
  // === 下拉選單選項 ===
  // 廠商選單已移除，改以部門篩選
  // 儲存【完整的品牌/倉別關聯數據】 (使用新的 API 查詢結果)
  fullLogoAccorHosData: LogoAccorHosItem[] = [];
  // 儲存所有【不重複的品牌】選項 (用於綁定到畫面上 LOGO_No 的選項)
  fullLogoOptions: Option[] = [];
  filteredLogoOptions: Option[] | null = null;
  // 儲存所有【不重複的倉別】選項 (用於綁定到畫面上 HOS_No 的選項)
  fullWarehouseOptions: Option[] = [];
  filteredWarehouseOptions: Option[] | null = null;
  editColumns: EditColumn[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Unit', header: '單位' },
    { field: 'UNIT_NAME', header: '商品單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    {
      field: 'PLU_StockTaxType',
      header: '稅別',
    },
    { field: 'NowHaveQty', header: '目前庫存' },
    { field: 'PLU_SalePrc', header: '商品售價', type: 'inputNumber' },
    { field: 'PLU_SalePrc_UNI', header: '商品進價', type: 'inputNumber' },
    { field: 'POD_Remark', header: '備註', type: 'input' },
  ];
  originalData: IPOS2004DetailData[] = [];
  data: IPOS2004DetailData[] = [];
  selectedItems: IPOS2004DetailData[] = [];

  validateEntireRow = (rowData: IPOS2004DetailData): { isValid: boolean, errorMessage: string } => {
    const hasDuplicatePLU_MagNo = this.data.some((item: IPOS2004DetailData) =>
      item.PLU_MagNo === rowData.PLU_MagNo && item._TABLE_KEY !== rowData._TABLE_KEY);
    if (hasDuplicatePLU_MagNo) {
      return { isValid: false, errorMessage: '商品管理編號重複' };
    }

    return { isValid: true, errorMessage: '' };
  };

  onPLU_MagNoBlur(rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) {
    const logoNo = this.dataForm.controls.LOGO_No.value;
    if (!logoNo || !value) {
      return;
    }
    const body = {
      PageSize: 1,
      PageIndex: 1,
      SortBy: [],
      queryNo: value,
      PLU_Name: null,
      LOGO_No: logoNo,
      HOS_No: this.dataForm.controls.HOS_No.value,
    } as any as IQueryPOS2004DetailRequest;
    setTimeout(() => {
      if (!this.dataForm.controls.LOGO_No.value || !value) {
        return;
      }
      this.tls56020Service.queryPOS2004Detail_TLS56020(body).pipe(untilDestroyed(this)).subscribe((results) => {
        if (results.Data && results.Data.length > 0) {
          const newData = results.Data[0];
          const buyPrc = newData.PLU_SalePrc_UNI || 0;
          const salePrc = newData.PLU_SalePrc || 0;
          const taxType = newData.PLU_StockTaxType;
          const subQty = 1; // 預設數量為 1

          const buyNet = Math.round(subQty * buyPrc);
          const buyTax = taxType === '1' ? Math.round(buyNet * 0.05) : 0;
          const buyAmt = buyNet + buyTax;
          const saleAmt = Math.round(subQty * salePrc);
          const saleTax = newData.PLU_TaxType === '1' ? Math.round((saleAmt || 0) / 21) : 0;
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
            POD_BuyNet: buyNet, // 修正為計算後的 buyNet
            POD_BuyTax: buyTax, // 新增
            POD_BuyAmt: buyAmt, // 新增
            POD_SaleAmt: saleAmt, // 修正為計算後的 saleAmt
            POD_SaleTax: saleTax, // 新增 (確保明細資料結構包含此欄位)
            POD_Remark: ''
          };
          const currentRow = this.data[index];
          if (currentRow) {
            // 使用 Object.assign 或手動賦值來更新現有的行對象，而不是替換整個 data 引用
            Object.assign(currentRow, updatedRow);
          }
          // 必須發射一個新的 data 陣列參考給通用元件，確保 change detection 捕捉到
          this.data = [...this.data];

          this.calculateTotals();
          this.cdr.detectChanges();
        } else {
          this.messageService.errorBubble('查無該商品資訊');
          const currentRow = this.data[index];
          if (currentRow) {
            Object.assign(currentRow, {
              PLU_MagNo: '',
              PLU_Name: '',
              PLU_No: '',
              UNIT_NAME: '',
              PLU_BoxQty: 0,
              PLU_StockTaxType: '',
              PLU_TaxType: '',
              PLU_SalePrc_UNI: 0,
              PLU_SalePrc: 0,
              POD_SubQty: 0,
              POD_BuyNet: 0,
              POD_SaleAmt: 0,
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
    private readonly tls52010Service: Tls52010Service,
    private readonly tls56020Service: Tls56020Service,
    private readonly cdr: ChangeDetectorRef
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS56020', this.dataForm);
    if (this.isFormEditable) {
      // 若為可編輯狀態，僅鎖定 LOGO_No
      this.dataForm.controls.LOGO_No.disable();
    }
    this.loadDropdownOptions();
    this.loadDialogData();
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(
      untilDestroyed(this),
      map(res => (res?.Data ?? []).map((x: any) => ({ label: x.Name, value: x.No })))
    ).subscribe(options => this.userOptions = options);
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.departmentOptions = (response.Data || []).map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No
        }));
      });
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this),
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => {
      this.userOptions = options;
    });
  }
  private loadDropdownOptions(): void {
    const { LOGO_No, HOS_No, APPLY_Date } = this.dataForm.controls;

    // 1. 取得完整資料並設定初始選項
    forkJoin({
      // 獲取所有倉別 (用於構建 HOS_No 的基本選項列表)
      warehouse: this.dropdown.queryPos2034(),
      // 獲取品牌與倉別的完整對應關係 (使用新的 API)
      logoAccorHos: this.dropdown.queryLogoAccorHOS({}).pipe(
        // 新 API 回傳的是 Option[] 格式，我們需要還原或使用其內建的物件屬性
        map(options => options?.map(opt => opt as unknown as LogoAccorHosItem) ?? [])
      ),
    }).pipe(untilDestroyed(this)).subscribe(({ warehouse, logoAccorHos }) => {
      // a. 儲存完整的品牌-倉別關聯數據
      this.fullLogoAccorHosData = logoAccorHos;

      // b. 構建並儲存所有不重複的品牌選項 (從關聯數據中提取)
      const uniqueLogoNos = new Map<string | number, string>();
      logoAccorHos.forEach(item => {
        if (!uniqueLogoNos.has(item.LOGO_No)) {
          uniqueLogoNos.set(item.LOGO_No, item.LOGO_CH_NAME);
        }
      });
      this.fullLogoOptions = Array.from(uniqueLogoNos).map(([value, label]) => ({
        value: value,
        label: `${value} - ${label}`,
      }));

      // c. 儲存所有倉別選項 (直接使用 queryPos2034 的結果)
      this.fullWarehouseOptions = warehouse || [];

      // 初始時，兩個選單都顯示所有選項
      this.filteredLogoOptions = this.fullLogoOptions;
      this.filteredWarehouseOptions = this.fullWarehouseOptions;

      // d. 初始化過濾：根據表單現有值進行雙向過濾
      this.filterWarehouseOptions(LOGO_No.value, { initialLoad: true });
      this.filterLogoOptions(HOS_No.value, { initialLoad: true });
    });

    // 2. 監聽表單欄位變化
    // 改為監聽部門編號變化，作為篩選；變更時清空明細與暫存選取
    this.dataForm.controls.org_id.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.calculateTotals();
      [this.data, this.selectedItems, this.dialogData] = [[], [], []];
    });

    // 監聽 LOGO_No 變化
    LOGO_No.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((logoNo) => {
      // a. 過濾 HOS_No 的選項
      this.filterWarehouseOptions(logoNo);

      // b. 設置建議的 HOS_No (如果 HOS_No 欄位目前是空的，則嘗試填入唯一的對應倉別)
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
        // LOGO_No 被清除時，清空 HOS_No
        HOS_No.setValue(null, { emitEvent: false });
        this.filterLogoOptions(null); // 清空 HOS_No，重置 LOGO_No 列表
      }

      // c. 執行後續邏輯
      this.calculateTotals();
      [this.data, this.selectedItems, this.dialogData] = [[], [], []];
    });

    // 監聽 HOS_No 變化
    HOS_No.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((hosNo) => {
      // a. 過濾 LOGO_No 的選項
      this.filterLogoOptions(hosNo);

      // b. 設置建議的 LOGO_No (如果 LOGO_No 欄位目前是空的，則嘗試填入唯一的對應品牌)
      const associatedLOGONos = this.fullLogoAccorHosData
        .filter(item => item.HOS_No === hosNo)
        .map(item => item.LOGO_No);
      const uniqueAssociatedLOGONos = [...new Set(associatedLOGONos)];

      if (uniqueAssociatedLOGONos.length === 1 && LOGO_No.value !== uniqueAssociatedLOGONos[0]) {
        LOGO_No.setValue(uniqueAssociatedLOGONos[0], { emitEvent: false });
        // 接著呼叫 filterWarehouseOptions 來確保 HOS_No 的選項列表維持一致
        this.filterWarehouseOptions(LOGO_No.value);
      } else if (!hosNo) {
        // HOS_No 被清除時，清空 LOGO_No
        LOGO_No.setValue(null, { emitEvent: false });
        this.filterWarehouseOptions(null); // 清空 LOGO_No，重置 HOS_No 列表
      }

      this.cdr.detectChanges(); // 觸發畫面更新
    });

    // 監聽申請日期變化
    APPLY_Date.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe(() => {
      // 目前不再自動取得剩餘預算金額
    });

    // 不使用剩餘預算金額相關邏輯
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
  // 已移除 GetBudgetAmount 與剩餘預算金額相關邏輯
  // 選擇商品相關
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    PLU_MagNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    CAT_LNo: [null], // 大分類代碼
    CAT_MNo: [{ value: null, disabled: true }], // 中分類代碼
    CAT_SNo: [{ value: null, disabled: true }], // 小分類代碼
    pageSize: [20],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'PLU_MagNo', order: 1 }]],
  });
  totalRecords = 0;
  CAT_LNoOptions: IDropdownItem[] = [];
  CAT_MNoOptions: IDropdownItem[] = [];
  CAT_SNoOptions: IDropdownItem[] = [];
  dialogData: IPOS2004DetailData[] = [];
  selectedItemsDialog: IPOS2004DetailData[] = [];
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : value === '1' ? '應稅' : '' },
    { field: 'PLU_SalePrc', header: '售價' },
    { field: 'NowHaveQty', header: '目前庫存' },
  ]
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
    const raw = frm.getRawValue();
    const body: any = {
      PageSize: raw.PageSize ?? raw.pageSize ?? raw.pageSize ?? 20,
      PageIndex: raw.PageIndex ?? raw.pageIndex ?? 1,
      SortBy: raw.SortBy ?? raw.SortBy ?? [{ field: 'PLU_MagNo', order: 1 }],
      queryNo: raw.PLU_MagNo || raw.queryNo || '',
      PLU_Name: raw.PLU_Name ?? null,
      CAT_LNo: raw.CAT_LNo ?? null,
      CAT_MNo: raw.CAT_MNo ?? null,
      CAT_SNo: raw.CAT_SNo ?? null,
      LOGO_No: this.dataForm.controls.LOGO_No.value || '',
      HOS_No: this.dataForm.controls.HOS_No.value || '',
    };
    this.tls56020Service.queryPOS2004Detail_TLS56020(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
    });
  }
  saveDialog() {
    this.dialogVisible = false;
    // 直接加入選取項目，不進行自動數量/金額計算
    const newItems = this.selectedItemsDialog.map(item => ({ ...item, id: 0 }));
    this.data = [
      ...this.data,
      ...newItems
    ];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.cdr.detectChanges();
  }

  isRowSelectable(event: IPOS2004DetailData): boolean {
    return !this.data || !this.data.some((item: IPOS2004DetailData) => item.PLU_MagNo === event.PLU_MagNo);
  }

  // 總計計算邏輯
  calculateTotals(): void {
    let totalBuyNet = 0; // 採購金額(即所有明細的「小計」加總)
    let totalBuyTax = 0; // 稅額
    let totalSaleAmt = 0; // 售價總計(即所有明細的「售價小計」加總)
    try {
      this.data.forEach(item => {
        const buyNet = Number(item.POD_BuyNet) || 0;
        const buyTax = Number(item.POD_BuyTax) || 0; // 從明細項中取得已計算的稅額
        const saleAmt = Number(item.POD_SaleAmt) || 0;
        totalBuyNet += buyNet;
        totalBuyTax += buyTax; // 簡單加總明細稅額
        totalSaleAmt += saleAmt;
      });
    } catch (e) {
      totalBuyNet = totalBuyTax = totalSaleAmt = 0;
    }
    const totalBuyAmt = totalBuyNet + totalBuyTax; // 採購合計
    // ... 後續的 setValue 保持不變
    this.dataForm.controls.PO_TotalBuyNet.setValue(Math.round(totalBuyNet));
    this.dataForm.controls.PO_TotalBuyTax.setValue(Math.round(totalBuyTax));
    this.dataForm.controls.PO_TotalBuyAmt.setValue(Math.round(totalBuyAmt));
    this.dataForm.controls.PO_TotalSaleAmt.setValue(Math.round(totalSaleAmt));
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
      // 不再檢查剩餘預算金額
      const details: IPODetail[] = this.data.map((item) => ({
        id: this.isFormCreateable ? 0 : item.id,
        POD_SeqNo: item.POD_SeqNo,
        HOS_No: this.dataForm.controls.HOS_No.value,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        PLU_MagNo: item.PLU_MagNo,
        PLU_No: item.PLU_No,
        PLU_Name: item.PLU_Name,
        PLU_Unit: item.PLU_Unit,
        PLU_BoxQty: item.PLU_BoxQty || 0,
        PLU_StockTaxType: item.PLU_StockTaxType,
        POD_SaleTax: item.PLU_TaxType === '1' ? Math.round((item.POD_SaleAmt || 0) * 0.05) : 0,
        PLU_TaxType: item.PLU_TaxType,
        POD_SubQty: item.POD_SubQty || 0, // 確保有值，使用之前計算好的 POD_SubQty
        POD_BuyPrc: item.PLU_SalePrc_UNI || 0, // 採購單價 (未稅進價)
        POD_BuyNet: item.POD_BuyNet || 0, // 採購淨額 (已計算過並取整數)
        POD_SalePrc: item.PLU_SalePrc || 0, // 銷售單價 (含稅售價)
        POD_SaleAmt: item.POD_SaleAmt || 0, // 銷售金額 (已計算過並取整數)
        POD_Remark: item.POD_Remark || '', // 如果有明細備註欄位，請從 item 中取值
      }));
      // 再次計算總數量，或者從 calculateTotals 中取得
      const totalSubQty = details.reduce((sum, item) => sum + (item.POD_SubQty || 0), 0);
      // 建立 TLS56020 所需的 payload
      const payload = {
        SYS_StoreNo: '10', // 固定值
        LOGO_No: formData.LOGO_No,
        HOS_No: formData.HOS_No,
        org_id: formData.org_id || this.rowdata?.org_id || null,
        SPM_Type: formData.SPM_Type || null,
        APPLY_Date: formData.APPLY_Date ? new Date(formData.APPLY_Date).toISOString() : null,
        APPLY_USR_No: this.authService.currentUserValue?.user_No || '',
        APPLY_USR_Name: this.authService.currentUserValue?.user_Name || '',
        SPM_TotQty: totalSubQty,
        SPM_TotBuyNet: formData.PO_TotalBuyNet || 0,
        SPM_TotBuyTax: formData.PO_TotalBuyTax || 0,
        SPM_TotBuyAmt: formData.PO_TotalBuyAmt || 0,
        SPM_TotSaleNet: 0,
        SPM_TotSaleTax: 0,
        SPM_TotSaleAmt: formData.PO_TotalSaleAmt || 0,
        SPM_Remark: formData.SPM_remark || formData.PO_Remark || '',
        Details: details.map(d => ({
          SYS_StoreNo: '10',
          HOS_No: this.dataForm.controls.HOS_No.value,
          PLU_MagNo: d.PLU_MagNo,
          PLU_No: d.PLU_No,
          PLU_Unit: d.PLU_Unit,
          PLU_BoxQty: d.PLU_BoxQty || 0,
          PLU_Name: d.PLU_Name,
          PLU_StockTaxType: d.PLU_StockTaxType,
          SPD_ConfirmQty: d.POD_SubQty || 0,
          SPD_BuyPrc: d.POD_BuyPrc || 0,
          SPD_BuyNet: d.POD_BuyNet || 0,
          SPD_BuyTax: ((d as any).POD_BuyTax) || 0,
          SPD_BuyAmt: ((d as any).POD_BuyAmt) || ((d.POD_BuyNet || 0) + (((d as any).POD_BuyTax) || 0)),
          PLU_TaxType: d.PLU_TaxType,
          SPD_SalePrc: d.POD_SalePrc || 0,
          SPD_SaleTax: ((d as any).POD_SaleTax) || 0,
          SPD_SaleAmt: d.POD_SaleAmt || 0,
          SPD_Remark: d.POD_Remark || ''
        }))
      } as any;

      // 呼叫 TLS56020 的 insert / update API
      const request$ = this.isFormCreateable
        ? this.tls56020Service.insertTLS56020(payload)
        : this.tls56020Service.updateTLS56020({ id: this.rowdata?.id, ...payload, SPM_No: formData.SPM_No, SPM_Status: this.rowdata?.PO_Status || undefined });
      request$.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else {
          this.onCancel();
        }
      });
    });
  }
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號/國際條碼/廠商貨號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號 - 商品名稱', mainDataField: true },
  ];
  opData: IQueryPOS2004DetailResponse[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;
  onAutoCompleteInputChange(event: any) {
    const body = {
      PageSize: 30,
      PageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
      queryNo: event.PLU_MagNo || '',
      PLU_Name: null,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      HOS_No: this.dataForm.controls.HOS_No.value,
    } as any;
    this.tls56020Service.queryPOS2004Detail_TLS56020(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...(results.Data || []).map((item: IQueryPOS2004DetailResponse) => ({
        ...item, label: (item.PLU_MagNo || '') + '/' + (item.PLU_No || '') + '/' + (item.PLU_OrgPLUNo || '') + ' - ' + (item.PLU_Name || '')
      }))];
    });
  }
  onformValueChanged(event: IQueryPOS2004DetailRequest) {
    this.opLoading = true;
    const ev: any = event;
    const body = {
      ...ev,
      PageSize: ev.PageSize ?? 30,
      PageIndex: ev.PageIndex ?? 1,
      SortBy: ev.SortBy ?? [{ field: 'PLU_MagNo', order: 1 }],
      queryNo: ev.queryNo ?? '',
      PLU_Name: ev.PLU_Name ?? null,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      HOS_No: this.dataForm.controls.HOS_No.value,
    } as any;
    this.tls56020Service.queryPOS2004Detail_TLS56020(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...(results.Data || [])];
      this.opTotalRecords = results.TotalCount || 0;
      this.opLoading = false;
    });
  }
  onReset() {
    this.data = [...this.originalData];
  }
}
