/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// ✅ app-table
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, RowEditSaveEvent } from '../../../shared/componentkit/table/table.model';

// ✅ table-report
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { forkJoin, of } from 'rxjs';

// Service & 型別
import {
  ApiResponse,
  Cpm11030Service,
  QueryCPM11030Request,
  QueryCPM11030Row,
  DailyEquipAvailabilityRow,
  InsertDailyEquipAvailabilityRequest,
} from '../../../service/api/cpm/cpm11030.service';

type SortItem = { field: string; order: number };

type DailyRow = {
  _rowKey: string;
  Device_ID: string;
  Device_Name: string;
  Device_Qty: number;
};

@UntilDestroy()
@Component({
  selector: 'app-cpm11030',
  templateUrl: './cpm11030.component.html',
  styleUrls: ['./cpm11030.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    ButtonModule,
    ButtonComponent,
    CalendarRangeComponent,
    InputTextComponent,
    DropdownComponent,
    DialogComponent,
    CalendarModule,
    CalendarComponent,
    TableComponent,
    TableReportComponent,
  ],
})
export class CPM11030Component extends BasicQueryPageComponent<any> {
  /* ----------------- 列表狀態 ----------------- */
  data: QueryCPM11030Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: QueryCPM11030Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;
  tableVer = 0;

  btnLoading = false;

  readonly defaultSort: SortItem[] = [{ field: 'Loan_Date', order: -1 }];

  columns: ReportColumn[] = [
    { field: 'Loan_No', header: '紀錄編號' },
    { field: 'Loan_Date', header: '出借日期', format: (v: string) => this.formatDate(v) },
    { field: 'Loan_Time', header: '出借時間' },
    { field: 'Service_Id', header: '服務中心位置編號' },
    { field: 'Loan_Status', header: '出借狀態' },
    { field: 'User_Name', header: '借用人姓名' },
    { field: 'Cert_Type', header: '證件類型' },
    { field: 'Cert_No', header: '證件編號' },
    { field: 'Loan_Phone', header: '連絡電話' },
    { field: 'Device_ID', header: '設備代碼' },
    { field: 'Device_Name', header: '設備名稱' },
  ];

  counterCodeOptions: { value: string; label: string }[] = [
    { value: '11A001', label: '11A001/服務諮詢台' },
    { value: '12A001', label: '12A001/VIP室' },
    { value: '12D001', label: '12D001/總機' },
    { value: '15A001', label: '15A001/顧客服務中心' },
  ];

  queryForm = this.formBuilder.group({
    Loan_No: ['' as string],
    Loan_BDate: [null as Date | null],
    Loan_EDate: [null as Date | null],
    User_Name: ['' as string],
    Loan_USR_No: ['' as string],
    Loan_Phone: ['' as string],
    Cert_Type: ['' as string],
    Cert_No: ['' as string],
    Device_Name: ['' as string],
    Device_ID: ['' as string],
    Service_Id: ['' as string],
    ...createPaginationConfig(this.defaultSort),
  });

  /* ============================================================
   * Dialog：每日設備可出借量維護（API）
   * ============================================================ */
  dailyDialogVisible = false;
  dailyLoading = false;
  dailySaving = false;
  dailySubmitted = false;
  dailyTableVer = 0;

  dailyForm = this.formBuilder.group({
    Service_Id: ['' as string, [Validators.required, Validators.maxLength(20)]],
    CSS_Date: [null as Date | null, [Validators.required]],
  });

  dailyRows: DailyRow[] = [];
  private dailyPriorQtyMap = new Map<string, number>();

  dailyColumns: Column[] = [
    { field: 'Device_ID', header: '設備代碼', visible: true, readonly: true } as any,
    { field: 'Device_Name', header: '設備名稱', visible: true, readonly: true } as any,
    { field: 'Device_Qty', header: '可借出量', visible: true, type: 'inputNumber' } as any,
  ];

  constructor(
    private cpm11030Service: Cpm11030Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  /* ----------------- 小工具 ----------------- */
  private formatDate(val: string): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }

