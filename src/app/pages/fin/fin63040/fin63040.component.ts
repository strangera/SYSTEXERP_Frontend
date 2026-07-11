/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationStart } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { Aps1002BankDropDownRow, Fin26010Service } from '../../../service/api/fin/fin26010.service';
import {
  ApiResponse,
  Fin63040Service,
  QueryFIN63040Request,
  QueryFIN63040Row,
  SortItem,
} from '../../../service/api/fin/fin63040.service';

// ✅ app-table-report
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';

@UntilDestroy()
@Component({
  selector: 'app-fin63040',
  templateUrl: './fin63040.component.html',
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
    DropdownComponent,
    CalendarRangeComponent,
    CalendarComponent,
    InputTextComponent,
    ButtonComponent,
    // ✅ table-report
    TableReportComponent,
  ],
})
export class FIN63040Component extends BasicQueryPageComponent<any> implements AfterViewInit {
  override ProgNo = 'FIN63040';

  data: QueryFIN63040Row[] = [];
  totalRecords = 0;

  /** ✅ table-report selection（改成手動接 event） */
  selectedItems: QueryFIN63040Row[] = [];

  lastQueryBody: any = null;

  btnLoading = false;

  readonly defaultSort: SortItem[] = [{ field: 'CheckNo', order: 1 }];
  private _currentSortBy: SortItem[] = this.defaultSort;
  private _allowSortFields!: Set<string>;

  BankCodeOptions: any[] = [];

  cashDialogVisible = false;

  cashForm = this.formBuilder.group({
    PayDate: [new Date() as Date | null, Validators.required],
  });

  /** ✅ 只有 CanPickupYn=Y 可勾選 */
  isRowSelectable = (row: QueryFIN63040Row) => String(row?.CanPickupYn ?? '').toUpperCase() === 'Y';

  /** ✅ columns 改成 ReportColumn（table-report 用） */
  columns: ReportColumn[] = [
    { field: 'CheckNo', header: '票據號碼' },
    { field: 'VendorNo', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'CompanyAccNo', header: '科目代號' },
    { field: 'CompanyAccName', header: '科目名稱' },
    { field: 'IssueDate', header: '開票日', format: (v: any) => this.formatDate(v) },
    { field: 'ExpireDate', header: '到期日', format: (v: any) => this.formatDate(v) },
    { field: 'PayDate', header: '兌現日', format: (v: any) => this.formatDate(v) },
    { field: 'CheckAmount', header: '票面金額', format: (v: any) => this.moneyFormat(v) },
    { field: 'CheckTitle', header: '票據抬頭' },
    { field: 'NoEndorseYn', header: '票據禁止背書轉讓', format: (v: any) => this.yesNoText(v) },
    { field: 'Remark', header: '備註' },
    { field: 'OrgId', header: '組織代號' },
    { field: 'Org_Name', header: '組織名稱' },
    { field: 'StatusFlag', header: '狀態', format: (v: any) => this.statusFlagText(v) },
    { field: 'CheckStatus', header: '票據狀態', format: (v: any) => this.checkStatusText(v) },
    { field: 'PickupStatus', header: '領取狀態', format: (v: any) => this.pickupStatusText(v) },
    { field: 'PickupDate', header: '領取日期', format: (v: any) => this.formatDate(v) },
    { field: 'VoucherNoIssued', header: '傳票號碼(開票)' },
    { field: 'VoucherNoPaid', header: '傳票號碼(兌現)' },
  ];

  queryForm = this.formBuilder.group({
    CompanyAccNo: ['' as string],
    ChkNo: ['' as string],
    PayDateFrom: [null as Date | null],
    PayDateTo: [null as Date | null],
    ExpireDateFrom: [null as Date | null],
    ExpireDateTo: [null as Date | null],
    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin63040Service: Fin63040Service,
    private fin26010Service: Fin26010Service,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN63040', 'fin/fin63040cru', this.queryForm, (form) => this.onSubmit(form));

    this._allowSortFields = new Set(this.columns.map((c) => c.field).filter(Boolean) as string[]);

    // ✅ 離開本頁就清 state（你原本邏輯）
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationStart),
        untilDestroyed(this)
      )
      .subscribe((e: any) => {
        const url = String(e?.url ?? '');
        if (!url.includes('fin63040')) {
          this.queryStateService.clearQueryState(this.ProgNo);
        }
      });

