import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AsyncPipe, NgIf, DatePipe } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { IInvoiceDetail, IReturnDetailData, Tls55030Service } from '@service/api/tls/tls55030.service';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { formatAmount, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";

@Component({
  selector: 'app-tls55030-cru',
  templateUrl: './tls55030-cru.component.html',
  standalone: true,
  imports: [TableReportComponent, DialogComponent, TableEditComponent, AsyncPipe, RadiobuttonComponent, TranslateModule, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, InputTextComponent, ButtonComponent, NgIf, InputNumberComponent]
})
export class TLS55030CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.group({
    ACP_YYYYMM: [new Date('2025-01'), [Validators.required]],
    VEN_No: ['23991432-1', [Validators.required]],
    DIS_EntryType: ['1', [Validators.required]],
    // 退貨總金額
    RJM_TotalBuyAmt: [{ value: 0, disabled: true }],
    // 發票總金額(自取) - 彙總所有選取的發票金額
    invoiceTotalAmount: [{ value: 0, disabled: true }],
    // 發票剩餘可折總金額(自取) - 彙總所有選取的發票剩餘可折金額
    invoiceRemainingRebateAmount: [{ value: 0, disabled: true }],
    // 折讓總金額(自取) - 彙總所有折讓明細的金額 (APS30231.Rebate_Amt)
    totalRebateAmount: [{ value: 0, disabled: true }],
    // 餘額(自取) - 計算結果 (RJM_TotalBuyAmt - totalRebateAmount)
    balanceAmount: [{ value: 0, disabled: true }],
  });
  // Dropdown options
  DIS_EntryTypeOptions = getSYS1000Options('DIS_EntryType');
  VEN_NoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' })
  // 退貨明細 =======================================================
  data2: IReturnDetailData[] = [];
  selectedItems2: IReturnDetailData[] = [];
  columns2: EditColumn[] = [
    { field: 'RJM_No', header: '退貨單號' },
    { field: 'APRV_Date', header: '退貨日期' },
    { field: 'HOS_NAME', header: '倉別' },
    { field: 'RJM_TotalBuyNet', header: '未稅金額', format: formatAmount },
    { field: 'RJM_TotalBuyTax', header: '稅額', format: formatAmount },
    { field: 'RJM_TotalBuyAmt', header: '應稅金額', format: formatAmount }
  ];
  dialogVisible2 = false;
  selectedItemsDialog2: IReturnDetailData[] = [];
  dialogData2: IReturnDetailData[] = [];
  dialogColumns2: ReportColumn[] = [...this.columns2];
  dialogLoading2 = false;
  totalRecords2 = 0;
  lastQueryBody2: any;
  isRowSelectable2(event: IReturnDetailData): boolean {
    return !this.data2 || !this.data2.some((item: IReturnDetailData) => item.RJM_No === event.RJM_No);
  }
  // 折讓單明細 =======================================================
  data: IInvoiceDetail[] = [];
  selectedItems: IInvoiceDetail[] = [];
  columns: EditColumn[] = [
    { field: 'TABTYPE', header: '單據別' },
    { field: 'PUR_GUINo', header: '發票/收據編號' },
    { field: 'PUR_TaxType', header: '課稅別' },
    { field: 'PUR_DirectType', header: '發票用途' },
    { field: 'PUR_Amt', header: '發票金額', format: formatAmount },
    { field: 'PUR_VoucherType', header: '發票格式' },
    { field: 'Rebate_Amt', header: '已折讓金額', format: formatAmount },
    { field: 'Rebate_Amt_New', header: '折讓金額', type: 'inputNumber', width: '12rem' },
    { field: 'Rebate_Net', header: '未稅金額', type: 'inputNumber', width: '12rem' },
    { field: 'Rebate_Tax', header: '稅額', type: 'inputNumber', width: '12rem' }
  ];
  dialogVisible = false;
  dialogColumns: ReportColumn[] = [
    { field: 'SeqNo', header: '序號' },
    { field: 'TABTYPE', header: '單據別' },
    { field: 'PUR_GUINo', header: '發票號碼' },
    { field: 'PUR_GUIDate', header: '發票日期' },
    { field: 'PUR_TaxType', header: '稅別' },
    { field: 'PUR_DirectType', header: '發票用途' },
    { field: 'PUR_VoucherType', header: '發票格式' },
    { field: 'PUR_Amt', header: '發票金額', format: formatAmount },
    { field: 'Rebate_Amt', header: '已折讓金額', format: formatAmount },
  ];
  selectedItemsDialog: IInvoiceDetail[] = [];
  dialogData: IInvoiceDetail[] = [];
  dialogLoading = false;
  totalRecords = 0;
  lastQueryBody: any;
  isRowSelectable(event: IInvoiceDetail): boolean {
    return !this.data || !this.data.some((item: IInvoiceDetail) => item.SeqNo === event.SeqNo);
  }
  constructor(
    public readonly tls55030Service: Tls55030Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55030', this.dataForm);
  }
  onInsert2() {
    this.dialogVisible2 = true;
    const body = {
      VEN_No: this.dataForm.controls.VEN_No.value,
      ACP_YYYYMM: this.datePipe.transform(this.dataForm.controls.ACP_YYYYMM.value, 'yyyyMM'),
    }
    this.tls55030Service.queryReturnDetailData(body).pipe(untilDestroyed(this)).subscribe(res => {
      this.dialogData2 = res;
    })
  }
  saveDialog2() {
    this.dialogVisible2 = false;
    this.data2 = [...this.data2, ...this.selectedItemsDialog2];
    this.selectedItemsDialog2 = [];
    this.selectedItems2 = [];
    // 加總data2的RJM_TotalBuyAmt欄位
    this.dataForm.controls.RJM_TotalBuyAmt.setValue(this.data2.reduce((total, item) => total + item.RJM_TotalBuyAmt, 0));
  }
  onInsert() {
    this.dialogVisible = true;
    this.tls55030Service.queryInvoiceDetailsForRebate(this.dataForm.controls.VEN_No.value).pipe(untilDestroyed(this)).subscribe(res => {
      this.dialogData = res;
    })
  }
  saveDialog() {
    this.dialogVisible = false;
    // 確保新增的項目有預設的折讓金額、未稅金額、稅額欄位
    const newItems = this.selectedItemsDialog.map(item => ({
      ...item,
      Rebate_Amt_New: 0,
      Rebate_Net: 0,
      Rebate_Tax: 0
    }));

    this.data = [...this.data, ...newItems];
    this.selectedItemsDialog = [];
    this.selectedItems = [];

    // 確保新加入的資料能觸發彙總更新
    this.updateSummaryAmounts();
  }
  onFieldChange(event: { rowData: IInvoiceDetail, field: string, value: number, index?: number }) {
    const { rowData, field, value } = event;
    const newRow = { ...rowData };

    // 確保輸入值是數字
    const inputValue = Number(value) || 0;

    // 1. 計算金額聯動
    const { net, tax, amt } = this.calculateTaxAmounts(newRow, field as any, inputValue);

    newRow.Rebate_Amt_New = amt;
    newRow.Rebate_Net = net;
    newRow.Rebate_Tax = tax;

    // 2. 更新 data 陣列
    const index = this.data.findIndex(item => item.SeqNo === rowData.SeqNo);
    if (index !== -1) {
      this.data[index] = newRow;
    }

    // 3. 更新上方彙總欄位
    this.updateSummaryAmounts();
  }
  // --- 新增: 稅率判斷與金額計算輔助函數 ---
  private calculateTaxAmounts(
    row: IInvoiceDetail,
    fieldChanged: 'Rebate_Amt_New' | 'Rebate_Net' | 'Rebate_Tax',
    inputValue: number
  ): { net: number, tax: number, amt: number } {

    // 1. 取得稅率: 假設應稅(1)為 5%，其他為 0%
    const taxRate = row.PUR_TaxType === '應稅' ? 0.05 : 0;

    let net = row.Rebate_Net || 0;
    let tax = row.Rebate_Tax || 0;
    let amt = row.Rebate_Amt_New || 0;

    // 2. 根據變更的欄位重新計算
    if (taxRate === 0) {
      // 免稅/零稅：所有金額相同 (稅額為 0)
      net = inputValue;
      tax = 0;
      amt = inputValue;
    } else {
      // 應稅 (5%)：需要拆分
      switch (fieldChanged) {
        case 'Rebate_Amt_New': // 輸入 折讓金額(含稅)
          amt = inputValue;
          net = Math.round((amt / (1 + taxRate)) * 100) / 100; // 四捨五入到小數點第二位
          tax = Math.round((amt - net) * 100) / 100;
          break;
        case 'Rebate_Net': // 輸入 未稅金額
          net = inputValue;
          tax = Math.round((net * taxRate) * 100) / 100;
          amt = Math.round((net + tax) * 100) / 100;
          break;
        case 'Rebate_Tax': // 輸入 稅額
          tax = inputValue;
          net = Math.round((tax / taxRate) * 100) / 100;
          amt = Math.round((net + tax) * 100) / 100;
          break;
      }
    }

    return { net, tax, amt };
  }
  // --- 新增: 彙總欄位更新函數 ---
  private updateSummaryAmounts(): void {
    let totalInvoiceAmt = 0;
    let totalRemainingRebateAmt = 0;
    let totalRebateAmt = 0;

    this.data.forEach(item => {
      // 1. 發票總金額 (勾選的發票金額加總)
      totalInvoiceAmt += item.PUR_Amt;

      // 2. 發票剩餘可折總金額 (勾選的(發票金額 – 已折讓金額) 加總)
      totalRemainingRebateAmt += item.PUR_Amt - item.Rebate_Amt;

      // [cite_start]// 3. 折讓總金額 (輸入的折讓金額的加總) [cite: 60]
      totalRebateAmt += item.Rebate_Amt_New || 0;
    });

    const totalRJM = this.dataForm.controls.RJM_TotalBuyAmt.value || 0;
    // 4. 餘額 = 退貨總金額 - 折讓總金額 (基於前一個討論的簡單邏輯，規格餘額計算較複雜，先採用簡單邏輯)
    // [cite_start]// 規格餘額: 餘額=發票總金額 – 發票剩餘可折總金額 + (折讓總金額(顯示負項)) [cite: 61, 111]
    // 這裡我們**採用規格定義的計算邏輯**：
    // 餘額 = 勾選發票總金額 - 勾選發票剩餘可折總金額 + (輸入的折讓總金額)
    const balance = totalInvoiceAmt - totalRemainingRebateAmt + totalRebateAmt;

    // 更新 FormControls
    this.dataForm.controls.invoiceTotalAmount.setValue(totalInvoiceAmt);
    this.dataForm.controls.invoiceRemainingRebateAmount.setValue(totalRemainingRebateAmt);
    this.dataForm.controls.totalRebateAmount.setValue(totalRebateAmt);
    this.dataForm.controls.balanceAmount.setValue(balance);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
  }
}
