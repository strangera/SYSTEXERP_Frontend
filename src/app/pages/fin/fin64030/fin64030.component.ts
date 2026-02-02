/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { Fin26010Service, Aps1002BankDropDownRow } from '../../../service/api/fin/fin26010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import {
  ApiResponse,
  Fin64030Service,
  QueryFIN64030Request,
  QueryFIN64030Row,
  SortItem,
} from '../../../service/api/fin/fin64030.service';

@UntilDestroy()
@Component({
  selector: 'app-fin64030',
  templateUrl: './fin64030.component.html',
  styleUrls: ['./fin64030.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    ButtonModule,
    DialogModule,
    CalendarRangeComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    TableComponent,
  ],
})
export class FIN64030Component extends BasicQueryPageComponent<any> implements AfterViewInit {
  data: QueryFIN64030Row[] = [];
  totalRecords = 0;
  selectedItems: QueryFIN64030Row[] = [];
  lastQueryBody: any = null;

  btnLoading = false;

  /** dialog */
  cashDialogVisible = false;

  /** dialog form */
  cashForm = this.formBuilder.group({
    PayDate: [new Date() as Date | null, Validators.required],
    CashBankNo: ['', Validators.required],
    VouNoPaid: ['' as string], // optional
  });

  readonly defaultSort: SortItem[] = [{ field: 'CHK_No', order: 1 }];
  private _currentSortBy: SortItem[] = this.defaultSort;

  /** ✅ 你要求：狀態=3(兌現) 顯示 X / 不可勾選
   * 這裡先做「不可勾選」：狀態=3 就 false
   * 若後端也提供 IsSelectable，可一起合併
   */
  isRowSelectable = (row: QueryFIN64030Row) => {
    const status = String(row?.CHK_Status ?? '').trim();
    if (status === '3' || String(row?.CHK_Status_Name ?? '').trim() === '兌現') return false;

    const apiSelectable = String(row?.IsSelectable ?? '').trim();
    if (apiSelectable) return apiSelectable === 'Y';

    return true;
  };

