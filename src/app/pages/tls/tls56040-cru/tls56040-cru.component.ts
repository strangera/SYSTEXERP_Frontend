import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column, createPaginationConfig, formatAmount, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from "primeng/table";
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { finalize } from 'rxjs';
import { IMVDetail, IPOS2022Data, IQueryPOS2004DetailForTLS56040Request, IQueryPOS2004DetailForTLS56040Response, ITLS56040Data, ITLS56040Request, Tls56040Service } from '@service/api/tls/tls56040.service';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { validateMinNumber, validateRequired } from '@shared/componentkit/table/validate-field.model';

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
    TableComponent,
    DialogComponent,
    DropdownTableComponent
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
    APPLY_USR_No: [{ value: '', disabled: true }], // 申請人編號，預帶登入人員
    MVM_Remark: [null, [Validators.maxLength(200)]], // 倉別調撥單說明
  });

  data: IPOS2022Data[] = []; // 用於表格顯示明細數據
  selectedItems: IPOS2022Data[] = []; // 用於表格選擇項目
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'MVD_BuyPrc', header: '商品進價', visible: true, format: formatAmount },
    { field: 'NowHaveQty', header: '目前庫存', visible: true },
    { field: 'APPLY_Qty', header: '數量', visible: true, type: 'inputNumber', validate: [validateRequired, validateMinNumber(1)] },
    { field: 'APPLY_BuyNet', header: '進價小計', visible: true, format: formatAmount },
    { field: 'MVD_Remark', header: '單項說明', visible: true, type: 'input' },
  ];

  brandOptions: { label: string; value: string }[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  userOptions: { label: string; value: string }[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls56040Service: Tls56040Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56040', this.dataForm);
    this.loadDropdownOptions();
    if (this.isFormCreateable) {
      this.dataForm.patchValue({ APPLY_USR_No: this.authService.currentUserValue?.user_No });
    } else {
      this.tls56040Service.queryPOS2022({ MVM_No: this.rowdata?.MVM_No || '', OUT_HOS_No: this.rowdata?.OUT_HOS_No || '' }).pipe(untilDestroyed(this)).subscribe(response => {
        this.data = response.Data || [];
      });
    }
    this.dataForm.controls['OUT_HOS_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.validateWarehouseMismatch();
      this.clearDetailData();
    });
    this.dataForm.controls['IN_HOS_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.validateWarehouseMismatch();
    });
    this.dataForm.controls['LOGO_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.clearDetailData();
    });
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

  private clearDetailData(): void {
    this.data = [];
    this.dialogData = [];
    this.calculateTotals();
  }

  loadDropdownOptions(): void {
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ label: item.Name, value: item.No }));
    });
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.brandOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (this.data.length === 0) {
        this.messageService.errorBubble('明細資料不能為空');
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
        APPLY_USR_Name: this.userOptions.find(u => u.value === frm.getRawValue().APPLY_USR_No)?.label?.split(' - ')[1] || '',
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
          MVD_BuyPrc: item.MVD_BuyPrc,
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
          id: this.isFormCreateable ? undefined : item.id,
          MVM_No: this.isFormCreateable ? undefined : item.MVM_No
        } as IMVDetail))
      };
      const request$ = this.isFormCreateable ? this.tls56040Service.insertTLS56040(payload) : this.tls56040Service.updateTLS56040(payload);
      request$.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        this.onCancel();
      });
    });
  }

  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(100)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  totalRecords = 0;
  dialogData: IQueryPOS2004DetailForTLS56040Response[] = [];
  selectedItemsDialog: IQueryPOS2004DetailForTLS56040Response[] = [];
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
    const body: IQueryPOS2004DetailForTLS56040Request = {
      PageSize: frm.getRawValue().pageSize,
      PageIndex: frm.getRawValue().pageIndex,
      SortBy: frm.getRawValue().SortBy,
      queryNo: frm.getRawValue().queryNo,
      PLU_Name: frm.getRawValue().PLU_Name,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      HOS_No: this.dataForm.controls.OUT_HOS_No.value
    };
    this.tls56040Service.queryPOS2004DetailForTLS56040(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
    });
  }

  saveDialog() {
    this.dialogVisible = false;
    const newItems = this.selectedItemsDialog.map((item) => {
      const existingItem = this.data.find(d => d.PLU_MagNo === item.PLU_MagNo);
      if (existingItem) {
        return existingItem;
      }
      console.log(item.PLU_SalePrc_UNI, item.APPLY_BuyTax);
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

  onRowEditSave(event: RowEditSaveEvent) {
    const editedItem = event.newData;
    if (!editedItem.APPLY_Qty || editedItem.APPLY_Qty <= 0) {
      this.messageService.errorBubble('調撥數量需大於0');
      return;
    }

    if (editedItem.APPLY_Qty > editedItem.STK_CurrentQty) {
      this.messageService.errorBubble('調撥數量不能大於目前庫存');
      return;
    }

    const buyNet = editedItem.MVD_BuyPrc * editedItem.APPLY_Qty;
    editedItem.APPLY_BuyNet = buyNet;
    editedItem.APPLY_BuyTax = editedItem.PLU_StockTaxType === '1' ? Math.floor(buyNet * 0.05) : 0;
    editedItem.APPLY_BuyAmt = editedItem.APPLY_BuyNet + editedItem.APPLY_BuyTax;
    editedItem.APPLY_SaleAmt = editedItem.PLU_SalePrc * editedItem.APPLY_Qty;
    this.calculateTotals();
  }

  calculateTotals(): void {
    const totalQty = this.data.reduce((sum, item) => sum + (item.APPLY_Qty || 0), 0);
    const totalBuyNet = this.data.reduce((sum, item) => sum + (item.APPLY_BuyNet || 0), 0);
    this.dataForm.patchValue({
      APPLY_TotQty: totalQty,
      APPLY_TotBuyNet: totalBuyNet
    });
  }

  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]],
    PLU_Name: ['', [Validators.maxLength(60)]],
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  suggestions: IQueryPOS2004DetailForTLS56040Response[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
  ];
  opData: IQueryPOS2004DetailForTLS56040Response[] = [];
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;

  onAutoCompleteInputChange(event: any) {
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.OUT_HOS_No.value) {
      this.suggestions = [];
      return;
    }
    const body: IQueryPOS2004DetailForTLS56040Request = {
      PageSize: 30,
      PageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
      queryNo: event.PLU_MagNo || '',
      PLU_Name: '',
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      HOS_No: this.dataForm.controls.OUT_HOS_No.value
    };
    this.tls56040Service.queryPOS2004DetailForTLS56040(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data];
    });
  }

  onformValueChanged(event: any) {
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.OUT_HOS_No.value) {
      this.opData = [];
      this.opTotalRecords = 0;
      return;
    }
    this.opLoading = true;
    const body: IQueryPOS2004DetailForTLS56040Request = {
      PageSize: event.pageSize,
      PageIndex: event.pageIndex,
      SortBy: event.SortBy,
      queryNo: event.queryNo,
      PLU_Name: event.PLU_Name,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      HOS_No: this.dataForm.controls.OUT_HOS_No.value
    };
    this.tls56040Service.queryPOS2004DetailForTLS56040(body).pipe(untilDestroyed(this), finalize(() => this.opLoading = false)).subscribe((results) => {
      this.opData = [...results.Data];
      this.opTotalRecords = results.TotalCount;
    });
  }
  isRowSelectable(event: IPOS2022Data): boolean {
    return !this.data || !this.data.some((item: IPOS2022Data) => item.PLU_MagNo === event.PLU_MagNo);
  }
}
