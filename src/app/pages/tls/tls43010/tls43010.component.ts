import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTls43010Request, QueryTls43010Response, Tls43010Service } from '@service/api/tls/tls43010.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { ReportColumn } from '../tls2f010-cru/tls2f010-table-report.model';

@Component({
  selector: 'app-tls43010',
  templateUrl: './tls43010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarComponent,
    DropdownComponent,
    TableReportComponent,
    TranslateModule,
    CalendarRangeComponent
  ]
})
export class TLS43010Component extends BasicQueryPageComponent<QueryTls43010Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    NOT_No: ['', [Validators.maxLength(20)]], // 通告編號
    NOT_Date: [null as null | Date], // 建立日期
    NOT_BegDate_Start: [null as null | Date], // 有效開始日期
    NOT_BegDate_End: [null as null | Date], // 有效開始日期
    NOT_EndDate_Start: [null as null | Date], // 有效結束日期
    NOT_EndDate_End: [null as null | Date], // 有效結束日期
    NOT_File: ['', [Validators.maxLength(200)]], // 媒體檔案名稱
    NOT_Status: [null, [Validators.maxLength(1)]], // 狀態 0=未確認(未審核) 1=已確認(已審核) 2=已刪除
    pageSize: [500],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'NOT_No', order: -1 }, { field: 'NOT_Date', order: -1 }]],
  });
  totalRecords = 0;
  data: QueryTls43010Response[] = [];
  lastQueryBody: QueryTls43010Request | null = null;
  selectedItems: QueryTls43010Response[] = [];
  columns: ReportColumn[] = [
    { field: 'NOT_No', header: '通告編號', visible: true },
    { field: 'NOT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'NOT_BegDate', header: '有效開始日期時間', visible: true, format: formatDate },
    { field: 'NOT_EndDate', header: '有效結束日期時間', visible: true, format: formatDate },
    { field: 'NOT_File', header: '媒體檔案名稱', visible: true },
    { field: 'NOT_Status', header: '狀態', visible: true, format: (v: string) => this.NOT_Status_Options.find(o => o.value === v)?.label || v },
    { field: 'NOT_Priority', header: '優先順序', visible: true },
    { field: 'NOT_PlayTime', header: '媒體檔播放秒數', visible: true },
    { field: 'NOT_DtlLimit', header: '是否限制播放條件', visible: true, format: v => getSYS1000('NOT_DtlLimit', v) },
    { field: 'NOT_Note', header: '備註', visible: true },
  ];
  NOT_Status_Options: { value: string, label: string }[] = [ // 0=未確認(未審核) 1=已確認(已審核) 2=已刪除
    { value: '0', label: '未審核' },
    { value: '1', label: '已審核' },
    { value: '2', label: '已刪除' },
  ];
  constructor(
    public readonly tls43010Service: Tls43010Service,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS43010', '/TLS/TLS43010CRU', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value
      }
      this.tls43010Service.queryTLS43010(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.lastQueryBody = body;
        this.totalRecords = res.TotalCount || 0;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  onDelete(data: QueryTls43010Response[]) {
    const idList = data.map(r => r.ID).filter(id => id !== undefined);
    this.loading = true;
    this.tls43010Service.deleteTLS43010(idList).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      this.messageService.successBubble(res.Message || '刪除成功');
      this.onSubmit(this.queryForm);
    });
  }

  isRowSelectable(row: QueryTls43010Response) {
    return row.NOT_Status === '0';
  }
  editDisabled(row: QueryTls43010Response) {
    return row.NOT_Status !== '0';
  }
}
