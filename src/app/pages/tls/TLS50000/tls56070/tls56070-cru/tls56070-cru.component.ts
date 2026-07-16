import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { POS2023DAMResponse, POS2024DAMResponse, Tls56070Service } from '@service/api/tls/tls56070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ProductAutocompleteComponent } from '@shared/biz-components/product-autocomplete/product-autocomplete';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateMaxLength, validateMinNumber, validateRequired } from '@shared/components/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { Column, createPaginationConfig, formatAmount } from '@others/component/table/table.model';
import { PanelModule } from 'primeng/panel';
import { TableModule } from "primeng/table";
import { finalize, merge } from 'rxjs';

@Component({
  selector: 'app-tls56070-cru',
  templateUrl: './tls56070-cru.component.html',
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
    DialogComponent,
    ProductAutocompleteComponent,
    AsyncPipe,
    TableEditComponent,
    TableReportComponent
  ]
})
export class TLS56070CRUComponent extends BasicCruPageComponent<POS2023DAMResponse> implements OnInit {
  dataForm = this.formBuilder.group({
    id: [0], // 隱藏欄位
    DAM_No: [{ value: '系統自動取號', disabled: true }],
    LOGO_No: [null, Validators.required],
    HOS_No: [null, Validators.required],
    APPLY_Date: [{ value: new Date(), disabled: true }],
    APPLY_USR_No: [{ value: this.authService.currentUserValue?.user_No, disabled: true }],
    APPLY_USR_Name: [{ value: this.authService.currentUserValue?.user_Name, disabled: true }],
    DAM_Remark: [null, [Validators.maxLength(200)]],
    DAM_Status: ['1'],
    // 增加合計欄位以符合 Swagger
    DAM_TotQty: [0],
    DAM_TotBuyNet: [0],
    DAM_TotBuyTax: [0],
    DAM_TotBuyAmt: [0],
    DAM_TotSaleAmt: [0]
  });
  data: POS2024DAMResponse[] = []; // 用於表格顯示明細數據
  selectedItems: POS2024DAMResponse[] = []; // 用於表格選擇項目
  editColumns: EditColumn[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'NowHaveQty', header: '庫存數量' },
    {
      field: 'DAD_ConfirmQty',
      header: '數量',
      type: 'inputNumber',
      width: '100px',
      validate: [validateRequired, validateMinNumber(1)],
      // 當數量改變時計算金額
      calculate: (rowData: any, value: number) => this.calculateRowFinancials(rowData, value)
    },
    { field: 'UNIT_NAME', header: '商品單位' },
    { field: 'DAD_Remark', header: '單項說明', type: 'input', width: '120px', maxLength: 200, validate: [validateMaxLength(200)] },
  ];
  brandOptions = this.dropdown.queryPluLogo();
  warehouseOptions = this.dropdown.queryPos2034();
  initComponent = true;
  constructor(
    private readonly tls56070Service: Tls56070Service,
    public readonly tls52010Service: Tls52010Service,
    public readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadData();
  }
  loadData() {
    this.initComponent = false;
    this.initializePage('TLS56070', this.dataForm);
    merge(this.dataForm.controls['LOGO_No'].valueChanges, this.dataForm.controls['HOS_No'].valueChanges).pipe(untilDestroyed(this)).subscribe(() => {
      this.data = [];
    });
    if (!this.isFormCreateable) {
      this.dataForm.get('HOS_No')?.disable();
      this.dataForm.get('LOGO_No')?.disable();
      this.tls56070Service.queryPOS2024DAM({ DAM_No: this.rowdata?.DAM_No, HOS_No: this.rowdata?.HOS_No }).pipe(untilDestroyed(this)).subscribe(response => {
        this.data = response.Data;
      });
    }
    this.initComponent = true;
  }
  // 1. 抽取單一 Row 的財務計算
  private calculateRowFinancials(rowData: any, qty: number) {
    const confirmQty = qty || 0;
    const buyPrice = rowData.DAD_BuyPrc || 0;
    const salePrice = rowData.PLU_SalePrc || 0;

    const buyNet = buyPrice * confirmQty;
    let buyTax = 0;
    if (rowData.PLU_StockTaxType === '1') {
      buyTax = Math.floor(buyNet * 0.05);
    }

    return {
      DAD_BuyNet: buyNet,
      DAD_BuyTax: buyTax,
      DAD_BuyAmt: buyNet + buyTax,
      DAD_SaleAmt: salePrice * confirmQty
    };
  }
  // 2. 計算主檔總計
  calculateTotals(): void {
    const totalQty = this.data.reduce((sum, item) => sum + (item.DAD_ConfirmQty || 0), 0);
    const totalBuyNet = this.data.reduce((sum, item) => sum + (item.DAD_BuyNet || 0), 0);
    const totalBuyTax = this.data.reduce((sum, item) => sum + (item.DAD_BuyTax || 0), 0);
    const totalBuyAmt = this.data.reduce((sum, item) => sum + (item.DAD_BuyAmt || 0), 0);
    const totalSaleAmt = this.data.reduce((sum, item) => sum + (item.DAD_SaleAmt || 0), 0);

    this.dataForm.patchValue({
      DAM_TotQty: totalQty,
      DAM_TotBuyNet: totalBuyNet,
      DAM_TotBuyTax: totalBuyTax,
      DAM_TotBuyAmt: totalBuyAmt,
      DAM_TotSaleAmt: totalSaleAmt,
    });
  }
  onTableDataChange(newData: any[]): void {
    this.data = newData;
    this.calculateTotals();
  }
  validateRow = (rowData: POS2024DAMResponse): { isValid: boolean, errorMessage: string } => {
    if (rowData && (rowData.NowHaveQty || 0) < (rowData.DAD_ConfirmQty || 0)) {
      return { isValid: false, errorMessage: `數量不能大於庫存數量` };
    }
    return { isValid: true, errorMessage: '' };
  };
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }

      const rawValue = frm.getRawValue();
      const body = {
        ...rawValue,
        id: this.isFormCreateable ? 0 : (this.rowdata?.id || 0),
        // 修正：從 rowdata 拿回 org_id，避免變為 null
        org_id: this.isFormCreateable ? null : this.rowdata?.org_id,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo,
        DAM_No: this.isFormCreateable ? "" : rawValue.DAM_No,
        APPLY_Date: this.datePipe.transform(rawValue.APPLY_Date, 'yyyy-MM-ddTHH:mm:ss') || '',
        Details: this.data.map(d => ({
          ...d,
          id: this.isFormCreateable ? 0 : (d.id || 0),
          DAM_No: this.isFormCreateable ? "" : rawValue.DAM_No,
          HOS_No: rawValue.HOS_No,
          // Swagger 預期的是 PLU_SalePrc，確保這裡有值
          PLU_SalePrc: d.DAD_SalePrc || 0,
          // 補上 Swagger 要求的其他欄位(依據你提供的 JSON)
          PLU_SalePrc_UNI: d.PLU_SalePrc_UNI || 0,
          NowHaveQty: d.NowHaveQty || 0,
          PLU_BoxQty: d.PLU_BoxQty || 0,
        }))
      };

      // 檢查 body 是否符合 Swagger 的要求
      console.log('Final Payload:', body);

      const $request = this.isFormCreateable
        ? this.tls56070Service.insertTLS56070(body)
        : this.tls56070Service.updateTLS56070(body);

      $request.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        this.onCancel();
      });
    });
  }
  // ------------------------------------ Dialog 邏輯 ------------------------------------
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  dialogData: IQueryPOS2004DetailResponse[] = [];
  selectedItemsDialog: IQueryPOS2004DetailResponse[] = [];
  lastDialogQueryParams: IQueryPOS2004DetailRequest | null = null;
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_SalePrc', header: '售價', format: formatAmount },
    { field: 'NowHaveQty', header: '庫存量', format: formatAmount },
  ]
  dialogLoading = false;

  onQuery(frm: FormGroup) {
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.HOS_No.value) {
      return;
    }
    const body = {
      ...frm.getRawValue(),
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      HOS_No: this.dataForm.controls.HOS_No.value,
    }
    this.dialogLoading = true;
    this.tls52010Service.queryPOS2004Detail(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
      this.lastDialogQueryParams = body;
    })
  }

  saveDialog() {
    const newItems = this.selectedItemsDialog.map((item) => {
      const baseData: any = { // 暫時用 any 處理聯集欄位
        ...item,
        id: 0,
        MID: 0,
        DAD_ConfirmQty: 1,
        DAD_BuyPrc: 0, // 新增時通常沒進價，除非後端 API 有給
        DAD_SalePrc: item.PLU_SalePrc || 0, // 這裡對齊
        UNIT_NAME: item.UNIT_NAME,
        PLU_StockTaxType: item.PLU_StockTaxType
      };

      // 這裡傳入 baseData，calculateRowFinancials 內部是用 rowData.PLU_SalePrc 還是 rowData.DAD_SalePrc?
      // 建議 calculateRowFinancials 統一使用 DAD_SalePrc
      const financials = this.calculateRowFinancials(baseData, 1);

      return { ...baseData, ...financials };
    });

    this.data = [...this.data, ...newItems];
    this.calculateTotals();
    this.selectedItemsDialog = [];
    this.dialogVisible = false;
  }
  isRowSelectable(event: POS2024DAMResponse): boolean {
    return !this.data || !this.data.some((item: POS2024DAMResponse) => item.PLU_MagNo === event.PLU_MagNo);
  }
}
