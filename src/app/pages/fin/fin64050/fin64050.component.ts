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
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import {
  ApiResponse,
  Fin64050Service,
  QueryFIN64050Request,
  QueryFIN64050Row,
  SortItem,
} from '../../../service/api/fin/fin64050.service';

@UntilDestroy()
@Component({
  selector: 'app-fin64050',
  templateUrl: './fin64050.component.html',
  styleUrls: ['./fin64050.component.scss'],
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
    InputTextComponent,
    ButtonComponent,
    TableComponent,
  ],
})
export class FIN64050Component extends BasicQueryPageComponent<any> implements AfterViewInit {
  data: QueryFIN64050Row[] = [];
  totalRecords = 0;

  /** 用 ID 當 dataKey，因為 SP Update 收的是 IdList */
  selectedItems: QueryFIN64050Row[] = [];
  lastQueryBody: any = null;

  btnLoading = false;

  /** dialog */
  bounceDialogVisible = false;

  /** dialog form：退票日期必填，備註可選 */
  bounceForm = this.formBuilder.group({
    BackDate: [new Date() as Date | null, Validators.required],
    CHK_Comment: ['' as string],
  });

  readonly defaultSort: SortItem[] = [{ field: 'CHK_No', order: 1 }];
  private _currentSortBy: SortItem[] = this.defaultSort;

  /** ✅ 勾選規則：狀態=5(退票) 顯示 X + 不可勾選 */
  isRowSelectable = (row: QueryFIN64050Row) => {
    const status = String(row?.CHK_Status ?? '').trim();
    if (status === '5' || String(row?.CHK_Status_Name ?? '').trim() === '退票') return false;

    // 若後端有回 IsSelectable，且你想尊重它，也可再加：
    // const api = String(row?.IsSelectable ?? '').trim();
    // if (api) return api === 'Y';

    return true;
  };

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

  columns: Column[] = [
    { field: 'CHK_No', header: '票據號碼' },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'BNK_No', header: '全省銀行代碼(含分行)' },
    { field: 'BNK_Name', header: '銀行名稱' },
    { field: 'CHK_ExpireDate', header: '到期日', format: (v: any) => this.formatDate(v) },
    { field: 'CHK_BackDate', header: '退票日', format: (v: any) => this.formatDate(v) },
    { field: 'CHK_Amt', header: '票面金額', format: (v: any) => this.moneyFormat(v) },
    { field: 'CHK_Status_Name', header: '票據狀態' },