  private toIso(d: Date | string | null | undefined): string | undefined {
    if (!d) return undefined;
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return undefined;
    return dt.toISOString();
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  private buildQueryPayload(base: any): QueryCPM11030Request {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base.pageSize > 0 ? base.pageSize : 30;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const payload: QueryCPM11030Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      Loan_No: (base?.Loan_No ?? '').trim() || undefined,
      Loan_BDate: this.toIso(base?.Loan_BDate),
      Loan_EDate: this.toIso(base?.Loan_EDate),

      User_Name: (base?.User_Name ?? '').trim() || undefined,
      Loan_USR_No: (base?.Loan_USR_No ?? '').trim() || undefined,
      Loan_Phone: (base?.Loan_Phone ?? '').trim() || undefined,
      Cert_Type: (base?.Cert_Type ?? '').trim() || undefined,
      Cert_No: (base?.Cert_No ?? '').trim() || undefined,
      Device_Name: (base?.Device_Name ?? '').trim() || undefined,
      Device_ID: (base?.Device_ID ?? '').trim() || undefined,
      Service_Id: (base?.Service_Id ?? '').trim() || undefined,
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  /** ✅ 給 table-report 用 */
  public queryCPM11030ForReport = (body: any) =>
    this.cpm11030Service.queryCPM11030(this.buildQueryPayload(body || {})).pipe(
      map((res: ApiResponse<QueryCPM11030Row[] | QueryCPM11030Row>) => {
        const src = (res as any)?.Data;
        const rows: QueryCPM11030Row[] = Array.isArray(src) ? src : src ? [src] : [];
        const totalCount = Number((res as any)?.TotalCount ?? rows.length) || rows.length;
        rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));
        return { Data: rows, TotalCount: totalCount, GrandTotal: null };
      })
    );

  ngOnInit(): void {
    const today = new Date();
    this.queryForm.patchValue({ Loan_BDate: today, Loan_EDate: today });

    this.initializePage('CPM11030', '/cpm/cpm11030cru', this.queryForm, (form) =>
      this.onSubmit(form)
    );
  }