  columns: Column[] = [
    { field: 'CHK_No', header: '票據號碼' },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'BNK_No', header: '全省銀行代碼(含分行)' },
    { field: 'BNK_Name', header: '銀行名稱' },
    { field: 'CHK_ExpireDate', header: '兌現日(起迄)/到期日', format: (v: any) => this.formatDate(v) },
    { field: 'CHK_Amt', header: '票面金額', format: (v: any) => this.moneyFormat(v) },
    { field: 'CHK_Status_Name', header: '狀態' },
    { field: 'VouNo_Paid', header: '兌現傳票號' },
    { field: 'PayDate', header: '兌現日', format: (v: any) => this.formatDate(v) },
  ];

  /** options */
  companyAccOptions: any[] = [];
  cashBankOptions: any[] = [];
  chkStatusOptions: any[] = [
    { value: '', label: '全部' },
    { value: '0', label: '作廢' },
    { value: '1', label: '未異動' },
    { value: '2', label: '託收' },
    { value: '3', label: '兌現' },
    { value: '4', label: '撤票' },
    { value: '5', label: '退票' },
  ];

  /** 查詢條件（照你畫面：公司銀行科目代號 / 兌現日(起迄) / 票據號碼） */
  queryForm = this.formBuilder.group({
    companyAccNoList: [[] as string[]],

    // 你畫面寫「兌現日(起迄)」，這裡用 PayDateFrom/PayDateTo（payload 先放 ExpireDateFrom/To 也可，後端再對齊）
    cashDateStart: [null as Date | null],
    cashDateEnd: [null as Date | null],

    chkNo: ['' as string],

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin64030Service: Fin64030Service,
    private fin26010Service: Fin26010Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage('FIN64030', 'fin/fin64030cru', this.queryForm, (form) =>
      this.onSubmit(form)
    );

    const fromCru = !!(history.state && history.state['fromCru'] === true);
    if (fromCru) {
      const saved = this.queryStateService.getQueryStateValue('FIN64030');
      if (saved?.formValue) {
        this.queryForm.patchValue(saved.formValue, { emitEvent: false });
        this._currentSortBy = saved.currentSortBy ?? this.defaultSort;
        this.lastQueryBody = saved.lastQueryBody ?? null;
        Promise.resolve().then(() => this.onSubmit(this.queryForm));
      }
    } else {
      this.onClear(this.queryForm);
      this.queryStateService.clearQueryState?.('FIN64030');
      this.lastQueryBody = null;
      this._currentSortBy = this.defaultSort;
    }

    // APS1002（你們一樣的作法）
    this.fin26010Service
      .queryAPS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Aps1002BankDropDownRow[]>) => {
          const list = Array.isArray(res?.Data) ? res.Data : [];
          const filtered = list.filter((x: any) => String(x?.BNK_AccType ?? '') !== '1');

          const options = filtered
            .slice()
            .sort((a, b) => String(a.BNK_id).localeCompare(String(b.BNK_id)))
            .map((x: any) => ({
              label: `${x.BNK_id}-${x.BNK_AccName}`,
              value: x.BNK_id,
              raw: x,
            }));

          this.companyAccOptions = options;
          this.cashBankOptions = options;
          this.cdr.detectChanges();
        },
        error: () => {
          this.companyAccOptions = [];
          this.cashBankOptions = [];
          this.cdr.detectChanges();
        },
      });
  }

  // ---------- helper ----------
  moneyFormat(value: any): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return n.toLocaleString('en-US');
  }

  private formatDate(val: any): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }

  private toYmd(d: Date | string | null | undefined): string | undefined {
    if (!d) return undefined;
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return undefined;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  private buildQueryPayload(base: any): QueryFIN64030Request {
    const pageIndex = Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize = Number.isFinite(base?.pageSize) && base?.pageSize > 0 ? base.pageSize : 30;
    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const list: string[] = Array.isArray(base?.companyAccNoList) ? base.companyAccNoList : [];
    const companyAccNoList = list.map((x) => String(x ?? '').trim()).filter(Boolean).join(',');

    const payload: QueryFIN64030Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      CompanyAccNoList: companyAccNoList || undefined,

      // 兌現日(起迄) — 先用 ExpireDateFrom/To 佔位（後端上線再改成 PayDateFrom/To）
      ExpireDateFrom: this.toYmd(base?.cashDateStart),
      ExpireDateTo: this.toYmd(base?.cashDateEnd),

      ChkNo: (base?.chkNo ?? '').trim() || undefined,
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  private parseQueryResponse(res: any): { rows: QueryFIN64030Row[]; total: number } {
    const data = res?.Data;

    if (Array.isArray(data)) {
      const total = Number(res?.TotalCount ?? res?.totalCount ?? data.length) || data.length;
      return { rows: data, total };
    }

    if (data && typeof data === 'object') {
      const innerArr =
        (Array.isArray(data?.Data) && data.Data) ||
        (Array.isArray(data?.Items) && data.Items) ||
        (Array.isArray(data?.List) && data.List) ||
        null;

      if (innerArr) {
        const total = Number(data?.TotalCount ?? res?.TotalCount ?? innerArr.length) || innerArr.length;
        return { rows: innerArr, total };
      }
    }

    return { rows: [], total: 0 };
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
    this.totalRecords = 0;

    this.fin64030Service
      .queryFIN64030(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;
          this.lastQueryBody = { ...payload };
          this._currentSortBy = payload.SortBy ?? this.defaultSort;
          this.loading = false;
          this.cdr.detectChanges();
          this.saveQueryState();
        },
        error: (err: any) => {
          console.error('FIN64030 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState('FIN64030', {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  onClear(frm: any) {
    frm.reset({
      companyAccNoList: [],
      cashDateStart: null,
      cashDateEnd: null,
      chkNo: '',
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.selectedItems = [];
    this.lastQueryBody = null;
  }

  // ========= 兌現 dialog =========
  onCash(): void {
    const chkNoList = this.getSelectedChkNoList();
    if (!chkNoList.length) {
      this.messageService.errorBubble('請先勾選可兌現的資料（狀態=兌現不可勾）');
      return;
    }

    this.cashForm.reset({ PayDate: new Date(), CashBankNo: '', VouNoPaid: '' });
    this.cashDialogVisible = true;
    this.cdr.detectChanges();
  }

  onCashConfirm(): void {
    this.cashForm.markAllAsTouched();
    if (this.cashForm.invalid) return;

    const chkNoList = this.getSelectedChkNoList();
    if (!chkNoList.length) {
      this.messageService.errorBubble('請先勾選可兌現的資料');
      return;
    }

    const payDate = this.toYmd(this.cashForm.value.PayDate as any);
    const cashBankNo = String(this.cashForm.value.CashBankNo ?? '').trim();
    const vouNoPaid = String(this.cashForm.value.VouNoPaid ?? '').trim();

    if (!payDate) {
      this.messageService.errorBubble('兌現日不正確');
      return;
    }
    if (!cashBankNo) {
      this.messageService.errorBubble('請選擇兌現銀行');
      return;
    }

    this.btnLoading = true;

    this.fin64030Service
      .cashFIN64030({
        ChkNoList: chkNoList,
        PayDate: payDate,
        CashBankNo: cashBankNo,
        VouNoPaid: vouNoPaid || undefined,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess === false) {
            this.messageService.errorBubble(res?.Message ?? '兌現失敗');
            return;
          }

          this.messageService.successBubble('兌現成功');
          this.cashDialogVisible = false;

          // 前端先更新：狀態=3 => 不可勾選
          this.data = this.data.map((r) => {
            const no = String(r?.CHK_No ?? '').trim();
            if (chkNoList.includes(no)) {
              return {
                ...r,
                CHK_Status: '3',
                CHK_Status_Name: '兌現',
                PayDate: payDate,
                VouNo_Paid: vouNoPaid || r?.VouNo_Paid || null,
                IsSelectable: 'N',
              };
            }
            return r;
          });

          this.selectedItems = [];
          this.cdr.detectChanges();
        },
        error: () => this.messageService.errorBubble('兌現失敗'),
        complete: () => {
          this.btnLoading = false;
          this.cdr.detectChanges();
          this.onSubmit(this.queryForm); // 重查確保一致
        },
      });
  }

  onCashCancel(): void {
    this.cashDialogVisible = false;
  }

  private getSelectedChkNoList(): string[] {
    const list = Array.isArray(this.selectedItems) ? this.selectedItems : [];
    return list
      .filter((r) => this.isRowSelectable(r))
      .map((r) => String(r?.CHK_No ?? '').trim())
      .filter(Boolean);
  }

  // ========= lazy load =========
  override onLazyLoadData(e: any) {
    const raw = this.queryForm.getRawValue();
    const payload = this.buildQueryPayload({
      ...raw,
      pageIndex: e?.pageIndex,
      pageSize: e?.pageSize,
      SortBy: e?.SortBy,
    });

    this.loading = true;
    this.fin64030Service
      .queryFIN64030(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;
          this.lastQueryBody = { ...payload };
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  @ViewChild('finTable') finTable!: TableComponent;

  ngAfterViewInit(): void {
    setTimeout(() => {
      try {
        (this.finTable as any).IsPrint = true;
      } catch {}

      const dt: any = (this.finTable as any).dt;
      if (dt?.onLazyLoad) {
        dt.onLazyLoad.pipe(untilDestroyed(this)).subscribe((e: any) => {
          const pageSize = Number(e?.rows ?? 30);
          const first = Number(e?.first ?? 0);
          const pageIndex = Math.floor(first / pageSize) + 1;
          this.fireQueryByPage(pageIndex, pageSize, e?.multiSortMeta);
        });
      }
    });
  }

  private readonly _allowSortFields = new Set(this.columns.map((c) => c.field).filter(Boolean) as string[]);

  private fireQueryByPage(pageIndex: number, pageSize: number, sortMeta?: any) {
    const raw = this.queryForm.getRawValue();

    let sortBy: SortItem[] | undefined;

    if (Array.isArray(sortMeta) && sortMeta.length) {
      const filtered = sortMeta
        .filter((s: any) => this._allowSortFields.has(String(s?.field)))
        .map((s: any) => ({ field: String(s.field), order: Number(s.order) || 1 }));
      if (filtered.length) sortBy = filtered;
    }

    if (!sortBy || !sortBy.length) {
      sortBy = this._currentSortBy?.length ? this._currentSortBy : this.defaultSort;
    }

    const payload = this.buildQueryPayload({ ...raw, pageIndex, pageSize, SortBy: sortBy });
    this._currentSortBy = payload.SortBy ?? this.defaultSort;

    this.loading = true;
    this.fin64030Service
      .queryFIN64030(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;
          this.lastQueryBody = { ...payload };
          this.loading = false;
          this.saveQueryState();
          this.cdr.detectChanges();
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // ========= 匯出（可選） =========
  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
        return decoded;
      } catch {
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }

  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  onExportPDF() {
    if (!this.lastQueryBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }

    const exportBody = { ...this.lastQueryBody };
    delete exportBody.pageIndex;
    delete exportBody.pageSize;
    delete exportBody.PageIndex;
    delete exportBody.PageSize;
    delete exportBody.Offset;
    delete exportBody.OrderBy;

    this.btnLoading = true;

    this.fin64030Service
      .exportFIN64030PDF(exportBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService.errorBubble('匯出失敗'),
        complete: () => (this.btnLoading = false),
      });
  }

  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }

    const exportBody = { ...this.lastQueryBody };
    delete exportBody.pageIndex;
    delete exportBody.pageSize;
    delete exportBody.PageIndex;
    delete exportBody.PageSize;
    delete exportBody.Offset;
    delete exportBody.OrderBy;

    this.btnLoading = true;

    this.fin64030Service
      .exportFIN64030Excel(exportBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: () => this.messageService.errorBubble('匯出失敗'),
        complete: () => (this.btnLoading = false),
      });
  }
}