    // ✅ 銀行下拉
    this.fin26010Service
      .queryAPS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Aps1002BankDropDownRow[]>) => {
          const list = Array.isArray(res?.Data) ? res.Data : [];
          this.BankCodeOptions = list
            .slice()
            .sort((a, b) => String(a.BNK_id).localeCompare(String(b.BNK_id)))
            .map((x) => ({
              label: `${x.BNK_id}-${x.BNK_AccName}`,
              value: x.BNK_id,
              raw: x,
            }));
        },
        error: () => {
          this.BankCodeOptions = [];
        },
      });

    // ✅ 從 CRU 回來：還原查詢
    const state = history.state as any;
    if (state?.fromCru === true) {
      const saved = this.queryStateService.getQueryStateValue(this.ProgNo);
      if (saved?.formValue) {
        this.queryForm.patchValue(saved.formValue, { emitEvent: false });
        this._currentSortBy = saved.currentSortBy ?? this.defaultSort;
        this.lastQueryBody = saved.lastQueryBody ?? null;
        Promise.resolve().then(() => this.onSubmit(this.queryForm));
      }
    }
  }

  ngAfterViewInit(): void {
    // ✅ table-report 自己處理 lazy/sort/scroll，不需要你去訂閱 dt.onLazyLoad
  }

  /** =======================
   * ✅ table-report 需要的 queryFunction
   * - 它會送 pageIndex/pageSize/SortBy（小寫）
   * - 我們轉成後端要的 PageIndex/PageSize/SortBy
   * - 回傳格式保證有 Data/TotalCount
   * ======================= */
  public queryFIN63040ForReport = (body: any): Observable<any> => {
    const payload = this.buildQueryPayload(body || {});
    return this.fin63040Service.queryFIN63040(payload).pipe(
      map((res: ApiResponse<any>) => {
        const parsed = this.parseQueryResponse(res);
        // ✅ table-report 內部是看 res.Data / res.TotalCount
        return { Data: parsed.rows, TotalCount: parsed.total };
      })
    );
  };

  /** =======================
   * ✅ selection event（取代 [(selectedItems)])
   * ======================= */
  onSelectionChange(list: QueryFIN63040Row[]) {
    this.selectedItems = Array.isArray(list) ? list : [];
  }
  onSelectAllChange(_checked: boolean) {
    // table-report 內部已處理可勾選條件，你這邊不必做事
  }

  /** =======================
   * ✅ display helpers
   * ======================= */
  private yesNoText(v: any): string {
    const s = String(v ?? '').toUpperCase();
    if (s === 'Y') return '是';
    if (s === 'N') return '否';
    return s;
  }

  private statusFlagText(v: any): string {
    const s = String(v ?? '');
    if (s === '1') return '確認';
    if (s === '2') return '拋轉';
    return s;
  }

  private checkStatusText(v: any): string {
    const s = String(v ?? '');
    if (s === '2') return '到期';
    if (s === '3') return '兌現';
    if (s === '0') return '作廢';
    if (s === '1') return '未異動';
    if (s === '4') return '撤票';
    if (s === '5') return '退票';
    return s;
  }

  private pickupStatusText(v: any): string {
    const s = String(v ?? '');
    if (s === '0') return '未領';
    if (s === '1') return '已領';
    if (s === '2') return '郵寄';
    return s;
  }

  moneyFormat(value: any): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return n.toLocaleString('en-US');
  }

  private formatDate(val: any): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
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

  private saveQueryState(): void {
    this.queryStateService.setQueryState(this.ProgNo, {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  /** =======================
   * ✅ query payload
   * ======================= */
  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  private buildQueryPayload(base: any): QueryFIN63040Request {
    // table-report 送的是 pageIndex/pageSize/SortBy（小寫）
    const pageIndex = Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize = Number.isFinite(base?.pageSize) && base?.pageSize > 0 ? base.pageSize : 30;

    // SortBy 可能是 PrimeNG multiSortMeta（field/order）
    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const payload: QueryFIN63040Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      CompanyAccNo: String(base?.CompanyAccNo ?? '').trim() || undefined,
      ChkNo: String(base?.ChkNo ?? '').trim() || undefined,
      PayDateFrom: this.toYmd(base?.PayDateFrom),
      PayDateTo: this.toYmd(base?.PayDateTo),
      ExpireDateFrom: this.toYmd(base?.ExpireDateFrom),
      ExpireDateTo: this.toYmd(base?.ExpireDateTo),
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    // ✅ keep lastQueryBody 給 table-report 用（它會用 pageSize）
    this.lastQueryBody = {
      ...base,
      pageIndex,
      pageSize,
      SortBy: sort,
      // 同步查詢條件
      CompanyAccNo: payload.CompanyAccNo,
      ChkNo: payload.ChkNo,
      PayDateFrom: base?.PayDateFrom ?? null,
      PayDateTo: base?.PayDateTo ?? null,
      ExpireDateFrom: base?.ExpireDateFrom ?? null,
      ExpireDateTo: base?.ExpireDateTo ?? null,
    };

    return payload;
  }

  private parseQueryResponse(res: any): { rows: QueryFIN63040Row[]; total: number } {
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

      const total = Number(res?.TotalCount ?? data?.TotalCount ?? 1) || 1;
      return { rows: [{ ...(data as any) }], total };
    }

    return { rows: [], total: 0 };
  }

  /** =======================
   * ✅ submit / clear
   * ======================= */
  onSubmit(frm: any) {
    this.submitted = true;

    const raw = this.queryForm.getRawValue();
    const payload = this.buildQueryPayload({ ...raw, pageIndex: 1, pageSize: 30, SortBy: this._currentSortBy });
    payload.PageIndex = 1;

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.totalRecords = 0;

    this.fin63040Service
      .queryFIN63040(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;
          this._currentSortBy = payload.SortBy ?? this.defaultSort;

          // ✅ 給 table-report 用
          this.lastQueryBody = {
            ...this.queryForm.getRawValue(),
            pageIndex: 1,
            pageSize: payload.PageSize ?? 30,
            SortBy: this._currentSortBy,
          };

          this.saveQueryState();
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

  onClear(frm: any) {
    frm.reset({
      CompanyAccNo: '',
      ChkNo: '',
      PayDateFrom: null,
      PayDateTo: null,
      ExpireDateFrom: null,
      ExpireDateTo: null,
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.selectedItems = [];
    this.lastQueryBody = null;
    this._currentSortBy = this.defaultSort;

    this.queryStateService.clearQueryState(this.ProgNo);
  }

  /** =======================
   * ✅ detail / edit（沿用）
   * ======================= */
  override onDetail(row: QueryFIN63040Row) {
    const chkNo = String(row?.CheckNo ?? '').trim();
    if (!chkNo) return;
    this.saveQueryState();
    this.router.navigate([`account/${this.cruPage.toLowerCase()}`], {
      queryParams: { ChkNo: chkNo },
      state: { crudstatus: CRUDStatus.Read, rowdata: row, fromRoute: this.router.url },
    });
  }

  override onEdit(row: QueryFIN63040Row) {
    const chkNo = String(row?.CheckNo ?? '').trim();
    if (!chkNo) return;
    this.saveQueryState();
    this.router.navigate([`account/${this.cruPage.toLowerCase()}`], {
      queryParams: { ChkNo: chkNo },
      state: { crudstatus: CRUDStatus.Edit, rowdata: row, fromRoute: this.router.url },
    });
  }

  /** =======================
   * ✅ cash flow（沿用）
   * ======================= */
  onCash(): void {
    const chkNoList = this.getSelectedChkNoList();
    if (!chkNoList.length) {
      this.messageService.errorBubble('請先勾選「可兌現=Y」的資料');
      return;
    }

    this.cashForm.reset({ PayDate: new Date() });
    this.cashDialogVisible = true;
    this.cdr.detectChanges();
  }

  private canCashByExpireDate(payDate: string, rows: QueryFIN63040Row[]): boolean {
    const pay = new Date(payDate);
    if (isNaN(pay.getTime())) return false;

    const invalid = rows.filter((r) => {
      const exp = r?.ExpireDate ? new Date(r.ExpireDate as any) : null;
      if (!exp || isNaN(exp.getTime())) return true;
      return exp.getTime() > pay.getTime();
    });

    if (invalid.length) {
      const msg = invalid
        .map((r) => `${String(r?.CheckNo ?? '').trim()}(到期日:${this.formatDate(r?.ExpireDate) || '空'})`)
        .join('、');
      this.messageService.errorBubble(`兌現日要大於等於到期日：${msg}`);
      return false;
    }

    return true;
  }

  isCashConfirmDisabled(): boolean {
    const chkNoList = this.getSelectedChkNoList();
    if (!chkNoList.length) return true;

    const payDate = this.cashForm.value.PayDate as any;
    if (!payDate) return true;

    const payTime = new Date(payDate).setHours(0, 0, 0, 0);
    if (isNaN(payTime)) return true;

    const rows = (Array.isArray(this.selectedItems) ? this.selectedItems : []).filter((r) => this.isRowSelectable(r));
    if (!rows.length) return true;

    return rows.some((r: any) => {
      const exp = r?.ExpireDate;
      if (!exp) return true;
      const expTime = new Date(exp).setHours(0, 0, 0, 0);
      if (isNaN(expTime)) return true;
      return payTime < expTime;
    });
  }

  onCashConfirm(): void {
    this.cashForm.markAllAsTouched();
    if (this.cashForm.invalid) return;

    const chkNoList = this.getSelectedChkNoList();
    if (!chkNoList.length) {
      this.messageService.errorBubble('請先勾選「可兌現=Y」的資料');
      return;
    }

    const payDate = this.toYmd(this.cashForm.value.PayDate as any);
    if (!payDate) {
      this.messageService.errorBubble('請輸入兌現日');
      return;
    }

    const selected = (Array.isArray(this.selectedItems) ? this.selectedItems : []).filter((r) => this.isRowSelectable(r));
    if (!this.canCashByExpireDate(payDate, selected)) return;

    this.btnLoading = true;

    this.fin63040Service
      .updateFIN63040Detail({ PayDate: payDate, ChkNoList: chkNoList } as any)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess === false) {
            this.messageService.errorBubble(res?.Message ?? '票據兌現失敗');
            return;
          }
          this.messageService.successBubble('票據兌現成功');
          this.cashDialogVisible = false;
          this.selectedItems = [];
          this.cdr.detectChanges();
        },
        error: () => this.messageService.errorBubble('票據兌現失敗'),
        complete: () => {
          this.btnLoading = false;
          this.cdr.detectChanges();
          this.onSubmit(this.queryForm);
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
      .map((r) => String(r?.CheckNo ?? '').trim())
      .filter(Boolean);
  }

  /** =======================
   * ✅ export（沿用）
   * ======================= */
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
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
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

    this.fin63040Service
      .exportFIN63040PDF(exportBody)
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

    this.fin63040Service
      .exportFIN63040Excel(exportBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: () => this.messageService.errorBubble('匯出失敗'),
        complete: () => (this.btnLoading = false),
      });
  }
  editDisabled = (row: QueryFIN63040Row): boolean => {
    const status = String(row?.CheckStatus ?? '').trim();

    // 禁止編輯狀態
    return (
      status === '3' ||   // 兌現(代碼)
      status === '2' ||   // 到期(代碼)
      status === '兌現' ||
      status === '到期'
    );
  };

}
