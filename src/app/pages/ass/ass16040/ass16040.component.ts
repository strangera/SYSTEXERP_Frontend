import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';

import { ASS16040Service } from '@service/api/ass/ass16040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { TLSFormUtils } from '@shared/utils/tls-form-utils';

import { ASS16040Data, ASS16040QueryRequest } from './ass16040.model';

/** 3.1.6.4 領用審核作業 */
@UntilDestroy()
@Component({
  selector: 'app-ass16040',
  templateUrl: './ass16040.component.html',
  styleUrl: './ass16040.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    CalendarRangeQuickComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    TableReportComponent,
  ],
})
export class ASS16040Component extends BasicQueryPageComponent<ASS16040Data> implements OnInit {

  readonly queryForm = this.formBuilder.group({
    MTAPPLY_ID:   new FormControl<string | null>(null, [Validators.maxLength(15)]), // 領用單號
    EMP_ID:       new FormControl<string | null>(null),  // 申請人代號
    FASITEM_ID:   new FormControl<number | null>(null),  // 品項編號
    APPLY_DATE_S: new FormControl<Date | null>(null),    // 申請日期起
    APPLY_DATE_E: new FormControl<Date | null>(null),    // 申請日期迄
    APRV_DATE_S:  new FormControl<Date | null>(null),    // 審核日期起
    APRV_DATE_E:  new FormControl<Date | null>(null),    // 審核日期迄
    ORG_ID:       new FormControl<string | null>(null),  // 部門代號
    CHECK_DATE:   new FormControl<Date | null>(null),    // 發料日期
    APRV_EMP_ID:  new FormControl<string | null>(null),  // 審核者
    WH_ID:        new FormControl<string | null>(null),  // 倉別
    STATUS:       new FormControl<string | null>(null),  // 領用單狀態
    PageSize:     new FormControl<number>(30),
    PageIndex:    new FormControl<number>(1),
  });

