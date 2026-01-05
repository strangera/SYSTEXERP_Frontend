/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

import { CounterNameService } from '@service/basic/queryTLTTALENT.service';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TLS41020Service } from '../../../service/api/tls/tls41020.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';

// 與後端一致：order 用 1 / -1
type ApiSort = { field: string; order: number };

@UntilDestroy()
@Component({
  selector: 'app-tls41020',
  templateUrl: './tls41020.component.html',
  styleUrl: './tls41020.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    TableComponent,
    TranslateModule,
    DropdownComponent,
    InputTextComponent,
  ],
})
export class TLS41020Component
  extends BasicQueryPageComponent<any>
  implements OnInit, AfterViewInit
{
  @ViewChild('tlsTable') tlsTable!: TableComponent;

  selectedItems: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  EDC_Status_Option: any[] = [
    { value: 'A', label: '啟用' },
    { value: 'C', label: '停用' },
  ];

  data: any[] = [];
  totalRecords = 0;

  // ✅ 參考 FIN64010：保存查詢狀態
  lastQueryBody: any = null;
  readonly defaultSort: ApiSort[] = [{ field: 'ECR_No', order: 1 }];
  private _currentSortBy: ApiSort[] = this.defaultSort;

  columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'EDC_BegDate', header: '啟用日期', visible: true, format: this.formatDateTime },
    { field: 'EDC_EndDate', header: '停用日期', visible: true, format: this.formatDateTime },
    { field: 'EDC_Status1Name', header: '中信刷卡機狀態', visible: true },
    { field: 'EDC_Status2Name', header: '聯合刷卡機狀態', visible: true },
    { field: 'ECR_TLT_No', header: '專櫃編號', visible: true },
    { field: 'ECR_TLT_Name', header: '櫃位名稱', visible: true },
    { field: 'ECR_LocNo', header: '地點代號', visible: true },
    { field: 'LOCATION_Name', header: '地點名稱', visible: true },
    { field: 'EDC_IP1', header: '中信刷卡機IP', visible: true },
    { field: 'EDC_TmID1', header: '中信刷卡機端末機號', visible: true },
    { field: 'EDC_IP2', header: '聯合刷卡機IP', visible: true },
    { field: 'EDC_TmID2', header: '聯合刷卡機端末機號', visible: true },
  ];

  private readonly _allowSortFields = new Set(
    this.columns.map((c) => c.field).filter(Boolean) as string[]
  );

  /** ✅ 查詢表單（重點：用 createPaginationConfig(this.defaultSort) 讓 PageSize 進型別） */
  queryForm = this.formBuilder.group({
    ECR_No: [], // MultiSelect (可多台)
    EDC_No: [],
    EDC_BegDate_From: [],
    EDC_BegDate_To: [],
    EDC_EdnDate_From: [],
    EDC_EdnDate_To: [],
    EDC_Status1: [],
    EDC_Status2: [],
    ECR_TLT_No: [],
    EDC_IP1: [],
    EDC_IP2: [],
    EDC_IP3: [],
    EDC_TmID1: [],
    EDC_TmID2: [],
    EDC_TmID3: [],
    ...createPaginationConfig(this.defaultSort as any), // ✅ 關鍵：把 PageIndex/PageSize/SortBy 真的加進來
  });

  constructor(
    private tls41020Service: TLS41020Service,
    private ECRNoSvc: ECRNoService,
    private counterNameService: CounterNameService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41020', '/tls/tls41020cru', this.queryForm);

    // 收銀機號下拉
    this.ECRNoSvc.getECRNo()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.ECRNoOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });

    // 專櫃/櫃位下拉
    this.counterNameService.getCounters()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.CounterOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });

    // ✅ 還原查詢條件（參考 FIN64010）
    const saved = this.queryStateService.getQueryStateValue('TLS41020');
    if (saved?.formValue) {
      this.queryForm.patchValue(saved.formValue, { emitEvent: false });
      this._currentSortBy = Array.isArray(saved.currentSortBy) && saved.currentSortBy.length
        ? saved.currentSortBy
        : this.defaultSort;
      this.lastQueryBody = saved.lastQueryBody ?? null;

      Promise.resolve().then(() => this.onSubmit(this.queryForm));
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const dt: any = (this.tlsTable as any)?.dt;
      if (dt?.onLazyLoad) {
        dt.onLazyLoad.pipe(untilDestroyed(this)).subscribe((e: any) => {
          const pageSize = this.getPageSize(e);
          const first = Number(e?.first ?? 0);
          const pageIndex = Math.floor(first / pageSize) + 1;
          this.fireQueryByPage(pageIndex, pageSize, e?.multiSortMeta);
        });
      }
    });
  }

  /** ✅ 統一 pageSize 的唯一入口：event.rows → form.PageSize → fallback */
  private getPageSize(event?: any): number {
    const raw: any = this.queryForm.getRawValue();
    const fromEvent = Number(event?.pageSize ?? event?.rows);
    if (Number.isFinite(fromEvent) && fromEvent > 0) return fromEvent;

    const fromForm = Number(raw?.PageSize);
    if (Number.isFinite(fromForm) && fromForm > 0) return fromForm;

    return 20;
  }

  /** ✅ 查詢：回到第一頁，pageSize 一律走 getPageSize() */
  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const raw: any = this.queryForm.getRawValue();
    const pageSize = this.getPageSize(); // ✅ 統一

    const payload = this.buildPayload(raw, {
      pageIndex: 1,
      pageSize,
      sort: this._currentSortBy?.length ? this._currentSortBy : this.defaultSort,
    });

    this.loading = true;
    this.messageService.blockUi();

    this.tls41020Service.queryTLS41020(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          this.data = res?.Data || [];
          this.totalRecords = Number(res?.TotalCount ?? this.data.length) || 0;

          this.lastQueryBody = { ...payload };
          this._currentSortBy = payload.SortBy ?? this.defaultSort;

          this.saveQueryState();
          this.cdr.detectChanges();
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.messageService.errorBubble('資料載入失敗');
          this.cdr.detectChanges();
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
  }

  /** 懶載入（保留：若 TableComponent 直接呼叫 onLazyLoadData） */
  override onLazyLoadData(event: any): void {
    const raw: any = this.queryForm.getRawValue();
    const pageSize = this.getPageSize(event);
    const pageIndex =
      Number(event?.pageIndex) ||
      (Number.isFinite(event?.first) ? Math.floor(Number(event.first) / pageSize) + 1 : 1);

    let sort: ApiSort[] | undefined;

    if (Array.isArray(event?.SortBy) && event.SortBy.length) {
      sort = event.SortBy.map((m: any) => ({
        field: this.mapSortField(String(m.field)),
        order: m.order === -1 ? -1 : 1,
      }));
    } else if (Array.isArray(event?.multiSortMeta) && event.multiSortMeta.length) {
      sort = event.multiSortMeta.map((m: any) => ({
        field: this.mapSortField(String(m.field)),
        order: m.order === -1 ? -1 : 1,
      }));
    } else if (event?.sortField) {
      sort = [
        {
          field: this.mapSortField(String(event.sortField)),
          order: event.sortOrder === -1 ? -1 : 1,
        },
      ];
    }

    if (!sort || !sort.length) sort = this._currentSortBy?.length ? this._currentSortBy : this.defaultSort;

    const payload = this.buildPayload(raw, { pageIndex, pageSize, sort });
    this._currentSortBy = payload.SortBy ?? this.defaultSort;

    this.loading = true;
    this.tls41020Service.queryTLS41020(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          this.data = res?.Data || [];
          this.totalRecords = Number(res?.TotalCount ?? 0) || 0;

          this.lastQueryBody = { ...payload };
          this.saveQueryState();
          this.cdr.detectChanges();
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.messageService.errorBubble('資料載入失敗');
          this.cdr.detectChanges();
        },
        complete: () => (this.loading = false),
      });
  }

  /** ✅ 統一用 dt.onLazyLoad 的查詢（參考 FIN64010） */
  private fireQueryByPage(pageIndex: number, pageSize: number, sortMeta?: any) {
    const raw: any = this.queryForm.getRawValue();

    let sortBy: ApiSort[] | undefined;
    if (Array.isArray(sortMeta) && sortMeta.length) {
      const filtered = sortMeta
        .filter((s: any) => this._allowSortFields.has(String(s?.field)))
        .map((s: any) => ({
          field: this.mapSortField(String(s.field)),
          order: Number(s.order) === -1 ? -1 : 1,
        }));
      if (filtered.length) sortBy = filtered;
    }
    if (!sortBy || !sortBy.length) sortBy = this._currentSortBy?.length ? this._currentSortBy : this.defaultSort;

    const payload = this.buildPayload(raw, { pageIndex, pageSize, sort: sortBy });
    this._currentSortBy = payload.SortBy ?? this.defaultSort;

    this.loading = true;
    this.tls41020Service.queryTLS41020(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          this.data = res?.Data || [];
          this.totalRecords = Number(res?.TotalCount ?? 0) || 0;

          this.lastQueryBody = { ...payload };
          this.saveQueryState();
          this.cdr.detectChanges();
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.messageService.errorBubble('資料載入失敗');
          this.cdr.detectChanges();
        },
        complete: () => (this.loading = false),
      });
  }

  /** 將前端顯示欄位名稱轉成後端排序欄位名稱 */
  private mapSortField(field: string): string {
    switch (field) {
      case 'EDC_Status1Name':
        return 'EDC_Status1';
      case 'EDC_Status2Name':
        return 'EDC_Status2';
      default:
        return field;
    }
  }
