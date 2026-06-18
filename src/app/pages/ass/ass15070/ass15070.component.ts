import { Component, computed, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS15070Service } from '@service/api/ass/ass15070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, Observable } from 'rxjs';
import { QueryASS15070QueryBody, QueryASS15070Request, QueryASS15070Row } from './ass15070.model';

// 財產進貨清單
@Component({
  selector: 'app-ass15070',
  templateUrl: './ass15070.component.html',
  styleUrl: './ass15070.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    ButtonModule,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS15070Component extends BasicQueryPageComponent<QueryASS15070Row> implements OnInit {
  @ViewChild('tableReport') tableReport?: TableReportComponent;
  public readonly queryForm = this.formBuilder.group({
    CHECK_DATE_S: new FormControl<Date | null>(null),
    CHECK_DATE_E: new FormControl<Date | null>(null),
    SUBPOENA_ID: new FormControl<string | null>(null),
    SUPPLIER_ID: new FormControl<string | null>(null),
    EMP_ID: new FormControl<string | null>(null),
    pageSize: new FormControl<number>(30),
    pageIndex: new FormControl<number>(1),
  });

  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<QueryASS15070Row[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: QueryASS15070Request;

  /** 進貨單號下拉：queryFAASSCHKMASS15070_DropDownList */
  public subpoenaOptions: { label: string; value: string }[] = [];
  /** 廠商編號下拉：queryPOS2013_DropDownList */
  public supplierOptions: { label: string; value: string }[] = [];
  /** 申請人代號下拉：queryTBLUSER_DropDownList */
  public applicantOptions: { label: string; value: string }[] = [];

  public exportPdfLoading = false;

  public readonly columns: ReportColumn[] = [
    { field: 'SUBPOENA_ID', header: '進貨單號' },
    { field: 'CHECK_DATE', header: '進貨日期' },
    { field: 'EMP_ID', header: '申請人' },
    { field: 'user_Name', header: '申請人姓名' },
    { field: 'SUPPLIER_ID', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'NOTES', header: '說明' },
  ];

  constructor(
    public readonly service: ASS15070Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly fileExportService: FileExportService,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS15070', '', this.queryForm, () => this.submitQuery());
    this.loadDropdowns();
    this.logger.debug('ASS15070 init', [this.queryForm]);
  }

  private loadDropdowns(): void {
    this.dropdownApi
      .queryFAASSCHKMASS15070_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.subpoenaOptions = (options ?? []).map(x => ({
          label: x.label,
          value: x.value,
        }));
      });

    this.dropdownApi
      .queryPos2013({ VEN_Flag: '' })
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.supplierOptions = (options ?? []).map(x => ({
          label: x.label,
          value: x.value,
        }));
      });

    this.dropdownApi
      .queryTblUser()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.applicantOptions = (options ?? []).map(x => ({
          label: x.label,
          value: x.value,
        }));
      });
  }

  public queryFunction = (body: QueryASS15070QueryBody): Observable<ApiResponse<QueryASS15070Row[]>> => {
    const raw = this.queryForm.getRawValue();
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const payload: QueryASS15070Request = {
      CHECK_DATE_S: raw.CHECK_DATE_S ? raw.CHECK_DATE_S.toISOString() : undefined,
      CHECK_DATE_E: raw.CHECK_DATE_E ? raw.CHECK_DATE_E.toISOString() : undefined,
      SUBPOENA_ID: raw.SUBPOENA_ID || undefined,
      SUPPLIER_ID: raw.SUPPLIER_ID || undefined,
      EMP_ID: raw.EMP_ID || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body.SortBy,
    };
    const cleanPayload = removeEmptyValues(payload as Record<string, unknown>) as QueryASS15070Request;
    return this.service.queryASS15070(cleanPayload);
  };

  /** 查詢送出（表單 ngSubmit 與還原查詢狀態皆使用） */
  public submitQuery(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      this.lastQueryBody = {
        CHECK_DATE_S: raw.CHECK_DATE_S ? raw.CHECK_DATE_S.toISOString() : undefined,
        CHECK_DATE_E: raw.CHECK_DATE_E ? raw.CHECK_DATE_E.toISOString() : undefined,
        SUBPOENA_ID: raw.SUBPOENA_ID || undefined,
        SUPPLIER_ID: raw.SUPPLIER_ID || undefined,
        EMP_ID: raw.EMP_ID || undefined,
        PageSize: raw.pageSize || 30,
        PageIndex: raw.pageIndex || 1,
      } as QueryASS15070Request;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.logger.debug('onSubmit', [this.lastQueryBody]);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          }),
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
        });
    });
  }

  public onExportPdf(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const raw = this.queryForm.getRawValue();
    const pageSize = raw.pageSize ?? 30;
    const pageIndex = raw.pageIndex ?? 1;
    const meta = this.tableReport?.multiSortMeta ?? [];
    const sortBy = meta.map(m => ({ field: m.field, order: m.order }));
    const payload: QueryASS15070Request = {
      CHECK_DATE_S: raw.CHECK_DATE_S ? raw.CHECK_DATE_S.toISOString() : undefined,
      CHECK_DATE_E: raw.CHECK_DATE_E ? raw.CHECK_DATE_E.toISOString() : undefined,
      SUBPOENA_ID: raw.SUBPOENA_ID || undefined,
      SUPPLIER_ID: raw.SUPPLIER_ID || undefined,
      EMP_ID: raw.EMP_ID || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      OrderBy: sortBy[0]?.field,
      Offset: (pageIndex - 1) * pageSize,
      SortBy: sortBy.length > 0 ? sortBy : undefined,
    };
    const cleanPayload = removeEmptyValues(payload as Record<string, unknown>) as QueryASS15070Request;
    const export$ = this.service.exportPDFASS15070(cleanPayload);
    this.fileExportService
      .executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', isLoading => {
        this.exportPdfLoading = isLoading;
      })
      .subscribe();
  }
}
