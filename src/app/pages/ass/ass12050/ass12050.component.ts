import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { formatDate } from '@others/component/table/table.model';
import { ASS12050QueryRow, QueryASS12050Request } from '@pages/ass/ass12050/ass12050.model';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12050Service } from '@service/api/ass/ass12050.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AddButton, ReportColumn } from '@shared/components/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileExportService } from '@shared/service/file-export.service';
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
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
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
    ORG_ID: [null as string | null],
    APPLY_DATE_S: [null as Date | null],
    APPLY_DATE_E: [null as Date | null],
    SUPPLIER_ID: [null as string | null],
    TAX_AMT_S: [null as number | null],
    TAX_AMT_E: [null as number | null],
    NTAX_AMT_S: [null as number | null],
    NTAX_AMT_E: [null as number | null],
    AMT_S: [null as number | null],
    AMT_E: [null as number | null],
    STATUS: [null as string | null],
    APRV_EMP_ID: [null as string | null],
    APRV_DATE_S: [null as Date | null],
    APRV_DATE_E: [null as Date | null],
    CHECK_DATE_S: [null as Date | null],
    CHECK_DATE_E: [null as Date | null],
    WH_ID: [null as string | null],
    PageSize: [30],
    PageIndex: [1],
    SortBy: [[
  {
    field: 'SUBPOENA_ID',
    order: -1,
  },
]],
  });

  /** 品項：queryASS11040_DropDownList */
  goodsIdOptions: { value: string; label: string }[] = [];
  /** 申請人：queryTBLUSER_DropDownList */
  empIdOptions: { value: string; label: string }[] = [];
  /** 審核人：queryTBLUSER_DropDownList */
  aprvEmpIdOptions: { value: string; label: string }[] = [];
  /** 部門：querySYS3100_DropDownList */
  orgIdOptions: { value: string; label: string }[] = [];
  /** 供應商：queryPOS2013_DropDownList */
  supplierIdOptions: { value: string; label: string }[] = [];
  /** 狀態：querySYS1000_DropDownList */
  statusOptions: { value: string; label: string }[] = [];
  /** 倉別：queryASS11100 */
  whIdOptions: { value: string; label: string }[] = [];

  data: ASS12050QueryRow[] = [];
  selectedRows: ASS12050QueryRow[] = [];
  totalRecords = 0;
  lastQueryBody: QueryASS12050Request | null = null;

  columns: ReportColumn[] = [
    { field: 'SUBPOENA_ID', header: '採購單號', visible: true },
    { field: 'SUBCHECK_ID', header: '驗收單號', visible: true },
    { field: 'EMP_Name', header: '申請人', visible: true },
    { field: 'CLOSE_EMP_NAME', header: '結案人員', visible: true },
    { field: 'ORG_ID', header: '部門代號', visible: true },
    { field: 'APPLY_DATE', header: '申請日期', visible: true, format: formatDate },
    { field: 'TAX_AMT', header: '稅額', visible: true },
    { field: 'AMT', header: '含稅總金額', visible: true },
    { field: 'STATUS', header: '狀態', visible: true },
    { field: 'APRV_EMP_NAME', header: '審核人', visible: true },
    { field: 'APRV_DATE', header: '審核日期', visible: true, format: formatDate },
    { field: 'CHECK_DATE', header: '驗收日期', visible: true, format: formatDate },
    { field: 'DETAIL_COUNT', header: '明細筆數', visible: true },
    { field: 'CHECK_COUNT', header: '驗收筆數', visible: false },
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
    private readonly dropdownApiService: DropdownApiService,
    private readonly ass11100Service: ASS11100Service,
    private readonly fileExportService: FileExportService,
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
        this.statusOptions = toOpt(res.Data ?? []);
      });

    // 品項：queryASS11040_DropDownList（固定資產品項主檔，與整條資產採購流程一致）
    this.dropdownApiService
      .queryASS11040_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.goodsIdOptions = options ?? [];
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
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const payload: QueryASS12050Request = {
      SUBPOENA_ID: raw.SUBPOENA_ID || undefined,
      GOODS_ID: raw.GOODS_ID || undefined,
      EMP_ID: raw.EMP_ID || undefined,
      ORG_ID: raw.ORG_ID || undefined,
      APPLY_DATE_S: raw.APPLY_DATE_S ? this.formatDateStr(raw.APPLY_DATE_S) : undefined,
      APPLY_DATE_E: raw.APPLY_DATE_E ? this.formatDateStr(raw.APPLY_DATE_E) : undefined,
      SUPPLIER_ID: raw.SUPPLIER_ID || undefined,
      TAX_AMT_S: raw.TAX_AMT_S ?? undefined,
      TAX_AMT_E: raw.TAX_AMT_E ?? undefined,
      NTAX_AMT_S: raw.NTAX_AMT_S ?? undefined,
      NTAX_AMT_E: raw.NTAX_AMT_E ?? undefined,
      AMT_S: raw.AMT_S ?? undefined,
      AMT_E: raw.AMT_E ?? undefined,
      STATUS: raw.STATUS || undefined,
      APRV_EMP_ID: raw.APRV_EMP_ID || undefined,
      APRV_DATE_S: raw.APRV_DATE_S ? this.formatDateStr(raw.APRV_DATE_S) : undefined,
      APRV_DATE_E: raw.APRV_DATE_E ? this.formatDateStr(raw.APRV_DATE_E) : undefined,
      CHECK_DATE_S: raw.CHECK_DATE_S ? this.formatDateStr(raw.CHECK_DATE_S) : undefined,
      CHECK_DATE_E: raw.CHECK_DATE_E ? this.formatDateStr(raw.CHECK_DATE_E) : undefined,
      WH_ID: raw.WH_ID || undefined,
      PageSize: (body as any).pageSize ?? body.PageSize,
      PageIndex: (body as any).pageIndex ?? body.PageIndex ?? 1,
      SortBy: body.SortBy ?? [
  {
    field: 'SUBPOENA_ID',
    order: -1,
  },
],
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
        ORG_ID: raw.ORG_ID || undefined,
        APPLY_DATE_S: raw.APPLY_DATE_S ? this.formatDateStr(raw.APPLY_DATE_S) : undefined,
        APPLY_DATE_E: raw.APPLY_DATE_E ? this.formatDateStr(raw.APPLY_DATE_E) : undefined,
        SUPPLIER_ID: raw.SUPPLIER_ID || undefined,
        TAX_AMT_S: raw.TAX_AMT_S ?? undefined,
        TAX_AMT_E: raw.TAX_AMT_E ?? undefined,
        NTAX_AMT_S: raw.NTAX_AMT_S ?? undefined,
        NTAX_AMT_E: raw.NTAX_AMT_E ?? undefined,
        AMT_S: raw.AMT_S ?? undefined,
        AMT_E: raw.AMT_E ?? undefined,
        STATUS: raw.STATUS || undefined,
        APRV_EMP_ID: raw.APRV_EMP_ID || undefined,
        APRV_DATE_S: raw.APRV_DATE_S ? this.formatDateStr(raw.APRV_DATE_S) : undefined,
        APRV_DATE_E: raw.APRV_DATE_E ? this.formatDateStr(raw.APRV_DATE_E) : undefined,
        CHECK_DATE_S: raw.CHECK_DATE_S ? this.formatDateStr(raw.CHECK_DATE_S) : undefined,
        CHECK_DATE_E: raw.CHECK_DATE_E ? this.formatDateStr(raw.CHECK_DATE_E) : undefined,
        WH_ID: raw.WH_ID || undefined,
        PageSize: raw.PageSize ?? 30,
        PageIndex: 1,
       SortBy: raw.SortBy ?? [
    {
      field: 'SUBPOENA_ID',
      order: -1,
    },
  ],
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
    const subpoenaId = row.SUBPOENA_ID;
    if (!subpoenaId) return;
    this.fileExportService
      .executeFileExport(
        this.ass12050Service
          .exportASS12050({ SUBPOENA_ID: subpoenaId })
          .pipe(untilDestroyed(this)),
        '.xlsx',
        isLoading => (this.loading = isLoading),
        `ASS12050_${subpoenaId}`,
      )
      .subscribe();
  }
}
