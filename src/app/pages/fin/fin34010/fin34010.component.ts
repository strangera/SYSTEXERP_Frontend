/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize, map } from 'rxjs/operators';

import {
  createPaginationConfig,
  formatDateToYYYY_MM_DD,
} from '../../../shared/componentkit/table/table.model';

// UI
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
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
  ApiResponse,
  Fin34010Row,
  Fin34010Service,
} from '../../../service/api/fin/fin34010.service';

// until-destroy
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';

interface SortItem { field: string; order: number }

@UntilDestroy()
@Component({
  selector: 'app-fin34010',
  templateUrl: './fin34010.component.html',
  styleUrl: './fin34010.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    DropdownComponent,
    ButtonModule,
  ],
})
export class FIN34010Component extends BasicQueryPageComponent<any> implements OnInit {
  /* ----------------- 狀態 ----------------- */
  data: Fin34010Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: Fin34010Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;

  AccNo_ParamOptions = this.dropDown.queryGls1005();
  tableVer = 0;
  venNoOptions: any[] = [];

  readonly pageSizeFixed = 30;

  columns: ReportColumn[] = [];

  private allColumns: ReportColumn[] = [
    {
      field: 'ARS_Date',
      header: '立帳日期',
      format: (v: string) => this.formatDate(v),
    },
    { field: 'VEN_No', header: '客戶代號' },
    { field: 'VEN_Name', header: '客戶名稱' },
    { field: 'ARS_No', header: '帳款單號' },
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目名稱' },
    {
      field: 'ARS_Amt',
      header: '帳款金額',
      format: this.moneyFormat.bind(this),
      isTotal: true,
    },
    {
      field: 'REC_Amt',
      header: '收款金額',
      format: this.moneyFormat.bind(this),
      isTotal: true,
    },
    {
      field: 'ADJ_Amt',
      header: '調整金額',
      format: this.moneyFormat.bind(this),
      isTotal: true,
    },
    {
      field: 'Unpaid_Amt',
      header: '未收金額',
      format: this.moneyFormat.bind(this),
      isTotal: true,
    },
  ];

  readonly defaultSort: SortItem[] = [{ field: 'ARS_Date', order: 1 }];
  private _currentSortBy: SortItem[] = this.defaultSort;

  showFlagOptions: any[] = [
    { value: 'Y', label: '顯示' },
    { value: 'N', label: '不顯示' },
  ];

  queryForm = this.formBuilder.group({
    VEN_No: [null as string | null],
    AccNo: [null as string | null],
    ARSDateFrom: [null as Date | null],
    ARSDateTo: [null as Date | null],
    ShowArsAmt: ['Y' as string],
    ShowZeroAmt: ['Y' as string],

    ...createPaginationConfig(this.defaultSort),
  });

  btnExportExcelLoading = false;
  btnExportPdfLoading = false;

  constructor(
    private fin34010Service: Fin34010Service,
    private dropDownListService: DropDownListService,
    private readonly dropDown: DropdownApiService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  /* ----------------- 工具 ----------------- */

  private updateColumns(): void {
    const showArsAmt = this.queryForm.get('ShowArsAmt')?.value;

    this.columns = this.allColumns.filter((col) => {
      if (col.field === 'ARS_Amt' && showArsAmt === 'N') {
        return false;
      }
      return true;
    });
  }

  private moneyFormat(value: number | string): string {
    if (value == null || value === '') return '0';
    const num =
      typeof value === 'string'
        ? Number(value.replace(/,/g, ''))
        : Number(value);
    return Number.isFinite(num) ? num.toLocaleString('en-US') : '0';
  }

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
    const cleaned: SortItem[] = asArr
      .filter(
        (x) =>
          x &&
          typeof x.field === 'string' &&
          typeof x.order === 'number'
      )
      .map((x) => ({
        field: String(x.field),
        order: Number(x.order) || 1,
      }));

    return cleaned.length ? cleaned : fallback;
  }

