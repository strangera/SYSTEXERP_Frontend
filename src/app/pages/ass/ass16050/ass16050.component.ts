import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16050Service } from '@service/api/ass/ass16050.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import {
  formatDate,
  ReportColumn
} from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { finalize, map, Observable } from 'rxjs';
import {
  Ass16050MasterDisplayRow,
  Ass16050QueryRequest
} from './ass16050.model';

@UntilDestroy()
@Component({
  selector: 'app-ass16050',
  templateUrl: './ass16050.component.html',
  styleUrl: './ass16050.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeQuickComponent,
    CalendarComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS16050Component
  extends BasicQueryPageComponent<Ass16050MasterDisplayRow>
  implements OnInit
{
  queryForm = this.formBuilder.group({
    MTAPPLY_ID: [null as string | null, [Validators.maxLength(15)]],
    EMP_ID: [null as string | null],
    FASITEM_ID: [null as string | null],
    APPLY_DATE_S: [null as Date | null],
    APPLY_DATE_E: [null as Date | null],
    APRV_DATE_S: [null as Date | null],
    APRV_DATE_E: [null as Date | null],
    ORG_ID: [null as string | null],
    CHECK_DATE: [null as Date | null],
    APRV_EMP_ID: [null as string | null],
    WH_ID: [null as string | null],
    STATUS: [null as string | null],
    PageSize: [30 as number | null],
    PageIndex: [1 as number | null],
  });

  data: Ass16050MasterDisplayRow[] = [];
  totalRecords = 0;
  lastQueryBody?: Ass16050QueryRequest;

  columns: ReportColumn[] = [
    { field: 'MTAPPLY_ID', header: '領用單號' },
    { field: 'EMP_ID', header: '申請人代號' },
    {
      field: 'EMP_NAME',
      header: '申請人名稱',
      format: (_v, _i, row) => this.getOptionName(row?.EMP_ID, this.userOptions),
    },
    { field: 'ORG_ID', header: '部門代號' },
    {
      field: 'ORG_NAME',
      header: '部門名稱',
      format: (_v, _i, row) => this.getOptionName(row?.ORG_ID, this.orgOptions),
    },
    { field: 'APPLY_DATE', header: '申請日期', format: (v) => formatDate(v) },
    {
      field: 'MTAPPLY_STATUS',
      header: '領用單狀態',
      format: (v) => this.getStatusLabel(v),
    },
    { field: 'APRV_EMP_ID', header: '審核者代號' },
    {
      field: 'APRV_EMP_NAME',
      header: '審核者名稱',
      format: (_v, _i, row) => this.getOptionName(row?.APRV_EMP_ID, this.userOptions),
    },
    { field: 'APRV_DATE', header: '審核日期', format: (v) => formatDate(v) },
    { field: 'CHECK_DATE', header: '發料日期', format: (v) => formatDate(v) },
    { field: 'detailCount', header: '明細筆數', align: 'right' },
  ];

  /** 申請人、審核者共用同一次 queryTBLUSER 呼叫結果 */
  userOptions: Option[] = [];
  fasItemOptions: Option[] = [];
  orgOptions: Option[] = [];
  whOptions: Option[] = [];
  statusOptions: Option[] = [];

  constructor(
    private readonly ass16050Service: ASS16050Service,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS16050', 'ass/ass16050cru', this.queryForm, (form) =>
      this.onSubmit(form),
    );
    this.loadDropdowns();
  }

  private loadDropdowns(): void {
    this.dropdownApiService
      .queryTblUser()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.userOptions = opts ?? [];
        this.refreshTableIfPopulated();
      });

    this.dropdownApiService
      .queryFasItemDropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.fasItemOptions = opts ?? [];
      });

    this.dropdownApiService
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.orgOptions = opts ?? [];
        this.refreshTableIfPopulated();
      });

    this.dropdownApiService
      .queryFaHos()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.whOptions = opts ?? [];
      });

    this.dropdownApiService
      .querySys1000({ SYS_Type: 'MTAPPLY_STATUS' })
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.statusOptions = (res ?? []).map((item) => ({
          value: item.No,
          label: `${item.No} - ${item.Name}`,
        }));
        this.refreshTableIfPopulated();
      });
  }

  /** dropdown 較查詢 API 後到時，重新指派 data 觸發 table-report (OnPush) 重新渲染 */
  private refreshTableIfPopulated(): void {
    if (this.data.length > 0) {
      this.data = [...this.data];
    }
  }

  /** 表格 lazy loading 用 query function — service 已攤平 wrapper，此處只負責 detailCount 補欄 */
  public queryFunction = (
    body: Ass16050QueryRequest,
  ): Observable<ApiResponse<Ass16050MasterDisplayRow[]>> => {
    return this.ass16050Service.queryASS16050M(body).pipe(
      map((res) => ({
        ...res,
        Data: (res.Data ?? []).map((row) => ({
          ...row,
          detailCount: row.TOTAL_COUNT ?? 0,
        })),
      })),
    );
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.lastQueryBody = this.buildQueryPayload(frm);
      this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());

      this.queryFunction(this.lastQueryBody)
        .pipe(
          finalize(() => (this.loading = false)),
          untilDestroyed(this),
        )
        .subscribe({
          next: (res) => {
            if (res.Status !== '0000') {
              this.messageService.errorBubble(res.Message || '查詢失敗');
              return;
            }
            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? this.data.length;
          },
        });
    });
  }

  /** 組裝查詢 payload，日期欄位轉為本地日期字串（YYYY-MM-DD），避免 toISOString 的 UTC 偏移 */
  private buildQueryPayload(frm: FormGroup): Ass16050QueryRequest {
    const v = frm.getRawValue();
    const toDateStr = (d: Date | null): string | undefined => {
      if (!d) return undefined;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const payload: Ass16050QueryRequest = {
      MTAPPLY_ID: v.MTAPPLY_ID || undefined,
      EMP_ID: v.EMP_ID || undefined,
      // FASITEM_ID 後端定義為 int64，下拉 value 為 GOODS_ID（string），此處轉成 number
      FASITEM_ID: v.FASITEM_ID ? Number(v.FASITEM_ID) || undefined : undefined,
      APPLY_DATE_S: toDateStr(v.APPLY_DATE_S),
      APPLY_DATE_E: toDateStr(v.APPLY_DATE_E),
      APRV_DATE_S: toDateStr(v.APRV_DATE_S),
      APRV_DATE_E: toDateStr(v.APRV_DATE_E),
      ORG_ID: v.ORG_ID || undefined,
      CHECK_DATE: toDateStr(v.CHECK_DATE),
      APRV_EMP_ID: v.APRV_EMP_ID || undefined,
      WH_ID: v.WH_ID || undefined,
      STATUS: v.STATUS || undefined,
      PageSize: v.PageSize ?? 30,
      PageIndex: v.PageIndex ?? 1,
    };

    return removeEmptyValues(payload) as Ass16050QueryRequest;
  }

  getStatusLabel(value: string): string {
    return this.getOptionName(value, this.statusOptions) || (value ?? '');
  }

  /**
   * 從下拉 options 中取出對應的「名稱」部分。
   * dropdown-api.service 統一將 label 組為 "<code> - <name>"，此處抽出 name。
   */
  private getOptionName(
    value: string | number | null | undefined,
    options: Option[],
  ): string {
    if (value === null || value === undefined || value === '') return '';
    const opt = options.find((o) => o.value === value);
    if (!opt) return '';
    const dashIdx = opt.label.indexOf(' - ');
    return dashIdx >= 0 ? opt.label.substring(dashIdx + 3) : opt.label;
  }
}
