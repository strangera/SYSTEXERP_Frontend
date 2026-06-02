/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import {
  ApiResponse,
  Fin63030Service,
  FIN63030TransVoucherRequest,
  QueryFIN63030Request,
  QueryFIN63030Row,
  SortItem,
} from '../../../service/api/fin/fin63030.service';

import { Aps1002BankDropDownRow, Fin26010Service } from '../../../service/api/fin/fin26010.service';

// ✅ 改用 app-table-report
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';

@UntilDestroy()
@Component({
  selector: 'app-fin63030',
  templateUrl: './fin63030.component.html',
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

    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    ButtonComponent,

    // ✅ table-report
    TableReportComponent,
  ],
})
export class FIN63030Component extends BasicQueryPageComponent<any> implements AfterViewInit {
  data: QueryFIN63030Row[] = [];
  totalRecords = 0;
  lastQueryBody: any = null;

  btnLoading = false;

  /** ✅ Dialog：到期拋轉傳票 */
  transVoucherDialogVisible = false;

  readonly defaultSort: SortItem[] = [
    { field: 'ExpireDate', order: 1 },
    { field: 'CheckNo', order: 1 },
  ];

  private _currentSortBy: SortItem[] = this.defaultSort;

  /** ✅ columns（給 app-table-report 用 ReportColumn） */
  columns: ReportColumn[] = [
    { field: 'CheckNo', header: '票據號碼' },
    { field: 'VendorNo', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠客名稱' },

    { field: 'CompanyAccNo', header: '公司銀行科目代號' },
    { field: 'CompanyAccName', header: '公司銀行科目名稱' },

    { field: 'IssueDate', header: '開票日' },
    { field: 'ExpireDate', header: '到期日' },
    { field: 'PayDate', header: '兌現日' },

    { field: 'CheckAmount', header: '票面金額', format: (v: any) => this.moneyFormat(v) },

    { field: 'CheckTitle', header: '票據抬頭' },
    { field: 'Remark', header: '備註' },

    { field: 'CheckStatus', header: '狀態' },
    { field: 'StatusFlag', header: '票據狀態' },

    { field: 'VoucherNoPaid', header: '兌現傳票號碼' },
  ];

  /** 下拉 */
  CompanyAccNoOptions: any[] = [];     // 查詢：CompanyAccNo = BNK_DepositAccNo
  CompanyBankNoOptions: any[] = [];    // Dialog：BNK_No（銀行代號）
  checkStatusOptions: any[] = [
    { value: '1', label: '未異動' },
    { value: '2', label: '到期' },
    { value: '3', label: '兌現' },
  ];

  /** 查詢表單 */
  queryForm = this.formBuilder.group({
    CompanyAccNo: ['' as string, Validators.required],
    ExpireDateFrom: [null as Date | null],
    ExpireDateTo: [null as Date | null],
    ChkNo: ['' as string],
    VouNoPaid: ['' as string],
    CheckStatus: ['' as string],

    ...createPaginationConfig(this.defaultSort),
  });

  /** Dialog 表單：到期拋轉 */
  transVoucherForm = this.formBuilder.group({
    BNK_No: ['' as string],                                     // 可空（你若要必填再加 Validators.required）
    ChkNo: ['' as string],
    ExpireDateFrom: [null as Date | null, Validators.required],
    ExpireDateTo: [null as Date | null, Validators.required],
  });

  constructor(
    private fin63030Service: Fin63030Service,
    private fin26010Service: Fin26010Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage('FIN63030', 'fin/fin63030cru', this.queryForm, (form) => this.onSubmit(form));

    // ✅ 公司銀行科目下拉（APS1002）
    this.fin26010Service
      .queryAPS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Aps1002BankDropDownRow[]>) => {
          const list = Array.isArray(res?.Data) ? res.Data : [];

          const sorted = list.slice().sort((a: any, b: any) => {
            const aId = String(a?.BNK_No ?? '').trim();
            const bId = String(b?.BNK_No ?? '').trim();

            const aNum = Number(aId);
            const bNum = Number(bId);
            const aIsNum = Number.isFinite(aNum);
            const bIsNum = Number.isFinite(bNum);

            if (aIsNum && bIsNum) return aNum - bNum;
            if (aIsNum && !bIsNum) return -1;
            if (!aIsNum && bIsNum) return 1;

            return aId.localeCompare(bId, 'zh-Hant', { numeric: true, sensitivity: 'base' });
          });

          this.CompanyAccNoOptions = sorted.map((x: any) => ({
            label: `${x.BNK_No}-${x.BNK_AccName}`,
            value: x.BNK_No,
            raw: x,
          }));

          this.CompanyBankNoOptions = sorted.map((x: any) => ({
            label: `${x.BNK_No}-${x.BNK_AccName}`,
            value: x.BNK_No,
            raw: x,
          }));
        },
        error: (err) => {
          console.error('載入公司銀行下拉失敗', err);
          this.CompanyAccNoOptions = [];
          this.CompanyBankNoOptions = [];
        },
      });
  }

  ngAfterViewInit(): void {
    // ✅ table-report 會自己處理 lazy/scroll/sort，不需要再綁 dt.onLazyLoad
  }

  moneyFormat(value: any): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return n.toLocaleString('en-US');
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

  private buildQueryPayload(base: any): QueryFIN63030Request {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base?.pageSize > 0 ? base.pageSize : 30;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const payload: QueryFIN63030Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      CompanyAccNo: String(base?.CompanyAccNo ?? '').trim(),
      ExpireDateFrom: this.toYmd(base?.ExpireDateFrom),
      ExpireDateTo: this.toYmd(base?.ExpireDateTo),
      ChkNo: (base?.ChkNo ?? '').trim() || undefined,
      VouNoPaid: (base?.VouNoPaid ?? '').trim() || undefined,
      CheckStatus: (base?.CheckStatus ?? '').trim() || undefined,
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  private parseQueryResponse(res: any): { rows: QueryFIN63030Row[]; total: number } {
    const data = res?.Data;

    if (Array.isArray(data)) {
      const total =
        Number(res?.TotalCount ?? res?.totalCount ?? data?.[0]?.TotalCount ?? data.length) || data.length;
      return { rows: data, total };
    }

    if (data && typeof data === 'object') {
      const innerArr =
        (Array.isArray(data?.Data) && data.Data) ||
        (Array.isArray(data?.Items) && data.Items) ||
        (Array.isArray(data?.List) && data.List) ||
        null;

      if (innerArr) {
        const total =
          Number(data?.TotalCount ?? res?.TotalCount ?? innerArr?.[0]?.TotalCount ?? innerArr.length) || innerArr.length;
        return { rows: innerArr, total };
      }

      const maybeRow: QueryFIN63030Row = { ...(data as any) };
      const total = Number(res?.TotalCount ?? data?.TotalCount ?? 1) || 1;
      return { rows: [maybeRow], total };
    }

    return { rows: [], total: 0 };
  }

  /** ✅ 給 app-table-report 用的 queryFunction（loadMore/sort 都靠它） */
  public queryFIN63030ForReport = (body: any) =>
    this.fin63030Service.queryFIN63030(this.buildQueryPayload(body || {})).pipe(
      map((res: ApiResponse<any>) => {
        const parsed = this.parseQueryResponse(res);
        return { Data: parsed.rows, TotalCount: parsed.total, GrandTotal: null };
      })
    );

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
    this.totalRecords = 0;

    this.fin63030Service
      .queryFIN63030(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;

          this.lastQueryBody = { ...payload };
          this._currentSortBy = payload.SortBy ?? this.defaultSort;

          this.loading = false;
          this.saveQueryState();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('FIN63030 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState('FIN63030', {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  onClear(frm: any) {
    frm.reset({
      CompanyAccNo: '',
      ExpireDateFrom: null,
      ExpireDateTo: null,
      ChkNo: '',
      VouNoPaid: '',
      CheckStatus: '',
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.lastQueryBody = null;
  }

  /** =======================
   *  ✅ Dialog：到期拋轉（對齊後端）
   *  ======================= */
  openTransVoucherDialog(): void {
    this.transVoucherForm.reset({
      BNK_No: '',
      ChkNo: '',
      ExpireDateFrom: null,
      ExpireDateTo: null,
    });

    this.transVoucherDialogVisible = true;
    this.cdr.detectChanges();
  }

  closeTransVoucherDialog(): void {
    this.transVoucherDialogVisible = false;
  }

  onTransVoucherConfirm(): void {
    this.submitted = true;
    this.transVoucherForm.markAllAsTouched();
    if (this.transVoucherForm.invalid) return;

    const bnkNo = String(this.transVoucherForm.value.BNK_No ?? '').trim();
    const chkNo = String(this.transVoucherForm.value.ChkNo ?? '').trim();
    const expireFrom = this.toYmd(this.transVoucherForm.value.ExpireDateFrom as any);
    const expireTo = this.toYmd(this.transVoucherForm.value.ExpireDateTo as any);

    if (!expireFrom || !expireTo) {
      this.messageService.errorBubble('到期日區間為必填');
      return;
    }

    const body: FIN63030TransVoucherRequest = {
      ExpireDateFrom: expireFrom,
      ExpireDateTo: expireTo,
      ChkNo: chkNo || undefined,
      BNK_No: bnkNo || undefined,
    };

    this.btnLoading = true;

    this.fin63030Service
      .transVoucherFIN63030(body)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          const code = res?.ResponseBase?.ReturnCode ?? res?.ReturnCode;
          const msg = res?.ResponseBase?.ReturnMessage ?? res?.ReturnMessage;

          if (code && code !== '0000') {
            this.messageService.errorBubble(msg ?? '到期拋轉失敗');
            return;
          }

          this.messageService.successBubble(msg ?? '到期拋轉成功');
          this.transVoucherDialogVisible = false;

          this.onSubmit(this.queryForm);
        },
        error: (err: any) => {
          const api = err?.error;
          const msg =
            api?.ResponseBase?.ReturnMessage ??
            api?.ReturnMessage ??
            '到期拋轉失敗';
          console.error(err);
          this.messageService.errorBubble(msg);
          this.btnLoading = false;
        },
        complete: () => {
          this.btnLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  /** =======================
   *  ✅ 匯出（保留原本）
   *  ======================= */
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
    this.fin63030Service
      .exportFIN63030PDF(exportBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: (err) => {
          console.error(err);
          this.messageService.errorBubble('匯出失敗');
        },
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
    this.fin63030Service
      .exportFIN63030Excel(exportBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: (err) => {
          console.error(err);
          this.messageService.errorBubble('匯出失敗');
        },
        complete: () => (this.btnLoading = false),
      });
  }
}
