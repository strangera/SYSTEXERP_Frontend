/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

// UI
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

// 共用
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import {
  createPaginationConfig,
  formatDateToYYYY_MM_DD,
} from '../../../shared/componentkit/table/table.model';

// Service & 型別
import {
  ApiResponse,
  FIN32020Service,
  Fin32020QueryRequest,
  Fin32020Row,
} from '../../../service/api/fin/fin32020.service';

interface SortItem { field: string; order: number }

@UntilDestroy()
@Component({
  selector: 'app-fin32020',
  templateUrl: './fin32020.component.html',
  styleUrl: './fin32020.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    ButtonModule,
    ButtonComponent,
    CalendarRangeComponent,
    InputTextComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    TableReportComponent,
  ],
})
/**
 * 1.3.2.2 應收帳款調整作業 – 查詢頁
 * 繼承 BasicQueryPageComponent，表格用 app-table-report
 */
export class FIN32020Component
  extends BasicQueryPageComponent<Fin32020Row>
  implements OnInit {
  /* ----------------- 主表狀態 ----------------- */
  data: Fin32020Row[] = [];
  totalRecords = 0;       // 後端真實總筆數
  viewTotalRecords = 0;   // 當前顯示總筆數（for table-report）
  selectedItems: Fin32020Row[] = [];
  lastQueryBody: any = null;   // 給 table-report 做 lazy load / sort 用
  footerData: any = undefined;
  tableVer = 0;                // 讓 table key 變化，強制重繪

  /* ----------------- 欄位定義 (app-table-report) ----------------- */
  // 先只顯示主檔欄位（ADJ_No / ADJ_Date / Remark）
  columns: ReportColumn[] = [
    { field: 'ADJ_No', header: '調整單號' },
    {
      field: 'ADJ_Date',
      header: '調整日期',
      format: (v: string) => this.formatDate(v),
    },
    { field: 'Remark', header: '備註' },
  ];

  /** 預設排序：調整日期 DESC, 調整單號 ASC */
  readonly defaultSort: SortItem[] = [
    { field: 'ADJ_Date', order: -1 },
    { field: 'ADJ_No', order: 1 },
  ];

  /* ----------------- 查詢表單 ----------------- */
  queryForm = this.formBuilder.group({
    // 調整單號（對應 @ADJ_No）
    adjust_ID: [null as string | null, [Validators.maxLength(14)]],

    // 調整日期 起訖（對應 @ADJ_Date_From / @ADJ_Date_To）
    adjust_Date_From: [null as Date | null],
    adjust_Date_To: [null as Date | null],

    // 備註 (模糊, 對應 @Remark)
    remark: ['', [Validators.maxLength(30)]],

    // 傳票單號 起迄（對應 @VouNo_From / @VouNo_To）
    summons_ID_From: [null as string | null],
    summons_ID_To: [null as string | null],

    // 分頁 + 排序（給 table-report 用）
    ...createPaginationConfig([{ field: 'ADJ_Date', order: -1 }]),
  });

  constructor(
    private fin32020Service: FIN32020Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  /* ----------------- LifeCycle ----------------- */
  ngOnInit(): void {
    this.initializePage('FIN32030', 'fin/fin32030cru', this.queryForm, (form) => this.onSubmit(form));
  }

  /* ----------------- Utility ----------------- */
  private formatDate(val: string): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${d.getFullYear()}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  }

  private toYMDOrNull(
    d: Date | string | null | undefined
  ): string | null {
    if (d == null) return null;
    const s = formatDateToYYYY_MM_DD(d as Date | string) as
      | string
      | null
      | undefined;
    return !s ? null : s;
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter(
        (x) =>
          x && typeof x.field === 'string' && typeof x.order === 'number'
      )
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  /** 把表單 & table-report body 組成 queryFIN32020Request */
  private buildPayload(base: any): Fin32020QueryRequest {
    const raw = this.queryForm.getRawValue();

    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
        ? base.pageIndex
        : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base.pageSize > 0
        ? base.pageSize
        : 30;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const orderBy =
      sort && sort.length
        ? sort
          .map((s) => {
            const dir = s.order === -1 ? 'DESC' : 'ASC';
            return `${s.field} ${dir}`;
          })
          .join(', ')
        : null;

    const req: Fin32020QueryRequest = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,
      OrderBy: orderBy,
      Offset: (pageIndex - 1) * pageSize,

      ADJ_No: raw.adjust_ID ? String(raw.adjust_ID) : null,

      ADJ_Date_From: this.toYMDOrNull(raw.adjust_Date_From),
      ADJ_Date_To: this.toYMDOrNull(raw.adjust_Date_To),

      Remark: raw.remark || null,

      VouNo_From: raw.summons_ID_From ? String(raw.summons_ID_From) : null,
      VouNo_To: raw.summons_ID_To ? String(raw.summons_ID_To) : null,
    };

    Object.keys(req).forEach((k) => {
      const v = (req as any)[k];
      if (v === '' || v === null || v === undefined) {
        delete (req as any)[k];
      }
    });

    return req;
  }

  /** 給 <app-table-report> 用的查詢函式（分頁載入） */
  public queryFIN32020ForReport = (body: any) =>
    this.fin32020Service
      .queryFIN32020(this.buildPayload(body || {}))
      .pipe(
        map((res: ApiResponse<Fin32020Row[] | Fin32020Row>) => {
          const src = res?.Data as any;
          const rows: Fin32020Row[] = Array.isArray(src)
            ? src
            : src
              ? [src]
              : [];
          const totalCount =
            Number((res as any)?.TotalCount ?? rows.length) ||
            rows.length;

          rows.forEach(
            (r, idx) => ((r as any)._rowKey = idx + 1)
          );

          return {
            Data: rows,
            TotalCount: totalCount,
            GrandTotal: null,
          };
        })
      );

  /* ----------------- Submit（主表查詢） ----------------- */
  onSubmit(frm: FormGroup) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    if (!this.hasPermission(this.Actions.Query)) {
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildPayload({
      ...raw,
      pageIndex: 1,
      pageSize: raw.pageSize || 30,
      SortBy: raw.SortBy || this.defaultSort,
    });

    payload.PageIndex = 1;

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.fin32020Service
      .queryFIN32020(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Fin32020Row[]>) => {
          const rows: Fin32020Row[] = Array.isArray(res?.Data)
            ? res.Data
            : [];

          rows.forEach(
            (r, idx) => ((r as any)._rowKey = idx + 1)
          );

          this.data = rows;
          this.viewTotalRecords = this.data.length;
          this.cdr.detectChanges();

          const realTotal =
            Number(res?.TotalCount ?? rows.length) || rows.length;
          setTimeout(() => {
            this.totalRecords = realTotal;
            this.viewTotalRecords = realTotal;
            this.lastQueryBody = {
              ...payload,
            };
          });

          this.queryStateService.setQueryState(
            this.ProgNo,
            this.queryForm.value
          );

          this.loading = false;
        },
        error: (err: any) => {
          console.error('FIN32020 API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
          this.loading = false;
        },
      });
  }

  /* ----------------- 清除 ----------------- */
  onClear(frm: FormGroup) {
    frm.reset({
      adjust_ID: null,
      adjust_Date_From: null,
      adjust_Date_To: null,
      remark: '',
      summons_ID_From: null,
      summons_ID_To: null,
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
  }

  /* ----------------- 建立 / 編輯 / 明細 ----------------- */
  onClickCreate() {
    this.onCreate(undefined, this.queryForm.value);
  }

  override onEdit(row: Fin32020Row, queryConditions?: any): void {
    super.onEdit(row, this.queryForm.value);
  }

  override onDetail(row: Fin32020Row, queryConditions?: any): void {
    super.onDetail(row, this.queryForm.value);
  }
}
