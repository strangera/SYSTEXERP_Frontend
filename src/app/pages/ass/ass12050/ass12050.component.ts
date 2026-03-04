import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS12050QueryRow, QueryASS12050Request } from '@pages/ass/ass12050/ass12050.model';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12050Service } from '@service/api/ass/ass12050.service';
import { Fin11040Service, TDS1008Data } from '@service/api/fin/fin11040.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDate } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { Actions } from '@shared/service/permission-guard.service';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';

/** 3.1.2.5 採購單驗收作業 */
@UntilDestroy()
@Component({
  selector: 'app-ass12050',
  templateUrl: './ass12050.component.html',
  styleUrl: './ass12050.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeQuickComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS12050Component extends BasicQueryPageComponent<ASS12050QueryRow> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    SUBPOENA_ID: [null as string | null],
    GOODS_ID: [null as string | null],
    EMP_ID: [null as string | null],
    M_ORG_ID: [null as string | null],
    APPLY_DATE_S: [null as Date | null],
    APPLY_DATE_E: [null as Date | null],
    SUPPLIER_ID: [null as string | null],
    M_TAX_AMT_S: [null as number | null],
    M_TAX_AMT_E: [null as number | null],
    M_NTAX_AMT_S: [null as number | null],
    M_NTAX_AMT_E: [null as number | null],
    M_AMT_S: [null as number | null],
    M_AMT_E: [null as number | null],
    NEEDS_STATUS: [null as string | null],
    APRV_EMP_ID: [null as string | null],
    APRV_DATE_S: [null as Date | null],
    APRV_DATE_E: [null as Date | null],
    PAY_DATE_S: [null as Date | null],
    PAY_DATE_E: [null as Date | null],
    APPLY_USER_ID: [null as string | null],
    WH_ID: [null as string | null],
    PageSize: [30],
    PageIndex: [1],
  });

  /** 品項：queryFIN11040 */
  goodsIdOptions: { value: string; label: string }[] = [];
  /** 申請人：queryTBLUSER_DropDownList */
  empIdOptions: { value: string; label: string }[] = [];
  /** 審核人：queryTBLUSER_DropDownList */
  aprvEmpIdOptions: { value: string; label: string }[] = [];
  /** 驗收人：queryTBLUSER_DropDownList */
  applyUserIdOptions: { value: string; label: string }[] = [];
  /** 部門：querySYS3100_DropDownList */
  orgIdOptions: { value: string; label: string }[] = [];
  /** 供應商：queryPOS2013_DropDownList */
  supplierIdOptions: { value: string; label: string }[] = [];
  /** 採購單狀態：querySYS1000_DropDownList('NEEDS_STATUS') */
  needsStatusOptions: { value: string; label: string }[] = [];
  /** 倉別：queryASS11100 */
  whIdOptions: { value: string; label: string }[] = [];

  data: ASS12050QueryRow[] = [];
  selectedRows: ASS12050QueryRow[] = [];
  totalRecords = 0;
  lastQueryBody: QueryASS12050Request | null = null;

  columns: ReportColumn[] = [
    { field: 'SUBPOENA_ID', header: '採購單號', visible: true },
    { field: 'SUBCHECK_ID', header: '驗收單號', visible: true },
    { field: 'EMP_NAME', header: '申請人編號', visible: true },
    { field: 'APPLY_USER_NAME', header: '驗收人', visible: true },
    { field: 'ORG_NAME', header: '部門', visible: true },
    { field: 'APPLY_DATE', header: '申請日期', visible: true, format: formatDate },
    { field: 'M_TAX_AMT', header: '稅額', visible: true },
    { field: 'M_AMT', header: '含稅總金額', visible: true },
    { field: 'NEEDS_STATUS_NAME', header: '採購單狀態', visible: true },
    { field: 'CHECK_STATUS_NAME', header: '驗收單狀態', visible: true },
    { field: 'APRV_EMP_ID', header: '審核人代碼', visible: true },
    { field: 'APRV_DATE', header: '審核日期', visible: true, format: formatDate },
    { field: 'CHECK_DATE', header: '驗收日期', visible: true, format: formatDate },
    { field: 'DETAIL_CNT', header: '明細筆數', visible: true },
  ];

  addButton: AddButton[] = [
    {
      label: '下載報表',
      icon: 'pi pi-download',
      action: (rowData: ASS12050QueryRow) => this.onDownloadReport(rowData),
      disabled: () => !this.hasPermission(Actions.Report),
    },
  ];

  constructor(
    private readonly ass12050Service: ASS12050Service,
    private readonly dropDownListService: DropDownListService,
    private readonly fin11040Service: Fin11040Service,
    private readonly ass11100Service: ASS11100Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12050', 'ass/ass12050master', this.queryForm, () =>
      this.onSubmit(),
    );
    this.loadDropdownOptions();
  }

  onCreateReceiving(): void {
    if (!this.hasPermission(Actions.Create)) return;
    this.router.navigate(['account/ass/ass12050cru'], {
      state: {
        crudstatus: CRUDStatus.Create,
        fromRoute: this.router.url,
      },
    });
  }

  private loadDropdownOptions(): void {
    const toOpt = (items: { No?: string; Name?: string }[]) =>
      (items ?? []).map(item => ({
        label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        value: item.No ?? '',
      }));

    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const options = toOpt(res.Data ?? []);
        this.empIdOptions = options;
        this.aprvEmpIdOptions = options;
        this.applyUserIdOptions = options;
      });

    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.orgIdOptions = toOpt(res.Data ?? []);
      });

    this.dropDownListService
      .queryPOS2013_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.supplierIdOptions = list.map((item: { VEN_No?: string; No?: string; Name?: string }) => ({
          value: item.VEN_No ?? item.No ?? '',
          label: `${item.VEN_No ?? item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });

    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'NEEDS_STATUS' })
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.needsStatusOptions = toOpt(res.Data ?? []);
      });

    this.fin11040Service
      .queryFIN11040({ PageSize: 9999, PageIndex: 1 })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          const data: TDS1008Data[] = res.Data ?? [];
          this.goodsIdOptions = data
            .filter(item => item.INV_ItemNo != null && item.INV_ItemNo !== '')
            .map(item => ({
              label: `${item.INV_ItemNo} - ${item.INV_ItemName ?? ''}`,
              value: item.INV_ItemNo,
            }));
        },
      });

    this.ass11100Service
      .queryASS11100({ PageSize: 9999, PageIndex: 1 })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.whIdOptions = (res.Data ?? [])
            .filter(item => item.WH_ID != null && item.WH_ID !== '')
            .map(item => ({
              label: `${item.WH_ID} - ${item.WH_NAME ?? ''}`,
              value: item.WH_ID!,
            }));
        },
      });
  }

  private formatDateStr(d: Date | null): string {
    if (!d) return '';
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  queryFunction = (body: QueryASS12050Request): Observable<ApiResponse<ASS12050QueryRow[]>> => {
    const raw = this.queryForm.getRawValue();
    const payload: QueryASS12050Request = {
      SUBPOENA_ID: raw.SUBPOENA_ID || undefined,
      GOODS_ID: raw.GOODS_ID || undefined,
      EMP_ID: raw.EMP_ID || undefined,
      M_ORG_ID: raw.M_ORG_ID || undefined,
      APPLY_DATE_S: raw.APPLY_DATE_S ? this.formatDateStr(raw.APPLY_DATE_S) : undefined,
      APPLY_DATE_E: raw.APPLY_DATE_E ? this.formatDateStr(raw.APPLY_DATE_E) : undefined,
      SUPPLIER_ID: raw.SUPPLIER_ID || undefined,
      M_TAX_AMT_S: raw.M_TAX_AMT_S ?? undefined,
      M_TAX_AMT_E: raw.M_TAX_AMT_E ?? undefined,
      M_NTAX_AMT_S: raw.M_NTAX_AMT_S ?? undefined,
      M_NTAX_AMT_E: raw.M_NTAX_AMT_E ?? undefined,
      M_AMT_S: raw.M_AMT_S ?? undefined,
      M_AMT_E: raw.M_AMT_E ?? undefined,
      NEEDS_STATUS: raw.NEEDS_STATUS || undefined,
      APRV_EMP_ID: raw.APRV_EMP_ID || undefined,
      APRV_DATE_S: raw.APRV_DATE_S ? this.formatDateStr(raw.APRV_DATE_S) : undefined,
      APRV_DATE_E: raw.APRV_DATE_E ? this.formatDateStr(raw.APRV_DATE_E) : undefined,
      PAY_DATE_S: raw.PAY_DATE_S ? this.formatDateStr(raw.PAY_DATE_S) : undefined,
      PAY_DATE_E: raw.PAY_DATE_E ? this.formatDateStr(raw.PAY_DATE_E) : undefined,
      APPLY_USER_ID: raw.APPLY_USER_ID || undefined,
      WH_ID: raw.WH_ID || undefined,
      PageSize: body.PageSize ?? raw.PageSize ?? 30,
      PageIndex: body.PageIndex ?? raw.PageIndex ?? 1,
      SortBy: body.SortBy,
    };
    const clean = removeEmptyValues(payload) as QueryASS12050Request;
    return this.ass12050Service.queryASS12050(clean);
  };

  onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      this.lastQueryBody = {
        SUBPOENA_ID: raw.SUBPOENA_ID || undefined,
        GOODS_ID: raw.GOODS_ID || undefined,
        EMP_ID: raw.EMP_ID || undefined,
        M_ORG_ID: raw.M_ORG_ID || undefined,
        APPLY_DATE_S: raw.APPLY_DATE_S ? this.formatDateStr(raw.APPLY_DATE_S) : undefined,
        APPLY_DATE_E: raw.APPLY_DATE_E ? this.formatDateStr(raw.APPLY_DATE_E) : undefined,
        SUPPLIER_ID: raw.SUPPLIER_ID || undefined,
        M_TAX_AMT_S: raw.M_TAX_AMT_S ?? undefined,
        M_TAX_AMT_E: raw.M_TAX_AMT_E ?? undefined,
        M_NTAX_AMT_S: raw.M_NTAX_AMT_S ?? undefined,
        M_NTAX_AMT_E: raw.M_NTAX_AMT_E ?? undefined,
        M_AMT_S: raw.M_AMT_S ?? undefined,
        M_AMT_E: raw.M_AMT_E ?? undefined,
        NEEDS_STATUS: raw.NEEDS_STATUS || undefined,
        APRV_EMP_ID: raw.APRV_EMP_ID || undefined,
        APRV_DATE_S: raw.APRV_DATE_S ? this.formatDateStr(raw.APRV_DATE_S) : undefined,
        APRV_DATE_E: raw.APRV_DATE_E ? this.formatDateStr(raw.APRV_DATE_E) : undefined,
        PAY_DATE_S: raw.PAY_DATE_S ? this.formatDateStr(raw.PAY_DATE_S) : undefined,
        PAY_DATE_E: raw.PAY_DATE_E ? this.formatDateStr(raw.PAY_DATE_E) : undefined,
        APPLY_USER_ID: raw.APPLY_USER_ID || undefined,
        WH_ID: raw.WH_ID || undefined,
        PageSize: raw.PageSize ?? 30,
        PageIndex: 1,
      } as QueryASS12050Request;

      this.loading = true;
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? 0;
          },
        });
    });
  }

  onDownloadReport(row: ASS12050QueryRow): void {
    const subcheckId = row.SUBCHECK_ID;
    if (!subcheckId) return;
    this.loading = true;
    this.ass12050Service
      .exportPDFASS12050({ SUBCHECK_ID: subcheckId })
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: res => {
          const blob = res.body;
          if (!blob) {
            this.messageService.errorBubble('報表下載失敗');
            return;
          }
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ASS12050_${subcheckId}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.messageService.successBubble('報表下載成功');
        },
        error: () => {
          this.messageService.errorBubble('報表下載失敗');
        },
      });
  }
}
