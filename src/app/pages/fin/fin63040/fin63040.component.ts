/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SortMeta } from 'primeng/api';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

// ✅ app-table
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import {
  Column,
  createPaginationConfig,
} from '../../../shared/componentkit/table/table.model';

// Base
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

// 下拉：公司銀行科目代號
import {
  Aps1002BankDropDownRow,
  Fin26010Service,
} from '../../../service/api/fin/fin26010.service';

// API：FIN63040
import {
  ApiResponse,
  Fin63040Service,
  QueryFIN63040Request,
  QueryFIN63040Row,
  SortItem,
} from '../../../service/api/fin/fin63040.service';

@UntilDestroy()
@Component({
  selector: 'app-fin63040',
  templateUrl: './fin63040.component.html',
  styleUrls: ['./fin63040.component.scss'],
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

    TableComponent,
  ],
})
export class FIN63040Component
  extends BasicQueryPageComponent<any>
  implements AfterViewInit
{
  override ProgNo = 'FIN63040';

  /* ----------------- 列表狀態 ----------------- */
  data: QueryFIN63040Row[] = [];
  totalRecords = 0;
  selectedItems: QueryFIN63040Row[] = [];
  lastQueryBody: any = null;

  btnLoading = false;

  /** ✅ 預設排序：CheckNo */
  readonly defaultSort: SortItem[] = [{ field: 'CheckNo', order: 1 }];

  /** ✅ 目前排序（用來避免 lazyLoad 變成 ID） */
  private _currentSortBy: SortItem[] = this.defaultSort;

  /** ✅ 只允許 columns 中的欄位做排序 */
  private _allowSortFields!: Set<string>;

  /* ----------------- 下拉 options ----------------- */
  BankCodeOptions: any[] = [];

  /* ----------------- dialog：支票兌現 ----------------- */
  cashDialogVisible = false;

  cashForm = this.formBuilder.group({
    PayDate: [new Date() as Date | null, Validators.required],
  });

  /* ----------------- 顯示轉換 ----------------- */
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
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(d.getDate()).padStart(2, '0')}`;
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

  /* ----------------- 勾選條件 ----------------- */
  isRowSelectable = (row: QueryFIN63040Row) =>
    String(row?.CanPickupYn ?? '').toUpperCase() === 'Y';

  /* ----------------- columns ----------------- */
  columns: Column[] = [
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

  /* ----------------- 查詢表單 ----------------- */
  queryForm = this.formBuilder.group({
    CompanyAccNo: ['' as string, Validators.required],
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
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN63040', 'fin/fin63040cru', this.queryForm, (form) =>
      this.onSubmit(form)
    );

    // ✅ 允許排序欄位白名單（避免變 ID）
    this._allowSortFields = new Set(
      this.columns.map((c) => c.field).filter(Boolean) as string[]
    );

    // 公司銀行科目代號下拉
    this.fin26010Service
      .queryAPS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Aps1002BankDropDownRow[]>) => {
          const list = Array.isArray(res?.Data) ? res.Data : [];
          this.BankCodeOptions = list.map((x) => ({
            label: `${x.BNK_DepositAccNo}-${x.BNK_BRANCHNAME}`,
            value: x.BNK_DepositAccNo,
            raw: x,
          }));
        },
        error: (err) => {
          console.error('載入銀行代號下拉失敗', err);
          this.BankCodeOptions = [];
        },
      });
  }

  /* ----------------- ✅ lazy load：接管排序/分頁 ----------------- */
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

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  private buildQueryPayload(base: any): QueryFIN63040Request {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base?.pageSize > 0 ? base.pageSize : 30;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const payload: QueryFIN63040Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      CompanyAccNo: String(base?.CompanyAccNo ?? '').trim(),
      ChkNo: (base?.ChkNo ?? '').trim() || undefined,

      PayDateFrom: this.toYmd(base?.PayDateFrom),
      PayDateTo: this.toYmd(base?.PayDateTo),
      ExpireDateFrom: this.toYmd(base?.ExpireDateFrom),
      ExpireDateTo: this.toYmd(base?.ExpireDateTo),
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

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
        const total =
          Number(data?.TotalCount ?? res?.TotalCount ?? innerArr.length) || innerArr.length;
        return { rows: innerArr, total };
      }

      const maybeRow: QueryFIN63040Row = { ...(data as any) };
      const total = Number(res?.TotalCount ?? data?.TotalCount ?? 1) || 1;
      return { rows: [maybeRow], total };
    }

    return { rows: [], total: 0 };
  }

  /** ✅ 核心：把 table 的 sortMeta 過濾掉 ID，沒有就沿用上一頁 sort */
  private fireQueryByPage(pageIndex: number, pageSize: number, sortMeta?: SortMeta[] | any) {
    const raw = this.queryForm.getRawValue();

    let sortBy: SortItem[] | undefined;

    if (Array.isArray(sortMeta) && sortMeta.length) {
      const filtered = sortMeta
        .filter((s: any) => this._allowSortFields.has(String(s?.field)))
        .map((s: any) => ({
          field: String(s.field),
          order: Number(s.order) || 1,
        }));

      if (filtered.length) sortBy = filtered;
    }

    if (!sortBy || !sortBy.length) {
      sortBy = this._currentSortBy?.length ? this._currentSortBy : this.defaultSort;
    }

    const payload = this.buildQueryPayload({
      ...raw,
      pageIndex,
      pageSize,
      SortBy: sortBy,
    });

    this._currentSortBy = payload.SortBy ?? this.defaultSort;

    this.loading = true;
    this.fin63040Service
      .queryFIN63040(payload)
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

  /* ----------------- 查詢（第一頁） ----------------- */
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

    this.fin63040Service
      .queryFIN63040(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;
          this.lastQueryBody = { ...payload };

          // ✅ 記住第一頁排序（讓第二頁沿用，不被 ID 蓋掉）
          this._currentSortBy = payload.SortBy ?? this.defaultSort;

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('FIN63040 query API error:', err);
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

    this._currentSortBy = this.defaultSort; // ✅ reset sort
  }

  /* ----------------- 進 CRU ----------------- */
  override onDetail(row: QueryFIN63040Row) {
    const chkNo = String(row?.CheckNo ?? '').trim();
    if (!chkNo) return;

    this.router.navigate([`account/${this.cruPage.toLowerCase()}`], {
      queryParams: { ChkNo: chkNo },
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: row,
        fromRoute: this.router.url,
        queryConditions: { ChkNo: chkNo },
      },
    });
  }

  override onEdit(row: QueryFIN63040Row) {
    const chkNo = String(row?.CheckNo ?? '').trim();
    if (!chkNo) return;

    this.router.navigate([`account/${this.cruPage.toLowerCase()}`], {
      queryParams: { ChkNo: chkNo },
      state: {
        crudstatus: CRUDStatus.Edit,
        rowdata: row,
        fromRoute: this.router.url,
        queryConditions: { ChkNo: chkNo },
      },
    });
  }

  /* ----------------- ✅ 支票兌現 ----------------- */
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

    this.btnLoading = true;

    this.fin63040Service
      .updateFIN63040Detail({
        PayDate: payDate,
        ChkNoList: chkNoList,
      } as any)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess === false) {
            this.messageService.errorBubble(res?.Message ?? '支票兌現失敗');
            return;
          }

          this.messageService.successBubble('支票兌現成功');
          this.cashDialogVisible = false;

          this.data = this.data.map((r) => {
            const no = String(r?.CheckNo ?? '').trim();
            if (chkNoList.includes(no)) {
              return { ...r, PayDate: payDate, CheckStatus: '3' };
            }
            return r;
          });

          this.selectedItems = [];
          this.cdr.detectChanges();
        },
        error: () => this.messageService.errorBubble('支票兌現失敗'),
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

  /* ----------------- 匯出 ----------------- */
  private getFilenameFromHeader(
    contentDisposition: string | null,
    defaultExtension: string
  ): string {
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
}
