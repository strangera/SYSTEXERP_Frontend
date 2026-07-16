import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24020Service } from '@service/api/fin/fin24020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatYN } from '@others/component/table/table.model';
import { QueryStateService } from '@shared/service/query-state.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { formatAmount, formatYYYYMM } from './../../../shared/components/table-report/table-report.model';

//1.3.2.1 應收帳款維護
@Component({
  selector: 'app-fin24020',
  templateUrl: './fin24020.component.html',
  standalone: true,
  imports: [TableReportComponent, AsyncPipe, CalendarRangeComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarComponent, InputNumberRangeComponent, InputTextComponent, ButtonComponent, TranslateModule]
})
export class FIN24020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ACP_No: [null, [Validators.maxLength(14)]],
    VEN_No: [null],
    ACP_YYYYMM: [null],
    Acp_TermNo: [null, [Validators.maxLength(2)]],
    RetDate_To: [null],
    RetDate_From: [null],
    RetAmt_To: [null],
    RetAmt_From: [null],
    PayGenerated: [null],
    Remark: [null, [Validators.maxLength(200)]],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'ACP_No', order: -1 }]]
  });
  totalRecords = 0;
  data: any[] = [];
  lastQueryBody: any | null = null;
  columns: ReportColumn[] = [
    { field: 'ACP_No', header: '應付ID', align: 'left' },
    { field: 'VEN_No', header: '廠商編號', align: 'left' },
    { field: 'VEN_Name', header: '廠商名稱', align: 'left' },
    { field: 'ACP_YYYYMM', header: '年月', format: formatYYYYMM, align: 'center' },
    { field: 'acp_termno', header: '帳次', align: 'center' },
  ];
  expansionColumns: ReportColumn[] = [
    { field: 'acp_termno', header: '帳次', align: 'center' },
    { field: 'RET_Date', header: '退保留款日期', align: 'left' },
    { field: 'RET_Amt', header: '退保留款金額', format: formatAmount, align: 'right' },
    { field: 'STATUS', header: '是否已付款', format: formatYN, exportFormat: [{ 'Y': '是' }, { 'N': '否' }], align: 'center' },
    { field: 'Remark', header: '備註', align: 'left' },
  ]
  VEN_No_ParamOptions = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商編號
  PTA_KeyOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' },
  ];
  constructor(
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe,
    public readonly fin24020Service: Fin24020Service,
    override readonly queryStateService: QueryStateService,
  ) {
    super();
  }

  editDisabledByVouNo = (rowData: any): boolean => {
    return rowData.STATUS === 'Y';
  }

  ngOnInit(): void {
    this.initializePage('FIN24020', 'fin/FIN24020cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body: any = {
        ...frm.value,
        ACP_YYYYMM: this.datePipe.transform(frm.value.ACP_YYYYMM, 'yyyyMM'),
        RetDate_From: this.datePipe.transform(frm.value.RetDate_From, 'yyyy-MM-dd'),
        RetDate_To: this.datePipe.transform(frm.value.RetDate_To, 'yyyy-MM-dd'),
      };

      this.fin24020Service.queryFIN24020(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.data = response.Data ?? [];
        this.totalRecords = response.TotalCount ?? 0;
        this.lastQueryBody = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      });
    });
  }
}
