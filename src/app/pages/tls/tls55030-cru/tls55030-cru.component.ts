import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
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
  imports: [TableReportComponent, DialogComponent, TableEditComponent, AsyncPipe, RadiobuttonComponent, TranslateModule, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, InputTextComponent, TableComponent, ButtonComponent, NgIf, InputNumberComponent]
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
    { field: 'PUR_Amt', header: '發票金額' },
    { field: 'PUR_VoucherType', header: '發票格式' },
    { field: 'Rebate_Amt', header: '已折讓金額' },
    { field: 'Rebate_Amt', header: '折讓金額', type: 'inputNumber', width: '12rem' },
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
    { field: 'PUR_Amt', header: '發票金額' },
    { field: 'Rebate_Amt', header: '已折讓金額' },
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
    this.data = [...this.data, ...this.selectedItemsDialog];
    this.selectedItemsDialog = [];
    this.selectedItems = [];

  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
  }
}
