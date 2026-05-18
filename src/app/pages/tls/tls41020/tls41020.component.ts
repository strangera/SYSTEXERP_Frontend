/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize, Observable } from 'rxjs';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { SortMeta } from 'primeng/api';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';

import { CounterNameService } from '@service/basic/queryTLTTALENT.service';
import { TLS41020Service } from '../../../service/api/tls/tls41020.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';

// 與後端一致：order 用 1 / -1
interface ApiSort { field: string; order: number }

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
    TranslateModule,
    DropdownComponent,
    InputTextComponent,
    TableReportComponent,
  ],
})
export class TLS41020Component extends BasicQueryPageComponent<any> implements OnInit {
  selectedItems: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  EDC_Status_Option: any[] = [
    { value: 'A', label: '啟用' },
    { value: 'C', label: '停用' },
  ];

  data: any[] = [];
  totalRecords = 0;

  /** table-report：最後查詢條件（排序/捲動載入會沿用） */
  lastQueryBody: any = null;

  /** 你原本的預設排序 */
  readonly defaultSort: ApiSort[] = [{ field: 'ECR_No', order: 1 }];

  /** table-report：查詢函式 */
  queryFunction = (body: any): Observable<any> => this.tls41020Service.queryTLS41020(body);

  columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
    { field: 'EDC_BegDate', header: '啟用日期', visible: true, format: this.formatDateTime },
    { field: 'EDC_EndDate', header: '停用日期', visible: true, format: this.formatDateTime },

    // 刷卡機狀態
    { field: 'EDC_Status1Name', header: '中信刷卡機狀態', visible: true },
    { field: 'EDC_Status2Name', header: '聯合刷卡機狀態', visible: true },
    { field: 'EDC_Status3Name', header: '第三台刷卡機狀態', visible: true }, // 補字串名稱

    // 專櫃與地點資料
    { field: 'ECR_TLT_No', header: '專櫃編號', visible: true },
    { field: 'ECR_TLT_Name', header: '櫃位名稱', visible: true },
    { field: 'ECR_LocNo', header: '地點代號', visible: true },
    { field: 'LOCATION_Name', header: '地點名稱', visible: true },

    // 第一台 (中信)
    { field: 'EDC_IP1', header: '中信刷卡機IP', visible: true },
    { field: 'EDC_TmID1', header: '中信刷卡機端末機號', visible: true },

    // 第二台 (聯合)
    { field: 'EDC_IP2', header: '聯合刷卡機IP', visible: true },
    { field: 'EDC_TmID2', header: '聯合刷卡機端末機號', visible: true },

    // 第三台 (後端新增)
    { field: 'EDC_IP3', header: '第三台刷卡機IP', visible: true },
    { field: 'EDC_TmID3', header: '第三台刷卡機端末機號', visible: true },

