/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import {
  createPaginationConfig,
  formatDateToYYYY_MM_DD,
} from '../../../shared/componentkit/table/table.model';

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
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

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
type SortItem = { field: string; order: number };

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
    InputTextComponent,
    // InputTextRangeComponent,
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

  // 固定欄位 (對應後端回傳欄位)
  columns: ReportColumn[] = [
    { field: 'ARS_Date', header: '立帳日期' , format: (v: string) => this.formatDate(v)},
    { field: 'VEN_No', header: '客戶代號' },
    { field: 'VEN_Name', header: '客戶名稱' },
    { field: 'ARS_No', header: '帳款單號' },
    { field: 'AccNo', header: '科目代號' },
    { field: 'ARS_Amt', header: '帳款金額', format: this.moneyFormat.bind(this) },
    { field: 'REC_Amt', header: '收款金額', format: this.moneyFormat.bind(this) },
    { field: 'ADJ_Amt', header: '調整金額', format: this.moneyFormat.bind(this) },
    { field: 'Unpaid_Amt', header: '未收金額', format: this.moneyFormat.bind(this) },
  ];

  private moneyFormat(value: number): string {
    return value != null ? Number(value || 0).toLocaleString('en-US') : '0';
  }

  readonly defaultSort: SortItem[] = [{ field: 'ARS_Date', order: 1 }];

  // 單選選項 (字串型別，以後端為主，例如 1:顯示 / 2:不顯示)
  showFlagOptions: any[] = [
    { value: '1', label: '顯示' },
    { value: '2', label: '不顯示' },
  ];

  /* ----------------- 表單 ----------------- */
  queryForm = this.formBuilder.group({
    // 後端欄位命名
    VEN_No: [null as string | null],         // 客戶/廠商代號
    AccNo: [null as string | null],          // 科目代號

    ARSDateFrom: [null as Date | null],
    ARSDateTo: [null as Date | null],

    ShowArsAmt: ['1' as string],             // 應收金額是否顯示
    ShowZeroAmt: ['1' as string],            // 帳款餘額為零是否顯示

    // 分頁 & 排序 (TableReport 用，仍維持 pageIndex/pageSize/SortBy)
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
          x && typeof x.field === 'string' && typeof x.order === 'number'
      )
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

    private formatDate(val: string): string {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  }

  /** 把畫面上的 form/body 轉成後端需要的 Fin34010Request (命名以後端為主) */
  private buildPayload(base: any): Fin34010Request {
    const payload: Fin34010Request = {
      // 分頁：TableReport / onSubmit 傳進來的是 pageIndex/pageSize，轉成 PageIndex/PageSize
      PageIndex:
        Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
          ? base.pageIndex
          : 1,
      PageSize:
        Number.isFinite(base?.pageSize) && base.pageSize > 0
          ? base.pageSize
          : 30,
      SortBy: this.normalizeSort(base?.SortBy, this.defaultSort),

      // 查詢條件：完全以後端命名為主
      ARSDateFrom: this.toYMDOrUndef(base?.ARSDateFrom),
      ARSDateTo: this.toYMDOrUndef(base?.ARSDateTo),
      VEN_No: base?.VEN_No || undefined,
      AccNo: base?.AccNo || undefined,
      ShowArsAmt: base?.ShowArsAmt || undefined,
      ShowZeroAmt: base?.ShowZeroAmt || undefined,
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  /** 匯出用：沿用查詢條件，但移除 PageIndex/PageSize */
  private buildExportPayload(): Fin34010Request {
    const base = this.queryForm.getRawValue();
    const payload = this.buildPayload(base);
    delete payload.PageIndex;
    delete payload.PageSize;
    return payload;
  }

  /* ----------------- 給 <app-table-report> 的查詢函式 ----------------- */
  public queryFIN34010ForReport = (body: any) =>
    this.fin34010Service
      .queryFIN34010(this.buildPayload(body || {}))
      .pipe(
        map((res: ApiResponse<Fin34010Row[]>) => {
          const rows: Fin34010Row[] = Array.isArray(res?.Data) ? res.Data : [];
          const totalCount =
            Number(res?.TotalCount ?? rows.length) || rows.length;

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
      '/FIN3000/FIN34010CRU', // 若未來有 CRU 頁，再依實際路徑調整
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
    payload.PageIndex = 1; // 查詢從第一頁開始

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
          const rows: Fin34010Row[] = Array.isArray(response?.Data)
            ? response.Data
            : [];

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
      VEN_No: null,
      AccNo: null,
      ARSDateFrom: null,
      ARSDateTo: null,
      ShowArsAmt: '1',
      ShowZeroAmt: '1',
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
  }

  /* ----------------- 匯出檔案共用工具 ----------------- */
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

  // 匯出按鈕 loading 狀態
  btnExportExcelLoading = false;
  btnExportPdfLoading = false;

  /* ----------------- 匯出：Excel ----------------- */
  downloadFIN34010Excel(): void {
    const payload = this.buildExportPayload();
    const defaultName = 'FIN34010_應收帳款明細表.xlsx';

    this.btnExportExcelLoading = true;

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
        this.btnExportExcelLoading = false;
      });
  }

  /* ----------------- 匯出：PDF ----------------- */
  downloadFIN34010PDF(): void {
    const payload = this.buildExportPayload();
    const defaultName = 'FIN34010_應收帳款明細表.pdf';

    this.btnExportPdfLoading = true;

    this.fin34010Service
      .exportFIN34010PDF(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          this.saveBlob(res, defaultName);
        },
        error: (err: any) => {
          console.error('FIN34010 PDF export error:', err);
        },
      })
      .add(() => {
        this.btnExportPdfLoading = false;
      });
  }
}
