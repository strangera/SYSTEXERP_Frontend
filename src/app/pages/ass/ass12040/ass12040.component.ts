import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12040Service } from '@service/api/ass/ass12040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AddButton, formatAmount2, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import {
  ASS12040QueryRequest,
  ASS12040QueryRow,
} from './ass12040.model';

/** 3.1.2.4 採購單審核作業 */
@Component({
  selector: 'app-ass12040',
  templateUrl: './ass12040.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    CalendarRangeComponent,
    MenubarComponent,
    TableReportComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    InputTextComponent,
  ],
})
export class ASS12040Component extends BasicQueryPageComponent<ASS12040QueryRow> implements OnInit {
  private readonly subpoenaStatusNameMap = new Map<string, string>();

  public readonly queryForm = this.formBuilder.group({
    /** 採購單號 */
    SUBPOENA_ID: new FormControl<string | null>(null),
    /** 品項編號 (GOODS_ID) */
    GOODS_ID: new FormControl<string | null>(null),
    /** 申請人編號 */
    EMP_ID: new FormControl<string | null>(null),
    /** 部門代號 */
    ORG_ID: new FormControl<string | null>(null),
    /** 申請日期(起) */
    APPLY_DATE_FROM: new FormControl<Date | null>(null),
    /** 申請日期(迄) */
    APPLY_DATE_TO: new FormControl<Date | null>(null),
    /** 供應商編號 */
    SUPPLIER_ID: new FormControl<string | null>(null),
    /** 稅額(起)(迄) */
    TAX_AMT_FROM: new FormControl<number | null>(null),
    TAX_AMT_TO: new FormControl<number | null>(null),
    /** 未稅總金額(起)(迄) */
    NTAX_AMT_FROM: new FormControl<number | null>(null),
    NTAX_AMT_TO: new FormControl<number | null>(null),
    /** 含稅總金額(起)(迄) */
    AMT_FROM: new FormControl<number | null>(null),
    AMT_TO: new FormControl<number | null>(null),
    /** 採購單狀態 (SUBPOENA_STATUS) */
    SUBPOENA_STATUS: new FormControl<string | null>(null),
    /** 審核人編號 */
    APRV_EMP_ID: new FormControl<string | null>(null),
    /** 審核日期(起)(迄) */
    APRV_DATE_FROM: new FormControl<Date | null>(null),
    APRV_DATE_TO: new FormControl<Date | null>(null),
    /** 結帳日期(起)(迄) */
    PAY_DATE_FROM: new FormControl<Date | null>(null),
    PAY_DATE_TO: new FormControl<Date | null>(null),
    /** 倉別 */
    WH_ID: new FormControl<string | null>(null),
    /** 項次列印筆數 → pageSize，必填，預設 30，最長 3 字 */
    pageSize: new FormControl<number>(30, [Validators.required, Validators.max(999)]),
    pageIndex: new FormControl<number>(1),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<ASS12040QueryRow[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: ASS12040QueryRequest;

  public readonly columns: ReportColumn[] = [
    { field: 'SUBPOENA_ID', header: '採購單號' },
    { field: 'EMP_ID', header: '申請人編號' },
    { field: 'ORG_ID', header: '部門代號' },
    { field: 'APPLY_DATE', header: '申請日期', format: formatDate },
    { field: 'SUPPLIER_ID', header: '供應商編號' },
    { field: 'TAX_AMT', header: '稅額', format: formatAmount2 },
    { field: 'NTAX_AMT', header: '未稅總金額', format: formatAmount2 },
    { field: 'AMT', header: '含稅總金額', format: formatAmount2 },
    {
      field: 'SUBPOENA_STATUS',
      header: '採購單狀態',
      format: value => this.subpoenaStatusNameMap.get(String(value ?? '')) ?? String(value ?? ''),
    },
    { field: 'APRV_EMP_ID', header: '審核人編號' },
    { field: 'APRV_DATE', header: '審核日期', format: formatDate },
    { field: 'PAY_DATE', header: '結帳日期', format: formatDate },
    { field: 'DetailCnt', header: '明細筆數' },
    { field: 'NOTES', header: '採購案說明' },
  ];

  public readonly goodsIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly empIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly orgIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly supplierIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly subpoenaStatusOptions = signal<{ label: string; value: string }[]>([]);
  public readonly reviewerOptions = signal<{ label: string; value: string }[]>([]);
  public readonly whIdOptions = signal<{ label: string; value: string }[]>([]);

  constructor(
    public readonly service: ASS12040Service,
    private readonly ass11100Service: ASS11100Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12040', '/ASS/ASS12040CRU', this.queryForm, this.onSubmit.bind(this));
    this.logger.debug('ASS12040 init:', [this.queryForm]);
    this.loadDropdownOptions();
  }

  private formatDateStr(d: Date | null): string {
    if (!d) return '';
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private loadDropdownOptions(): void {
    const toOpt = (items: { No?: string; Name?: string }[]) =>
      (items ?? []).map(item => ({
        label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        value: item.No ?? '',
      }));

    this.dropDownListService.queryTBLUSER_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.empIdOptions.set(toOpt(res.Data ?? []));
        this.reviewerOptions.set(toOpt(res.Data ?? []));
      },
    });

    this.dropDownListService.querySYS3100_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.orgIdOptions.set(toOpt(res.Data ?? []));
      },
    });

    this.dropdownApiService.queryPos2013({ VEN_Flag: '' })
      .pipe(untilDestroyed(this)).subscribe(res => {
        this.supplierIdOptions.set(res ?? []);
      });

    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'SUBPOENA_STATUS' })
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.subpoenaStatusOptions.set(toOpt(res.Data ?? []));
        },
      });

    this.dropdownApiService.querySys1000({ SYS_Type: 'SUBPOENA_STATUS' }).subscribe({
      next: rows => {
        this.subpoenaStatusNameMap.clear();
        (rows ?? []).forEach(row => {
          const code = String((row as any).No ?? (row as any).SYS_Code ?? '').trim();
          const name = String((row as any).Name ?? (row as any).SYS_Name ?? '').trim();
          if (code) {
            this.subpoenaStatusNameMap.set(code, name || code);
          }
        });
      },
    });

    this.ass11100Service.queryASS11100({ PageSize: 9999, PageIndex: 1 }).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = (res.Data ?? [])
          .filter(item => item.WH_ID != null && item.WH_ID !== '')
          .map(item => ({
            label: `${item.WH_ID} - ${item.WH_NAME ?? ''}`,
            value: item.WH_ID!,
          }));
        this.whIdOptions.set(options);
      },
    });

    this.dropdownApiService
      .queryASS11040_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.goodsIdOptions.set(options ?? []);
      });
  }

  public queryFunction = (
    body: ASS12040QueryRequest
  ): Observable<ApiResponse<ASS12040QueryRow[]>> => {
    const raw = this.queryForm.getRawValue();
    const payload: ASS12040QueryRequest = {
      SUBPOENA_ID: raw.SUBPOENA_ID || undefined,
      GOODS_ID: raw.GOODS_ID || undefined,
      EMP_ID: raw.EMP_ID || undefined,
      ORG_ID: raw.ORG_ID || undefined,
      APPLY_DATE_FROM: raw.APPLY_DATE_FROM ? this.formatDateStr(raw.APPLY_DATE_FROM) : undefined,
      APPLY_DATE_TO: raw.APPLY_DATE_TO ? this.formatDateStr(raw.APPLY_DATE_TO) : undefined,
      SUPPLIER_ID: raw.SUPPLIER_ID || undefined,
      TAX_AMT_FROM: raw.TAX_AMT_FROM ?? undefined,
      TAX_AMT_TO: raw.TAX_AMT_TO ?? undefined,
      NTAX_AMT_FROM: raw.NTAX_AMT_FROM ?? undefined,
      NTAX_AMT_TO: raw.NTAX_AMT_TO ?? undefined,
      AMT_FROM: raw.AMT_FROM ?? undefined,
      AMT_TO: raw.AMT_TO ?? undefined,
      SUBPOENA_STATUS: raw.SUBPOENA_STATUS || undefined,
      APRV_EMP_ID: raw.APRV_EMP_ID || undefined,
      APRV_DATE_FROM: raw.APRV_DATE_FROM ? this.formatDateStr(raw.APRV_DATE_FROM) : undefined,
      APRV_DATE_TO: raw.APRV_DATE_TO ? this.formatDateStr(raw.APRV_DATE_TO) : undefined,
      PAY_DATE_FROM: raw.PAY_DATE_FROM ? this.formatDateStr(raw.PAY_DATE_FROM) : undefined,
      PAY_DATE_TO: raw.PAY_DATE_TO ? this.formatDateStr(raw.PAY_DATE_TO) : undefined,
      WH_ID: raw.WH_ID || undefined,
      PageSize: body.PageSize ?? raw.pageSize ?? 30,
      PageIndex: body.PageIndex ?? raw.pageIndex ?? 1,
      SortBy: body.SortBy,
    };
    const clean = removeEmptyValues(payload) as ASS12040QueryRequest;
    return this.service.queryASS12040(clean);
  };

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      this.lastQueryBody = {
        SUBPOENA_ID: raw.SUBPOENA_ID || undefined,
        GOODS_ID: raw.GOODS_ID || undefined,
        EMP_ID: raw.EMP_ID || undefined,
        ORG_ID: raw.ORG_ID || undefined,
        APPLY_DATE_FROM: raw.APPLY_DATE_FROM ? this.formatDateStr(raw.APPLY_DATE_FROM) : undefined,
        APPLY_DATE_TO: raw.APPLY_DATE_TO ? this.formatDateStr(raw.APPLY_DATE_TO) : undefined,
        SUPPLIER_ID: raw.SUPPLIER_ID || undefined,
        TAX_AMT_FROM: raw.TAX_AMT_FROM ?? undefined,
        TAX_AMT_TO: raw.TAX_AMT_TO ?? undefined,
        NTAX_AMT_FROM: raw.NTAX_AMT_FROM ?? undefined,
        NTAX_AMT_TO: raw.NTAX_AMT_TO ?? undefined,
        AMT_FROM: raw.AMT_FROM ?? undefined,
        AMT_TO: raw.AMT_TO ?? undefined,
        SUBPOENA_STATUS: raw.SUBPOENA_STATUS || undefined,
        APRV_EMP_ID: raw.APRV_EMP_ID || undefined,
        APRV_DATE_FROM: raw.APRV_DATE_FROM ? this.formatDateStr(raw.APRV_DATE_FROM) : undefined,
        APRV_DATE_TO: raw.APRV_DATE_TO ? this.formatDateStr(raw.APRV_DATE_TO) : undefined,
        PAY_DATE_FROM: raw.PAY_DATE_FROM ? this.formatDateStr(raw.PAY_DATE_FROM) : undefined,
        PAY_DATE_TO: raw.PAY_DATE_TO ? this.formatDateStr(raw.PAY_DATE_TO) : undefined,
        WH_ID: raw.WH_ID || undefined,
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1,
      } as ASS12040QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
        });
    });
  }

  /** 編輯不提供，僅查看 */
  public editDisabled = (): boolean => true;

  /** 管理欄位：查看（內建）+ 審核確認 */
  public readonly addButton: AddButton[] = [
    {
      label: '審核確認',
      icon: 'pi pi-check',
      action: (row: ASS12040QueryRow) => this.onApprove(row),
      // disabled: () => !this.hasPermission(Actions.Audit),
      // 已審核會DISABLED
      disabled: (row: ASS12040QueryRow) => {
        const status = String(row.SUBPOENA_STATUS ?? '').trim();
        return status === '2';
      },
    },
  ];

  public onApprove(rowData: ASS12040QueryRow): void {
    const key = rowData.SUBPOENA_ID;
    if (!key) {
      this.logger.warn('ASS12040 onApprove: 無可識別 key', [rowData]);
      return;
    }
    const label = '審核確認';
    this.messageService.confirm({
      message: `確定要${label}嗎？`,
      header: `${label}確認`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確定',
      rejectLabel: '取消',
      accept: () => {
        this.messageService.blockUi();
        this.service
          .approveASS12040({
            SUBPOENA_ID: String(key),
          })
          .pipe(finalize(() => this.messageService.unblockUi()))
          .subscribe({
            next: res => {
              if (res.Status === '0000') {
                this.messageService.successBubble(`${label}成功`);
                this.onSubmit();
              }
            }
          });
      },
      reject: () => this.messageService.infoBubble(`已取消${label}`),
    });
  }
}
