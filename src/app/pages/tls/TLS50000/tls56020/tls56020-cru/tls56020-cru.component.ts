import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IPODetail, IPOS2004DetailData, IQueryPOS2004DetailRequest, ITLS52010Data, Tls52010Service } from '@service/api/tls/tls52010.service';
import { Tls56020Service } from '@service/api/tls/tls56020.service';
import { LogoAccorHosItem, Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/components/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateRequired } from '@shared/components/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount } from '@shared/components/table-report/table-report.model';
import { Column } from '@others/component/table/table.model';
import { PanelModule } from 'primeng/panel';
import { debounceTime, finalize, forkJoin, map } from 'rxjs';
import { mapPagingToBackend } from '../../tls56020/tls56020.model';
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
    NgIf,
    CalendarComponent,
    InputTextareaComponent,
    TableReportComponent,
    DialogComponent,
    DropdownTableComponent,
    TranslateModule,
    TableEditComponent,
    InputNumberComponent
  ],
})
export class TLS56020CRUComponent extends BasicCruPageComponent<ITLS52010Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    SPM_No: [{ value: '系統自動產生', disabled: true }], // 領用單號 (與 POS2016.SPM_No 對應)
    LOGO_No: [null as string | null, [Validators.required]], // 品牌代碼 (與 POS2016.LOGO_No 對應)
    HOS_No: [null as string | null, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    org_id: [null as string | null, [Validators.required]],
    PO_TotalBuyNet: [{ value: 0, disabled: true }], // 採購金額
    PO_TotalBuyTax: [{ value: 0, disabled: true }], //稅額
    PO_TotalBuyAmt: [{ value: 0, disabled: true }], // 合計金額
    PO_TotalSaleAmt: [{ value: 0, disabled: true }], //售價總計
    SPM_TotQty: [{ value: 0, disabled: true }], // 領用數量合計
    SPM_TotBuyNet: [{ value: 0, disabled: true }], // 領用未稅進價小計
    SPM_TotBuyTax: [{ value: 0, disabled: true }], // 領用進價稅額小計
    SPM_TotBuyAmt: [{ value: 0, disabled: true }], // 領用進價合計
    SPM_TotSaleNet: [{ value: 0, disabled: true }], // 領用未稅售價小計
    SPM_TotSaleTax: [{ value: 0, disabled: true }], // 領用售價稅額小計
    SPM_TotSaleAmt: [{ value: 0, disabled: true }], // 領用售價合計
    APPLY_USR_No: [this.authService.currentUserValue?.user_No ?? ''],
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
  fullLogoAccorHosData: LogoAccorHosItem[] = [];
  fullLogoOptions: Option[] = [];
  filteredLogoOptions: Option[] | null = null;
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
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Unit', header: '單位' },
    { field: 'UNIT_NAME', header: '商品單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    {
      field: 'PLU_StockTaxType',
      header: '稅別',
    },
    { field: 'NowHaveQty', header: '目前庫存' },
    { field: 'PLU_SalePrc', header: '商品售價', format: formatAmount },
    { field: 'PLU_SalePrc_UNI', header: '商品進價', format: formatAmount },
    {
      field: 'SPD_ConfirmQty', header: '領用量', type: 'inputNumber', width: '50px',
      onBlur: (rowData: IPOS2004DetailData, value: number, col: EditColumn, index: number) => this.onSPDConfirmQtyChange(rowData, value, col, index)
    },
    { field: 'SPD_BuyPrc', header: '進單價(未稅)', format: formatAmount },
    { field: 'SPD_BuyTax', header: '進價稅額', format: formatAmount },
    { field: 'SPD_BuyAmt', header: '進價小計', format: formatAmount },
    { field: 'SPD_BuyNet', header: '進價小計(未稅)', format: formatAmount },
    { field: 'SPD_SaleTax', header: '售價稅額', format: formatAmount },
    { field: 'SPD_SaleAmt', header: '售價小計', format: formatAmount },
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
    // 領用量不能大於目前庫存
    if ((rowData.SPD_ConfirmQty || 0) > (rowData.NowHaveQty || 0)) {
      return { isValid: false, errorMessage: '領用量不能大於目前庫存' };
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
      PLU_Name: '',
      VEN_No: '',
      LOGO_No: logoNo || '',
      HOS_No: this.dataForm.controls.HOS_No.value || '',
    } as any as IQueryPOS2004DetailRequest;
    setTimeout(() => {
      if (!this.dataForm.controls.LOGO_No.value || !value) {
        return;
      }
      this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results: any) => {
        if (results.Data && results.Data.length > 0) {
          const newData = results.Data[0] as IPOS2004DetailData;
          const buyPrc = newData.PLU_SalePrc_UNI || 0;
          const salePrc = newData.PLU_SalePrc || 0;
          const taxType = newData.PLU_StockTaxType;
          const subQty = 1; // 預設數量為 1
          const buyNet = Math.round(subQty * buyPrc);
          const buyTax = taxType === '1' ? Math.round(buyNet * 0.05) : 0;
          const buyAmt = buyNet + buyTax;
          const saleAmt = Math.round(subQty * salePrc);
          const saleTax = newData.PLU_TaxType === '1' ? Math.round((saleAmt || 0) / 21) : 0;
          const updatedRow: any = {
            ...newData,
            id: 0,
            PLU_MagNo: newData.PLU_MagNo,
            PLU_OrgPLUNo: (newData as any).PLU_OrgPLUNo ?? '',
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
          // 同步設定顯示用 SPD_* 欄位（runtime 屬性）
          (updatedRow as any).SPD_ConfirmQty = updatedRow.POD_SubQty || 0;
          (updatedRow as any).SPD_BuyPrc = updatedRow.PLU_SalePrc_UNI || 0;
          (updatedRow as any).SPD_BuyNet = updatedRow.POD_BuyNet || updatedRow.POD_BuyNet === 0 ? updatedRow.POD_BuyNet : Math.round((updatedRow.PLU_SalePrc_UNI || 0) * (updatedRow.POD_SubQty || 0));
          (updatedRow as any).SPD_BuyTax = updatedRow.POD_BuyTax || (updatedRow.PLU_StockTaxType === '1' ? Math.round(((updatedRow.POD_BuyNet || 0)) * 0.05) : 0);
          (updatedRow as any).SPD_BuyAmt = (updatedRow as any).SPD_BuyNet + (updatedRow as any).SPD_BuyTax;
          (updatedRow as any).SPD_SalePrc = updatedRow.PLU_SalePrc || 0;
          (updatedRow as any).SPD_SaleAmt = updatedRow.POD_SaleAmt || Math.round((updatedRow.PLU_SalePrc || 0) * (updatedRow.POD_SubQty || 0));
          (updatedRow as any).SPD_SaleTax = updatedRow.POD_SaleTax ?? (updatedRow.PLU_TaxType === '1' ? Math.round(((updatedRow.PLU_SalePrc || 0) * (updatedRow.POD_SubQty || 0)) / 21) : 0);
          const currentRow = this.data[index];
          if (currentRow) {
            Object.assign(currentRow, updatedRow);
          }
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
  onSPDConfirmQtyChange(rowData: IPOS2004DetailData, value: any, col: EditColumn, index: number) {
    const qty = Number(value) || 0;
    // 同步 POD_SubQty
    (rowData as any).POD_SubQty = qty;
    const buyPrc = Number((rowData as any).PLU_SalePrc_UNI ?? (rowData as any).POD_BuyPrc ?? 0) || 0;
    const buyNet = Math.round(buyPrc * qty);
    const buyTax = (rowData as any).PLU_StockTaxType === '1' ? Math.round(buyNet * 0.05) : 0;
    const buyAmt = buyNet + buyTax;
    const salePrc = Number((rowData as any).PLU_SalePrc ?? 0) || 0;
    const saleAmt = Math.round(salePrc * qty);
    const saleTax = (rowData as any).PLU_TaxType === '1' ? Math.round(saleAmt / 21) : 0;
    const saleNet = saleAmt - saleTax;
    // 更新 POD_* 實際欄位（後端送出使用）
    (rowData as any).POD_BuyNet = buyNet;
    (rowData as any).POD_BuyTax = buyTax;
    (rowData as any).POD_BuyAmt = buyAmt;
    (rowData as any).POD_SaleAmt = saleAmt;
    (rowData as any).POD_SaleTax = saleTax;
    // 更新顯示用 SPD_* 屬性
    (rowData as any).SPD_ConfirmQty = qty;
    (rowData as any).SPD_BuyPrc = buyPrc;
    (rowData as any).SPD_BuyNet = buyNet;
    (rowData as any).SPD_BuyTax = buyTax;
    (rowData as any).SPD_BuyAmt = buyAmt;
    (rowData as any).SPD_SalePrc = salePrc;
    (rowData as any).SPD_SaleAmt = saleAmt;
    (rowData as any).SPD_SaleTax = saleTax;
    (rowData as any).SPD_SaleNet = saleNet;
    this.data = [...this.data];
    this.calculateTotals();
    this.cdr.detectChanges();
  }
  loadDetailData() {
    if (!this.rowdata) { return; }
    const payload = {
      MID: 0,
      SPM_No: (this.rowdata as any).SPM_No,
      SYS_StoreNo: (this.rowdata as any).SYS_StoreNo || '',
      HOS_No: (this.rowdata as any).HOS_No || this.dataForm.controls.HOS_No.value || '',
      pageSize: 100,
      pageIndex: 1,
      SortBy: []
    };
    this.tls56020Service.queryPOS2024(payload).pipe(untilDestroyed(this)).subscribe((res: any) => {
      const rows = res?.Data || [];
      this.data = rows.map((d: any, idx: number) => {
        const row: any = {
          PO_No: d.PO_No ?? (this.rowdata as any).SPM_No ?? '',
          HOS_No: d.HOS_No ?? payload.HOS_No ?? '',
          id: d.id || d.POS2017_ID || 0,
          POD_SeqNo: d.POD_SeqNo ?? (idx + 1),
          PLU_MagNo: d.PLU_MagNo,
          PLU_Name: d.PLU_Name,
          PLU_No: d.PLU_No,
          PLU_Unit: d.PLU_Unit,
          UNIT_NAME: d.UNIT_NAME ?? d.PLU_Unit,
          PLU_BoxQty: d.PLU_BoxQty ?? 0,
          PLU_StockTaxType: d.PLU_StockTaxType ?? '',
          PLU_TaxType: d.PLU_TaxType ?? '',
          PLU_SalePrc_UNI: d.PLU_SalePrc_UNI ?? d.POD_BuyPrc ?? d.SPD_BuyPrc ?? 0,
          PLU_SalePrc: d.PLU_SalePrc ?? d.POD_SalePrc ?? d.SPD_SalePrc ?? 0,
          NowHaveQty: d.NowHaveQty ?? d.NowHaveQty ?? 0,
          POD_SubQty: d.POD_SubQty ?? d.SPD_ConfirmQty ?? 0,
          POD_BuyNet: d.POD_BuyNet ?? d.SPD_BuyNet ?? 0,
          POD_BuyTax: d.POD_BuyTax ?? d.SPD_BuyTax ?? 0,
          POD_SaleAmt: d.POD_SaleAmt ?? d.SPD_SaleAmt ?? 0,
          POD_Remark: d.POD_Remark ?? d.SPD_Remark ?? '',
          PLU_OrgPLUNo: d.PLU_OrgPLUNo ?? '',
          _TABLE_KEY: d._TABLE_KEY ?? `r${idx}`
        };
        // 設定顯示用的 SPD_* 欄位（runtime 屬性，避開型別錯誤）
        (row as any).SPD_ConfirmQty = row.POD_SubQty || 0;
        (row as any).SPD_BuyPrc = row.PLU_SalePrc_UNI || 0;
        (row as any).SPD_BuyNet = row.POD_BuyNet || Math.round((row.PLU_SalePrc_UNI || 0) * (row.POD_SubQty || 0));
        (row as any).SPD_BuyTax = row.POD_BuyTax || (row.PLU_StockTaxType === '1' ? Math.round(((row.POD_BuyNet || 0)) * 0.05) : 0);
        (row as any).SPD_BuyAmt = (row as any).SPD_BuyNet + (row as any).SPD_BuyTax;
        (row as any).SPD_SalePrc = row.PLU_SalePrc || 0;
        (row as any).SPD_SaleAmt = row.POD_SaleAmt || Math.round((row.PLU_SalePrc || 0) * (row.POD_SubQty || 0));
        (row as any).SPD_SaleTax = row.POD_SaleTax ?? (row.PLU_TaxType === '1' ? Math.round(((row.PLU_SalePrc || 0) * (row.POD_SubQty || 0)) / 21) : 0);
        return row as IPOS2004DetailData;
      });
      this.originalData = JSON.parse(JSON.stringify(this.data));
      this.calculateTotals();
      this.cdr.detectChanges();
    });
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
      map(res => (res?.Data ?? []).map((x: any) => ({ label: `${x.No} - ${x.Name || 'no-name'}`, value: x.No })))
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
      map(response => response.Data.map(item => ({ label: `${item.No} - ${item.Name || 'no-name'}`, value: item.No })))
    ).subscribe(options => {
      this.userOptions = options;
    });
  }
  private loadDropdownOptions(): void {
    const { LOGO_No, HOS_No, APPLY_Date } = this.dataForm.controls;
    forkJoin({
      warehouse: this.dropdown.queryPos2034(),
      logoAccorHos: this.dropdown.queryLogoAccorHOS({}).pipe(
        map(options => options?.map(opt => opt as unknown as LogoAccorHosItem) ?? [])
      ),
    }).pipe(untilDestroyed(this)).subscribe(({ warehouse, logoAccorHos }) => {
      this.fullLogoAccorHosData = logoAccorHos;
      const uniqueLogoNos = new Map<string | number, string>();
      logoAccorHos.forEach(item => {
        if (!uniqueLogoNos.has(item.LOGO_No)) {
          uniqueLogoNos.set(item.LOGO_No, item.LOGO_CH_NAME);
        }
      });
      this.fullLogoOptions = Array.from(uniqueLogoNos)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([value, label]) => ({
          value: value,
          label: `${value} - ${label}`,
        }));
      this.fullWarehouseOptions = warehouse || [];
      this.filteredLogoOptions = this.fullLogoOptions;
      this.filteredWarehouseOptions = this.fullWarehouseOptions;
      this.filterWarehouseOptions(LOGO_No.value, { initialLoad: true });
      this.filterLogoOptions(HOS_No.value, { initialLoad: true });
      if (!this.isFormCreateable && this.rowdata) {
        this.loadDetailData();
      }
    });

    // 只有當部門確實變更為不同的有值部門時，才清空明細；清除（null/空）時不清空，避免誤刪使用者編輯資料
    let previousOrgId = this.rowdata?.org_id ?? this.dataForm.controls.org_id.value ?? null;
    this.dataForm.controls.org_id.valueChanges.pipe(untilDestroyed(this)).subscribe((newOrgId) => {
      this.calculateTotals();
      // 若使用者清空部門（null 或空字串），不要清空 table，僅保留狀態
      if (!newOrgId) {
        return;
      }
      // 若確實變更為不同部門，清空明細（如需重新選商品）
      if (newOrgId !== previousOrgId) {
        this.data = [];
        this.selectedItems = [];
        this.dialogData = [];
        previousOrgId = newOrgId;
      }
    });
    LOGO_No.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((logoNo) => {
      this.filterWarehouseOptions(logoNo);
      const associatedHOSNos = this.fullLogoAccorHosData
        .filter(item => item.LOGO_No === logoNo)
        .map(item => item.HOS_No);
      const uniqueAssociatedHOSNos = [...new Set(associatedHOSNos)];

      if (uniqueAssociatedHOSNos.length === 1 && HOS_No.value !== uniqueAssociatedHOSNos[0]) {
        HOS_No.setValue(uniqueAssociatedHOSNos[0], { emitEvent: false });
        this.filterLogoOptions(HOS_No.value);
      } else if (!logoNo) {
        HOS_No.setValue(null, { emitEvent: false });
        this.filterLogoOptions(null); // 清空 HOS_No，重置 LOGO_No 列表
      }
      this.calculateTotals();
      [this.data, this.selectedItems, this.dialogData] = [[], [], []];
    });
    HOS_No.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((hosNo) => {
      this.filterLogoOptions(hosNo);
      const associatedLOGONos = this.fullLogoAccorHosData.filter(item => item.HOS_No === hosNo).map(item => item.LOGO_No);
      const uniqueAssociatedLOGONos = [...new Set(associatedLOGONos)];
      if (uniqueAssociatedLOGONos.length === 1 && LOGO_No.value !== uniqueAssociatedLOGONos[0]) {
        LOGO_No.setValue(uniqueAssociatedLOGONos[0], { emitEvent: false });
        this.filterWarehouseOptions(LOGO_No.value);
      } else if (!hosNo) {
        // 當使用者清除 HOS_No 時，不要自動清除已選的 LOGO_No，僅重置可選的倉庫列表
        this.filterWarehouseOptions(null);
      }
      this.cdr.detectChanges(); // 觸發畫面更新
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
      this.filteredWarehouseOptions = this.fullWarehouseOptions;
      return;
    }
    const associatedHOSNos = new Set(
      this.fullLogoAccorHosData.filter(item => item.LOGO_No === logoNo).map(item => item.HOS_No)
    );
    if (associatedHOSNos.size > 0) {
      this.filteredWarehouseOptions = this.fullWarehouseOptions.filter(warehouse =>
        associatedHOSNos.has(warehouse.value)
      );
    } else {
      this.filteredWarehouseOptions = [];
    }
    const currentHOSNo = this.dataForm.controls.HOS_No.value;
    if (currentHOSNo && !associatedHOSNos.has(currentHOSNo) && !options?.initialLoad) {
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
      this.filteredLogoOptions = this.fullLogoOptions;
      return;
    }
    const associatedLOGONos = new Set(
      this.fullLogoAccorHosData.filter(item => item.HOS_No === hosNo).map(item => item.LOGO_No)
    );
    if (associatedLOGONos.size > 0) {
      this.filteredLogoOptions = this.fullLogoOptions.filter(brand =>
        associatedLOGONos.has(brand.value)
      );
    } else {
      this.filteredLogoOptions = [];
    }
    const currentLOGONo = this.dataForm.controls.LOGO_No.value;
    if (currentLOGONo && !associatedLOGONos.has(currentLOGONo) && !options?.initialLoad) {
      this.dataForm.controls.LOGO_No.setValue(null, { emitEvent: false });
    }
  }
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    PLU_MagNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    CAT_LNo: [null], // 大分類代碼
    CAT_MNo: [{ value: null, disabled: true }], // 中分類代碼
    CAT_SNo: [{ value: null, disabled: true }], // 小分類代碼
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'PLU_MagNo', order: 1 }]],
  });
  totalRecords = 0;
  dialogLastQueryBody: any = null;
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
    { field: 'PLU_SalePrc', header: '售價', format: formatAmount },
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
  // 把 dialogQueryForm 的原始值轉成 queryPOS2004Detail 需要的後端規格
  private buildDialogQueryBody(raw: any): any {
    const sortVal = raw.SortBy ?? raw.sortBy ?? [{ field: 'PLU_MagNo', order: 1 }];
    const pageSizeVal = raw.PageSize ?? raw.pageSize ?? 30;
    const pageIndexVal = raw.PageIndex ?? raw.pageIndex ?? 1;
    const pagingMapped = mapPagingToBackend({ PageSize: pageSizeVal, PageIndex: pageIndexVal, SortBy: sortVal });
    return {
      ...pagingMapped,
      queryNo: raw.PLU_MagNo || raw.queryNo || '',
      PLU_Name: raw.PLU_Name ?? '',
      CAT_LNo: raw.CAT_LNo ?? '',
      CAT_MNo: raw.CAT_MNo ?? '',
      CAT_SNo: raw.CAT_SNo ?? '',
      OrderBy: raw.OrderBy ?? '',
      Offset: raw.Offset ?? 0,
      LOGO_No: this.dataForm.controls.LOGO_No.value || '',
      HOS_No: this.dataForm.controls.HOS_No.value || '',
      VEN_No: '',
    };
  }

  onQuery(frm: FormGroup) {
    this.dialogLoading = true;
    const raw = frm.getRawValue();
    this.tls52010Service.queryPOS2004Detail(this.buildDialogQueryBody(raw)).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe((response: any) => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
      this.dialogLastQueryBody = raw;
    });
  }

  // 提供給 app-table-report 的查詢函式（滾動載入下一頁／排序）
  queryDialogDetail = (body: any) => this.tls52010Service.queryPOS2004Detail(this.buildDialogQueryBody(body));
  saveDialog() {
    this.dialogVisible = false;
    const newItems = this.selectedItemsDialog.map(item => {
      const copy: any = { ...item, id: 0 };
      // 設定顯示用 SPD_* 欄位
      copy.SPD_ConfirmQty = copy.POD_SubQty ?? copy.SPD_ConfirmQty ?? 0;
      copy.SPD_BuyPrc = copy.PLU_SalePrc_UNI ?? copy.POD_BuyPrc ?? 0;
      copy.SPD_BuyNet = copy.POD_BuyNet ?? Math.round((copy.SPD_BuyPrc || 0) * (copy.SPD_ConfirmQty || 0));
      copy.SPD_BuyTax = copy.POD_BuyTax ?? (copy.PLU_StockTaxType === '1' ? Math.round(((copy.SPD_BuyNet || 0)) * 0.05) : 0);
      copy.SPD_BuyAmt = (copy.SPD_BuyNet || 0) + (copy.SPD_BuyTax || 0);
      copy.SPD_SalePrc = copy.PLU_SalePrc ?? 0;
      copy.SPD_SaleAmt = copy.POD_SaleAmt ?? Math.round((copy.SPD_SalePrc || 0) * (copy.SPD_ConfirmQty || 0));
      copy.SPD_SaleTax = copy.POD_SaleTax ?? (copy.PLU_TaxType === '1' ? Math.round(((copy.SPD_SalePrc || 0) * (copy.SPD_ConfirmQty || 0)) / 21) : 0);
      return copy as IPOS2004DetailData;
    });
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
    let totalBuyNet = 0;
    let totalBuyTax = 0;
    let totalBuyAmt = 0;
    let totalSaleAmt = 0;
    let totalSaleTax = 0;
    let totalSaleNet = 0;
    let totalQty = 0;
    try {
      this.data.forEach(item => {
        const qty = Number(item.POD_SubQty ?? (item as any).SPD_ConfirmQty ?? 0) || 0;
        const buyPrc = Number(item.PLU_SalePrc_UNI ?? (item as any).SPD_BuyPrc ?? 0) || 0;
        const buyNet = Number(item.POD_BuyNet ?? Math.round(buyPrc * qty)) || 0;
        const buyTax = Number(item.POD_BuyTax ?? (item.PLU_StockTaxType === '1' ? Math.round(buyNet * 0.05) : 0)) || 0;
        const buyAmt = buyNet + buyTax;

        const salePrc = Number(item.PLU_SalePrc ?? (item as any).SPD_SalePrc ?? 0) || 0;
        const saleAmt = Number(item.POD_SaleAmt ?? Math.round(salePrc * qty)) || 0;
        const saleTax = Number(item.POD_SaleTax ?? (item.PLU_TaxType === '1' ? Math.round(saleAmt / 21) : 0)) || 0;
        const saleNet = saleAmt - saleTax;

        totalQty += qty;
        totalBuyNet += buyNet;
        totalBuyTax += buyTax;
        totalBuyAmt += buyAmt;
        totalSaleAmt += saleAmt;
        totalSaleTax += saleTax;
        totalSaleNet += saleNet;
      });
    } catch (e) {
      totalBuyNet = totalBuyTax = totalBuyAmt = totalSaleAmt = totalSaleTax = totalSaleNet = totalQty = 0;
    }

    this.dataForm.controls.PO_TotalBuyNet.setValue(Math.round(totalBuyNet));
    this.dataForm.controls.PO_TotalBuyTax.setValue(Math.round(totalBuyTax));
    this.dataForm.controls.PO_TotalBuyAmt.setValue(Math.round(totalBuyAmt));
    this.dataForm.controls.PO_TotalSaleAmt.setValue(Math.round(totalSaleAmt));

    // 更新 SPM totals (readonly controls)
    this.dataForm.controls.SPM_TotQty.setValue(Math.round(totalQty));
    this.dataForm.controls.SPM_TotBuyNet.setValue(Math.round(totalBuyNet));
    this.dataForm.controls.SPM_TotBuyTax.setValue(Math.round(totalBuyTax));
    this.dataForm.controls.SPM_TotBuyAmt.setValue(Math.round(totalBuyAmt));
    this.dataForm.controls.SPM_TotSaleNet.setValue(Math.round(totalSaleNet));
    this.dataForm.controls.SPM_TotSaleTax.setValue(Math.round(totalSaleTax));
    this.dataForm.controls.SPM_TotSaleAmt.setValue(Math.round(totalSaleAmt));
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
        id: this.isFormCreateable ? 0 : this.rowdata?.id || 0,
        SPM_No: formData.SPM_No || '',
        SPM_Status: '',
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
          SPD_Remark: d.POD_Remark || '',
          id: (d as any).id || 0,
          SPM_No: formData.SPM_No || (this.rowdata as any)?.SPM_No || ''
        }))
      } as any;

      // 呼叫 TLS56020 的 insert / update API
      const request$ = this.isFormCreateable
        ? this.tls56020Service.insertTLS56020(payload)
        : this.tls56020Service.updateTLS56020({ id: this.rowdata?.id, ...payload, SPM_No: formData.SPM_No, SPM_Status: (this.rowdata as any)?.SPM_Status ?? this.rowdata?.PO_Status ?? '' });
      request$.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        // 新增成功後返回查詢頁；編輯成功也返回查詢頁
        this.onCancel(res?.Data ?? null);
      });
    });
  }
  suggestions: IPOS2004DetailData[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼/商品管理編號/廠商貨號 - 商品名稱', mainDataField: true },
  ];
  onAutoCompleteInputChange(event: Record<'label', string>) {
    const body = {
      PageSize: 30,
      PageIndex: 1,
      SortBy: [{ field: 'PLU_No', order: 1 }],
      queryNo: event.label || '',
      PLU_Name: '',
      VEN_No: '',
      LOGO_No: this.dataForm.controls.LOGO_No.value || '',
      HOS_No: this.dataForm.controls.HOS_No.value || '',
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results: any) => {
      this.suggestions = [...(results.Data || []).map((item: IPOS2004DetailData) => ({
        ...item, label: (item.PLU_No || '') + '/' + (item.PLU_MagNo || '') + ' - ' + (item.PLU_Name || '')
      }))];
    });
  }
  onLocalCancel() {
    // 還原成初始化時的明細（使用深複製以避免 reference 導致尚未還原的值）
    this.data = JSON.parse(JSON.stringify(this.originalData || []));
    this.selectedItems = [];
    // 若為編輯/檢視模式，回填表單但不觸發 valueChanges（以避免其他 subscriber 將 data 清空）
    if (this.rowdata) {
      const patch = this.rowdata as any;
      this.dataForm.patchValue(patch, { emitEvent: false });
      // 手動更新依賴的下拉篩選（因為我們使用 emitEvent: false）
      this.filterWarehouseOptions(patch.LOGO_No ?? null, { initialLoad: true });
      this.filterLogoOptions(patch.HOS_No ?? null, { initialLoad: true });
    } else {
      this.dataForm.reset();
    }
    this.calculateTotals();
    this.cdr.detectChanges();
  }
}
