import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IODDetail, ITLS52030Data, ITLS52030Request, Tls52030Service } from '@service/api/tls/tls52030.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { Column, createPaginationConfig, formatAmount, formatDate, LazyLoadEvent } from '@others/component/table/table.model';
import { validateMinNumber } from '@others/component/table/validate-field.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { POStatus } from '../../tls52030/tls52030.component';
// 2.5.2.3  進貨驗收作業CRU
@Component({
  selector: 'app-tls52030-cru',
  templateUrl: './tls52030-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    InputNumberComponent,
    CalendarComponent,
    InputTextareaComponent,
    TableReportComponent,
    DialogComponent,
    TranslateModule,
    TableEditComponent,
    AsyncPipe
  ],
})
export class TLS52030CRUComponent extends BasicCruPageComponent<ITLS52030Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ODM_No: [{ value: '系統自動產生', disabled: true }], // 進貨驗收單號
    VEN_No: [null as string | null, [Validators.required]], // 廠商編號
    // LOGO_No: [null as string | null, [Validators.required]], // 品牌代碼 (與 POS2016.LOGO_No 對應)
    HOS_No: [null as string | null, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    ODM_TotalBuyNet: [{ value: 0, disabled: true }], // 進貨驗收金額
    ODM_TotalBuyTax: [{ value: 0, disabled: true }], // 稅額
    ODM_TotalBuyAmt: [{ value: 0, disabled: true }], // 合計金額
    ODM_TotalSaleAmt: [{ value: 0, disabled: true }], // 售價總計
    ODM_USR_No: [{ value: this.user?.user_No, disabled: true }], // 申請人
    ODM_USR_Name: [{ value: this.user?.user_Name, disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    ODM_Date: [new Date(), [Validators.required]], // 申請日期
    APRV_Date: [new Date(), [Validators.required]], // 審核日期
    ODM_Remark: [null as string | null, [Validators.maxLength(200)]],// 進貨驗收單說明
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  vendorOptions = this.dropdown.queryPos2013TltTalent()
  brandOptions = this.dropdown.queryPluLogoHosNo(); // 品牌下拉選單選項
  warehouseOptions = this.dropdown.queryPos2034() // 倉別下拉選單選項
  originalData: IODDetail[] = [];
  data: IODDetail[] = [];
  selectedItems: IODDetail[] = [];
  editColumns: EditColumn[] = [];
  constructor(
    public readonly tls52030Service: Tls52030Service,
    private readonly dropdown: DropdownApiService,
    private readonly cdr: ChangeDetectorRef
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS52030', this.dataForm);
    if (this.isFormEditable) {
      this.dataForm.controls.VEN_No.disable();
      this.dataForm.controls.HOS_No.disable();
      // this.dataForm.controls.LOGO_No.disable();
    }
    this.loadDropdownOptions();
    this.initEditColumns();
    if (!this.isFormCreateable) {
      this.tls52030Service.GetPOS2019({ ODM_No: this.rowdata?.ODM_No }).pipe(untilDestroyed(this)).subscribe(response => {
        this.data = response.Data.Data;
        this.originalData = JSON.parse(JSON.stringify(response.Data.Data));
      });
    }
  }
  initEditColumns() {
    // 判斷是否為「反審核可修改」狀態：處於編輯模式，且有反審核日期
    const isReApprovedAndEditable = this.isFormEditable && !!this.rowdata?.ReAPRV_Date;

    this.editColumns = [
      { field: 'PLU_MagNo', header: '商品管理編號' },
      { field: 'PLU_Name', header: '商品名稱' },
      { field: 'PLU_No', header: '國際條碼' },
      { field: 'POD_SubQty', header: '應驗數量', format: formatAmount },
      {
        field: 'ODD_ConfirmQty',
        header: '驗收數量',
        width: '100px',
        type: 'inputNumber',
        validate: [validateConfirmQtySumNotExceedSubQty(), validateMinNumber(0)],
        calculate: (row) => this.ComponentLineCalculate(row) // 抽成共用方法
      },
      { field: 'ODD_ConfirmQty_Finished', header: '已驗收數量', format: formatAmount },
      { field: 'UNIT_NAME', header: '商品單位' },
      // 【核心改動】：現在是「採購單價」開放反審核修改
      {
        field: 'ODD_BuyPrc',
        header: '採購單價',
        format: formatAmount,
        // 如果是反審核狀態，切換成可輸入型態
        type: isReApprovedAndEditable ? 'inputNumber' : undefined,
        minFractionDigits: 2,
        // 當使用者修改「採購單價」時，即時重新計算未稅金額、稅額等
        calculate: (row) => this.ComponentLineCalculate(row)
      },

      // 驗收單價回復為純顯示（唯讀）
      {
        field: 'ODD_BuyPrc',
        header: '驗收單價',
        format: formatAmount
      },

      { field: 'PLU_StockTaxType', header: '稅別', format: (value) => getSYS1000('PLU_StockTaxType', value) },
      { field: 'ODD_BuyNet', header: '未稅金額', format: formatAmount },
      { field: 'ODD_SalePrc', header: '售價', format: formatAmount },
      { field: 'ODD_SaleAmt', header: '售價小計', format: formatAmount },
      { field: 'PO_No', header: '採購單編號' },
      { field: 'ODD_Remark', header: '單項備註', type: 'input', width: '150px' },
    ];
  }
  private roundToTwo(value: number): number {
    return Math.round(value * 100) / 100;
  }
  ComponentLineCalculate(row: IODDetail) {
    const confirmQty = Number(row.ODD_ConfirmQty ?? 0);
    const buyPrice = this.roundToTwo(Number(row.ODD_BuyPrc ?? 0)); // 這邊會即時讀到使用者修改後的驗收單價，進價需四捨五入到小數2位
    const salePrice = Number(row.ODD_SalePrc ?? 0);
    const stockTaxType = row.PLU_StockTaxType;
    const saleTaxType = row.PLU_TaxType;

    const buyNet = Math.round(buyPrice * confirmQty);
    const buyTax = stockTaxType === '1' ? Math.round(buyNet * 0.05) : 0;
    const buyAmt = buyNet + buyTax;
    const saleAmt = Math.round(salePrice * confirmQty);

    let saleTax = 0;
    if (saleTaxType === '1') {
      saleTax = Math.round(saleAmt * 0.05 / 1.05);
    }

    return {
      'ODD_BuyPrc': buyPrice, // 確保單價同步回報
      'ODD_BuyNet': buyNet,
      'ODD_BuyTax': buyTax,
      'ODD_BuyAmt': buyAmt,
      'ODD_SaleTax': saleTax,
      'ODD_SaleAmt': saleAmt,
    };
  }
  loadDropdownOptions() {
    // 專門清空資料的共用方法
    if (this.isFormCreateable) {
      const resetFormData = () => { this.data = []; this.selectedItems = []; this.dialogData = []; this.calculateTotals(); };
      this.dataForm.controls.VEN_No.valueChanges.pipe(untilDestroyed(this)).subscribe(() => resetFormData());
      this.dataForm.controls.HOS_No.valueChanges.pipe(untilDestroyed(this)).subscribe(() => resetFormData());
      // 2. 品牌下拉選單
      // this.warehouseOptions.pipe(untilDestroyed(this)).subscribe(warehouseOpts => {
      //   this.dataForm.controls.LOGO_No.valueChanges.pipe(withLatestFrom(this.brandOptions), debounceTime(300), untilDestroyed(this)).subscribe(([logoNo, brandOpts]) => {
      //     const selectedBrand = brandOpts?.find(opt => opt.value === logoNo);
      //     const suggestedHOSNo = selectedBrand ? selectedBrand['No'] : null;
      //     let finalHOSNo: string | null = null;
      //     if (suggestedHOSNo && warehouseOpts?.some(opt => opt['No'] === suggestedHOSNo)) {
      //       finalHOSNo = suggestedHOSNo;
      //     }
      //     this.dataForm.controls.HOS_No.setValue(finalHOSNo, { emitEvent: false });
      //     resetFormData();
      //   });
      // });
    }
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
      if (!valid) {
        this.loading = false
        return;
      }
      const formData = frm.getRawValue();
      const firstDetail = this.data[0];
      const details: IODDetail[] = this.data.map((item) => ({
        id: item.id,
        ODM_No: formData.ODM_No,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        HOS_No: formData.HOS_No,
        PLU_MagNo: item.PLU_MagNo,
        PLU_No: item.PLU_No,
        PLU_Unit: item.PLU_Unit,
        PLU_BoxQty: item.PLU_BoxQty,
        PLU_Name: item.PLU_Name,
        PLU_StockTaxType: item.PLU_StockTaxType,
        ODD_BuyPrc: item.ODD_BuyPrc || 0, // 採購單價 (未稅進價)
        ODD_BuyNet: item.ODD_BuyNet || 0, // 採購淨額 (已計算過並取整數)
        ODD_BuyTax: item.ODD_BuyTax || 0, // 採購稅額 (已計算過並取整數)
        ODD_BuyAmt: item.ODD_BuyAmt || 0, // 採購金額 (已計算過並取整數)
        PLU_TaxType: item.PLU_TaxType,
        ODD_SalePrc: item.ODD_SalePrc || 0, // 確保有值，使用之前計算好的 POD_SubQty
        ODD_SaleTax: item.ODD_SaleTax || 0, // 銷售稅額 (已計算過並取整數)
        ODD_SaleAmt: item.ODD_SaleAmt || 0, // 銷售金額 (已計算過並取整數)
        POD_SubQty: item.POD_SubQty || 0, // 確保有值，使用之前計算好的 POD_SubQty
        ODD_ConfirmQty: item.ODD_ConfirmQty || 0, // 確保有值，使用之前計算好的 POD_SubQty
        ODD_ConfirmQty_Finished: item.ODD_ConfirmQty_Finished || 0,
        ODD_Remark: item.ODD_Remark || '',
        PO_No: item.PO_No,
      }));
      const totalSaleTax = details.reduce((sum, item) => sum + (item.ODD_SaleTax || 0), 0);
      const submitData: ITLS52030Request = {
        id: this.isFormCreateable ? undefined : this.rowdata?.id,
        ODM_No: formData.ODM_No,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        VEN_No: formData.VEN_No,
        LOGO_No: firstDetail.LOGO_No || this.rowdata?.LOGO_No || '',
        org_id: firstDetail.org_id || this.rowdata?.org_id || '',
        ODM_TaxType: firstDetail.ODM_TaxType || this.rowdata?.ODM_TaxType || '1',
        HOS_No: formData.HOS_No,
        ODM_Date: formData.ODM_Date,
        APRV_Date: formData.APRV_Date,
        ODM_USR_No: this.authService.currentUserValue?.user_No || '',
        ODM_USR_Name: this.authService.currentUserValue?.user_Name || '',
        ODM_TotalBuyNet: formData.ODM_TotalBuyNet, // 進貨驗收金額
        ODM_TotalBuyTax: formData.ODM_TotalBuyTax, // 稅額
        ODM_TotalBuyAmt: formData.ODM_TotalBuyAmt, // 總金額
        ODM_TotalSaleNet: formData.ODM_TotalSaleAmt - totalSaleTax,
        ODM_TotalSaleTax: totalSaleTax,
        ODM_TotalSaleAmt: formData.ODM_TotalSaleAmt, // 總金額
        ODM_Status: this.isFormCreateable ? POStatus.已確認 : this.rowdata?.ODM_Status,
        ODM_Remark: formData.ODM_Remark || '',
        Details: details, // 帶入轉換後的明細資料陣列
      };
      // 處理提交邏輯 (呼叫 insert 或 update)
      this.handleSubmit(frm, () => {
        const request$ = this.isFormCreateable
          ? this.tls52030Service.insertTLS52030(submitData)
          : this.tls52030Service.updateTLS52030(submitData);

        request$.pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        ).subscribe({
          next: (res) => {
            if (this.isFormCreateable) {
              // 參考 TLS52010 使用 confirm 顯示單號
              // 假設後端 Response 結構為 { Data: { odm_No: '...' } } 或 Message
              const odmNo = res.Data?.ODM_No || '—';
              this.messageService.confirm({
                header: '新增成功',
                message: `進貨驗收單號：<strong>${odmNo}</strong>`,
                icon: 'check',
                showIcon: true,
                acceptLabel: '返回',
                accept: () => this.onCancel(),
                rejectLabel: '繼續新增',
                reject: () => this.resetFormForContinueNew(),
              });
            } else {
              this.messageService.successBubble('修改成功');
              this.onCancel();
            }
          }
        });
      });
    })
  }
  private resetFormForContinueNew(): void {
    this.dataForm.reset({
      ODM_No: '系統自動產生',
      ODM_USR_No: this.user?.user_No,
      ODM_USR_Name: this.user?.user_Name,
      ODM_Date: new Date(),
      APRV_Date: new Date(),
    });
    this.data = [];
    this.selectedItems = [];
    this.calculateTotals();
    this.cdr.detectChanges();
  }
  dialogVisible = false;
  dialogLoading = false;
  totalRecords = 0;
  dialogData: IODDetail[] = [];
  dialogLastQueryParams: any | null = null;
  selectedItemsDialog: IODDetail[] = [];
  dialogColumns: Column[] = [
    { field: 'PO_No', header: '採購單編號' },
    { field: 'APPLY_USR_Name', header: '申請人' },
    { field: 'APPLY_Date', header: '申請日期', format: formatDate },
    { field: 'APRV_Date', header: '審核日期', format: formatDate },
    { field: 'VEN_No', header: '廠商編號' },
  ]
  onShowDialog() {
    this.dialogVisible = true
    this.dialogLoading = true;
    this.tls52030Service.getPOS2016(this.dataForm.getRawValue()).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.dialogLastQueryParams = this.dataForm.getRawValue();
      this.totalRecords = response.TotalCount;
    })
  }
  onLazyLoad(event: LazyLoadEvent, dataForm: FormGroup) {
    dataForm.patchValue({
      pageSize: event.pageSize,
      pageIndex: event.pageIndex,
      SortBy: event.SortBy
    });
  }
  saveDialog() {
    const body = {
      PO_NoList: this.selectedItemsDialog.map(item => item.PO_No).filter(poNo => poNo != null)
    };
    const firstSelected = this.selectedItemsDialog[0];
    this.tls52030Service.getPOS2017AndPOS2019(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.data = [
        ...this.data,
        ...response.Data.Data.map((item: IODDetail) => {
          // 1. 計算應驗收數量
          const confirmQty = (item.POD_SubQty || 0) - (item.ODD_ConfirmQty_Finished || 0);

          // 2. 準備計算所需的基本值
          const buyPrice = this.roundToTwo(Number(item.ODD_BuyPrc ?? 0)); // 進價需四捨五入到小數2位
          const salePrice = Number(item.ODD_SalePrc ?? 0);
          const stockTaxType = item.PLU_StockTaxType;
          const saleTaxType = item.PLU_TaxType;

          // 3. 執行金額計算 (複製自 ODD_ConfirmQty 的 calculate 邏輯)
          const buyNet = Math.round(buyPrice * confirmQty);
          const buyTax = stockTaxType === '1' ? Math.round(buyNet * 0.05) : 0;
          const buyAmt = buyNet + buyTax;
          const saleAmt = Math.round(salePrice * confirmQty); // 驗收數量 * 含稅售價 (含稅小計)

          let saleTax = 0;
          if (saleTaxType === '1') {
            saleTax = Math.round(saleAmt * 0.05 / 1.05); // 使用修正後的稅額計算
          }

          // 4. 返回包含所有計算值的明細物件
          return {
            ...item,
            ODD_ConfirmQty: confirmQty, // 設定驗收數量
            ODD_BuyPrc: buyPrice, // 確保帶入的進價是四捨五入後的值，不是 item 原始未處理值
            ODD_BuyNet: buyNet,
            ODD_BuyTax: buyTax,
            ODD_BuyAmt: buyAmt,
            ODD_SaleTax: saleTax,
            ODD_SaleAmt: saleAmt,
            LOGO_No: firstSelected.LOGO_No,
            org_id: firstSelected.org_id,
            ODM_TaxType: firstSelected.ODM_TaxType || '1'
          };
        })
      ];
      this.calculateTotals();
    })
    this.dialogVisible = false;
    this.selectedItemsDialog = [];
    this.selectedItems = [];
  }
  isRowSelectable(event: IODDetail): boolean {
    return !this.data || !this.data.some((item: IODDetail) => item.PO_No === event.PO_No);
  }

  // 總計計算邏輯
  calculateTotals(): void {
    let totalBuyNet = 0; // 進貨驗收金額：加總驗收明細的ODD_BuyNet 進價未稅小計
    let totalBuyTax = 0; // 稅額：單據稅別 ODM_TaxType=1應稅，則ODM_TotalBuyNet * 0.05，四捨五入取整數，若免稅，稅額0
    let totalSaleAmt = 0; // 售價總計：加總驗收明細的ODD_SaleAmt

    for (const item of this.data) {
      const net = Number(item.ODD_BuyNet ?? 0);
      const tax = Number(item.ODD_BuyTax ?? 0);
      const saleAmt = Number(item.ODD_SaleAmt ?? 0);
      totalBuyNet += net;
      totalBuyTax += tax;
      totalSaleAmt += saleAmt;
    }

    const totalBuyAmt = totalBuyNet + totalBuyTax; // 合計金額：等於ODM_TotalBuyNet + ODM_TotalBuyTax

    this.dataForm.patchValue({
      ODM_TotalBuyNet: Math.round(totalBuyNet),
      ODM_TotalBuyTax: Math.round(totalBuyTax),
      ODM_TotalBuyAmt: Math.round(totalBuyAmt),
      ODM_TotalSaleAmt: Math.round(totalSaleAmt),
    });
  }
  onReset() {
    this.data = JSON.parse(JSON.stringify(this.originalData));
  }
}
// 預設0，(驗收數量+已驗數量)不可大於 應驗數量
// 預設 0，(本次驗收數量 + 已驗收數量) 不可大於 應驗數量
export function validateConfirmQtySumNotExceedSubQty(): (
  value: string | number,
  rowData: any,
  data: any[],
  field: string,
  header: string
) => { isValid: boolean; errorMessage: string[] } {
  return (value: string | number, rowData: any, data: any[], field: string, header: string): { isValid: boolean; errorMessage: string[] } => {

    // 1. 取得當下輸入值，若為空或非數字則視為 0
    const confirmQty = isNaN(Number(value)) ? 0 : Number(value);

    // 2. 取得已完成數量與應領數量 (確保從 rowData 取出時有預設值)
    const finishedQty = Number(rowData.ODD_ConfirmQty_Finished ?? 0);
    const subQty = Number(rowData.POD_SubQty ?? 0);

    // 3. 計算總和並驗證
    const total = confirmQty + finishedQty;
    const isValid = total <= subQty;

    return {
      isValid,
      errorMessage: isValid ? [] : [`「${header} + 已驗收數量」不可大於應驗數量 (${subQty})`],
    };
  };
}
