import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN72050Service } from '@service/api/fin/fin72050.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import {
  FIN72050QueryData,
  FIN72050_STATUS_OPTIONS,
  QueryFIN72050Request,
} from '@shared/models/fin/fin72050.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import {
  ReportColumn,
  formatAmount2,
  formatDate,
} from '../../../shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@UntilDestroy()
@Component({
  selector: 'app-fin72050',
  templateUrl: './fin72050.component.html',
  styleUrl: './fin72050.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    MenubarComponent,
    ButtonComponent,
    InputTextComponent,
    DropdownComponent,
    InputNumberRangeComponent,
    CalendarRangeComponent,
    TableReportComponent,
  ],
})
export class FIN72050Component
  extends BasicQueryPageComponent<FIN72050QueryData>
  implements OnInit {
  // ── 查詢表單 ───────────────────────────────────────────
  queryForm = this.formBuilder.group({
    PCC_No: [null as string | null, [Validators.maxLength(20)]],         // 盤點單號
    Keep_UsrNo: [null as string | null],                                  // 保管人代碼
    Keep_QuotaAmt_From: [null as number | null, Validators.max(9999999999)], // 額度起
    Keep_QuotaAmt_To: [null as number | null, Validators.max(9999999999)],   // 額度迄
    PCC_DateFrom: [null as Date | string | null],                         // 盤點日期起
    PCC_DateTo: [null as Date | string | null],                           // 盤點日期迄
    PCS_RqstNo: [null as string | null],                                  // 支出請款單號
    PCC_Status: [null as string | null],                                  // 盤點單狀態
    PCC_DIFF_AMT_From: [null as number | null, Validators.max(9999999999)], // 盤點餘額起
    PCC_DIFF_AMT_To: [null as number | null, Validators.max(9999999999)],   // 盤點餘額迄
    PCS_Remark: [null as string | null, Validators.maxLength(100)],       // 說明
    Keep_OrgID: [null as string | null],                                  // 保管單位
    // 分頁/排序
    ...createPaginationConfig([{ field: 'PCC_Date', order: -1 }]),
  });

  // ── 表格 ───────────────────────────────────────────────
  data: FIN72050QueryData[] = [];
  lastQueryBody: QueryFIN72050Request | null = null;
  public readonly totalRecords = signal<number>(0);

  columns: ReportColumn[] = [
    { field: 'SeqNo', header: '序號', visible: true, align: 'right', showSort: false },
    { field: 'PCS_PST_No', header: '盤點單號', visible: true },
    { field: 'PCC_Date', header: '盤點日期', visible: true, format: formatDate },
    { field: 'Keep_UsrName', header: '保管人姓名', visible: true },
    { field: 'Keep_QuotaAmt', header: '零用金額度', visible: true, align: 'right', format: formatAmount2 },
    { field: 'PCC_Status_Name', header: '盤點單狀態', visible: true },
    { field: 'PCC_ActAmt', header: '盤點金額', visible: true, align: 'right', format: formatAmount2 },
    { field: 'PCC_NOPAY_AMT', header: '已支付未請款', visible: true, align: 'right', format: formatAmount2 },
    { field: 'PCC_NOREC_AMT', header: '已請款未撥補', visible: true, align: 'right', format: formatAmount2 },
    {
      field: 'PCC_DIFF_AMT',
      header: '盤點後差異數',
      visible: true,
      align: 'right',
      format: formatAmount2,
      cellClass: (row: FIN72050QueryData) => (Number(row?.PCC_DIFF_AMT ?? 0) < 0 ? 'text-red-500' : ''),
    },
    { field: 'PCS_Remark', header: '備註說明', visible: true },
  ];

  // ── 下拉資料 ────────────────────────────────────────────
  keepUser_Options = signal<Option[]>([]);          // 保管人
  keepingUnit_Options = signal<Option[]>([]);       // 保管單位
  PCS_RqstNo_Options = signal<Option[]>([]);        // 支出請款單號
  readonly status_Options = FIN72050_STATUS_OPTIONS;

  constructor(
    public readonly fin72050Service: FIN72050Service,
    private readonly dropdownApi: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN72050', 'FIN/FIN72050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  // ── 查詢送出 ─────────────────────────────────────────
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const body = this.buildQueryBody(form);
      this.lastQueryBody = body;
      this.fin72050Service.queryFIN72050(body)
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

  // ── 將 form 轉成 API request（包含日期轉字串） ─────────
  private buildQueryBody(form: FormGroup): QueryFIN72050Request {
    const raw = form.getRawValue();
    return {
      ...raw,
      PCC_DateFrom: this.toIsoDate(raw.PCC_DateFrom),
      PCC_DateTo: this.toIsoDate(raw.PCC_DateTo),
    } as QueryFIN72050Request;
  }

  private toIsoDate(value: Date | string | null | undefined): string | undefined {
    if (!value) return undefined;
    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(value);
  }

  // ── 載入下拉選單 ─────────────────────────────────────
  private loadDropdownOptions(): void {
    // 保管人（TBLUSER_Orgid_DropDownList）
    this.dropdownApi.queryTblUserOrgid()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (options) => {
          this.keepUser_Options.set(options ?? []);
        },
      });

    // 保管單位（SYS3100_DropDownList）
    this.dropdownApi.querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (options) => {
          this.keepingUnit_Options.set(options ?? []);
        },
      });

    // 支出請款單號
    this.dropdownApi.queryPOS2064MPCS_RqstNoDropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (options) => {
          this.PCS_RqstNo_Options.set(options ?? []);
        },
      });
  }
}