    // 審核異動欄位 (通常預設隱藏 visible: false，保留給使用者去欄位控制開啟)
    { field: 'CRT_Date', header: '建立日期', visible: false, format: this.formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: this.formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }
  ];

  private readonly _allowSortFields = new Set(
    this.columns.map((c) => c.field).filter(Boolean) as string[]
  );

  /** ✅ 查詢表單：含 PageIndex / PageSize / SortBy */
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
    ...createPaginationConfig(this.defaultSort as any),
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
        this.ECRNoOptions = res || [];
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

    // ✅ 只從 CRU 回來才還原
    const fromCru =
      !!(history.state && history.state['fromCru']) ||
      sessionStorage.getItem('TLS41020_fromCru') === '1';

    if (fromCru) {
      const saved = this.queryStateService.getQueryStateValue('TLS41020');
      if (saved?.formValue) {
        this.queryForm.patchValue(saved.formValue, { emitEvent: false });

        // lastQueryBody 若存在就沿用；沒有就用 form 組一次
        this.lastQueryBody = saved.lastQueryBody ?? this.buildPayload(this.queryForm.getRawValue(), {
          pageIndex: Number(saved?.formValue?.PageIndex ?? 1) || 1,
          pageSize: Number(saved?.formValue?.PageSize ?? 20) || 20,
          sort: this.normalizeSortForApi(saved?.formValue?.SortBy) || this.defaultSort,
        });

        // ✅ 還原後自動查詢（用 lastQueryBody）
        Promise.resolve().then(() => this.runQuery(this.lastQueryBody));

        sessionStorage.removeItem('TLS41020_fromCru');
      }
    } else {
      // ✅ 非 CRU 回來：回預設條件
      this.resetToDefaultQuery();
    }
  }

  /** ✅ 非 CRU 進來時的「預設條件」 */
  private resetToDefaultQuery(): void {
    const defaultPageSize = 20;

    this.queryForm.reset(
      {
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
        PageIndex: 1,
        PageSize: defaultPageSize,
        SortBy: this.defaultSort,
      } as any,
      { emitEvent: false }
    );

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.lastQueryBody = null;

    // ⚠️ 不 clearQueryState（保留給 CRU 回來用）
  }

  /** ✅ 按查詢：回第一頁，並更新 lastQueryBody 讓 table-report 後續可排序/捲動 */
  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const raw: any = this.queryForm.getRawValue();

    // 回第一頁
    this.queryForm.patchValue({ pageIndex: 1 }, { emitEvent: false });

    const pageSize = this.getPageSize();
    const sort = this.normalizeSortForApi(raw?.SortBy) || this.defaultSort;

    const payload = this.buildPayload(
      { ...raw, PageIndex: 1, PageSize: pageSize, SortBy: sort },
      { pageIndex: 1, pageSize, sort }
    );

    this.lastQueryBody = { ...payload };
    this.saveQueryState();

    this.runQuery(payload);
  }

  /** table-report 的 selectionChange */
  onSelectionChange(items: any[]): void {
    this.selectedItems = items ?? [];
  }

  /** 清除 */
  onClearForm(): void {
    const defaultPageSize = 20;

    this.queryForm.reset(
      {
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

        // ✅ 這裡要用 createPaginationConfig 的欄位名稱
        pageIndex: 1,
        pageSize: 20,
        SortBy: this.defaultSort,
      } as any,
      { emitEvent: false }
    );

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.lastQueryBody = null;
    this.selectedItems = [];

    this.queryStateService.setQueryState('TLS41020', {
      formValue: this.queryForm.getRawValue(),
      lastQueryBody: null,
    });
  }

  /** ✅ 刪除：confirm + 刪完回第一頁重查 */
  onDelete(event: any | any[]): void {
    const idList = this.normalizeDeleteIds(event);

    if (!idList.length) {
      this.messageService.warnBubble('請先選擇要刪除的資料');
      return;
    }

    this.messageService.confirm({
      header: '刪除確認',
      message: `確定要刪除選取的 ${idList.length} 筆資料嗎？`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確定',
      rejectLabel: '取消',
      accept: () => {
        this.messageService.blockUi();

        this.tls41020Service
          .deleteTLS41020({ idList })
          .pipe(
            untilDestroyed(this),
            finalize(() => this.messageService.unblockUi())
          )
          .subscribe({
            next: (res: any) => {
              if (res?.Status === '0000') {
                this.messageService.successBubble('刪除成功');

                // ✅ 刪完回第一頁重查（沿用最後查詢條件）
                const base = this.lastQueryBody ?? this.buildPayload(this.queryForm.getRawValue(), {
                  pageIndex: 1,
                  pageSize: this.getPageSize(),
                  sort: this.defaultSort,
                });

                const pageSize =
                  Number(base?.PageSize) > 0 ? Number(base.PageSize) : this.getPageSize();

                const sort = this.normalizeSortForApi(base?.SortBy) || this.defaultSort;

                const body = {
                  ...base,
                  PageIndex: 1,
                  PageSize: pageSize,
                  SortBy: sort,
                };

                // 同步回 form（保持 UI 一致）
                this.queryForm.patchValue(
                  { PageIndex: 1, PageSize: pageSize, SortBy: sort } as any,
                  { emitEvent: false }
                );

                this.lastQueryBody = { ...body };
                this.saveQueryState();

                this.runQuery(body);
                this.selectedItems = [];
                return;
              }

              this.messageService.errorBubble(`刪除失敗: ${res?.Message || ''}`);
            },
            error: () => {
              this.messageService.errorBubble('刪除失敗，請稍後再試');
            },
          });
      },
    });
  }

  /** ✅ 統一查詢（給 onSubmit / 刪除後重查 / CRU 回來重查用） */
  private runQuery(payload: any): void {
    this.loading = true;
    this.messageService.blockUi();

    this.tls41020Service
      .queryTLS41020(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
          this.messageService.unblockUi();
        })
      )
      .subscribe({
        next: (res: any) => {
          this.data = res?.Data || [];
          this.totalRecords = Number(res?.TotalCount ?? this.data.length) || 0;
          this.cdr.detectChanges();
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.messageService.errorBubble('資料載入失敗');
          this.cdr.detectChanges();
        },
      });
  }

  /** ✅ pageSize 入口：form.PageSize → fallback 20 */
  private getPageSize(): number {
    const raw: any = this.queryForm.getRawValue();
    const fromForm = Number(raw?.pageSize);
    return Number.isFinite(fromForm) && fromForm > 0 ? fromForm : 20;
  }
  /** table-report 送回來的 multiSortMeta / SortBy → ApiSort[]，並套 mapping + allow list */
  private normalizeSortForApi(sortBy: any): ApiSort[] | null {
    const meta: SortMeta[] = Array.isArray(sortBy) ? sortBy : [];

    const normalized = meta
      .map((m: any) => ({
        field: this.mapSortField(String(m?.field ?? m?.Field ?? '')),
        order: Number(m?.order ?? m?.Order) === -1 ? -1 : 1,
      }))
      .filter((m: any) => m.field && this._allowSortFields.has(this.unmapAllowField(m.field)));

    return normalized.length ? normalized : null;
  }

  /**
   * ✅ allow list 檢查用：
   * 因為你會把 EDC_Status1Name 映射成 EDC_Status1，
   * 但 _allowSortFields 來源是 columns.field（裡面是 EDC_Status1Name）
   * 所以這裡做一個反查，把 API field 轉回 columns.field 來過濾
   */
  private unmapAllowField(apiField: string): string {
    switch (apiField) {
      case 'EDC_Status1':
        return 'EDC_Status1Name';
      case 'EDC_Status2':
        return 'EDC_Status2Name';
      default:
        return apiField;
    }
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

  /** ✅ 把刪除事件轉成 idList（支援單筆/多筆/直接給 {idList}） */
  private normalizeDeleteIds(event: any | any[]): any[] {
    const arr = Array.isArray(event) ? event : [event];

    // 1) table 直接丟 { idList: [...] }
    const direct = arr?.[0]?.idList;
    if (Array.isArray(direct) && direct.length) return direct;

    // 2) row 上有 id（後端 deleteTLS41020 用這個）
    const ids = arr
      .map((x) => x?.id)
      .filter((id) => id !== null && id !== undefined);

    return ids;
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState('TLS41020', {
      formValue: this.queryForm.getRawValue(),
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

      // ✅ API 一律大寫
      SortBy: opts.sort,
      pageIndex: opts.pageIndex,
      pageSize: opts.pageSize,
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