onClearForm(): void {
  // 你要的「一律用 pageSize」：這裡決定預設 pageSize
  const defaultPageSize = 20;

  this.queryForm.reset(
    {
      // === 查詢欄位 ===
      ECR_No: null,
      EDC_No: null,
      EDC_BegDate_From: null,
      EDC_BegDate_To: null,
      EDC_EdnDate_From: null,
      EDC_EdnDate_To: null,
      EDC_Status1: null,
      EDC_Status2: null,
      ECR_TLT_No: null,
      EDC_IP1: null,
      EDC_IP2: null,
      EDC_IP3: null,
      EDC_TmID1: null,
      EDC_TmID2: null,
      EDC_TmID3: null,

      // === 分頁/排序欄位（⚠️ 用「單值」不要用 createPaginationConfig）===
      pageIndex: 1,
      pageSize: defaultPageSize,
      SortBy: this.defaultSort, // SortMeta[]（一維）
    } as any,
    { emitEvent: false }
  );

  this.submitted = false;
  this.data = [];
  this.totalRecords = 0;
  this.lastQueryBody = null;

  // 同步清掉狀態
  this._currentSortBy = this.defaultSort;
  this.queryStateService.setQueryState('TLS41020', {
    formValue: this.queryForm.getRawValue(),
    currentSortBy: this._currentSortBy,
    lastQueryBody: null,
  });
}


  /** 刪除：改用 id 作為鍵值（支援單筆或多筆） */
  onDelete(data: any | any[]): void {
    const items = Array.isArray(data) ? data : [data];
    const idList = items
      .map((x) => x?.id)
      .filter((id) => id !== null && id !== undefined);

    if (!idList.length) {
      this.messageService.errorBubble('無法刪除：缺少有效鍵值 (id)');
      return;
    }

    const body = { idList };
    this.tls41020Service.deleteTLS41020(body)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          if (res?.Status === '0000') {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          } else {
            this.messageService.errorBubble(`刪除失敗: ${res?.Message || ''}`);
          }
        },
        error: () => this.messageService.errorBubble('刪除發生錯誤'),
      });
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState('TLS41020', {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  /** 組 API payload（SortBy 送 1/-1） */
  private buildPayload(
    raw: any,
    opts: { pageIndex: number; pageSize: number; sort: ApiSort[] }
  ) {
    const payload: any = {
      ECR_No: raw?.ECR_No,
      EDC_No: raw?.EDC_No,

      EDC_BegDateStart: raw?.EDC_BegDate_From,
      EDC_BegDateEnd: raw?.EDC_BegDate_To,
      EDC_EndDateStart: raw?.EDC_EdnDate_From,
      EDC_EndDateEnd: raw?.EDC_EdnDate_To,

      EDC_Status1: raw?.EDC_Status1 ?? null,
      EDC_Status2: raw?.EDC_Status2 ?? null,

      ECR_TLT_No: raw?.ECR_TLT_No,

      EDC_IP1: raw?.EDC_IP1,
      EDC_IP2: raw?.EDC_IP2,
      EDC_IP3: raw?.EDC_IP3,
      EDC_TmID1: raw?.EDC_TmID1,
      EDC_TmID2: raw?.EDC_TmID2,
      EDC_TmID3: raw?.EDC_TmID3,

      SortBy: opts.sort,
      PageIndex: opts.pageIndex,
      PageSize: opts.pageSize,
    };

    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v == null) delete payload[k];
    });

    return payload;
  }

  /** 日期格式化 (yyyy/MM/dd) */
  formatDateTime(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
  }
}
