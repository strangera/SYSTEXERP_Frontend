import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';

import { TLSFormUtils } from '@others/utils/tls-form-utils';
import { ASS16040Service } from '@service/api/ass/ass16040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

import { CRUDStatus } from '@shared/models/system/CRUDstatus';

import { ASS16040MasterRow, ASS16040QueryRequest } from './ass16040.model';

/** 「領用申請」狀態代碼（SYS1000 MTAPPLY_STATUS）。可審核狀態。 */
const MTAPPLY_STATUS_APPLIED = '1';

/** 3.1.6.4 領用審核作業 — 查詢頁（SPEC §4 / F-001 / F-002） */
@UntilDestroy()
@Component({
  selector: 'app-ass16040',
  templateUrl: './ass16040.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    CalendarRangeComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    TableReportComponent,
  ],
})
export class ASS16040Component extends BasicQueryPageComponent<ASS16040MasterRow> implements OnInit {

  /** SPEC §4.2：查詢條件皆非必填，MTAPPLY_STATUS 由使用者自選不預設值 */
  readonly queryForm = this.formBuilder.group({
    MTAPPLY_ID: new FormControl<string | null>(null, [Validators.maxLength(15)]),
    EMP_ID: new FormControl<string | null>(null),
    FASITEM_ID: new FormControl<number | null>(null),
    APPLY_DATE_S: new FormControl<Date | null>(null),
    APPLY_DATE_E: new FormControl<Date | null>(null),
    APRV_DATE_S: new FormControl<Date | null>(null),
    APRV_DATE_E: new FormControl<Date | null>(null),
    ORG_ID: new FormControl<string | null>(null),
    CHECK_DATE: new FormControl<Date | null>(null),
    APRV_EMP_ID: new FormControl<string | null>(null),
    WH_ID: new FormControl<string | null>(null),
    STATUS: new FormControl<string | null>(null),
    PageSize: new FormControl<number>(30),
    PageIndex: new FormControl<number>(1),
  });

  readonly tableData = signal<ASS16040MasterRow[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: ASS16040QueryRequest;

  // 代碼 → 名稱對應表（從下拉選單建立，供結果表格 lookup 名稱欄）
  private readonly empNameMap = new Map<string, string>();
  private readonly orgNameMap = new Map<string, string>();
  private readonly statusNameMap = new Map<string, string>();
  private readonly whNameMap = new Map<string, string>();

  /** SPEC §4.3：結果表格欄位（代碼與名稱拆兩欄） */
  readonly columns: ReportColumn[] = [
    { field: 'MTAPPLY_ID', header: '領用單號' },
    { field: 'EMP_ID', header: '申請人代號' },
    {
      field: 'EMP_NAME',
      header: '申請人名稱',
      format: (_v, _i, row: ASS16040MasterRow) => this.empNameMap.get(row?.EMP_ID ?? '') ?? '',
    },
    { field: 'ORG_ID', header: '部門代號' },
    {
      field: 'ORG_NAME',
      header: '部門名稱',
      format: (_v, _i, row: ASS16040MasterRow) => this.orgNameMap.get(row?.ORG_ID ?? '') ?? '',
    },
    { field: 'APPLY_DATE', header: '申請日期', format: (v: string) => formatDate(v) },
    { field: 'MTAPPLY_STATUS', header: '領用單狀態代碼' },
    {
      field: 'MTAPPLY_STATUS_NAME',
      header: '領用單狀態名稱',
      format: (_v, _i, row: ASS16040MasterRow) =>
        this.statusNameMap.get(row?.MTAPPLY_STATUS ?? '') ?? '',
    },
    { field: 'APRV_EMP_ID', header: '審核者代號' },
    {
      field: 'APRV_EMP_NAME',
      header: '審核者名稱',
      format: (_v, _i, row: ASS16040MasterRow) =>
        this.empNameMap.get(row?.APRV_EMP_ID ?? '') ?? '',
    },
    { field: 'APRV_DATE', header: '審核日期', format: (v: string) => formatDate(v) },
    { field: 'WH_ID', header: '倉別代號' },
    {
      field: 'WH_NAME',
      header: '倉別名稱',
      format: (_v, _i, row: ASS16040MasterRow) => this.whNameMap.get(row?.WH_ID ?? '') ?? '',
    },
    { field: 'CHECK_DATE', header: '發料日期', format: (v: string) => formatDate(v) },
    { field: 'TOTAL_COUNT', header: '明細筆數', align: 'right' },
  ];

  // ─── Dropdown options ─────────────────────────────────────────────────────────
  readonly empIdOptions = signal<{ label: string; value: string }[]>([]);
  readonly aprvEmpIdOptions = signal<{ label: string; value: string }[]>([]);
  readonly orgIdOptions = signal<{ label: string; value: string }[]>([]);
  readonly fasItemOptions = signal<{ label: string; value: number }[]>([]);
  readonly whIdOptions = signal<{ label: string; value: string }[]>([]);
  readonly statusOptions = signal<{ label: string; value: string }[]>([]);

  constructor(
    private readonly ass16040Service: ASS16040Service,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS16040', 'ass/ass16040cru', this.queryForm, this.onSubmit.bind(this));
    this.loadDropdownOptions();
  }

  /** SPEC §6.1：所有下拉走 DropdownApiService，禁止元件直接 call API */
  private loadDropdownOptions(): void {
    // 申請人 / 審核者（共用同一 TBLUSER）
    this.dropdownApiService.queryTblUser()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        const list = options ?? [];
        const mapped = list.map(item => ({ label: item.label, value: String(item.value) }));
        this.empIdOptions.set(mapped);
        this.aprvEmpIdOptions.set(mapped);
        this.empNameMap.clear();
        list.forEach(item => {
          const code = String(item.value ?? '').trim();
          const name = String(item['Name'] ?? item['label'] ?? '').trim();
          if (code) this.empNameMap.set(code, name || code);
        });
      });

