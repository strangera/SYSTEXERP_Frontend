import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
import { Component, OnInit, ViewChild } from '@angular/core'; // 引入 ViewChild 和 inject
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { IInvoiceDetail, IReturnDetailData, ReturnNotRebateQueryBody, Tls55030ListData, Tls55030Service } from '@service/api/tls/tls55030.service';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { TLS55030DialogComponent } from './tls55030-dialog.component'; // 引入新的 Dialog 子元件
import { columns, columns2 } from './tls55030-cru.model';
import { ButtonModule } from 'primeng/button';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { CalendarRangeQuickComponent } from "@shared/componentkit/calendar-range-quick/calendar-range-quick.component";

@Component({
  selector: 'app-tls55030-cru',
  templateUrl: './tls55030-cru.component.html',
  standalone: true,
  imports: [
    TableEditComponent, AsyncPipe, RadiobuttonComponent, TranslateModule,
    MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent,
    InputTextComponent, TableReportComponent, DialogComponent, ButtonComponent, NgIf, InputNumberComponent, TLS55030DialogComponent, ButtonModule,
    CalendarRangeQuickComponent
  ]
})
export class TLS55030CRUComponent extends BasicCruPageComponent<Tls55030ListData> implements OnInit {
  @ViewChild('dialogs') dialogComponent!: TLS55030DialogComponent;
  dataForm = this.formBuilder.group({
    ACP_YYYYMM: [new Date('2025-01'), [Validators.required]],
    VEN_No: ['00000000-1', [Validators.required]],
    DIS_EntryType: ['1', [Validators.required]],
    RJM_TotalBuyAmt: [{ value: 0, disabled: true }],               // 退貨總金額
    invoiceTotalAmount: [{ value: 0, disabled: true }],            // 發票總金額(自取) - 彙總所有選取的發票金額
    invoiceRemainingRebateAmount: [{ value: 0, disabled: true }],  // 發票剩餘可折總金額(自取) - 彙總所有選取的發票剩餘可折金額
    totalRebateAmount: [{ value: 0, disabled: true }],             // 折讓總金額(自取) - 彙總所有折讓明細的金額 (APS30231.Rebate_Amt)
    balanceAmount: [{ value: 0, disabled: true }],                 // 餘額(自取) - 計算結果 (RJM_TotalBuyAmt - totalRebateAmount)
  });
  // Dropdown options
  DIS_EntryTypeOptions = getSYS1000Options('DIS_EntryType');
  VEN_NoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' })
  HOS_NoOptions = this.dropdown.queryPos2034();
  // 退貨明細 =======================================================
  data2: IReturnDetailData[] = [];
  selectedItems2: IReturnDetailData[] = [];
  columns2 = columns2;
  // 折讓單明細 =======================================================
  data: IInvoiceDetail[] = [];
  selectedItems: IInvoiceDetail[] = [];
  columns = columns;
  validateRow = (rowData: IInvoiceDetail): { isValid: boolean, errorMessage: string } => {
    if ((rowData.Rebate_Amt_New || 0) > rowData.PUR_Amt - rowData.Rebate_Amt) {
      return { isValid: false, errorMessage: '此張進項發票已超折，請確認折讓單內容' };
    }
    return { isValid: true, errorMessage: '' };
  };
  constructor(
    public readonly tls55030Service: Tls55030Service,
    private readonly dropdown: DropdownApiService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55030', this.dataForm);
  }
  // 處理子元件回傳的退貨明細資料
  handleReturnSelection(selectedReturns: IReturnDetailData[]) {
    this.data2 = [...this.data2, ...selectedReturns];
    this.selectedItems2 = [];
    // 加總data2的RJM_TotalBuyAmt欄位
    this.dataForm.controls.RJM_TotalBuyAmt.setValue(this.data2.reduce((total, item) => total + item.RJM_TotalBuyAmt, 0));
  }
  // 處理子元件回傳的折讓單明細資料
  handleInvoiceSelection(selectedInvoices: IInvoiceDetail[]) {
    // 確保新增的項目有預設的折讓金額、未稅金額、稅額欄位
    const newItems = selectedInvoices.map(item => ({ ...item, Rebate_Amt_New: 0, Rebate_Net: 0, Rebate_Tax: 0 }));
    this.data = [...this.data, ...newItems];
    this.selectedItems = [];
    this.updateSummaryAmounts();
  }
  // 彙總欄位更新函數
  updateSummaryAmounts(): void {
    let totalInvoiceAmt = 0;
    let totalRemainingRebateAmt = 0;
    let positiveTotalRebateAmt = 0;
    this.data.forEach(item => {
      totalInvoiceAmt += item.PUR_Amt;                          // 1. 發票總金額 (發票金額加總)
      totalRemainingRebateAmt += item.PUR_Amt - item.Rebate_Amt;// 2. 發票剩餘可折總金額 ((發票金額 – 已折讓金額) 加總)
      positiveTotalRebateAmt += item.Rebate_Amt_New || 0;       // 3. 折讓總金額(轉負數) (輸入的折讓金額的加總)
    });
    const negativeTotalRebateAmt = -positiveTotalRebateAmt;
    // 餘額 = 勾選發票總金額 - 勾選發票剩餘可折總金額 + (輸入的折讓總金額(轉負數))
    const balance = totalInvoiceAmt - totalRemainingRebateAmt + negativeTotalRebateAmt;
    // 更新 FormControls
    this.dataForm.controls.invoiceTotalAmount.setValue(totalInvoiceAmt);
    this.dataForm.controls.invoiceRemainingRebateAmount.setValue(totalRemainingRebateAmt);
    this.dataForm.controls.totalRebateAmount.setValue(negativeTotalRebateAmt);
    this.dataForm.controls.balanceAmount.setValue(balance);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
  }


  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    APRV_Date_Start: [null],
    APRV_Date_End: [null],
    VEN_No: [null],
    HOS_No: [null],
  });
  dialogData: IReturnDetailData[] = [];
  dialogColumns: ReportColumn[] = [
    { field: 'RJM_No', header: '退貨單號' },
    { field: 'APRV_Date', header: '退貨日期' },
    { field: 'HOS_No', header: '倉別代號' },
    { field: 'HOS_NAME', header: '倉別名稱' },
    { field: 'VEN_NO', header: '廠商編號' },
    { field: 'RJM_TotalBuyNet', header: '未稅金額', format: formatAmount },
    { field: 'RJM_TotalBuyTax', header: '稅額', format: formatAmount },
    { field: 'RJM_TotalBuyAmt', header: '含稅金額', format: formatAmount },
  ];
  dialoglastQueryBody: ReturnNotRebateQueryBody | null = null;
  dialogLoading = false;
  dialogtotalRecords = 0;

  onQuery(frm: FormGroup) {
    this.dialogLoading = true;
    this.tls55030Service.queryTLS55030ReturnNotRebate(frm.value).pipe(untilDestroyed(this), finalize(() => this.dialogLoading = false)).subscribe((res) => {
      this.dialogData = res.Data;
      this.dialogtotalRecords = res.TotalCount || res.Data.length;
      this.dialoglastQueryBody = frm.value;
    })
  }
}
