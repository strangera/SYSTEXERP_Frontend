import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS15050Service } from '@service/api/ass/ass15050.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '@others/component/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map } from 'rxjs/operators';
import { CheckboxComponent } from 'src/app/pages/ass/ass15050/checkbox/checkbox.component';
import {
  QueryASS15050ApiResponse,
  QueryASS15050Request,
  QueryASS15050Response,
} from './ass15050.model';

/** 合併報表彙總列之 ACCNO（後端最後一筆） */
const SUMMARY_ACCNO_MERGED = '總計';
/** 展開報表彙總列之 ACCNO（後端最後一筆） */
const SUMMARY_ACCNO_EXPANDED = '總合計';

/** 折舊攤提表（查詢＋匯出 PDF） */
@UntilDestroy()
@Component({
  selector: 'app-ass15050',
  templateUrl: './ass15050.component.html',
  standalone: true,
  providers: [DatePipe],
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS15050Component extends BasicQueryPageComponent<QueryASS15050Response> implements OnInit {
  readonly queryForm = this.formBuilder.group({
    STYPE_D: [null as string | null],
    DEPRE_YM_S: [null as Date | null, Validators.required],
    DEPRE_YM_E: [null as Date | null, Validators.required],
    ReportType: ['1' as '1' | '2', Validators.required],
    ShowZero: [true],
    ...createPaginationConfig([]),
  });

  data: QueryASS15050Response[] = [];
  totalRecords = 0;
  exportLoading = false;

  /** 供 app-table-report 捲動載入／排序重查（含查詢條件與分頁鍵） */
  lastQueryBody: Record<string, unknown> | null = null;

  accountOptions: Option[] = [];

  readonly reportTypeOptions: { value: '1' | '2'; label: string }[] = [
    { value: '1', label: '合併' },
    { value: '2', label: '展開' },
  ];

  /** 表格 footer 綁定（避免範本重複呼叫方法） */
  footerData: Record<string, unknown> | undefined;

  readonly columns: ReportColumn[] = [
    { field: 'ACCNO', header: '會計科目編號', visible: true, align: 'left' },
    { field: 'ACCNO_NAME', header: '會計科目名稱', visible: true, align: 'left' },
    {
      field: 'ACCUM_DEPRE_AMOUNT',
      header: '累計折舊金額',
      visible: true,
      align: 'right',
      isTotal: true,
      format: (v) => (v == null || v === '' ? '' : Number(v).toLocaleString('zh-TW')),
    },
  ];

  constructor(
    private readonly service: ASS15050Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS15050', '', this.queryForm, (frm) => this.onSubmit(frm));
    this.dropdownApi
      .queryGls1005()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.accountOptions = opts ?? [];
      });
  }

  /** 組 lastQueryBody（業務條件 + 大小寫分頁鍵，供 table-report 合併） */
  private buildLastQueryBodyFromForm(): Record<string, unknown> {
    const raw = this.queryForm.getRawValue();
    const ymS = raw.DEPRE_YM_S ? this.datePipe.transform(raw.DEPRE_YM_S, 'yyyyMM') : null;
    const ymE = raw.DEPRE_YM_E ? this.datePipe.transform(raw.DEPRE_YM_E, 'yyyyMM') : null;
    const pageIndex = Number(raw.pageIndex) || 1;
    const pageSize = Number(raw.pageSize) || 30;
    const st = raw.STYPE_D != null ? String(raw.STYPE_D).trim() : '';
    const body: Record<string, unknown> = {
      DEPRE_YM_S: ymS ? parseInt(ymS, 10) : undefined,
      DEPRE_YM_E: ymE ? parseInt(ymE, 10) : undefined,
      ReportType: raw.ReportType ?? '1',
      ShowZero: raw.ShowZero ?? true,
      pageIndex: pageIndex,
      pageSize: pageSize,
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: raw.SortBy ?? [],
    };
    if (st) {
      body['STYPE_D'] = st;
    }
    return body;
  }

  /** 轉成後端 QueryASS15050Request */
  private bodyToApiRequest(body: Record<string, unknown>): QueryASS15050Request {
    const pageIndex = Number(body['pageIndex'] ?? body['PageIndex'] ?? 1) || 1;
    const pageSize = Number(body['pageSize'] ?? body['PageSize'] ?? 30) || 30;
    const req: QueryASS15050Request = {
      DEPRE_YM_S: body['DEPRE_YM_S'] as number,
      DEPRE_YM_E: body['DEPRE_YM_E'] as number,
      ReportType: (body['ReportType'] as string) ?? '1',
      ShowZero: (body['ShowZero'] as boolean) ?? true,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };
    const st = body['STYPE_D'] != null ? String(body['STYPE_D']).trim() : '';
    if (st) {
      req.STYPE_D = st;
    }
    const sortBy = body['SortBy'] as QueryASS15050Request['SortBy'];
    if (sortBy && Array.isArray(sortBy) && sortBy.length > 0) {
      req.SortBy = sortBy;
    }
    return req;
  }

  /** 將 API 回應轉成表格列、總筆數、footer（彙總列僅在目前頁有資料時顯示） */
  private mapResponseToTableData(
    res: QueryASS15050ApiResponse,
    reportType: '1' | '2',
  ): {
    rows: QueryASS15050Response[];
    totalCount: number;
    footerData: Record<string, unknown> | undefined;
  } {
    if (res?.Status !== '0000' || !res.Data) {
      return { rows: [], totalCount: 0, footerData: undefined };
    }
    const details = res.Data.Details ?? [];
    const mapped = details.map((row, i) => {
      const amt = row.TOTAL_DEPRE_AMOUNT ?? row.PERIOD_DEPRE_AMOUNT ?? null;
      return {
        ...row,
        ROW_UID: `${row.ACCNO ?? ''}_${row.ASSET_ID ?? ''}_${i}`,
        ACCUM_DEPRE_AMOUNT: amt,
      };
    });
    const summaryRow = this.findSummaryRow(mapped, reportType);
    const rows = this.filterSummaryRows(mapped).map((row, i) => ({
      ...row,
      ROW_UID: `${row.ACCNO ?? ''}_${row.ASSET_ID ?? ''}_${i}`,
    }));
    const totalCount =
      typeof res.Data.TotalRows === 'number'
        ? res.Data.TotalRows
        : typeof res.TotalCount === 'number'
          ? res.TotalCount
          : rows.length;
    const footerData = this.buildFooterFromSummaryRow(summaryRow?.TOTAL_DEPRE_AMOUNT);
    return { rows, totalCount, footerData };
  }

  /** 供 app-table-report：捲動載入更多／排序後重查 */
  queryASS15050ForReport = (body: Record<string, unknown>) => {
    const req = this.bodyToApiRequest(body);
    return this.service.queryASS15050(req).pipe(
      map((res: QueryASS15050ApiResponse) => {
        const rt = (body?.['ReportType'] ?? this.queryForm.getRawValue().ReportType ?? '1') as '1' | '2';
        if (res?.Status !== '0000' || !res.Data) {
          this.footerData = undefined;
          return { Data: [] as QueryASS15050Response[], TotalCount: 0 };
        }
        const { rows, totalCount, footerData } = this.mapResponseToTableData(res, rt);
        this.footerData = footerData;
        return { Data: rows, TotalCount: totalCount };
      }),
    );
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.queryForm.patchValue({ pageIndex: 1 });
      const body = this.buildLastQueryBodyFromForm();
      this.lastQueryBody = { ...body };
      this.loading = true;
      this.service
        .queryASS15050(this.bodyToApiRequest(body))
        .pipe(finalize(() => (this.loading = false)))
        .subscribe((res: QueryASS15050ApiResponse) => {
          const reportType = (frm.getRawValue().ReportType ?? '1') as '1' | '2';
          if (res?.Status === '0000' && res.Data) {
            const { rows, totalCount, footerData } = this.mapResponseToTableData(res, reportType);
            this.data = rows;
            this.totalRecords = totalCount;
            this.footerData = footerData;
            this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          } else {
            this.data = [];
            this.totalRecords = 0;
            this.footerData = undefined;
            this.lastQueryBody = null;
            if (res?.Status && res.Status !== '0000') {
              this.messageService.warnBubble(res.Message || '查無資料或查詢失敗');
            }
          }
        });
    });
  }

  /** 與 table-report 內部資料同步（捲動載入後父層 data 才會更新） */
  onTableDataChange(rows: QueryASS15050Response[]): void {
    this.data = rows;
  }

  /** PDF 匯出不帶分頁／排序參數 */
  private buildExportBodyFromLastQuery(): QueryASS15050Request | null {
    if (!this.lastQueryBody) {
      return null;
    }
    const lastQueryBody = this.lastQueryBody as Record<string, unknown>;;
    const out: QueryASS15050Request = {
      DEPRE_YM_S: lastQueryBody['DEPRE_YM_S'] as number,
      DEPRE_YM_E: lastQueryBody['DEPRE_YM_E'] as number,
      ReportType: (lastQueryBody['ReportType'] as string) ?? '1',
      ShowZero: (lastQueryBody['ShowZero'] as boolean) ?? true,
    };
    const st = lastQueryBody['STYPE_D'] != null ? String(lastQueryBody['STYPE_D']).trim() : '';
    if (st) {
      out.STYPE_D = st;
    }
    return out;
  }

  /**
   * 尋找 API 回傳之彙總列：優先由後往前比對目前報表型式對應之 ACCNO，找不到再全陣列搜尋。
   */
  private findSummaryRow(rows: QueryASS15050Response[], reportType: '1' | '2'): QueryASS15050Response | undefined {
    const expected = reportType === '1' ? SUMMARY_ACCNO_MERGED : SUMMARY_ACCNO_EXPANDED;
    const matchExpected = (r: QueryASS15050Response) => (r.ACCNO ?? '').trim() === expected;

    for (let i = rows.length - 1; i >= 0; i--) {
      if (matchExpected(rows[i])) {
        return rows[i];
      }
    }
    for (const r of rows) {
      if (matchExpected(r)) {
        return r;
      }
    }
    return undefined;
  }

  /** 表格本體不顯示彙總列（與 footer 分離） */
  private filterSummaryRows(rows: QueryASS15050Response[]): QueryASS15050Response[] {
    return rows.filter((r) => {
      const a = (r.ACCNO ?? '').trim();
      return a !== SUMMARY_ACCNO_MERGED && a !== SUMMARY_ACCNO_EXPANDED;
    });
  }

  private buildFooterFromSummaryRow(totalDepre: number | null | undefined): Record<string, unknown> | undefined {
    if (totalDepre === null || totalDepre === undefined) {
      return undefined;
    }
    const footer: Record<string, unknown> = {};
    for (const col of this.columns) {
      if (col?.isTotal) {
        footer[col.field] = totalDepre;
      }
    }
    return footer;
  }

  onExportPdf(): void {
    if (this.queryForm.invalid) {
      this.submitted = true;
      this.messageService.warnBubble('請填寫折舊年限起訖與報表型式');
      return;
    }
    const body = this.buildExportBodyFromLastQuery();
    if (!body) {
      this.messageService.warnBubble('請先執行查詢');
      return;
    }
    const export$ = this.service.exportPDFASS15050(body);
    this.fileExportService
      .executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (v) => (this.exportLoading = v))
      .subscribe();
  }
}
