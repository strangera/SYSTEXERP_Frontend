import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { IMVDetail, IPOS2022Data, ITLS56040Data, ITLS56040Request, Tls56040Service } from '@service/api/tls/tls56040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ProductAutocompleteComponent } from '@shared/biz-components/product-autocomplete/product-autocomplete';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateDuplicate } from '@shared/components/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { Column, createPaginationConfig, formatAmount } from '@others/component/table/table.model';
import { validateMinNumber, validateRequired } from '@others/component/table/validate-field.model';
import { PanelModule } from 'primeng/panel';
import { TableModule } from "primeng/table";
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls56040-cru',
  templateUrl: './tls56040-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    NgIf,
    TranslateModule,
    TableModule,
    InputTextareaComponent,
    TableReportComponent,
    DialogComponent,
    AsyncPipe,
    TableEditComponent,
    ProductAutocompleteComponent
  ]
})
export class TLS56040CRUComponent extends BasicCruPageComponent<ITLS56040Data> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.group({
    MVM_No: [{ value: '系統自動取號', disabled: true }], // 調撥單編號，readonly, 系統自動取號
    LOGO_No: [null, Validators.required], // 品牌代碼，下拉選項，必填
    OUT_HOS_No: [null, Validators.required], // 調出倉別，下拉選項，必填
    IN_HOS_No: [null, Validators.required], // 調入倉別，下拉選項，必填
    APPLY_TotBuyNet: [{ value: 0, disabled: true }], // 金額，readonly，明細加總
    APPLY_TotBuyTax: [{ value: 0, disabled: true }], // 稅額，readonly，明細加總
    APPLY_TotBuyAmt: [{ value: 0, disabled: true }], // 金額，readonly，明細加總
    APPLY_TotSaleAmt: [{ value: 0, disabled: true }], // 金額，readonly，明細加總
    APPLY_TotQty: [{ value: 0, disabled: true }], // 數量，readonly，明細加總
    MVM_Status: [{ value: '', disabled: true }], // 狀態
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期，預帶系統日期
    APPLY_USR_No: [{ value: this.authService.currentUserValue?.user_No, disabled: true }], // 申請人編號，預帶登入人員
    APPLY_USR_Name: [{ value: this.authService.currentUserValue?.user_Name, disabled: true }], // 申請人姓名，預帶登入人員；編輯時由 rowdata patchValue 覆蓋回原申請人姓名
    MVM_Remark: [null, [Validators.maxLength(200)]], // 倉別調撥單說明
  });

  data: IPOS2022Data[] = []; // 用於表格顯示明細數據
  selectedItems: IPOS2022Data[] = []; // 用於表格選擇項目
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'MVD_BuyPrc', header: '商品進價', format: formatAmount },
    { field: 'NowHaveQty', header: '目前庫存' },
    { field: 'APPLY_Qty', header: '數量', type: 'inputNumber', validate: [validateRequired, validateMinNumber(1)] },
    { field: 'APPLY_BuyNet', header: '進價小計', format: formatAmount },
    { field: 'MVD_Remark', header: '單項說明', type: 'input' },
  ];
  editColumns: EditColumn[] = [
    {
      field: 'PLU_No', header: '國際條碼',
      type: 'input',
      onBlur: (rowData: IPOS2022Data, value: string, col: EditColumn, index: number) => this.onPLU_MagNoBlur(rowData, value, col, index),
      validate: [validateRequired, validateDuplicate],
    },
    { field: 'PLU_MagNo', header: '商品管理編號', },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'MVD_BuyPrc', header: '商品進價', format: formatAmount },
    { field: 'NowHaveQty', header: '目前庫存' },
    { field: 'APPLY_Qty', header: '數量', type: 'inputNumber', validate: [validateRequired, validateMinNumber(1), validateTransferQty] },
    { field: 'APPLY_BuyNet', header: '進價小計', format: formatAmount },
    { field: 'MVD_Remark', header: '單項說明', type: 'input' },
  ]

  brandOptions = this.dropdown.queryPluLogo();
  warehouseOptions = this.dropdown.queryPos2034();
  userOptions = this.dropdown.queryTblUser();

  initComponent = true;

  constructor(
    private readonly tls56040Service: Tls56040Service,
    public readonly tls52010Service: Tls52010Service,
    private readonly dropdown: DropdownApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initaializeData();
    this.dataForm.controls['OUT_HOS_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.validateWarehouseMismatch();
      [this.data, this.dialogData] = [[], []];
      this.calculateTotals()
    });
    this.dataForm.controls['IN_HOS_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.validateWarehouseMismatch();
    });
    this.dataForm.controls['LOGO_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      [this.data, this.dialogData] = [[], []];
      this.calculateTotals()
    });
  }
  initaializeData() {
    this.initializePage('TLS56040', this.dataForm);
    if (!this.isFormCreateable) {
      this.initComponent = false;
      this.loading = true;
      this.tls56040Service.queryPOS2022({ MVM_No: this.rowdata?.MVM_No || '', OUT_HOS_No: this.rowdata?.OUT_HOS_No || '' }).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data || [];
        this.initComponent = true;
      });
    }
  }
  private validateWarehouseMismatch(): void {
    const outHosNo = this.dataForm.controls['OUT_HOS_No'].value;
    const inHosNo = this.dataForm.controls['IN_HOS_No'].value;
    if (outHosNo && inHosNo && outHosNo === inHosNo) {
      this.dataForm.controls['IN_HOS_No'].setErrors({ 'warehouseMismatch': true });
    } else {
      if (this.dataForm.controls['IN_HOS_No'].hasError('warehouseMismatch')) {
        this.dataForm.controls['IN_HOS_No'].setErrors(null);
      }
    }
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }
      const payload: ITLS56040Request = {
        id: this.isFormCreateable ? undefined : this.rowdata?.id,
        MVM_No: this.isFormCreateable ? undefined : this.rowdata?.MVM_No,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        LOGO_No: frm.getRawValue().LOGO_No,
        OUT_HOS_No: frm.getRawValue().OUT_HOS_No,
        IN_HOS_No: frm.getRawValue().IN_HOS_No,
        org_id: this.rowdata?.org_id || null,
        APPLY_Date: frm.getRawValue().APPLY_Date,
        APPLY_USR_No: frm.getRawValue().APPLY_USR_No,
        APPLY_USR_Name: frm.getRawValue().APPLY_USR_Name,
        APPLY_TotQty: this.dataForm.controls.APPLY_TotQty.value || 0,
        APPLY_TotBuyNet: this.dataForm.controls.APPLY_TotBuyNet.value || 0,
        APPLY_TotBuyTax: this.dataForm.controls.APPLY_TotBuyTax.value || 0,
        APPLY_TotBuyAmt: this.dataForm.controls.APPLY_TotBuyAmt.value || 0,
        APPLY_TotSaleAmt: this.dataForm.controls.APPLY_TotSaleAmt.value || 0,
        MVM_Remark: frm.getRawValue().MVM_Remark,
        MVM_Status: this.dataForm.controls.MVM_Status.value || '1',
        Details: this.data.map(item => ({
          SYS_StoreNo: item.SYS_StoreNo || this.authService.currentUserValue?.SYS_StoreNo || '',
          org_id: this.rowdata?.org_id || null,
          MVD_SeqNo: item.MVD_SeqNo,
          PLU_MagNo: item.PLU_MagNo,
          PLU_No: item.PLU_No,
          PLU_Unit: item.PLU_Unit,
          PLU_BoxQty: item.PLU_BoxQty,
          PLU_Name: item.PLU_Name,
          PLU_StockTaxType: item.PLU_StockTaxType,
          PLU_TaxType: item.PLU_TaxType,
          MVD_BuyPrc: item.MVD_BuyPrc || 0,
          MVD_SalePrc: item.MVD_SalePrc,
          APPLY_Qty: item.APPLY_Qty,
          APPLY_BuyNet: item.APPLY_BuyNet,
          APPLY_BuyTax: item.APPLY_BuyTax,
          APPLY_BuyAmt: item.APPLY_BuyAmt,
          APPLY_SaleAmt: item.APPLY_SaleAmt,
          MVD_Remark: item.MVD_Remark,
          OUTGODS_QTY: item.OUTGODS_QTY || 0,
          Confirm_QTY: item.Confirm_QTY || 0,
          OUTGODS_BuyNet: item.OUTGODS_BuyNet || 0,
          OUTGODS_BuyTax: item.OUTGODS_BuyTax || 0,
          OUTGODS_BuyAmt: item.OUTGODS_BuyAmt || 0,
          OUTGODS_SaleAmt: item.OUTGODS_SaleAmt || 0,
          Confirm_BuyNet: item.Confirm_BuyNet || 0,
          Confirm_BuyTax: item.Confirm_BuyTax || 0,
          Confirm_BuyAmt: item.Confirm_BuyAmt || 0,
          Confirm_SaleAmt: item.Confirm_SaleAmt || 0,
          id: this.isFormCreateable ? undefined : item._dataStatus === 'new' ? 0 : item.id,
          MVM_No: this.isFormCreateable ? undefined : this.rowdata?.MVM_No,
        } as IMVDetail))
      };
      const request$ = this.isFormCreateable ? this.tls56040Service.insertTLS56040(payload) : this.tls56040Service.updateTLS56040(payload);
      request$.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        this.onCancel();
      });
    });
  }
  onPLU_MagNoBlur(rowData: IPOS2022Data, value: string, col: EditColumn, index: number) {
    const outHosNo = this.dataForm.controls.OUT_HOS_No.value;
    const logoNo = this.dataForm.controls.LOGO_No.value;
    if (!outHosNo || !logoNo || !value) {
      return;
    }
    const body = {
      VEN_No: '',
      queryNo: value,
      LOGO_No: logoNo,
      HOS_No: outHosNo,
      PLU_Name: '',
      PageSize: 30,
      PageIndex: 1
    };
    setTimeout(() => {
      this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
        if (results.Data && results.Data.length > 0) {
          const newData = results.Data[0];
          const updatedRow: IPOS2022Data = {
            ...newData,
            PLU_MagNo: newData.PLU_MagNo,
            PLU_Name: newData.PLU_Name,
            MVD_BuyPrc: newData.PLU_SalePrc_UNI,
            STK_CurrentQty: newData.NowHaveQty,
            APPLY_Qty: 1,
            APPLY_BuyNet: newData.PLU_SalePrc_UNI,
            MVD_Remark: '',
            APPLY_BuyAmt: newData.PLU_SalePrc_UNI + (newData.PLU_StockTaxType === '1' ? Math.floor(newData.PLU_SalePrc_UNI * 0.05) : 0),
            APPLY_BuyTax: newData.PLU_StockTaxType === '1' ? Math.floor(newData.PLU_SalePrc_UNI * 0.05) : 0,
            APPLY_SaleAmt: newData.PLU_SalePrc * 1,
            _dataStatus: 'new'
          } as IPOS2022Data;
          if (this.data[index]) { Object.assign(this.data[index], updatedRow); }
          this.data = [...this.data];

          this.calculateTotals();
          this.cdr.detectChanges();
        } else {
          this.messageService.errorBubble('查無該商品資訊');
          if (this.data[index]) {
            Object.assign(this.data[index], {
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
              NowHaveQty: 0
            });
          }
          this.data = [...this.data];
          this.calculateTotals();
          this.cdr.detectChanges();
        }
      });
    }, 50);
  }
  calculateTotals(): void {
    if (!this.data) { return; }
    this.data.forEach(item => {
      item.APPLY_BuyNet = (item.MVD_BuyPrc || 0) * (item.APPLY_Qty || 0);
      item.APPLY_BuyTax = item.PLU_StockTaxType === '1' ? Math.floor((item.APPLY_BuyNet || 0) * 0.05) : 0;
      item.APPLY_BuyAmt = (item.APPLY_BuyNet || 0) + (item.APPLY_BuyTax || 0);
      item.APPLY_SaleAmt = (item.PLU_SalePrc || 0) * (item.APPLY_Qty || 0);
    });
    const totalQty = this.data.reduce((sum, item) => sum + (item.APPLY_Qty || 0), 0);
    const totalBuyNet = this.data.reduce((sum, item) => sum + (item.APPLY_BuyNet || 0), 0);
    this.dataForm.patchValue({ APPLY_TotQty: totalQty, APPLY_TotBuyNet: totalBuyNet });
  }
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(100)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_No', order: 1 }]),
  });
  totalRecords = 0;
  dialogData: IQueryPOS2004DetailResponse[] = [];
  dialogLastQueryBody: IQueryPOS2004DetailRequest | null = null;
  selectedItemsDialog: IQueryPOS2004DetailResponse[] = [];
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Unit', header: '商品單位' },
    { field: 'UNIT_NAME', header: '單位名稱' },
    { field: 'NowHaveQty', header: '目前庫存量' },
  ];
  dialogLoading = false;

  onQuery(frm: FormGroup) {
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.OUT_HOS_No.value) {
      return;
    }
    this.dialogLoading = true;
    const body: IQueryPOS2004DetailRequest = {
      pageSize: frm.getRawValue().pageSize,
      pageIndex: frm.getRawValue().pageIndex,
      SortBy: frm.getRawValue().SortBy,
      queryNo: frm.getRawValue().queryNo,
      PLU_Name: frm.getRawValue().PLU_Name,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      HOS_No: this.dataForm.controls.OUT_HOS_No.value,
      VEN_No: ''
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
      this.dialogLastQueryBody = body;
    })
  }

  saveDialog() {
    this.dialogVisible = false;
    const newItems = this.selectedItemsDialog.map((item) => {
      const existingItem = this.data.find(d => d.PLU_MagNo === item.PLU_MagNo);
      if (existingItem) {
        return existingItem;
      }
      return {
        ...item,
        PLU_MagNo: item.PLU_MagNo,
        PLU_Name: item.PLU_Name,
        MVD_BuyPrc: item.PLU_SalePrc_UNI,
        STK_CurrentQty: item.NowHaveQty,
        APPLY_Qty: 1,
        APPLY_BuyNet: item.PLU_SalePrc_UNI,
        MVD_Remark: '',
        APPLY_BuyAmt: item.PLU_SalePrc_UNI + (item.PLU_StockTaxType === '1' ? Math.floor(item.PLU_SalePrc_UNI * 0.05) : 0),
        APPLY_BuyTax: item.PLU_StockTaxType === '1' ? Math.floor(item.PLU_SalePrc_UNI * 0.05) : 0,
        APPLY_SaleAmt: item.PLU_SalePrc * 1,
        PLU_BoxQty: item.PLU_BoxQty || 0,
        _dataStatus: 'new',
      } as IPOS2022Data;
    });
    this.data = [
      ...this.data,
      ...newItems.filter(newItem => !this.data.some(existing => existing.PLU_MagNo === newItem.PLU_MagNo))
    ];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.calculateTotals();
  }
  isRowSelectable(event: IPOS2022Data): boolean {
    return !this.data || !this.data.some((item: IPOS2022Data) => item.PLU_MagNo === event.PLU_MagNo);
  }
}
// 調撥數量不能大於目前庫存
export function validateTransferQty(value: string, rowData: IPOS2022Data): { isValid: boolean; errorMessage: string[] } {
  return {
    isValid: (Number(rowData.APPLY_Qty) || 0) <= (Number(rowData.NowHaveQty) || 0),
    errorMessage: [`調撥數量不能大於目前庫存`, '資料錯誤'],
  };
}
