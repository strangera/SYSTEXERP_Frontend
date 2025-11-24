/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, formatDateToYYYY_MM_DD } from '../../../shared/componentkit/table/table.model';

// UI
import { TranslateModule } from '@ngx-translate/core';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';

// Service & 型別
import {
  Fin34010Service,
  ApiResponse,
  Fin34010Row,
  Fin34010Request,
} from '../../../service/api/fin/fin34010.service';

// until-destroy
import { HttpResponse } from '@angular/common/http';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

// 排序欄位型別
type SortItem = { field: string; order: 1 | -1 };

@UntilDestroy()
@Component({
  selector: 'app-fin34010',
  templateUrl: './fin34010.component.html',
  styleUrl: './fin34010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextRangeComponent,
    CalendarRangeComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    ButtonModule,
  ],
})
export class FIN34010Component extends BasicQueryPageComponent<any> {
  /* ----------------- 狀態 ----------------- */
  data: Fin34010Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: Fin34010Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;
  tableVer = 0;

  // 固定欄位
  columns: ReportColumn[] = [
    { field: 'FactoryID', header: '廠客代號' },
    { field: 'FactoryName', header: '廠客名稱' },
    { field: 'SubjectName', header: '科目名稱' },
    { field: 'EstablishDate', header: '立帳日期' },
    { field: 'AccountAmt', header: '帳款金額', format: this.moneyFormat.bind(this) },
    { field: 'PayAmt', header: '收/付款金額', format: this.moneyFormat.bind(this) },
    { field: 'AdjustAmt', header: '調整金額', format: this.moneyFormat.bind(this) },
    { field: 'BalanceAmt', header: '未收/付金額', format: this.moneyFormat.bind(this) },
  ];

  private moneyFormat(value: number): string {
    return value != null ? Number(value || 0).toLocaleString('en-US') : '0';
  }

  readonly defaultSort: SortItem[] = [{ field: 'FactoryID', order: 1 }];

  // 單選選項
  showUpOptions: any[] = [
    { value: 1, label: '顯示' },
    { value: 2, label: '不顯示' },
  ];

  /* ----------------- 表單 ----------------- */
  queryForm = this.formBuilder.group({
    startFactoryID: [null as string | null],
    endFactoryID: [null as string | null],

    startEstablishDate: [null as Date | null],
    endEstablishfDate: [null as Date | null],

    startSubjectID: [null as string | null],
    endSubjectID: [null as string | null],

    display: [1 as number], // 應付金額是否顯示
    showUp: [1 as number], // 帳款餘額為零是否顯示

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin34010Service: Fin34010Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  /* ----------------- 工具 ----------------- */
  private toYMDOrUndef(
    d: Date | string | null | undefined
  ): string | undefined {
    if (d == null) return undefined;
    const s = formatDateToYYYY_MM_DD(d as Date | string) as
      | string
      | null
      | undefined;
    return s == null || s === '' ? undefined : s;
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

  private buildPayload(base: any): Fin34010Request {
    const payload: Fin34010Request = {
      startFactoryID: base?.startFactoryID || undefined,
      endFactoryID: base?.endFactoryID || undefined,
      startEstablishDate: this.toYMDOrUndef(base?.startEstablishDate),
      endEstablishDate: this.toYMDOrUndef(base?.endEstablishfDate),
      startSubjectID: base?.startSubjectID || undefined,
      endSubjectID: base?.endSubjectID || undefined,
      display: base?.display,
      showUp: base?.showUp,
      pageIndex:
        Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
          ? base.pageIndex
          : 1,
      pageSize:
        Number.isFinite(base?.pageSize) && base.pageSize > 0
          ? base.pageSize
          : 20,
      SortBy: this.normalizeSort(base?.SortBy, this.defaultSort),
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  /** 匯出用：沿用查詢條件，但移除 pageIndex/pageSize */
  private buildExportPayload(): Fin34010Request {
    const base = this.queryForm.getRawValue();
    const payload = this.buildPayload(base);
    delete payload.pageIndex;
    delete payload.pageSize;
    return payload;
  }

  /* ----------------- 給 <app-table-report> 的查詢函式 ----------------- */
  public queryFIN34010ForReport = (body: any) =>
    this.fin34010Service
      .queryFIN34010({ ...(body || {}) })
      .pipe(
        map((res: ApiResponse<Fin34010Row[]>) => {
          const dataAny = res?.Data as any;
          const rowsRaw = dataAny?.Rows ?? dataAny ?? [];
          const rows: Fin34010Row[] = Array.isArray(rowsRaw) ? rowsRaw : [];

          const totalCount =
            Number(res?.TotalCount ?? dataAny?.TotalCount ?? rows.length) ||
            rows.length;

          // 如果要做 footerData / GrandTotal，可以在這裡額外處理
          return {
            Data: rows,
            TotalCount: totalCount,
            GrandTotal: null,
          };
        })
      );

  /* ----------------- Init ----------------- */
  ngOnInit(): void {
    this.initializePage(
      'FIN34010',
      '/FIN3000/FIN34010CRU',
      this.queryForm,
      (form) => this.onSubmit(form)
    );
  }

  /* ----------------- Submit ----------------- */
  onSubmit(frm: FormGroup) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildPayload(raw);
    payload.pageIndex = 1;

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.fin34010Service
      .queryFIN34010(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Fin34010Row[]>) => {
          const dataAny = response?.Data as any;
          const rowsRaw = dataAny?.Rows ?? dataAny ?? [];
          const rows: Fin34010Row[] = Array.isArray(rowsRaw) ? rowsRaw : [];

          this.data = rows;
          this.viewTotalRecords = this.data.length;
          this.cdr.detectChanges();

          const realTotal =
            Number(response?.TotalCount ?? rows.length) || rows.length;
          setTimeout(() => {
            this.totalRecords = realTotal;
            this.viewTotalRecords = realTotal;
            this.lastQueryBody = { ...payload };
          });

          this.queryStateService.setQueryState(
            this.ProgNo,
            this.queryForm.value
          );
          this.loading = false;
        },
        error: (err: any) => {
          console.error('FIN34010 API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
          this.loading = false;
        },
      });
  }

  onClear(frm: FormGroup) {
    frm.reset({
      startFactoryID: null,
      endFactoryID: null,
      startEstablishDate: null,
      endEstablishfDate: null,
      startSubjectID: null,
      endSubjectID: null,
      display: 1,
      showUp: 1,
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
  }

  /* ----------------- 匯出：Excel ----------------- */
  private getFilenameFromResponse(
    res: HttpResponse<Blob>,
    fallback: string
  ): string {
    const cd =
      res.headers.get('Content-Disposition') ||
      res.headers.get('content-disposition');
    if (!cd) return fallback;
    const match =
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
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

  downloadFIN34010Excel(): void {
    const payload = this.buildExportPayload();
    const defaultName = 'FIN34010_應收帳款明細表.xlsx';

    this.btnExportLoading = true;

    this.fin34010Service
      .exportFIN34010Excel(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          this.saveBlob(res, defaultName);
        },
        error: (err: any) => {
          console.error('FIN34010 Excel export error:', err);
        },
      })
      .add(() => {
        this.btnExportLoading = false;
      });
  }

  // 匯出按鈕用
  btnExportLoading = false;
}
