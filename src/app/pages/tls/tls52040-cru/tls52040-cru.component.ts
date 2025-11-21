import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000 } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { PanelModule } from 'primeng/panel';
import { debounceTime, finalize, withLatestFrom } from 'rxjs';
import { ITLS52040Data, ITLS52040Detail, TLS52040Request, Tls52040Service } from '../../../service/api/tls/tls52040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, formatDate, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { validateMinNumber } from '../../../shared/componentkit/table/validate-field.model';
import { POStatus } from '../tls52040/tls52040.component';
@Component({
  selector: 'app-tls52040-cru',
  templateUrl: './tls52040-cru.component.html',
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
    TableComponent,
    NgIf,
    DialogComponent,
    TranslateModule,
    TableEditComponent,
    AsyncPipe
  ],
})
export class TLS52040CRUComponent extends BasicCruPageComponent<ITLS52040Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    RJM_No: [{ value: '系統自動產生', disabled: true }], // 退貨驗收單號
    VEN_No: [null as string | null, [Validators.required]], // 廠商編號
    LOGO_No: [null as string | null, [Validators.required]], // 品牌代碼 (與 POS2016.LOGO_No 對應)
    HOS_No: [null as string | null, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    RJM_TotalBuyNet: [{ value: 0, disabled: true }], // 進貨驗收金額
    RJM_TotalBuyTax: [{ value: 0, disabled: true }], // 稅額
    RJM_TotalBuyAmt: [{ value: 0, disabled: true }], // 合計金額
    RJM_TotalSaleAmt: [{ value: 0, disabled: true }], // 售價總計
    APPLY_USR_No: [{ value: this.user?.user_No, disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_USR_Name: [{ value: this.user?.user_Name, disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_Date: [new Date(), [Validators.required]], // 申請日期
    RJM_Remark: [null as string | null, [Validators.maxLength(200)]],// 進貨驗收單說明
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  vendorOptions = this.dropdown.queryPos2013({ VEN_Flag: '' })
  brandOptions = this.dropdown.queryPluLogoHosNo(); // 品牌下拉選單選項
  warehouseOptions = this.dropdown.queryPos2034() // 倉別下拉選單選項
  originalData: ITLS52040Detail[] = [];
  data: ITLS52040Detail[] = [];
  selectedItems: ITLS52040Detail[] = [];
  editColumns: EditColumn[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'CRN_SubQty', header: '可退回數量', format: formatAmount },
    {
      field: 'RJD_ConfirmQty',
      header: '退回數量',
      type: 'inputNumber',
      validate: [validateConfirmQtySumNotExceedSubQty(), validateMinNumber(0)],
      width: '100px',
      // 將所有計算邏輯放在這裡
      calculate: (row) => {
        const confirmQty = Number(row.RJD_ConfirmQty ?? 0);
        const buyPrice = Number(row.RJD_BuyPrc ?? 0);
        const salePrice = Number(row.RJD_SalePrc ?? 0);
        const stockTaxType = row.PLU_StockTaxType;
        const saleTaxType = row.PLU_TaxType;

        const buyNet = Math.round(buyPrice * confirmQty); // 未稅金額
        const buyTax = stockTaxType === '1' ? Math.round(buyNet * 0.05) : 0; // 稅額
        const buyAmt = buyNet + buyTax; // 進價小計
        const saleTax = saleTaxType === '1' ? Math.round((salePrice * confirmQty) / 21) : 0; // 售價稅額
        const saleAmt = Math.round(salePrice * confirmQty); // 售價小計

        // 回傳一個包含所有計算結果的物件
        return {
          'RJD_BuyNet': buyNet,
          'RJD_BuyTax': buyTax,
          'RJD_BuyAmt': buyAmt,
          'RJD_SaleTax': saleTax,
          'RJD_SaleAmt': saleAmt,
        };
      }
    },
    { field: 'RJD_ConfirmQty_Finished', header: '已驗退回數量' },
    { field: 'UNIT_NAME', header: '商品單位' },
    { field: 'RJD_BuyPrc', header: '單價', format: formatAmount },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => getSYS1000('PLU_StockTaxType', value) },
    { field: 'RJD_BuyNet', header: '未稅金額', format: formatAmount },
    { field: 'RJD_BuyTax', header: '稅額', format: formatAmount },
    { field: 'RJD_SalePrc', header: '售價', format: formatAmount },
    { field: 'RJD_SaleAmt', header: '售價小計', format: formatAmount },
    { field: 'CRN_No', header: '退貨單編號' },
    { field: 'RJD_Remark', header: '單項備註', type: 'input', width: '150px' },
  ];
  constructor(
    private tls52040Service: Tls52040Service,
    private readonly dropdown: DropdownApiService
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS52040', this.dataForm);
    if (this.isFormEditable) {
      this.dataForm.controls.VEN_No.disable();
      this.dataForm.controls.LOGO_No.disable();
    }
    this.loadDropdownOptions();
    if (!this.isFormCreateable) {
      this.tls52040Service.GetPOS2032({ RJM_No: this.rowdata?.RJM_No }).pipe(untilDestroyed(this)).subscribe(response => {
        this.data = response.Data.Data;
        this.originalData = JSON.parse(JSON.stringify(response.Data.Data));
      });
    }
  }
  loadDropdownOptions() {
    if (this.isFormCreateable) {
      const resetFormData = () => { this.data = []; this.selectedItems = []; this.dialogData = []; this.calculateTotals(); };
      this.dataForm.controls.VEN_No.valueChanges.pipe(untilDestroyed(this)).subscribe(() => resetFormData());
      this.dataForm.controls.HOS_No.valueChanges.pipe(untilDestroyed(this)).subscribe(() => resetFormData());
      this.warehouseOptions.pipe(untilDestroyed(this)).subscribe(warehouseOpts => {
        this.dataForm.controls.LOGO_No.valueChanges.pipe(withLatestFrom(this.brandOptions), debounceTime(300), untilDestroyed(this)).subscribe(([logoNo, brandOpts]) => {
          const selectedBrand = brandOpts?.find(opt => opt.value === logoNo);
          const suggestedHOSNo = selectedBrand ? selectedBrand['No'] : null;
          let finalHOSNo: string | null = null;
          if (suggestedHOSNo && warehouseOpts?.some(opt => opt['No'] === suggestedHOSNo)) {
            finalHOSNo = suggestedHOSNo;
          }
          this.dataForm.controls.HOS_No.setValue(finalHOSNo, { emitEvent: false });
          resetFormData();
        });
      });
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
      console.log(this.data);

      const details: ITLS52040Detail[] = this.data.map((item) => ({
        id: item.id,
        RJM_No: formData.RJM_No,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        HOS_No: formData.HOS_No,
        PLU_MagNo: item.PLU_MagNo,
        PLU_No: item.PLU_No,
        PLU_Unit: item.PLU_Unit,
        PLU_BoxQty: item.PLU_BoxQty,
        PLU_Name: item.PLU_Name,
        PLU_StockTaxType: item.PLU_StockTaxType,
        RJD_BuyPrc: item.RJD_BuyPrc || 0, // 退貨單價 (未稅進價)
        RJD_BuyNet: item.RJD_BuyNet || 0, // 退貨淨額 (已計算過並取整數)
        RJD_BuyTax: item.RJD_BuyTax || 0, // 退貨稅額 (已計算過並取整數)
        RJD_BuyAmt: item.RJD_BuyAmt || 0, // 退貨金額 (已計算過並取整數)
        PLU_TaxType: item.PLU_TaxType,
        RJD_SalePrc: item.RJD_SalePrc || 0, // 確保有值，使用之前計算好的 CRN_SubQty
        RJD_SaleTax: item.RJD_SaleTax || 0, // 銷售稅額 (已計算過並取整數)
        RJD_SaleAmt: item.RJD_SaleAmt || 0, // 銷售金額 (已計算過並取整數)
        CRN_SubQty: item.CRN_SubQty || 0, // 確保有值，使用之前計算好的 CRN_SubQty
        RJD_ConfirmQty: item.RJD_ConfirmQty || 0, // 確保有值，使用之前計算好的 CRN_SubQty
        RJD_ConfirmQty_Finished: item.RJD_ConfirmQty_Finished || 0,
        RJD_Remark: item.RJD_Remark || '',
        CRN_No: item.CRN_No,
      }));
      const totalSaleTax = details.reduce((sum, item) => sum + (item.RJD_SaleTax || 0), 0);
      const submitData: TLS52040Request = {
        id: this.isFormCreateable ? undefined : this.rowdata?.id,
        RJM_No: formData.RJM_No,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        VEN_No: formData.VEN_No,
        LOGO_No: formData.LOGO_No,
        HOS_No: formData.HOS_No,
        org_id: this.rowdata?.org_id,
        APPLY_Date: formData.APPLY_Date,
        APPLY_USR_No: this.authService.currentUserValue?.user_No || '',
        APPLY_USR_Name: this.authService.currentUserValue?.user_Name || '',
        RJM_TotalBuyNet: formData.RJM_TotalBuyNet, // 進貨驗收金額
        RJM_TotalBuyTax: formData.RJM_TotalBuyTax, // 稅額
        RJM_TotalBuyAmt: formData.RJM_TotalBuyAmt, // 總金額
        RJM_TotalSaleNet: formData.RJM_TotalSaleAmt - totalSaleTax,
        RJM_TotalSaleTax: totalSaleTax,
        RJM_TotalSaleAmt: formData.RJM_TotalSaleAmt, // 總金額
        RJM_Status: this.isFormCreateable ? POStatus.已確認 : this.rowdata?.RJM_Status,
        RJM_TaxType: this.rowdata?.RJM_TaxType,
        RJM_Remark: formData.RJM_Remark || '',
        Details: details, // 帶入轉換後的明細資料陣列
      };
      // 處理提交邏輯 (呼叫 insert 或 update)
      this.handleSubmit(frm, () => {
        const request$ = this.isFormCreateable
          ? this.tls52040Service.insertTLS52040(submitData)
          : this.tls52040Service.updateTLS52040(submitData);

        request$.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe({
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
  dialogVisible = false;
  dialogLoading = false;
  totalRecords = 0;
  dialogData: ITLS52040Detail[] = [];
  selectedItemsDialog: ITLS52040Detail[] = [];
  dialogColumns: Column[] = [
    { field: 'CRN_No', header: '退貨單編號' },
    { field: 'APPLY_Date', header: '申請日期', format: formatDate },
    { field: 'APRV_Date', header: '審核日期', format: formatDate },
  ]
  onShowDialog() {
    this.dialogVisible = true
    this.dialogLoading = true;
    this.tls52040Service.GetPOS2031P(this.dataForm.getRawValue()).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data.Data;
      this.totalRecords = response.Data.TotalCount;
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
      CRN_NoList: this.selectedItemsDialog.map(item => item.CRN_No).filter(crnNo => crnNo != null)
    };
    this.tls52040Service.GetPOS2032PAndPOS2032(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.data = [
        ...this.data,
        ...response.Data.Data.map((item: ITLS52040Detail) => ({
          ...item,
          RJD_ConfirmQty: 1,
          RJD_BuyPrc: item.RJD_BuyNet,
          RJD_BuyNet: 0,
        }))
      ];
    })
    this.dialogVisible = false;
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.calculateTotals();
  }
  onDelete(selectedRows: ITLS52040Detail[]) {
    this.data = this.data.filter(row => !selectedRows.includes(row));
    this.calculateTotals();
  }
  isRowSelectable(event: ITLS52040Detail): boolean {
    return !this.data || !this.data.some((item: ITLS52040Detail) => item.CRN_No === event.CRN_No);
  }
  // 總計計算邏輯
  calculateTotals(): void {
    let totalBuyNet = 0; // 進貨驗收金額：加總驗收明細的RJM_BuyNet 進價未稅小計
    let totalBuyTax = 0; // 稅額：單據稅別 RJM_TaxType=1應稅，則RJM_TotalBuyNet * 0.05，四捨五入取整數，若免稅，稅額0
    let totalSaleAmt = 0; // 售價總計：加總驗收明細的RJM_SaleAmt

    for (const item of this.data) {
      const net = Number(item.RJD_BuyNet ?? 0);
      const tax = Number(item.RJD_BuyTax ?? 0);
      const saleAmt = Number(item.RJD_SaleAmt ?? 0);
      totalBuyNet += net;
      totalBuyTax += tax;
      totalSaleAmt += saleAmt;
    }

    const totalBuyAmt = totalBuyNet + totalBuyTax; // 合計金額：等於RJM_TotalBuyNet + RJM_TotalBuyTax

    this.dataForm.patchValue({
      RJM_TotalBuyNet: Math.round(totalBuyNet),
      RJM_TotalBuyTax: Math.round(totalBuyTax),
      RJM_TotalBuyAmt: Math.round(totalBuyAmt),
      RJM_TotalSaleAmt: Math.round(totalSaleAmt),
    });
  }
  onReset() {
    this.data = JSON.parse(JSON.stringify(this.originalData));
  }
}
// 預設0，(驗收數量+已驗數量)不可大於 應驗數量
export function validateConfirmQtySumNotExceedSubQty(): (value: string | number, rowData: ITLS52040Detail, data: ITLS52040Detail[], field: string, header: string) => {
  isValid: boolean;
  errorMessage: string[];
} {
  return (value: string | number, rowData: ITLS52040Detail, data: ITLS52040Detail[], field: string, header: string): { isValid: boolean; errorMessage: string[] } => {
    const confirmQty = Number(value); // RJM_ConfirmQty 當下輸入值
    const finishedQty = Number(rowData.RJD_ConfirmQty_Finished ?? 0);
    const subQty = Number(rowData.CRN_SubQty ?? 0);
    const total = confirmQty + finishedQty;
    const isValid = !isNaN(total) && total <= subQty;
    return { isValid, errorMessage: isValid ? [] : [`「${header} + 已驗收數量」不能大於 應驗數量(${subQty})`, '驗證錯誤'], };
  };
}
