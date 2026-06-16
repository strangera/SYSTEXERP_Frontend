import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { SYS0790Service } from '@service/api/sys/sys0790.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import {
  ReportColumn,
  formatDateTime,
} from '../../../shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import {
  QuerySYS0790Request,
  SYS0790QueryData,
} from './sys0790.model';

@UntilDestroy()
@Component({
  selector: 'app-sys0790',
  templateUrl: './sys0790.component.html',
  styleUrl: './sys0790.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    MenubarComponent,
    ButtonComponent,
    DropdownComponent,
    MultiSelectComponent,
    CalendarRangeQuickComponent,
    TableReportComponent,
  ],
})
// 使用者作業按鈕歷程報表
export class SYS0790Component
  extends BasicQueryPageComponent<SYS0790QueryData>
  implements OnInit
{
  // ── 查詢表單 ───────────────────────────────────────────
  queryForm = this.formBuilder.group({
    /** 使用者代碼/名稱（單選） */
    UserNo: [null as string | null],
    /** LOG時間（起）— 必填 */
    LogTime_S: [null as Date | string | null, Validators.required],
    /** LOG時間（迄）— 必填 */
    LogTime_E: [null as Date | string | null, Validators.required],
    /** 作業代碼（多選，對應 SYS_ID） */
    FunctionCodeList: [null as string[] | null],
    // 分頁/排序
    ...createPaginationConfig([{ field: 'LogTime', order: -1 }]),
  });

  // ── 表格 ───────────────────────────────────────────────
  data: SYS0790QueryData[] = [];
  lastQueryBody: QuerySYS0790Request | null = null;
  public readonly totalRecords = signal<number>(0);

  columns: ReportColumn[] = [
    { field: 'LogTime', header: 'LOG時間', visible: true, format: formatDateTime, showSort: true },
    { field: 'UserNo', header: '使用者代碼', visible: true, showSort: true },
    { field: 'UserName', header: '使用者名稱', visible: true },
    { field: 'FunctionCode', header: '作業代碼', visible: true, showSort: true },
    { field: 'FunctionName', header: '作業名稱', visible: true },
    { field: 'ButtonName', header: '按鈕名稱', visible: true },
    { field: 'LinkUrl', header: '連結網址', visible: true },
  ];

  // ── 下拉資料 ────────────────────────────────────────────
  /** 使用者（queryTBLUSER_DropDownList） */
  userOptions = signal<Option[]>([]);
  /** 作業代碼（SYS1000.SYS_Type='SYS_ID'，與 sys0110-cru 同來源） */
  readonly functionCodeOptions = getSYS1000Options('SYS_ID');

  constructor(
    public readonly sys0790Service: SYS0790Service,
    private readonly dropdownApi: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0790', '', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  // ── 查詢送出 ─────────────────────────────────────────
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const body = this.buildQueryBody(form);
      this.lastQueryBody = body;
      this.sys0790Service
        .querySYS0790(body)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.data = res.Data ?? [];
              this.totalRecords.set(res.TotalCount ?? this.data.length);
              this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
            } else {
              this.data = [];
              this.totalRecords.set(0);
              this.messageService.errorBubble(res.Message || '查詢失敗');
            }
          },
        });
    });
  }

  // ── 將 form 轉成 API request（日期轉字串） ──────────────
  private buildQueryBody(form: FormGroup): QuerySYS0790Request {
    const raw = form.getRawValue();
    return {
      ...raw,
      LogTime_S: this.toIsoDateTime(raw.LogTime_S, 'start'),
      LogTime_E: this.toIsoDateTime(raw.LogTime_E, 'end'),
    } as QuerySYS0790Request;
  }

  /**
   * 將 Date / string / null 轉為 'YYYY-MM-DD HH:mm:ss' 字串。
   * - 起：若使用者沒選時間，補 00:00:00
   * - 迄：若使用者沒選時間，補 23:59:59
   */
  private toIsoDateTime(
    value: Date | string | null | undefined,
    bound: 'start' | 'end',
  ): string | undefined {
    if (!value) return undefined;
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return undefined;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    // 若時間為 00:00:00 且為「迄」，自動補到當日最後一秒
    if (bound === 'end' && hh === '00' && mm === '00' && ss === '00') {
      return `${y}-${m}-${day} 23:59:59`;
    }
    return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
  }

  // ── 載入下拉選單 ─────────────────────────────────────
  private loadDropdownOptions(): void {
    // 使用者（queryTBLUSER_DropDownList）— SA 規格指定來源
    this.dropdownApi
      .queryTblUser()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (options) => {
          this.userOptions.set(options ?? []);
        },
      });
  }
}
