import { ChangeDetectorRef, Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { debounceTime, finalize } from 'rxjs';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { IGetBudgetAmountRequest, IPODetail, IPOS2004DetailData, IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, ITLS52010Data, ITLS52010Request, Tls52010Service } from '../../../service/api/tls/tls52010.service';
import { Column, createPaginationConfig, RowEditSaveEvent } from '../../../shared/componentkit/table/table.model';
import { validateMinNumber } from '../../../shared/componentkit/table/validate-field.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Sys0110Service } from '../../../service/api/sys/sys0110.service';
import { FieldsConfig, DropdownTableComponent } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgClass, NgIf } from '@angular/common';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { TranslateModule } from '@ngx-translate/core';

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
    NgClass,
    NgIf,
    InputNumberComponent,
    CalendarComponent,
    InputTextareaComponent,
    TableComponent,
    DialogComponent,
    DropdownTableComponent,
    TranslateModule,
  ],
})
export class TLS52010CRUComponent extends BasicCruPageComponent<ITLS52010Data> implements OnInit {
  // === 表單群組 (與 POS2016 欄位對應) ===
  dataForm = this.formBuilder.nonNullable.group({
    PO_No: [{ value: '系統自動產生', disabled: true }], // 採購單號 (與 POS2016.PO_No 對應)
    VEN_No: ['84445301-1', [Validators.required]], // 廠商編號 (與 POS2016.VEN_No 對應)
    vendorShortName: [{ value: '', disabled: true }], // 廠商簡稱 (前端專用，不對應資料庫欄位，顯示在 VEN_No 下一欄)
    LOGO_No: ['0001', [Validators.required]], // 品牌編號 (與 POS2016.LOGO_No 對應)
    remainingBudgetAmount: [{ value: 0, disabled: true }], // 剩餘預算金額 (前端顯示用，不對應資料庫欄位)
    HOS_No: [{ value: null as string | null, disabled: true }, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    PO_TotalBuyNet: [{ value: 0, disabled: true }], // 採購金額
    PO_TotalBuyTax: [{ value: 0, disabled: true }], //稅額
    PO_TotalBuyAmt: [{ value: 0, disabled: true }], // 合計金額
    PO_TotalSaleAmt: [{ value: 0, disabled: true }], //售價總計
    APPLY_USR_No: [{ value: null as string | null, disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期 (對應 POS2016.APPLY_Date)
    PO_Remark: ['', [Validators.maxLength(200)]], // 採購單備註 (對應 POS2016.PO_Remark)
  });
  // === 下拉選單選項 ===
  vendorOptions: IDropdownItem[] = []; // 廠商下拉選單選項
  brandOptions: IDropdownItem[] = []; // 品牌下拉選單選項
  warehouseOptions: IDropdownItem[] = []; // 倉別下拉選單選項
  userOptions: { user_No: string; user_Name: string }[] = []; // 用戶選項

  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Unit', header: '單位編號' },
    { field: 'UNIT_NAME', header: '單位名稱' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : '應稅' },
    { field: 'POD_SubQty', header: '數量', type: 'inputNumber', validate: [validateMinNumber(0)] },
    { field: 'PLU_SalePrc_UNI', header: '單價' },
    { field: 'POD_BuyNet', header: '小計' },
    { field: 'PLU_SalePrc', header: '售價' },
    { field: 'POD_SaleAmt', header: '售價小計' },
    { field: 'POD_Remark', header: '備註', type: 'input' },
  ]
  data: IPOS2004DetailData[] = [];
  selectedItems: IPOS2004DetailData[] = [];

  constructor(
    private dropDownListService: DropDownListService,
    private tls52010Service: Tls52010Service,
    private cdr: ChangeDetectorRef,
    private sys0110Service: Sys0110Service
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS52010', this.dataForm);
    if (this.isFormEditable) {
      this.dataForm.controls.VEN_No.disable();
      this.dataForm.controls.LOGO_No.disable();
    }
    this.loadDropdownOptions();
    if (!this.isFormCreateable) {
      this.tls52010Service.queryPOS2017({ PO_No: this.dataForm.controls.PO_No.value }).pipe(untilDestroyed(this)).subscribe(response => {
        this.data = response.Data.map(item => ({
          ...item,
          PLU_SalePrc_UNI: item.POD_BuyPrc || 0,
          PLU_SalePrc: item.POD_SalePrc || 0
        }));
        let totalSaleAmt = 0; // 售價總計(即所有明細的「售價小計」加總)
        this.data.forEach(item => {
          totalSaleAmt += item.POD_SaleAmt || 0;
        });
        this.dataForm.controls.PO_TotalSaleAmt.setValue(Math.round(totalSaleAmt));
      });
    }
    this.setInitialValuesAndWatchChanges();
    this.loadDialogData();
  }
  private loadDropdownOptions(): void {
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.vendorOptions = response.Data.map(vendor => ({ ...vendor, label: `${vendor.VEN_No} - ${vendor.Name}` }));
      if (!this.isFormCreateable) {
        const selectedVendor = this.vendorOptions.find(opt => opt.VEN_No === this.dataForm.controls.VEN_No.value);
        this.dataForm.controls.vendorShortName.setValue(selectedVendor?.ShortName ?? '');
      }
      // 監聽廠商編號變化
      this.dataForm.controls.VEN_No.valueChanges.pipe(untilDestroyed(this)).subscribe(vendorNo => {
        if (vendorNo) {
          const selectedVendor = this.vendorOptions.find(opt => opt.VEN_No === vendorNo);// 顯示廠商簡稱
          this.dataForm.controls.vendorShortName.setValue(selectedVendor?.ShortName ?? ''); // 假設 Name 是簡稱
        } else {
          this.dataForm.controls.vendorShortName.setValue('');
          this.cdr.detectChanges();
        }
        this.data = [];
        this.selectedItems = [];
        this.calculateTotals();
        this.dialogData = [];
      });
    });
    this.dropDownListService.queryPLULOGO_HOS_No_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandOptions = response.Data;// 品牌
      // 監聽品牌編號變化，用於顯示剩餘預算金額和建議倉別
      this.dataForm.controls.LOGO_No.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe(logoNo => {
        if (logoNo && this.dataForm.controls.APPLY_Date.value) {
          this.GetBudgetAmount(logoNo);
          const HOS_No = this.brandOptions.find(opt => opt.No === logoNo)?.HOS_No || null;
          this.dataForm.controls.HOS_No.setValue(HOS_No);
          this.dataForm.controls.HOS_No.enable();
        } else {
          this.dataForm.controls.HOS_No.setValue(null);
          this.dataForm.controls.HOS_No.disable();
        }
        this.data = [];
        this.selectedItems = [];
        this.calculateTotals();
        this.dialogData = [];
      });
      if (!this.isFormCreateable) {
        this.GetBudgetAmount(this.dataForm.controls.LOGO_No.value);
      }
    });
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(response => {
      this.warehouseOptions = response.Data;// 倉別
    });
  }
  GetBudgetAmount(logoNo: string): void {
    const applyDate = this.dataForm.controls.APPLY_Date.value;
    const applyYearMonth = `${applyDate.getFullYear()}${(applyDate.getMonth() + 1).toString().padStart(2, '0')}`;
    const budgetRequest: IGetBudgetAmountRequest = { LOGO_No: logoNo, YYYYMM: applyYearMonth };
    // 獲取剩餘預算金額
    this.tls52010Service.GetBudgetAmount(budgetRequest).pipe(untilDestroyed(this)).subscribe(response => {
      this.dataForm.controls.remainingBudgetAmount.setValue(response.Data);
    });
  }
  private setInitialValuesAndWatchChanges(): void {
    if (this.isFormCreateable) {
      this.dataForm.controls.APPLY_Date.setValue(new Date());
      this.userOptions = [{ user_No: this.user?.user_No || '', user_Name: this.user?.user_Name || '' }];
      this.dataForm.controls.APPLY_USR_No.setValue(this.userOptions[0]?.user_No || ''); // 假設用戶對象有 userName 屬性
    } else {
      this.sys0110Service.queryUser({ user_No: this.rowdata?.APPLY_USR_No }).pipe(untilDestroyed(this)).subscribe(response => {
        this.userOptions = response.Data.map(user => ({ user_No: user.user_No, user_Name: user.user_Name }));
      })
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
    { field: 'PLU_Unit', header: '單位編號' },
    { field: 'UNIT_NAME', header: '單位名稱' },
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
      if (value) {
        this.dropDownListService.queryPOS20032_DropDownList({ CAT_LNo: [this.dialogQueryForm.controls.CAT_LNo.value || ''], CAT_MNo: [value] }).pipe(untilDestroyed(this)).subscribe(response => {
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
    this.tls52010Service.queryPOS2004DetailByVenNo(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
    })
  }
  saveDialog() {
    this.dialogVisible = false;
    this.data = [...this.data, ...this.selectedItemsDialog.map(item => ({ ...item, POD_SubQty: 0, POD_Remark: '' }))];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.calculateTotals();
  }
  onDelete() {
    this.calculateTotals();
  }
  isRowSelectable(event: IPOS2004DetailData): boolean {
    return !this.data || !this.data.some((item: IPOS2004DetailData) => item.PLU_MagNo === event.PLU_MagNo);
  }
  onRowEditSave(event: RowEditSaveEvent) {
    const newData: IPOS2004DetailData = event.newData;
    // 確保 POD_SubQty 是數字且不為負數，如果為 null 或 undefined 設為 0
    const quantity = newData.POD_SubQty ? Math.max(0, newData.POD_SubQty) : 0;
    // SA: "單價：未稅進價。自動帶入商品主檔的PLU_SalePrc售價/1.05 x進貨折數。"
    const unitPriceNet = newData.PLU_SalePrc_UNI || 0;
    // SA: "小計:未稅進價 X 數量，計算取到整數"
    const subtotalNet = Math.round(unitPriceNet * quantity);
    // SA: "售價: 含稅售價。自動帶入商品主檔的含稅售價。不可修改"
    // SA: "售價小計" (在 columns 中為 totalPrice，但 SA 文件中沒有明確定義計算方式，
    // 這裡依據邏輯假設為 含稅售價 * 數量，並取整數)
    const salePrice = newData.PLU_SalePrc || 0;
    const totalPrice = Math.round(salePrice * quantity);
    // 更新 data 陣列中的對應項目
    // PrimeNG 的 RowEditSaveEvent 通常會自動更新表格的底層數據，但為了更明確和確保不可變性
    // 這裡直接使用 index 更新，並觸發變更檢測
    const index = this.data.findIndex(item => item.PLU_MagNo === newData.PLU_MagNo);
    if (index > -1) {
      this.data[index] = {
        ...this.data[index], // 保留原有數據
        POD_SubQty: quantity, // 更新數量
        POD_BuyNet: subtotalNet, // 更新小計 (未稅進價 * 數量，取整數)
        POD_SaleAmt: totalPrice // 更新售價小計 (含稅售價 * 數量，取整數)
      };
      this.data = [...this.data];
      this.cdr.detectChanges(); // 觸發變更檢測，確保 UI 更新
    }
    this.calculateTotals(); // 更新單行後重新計算總計
  }

  // 總計計算邏輯
  private calculateTotals(): void {
    let totalBuyNet = 0; // 採購金額(即所有明細的「小計」加總)
    let totalBuyTax = 0; // 採購金額(即所有明細的「小計」加總)
    let totalSaleAmt = 0; // 售價總計(即所有明細的「售價小計」加總)
    this.data.forEach(item => {
      totalBuyNet += item.POD_BuyNet || 0;
      totalBuyTax += item.PLU_StockTaxType === '1' ? Math.round((item.POD_BuyNet || 0) * 0.05) : 0;
      totalSaleAmt += item.POD_SaleAmt || 0;
    });
    const totalBuyAmt = totalBuyNet + totalBuyTax;
    this.dataForm.controls.PO_TotalBuyNet.setValue(Math.round(totalBuyNet));
    this.dataForm.controls.PO_TotalBuyTax.setValue(Math.round(totalBuyTax));
    this.dataForm.controls.PO_TotalBuyAmt.setValue(Math.round(totalBuyAmt));
    this.dataForm.controls.PO_TotalSaleAmt.setValue(Math.round(totalSaleAmt));
  }

  onSubmit(frm: FormGroup) {
    // 首先檢查是否有任何明細的 POD_SubQty 不大於 0
    const hasInvalidQuantity = this.data.some(item => (item.POD_SubQty || 0) <= 0);
    if (hasInvalidQuantity) {
      this.messageService.errorBubble('商品明細的「數量」必須大於 0。');
      return; // 阻止表單提交
    }
    if (!this.data || this.data.length === 0) {
      this.messageService.errorBubble('請至少選擇一個商品明細！');
      return; // 阻止提交
    }
    const formData = frm.getRawValue(); // 獲取所有表單值，包括 disabled 的
    const details: IPODetail[] = this.data.map((item) => ({
      id: item.id,
      PO_No: item.PO_No,
      POD_SeqNo: item.POD_SeqNo,
      HOS_No: this.dataForm.controls.HOS_No.value,
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
      PLU_MagNo: item.PLU_MagNo,
      PLU_No: item.PLU_No, // 國際條碼
      PLU_Name: item.PLU_Name,
      PLU_Unit: item.PLU_Unit,
      PLU_BoxQty: item.PLU_BoxQty,
      PLU_StockTaxType: item.PLU_StockTaxType,
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
      PO_TotalBuyAmt: this.dataForm.controls.PO_TotalBuyAmt.value,
      PO_TotalBuyTax: this.dataForm.controls.PO_TotalBuyTax.value,
      PO_TotalBuyNet: this.dataForm.controls.PO_TotalBuyNet.value,
      PO_TotalSubQty: totalSubQty, // 使用計算後的總數量
      PO_TotalSaleAmt: this.dataForm.controls.PO_TotalSaleAmt.value,
      APPLY_Date: this.dataForm.controls.APPLY_Date.value,
      APPLY_USR_No: this.authService.currentUserValue?.user_No || '',
      APPLY_USR_Name: this.authService.currentUserValue?.user_Name || '', // 確保取到用戶姓名
      PO_Remark: formData.PO_Remark,
      BudgetAmount: formData.remainingBudgetAmount, // 這裡應該是實際的預算金額，而不是剩餘預算金額。
      YYYYMM: `${formData.APPLY_Date.getFullYear()}${(formData.APPLY_Date.getMonth() + 1).toString().padStart(2, '0')}`,
      Details: details, // 帶入轉換後的明細資料陣列
    };
    // 處理提交邏輯 (呼叫 insert 或 update)
    this.handleSubmit(frm, () => {
      const request$ = this.isFormCreateable
        ? this.tls52010Service.insertTLS52010(submitData)
        : this.tls52010Service.updateTLS52010(submitData);

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
  }
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號/國際條碼/廠商貨號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
    { field: 'PLU_Name', header: '商品名稱' },
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
      this.suggestions = [...results.Data];
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
}