  // 查詢結果以「頭檔」為單位顯示（依 MTAPPLY_ID 群組化）
  readonly tableData = signal<ASS16040Data[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: ASS16040QueryRequest;

  /** 保存完整的 query response rows，供 CRU 頁取明細用 */
  private allQueryRows: ASS16040Data[] = [];

  // 代碼 → 名稱對應表（從下拉選單載入後建立，供 columns format callback 使用）
  private readonly empNameMap = new Map<string, string>();
  private readonly orgNameMap = new Map<string, string>();
  private readonly statusNameMap = new Map<string, string>();

  readonly columns: ReportColumn[] = [
    { field: 'MTAPPLY_ID',          header: '領用單號' },
    { field: 'EMP_ID',              header: '申請人代號' },
    {
      field: 'EMP_NAME',
      header: '申請人名稱',
      format: (_v, _i, row: ASS16040Data) => this.empNameMap.get(row?.EMP_ID ?? '') ?? '',
    },
    { field: 'ORG_ID',              header: '部門代號' },
    {
      field: 'ORG_NAME',
      header: '部門名稱',
      format: (_v, _i, row: ASS16040Data) => this.orgNameMap.get(row?.ORG_ID ?? '') ?? '',
    },
    { field: 'APPLY_DATE',          header: '申請日期', format: (v: string) => formatDate(v) },
    { field: 'MTAPPLY_STATUS',      header: '領用單狀態代碼' },
    {
      field: 'MTAPPLY_STATUS_NAME',
      header: '領用單狀態名稱',
      format: (_v, _i, row: ASS16040Data) => this.statusNameMap.get(row?.MTAPPLY_STATUS ?? '') ?? '',
    },
    { field: 'APRV_EMP_ID',         header: '審核者代號' },
    {
      field: 'APRV_EMP_NAME',
      header: '審核者名稱',
      format: (_v, _i, row: ASS16040Data) => this.empNameMap.get(row?.APRV_EMP_ID ?? '') ?? '',
    },
    { field: 'APRV_DATE',           header: '審核日期', format: (v: string) => formatDate(v) },
    { field: 'CHECK_DATE',          header: '發料日期', format: (v: string) => formatDate(v) },
    { field: 'LINE_NUM',            header: '明細筆數' },
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

  // ─── Load dropdown data on init ──────────────────────────────────────────────
  private loadDropdownOptions(): void {
    // 申請人 / 審核者（共用同一 TBLUSER）
    this.dropdownApiService.queryTblUser()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        const mapped = (options ?? []).map(item => ({
          label: item.label,
          value: String(item.value),
        }));
        this.empIdOptions.set(mapped);
        this.aprvEmpIdOptions.set(mapped);
        this.empNameMap.clear();
        (options ?? []).forEach(item => {
          const code = String(item.value ?? '');
          const name = String(item['Name'] ?? '').trim();
          if (code) this.empNameMap.set(code, name || code);
        });
      });

    // 部門代號（SYS3100）
    this.dropdownApiService.querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.orgIdOptions.set(
          (options ?? []).map(item => ({ label: item.label, value: String(item.value) })),
        );
        this.orgNameMap.clear();
        (options ?? []).forEach(item => {
          const code = String(item.value ?? '');
          const name = String(item['Name'] ?? '').trim();
          if (code) this.orgNameMap.set(code, name || code);
        });
      });

    // 品項編號（FASITEM，固定 MATERIAL_TYPE=3 耗材）
    this.dropdownApiService.queryFasItemDropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.fasItemOptions.set(
          (options ?? []).map(item => ({ label: item.label, value: Number(item.value) })),
        );
      });

    // 倉別（FAHOS）
    this.dropdownApiService.queryFaHos()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.whIdOptions.set(
          (options ?? []).map(item => ({ label: item.label, value: String(item.value) })),
        );
      });

    // 領用單狀態（SYS1000 MTAPPLY_STATUS）
    this.dropdownApiService.querySys1000({ SYS_Type: 'MTAPPLY_STATUS' })
      .pipe(untilDestroyed(this))
      .subscribe(rows => {
        const list = rows ?? [];
        this.statusOptions.set(
          list.map(item => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No,
          })),
        );
        this.statusNameMap.clear();
        list.forEach(item => {
          const code = String(item.No ?? '').trim();
          const name = String(item.Name ?? '').trim();
          if (code) this.statusNameMap.set(code, name || code);
        });
      });
  }

  /** 查詢函數（供 app-table-report 分頁查詢使用） */
  public queryFunction = (body: ASS16040QueryRequest): Observable<ApiResponse<ASS16040Data[]>> => {
    const raw = this.queryForm.getRawValue();
    const payload: ASS16040QueryRequest = {
      MTAPPLY_ID:   raw.MTAPPLY_ID   ?? undefined,
      EMP_ID:       raw.EMP_ID       ?? undefined,
      FASITEM_ID:   raw.FASITEM_ID   ?? undefined,
      APPLY_DATE_S: raw.APPLY_DATE_S ? TLSFormUtils.formatDate(raw.APPLY_DATE_S) : undefined,
      APPLY_DATE_E: raw.APPLY_DATE_E ? TLSFormUtils.formatDate(raw.APPLY_DATE_E) : undefined,
      APRV_DATE_S:  raw.APRV_DATE_S  ? TLSFormUtils.formatDate(raw.APRV_DATE_S)  : undefined,
      APRV_DATE_E:  raw.APRV_DATE_E  ? TLSFormUtils.formatDate(raw.APRV_DATE_E)  : undefined,
      ORG_ID:       raw.ORG_ID       ?? undefined,
      CHECK_DATE:   raw.CHECK_DATE   ? TLSFormUtils.formatDate(raw.CHECK_DATE)   : undefined,
      APRV_EMP_ID:  raw.APRV_EMP_ID  ?? undefined,
      WH_ID:        raw.WH_ID        ?? undefined,
      STATUS:       raw.STATUS       ?? undefined,
      PageSize:     body.PageSize ?? raw.PageSize ?? 30,
      PageIndex:    body.PageIndex ?? raw.PageIndex ?? 1,
      SortBy:       body.SortBy,
    };
    return this.ass16040Service.queryASS16040(removeEmptyValues(payload) as ASS16040QueryRequest);
  };

  // ─── Submit（查詢）────────────────────────────────────────────────────────────
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = removeEmptyValues({
        MTAPPLY_ID:   raw.MTAPPLY_ID,
        EMP_ID:       raw.EMP_ID,
        FASITEM_ID:   raw.FASITEM_ID,
        APPLY_DATE_S: raw.APPLY_DATE_S ? TLSFormUtils.formatDate(raw.APPLY_DATE_S) : undefined,
        APPLY_DATE_E: raw.APPLY_DATE_E ? TLSFormUtils.formatDate(raw.APPLY_DATE_E) : undefined,
        APRV_DATE_S:  raw.APRV_DATE_S  ? TLSFormUtils.formatDate(raw.APRV_DATE_S)  : undefined,
        APRV_DATE_E:  raw.APRV_DATE_E  ? TLSFormUtils.formatDate(raw.APRV_DATE_E)  : undefined,
        ORG_ID:       raw.ORG_ID,
        CHECK_DATE:   raw.CHECK_DATE   ? TLSFormUtils.formatDate(raw.CHECK_DATE)   : undefined,
        APRV_EMP_ID:  raw.APRV_EMP_ID,
        WH_ID:        raw.WH_ID,
        STATUS:       raw.STATUS,
        PageSize:     raw.PageSize ?? 30,
        PageIndex:    raw.PageIndex ?? 1,
      }) as ASS16040QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);

      this.ass16040Service.queryASS16040(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          }),
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            // 保留完整明細資料，供 CRU 頁透過 queryConditions 取得
            this.allQueryRows = res.Data ?? [];
            // group by MTAPPLY_ID — 每張領用單只顯示一列頭檔資訊
            const grouped = this.groupByMtapplyId(this.allQueryRows);
            this.tableData.set(grouped);
            this.totalRecords.set(grouped.length);
          },
        });
    });
  }

  /**
   * 依 MTAPPLY_ID 群組化，每張單號僅保留第一筆（頭檔欄位）作為表格列。
   * LINE_NUM 由後端回傳，代表該單號的明細筆數。
   */
  private groupByMtapplyId(rows: ASS16040Data[]): ASS16040Data[] {
    const seen = new Map<string, ASS16040Data>();
    for (const row of rows) {
      if (!seen.has(row.MTAPPLY_ID)) {
        seen.set(row.MTAPPLY_ID, row);
      }
    }
    return Array.from(seen.values());
  }

  // ─── Navigation overrides — pass allQueryRows as queryConditions ─────────────
  override onEdit(rowData: ASS16040Data): void {
    this.navigateWithState(CRUDStatus.Edit, rowData, { allRows: this.allQueryRows });
  }

  override onDetail(rowData: ASS16040Data): void {
    this.navigateWithState(CRUDStatus.Read, rowData, { allRows: this.allQueryRows });
  }
}
