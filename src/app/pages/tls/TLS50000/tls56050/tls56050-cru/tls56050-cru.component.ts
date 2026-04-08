import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ITLS56050Detail, ITLS56050Request, ITLS56050Response, Tls56050Service } from '@service/api/tls/tls56050.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls56050-cru',
  templateUrl: './tls56050-cru.component.html',
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
    InputTextareaComponent,
    TableEditComponent,
    AsyncPipe
  ],
  providers: [MessageService]
})
export class TLS56050CRUComponent extends BasicCruPageComponent<ITLS56050Response> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.nonNullable.group({
    MVM_No: [{ value: '', disabled: true }],
    LOGO_No: [{ value: '', disabled: true }],
    OUT_HOS_No: [{ value: '', disabled: true }],
    IN_HOS_No: [{ value: '', disabled: true }],
    OUTGODS_TotQty: [{ value: 0, disabled: true }],
    OUTGODS_TotBuyNet: [{ value: 0, disabled: true }],
    OUTGODS_TotBuyTax: [{ value: 0, disabled: true }],
    OUTGODS_TotBuyAmt: [{ value: 0, disabled: true }],
    OUTGODS_TotSaleAmt: [{ value: 0, disabled: true }],
    APPLY_Date: [{ value: null as Date | null, disabled: true }],
    APPLY_USR_No: [{ value: '', disabled: true }],
    APRV_Date: [{ value: null as Date | null, disabled: true }],
    APRV_USR_No: [{ value: '', disabled: true }],
    OUTGODS_Date: [{ value: null as Date | null, disabled: true }],
    OUTGODS_USR_No: [{ value: '', disabled: true }],
    MVM_Remark: ['', [Validators.maxLength(200)]],
  });

  data: ITLS56050Detail[] = [];
  editColumns: EditColumn[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'MVD_BuyPrc', header: '進單價' },
    { field: 'NowHaveQty', header: '目前庫存' },
    { field: 'APPLY_Qty', header: '調撥申請數量' },
    {
      field: 'OUTGODS_QTY',
      header: '發貨量',
      type: 'inputNumber',
      min: 0,
      calculate: (rowData: any, value: number) => this.calculateRowFinancials(rowData, value),
      validate: [validateRequired]
    },
    { field: 'OUTGODS_BuyNet', header: '發貨未稅進價小計' },
    { field: 'MVD_Remark', header: '單項說明', type: 'input' },
  ];

  brandOptions = this.dropDown.queryPluLogo(); // 品牌選項
  warehouseOptions = this.dropDown.queryPos2034(); // 倉別
  userOptions = this.dropDown.queryTblUser(); // 人員選項
  dataChanged = false;
  initOutgodsQtyIsNull = true;
  initComponent = true;

  constructor(
    private readonly tls56050Service: Tls56050Service,
    private readonly dropDown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56050', this.dataForm);
    this.loadData();
  }

  loadData(): void {
    this.initComponent = false;
    const mvmNo = this.rowdata?.MVM_No;
    if (mvmNo) {
      this.loading = true;
      this.tls56050Service.getTLS56050Info(mvmNo).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        const masterData = response.Data.TLS56050Data;
        const detailsData = response.Data.detail_TLS56050;
        this.initOutgodsQtyIsNull = masterData.OUTGODS_TotQty === 0;
        this.dataForm.patchValue({
          MVM_No: masterData.MVM_No,
          LOGO_No: masterData.LOGO_No,
          OUT_HOS_No: masterData.OUT_HOS_No,
          IN_HOS_No: masterData.IN_HOS_No,
          APPLY_Date: masterData.APPLY_Date ? new Date(masterData.APPLY_Date) : null,
          APPLY_USR_No: masterData.APPLY_USR_No,
          APRV_Date: masterData.APRV_Date ? new Date(masterData.APRV_Date) : null,
          APRV_USR_No: masterData.APRV_USR_No,
          OUTGODS_Date: masterData.OUTGODS_Date ? new Date(masterData.OUTGODS_Date) : null,
          OUTGODS_USR_No: masterData.OUTGODS_USR_No,
          MVM_Remark: masterData.MVM_Remark,
          // 這些欄位是後端回傳的總計，直接 patch
          OUTGODS_TotQty: masterData.OUTGODS_TotQty,
          OUTGODS_TotBuyNet: masterData.OUTGODS_TotBuyNet,
          OUTGODS_TotBuyTax: masterData.OUTGODS_TotBuyTax,
          OUTGODS_TotBuyAmt: masterData.OUTGODS_TotBuyAmt,
          OUTGODS_TotSaleAmt: masterData.OUTGODS_TotSaleAmt,
        });
        const data = detailsData.map(item => {
          // 決定基礎數量 (若無發貨量則帶入申請量)
          const baseQty = (item.OUTGODS_QTY !== null && item.OUTGODS_QTY !== undefined && item.OUTGODS_QTY !== 0)
            ? item.OUTGODS_QTY
            : item.APPLY_Qty;

          // 重點：呼叫同一個計算邏輯，確保初始資料的金額也是對的
          const calculatedFields = this.calculateRowFinancials(item, baseQty);

          return {
            ...item,
            OUTGODS_QTY: baseQty,
            ...calculatedFields // 將算出的小計、稅額、總額覆蓋進去
          };
        });
        this.data = [...data]
        this.calculateTotals();
      });
    }
    this.initComponent = true;
  }
  /** 抽取單一 Row 的計算邏輯 */
  private calculateRowFinancials(rowData: any, qty: number) {
    const outgodsQty = qty || 0;
    const buyPrice = rowData.MVD_BuyPrc || 0;
    const salePrice = rowData.MVD_SalePrc || 0;

    // 1. 計算未稅進價小計
    const buyNet = buyPrice * outgodsQty;

    // 2. 計算稅額 (應稅 '1' 算 5%)
    let buyTax = 0;
    if (rowData.PLU_StockTaxType === '1') {
      buyTax = Math.floor(buyNet * 0.05);
    }

    // 3. 計算各項總額
    return {
      OUTGODS_BuyNet: buyNet,
      OUTGODS_BuyTax: buyTax,
      OUTGODS_BuyAmt: buyNet + buyTax,
      OUTGODS_SaleAmt: salePrice * outgodsQty
    };
  }
  calculateTotals(): void {
    const totalQty = this.data.reduce((sum, item) => sum + (item.OUTGODS_QTY || 0), 0);
    const totalBuyNet = this.data.reduce((sum, item) => sum + (item.OUTGODS_BuyNet || 0), 0);
    const totalBuyTax = this.data.reduce((sum, item) => sum + (item.OUTGODS_BuyTax || 0), 0);
    const totalBuyAmt = this.data.reduce((sum, item) => sum + (item.OUTGODS_BuyAmt || 0), 0);
    const totalSaleAmt = this.data.reduce((sum, item) => sum + (item.OUTGODS_SaleAmt || 0), 0);

    this.dataForm.patchValue({
      OUTGODS_TotQty: totalQty,
      OUTGODS_TotBuyNet: totalBuyNet,
      OUTGODS_TotBuyTax: totalBuyTax,
      OUTGODS_TotBuyAmt: totalBuyAmt,
      OUTGODS_TotSaleAmt: totalSaleAmt,
    });
  }

  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }
      const rawFormValue = frm.getRawValue();
      const payload: ITLS56050Request = {
        id: this.rowdata?.id,
        MVM_No: rawFormValue.MVM_No,
        OUTGODS_Date: rawFormValue.OUTGODS_Date,
        OUTGODS_USR_No: rawFormValue.OUTGODS_USR_No,
        OUTGODS_USR_Name: rawFormValue.OUTGODS_USR_Name,
        OUTGODS_TotQty: rawFormValue.OUTGODS_TotQty,
        OUTGODS_TotBuyNet: rawFormValue.OUTGODS_TotBuyNet,
        OUTGODS_TotBuyTax: rawFormValue.OUTGODS_TotBuyTax,
        OUTGODS_TotBuyAmt: rawFormValue.OUTGODS_TotBuyAmt,
        OUTGODS_TotSaleAmt: rawFormValue.OUTGODS_TotSaleAmt,
        MVM_Remark: rawFormValue.MVM_Remark,
        Details: this.data.map(item => ({
          ...item,
          id: item.id,
          MVM_No: item.MVM_No,
          OUTGODS_Qty: item.OUTGODS_QTY,
          OUTGODS_BuyNet: item.OUTGODS_BuyNet,
          OUTGODS_BuyTax: item.OUTGODS_BuyTax,
          OUTGODS_BuyAmt: item.OUTGODS_BuyAmt,
          OUTGODS_SaleAmt: item.OUTGODS_SaleAmt,
          MVD_Remark: item.MVD_Remark,
        }))
      };
      this.tls56050Service.updateTLS56050(payload).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        this.dataChanged = false;
        this.loadData();
      });
    });
  }
  onConfirm(frm: FormGroup): void {
    const isQtyValid = this.data.every(item => item.OUTGODS_QTY === item.APPLY_Qty);
    if (!isQtyValid) {
      this.messageService.errorBubble('所有商品的發貨量必須與調撥申請量一致！');
      return;
    }
    const body = {
      DetailList: [
        {
          MVM_No: frm.getRawValue().MVM_No,
          MVM_Status: '3',
        }
      ]
    }
    this.loading = true;
    this.tls56050Service.updateStatusTLS56050(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onCancel();
    });
  }

  onTableDataChange(newData: any[]): void {
    this.data = newData;
    this.dataChanged = true; // 標記已修改，禁用確認發貨按鈕
    this.calculateTotals();  // 重新計算主檔總計
  }
}
