import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12040Service } from '@service/api/ass/ass12040.service';
import { Fin11040Service, TDS1008Data } from '@service/api/fin/fin11040.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { Actions } from '@shared/service/permission-guard.service';
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
  styleUrl: './ass12040.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    CalendarRangeQuickComponent,
    MenubarComponent,
    TableReportComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    InputTextComponent,
  ],
})
export class ASS12040Component extends BasicQueryPageComponent<ASS12040QueryRow> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    /** 採購單號 */
    PurchaseNo: new FormControl<string | null>(null),
    /** 品項編號 (GOODS_ID) */
    GOODS_ID: new FormControl<string | null>(null),
    /** 申請人編號 */
    EMP_ID: new FormControl<string | null>(null),
    /** 部門代號 */
    ORG_ID: new FormControl<string | null>(null),
    /** 申請日期(起) */
    APPLY_DATE_S: new FormControl<Date | null>(null),
    /** 申請日期(迄) */
    APPLY_DATE_E: new FormControl<Date | null>(null),
    /** 供應商編號 */
    SUPPLIER_ID: new FormControl<string | null>(null),
    /** 稅額(起)(迄) */
    TAX_AMT_S: new FormControl<number | null>(null),
    TAX_AMT_E: new FormControl<number | null>(null),
    /** 未稅總金額(起)(迄) */
    NO_TAX_AMT_S: new FormControl<number | null>(null),
    NO_TAX_AMT_E: new FormControl<number | null>(null),
    /** 含稅總金額(起)(迄) */
    TOTAL_TAX_AMT_S: new FormControl<number | null>(null),
    TOTAL_TAX_AMT_E: new FormControl<number | null>(null),
    /** 採購單狀態 (SUBPOENA_STATUS) */
    SUBPOENA_STATUS: new FormControl<string | null>(null),
    /** 審核人編號 */
    REVIEW_EMP_ID: new FormControl<string | null>(null),
    /** 審核日期(起)(迄) */
    REVIEW_DATE_S: new FormControl<Date | null>(null),
    REVIEW_DATE_E: new FormControl<Date | null>(null),
    /** 結帳日期(起)(迄) */
    CHECKOUT_DATE_S: new FormControl<Date | null>(null),
    CHECKOUT_DATE_E: new FormControl<Date | null>(null),
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

  /** TODO: 表格欄位名稱尚未確認，待規格確認後更新 field 與 API 回傳對應 */
  public readonly columns: ReportColumn[] = [
    { field: 'INVOICE_NO', header: '發票/收據號碼' },
    { field: 'RCV_NO', header: '驗收單號' },
    { field: 'INVOICE_MAINT_NO', header: '發票維護單號' },
    { field: 'SUPPLIER_ID', header: '供應商編號' },
    { field: 'PAYMENT_DOC_TYPE', header: '請款單據種類' },
    { field: 'INVOICE_FORMAT', header: '發票格式' },
    { field: 'TAX_TYPE', header: '稅別' },
    { field: 'NO_TAX_AMT', header: '未稅金額', type: 'inputNumber' },
    { field: 'TAX_AMT', header: '稅額', type: 'inputNumber' },
    { field: 'AMOUNT', header: '金額', type: 'inputNumber' },
    { field: 'OFFSET_TYPE', header: '扣抵別' },
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
    private readonly fin11040Service: Fin11040Service,
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

    this.dropDownListService.queryPOS2013_DropDownList({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.supplierIdOptions.set(toOpt(res.Data ?? []));
      },
    });

    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'SUBPOENA_STATUS' })
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.subpoenaStatusOptions.set(toOpt(res.Data ?? []));
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

    this.fin11040Service.queryFIN11040({ PageSize: 9999, PageIndex: 1 }).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const data: TDS1008Data[] = res.Data ?? [];
        const options = data
          .filter(item => item.INV_ItemNo != null && item.INV_ItemNo !== '')
          .map(item => ({
            label: `${item.INV_ItemNo} - ${item.INV_ItemName ?? ''}`,
            value: item.INV_ItemNo,
          }));
        this.goodsIdOptions.set(options);
      },
    });
  }

  public queryFunction = (
    body: ASS12040QueryRequest
  ): Observable<ApiResponse<ASS12040QueryRow[]>> => {
    const raw = this.queryForm.getRawValue();
    const payload: ASS12040QueryRequest = {
      PurchaseNo: raw.PurchaseNo || undefined,
      GOODS_ID: raw.GOODS_ID || undefined,
      EMP_ID: raw.EMP_ID || undefined,
      ORG_ID: raw.ORG_ID || undefined,
      APPLY_DATE_S: raw.APPLY_DATE_S ? this.formatDateStr(raw.APPLY_DATE_S) : undefined,
      APPLY_DATE_E: raw.APPLY_DATE_E ? this.formatDateStr(raw.APPLY_DATE_E) : undefined,
      SUPPLIER_ID: raw.SUPPLIER_ID || undefined,
      TAX_AMT_S: raw.TAX_AMT_S ?? undefined,
      TAX_AMT_E: raw.TAX_AMT_E ?? undefined,
      NO_TAX_AMT_S: raw.NO_TAX_AMT_S ?? undefined,
      NO_TAX_AMT_E: raw.NO_TAX_AMT_E ?? undefined,
      TOTAL_TAX_AMT_S: raw.TOTAL_TAX_AMT_S ?? undefined,
      TOTAL_TAX_AMT_E: raw.TOTAL_TAX_AMT_E ?? undefined,
      SUBPOENA_STATUS: raw.SUBPOENA_STATUS || undefined,
      REVIEW_EMP_ID: raw.REVIEW_EMP_ID || undefined,
      REVIEW_DATE_S: raw.REVIEW_DATE_S ? this.formatDateStr(raw.REVIEW_DATE_S) : undefined,
      REVIEW_DATE_E: raw.REVIEW_DATE_E ? this.formatDateStr(raw.REVIEW_DATE_E) : undefined,
      CHECKOUT_DATE_S: raw.CHECKOUT_DATE_S ? this.formatDateStr(raw.CHECKOUT_DATE_S) : undefined,
      CHECKOUT_DATE_E: raw.CHECKOUT_DATE_E ? this.formatDateStr(raw.CHECKOUT_DATE_E) : undefined,
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
        PurchaseNo: raw.PurchaseNo || undefined,
        GOODS_ID: raw.GOODS_ID || undefined,
        EMP_ID: raw.EMP_ID || undefined,
        ORG_ID: raw.ORG_ID || undefined,
        APPLY_DATE_S: raw.APPLY_DATE_S ? this.formatDateStr(raw.APPLY_DATE_S) : undefined,
        APPLY_DATE_E: raw.APPLY_DATE_E ? this.formatDateStr(raw.APPLY_DATE_E) : undefined,
        SUPPLIER_ID: raw.SUPPLIER_ID || undefined,
        TAX_AMT_S: raw.TAX_AMT_S ?? undefined,
        TAX_AMT_E: raw.TAX_AMT_E ?? undefined,
        NO_TAX_AMT_S: raw.NO_TAX_AMT_S ?? undefined,
        NO_TAX_AMT_E: raw.NO_TAX_AMT_E ?? undefined,
        TOTAL_TAX_AMT_S: raw.TOTAL_TAX_AMT_S ?? undefined,
        TOTAL_TAX_AMT_E: raw.TOTAL_TAX_AMT_E ?? undefined,
        SUBPOENA_STATUS: raw.SUBPOENA_STATUS || undefined,
        REVIEW_EMP_ID: raw.REVIEW_EMP_ID || undefined,
        REVIEW_DATE_S: raw.REVIEW_DATE_S ? this.formatDateStr(raw.REVIEW_DATE_S) : undefined,
        REVIEW_DATE_E: raw.REVIEW_DATE_E ? this.formatDateStr(raw.REVIEW_DATE_E) : undefined,
        CHECKOUT_DATE_S: raw.CHECKOUT_DATE_S ? this.formatDateStr(raw.CHECKOUT_DATE_S) : undefined,
        CHECKOUT_DATE_E: raw.CHECKOUT_DATE_E ? this.formatDateStr(raw.CHECKOUT_DATE_E) : undefined,
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

  /** 管理欄位：查看（內建）+ 強制結案、審核確認（皆呼叫審核 API） */
  public readonly addButton: AddButton[] = [
    {
      label: '強制結案',
      icon: 'pi pi-lock',
      action: (row: ASS12040QueryRow) => this.onApprove(row, 'FORCE_CLOSE'),
      disabled: () => !this.hasPermission(Actions.Audit),
    },
    {
      label: '審核確認',
      icon: 'pi pi-check',
      action: (row: ASS12040QueryRow) => this.onApprove(row, 'APPROVE'),
      disabled: () => !this.hasPermission(Actions.Audit),
    },
  ];

  public onApprove(rowData: ASS12040QueryRow, actionType: 'FORCE_CLOSE' | 'APPROVE'): void {
    const key = rowData.PurchaseNo ?? rowData.INVOICE_NO ?? (rowData as any).id;
    if (!key) {
      this.logger.warn('ASS12040 onApprove: 無可識別 key', [rowData]);
      return;
    }
    const label = actionType === 'FORCE_CLOSE' ? '強制結案' : '審核確認';
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
            PurchaseNo: String(key),
            ActionType: actionType,
          })
          .pipe(finalize(() => this.messageService.unblockUi()))
          .subscribe({
            next: res => {
              if (res.Status === '0000') {
                this.messageService.successBubble(`${label}成功`);
                this.onSubmit();
              } else {
                this.messageService.errorBubble(res.Message ?? `${label}失敗`);
              }
            },
            error: err => {
              this.logger.error('ASS12040 approve error:', err);
              this.messageService.errorBubble(`${label}失敗，請重試或聯繫管理員`);
            },
          });
      },
      reject: () => this.messageService.infoBubble(`已取消${label}`),
    });
  }
}
