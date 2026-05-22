/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CounterNameService } from '@service/basic/queryTLTTALENT.service';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { AccordionModule } from 'primeng/accordion';
import { SortMeta } from 'primeng/api';
import { finalize, Observable } from 'rxjs';
import { TLS41020Service } from '../../../service/api/tls/tls41020.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// 與後端一致：order 用 1 / -1
interface ApiSort {
  field: string;
  order: number;
}

@Component({
  selector: 'app-tls41020',
  templateUrl: './tls41020.component.html',
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
  /** 預設排序 */
  readonly defaultSort: ApiSort[] = [{ field: 'ECR_No', order: 1 }];

  /** table-report：查詢函式 */
  queryFunction = (body: any): Observable<any> => this.tls41020Service.queryTLS41020(body);

  columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
    { field: 'EDC_BegDate', header: '啟用日期', visible: true, format: this.formatDateTime },
    { field: 'EDC_EndDate', header: '停用日期', visible: true, format: this.formatDateTime },
    // 專櫃與地點資料
    { field: 'ECR_TLT_No', header: '專櫃編號', visible: true },
    { field: 'ECR_TLT_Name', header: '櫃位名稱', visible: true },
    { field: 'ECR_LocNo', header: '地點代號', visible: true },
    { field: 'LOCATION_Name', header: '地點名稱', visible: true },
    // 第一台 (中信)
    { field: 'EDC_Status1Name', header: '中信刷卡機狀態', visible: true },
    { field: 'EDC_IP1', header: '中信刷卡機IP', visible: true },
    { field: 'EDC_TmID1', header: '中信刷卡機端末機號', visible: true },
    // 第二台 (聯合)
    { field: 'EDC_Status2Name', header: '聯合刷卡機狀態', visible: true },
    { field: 'EDC_IP2', header: '聯合刷卡機IP', visible: true },
    { field: 'EDC_TmID2', header: '聯合刷卡機端末機號', visible: true },
    // 第三台 (中信分期)
    { field: 'EDC_Status3Name', header: '中信分期刷卡機狀態', visible: false },
    { field: 'EDC_IP3', header: '中信分期刷卡機IP', visible: false },
    { field: 'EDC_TmID3', header: '中信分期刷卡機端末機號', visible: false },
    // 第四台 (中信紅利) - ✅ 已修正 Header 名稱
    { field: 'EDC_Status4Name', header: '中信紅利刷卡機狀態', visible: false },
    { field: 'EDC_IP4', header: '中信紅利刷卡機IP', visible: false },
    { field: 'EDC_TmID4', header: '中信紅利刷卡機端末機號', visible: false },
    // 第五台 (中信銀聯) - ✅ 已修正 Header 名稱
    { field: 'EDC_Status5Name', header: '中信銀聯刷卡機狀態', visible: false },
    { field: 'EDC_IP5', header: '中信銀聯刷卡機IP', visible: false },
    { field: 'EDC_TmID5', header: '中信銀聯刷卡機端末機號', visible: false },
    // 審核異動欄位
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

  /** ✅ 查詢表單：已補齊 1 ~ 5 組所有控制項 */
  queryForm = this.formBuilder.group({
    ECR_No: [], // MultiSelect
    EDC_No: [],
    EDC_BegDate_From: [],
    EDC_BegDate_To: [],
    EDC_EdnDate_From: [],
    EDC_EdnDate_To: [],
    // 狀態 1~5
    EDC_Status1: [],
    EDC_Status2: [],
    EDC_Status3: [],
    EDC_Status4: [],
    EDC_Status5: [],
    ECR_TLT_No: [],
    // IP 1~5
    EDC_IP1: [],
    EDC_IP2: [],
    // 端末機代碼 1~5
    EDC_TmID1: [],
    EDC_TmID2: [],
    EDC_TmID3: [],
    EDC_IP3: [],
    EDC_IP4: [],
    EDC_IP5: [],
    EDC_TmID4: [],
    EDC_TmID5: [],
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

    this.ECRNoSvc.getECRNo()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.ECRNoOptions = res || [];
      });

    this.counterNameService.getCounters()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.CounterOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });

    const fromCru = !!(history.state && history.state['fromCru']) || sessionStorage.getItem('TLS41020_fromCru') === '1';
    if (fromCru) {
      const saved = this.queryStateService.getQueryStateValue('TLS41020');
      if (saved?.formValue) {
        this.queryForm.patchValue(saved.formValue, { emitEvent: false });
        this.lastQueryBody = saved.lastQueryBody ?? this.buildPayload(this.queryForm.getRawValue(), {
          pageIndex: Number(saved?.formValue?.PageIndex ?? 1) || 1,
          pageSize: Number(saved?.formValue?.PageSize ?? 20) || 20,
          sort: this.normalizeSortForApi(saved?.formValue?.SortBy) || this.defaultSort,
        });
        Promise.resolve().then(() => this.runQuery(this.lastQueryBody));
        sessionStorage.removeItem('TLS41020_fromCru');
      }
    } else {
      this.resetToDefaultQuery();
    }
  }

  /** ✅ 非 CRU 進來時的預設條件（已補齊 1 ~ 5） */
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
        EDC_Status3: null,
        EDC_Status4: null,
        EDC_Status5: null,
        ECR_TLT_No: null,
        EDC_IP1: null,
        EDC_IP2: null,
        EDC_IP3: null,
        EDC_IP4: null,
        EDC_IP5: null,
        EDC_TmID1: null,
        EDC_TmID2: null,
        EDC_TmID3: null,
        EDC_TmID4: null,
        EDC_TmID5: null,
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
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }
    const raw: any = this.queryForm.getRawValue();
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

  onSelectionChange(items: any[]): void {
    this.selectedItems = items ?? [];
  }

  /** ✅ 清除表單（已補齊 1 ~ 5） */
  onClearForm(): void {
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
        EDC_Status3: null,
        EDC_Status4: null,
        EDC_Status5: null,
        ECR_TLT_No: null,
        EDC_IP1: null,
        EDC_IP2: null,
        EDC_IP3: null,
        EDC_IP4: null,
        EDC_IP5: null,
        EDC_TmID1: null,
        EDC_TmID2: null,
        EDC_TmID3: null,
        EDC_TmID4: null,
        EDC_TmID5: null,
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
                const base = this.lastQueryBody ?? this.buildPayload(this.queryForm.getRawValue(), {
                  pageIndex: 1,
                  pageSize: this.getPageSize(),
                  sort: this.defaultSort,
                });
                const pageSize = Number(base?.PageSize) > 0 ? Number(base.PageSize) : this.getPageSize();
                const sort = this.normalizeSortForApi(base?.SortBy) || this.defaultSort;
                const body = { ...base, PageIndex: 1, PageSize: pageSize, SortBy: sort };

                this.queryForm.patchValue({ PageIndex: 1, PageSize: pageSize, SortBy: sort } as any, { emitEvent: false });
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

  private getPageSize(): number {
    const raw: any = this.queryForm.getRawValue();
    const fromForm = Number(raw?.pageSize);
    return Number.isFinite(fromForm) && fromForm > 0 ? fromForm : 20;
  }

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

  /** ✅ 補上 3、4、5 組狀態的反向欄位過濾檢查 */
  private unmapAllowField(apiField: string): string {
    switch (apiField) {
      case 'EDC_Status1': return 'EDC_Status1Name';
      case 'EDC_Status2': return 'EDC_Status2Name';
      case 'EDC_Status3': return 'EDC_Status3Name';
      case 'EDC_Status4': return 'EDC_Status4Name';
      case 'EDC_Status5': return 'EDC_Status5Name';
      default: return apiField;
    }
  }

  /** ✅ 補上 3、4、5 組狀態欄位的排序對應映射 */
  private mapSortField(field: string): string {
    switch (field) {
      case 'EDC_Status1Name': return 'EDC_Status1';
      case 'EDC_Status2Name': return 'EDC_Status2';
      case 'EDC_Status3Name': return 'EDC_Status3';
      case 'EDC_Status4Name': return 'EDC_Status4';
      case 'EDC_Status5Name': return 'EDC_Status5';
      default: return field;
    }
  }

  private normalizeDeleteIds(event: any | any[]): any[] {
    const arr = Array.isArray(event) ? event : [event];
    const direct = arr?.[0]?.idList;
    if (Array.isArray(direct) && direct.length) return direct;
    const ids = arr.map((x) => x?.id).filter((id) => id !== null && id !== undefined);
    return ids;
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState('TLS41020', {
      formValue: this.queryForm.getRawValue(),
      lastQueryBody: this.lastQueryBody,
    });
  }

  /** ✅ 組 API payload：已將 4、5 組所有的查詢欄位完整對齊送出 */
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
      EDC_Status3: raw?.EDC_Status3 ?? null,
      EDC_Status4: raw?.EDC_Status4 ?? null,
      EDC_Status5: raw?.EDC_Status5 ?? null,
      ECR_TLT_No: raw?.ECR_TLT_No,
      EDC_IP1: raw?.EDC_IP1,
      EDC_IP2: raw?.EDC_IP2,
      EDC_IP3: raw?.EDC_IP3,
      EDC_IP4: raw?.EDC_IP4,
      EDC_IP5: raw?.EDC_IP5,
      EDC_TmID1: raw?.EDC_TmID1,
      EDC_TmID2: raw?.EDC_TmID2,
      EDC_TmID3: raw?.EDC_TmID3,
      EDC_TmID4: raw?.EDC_TmID4,
      EDC_TmID5: raw?.EDC_TmID5,
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

  formatDateTime(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
  }
}
