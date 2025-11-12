import { ChangeDetectorRef, Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { IPOS2004DetailData, ITLS52020Data, TLS52020Detail, TLS52020Request, Tls52020Service } from '../../../service/api/tls/tls52020.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { validateMinNumber } from '../../../shared/componentkit/table/validate-field.model';
import { Column, createPaginationConfig, formatAmount, RowEditSaveEvent } from '../../../shared/componentkit/table/table.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, finalize, firstValueFrom, withLatestFrom } from 'rxjs';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '../../../service/api/tls/tls52010.service';
import { FieldsConfig, DropdownTableComponent } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { getSYS1000 } from '@service/system/sys1000.service';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { formatAmountWithDecimals } from '@shared/componentkit/table-report/table-report.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
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
    NgClass,
    NgIf,
    InputNumberComponent,
    CalendarComponent,
    InputTextareaComponent,
    TableComponent,
    DialogComponent,
    DropdownTableComponent,
    TranslateModule,
    TableEditComponent,
    AsyncPipe
  ],
})
export class TLS52020CRUComponent extends BasicCruPageComponent<ITLS52020Data> implements OnInit {
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent
  dataForm = this.formBuilder.nonNullable.group({
    CRN_No: [{ value: '系統自動產生', disabled: true }], // 採購單號 (與 POS2016.PO_No 對應)
    VEN_No: [null as string | null, [Validators.required]], // 廠商編號 (與 POS2016.VEN_No 對應)
    vendorShortName: [{ value: '' as string | undefined, disabled: true }], // 廠商簡稱 (前端專用，不對應資料庫欄位，顯示在 VEN_No 下一欄)
    LOGO_No: [null as string | null, [Validators.required]], // 品牌代碼 (與 POS2016.LOGO_No 對應)
    HOS_No: [null as string | null as string | null, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    CRN_TotalBuyNet: [{ value: 0, disabled: true }], // 採購金額
    CRN_TotalBuyTax: [{ value: 0, disabled: true }], //稅額
    CRN_TotalBuyAmt: [{ value: 0, disabled: true }], // 合計金額
    CRN_TotalSaleAmt: [{ value: 0, disabled: true }], //售價總計
    APPLY_USR_No: [{ value: this.user?.user_No, disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_USR_Name: [{ value: this.user?.user_Name, disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期 (對應 POS2016.APPLY_Date)
    CRN_Remark: [null as string | null, [Validators.maxLength(200)]], // 採購單備註 (對應 POS2016.PO_Remark)
  });
  vendorOptions = this.dropdown.queryPos2013({ VEN_Flag: '' }); // 廠商下拉選單選項
  brandOptions = this.dropdown.queryPluLogoHosNo(); // 品牌下拉選單選項
  warehouseOptions = this.dropdown.queryPos2034() // 倉別下拉選單選項
  editColumns: EditColumn[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => getSYS1000('PLU_StockTaxType', value) },
    {
      field: 'CRN_SubQty',
      header: '數量',
      type: 'inputNumber',
      validate: [validateRequired, validateMinNumber(1)],
      width: '100px',
      calculate: (row) => {
        return {
          'CRN_BuyNet': Math.round(row.CRN_SubQty * row.CRN_BuyPrc), // 計算小計
          'CRN_SaleAmt': Math.round(row.CRN_SubQty * row.CRN_SalePrc) // 計算售價小計
        };
      }
    },
    { field: 'CRN_BuyPrc', header: '單價', format: (v) => formatAmountWithDecimals(v, 2) },
    { field: 'CRN_BuyNet', header: '小計', format: formatAmount },
    { field: 'CRN_SalePrc', header: '售價', format: formatAmount },
    { field: 'CRN_SaleAmt', header: '售價小計', format: formatAmount },
    { field: 'CRN_Remark', header: '備註', type: 'input', width: '150px' },
  ]
  originalData: TLS52020Detail[] = [];
  data: TLS52020Detail[] = [];
  selectedItems: TLS52020Detail[] = [];
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls52020Service: Tls52020Service,
    private readonly cdr: ChangeDetectorRef,
    private readonly tls52010Service: Tls52010Service,
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
  private async loadDropdownOptions(): Promise<void> {
    if (!this.isFormCreateable) {
      // 使用 firstValueFrom 來獲取 Observable 發出的第一個值（即 Option[]）
      const vendorOptions = await firstValueFrom(this.vendorOptions);
      const selectedVendor = vendorOptions?.find(opt => opt['VEN_No'] === this.dataForm.controls.VEN_No.value);
      this.dataForm.controls.vendorShortName.setValue(selectedVendor?.['ShortName'] ?? '');
      this.ShortName = selectedVendor?.['ShortName'] ?? '';
    }
    if (this.isFormCreateable) {
      // 監聽廠商編號變化
      this.dataForm.controls.VEN_No.valueChanges.pipe(withLatestFrom(this.vendorOptions), untilDestroyed(this)).subscribe(([vendorNo, options]) => {
        this.dataForm.controls.vendorShortName.setValue(options?.find(opt => opt.value === vendorNo)?.['ShortName'] ?? '', { emitEvent: false });
        [this.data, this.selectedItems, this.dialogData] = [[], [], []];
      });
      // 監聽品牌代碼變化，用於顯示剩餘預算金額和建議倉別
      this.warehouseOptions.pipe(untilDestroyed(this)).subscribe(warehouseOpts => {
        this.dataForm.controls.LOGO_No.valueChanges.pipe(withLatestFrom(this.brandOptions), debounceTime(300), untilDestroyed(this)).subscribe(([logoNo, brandOpts]) => {
          const selectedBrand = brandOpts?.find(opt => opt.value === logoNo);
          const suggestedHOSNo = selectedBrand ? selectedBrand['No'] : null;
          let finalHOSNo: string | null = null;
          if (suggestedHOSNo && warehouseOpts?.some(opt => opt['No'] === suggestedHOSNo)) {
            finalHOSNo = suggestedHOSNo;
          }
          this.dataForm.controls.HOS_No.setValue(finalHOSNo, { emitEvent: false });
          [this.data, this.selectedItems, this.dialogData] = [[], [], []];
        });
      });
    }
  }
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    PLU_MagNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    CAT_LNo: [null], // 大分類代碼
    CAT_MNo: [{ value: null, disabled: true }], // 中分類代碼
    CAT_SNo: [{ value: null, disabled: true }], // 小分類代碼
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
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
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : '應稅' },
    { field: 'PLU_SalePrc_UNI', header: '單價', showSort: false },
    { field: 'PLU_SalePrc', header: '售價' },
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
    const body = {
      ...frm.getRawValue(),
      VEN_No: this.dataForm.controls.VEN_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
    }
    this.tls52020Service.queryPOS2004DetailVENNoTLS52020(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
    })
  }
  saveDialog() {
    this.dialogVisible = false;
    this.data = [...this.data, ...this.selectedItemsDialog.map(item => ({
      ...item,
      id: 0,
      CRN_SubQty: 1,
      PLU_BoxQty: item.PLU_BoxQty === undefined || item.PLU_BoxQty === null ? 0 : item.PLU_BoxQty,
      CRN_BuyPrc: item.PLU_SalePrc_UNI,
      CRN_SalePrc: item.PLU_SalePrc,
      CRN_Remark: ''
    }))];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.calculateTotals();
  }
  onDelete(selectedRows: TLS52020Detail[]) {
    this.data = this.data.filter(row => !selectedRows.includes(row));
    this.calculateTotals();
  }
  isRowSelectable(event: TLS52020Detail): boolean {
    return !this.data || !this.data.some((item: TLS52020Detail) => item.PLU_MagNo === event.PLU_MagNo);
  }
  onRowEditSave(event: RowEditSaveEvent) {
    const newData: TLS52020Detail = event.newData;
    // 確保 CRN_SubQty 是數字且不為負數，如果為 null 或 undefined 設為 0
    const quantity = newData.CRN_SubQty ? Math.max(0, newData.CRN_SubQty) : 0;
    // SA: "單價：未稅進價。自動帶入商品主檔的PLU_SalePrc售價/1.05 x進貨折數。"
    const unitPriceNet = newData.CRN_BuyPrc || 0;
    // SA: "小計:未稅進價 X 數量，計算取到整數"
    const subtotalNet = Math.round(unitPriceNet * quantity);
    // SA: "售價: 含稅售價。自動帶入商品主檔的含稅售價。不可修改"
    // SA: "售價小計" (在 columns 中為 totalPrice，但 SA 文件中沒有明確定義計算方式，
    // 這裡依據邏輯假設為 含稅售價 * 數量，並取整數)
    const salePrice = newData.CRN_SalePrc || 0;
    const totalPrice = Math.round(salePrice * quantity);
    // 更新 data 陣列中的對應項目
    // PrimeNG 的 RowEditSaveEvent 通常會自動更新表格的底層數據，但為了更明確和確保不可變性
    // 這裡直接使用 index 更新，並觸發變更檢測
    const index = this.data.findIndex(item => item.PLU_MagNo === newData.PLU_MagNo);
    if (index > -1) {
      this.data[index] = {
        ...this.data[index], // 保留原有數據
        CRN_SubQty: quantity, // 更新數量
        CRN_BuyNet: subtotalNet, // 更新小計 (未稅進價 * 數量，取整數)
        CRN_SaleAmt: totalPrice // 更新售價小計 (含稅售價 * 數量，取整數)
      };
      this.data = [...this.data];
      this.cdr.detectChanges(); // 觸發變更檢測，確保 UI 更新
    }
    this.calculateTotals(); // 更新單行後重新計算總計
  }

  // 總計計算邏輯
  calculateTotals(): void {
    let totalBuyNet = 0; // 採購金額(即所有明細的「小計」加總)
    let totalBuyTax = 0; // 採購金額(即所有明細的「小計」加總)
    let totalSaleAmt = 0; // 售價總計(即所有明細的「售價小計」加總)
    this.data.forEach(item => {
      totalBuyNet += item.CRN_BuyNet || 0;
      totalBuyTax += item.PLU_StockTaxType === '1' ? Math.round((item.CRN_BuyNet || 0) * 0.05) : 0;
      totalSaleAmt += item.CRN_SaleAmt || 0;
    });
    const totalBuyAmt = totalBuyNet + totalBuyTax;
    this.dataForm.controls.CRN_TotalBuyNet.setValue(Math.round(totalBuyNet));
    this.dataForm.controls.CRN_TotalBuyTax.setValue(Math.round(totalBuyTax));
    this.dataForm.controls.CRN_TotalBuyAmt.setValue(Math.round(totalBuyAmt));
    this.dataForm.controls.CRN_TotalSaleAmt.setValue(Math.round(totalSaleAmt));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (this.data && this.data.length === 0) {
        this.messageService.errorBubble('明細至少要有一筆');
        this.loading = false
        return;
      }
      const valid = this.tableEditComponent.validateAndShowErrors()
      if (!valid) {
        this.loading = false
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
        PLU_BoxQty: item.PLU_BoxQty,
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
    })
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
      ...event,
      VEN_No: this.dataForm.controls.VEN_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      queryNo: event.PLU_MagNo || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_MagNo + '/' + item.PLU_No + '/' + item.PLU_OrgPLUNo + ' - ' + item.PLU_Name
      }))];
    });
  }
  onformValueChanged(event: IQueryPOS2004DetailRequest) {
    this.opLoading = true;
    const body = {
      ...event,
      VEN_No: this.dataForm.controls.VEN_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...results.Data]; // 更新data資料
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }
  ShortName? = '';
  onReset() {
    this.dataForm.controls.vendorShortName.setValue(this.ShortName, { emitEvent: false });
    this.data = [...this.originalData];
  }
}