  onSubmit(frm: any) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildQueryPayload(raw);
    payload.PageIndex = 1;

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.cpm11030Service
      .queryCPM11030(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<QueryCPM11030Row[]>) => {
          const rows: QueryCPM11030Row[] = Array.isArray(response?.Data) ? response.Data : [];
          rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));

          this.data = rows;
          const realTotal = Number((response as any)?.TotalCount ?? rows.length) || rows.length;

          setTimeout(() => {
            this.totalRecords = realTotal;
            this.viewTotalRecords = realTotal;
            this.lastQueryBody = { ...payload };
          });

          this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('CPM11030 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onClear(frm: any) {
    const today = new Date();
    frm.reset({
      Loan_No: '',
      Loan_BDate: today,
      Loan_EDate: today,
      User_Name: '',
      Loan_USR_No: '',
      Loan_Phone: '',
      Cert_Type: '',
      Cert_No: '',
      Device_Name: '',
      Device_ID: '',
      Service_Id: '',
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
  }

  // ================= 匯出 =================

  private getExportPayload(): QueryCPM11030Request {
    // 優先用 lastQueryBody（跟 table-report 一致）
    if (this.lastQueryBody) return { ...(this.lastQueryBody as QueryCPM11030Request) };
    // 沒有 lastQueryBody 就用目前表單
    return this.buildQueryPayload(this.queryForm.getRawValue());
  }

  private getFilenameFromContentDisposition(cd?: string | null, fallback = 'export'): string {
    if (!cd) return fallback;
    // 例：attachment; filename="xxx.xlsx"
    const m = /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i.exec(cd);
    if (!m?.[1]) return fallback;
    try {
      return decodeURIComponent(m[1]);
    } catch {
      return m[1];
    }
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  onExportPDF() {
    if (!this.data?.length) return;

    const payload = this.getExportPayload();
    this.btnLoading = true;

    this.cpm11030Service
      .exportCPM11030PDF(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const cd = res.headers?.get('content-disposition');
          const filename = this.getFilenameFromContentDisposition(cd, 'CPM11030.pdf');
          this.downloadBlob(res.body as Blob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
          this.btnLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('exportCPM11030_PDF error:', err);
          this.btnLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onExportXLSX() {
    if (!this.data?.length) return;

    const payload = this.getExportPayload();
    this.btnLoading = true;

    this.cpm11030Service
      .exportCPM11030Excel(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const cd = res.headers?.get('content-disposition');
          const filename = this.getFilenameFromContentDisposition(cd, 'CPM11030.xlsx');
          this.downloadBlob(res.body as Blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
          this.btnLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('exportCPM11030_Excel error:', err);
          this.btnLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  /* ----------------- Daily Dialog（你原本的 그대로） ----------------- */
  openDailyDialog() {
    this.dailyDialogVisible = true;

    const today = new Date();
    const svc = (this.queryForm.getRawValue()?.Service_Id ?? '').trim();

    this.dailyForm.patchValue({
      CSS_Date: today,
      Service_Id: svc,
    });

    this.onDailyQuery();
  }

  onDailyDialogVisibleChange(visible: boolean) {
    this.dailyDialogVisible = visible;

    if (!visible) {
      this.dailySubmitted = false;
      this.dailyLoading = false;
      this.dailySaving = false;
      this.dailyRows = [];
      this.dailyPriorQtyMap.clear();
    }
  }

  onDailyQuery() {
    this.dailySubmitted = true;

    if (this.dailyForm.invalid) {
      this.dailyForm.markAllAsTouched();
      return;
    }

    const raw = this.dailyForm.getRawValue();
    const Service_Id = (raw.Service_Id ?? '').trim();

    this.dailyLoading = true;
    this.dailyRows = [];
    this.dailyPriorQtyMap.clear();

    this.cpm11030Service
      .queryCPM11030_DailyEquipAvailability({ Service_Id })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<DailyEquipAvailabilityRow[]>) => {
          const rows = Array.isArray(res?.Data) ? res.Data : [];

          rows.forEach((r) => this.dailyPriorQtyMap.set(r.Device_ID, Number(r.Device_Qty ?? 0)));

          this.dailyRows = rows.map((r) => ({
            _rowKey: `${Service_Id}_${r.Device_ID}`,
            Device_ID: r.Device_ID,
            Device_Name: r.Device_Name,
            Device_Qty: Number(r.Device_Qty ?? 0),
          }));

          this.dailyTableVer++;
          this.dailyLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('queryCPM11030_DailyEquipAvailability error:', err);
          this.dailyRows = [];
          this.dailyLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onDailyRowEditSave(e: RowEditSaveEvent) {}

  onDailySave() {
    this.dailySubmitted = true;

    if (this.dailyForm.invalid) {
      this.dailyForm.markAllAsTouched();
      return;
    }

    const raw = this.dailyForm.getRawValue();
    const Service_Id = (raw.Service_Id ?? '').trim();
    const CSS_Date = this.toIso(raw.CSS_Date) ?? new Date().toISOString();

    const items: InsertDailyEquipAvailabilityRequest[] = (this.dailyRows ?? []).map((r) => {
      const prior = Number(this.dailyPriorQtyMap.get(r.Device_ID) ?? 0);
      const current = Number.isFinite(r.Device_Qty as any) ? Number(r.Device_Qty) : 0;

      return {
        CSS_Date,
        Service_Id,
        Device_ID: r.Device_ID,
        CSS_PriorQty: prior,
        CSS_LendQty: 0,
        CSS_ReturnQty: 0,
        CSS_CurrentQty: current,
      };
    });

    this.dailySaving = true;

    const calls = items.map((x) => this.cpm11030Service.insertCPM11030_DailyEquipAvailability(x));
    const req$ = calls.length
      ? forkJoin(calls).pipe(
          map((results) => {
            const success = results.filter((r: any) => r?.IsSuccess === true).length;
            const fail = results.length - success;
            return { success, fail, results };
          })
        )
      : of({ success: 0, fail: 0, results: [] as any[] });

    req$.pipe(untilDestroyed(this)).subscribe({
      next: ({ fail }) => {
        this.dailySaving = false;
        if (fail === 0) this.dailyDialogVisible = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('insertCPM11030_DailyEquipAvailability error:', err);
        this.dailySaving = false;
        this.cdr.detectChanges();
      },
    });
  }
}