    // 部門代號（SYS3100）
    this.dropdownApiService.querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        const list = options ?? [];
        this.orgIdOptions.set(list.map(item => ({ label: item.label, value: String(item.value) })));
        this.orgNameMap.clear();
        list.forEach(item => {
          const code = String(item.value ?? '').trim();
          const name = String(item['Name'] ?? item['label'] ?? '').trim();
          if (code) this.orgNameMap.set(code, name || code);
        });
      });

    // 品項編號（FASITEM）— SPEC §6.3：value 用 ID（int64），label 用 GOODS_ID - GOODS_NAME
    this.dropdownApiService.queryFasItemRawList()
      .pipe(untilDestroyed(this))
      .subscribe(rows => {
        this.fasItemOptions.set(
          (rows ?? [])
            .filter(r => r?.ID != null)
            .map(r => ({
              label: `${r.GOODS_ID ?? ''} - ${r.GOODS_NAME ?? ''}`,
              value: Number(r.ID),
            })),
        );
      });

    // 倉別（FAHOS）
    this.dropdownApiService.queryFaHos()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        const list = options ?? [];
        this.whIdOptions.set(list.map(item => ({ label: item.label, value: String(item.value) })));
        this.whNameMap.clear();
        list.forEach(item => {
          const code = String(item.value ?? '').trim();
          const name = String(item['Name'] ?? item['WH_NAME'] ?? item['label'] ?? '').trim();
          if (code) this.whNameMap.set(code, name || code);
        });
      });

    // 領用單狀態（SYS1000 MTAPPLY_STATUS）— 不預設值（user-answer-Q-006）
    this.dropdownApiService.querySys1000({ SYS_Type: 'MTAPPLY_STATUS' })
      .pipe(untilDestroyed(this))
      .subscribe(rows => {
        const list = rows ?? [];
        this.statusOptions.set(
          list.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No })),
        );
        this.statusNameMap.clear();
        list.forEach(item => {
          const code = String(item.No ?? '').trim();
          const name = String(item.Name ?? '').trim();
          if (code) this.statusNameMap.set(code, name || code);
        });
      });
  }

  /** 將表單原始值轉為 API payload（日期欄位轉字串、空值移除） */
  private buildQueryBody(extra?: Partial<ASS16040QueryRequest>): ASS16040QueryRequest {
    const raw = this.queryForm.getRawValue();
    const body: ASS16040QueryRequest = {
      MTAPPLY_ID: raw.MTAPPLY_ID ?? undefined,
      EMP_ID: raw.EMP_ID ?? undefined,
      FASITEM_ID: raw.FASITEM_ID ?? undefined,
      APPLY_DATE_S: raw.APPLY_DATE_S ? TLSFormUtils.formatDate(raw.APPLY_DATE_S) : undefined,
      APPLY_DATE_E: raw.APPLY_DATE_E ? TLSFormUtils.formatDate(raw.APPLY_DATE_E) : undefined,
      APRV_DATE_S: raw.APRV_DATE_S ? TLSFormUtils.formatDate(raw.APRV_DATE_S) : undefined,
      APRV_DATE_E: raw.APRV_DATE_E ? TLSFormUtils.formatDate(raw.APRV_DATE_E) : undefined,
      ORG_ID: raw.ORG_ID ?? undefined,
      CHECK_DATE: raw.CHECK_DATE ? TLSFormUtils.formatDate(raw.CHECK_DATE) : undefined,
      APRV_EMP_ID: raw.APRV_EMP_ID ?? undefined,
      WH_ID: raw.WH_ID ?? undefined,
      STATUS: raw.STATUS ?? undefined,
      PageSize: extra?.PageSize ?? raw.PageSize ?? 30,
      PageIndex: extra?.PageIndex ?? raw.PageIndex ?? 1,
      // SPEC §4.5 / user-answer-Q-010：預設 APPLY_DATE DESC
      SortBy: extra?.SortBy ?? [{ field: 'APPLY_DATE', order: 1 }],
    };
    return removeEmptyValues(body) as ASS16040QueryRequest;
  }

  /** 查詢函式（供 app-table-report 分頁/排序回呼） */
  public queryFunction = (
    body: ASS16040QueryRequest,
  ): Observable<ApiResponse<ASS16040MasterRow[]>> => {
    const payload = this.buildQueryBody({
      PageSize: body?.PageSize,
      PageIndex: body?.PageIndex,
      SortBy: body?.SortBy,
    });
    return this.ass16040Service.queryASS16040M(payload);
  };

  /**
   * SPEC F-002：點列進入 CRU 頁。
   * - 有 Edit 權限且狀態為「領用申請」→ Edit 模式
   * - 否則 → Read 模式
   */
  override onEdit(row: ASS16040MasterRow): void {
    const canApprove = this.hasPermission('30') && row?.MTAPPLY_STATUS === MTAPPLY_STATUS_APPLIED;
    this.navigateWithState(canApprove ? CRUDStatus.Edit : CRUDStatus.Read, row);
  }

  /** SPEC F-001：使用者按【查詢】按鈕觸發 */
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.lastQueryBody = this.buildQueryBody({ PageIndex: 1 });
      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());

      this.ass16040Service.queryASS16040M(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          }),
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') {
              this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
              return;
            }
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
        });
    });
  }
}