    // ARS4005
    { field: 'Bounce_Tran_Status', header: '退票檔狀態' },
    { field: 'Bounce_VouNo', header: '退票傳票編號' },
    { field: 'Bounce_Comment', header: '退票備註' },
    { field: 'Bounce_RCV_No', header: '收款單號' },
  ];

  /** 查詢表單：全部非必填 */
  queryForm = this.formBuilder.group({
    backDateStart: [null as Date | null],
    backDateEnd: [null as Date | null],
    chkNo: ['' as string],

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(private fin64050Service: Fin64050Service, private cdr: ChangeDetectorRef) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage('FIN64050', 'fin/fin64050cru', this.queryForm, (form) =>
      this.onSubmit(form)
    );

    const fromCru = !!(history.state && history.state['fromCru'] === true);
    if (fromCru) {
      const saved = this.queryStateService.getQueryStateValue('FIN64050');
      if (saved?.formValue) {
        this.queryForm.patchValue(saved.formValue, { emitEvent: false });
        this._currentSortBy = saved.currentSortBy ?? this.defaultSort;
        this.lastQueryBody = saved.lastQueryBody ?? null;
        Promise.resolve().then(() => this.onSubmit(this.queryForm));
      }
    } else {
      this.onClear(this.queryForm);
      this.queryStateService.clearQueryState?.('FIN64050');
      this.lastQueryBody = null;
      this._currentSortBy = this.defaultSort;

      // ✅ 你要「可不輸入任何條件」：我們這裡直接自動查一次也可以（看你要不要）
      // Promise.resolve().then(() => this.onSubmit(this.queryForm));
    }
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  private buildQueryPayload(base: any): QueryFIN64050Request {
    const pageIndex = Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize = Number.isFinite(base?.pageSize) && base?.pageSize > 0 ? base.pageSize : 30;
    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const payload: QueryFIN64050Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      BackDateFrom: this.toYmd(base?.backDateStart),
      BackDateTo: this.toYmd(base?.backDateEnd),
      ChkNo: (base?.chkNo ?? '').trim() || undefined,

      /** ✅ 你指定：查 2=託收、5=退票 */
      ChkStatusList: '2,5',
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  private parseQueryResponse(res: any): { rows: QueryFIN64050Row[]; total: number } {
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

    this.fin64050Service
      .queryFIN64050(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);

          /** ✅ 保險：若後端沒做 ChkStatusList，前端再過濾一次 2/5 */
          const filtered = (parsed.rows ?? []).filter((r) => {
            const s = String(r?.CHK_Status ?? '').trim();
            return s === '2' || s === '5';
          });

          this.data = filtered;
          this.totalRecords = parsed.total; // 若你想以 filtered.length 也可以
          this.lastQueryBody = { ...payload };
          this._currentSortBy = payload.SortBy ?? this.defaultSort;
          this.loading = false;
          this.cdr.detectChanges();
          this.saveQueryState();
        },
        error: (err: any) => {
          console.error('FIN64050 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState('FIN64050', {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  onClear(frm: any) {
    frm.reset({
      backDateStart: null,
      backDateEnd: null,
      chkNo: '',
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.selectedItems = [];
    this.lastQueryBody = null;
  }

  // ========= 支票退票 dialog =========
  onBounce(): void {
    const idList = this.getSelectedIdList();
    if (!idList.length) {
      this.messageService.errorBubble('請先勾選可退票的資料（狀態=退票(5) 不可勾）');
      return;
    }

    this.bounceForm.reset({ BackDate: new Date(), CHK_Comment: '' });
    this.bounceDialogVisible = true;
    this.cdr.detectChanges();
  }

  onBounceConfirm(): void {
    this.bounceForm.markAllAsTouched();
    if (this.bounceForm.invalid) return;

    const idList = this.getSelectedIdList();
    if (!idList.length) {
      this.messageService.errorBubble('請先勾選可退票的資料');
      return;
    }

    const backDate = this.toYmd(this.bounceForm.value.BackDate as any);
    const comment = String(this.bounceForm.value.CHK_Comment ?? '').trim();

    if (!backDate) {
      this.messageService.errorBubble('退票日期不正確');
      return;
    }

    this.btnLoading = true;

    this.fin64050Service
      .updateFIN64050({
        BackDate: backDate,
        IdList: idList,
        CHK_Comment: comment || undefined,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess === false) {
            this.messageService.errorBubble(res?.Message ?? '退票失敗');
            return;
          }

          this.messageService.successBubble('退票成功');
          this.bounceDialogVisible = false;

          // 前端先更新：狀態=5 → 不可勾
          const idSet = new Set(idList);
          this.data = this.data.map((r) => {
            if (idSet.has(Number(r?.ID))) {
              return {
                ...r,
                CHK_Status: '5',
                CHK_Status_Name: '退票',
                CHK_BackDate: backDate,
                Bounce_Comment: comment || r?.Bounce_Comment || null,
                IsSelectable: 'N',
              };
            }
            return r;
          });

          this.selectedItems = [];
          this.cdr.detectChanges();
        },
        error: () => this.messageService.errorBubble('退票失敗'),
        complete: () => {
          this.btnLoading = false;
          this.cdr.detectChanges();
          this.onSubmit(this.queryForm); // 重查確保一致
        },
      });
  }

  onBounceCancel(): void {
    this.bounceDialogVisible = false;
  }

  private getSelectedIdList(): number[] {
    const list = Array.isArray(this.selectedItems) ? this.selectedItems : [];
    return list
      .filter((r) => this.isRowSelectable(r))
      .map((r) => Number(r?.ID))
      .filter((n) => Number.isFinite(n));
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
    this.fin64050Service
      .queryFIN64050(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          const filtered = (parsed.rows ?? []).filter((r) => {
            const s = String(r?.CHK_Status ?? '').trim();
            return s === '2' || s === '5';
          });
          this.data = filtered;
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
    this.fin64050Service
      .queryFIN64050(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          const filtered = (parsed.rows ?? []).filter((r) => {
            const s = String(r?.CHK_Status ?? '').trim();
            return s === '2' || s === '5';
          });
          this.data = filtered;
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

    this.fin64050Service
      .exportFIN64050PDF(exportBody)
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

    this.fin64050Service
      .exportFIN64050Excel(exportBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: () => this.messageService.errorBubble('匯出失敗'),
        complete: () => (this.btnLoading = false),
      });
  }
}
