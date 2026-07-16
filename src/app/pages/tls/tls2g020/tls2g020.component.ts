import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from "@shared/components/multi-select/multi-select.component";
import { formatAmount, formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize, map } from 'rxjs';
import { Tls2g020Service } from '../../../service/api/tls/tls2g020.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';

@Component({
  selector: 'app-tls2g020',
  templateUrl: './tls2g020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    MultiSelectComponent,
    TranslateModule,
    TableReportComponent
  ]
})
export class TLS2G020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TLT_NoList: [[]],
    budget_yy: [new Date()],
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });
  data: any[] = [];
  lastQueryBody: any;
  totalRecords = 0;
  tltNoOptions: IDropdownItem[] = [];

  columns: ReportColumn[] = [
    { field: 'budget_yy', header: '年度', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'Contract_No', header: '合約編號', visible: true },
    { field: 'Contract_subno', header: '合約版次', visible: true },
    { field: 'Contract_bdate', header: '合約起始日', visible: true, format: formatDate },
    { field: 'Contract_edate', header: '合約結束日', visible: true, format: formatDate },
    { field: 'Mdeatil', header: '月預算明細', visible: false }
  ];
  expansionColumns: ReportColumn[] = [
    {
      field: 'Month',
      header: '月',
      format: (value: string) => value ? value.slice(-2) : ''
    },
    { field: 'budget', header: '月預算', visible: true, format: formatAmount },
    { field: 'avg_cag_charge_rate', header: '平均抽成', format: formatAmount },
    { field: 'avg_cag_charge_nurate', header: '抽成額', format: formatAmount },
  ];

  constructor(
    private dropDownListService: DropDownListService,
    public readonly tls2g020Service: Tls2g020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2G020', 'TLS/TLS2G020CRU', this.queryForm, (form) => this.onSubmit(form));

    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res?.Data) {
          this.tltNoOptions = res.Data.map(item => ({
            label: `${item.No}-${item.Name}`,
            value: item.No,
            No: item.No,
            Name: item.Name
          }));
        }
      });
  }
  // 將日期字串或 Date 物件轉 yyyy-mm-dd
  private formatDateString(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private buildPayload(raw: any) {
    return {
      budget_yy: raw.budget_yy
        ? new Date(raw.budget_yy).getFullYear().toString()
        : '',
      tlt_no: raw.TLT_NoList || [],
      pageIndex: Number(raw.pageIndex) || 1,
      pageSize: Number(raw.pageSize) || 30,
      SortBy: raw.SortBy && raw.SortBy.length ? raw.SortBy : [{ field: 'tlt_no', order: 1 }],
    };
  }

  private mapResponseData(data: any[]) {
    return (data || []).map((item: any) => ({
      ...item,
      Contract_bdate: item.Contract_bdate ? this.formatDateString(item.Contract_bdate) : '',
      Contract_edate: item.Contract_edate ? this.formatDateString(item.Contract_edate) : '',
      avg_cag_charge_rate: item.avg_cag_charge_rate,
      Mdeatil: (item.Mdeatil || []).map((m: any) => ({
        ...m,
        talent_id: item.talent_id,
        budget_yy: item.budget_yy,
        avg_cag_charge_nurate: m.budget * m.avg_cag_charge_rate // 新增抽成額
      }))
    }));
  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();
    this.messageService.infoBubble('查詢中,請稍候...');
    // 儲存查詢條件，方便 CRU 返回時還原並自動查詢
    try {
      this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
    } catch (e) {
      console.warn('Save query state failed', e);
    }

    const raw = frm.getRawValue();
    const payload = this.buildPayload(raw);

    this.tls2g020Service.queryTLS2G020(payload)
      .pipe(untilDestroyed(this), finalize(() => {
        this.loading = false;
        this.messageService.unblockUi();
      }))
      .subscribe((res) => {
        this.lastQueryBody = raw;
        this.data = this.mapResponseData(res?.Data || []);
        this.totalRecords = res?.TotalCount || 0;
      });
  }

  // table-report 內部捲動載入/排序會直接呼叫這支，需重現 onSubmit 的 payload 組裝與回應資料轉換
  queryFn = (body: any) => this.tls2g020Service.queryTLS2G020(this.buildPayload(body)).pipe(
    map(res => ({ ...res, Data: this.mapResponseData(res?.Data || []) }))
  );



  onRowExpand(event: any) {
    const row = event.data;
    const payload = {
      talent_id: row.talent_id,
      budget_yymm: row.Month
    };

    row.expansionLoading = true;
    this.messageService.infoBubble('結算中,請稍候...');
    this.tls2g020Service.queryTLS2G020Deatil(payload)
      .pipe(untilDestroyed(this), finalize(() => row.expansionLoading = false))
      .subscribe({
        next: (res) => {
          row.details = res?.Data || [];
        },
      });
  }


  onClearForm() {
    this.queryForm.reset();
  }
}
