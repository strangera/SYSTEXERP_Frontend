import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fin32010Service } from '@service/api/fin/fin32010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { formatAmount } from './../../../shared/componentkit/table-report/table-report.model';
//1.3.2.1 應收帳款維護
@Component({
  selector: 'app-fin24020',
  templateUrl: './fin24020.component.html',
  styleUrl: './fin24020.component.scss',
  standalone: true,
  imports: [AsyncPipe, CalendarRangeQuickComponent, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarComponent, InputNumberRangeComponent, InputTextComponent, ButtonComponent, TranslateModule]
})
export class FIN24020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ARS_No: [null, [Validators.maxLength(14)]],
    ORG_ID: [null, [Validators.maxLength(20)]],
    sam_yyymm: ["", [Validators.maxLength(6)]],
    sam_termno: [null, [Validators.max(99)]],
    ARS_Amt_From: [null, [Validators.max(9999999999)]],
    ARS_Amt_To: [null, [Validators.max(9999999999)]],
    PTA_Amt_From: [null, [Validators.max(9999999999)]],
    PTA_Amt_To: [null, [Validators.max(9999999999)]],
    BalAmt_From: [null, [Validators.max(9999999999)]],
    BalAmt_To: [null, [Validators.max(9999999999)]],
    PTA_Date_From: [null],
    PTA_Date_To: [null],
    ARS_Date_From: [null],
    ARS_Date_To: [null],
    CustNo: [null],
    Uniform_No: [null, [Validators.maxLength(16)]],
    AccNo: [null, [Validators.maxLength(50)]],
    ARS_SourceNo: [null, [Validators.maxLength(80)]],
    VouNo: ["", [Validators.maxLength(12)]],
    PostFlag: [null, [Validators.maxLength(100)]],
    ARS_Status: [null],
    SubDetailNo: [""],
    NoteDesc: [null, [Validators.maxLength(160)]],
    PTA_Key: [null]
  });
  // 表格
  // ----------------------------------------------------------------
  pageSize = 20;
  pageIndex = 1;
  sortBy = '';
  totalRecords = 0;
  data: any[] = [];
  lastQueryBody: any | null = null;
  columns: ReportColumn[] = [
    // { field: 'RowNo', header: '序號', visible: false },
    { field: 'ARS_ID', header: '應收ID' },
    { field: 'ARS_Amt', header: '廠商編號', format: formatAmount },
    { field: 'PTA_Amt', header: '帳款年月', format: formatAmount },
    { field: 'ARS_BalAmt', header: '帳款帳次', format: formatAmount },
    { field: 'ARS_Date', header: '退保留款日期', format: formatDate },
    { field: 'PTA_Date', header: '退保留款金額', format: formatDate },
    { field: 'CustInfo', header: '是否產生付款資料' },
    { field: 'NoteDesc', header: '備註' },
  ];
  VEN_No_ParamOptions = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商代號
  PTA_KeyOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' },

  ];
  constructor(
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe,
    public readonly fin32010Service: Fin32010Service,
  ) {
    super();
  }

  // 禁止編輯的判斷：若該列已有 VouNo（傳票號）則不可編輯
  editDisabledByVouNo = (rowData: any): boolean => {
    return !!(rowData && rowData.VouNo);
  }

  ngOnInit(): void {
    this.initializePage('FIN24020', 'fin/FIN24020cru', this.queryForm, (form) => this.onSubmit(form));

  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

      // this.fin32010Service.queryFIN32010()
      //   .pipe(finalize(() => this.loading = false), untilDestroyed(this))
      //   .subscribe(response => {

      //     this.totalRecords = response.TotalCount ?? 0;

      //   });
    });
  }


}
