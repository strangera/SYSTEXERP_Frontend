/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { KeyFilterPattern } from 'primeng/keyfilter';
import { filter, map } from 'rxjs/operators';

// UI
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';
import { ColumnGroup, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// Service & 型別
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import {
  Fin34040Request,
  Fin34040Response,
  Fin34040Service,
  SortItem,
} from '../../../service/api/fin/fin34040.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

@UntilDestroy()
@Component({
  selector: 'app-fin34040',
  templateUrl: './fin34040.component.html',
  styleUrl: './fin34040.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    ButtonModule,
    MenubarComponent,
    ButtonComponent,
    CalendarRangeComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    RadiobuttonComponent,
    TableReportComponent,
  ],
})
export class FIN34040Component extends BasicQueryPageComponent<any> implements OnInit {
  /* ----------------- 狀態 ----------------- */
  data: Fin34040Response[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: Fin34040Response[] = [];
  lastQueryBody: any = null;
  tableVer = 0;

  /** 預設排序 */
  readonly defaultSort: SortItem[] = [{ field: 'VEN_No', order: 1 }];

  /** 欄位定義（依後端回傳調整） */
  columnGroup: ColumnGroup[] = [
    { field: 'Expired', header: '已到期' },
    { field: 'Unexpired', header: '未到期' },
  ]
  columns: ReportColumn[] = [];

  /* ----------------- 下拉選項 ----------------- */
  /** 分析日期別 */
  analysisDateTypeOptions = [
    { value: '1', label: '預計收款日' },
    { value: '2', label: '立帳日' },
  ];

  /** 廠客代號（從 API 載入） */
  vendorOptions: any[] = [];

  /** 科目代號（從 API 載入） */
  accNoOptions: any[] = [];

  /** 已到期/未到期 */
  dueStatusOptions = [
    { value: '1', label: '已到期' },
    { value: '2', label: '未到期' },
  ];

  /** 顯示金額/百分比 */
  showAmountTypeOptions = [
    { value: 'Y', label: '顯示' },
    { value: 'N', label: '不顯示' },
  ];

  /** 允許輸入類型: 正整數 */
  keyFilterInt: KeyFilterPattern = 'pint';

  /* ----------------- 表單 ----------------- */
  queryForm = this.formBuilder.group({
    /** 分析日期（必填） */
    AnalysisDate: [null as Date | null, [Validators.required]],
    /** 分析區間（必填） */
    AnalysisInterval: [null as number | null, [Validators.required]],
    /** 分析期數（必填） */
    AnalysisPeriod: [null as number | null, [Validators.required]],
    /** 分析日期別 */
    AnalysisDateType: [null as string | null],
    /** 廠客代號 */
    VEN_No: [null as string | null],
    /** 立帳日期區間 */
    DocDateFrom: [null as Date | null],
    DocDateTo: [null as Date | null],
    /** 收款日期（必填） */
    RCV_Date: [null as Date | null, [Validators.required]],
    /** 科目代號 */
    AccNo: [null as string | null],
    /** 已到期/未到期 */
    DueStatus: [null as string | null],
    /** 是否顯示金額/總計(%) */
    ShowAmountType: ['Y' as string],

    // 分頁排序
    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin34040Service: Fin34040Service,
    private dropdownApi: DropdownApiService
  ) {
    super();
  }

  /* ----------------- 工具方法 ----------------- */
  private moneyFormat(value: number | string): string {
    if (value == null || value === '') return '0';
    const num =
      typeof value === 'string'
        ? Number(value.replace(/,/g, ''))
        : Number(value);
    return Number.isFinite(num) ? num.toLocaleString('en-US') : '0';
  }

  private toISODateOrNull(d: Date | string | null | undefined): string | null {
    if (d == null) return null;
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter(
        (x) =>
          x && typeof x.field === 'string' && (x.order === 1 || x.order === -1)
      )
      .map((x) => ({ field: String(x.field), order: x.order as 1 | -1 }));
    return cleaned.length ? cleaned : fallback;
  }

  /** 建立查詢條件 payload */
  private buildPayload(base: any): Fin34040Request {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
        ? base.pageIndex
        : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base.pageSize > 0
        ? base.pageSize
        : 30;

    const payload: Fin34040Request = {
      AnalysisDate: this.toISODateOrNull(base?.AnalysisDate),
      AnalysisInterval: base?.AnalysisInterval ?? null,
      AnalysisPeriod: base?.AnalysisPeriod ?? null,
      AnalysisDateType: base?.AnalysisDateType || null,
      VEN_No: base?.VEN_No || null,
      DocDateFrom: this.toISODateOrNull(base?.DocDateFrom),
      DocDateTo: this.toISODateOrNull(base?.DocDateTo),
      RCV_Date: this.toISODateOrNull(base?.RCV_Date),
      AccNo: base?.AccNo || null,
      DueStatus: base?.DueStatus || null,
      ShowAmountType: base?.ShowAmountType || 'Y',
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: this.normalizeSort(base?.SortBy, this.defaultSort),
    };

    // 移除空值
    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  /** 匯出用：移除分頁參數 */
  private buildExportPayload(): Fin34040Request {
    const base = this.queryForm.getRawValue();
    const payload = this.buildPayload(base);
    delete payload.PageIndex;
    delete payload.PageSize;
    return payload;
  }

  /** 解析 API Response */
  private mapRowsFromResponse(res: ApiResponse<Fin34040Response[]>): Fin34040Response[] {
    const list = res?.Data ?? [];
    return Array.isArray(list) ? list : [];
  }

  /* ----------------- TableReport 查詢函式 ----------------- */
  public queryFIN34040ForReport = (body: any) =>
    this.fin34040Service.queryFIN34040(this.buildPayload(body || {})).pipe(
      map((res: ApiResponse<Fin34040Response[]>) => {
        const rows = this.mapRowsFromResponse(res);
        const totalCount = Number(res?.TotalCount ?? rows.length) || rows.length;
        return {
          Data: rows,
          TotalCount: totalCount,
        };
      })
    );

  /* ----------------- Init ----------------- */
  ngOnInit(): void {
    this.initializePage('FIN34040', '', this.queryForm, (form) =>
      this.onSubmit(form)
    );

    // 載入廠客代號下拉
    this.dropdownApi
      .queryPos2013({ VEN_Flag: '1' })
      .pipe(untilDestroyed(this))
      .subscribe((items) => {
        this.vendorOptions = (items || []).map((item) => ({
          label: `${item['VEN_No']} - ${item['Name']}`,
          value: item['VEN_No'],
        }));
      });

    // 載入科目代號下拉（若有此 API）
    this.dropdownApi
      .queryGls1005()
      .pipe(filter(data => !!data))
      .pipe(untilDestroyed(this))
      .subscribe((items: any[]) => {
        this.accNoOptions = (items || []).map((item) => ({
          label: `${item['AccNo'] ?? item['No'] ?? ''} - ${item['AccCName'] ?? item['Name'] ?? ''}`,
          value: item['AccNo'] ?? item['No'] ?? '',
        }));
      });
  }

  /* ----------------- Submit ----------------- */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSubmit(_frm: FormGroup) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildPayload(raw);

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.fin34040Service
      .queryFIN34040(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Fin34040Response[]>) => {
          const rows = this.mapRowsFromResponse(response);

          this.data = rows;

          const realTotal =
            Number(response?.TotalCount ?? rows.length) || rows.length;
          this.totalRecords = realTotal;
          this.viewTotalRecords = realTotal;

          this.lastQueryBody = { ...raw };

          this.queryStateService.setQueryState(
            this.ProgNo,
            this.queryForm.value
          );
          this.loading = false;

          // TODO: 等 API 規格完成後調整
          const expiredList: string[] = ["2025/04/01", "2025/04/02", "2025/04/03"];
          const unexpiredList: string[] = ["2026/01/01", "2026/01/02", "2026/01/03"];

          this.columns = [
            { field: 'VEN_No', header: '廠商代號' },
            { field: 'VEN_Name', header: '廠商名稱' },

            ...expiredList.map(key => ({
              field: `Date_${key}`,
              header: key,
              format: this.moneyFormat.bind(this),
              groupField: 'Expired',
            })),

            ...unexpiredList.map(key => ({
              field: `Date_${key}`,
              header: key,
              format: this.moneyFormat.bind(this),
              groupField: 'Unexpired',
            })),

            { field: 'Total', header: '總計', format: this.moneyFormat.bind(this), isTotal: true }
          ]
        },
        error: (err: any) => {
          console.error('FIN34040 API Error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.loading = false;
        },
      });
  }

  onClear(frm: FormGroup) {
    frm.reset({
      AnalysisDate: null,
      AnalysisInterval: null,
      AnalysisPeriod: null,
      AnalysisDateType: null,
      VEN_No: null,
      DocDateFrom: null,
      DocDateTo: null,
      RCV_Date: null,
      AccNo: null,
      DueStatus: null,
      ShowAmountType: 'Y',
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
  }

  /* ----------------- 匯出檔案工具 ----------------- */
  private getFilenameFromResponse(
    res: HttpResponse<Blob>,
    fallback: string
  ): string {
    const cd =
      res.headers.get('Content-Disposition') ||
      res.headers.get('content-disposition');
    if (!cd) return fallback;
    const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
    if (!match || !match[1]) return fallback;
    return decodeURIComponent(match[1].replace(/['"]/g, ''));
  }

  private saveBlob(res: HttpResponse<Blob>, defaultName: string) {
    const blob = new Blob([res.body as Blob], {
      type: res.body?.type || 'application/octet-stream',
    });
    const fileName = this.getFilenameFromResponse(res, defaultName);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // 匯出按鈕 loading 狀態
  btnExportExcelLoading = false;
  btnExportPdfLoading = false;

  /* ----------------- 匯出：Excel ----------------- */
  downloadFIN34040Excel(): void {
    const payload = this.buildExportPayload();
    const defaultName = 'FIN34040_帳齡分析表.xlsx';

    this.btnExportExcelLoading = true;

    this.fin34040Service
      .exportFIN34040Excel(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          this.saveBlob(res, defaultName);
        },
        error: (err: any) => {
          console.error('FIN34040 Excel export error:', err);
        },
      })
      .add(() => {
        this.btnExportExcelLoading = false;
      });
  }

  /* ----------------- 匯出：PDF ----------------- */
  downloadFIN34040PDF(): void {
    const payload = this.buildExportPayload();
    const defaultName = 'FIN34040_帳齡分析表.pdf';

    this.btnExportPdfLoading = true;

    this.fin34040Service
      .exportFIN34040PDF(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          this.saveBlob(res, defaultName);
        },
        error: (err: any) => {
          console.error('FIN34040 PDF export error:', err);
        },
      })
      .add(() => {
        this.btnExportPdfLoading = false;
      });
  }
}
