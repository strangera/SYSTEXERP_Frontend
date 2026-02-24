import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ITLS56060Detail, ITLS56060Request, ITLS56060Response, Tls56060Service } from '@service/api/tls/tls56060.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-tls56060-cru',
  templateUrl: './tls56060-cru.component.html',
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
    TableEditComponent
  ]
})
export class TLS56060CRUComponent extends BasicCruPageComponent<ITLS56060Response> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.nonNullable.group({
    MVM_No: [{ value: '', disabled: true }], // 調撥單編號，readonly
    LOGO_No: [{ value: '', disabled: true }], // 品牌代碼，readonly
    OUT_HOS_No: [{ value: '', disabled: true }], // 調出倉別，readonly
    IN_HOS_No: [{ value: '', disabled: true }], // 調入倉別，readonly
    Confirm_TotQty: [{ value: 0, disabled: true }], // 驗收數量合計，readonly
    Confirm_TotBuyNet: [{ value: 0, disabled: true }], // 驗收未稅進價合計，readonly
    Confirm_TotBuyTax: [{ value: 0, disabled: true }], // 驗收進價稅額合計，readonly
    Confirm_TotBuyAmt: [{ value: 0, disabled: true }], // 驗收含稅進價合計，readonly
    Confirm_TotSaleAmt: [{ value: 0, disabled: true }], // 驗收含稅進價合計，readonly
    APPLY_Date: [{ value: null as Date | null, disabled: true }], // 申請日期，readonly
    APPLY_USR_No: [{ value: '', disabled: true }], // 申請人編號，readonly
    APRV_Date: [{ value: null as Date | null, disabled: true }], // 審核日期，readonly
    APRV_USR_No: [{ value: '', disabled: true }], // 審核人編號，readonly
    OUTGODS_DATE: [{ value: null as Date | null, disabled: true }], // 發貨日期，readonly
    OUTGODS_USR_No: [{ value: '', disabled: true }], // 發貨人編號，readonly
    Confirm_DATE: [{ value: null as Date | null, disabled: true }], // 驗收日期，預設為系統日期
    Confirm_USR_No: [{ value: '', disabled: true }], // 驗收人編號，預設為登入人員
    MVM_Remark: ['', [Validators.maxLength(200)]], // 倉別調撥單說明，可編輯
  });

  data: ITLS56060Detail[] = []; // 用於表格顯示明細數據
  editColumns: EditColumn[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'MVD_BuyPrc', header: '商品進價' },
    { field: 'NowHaveQty', header: '目前庫存' },
    { field: 'APPLY_Qty', header: '調撥申請量' },
    { field: 'OUTGODS_QTY', header: '發貨量' },
    {
      field: 'Confirm_QTY',
      header: '驗收量',
      type: 'inputNumber',
      min: 0,
      // 當驗收量改變時，自動計算相關欄位
      calculate: (rowData: any, value: number) => this.calculateRowFinancials(rowData, value),
    },
    { field: 'Confirm_BuyNet', header: '進價小計' },
    { field: 'MVD_Remark', header: '單項說明', type: 'input' },
  ];

  brandOptions: { label: string; value: string }[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  userOptions: { label: string; value: string }[] = [];
  dataChanged = false; // 標記資料是否有變更
  initComponent = true;

  constructor(
    private readonly tls56060Service: Tls56060Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    // 獲取路由參數中的調撥單號，並初始化頁面
    this.initializePage('TLS56060', this.dataForm);
    this.loadDropdownOptions();
    this.loadData();
  }
  /** 1. 抽取單一 Row 的計算邏輯 (驗收版) */
  private calculateRowFinancials(rowData: any, qty: number) {
    const confirmQty = qty || 0;
    const buyPrice = rowData.MVD_BuyPrc || 0;
    const salePrice = rowData.MVD_SalePrc || 0;

    const buyNet = buyPrice * confirmQty;
    let buyTax = 0;
    if (rowData.PLU_StockTaxType === '1') {
      buyTax = Math.floor(buyNet * 0.05);
    }

    return {
      Confirm_BuyNet: buyNet,
      Confirm_BuyTax: buyTax,
      Confirm_BuyAmt: buyNet + buyTax,
      Confirm_SaleAmt: salePrice * confirmQty
    };
  }
  loadData(): void {
    this.initComponent = false;
    const MVM_No = this.dataForm.get('MVM_No')?.value;
    if (!MVM_No) return;

    // 處理預設驗收人與日期
    if (this.dataForm.get('Confirm_DATE')?.value === null) {
      this.dataForm.patchValue({
        Confirm_DATE: new Date(),
        Confirm_USR_No: this.authService.currentUserValue?.user_No || ''
      });
    }

    this.loading = true;
    this.tls56060Service.getTLS56060Info(MVM_No).pipe(
      finalize(() => this.loading = false),
      untilDestroyed(this)
    ).subscribe(response => {
      const masterData = response.Data.TLS56060Data;
      const detailsData = response.Data.detail_TLS56060;

      this.dataForm.patchValue({
        // ... patch 其他主檔欄位 ...
        MVM_Remark: masterData.MVM_Remark,
      });

      // 2. 處理明細並初始化財務計算
      this.data = detailsData.map(item => {
        // 決定基礎驗收量 (若無驗收量則帶入發貨量)
        const baseQty = (item.Confirm_QTY !== null && item.Confirm_QTY !== undefined && item.Confirm_QTY !== 0)
          ? item.Confirm_QTY
          : (item.OUTGODS_QTY || 0);

        const calculatedFields = this.calculateRowFinancials(item, baseQty);

        return {
          ...item,
          Confirm_QTY: baseQty,
          ...calculatedFields
        };
      });

      this.calculateTotals();
      this.initComponent = true;
    });
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
  onTableDataChange(newData: any[]): void {
    this.data = newData;
    this.dataChanged = true; // 標記已修改，禁用確認收貨按鈕
    this.calculateTotals();  // 重新計算主檔 Form 的加總
  }

  /** 3. 重新計算主檔總計 */
  calculateTotals(): void {
    const totalQty = this.data.reduce((sum, item) => sum + (item.Confirm_QTY || 0), 0);
    const totalBuyNet = this.data.reduce((sum, item) => sum + (item.Confirm_BuyNet || 0), 0);
    const totalBuyTax = this.data.reduce((sum, item) => sum + (item.Confirm_BuyTax || 0), 0);
    const totalBuyAmt = this.data.reduce((sum, item) => sum + (item.Confirm_BuyAmt || 0), 0);
    const totalSaleAmt = this.data.reduce((sum, item) => sum + (item.Confirm_SaleAmt || 0), 0);

    this.dataForm.patchValue({
      Confirm_TotQty: totalQty,
      Confirm_TotBuyNet: totalBuyNet,
      Confirm_TotBuyTax: totalBuyTax,
      Confirm_TotBuyAmt: totalBuyAmt,
      Confirm_TotSaleAmt: totalSaleAmt,
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const rawFormValue = frm.getRawValue();
      const payload: ITLS56060Request = {
        id: this.rowdata?.id,
        MVM_No: rawFormValue.MVM_No,
        Confirm_Date: rawFormValue.Confirm_Date,
        Confirm_USR_No: rawFormValue.Confirm_USR_No,
        Confirm_USR_Name: this.userOptions.find(u => u.value === rawFormValue.Confirm_USR_No)?.label?.split(' - ')[1] || '',
        Confirm_TotQty: rawFormValue.Confirm_TotQty,
        Confirm_TotBuyNet: rawFormValue.Confirm_TotBuyNet,
        Confirm_TotBuyTax: rawFormValue.Confirm_TotBuyTax,
        Confirm_TotBuyAmt: rawFormValue.Confirm_TotBuyAmt,
        Confirm_TotSaleAmt: rawFormValue.Confirm_TotSaleAmt,
        MVM_Remark: rawFormValue.MVM_Remark,
        Details: this.data.map(item => ({
          ...item,
          id: item.id,
          MVM_No: item.MVM_No,
          Confirm_Qty: item.Confirm_QTY,
          Confirm_BuyNet: item.Confirm_BuyNet ?? item.Confirm_QTY * item.MVD_BuyPrc,
          Confirm_BuyTax: item.Confirm_BuyTax ?? item.PLU_TaxType === '1' ? item.Confirm_QTY * item.MVD_BuyPrc * 0.05 : 0,
          Confirm_BuyAmt: item.Confirm_BuyAmt ?? item.Confirm_BuyNet + item.Confirm_BuyTax,
          Confirm_SaleAmt: item.Confirm_SaleAmt ?? item.Confirm_QTY * item.MVD_SalePrc,
          MVD_Remark: item.MVD_Remark,
        }))
      };
      this.tls56060Service.updateTLS56060(payload).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        this.dataChanged = false;
      });
    });
  }
  onConfirm(frm: FormGroup): void {
    const isQtyValid = this.data.every(item => item.Confirm_QTY === item.OUTGODS_QTY);
    if (!isQtyValid) {
      this.messageService.errorBubble('所有商品的驗收量必須與發貨量一致！');
      return;
    }
    const body = {
      DetailList: [
        {
          MVM_No: frm.getRawValue().MVM_No,
          MVM_Status: '4',
        }
      ]
    }
    this.loading = true;
    this.tls56060Service.updateStatusTLS56060(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onCancel();
    });
  }
}
