import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24020Service } from '@service/api/fin/fin24020.service';
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
import { finalize, map } from 'rxjs';
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
    { field: 'ACP_No', header: '應付ID' },
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'ACP_YYYYMM', header: '應付帳款年月', format: formatDate },
    { field: 'acp_termno', header: '帳次', format: formatAmount },
    { field: 'ACP_ReserveAmt', header: '退保留款金額', format: formatAmount },
    { field: 'RET_Date', header: '退保留款日期', format: formatDate },
    { field: 'STATUS', header: '是否產生付款資料' },
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
    public readonly fin24020Service: Fin24020Service,
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

  // 包一層，讓所有查詢(畫面及 table-report)都會把 STATUS 代碼轉成中文
  queryFIN24020WithStatusLabel(body: any) {
    return this.fin24020Service.queryFIN24020(body).pipe(
      map((res: any) => {
        const rows = res?.Data ?? [];
        const mappedRows = rows.map((r: any) => ({
          ...r,
          STATUS: this.PTA_KeyOptions.find(opt => String(opt.value) === String(r.STATUS))?.label ?? r.STATUS
        }));
        return { ...res, Data: mappedRows };
      })
    );
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body: any = {
        PageSize: this.pageSize,
        PageIndex: this.pageIndex,
        pageSize: this.pageSize,
        pageIndex: this.pageIndex,
        Offset: 0,
        OrderBy: this.sortBy ?? '',
        SortBy: this.sortBy
          ? [{ field: this.sortBy, order: 1 }]
          : [],

        ACP_No: frm.value.ACP_No ?? '',
        VEN_No: frm.value.VEN_No ?? '',
        ACP_YYYYMM: frm.value.ACP_YYYYMM ?? '',
        Acp_TermNo: frm.value.Acp_TermNo ?? null,
        RetDate_From: frm.value.RetDate_From ?? null,
        RetDate_To: frm.value.RetDate_To ?? null,
        RetAmt_From: frm.value.RetAmt_From ?? null,
        RetAmt_To: frm.value.RetAmt_To ?? null,
        PayGenerated: frm.value.PayGenerated ?? '',
        Remark: frm.value.Remark ?? ''
      };

      this.queryFIN24020WithStatusLabel(body)
        .pipe(finalize(() => this.loading = false), untilDestroyed(this))
        .subscribe(response => {
          const rows = response.Data ?? [];
          this.data = rows;
          this.totalRecords = response.TotalCount ?? 0;
          this.lastQueryBody = body;
        });
    });
  }


}