  private formatDate(val: string): string {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}/${m}/${dd}`;
  }

  protected loadDropdownOptions(): void {
    this.dropDownListService
      .queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const list = Array.isArray(res?.Data) ? res.Data : [];
        this.venNoOptions = list.map((x: any) => ({
          label: `${x.VEN_No} - ${x.Name}`,
          value: x.VEN_No,
        }));
      });
  }

  /**
   * 共用 payload builder
   * 查詢、table-report lazy load、匯出都走這裡
   */
  private buildPayload(base: any): any {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && Number(base.pageIndex) >= 1
        ? Number(base.pageIndex)
        : 1;

    const pageSize =
      Number.isFinite(base?.pageSize) && Number(base.pageSize) > 0
        ? Number(base.pageSize)
        : this.pageSizeFixed;

    const payload: any = {
      pageIndex,
      pageSize,
      SortBy: this.normalizeSort(base?.SortBy, this.defaultSort),

      ARSDateFrom: this.toYMDOrUndef(base?.ARSDateFrom),
      ARSDateTo: this.toYMDOrUndef(base?.ARSDateTo),

      // VEN_No_From: base?.VEN_No || undefined,
      VEN_No: base?.VEN_No || undefined,
      // AccNoList: base?.AccNo || undefined,
      AccNo: base?.AccNo || undefined,

      ShowArsAmt: base?.ShowArsAmt || undefined,
      ShowZeroAmt: base?.ShowZeroAmt || undefined,
    };

    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v == null) delete payload[k];
    });

    return payload;
  }

  /**
   * 匯出 payload：
   * 跟查詢傳一樣，只是不傳 pageIndex / pageSize
   */
  private buildExportPayload(): any {
    const base = this.lastQueryBody
      ? { ...this.lastQueryBody }
      : {
        ...this.queryForm.getRawValue(),
        SortBy: this._currentSortBy || this.defaultSort,
      };

    const payload = this.buildPayload(base);

    delete payload.pageIndex;
    delete payload.pageSize;

    return payload;
  }

  private buildFooterFromSummary(summary: any | null | undefined): any {
    if (!summary) return undefined;

    return {
      ARS_Amt: summary.SumARS_Amt ?? 0,
      REC_Amt: summary.SumREC_Amt ?? 0,
      ADJ_Amt: summary.SumADJ_Amt ?? 0,
      Unpaid_Amt: summary.SumUnpaid_Amt ?? 0,
    };
  }

  private mapRowsFromResponse(res: ApiResponse<any>): Fin34010Row[] {
    const dataAny = res?.Data as any;
    const listRaw = dataAny?.List ?? dataAny ?? [];
    const list = Array.isArray(listRaw) ? listRaw : [];

    return list.map((r: any, idx: number) => ({
      ...r,
      _rowKey: `${r.ARS_No ?? ''}|${r.VEN_No ?? ''}|${idx}`,
    }));
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState(this.ProgNo, {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  /* ----------------- 給 <app-table-report> 的查詢函式 ----------------- */

  public queryFIN34010ForReport = (body: any) =>
    this.fin34010Service.queryFIN34010(this.buildPayload(body || {})).pipe(
      map((res: ApiResponse<any>) => {
        const rows = this.mapRowsFromResponse(res);
        const dataAny = res?.Data as any;
        const summary = dataAny?.Summary ?? null;

        const idx = Number(body?.pageIndex ?? 1);
        if (idx === 1) {
          this.footerData = this.buildFooterFromSummary(summary);
        }

        const totalFromApi =
          Number(res?.TotalCount ?? dataAny?.TotalCount ?? 0) || 0;

        const totalCount =
          rows.length === 0
            ? this.data?.length ?? 0
            : totalFromApi || rows.length;

        return {
          Data: rows,
          TotalCount: totalCount,
          GrandTotal: summary,
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

    this.loadDropdownOptions();

    this.updateColumns();

    this.queryForm
      .get('ShowArsAmt')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe(() => {
        this.updateColumns();
        this.tableVer++;
        this.cdr.detectChanges();
      });
  }

  /* ----------------- Submit ----------------- */

  onSubmit(frm: FormGroup) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();

    const payload = this.buildPayload({
      ...raw,
      pageIndex: 1,
      pageSize: this.pageSizeFixed,
      SortBy: raw?.SortBy || this._currentSortBy || this.defaultSort,
    });

    payload.pageIndex = 1;
    payload.pageSize = this.pageSizeFixed;

    this._currentSortBy = payload.SortBy ?? this.defaultSort;

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
        next: (response: ApiResponse<any>) => {
          const rows = this.mapRowsFromResponse(response);
          const dataAny = response?.Data as any;
          const summary = dataAny?.Summary ?? null;

          this.data = rows;
          this.footerData = this.buildFooterFromSummary(summary);

          const realTotal =
            Number(
              response?.TotalCount ?? dataAny?.TotalCount ?? rows.length
            ) || rows.length;

          this.totalRecords = realTotal;
          this.viewTotalRecords = realTotal;

          this.lastQueryBody = {
            ...raw,
            ...payload,
            pageIndex: 1,
            pageSize: this.pageSizeFixed,
            SortBy: payload.SortBy ?? this.defaultSort,
          };

          this.saveQueryState();

          this.cdr.detectChanges();
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
      ShowArsAmt: 'Y',
      ShowZeroAmt: 'Y',
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
    this.selectedItems = [];

    this._currentSortBy = this.defaultSort;
    this.lastQueryBody = null;
    this.updateColumns();
    this.tableVer++;
  }

  /* ----------------- 匯出工具 ----------------- */

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

    this.btnExportExcelLoading = true;

    this.fin34010Service
      .exportFIN34010Excel(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.btnExportExcelLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: HttpResponse<Blob>) => this.saveBlob(res, defaultName),
        error: (err: any) => {
          console.error('FIN34010 Excel export error:', err);
          this.messageService?.errorBubble?.(
            err?.error?.Message || 'Excel 匯出失敗'
          );
        },
      });
  }

  downloadFIN34010PDF(): void {
    const payload = this.buildExportPayload();
    const defaultName = 'FIN34010_應收帳款明細表.pdf';

    this.btnExportPdfLoading = true;

    this.fin34010Service
      .exportFIN34010PDF(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.btnExportPdfLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: HttpResponse<Blob>) => this.saveBlob(res, defaultName),
        error: (err: any) => {
          console.error('FIN34010 PDF export error:', err);
          this.messageService?.errorBubble?.(
            err?.error?.Message || 'PDF 匯出失敗'
          );
        },
      });
  }
}