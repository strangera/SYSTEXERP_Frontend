import { ChangeDetectorRef, Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { debounceTime, finalize, withLatestFrom } from 'rxjs';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { IGetBudgetAmountRequest, IPODetail, IPOS2004DetailData, IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, ITLS52010Data, ITLS52010Request, Tls52010Service } from '../../../service/api/tls/tls52010.service';
import { Column, createPaginationConfig, formatAmount } from '../../../shared/componentkit/table/table.model';
import { untilDestroyed } from '@ngneat/until-destroy';
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
import { getSYS1000 } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateMinNumber, validateRequired } from '@shared/componentkit/table-edit/validate-field.model';

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
    AsyncPipe,
    TableEditComponent
  ],
})
export class TLS52010CRUComponent extends BasicCruPageComponent<ITLS52010Data> implements OnInit {
  // === 表單群組 (與 POS2016 欄位對應) ===
  dataForm = this.formBuilder.nonNullable.group({
    PO_No: [{ value: '系統自動產生', disabled: true }], // 採購單號 (與 POS2016.PO_No 對應)
    VEN_No: [null as string | null, [Validators.required]], // 廠商編號 (與 POS2016.VEN_No 對應)
    vendorShortName: [{ value: '', disabled: true }], // 廠商簡稱 (前端專用，不對應資料庫欄位，顯示在 VEN_No 下一欄)
    LOGO_No: [null as string | null, [Validators.required]], // 品牌代碼 (與 POS2016.LOGO_No 對應)
    remainingBudgetAmount: [{ value: 0, disabled: true }], // 剩餘預算金額 (前端顯示用，不對應資料庫欄位)
    HOS_No: [null as string | null, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    PO_TotalBuyNet: [{ value: 0, disabled: true }], // 採購金額
    PO_TotalBuyTax: [{ value: 0, disabled: true }], //稅額
    PO_TotalBuyAmt: [{ value: 0, disabled: true }], // 合計金額
    PO_TotalSaleAmt: [{ value: 0, disabled: true }], //售價總計
    APPLY_USR_No: [{ value: this.user?.user_No, disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_USR_Name: [{ value: this.user?.user_Name, disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期 (對應 POS2016.APPLY_Date)
    PO_Remark: [null as string | null, [Validators.maxLength(200)]], // 採購單備註 (對應 POS2016.PO_Remark)
  });
  // === 下拉選單選項 ===
  vendorOptions = this.dropdown.queryPos2013({ VEN_Flag: '' }); // 廠商下拉選單選項
  brandOptions = this.dropdown.queryPluLogoHosNo(); // 品牌下拉選單選項
  warehouseOptions = this.dropdown.queryPos2034() // 倉別下拉選單選項
  userOptions: { user_No: string; user_Name: string }[] = []; // 用戶選項
  editColumns: EditColumn[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => getSYS1000('PLU_StockTaxType', value) },
    {
      field: 'POD_SubQty',
      header: '數量',
      type: 'inputNumber',
      validate: [validateRequired, validateMinNumber(1)],
      width: '100px',
      // 這裡放主要的計算邏輯
      calculate: (row) => {
        return {
          'POD_BuyNet': row.POD_SubQty * row.PLU_SalePrc_UNI, // 計算小計
          'POD_SaleAmt': row.POD_SubQty * row.PLU_SalePrc // 計算售價小計
        };
      }
    }, { field: 'PLU_SalePrc_UNI', header: '單價', format: formatAmount },
    { field: 'POD_BuyNet', header: '小計', format: formatAmount },
    { field: 'PLU_SalePrc', header: '售價', format: formatAmount },
    { field: 'POD_SaleAmt', header: '售價小計', format: formatAmount },
    { field: 'POD_Remark', header: '備註', type: 'input', width: '150px' },
  ]
  data: IPOS2004DetailData[] = [];
  selectedItems: IPOS2004DetailData[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly dropdown: DropdownApiService,
    private readonly tls52010Service: Tls52010Service,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS52010', this.dataForm);
    if (this.isFormEditable) {
      const { VEN_No, LOGO_No } = this.dataForm.controls;
      VEN_No.disable();
      LOGO_No.disable();
    }
    this.loadDropdownOptions();
    if (!this.isFormCreateable) {
      this.tls52010Service.queryPOS2017({ PO_No: this.dataForm.controls.PO_No.value }).pipe(untilDestroyed(this)).subscribe(response => {
        this.data = response.Data.map(item => ({
          ...item,
          PLU_SalePrc_UNI: item.POD_BuyPrc,
          PLU_SalePrc: item.POD_SalePrc
        }));
      });
      this.vendorOptions.subscribe(options => {
        this.dataForm.controls.vendorShortName.setValue(options?.find(opt => opt.value === this.dataForm.controls.VEN_No.value)?.['ShortName'] ?? '');
      });
      this.GetBudgetAmount();
    }
    this.loadDialogData();
  }
  private loadDropdownOptions(): void {
    // 監聽廠商編號變化
    this.dataForm.controls.VEN_No.valueChanges.pipe(withLatestFrom(this.vendorOptions), untilDestroyed(this)).subscribe(([vendorNo, options]) => {
      this.dataForm.controls.vendorShortName.setValue(options?.find(opt => opt.value === vendorNo)?.['ShortName'] ?? '', { emitEvent: false });
      this.calculateTotals();
      [this.data, this.selectedItems, this.dialogData] = [[], [], []];
    });
    // 監聽品牌代碼變化，用於顯示剩餘預算金額和建議倉別
    this.dataForm.controls.LOGO_No.valueChanges.pipe(withLatestFrom(this.brandOptions), debounceTime(300), untilDestroyed(this)).subscribe(([logoNo, options]) => {
      this.dataForm.controls.HOS_No.setValue(options?.find(opt => opt.value === logoNo)?.value ?? null, { emitEvent: false });
      this.GetBudgetAmount();
      this.calculateTotals();
      [this.data, this.selectedItems, this.dialogData] = [[], [], []];
    });
  }
  GetBudgetAmount(): void {// 獲取剩餘預算金額
    const { LOGO_No, APPLY_Date } = this.dataForm.controls;
    if (!LOGO_No.value || !APPLY_Date.value) return;
    const applyYearMonth = `${APPLY_Date.value.getFullYear()}${(APPLY_Date.value.getMonth() + 1).toString().padStart(2, '0')}`;
    const budgetRequest: IGetBudgetAmountRequest = { LOGO_No: LOGO_No.value ?? '', YYYYMM: applyYearMonth };
    this.tls52010Service.GetBudgetAmount(budgetRequest).pipe(untilDestroyed(this)).subscribe(response => {
      this.dataForm.controls.remainingBudgetAmount.setValue(response.Data);
    });
  }
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
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : value === '1' ? '應稅' : '' },
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
    this.tls52010Service.queryPOS2004DetailByVenNo(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
    })
  }
  saveDialog() {
    this.dialogVisible = false;
    this.data = [
      ...this.data,
      ...this.selectedItemsDialog.map(item => ({
        ...item,
        id: 0,
        PLU_BoxQty: item.PLU_BoxQty === undefined || item.PLU_BoxQty === null ? 0 : item.PLU_BoxQty,
        POD_SubQty: 1,
        POD_Remark: ''
      }))
    ];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.calculateTotals();
  }
  isRowSelectable(event: IPOS2004DetailData): boolean {
    return !this.data || !this.data.some((item: IPOS2004DetailData) => item.PLU_MagNo === event.PLU_MagNo);
  }
  // 總計計算邏輯
  calculateTotals(): void {
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
    this.cdr.detectChanges();
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const valid = this.tableEditComponent.validateAndShowErrors()
      if (!valid) {
        this.loading = false
        return;
      }
      const formData = frm.getRawValue(); // 獲取所有表單值，包括 disabled 的
      if (formData.remainingBudgetAmount < formData.PO_TotalBuyAmt) {
        this.messageService.errorBubble('採購金額不能大於剩餘預算金額');
        this.loading = false
        return;
      }
      console.log(this.data);

      const details: IPODetail[] = this.data.map((item) => ({
        id: this.isFormCreateable ? 0 : item.id,
        PO_No: this.dataForm.controls.PO_No.value,
        POD_SeqNo: item.POD_SeqNo,
        HOS_No: this.dataForm.controls.HOS_No.value,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        PLU_MagNo: item.PLU_MagNo,
        PLU_No: item.PLU_No, // 國際條碼
        PLU_Name: item.PLU_Name,
        PLU_Unit: item.PLU_Unit,
        PLU_BoxQty: item.PLU_BoxQty,
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
      const request$ = this.isFormCreateable ? this.tls52010Service.insertTLS52010(submitData) : this.tls52010Service.updateTLS52010(submitData);
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
    console.log(event);

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
}
