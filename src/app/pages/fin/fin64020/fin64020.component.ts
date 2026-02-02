/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

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

import { DropDownListService } from '@service/utility/dropDownList.service';
import { Fin26010Service, Aps1002BankDropDownRow } from '../../../service/api/fin/fin26010.service';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import {
  ApiResponse,
  Fin64020Service,
  QueryFIN64020Request,
  QueryFIN64020Row,
  SortItem,
} from '../../../service/api/fin/fin64020.service';

@UntilDestroy()
@Component({
  selector: 'app-fin64020',
  templateUrl: './fin64020.component.html',
  styleUrls: ['./fin64020.component.scss'],
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
export class FIN64020Component extends BasicQueryPageComponent<any> implements AfterViewInit {
  data: QueryFIN64020Row[] = [];
  totalRecords = 0;
  selectedItems: QueryFIN64020Row[] = [];
  lastQueryBody: any = null;

  btnLoading = false;

  /** dialog */
  collectDialogVisible = false;

  /** dialog form */
  collectForm = this.formBuilder.group({
    CollectDate: [new Date() as Date | null, Validators.required],
    CollectBankNo: ['', Validators.required],
  });

  readonly defaultSort: SortItem[] = [{ field: 'CHK_No', order: 1 }];
  private _currentSortBy: SortItem[] = this.defaultSort;

  /** ✅ 勾選條件：IsSelectable === 'Y' 才能勾 */
  isRowSelectable = (row: QueryFIN64020Row) => String(row?.IsSelectable ?? '').trim() === 'Y';

  /** ✅ table columns */
  columns: Column[] = [
    { field: 'CHK_No', header: '票據號碼' },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'BNK_No', header: '全省銀行代碼(含分行)' },
    { field: 'BNK_Name', header: '銀行名稱' },
    { field: 'CHK_ExpireDate', header: '到期日', format: (v: any) => this.formatDate(v) },
    { field: 'CHK_Amt', header: '票面金額', format: (v: any) => this.moneyFormat(v) },
    { field: 'CHK_Status_Name', header: '狀態' },
    { field: 'VouNo_Expire', header: '到期傳票編號' },
    { field: 'CHK_BNK_No', header: '託收銀行代碼(含分行)' },
    { field: 'CollectDate', header: '託收日期', format: (v: any) => this.formatDate(v) },
  ];

  /** 下拉 options */
  companyAccOptions: any[] = []; // APS1002（BNK_AccType <> '1'）
  collectBankOptions: any[] = []; // 託收銀行同來源（你也可以改用別的來源）
  chkStatusOptions: any[] = [
    { value: '', label: '全部' },
    { value: '0', label: '作廢' },
    { value: '1', label: '未異動' },
    { value: '2', label: '託收' },
    { value: '3', label: '兌現' },
    { value: '4', label: '撤票' },
    { value: '5', label: '退票' },
  ];

  /** 查詢表單（依 SP_FIN64020Query 精簡） */
  queryForm = this.formBuilder.group({
    // 公司銀行科目代號(多選) -> 逗號字串丟給 SP
    companyAccNoList: [[] as string[]],

    expireDateStart: [null as Date | null],
    expireDateEnd: [null as Date | null],

    chkNo: ['' as string],
    vouNoExpire: ['' as string],
    chkStatus: ['' as string],

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin64020Service: Fin64020Service,
    private fin26010Service: Fin26010Service,
    private dropDownListService: DropDownListService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage('FIN64020', 'fin/fin64020cru', this.queryForm, (form) =>
      this.onSubmit(form)
    );

    const fromCru = !!(history.state && history.state['fromCru'] === true);
    if (fromCru) {
      const saved = this.queryStateService.getQueryStateValue('FIN64020');
      if (saved?.formValue) {
        this.queryForm.patchValue(saved.formValue, { emitEvent: false });
        this._currentSortBy = saved.currentSortBy ?? this.defaultSort;
        this.lastQueryBody = saved.lastQueryBody ?? null;
        Promise.resolve().then(() => this.onSubmit(this.queryForm));
      }
    } else {
      this.onClear(this.queryForm);
      this.queryStateService.clearQueryState?.('FIN64020');
      this.lastQueryBody = null;
      this._currentSortBy = this.defaultSort;
    }

    // 公司銀行科目（APS1002）—依你的 SP 說明：前端先過濾 BNK_AccType <> '1'
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
              value: x.BNK_id, // 目前你 SP 用 CHK_BNK_No 比對，所以先用 BNK_id 當 key（跟你 FIN63020 同做法）
              raw: x,
            }));

          this.companyAccOptions = options;
          this.collectBankOptions = options; // 託收銀行同一份 options（後端 update 也用同一 key）
          this.cdr.detectChanges();
        },
        error: () => {
          this.companyAccOptions = [];
          this.collectBankOptions = [];
          this.cdr.detectChanges();
        },
      });
  }

  // ========= UI helper =========
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

  // ========= Query payload =========
  private buildQueryPayload(base: any): QueryFIN64020Request {
    const pageIndex = Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize = Number.isFinite(base?.pageSize) && base?.pageSize > 0 ? base.pageSize : 30;
    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const list: string[] = Array.isArray(base?.companyAccNoList) ? base.companyAccNoList : [];
    const companyAccNoList = list.map((x) => String(x ?? '').trim()).filter(Boolean).join(',');

    const payload: QueryFIN64020Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      CompanyAccNoList: companyAccNoList || undefined,
      ExpireDateFrom: this.toYmd(base?.expireDateStart),
      ExpireDateTo: this.toYmd(base?.expireDateEnd),
      ChkNo: (base?.chkNo ?? '').trim() || undefined,
      VouNoExpire: (base?.vouNoExpire ?? '').trim() || undefined,
      ChkStatus: (base?.chkStatus ?? '').trim() || undefined,
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  private parseQueryResponse(res: any): { rows: QueryFIN64020Row[]; total: number } {
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

    this.fin64020Service
      .queryFIN64020(payload)
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
          console.error('FIN64020 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState('FIN64020', {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  onClear(frm: any) {
    frm.reset({
      companyAccNoList: [],
      expireDateStart: null,
      expireDateEnd: null,
      chkNo: '',
      vouNoExpire: '',
      chkStatus: '',
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.selectedItems = [];
    this.lastQueryBody = null;
  }

  // ========= 託收 dialog =========
  onCollect(): void {
    const chkNoList = this.getSelectedChkNoList();
    if (!chkNoList.length) {
      this.messageService.errorBubble('請先勾選可託收的資料（狀態不可為「託收/兌現」）');
      return;
    }

    this.collectForm.reset({ CollectDate: new Date(), CollectBankNo: '' });
    this.collectDialogVisible = true;
    this.cdr.detectChanges();
  }

  onCollectConfirm(): void {
    this.collectForm.markAllAsTouched();
    if (this.collectForm.invalid) return;

    const chkNoList = this.getSelectedChkNoList();
    if (!chkNoList.length) {
      this.messageService.errorBubble('請先勾選可託收的資料');
      return;
    }

    const collectDate = this.toYmd(this.collectForm.value.CollectDate as any);
    const collectBankNo = String(this.collectForm.value.CollectBankNo ?? '').trim();

    if (!collectDate) {
      this.messageService.errorBubble('託收日期不正確');
      return;
    }
    if (!collectBankNo) {
      this.messageService.errorBubble('請選擇託收銀行');
      return;
    }

    this.btnLoading = true;

    this.fin64020Service
      .collectFIN64020({
        ChkNoList: chkNoList,
        CollectDate: collectDate,
        CollectBankNo: collectBankNo,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess === false) {
            this.messageService.errorBubble(res?.Message ?? '支票託收失敗');
            return;
          }

          this.messageService.successBubble('支票託收成功');
          this.collectDialogVisible = false;

          // 先前端即時更新畫面（後端完成後再以重查為準）
          this.data = this.data.map((r) => {
            const no = String(r?.CHK_No ?? '').trim();
            if (chkNoList.includes(no)) {
              return {
                ...r,
                CHK_Status: '2',
                CHK_Status_Name: '託收',
                IsSelectable: 'N',
                CHK_BNK_No: collectBankNo,
                CollectDate: collectDate,
                CollectBankNo: collectBankNo,
              };
            }
            return r;
          });

          this.selectedItems = [];
          this.cdr.detectChanges();
        },
        error: () => this.messageService.errorBubble('支票託收失敗'),
        complete: () => {
          this.btnLoading = false;
          this.cdr.detectChanges();
          // 以重查確保資料一致
          this.onSubmit(this.queryForm);
        },
      });
  }

  onCollectCancel(): void {
    this.collectDialogVisible = false;
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
    this.fin64020Service
      .queryFIN64020(payload)
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
    this.fin64020Service
      .queryFIN64020(payload)
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

    this.fin64020Service
      .exportFIN64020PDF(exportBody)
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

    this.fin64020Service
      .exportFIN64020Excel(exportBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: () => this.messageService.errorBubble('匯出失敗'),
        complete: () => (this.btnLoading = false),
      });
  }
}
