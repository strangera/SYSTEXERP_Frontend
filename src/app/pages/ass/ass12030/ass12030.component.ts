import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS12030QueryRow, QueryASS12030Request } from '@pages/ass/ass12030/ass12030.model';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12030Service } from '@service/api/ass/ass12030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AddButton, ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatDate } from '@others/component/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { Actions } from '@shared/service/permission-guard.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

/** 3.1.2.3 採購申請作業 */
@UntilDestroy()
@Component({
  selector: 'app-ass12030',
  templateUrl: './ass12030.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputNumberRangeComponent,
    CalendarRangeComponent,
    InputTextComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS12030Component extends BasicQueryPageComponent<ASS12030QueryRow> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    subpoenaId: [null as string | null],
    goodsId: [null as string | null],
    empId: [null as string | null],
    orgId: [null as string | null],
    supplierId: [null as string | null],
    subpoenaStatus: [null as string | null],
    applyDateFrom: [null as Date | null],
    applyDateTo: [null as Date | null],
    aprvEmpId: [null as string | null],
    aprvDateFrom: [null as Date | null],
    aprvDateTo: [null as Date | null],
    payDateFrom: [null as Date | null],
    payDateTo: [null as Date | null],
    taxAmtFrom: [null as number | null],
    taxAmtTo: [null as number | null],
    ntaxAmtFrom: [null as number | null],
    ntaxAmtTo: [null as number | null],
    amtFrom: [null as number | null],
    amtTo: [null as number | null],
    whId: [null as string | null],

    PageSize: [30],
    PageIndex: [1],

    SortBy: [[
      {
        field: 'SUBPOENA_ID',
        order: -1,
      }
    ]],
  });

  /** 申請人、審核人：queryTBLUSER_DropDownList */
  empIdOptions: { value: string; label: string }[] = [];
  aprvEmpIdOptions: { value: string; label: string }[] = [];
  /** 部門：queryPOS2013_DropDownList */
  orgIdOptions = this.dropdownApiService.querySys3100();
  /** 品項：queryASS11040_DropDownList */
  goodsIdOptions: { value: string; label: string }[] = [];
  /** 倉別：queryASS11100 */
  whIdOptions: { value: string; label: string }[] = [];
  /** 採購單狀態：getSYS1000Options('NEEDS_STATUS') */
  subpoenaStatusOptions: { value: string; label: string }[] = [];
  /** 供應商：queryPOS2013_DropDownList(VEN_Flag: '1') */
  supplierIdOptions: { value: string; label: string }[] = [];

  data: ASS12030QueryRow[] = [];
  selectedRows: ASS12030QueryRow[] = [];
  totalRecords = 0;
  lastQueryBody: QueryASS12030Request | null = null;
  columns: ReportColumn[] = [
    { field: 'SUBPOENA_ID', header: '採購單號', visible: true },
    { field: 'EMP_NAME', header: '申請人編號', visible: true },
    { field: 'ORG_ID', header: '部門代號', visible: true },
    { field: 'ORG_NAME', header: '部門名稱', visible: true },
    { field: 'SUPPLIER_ID', header: '供應商編號', visible: true },
    { field: 'SUPPLIER_NAME', header: '供應商名稱', visible: true },
    { field: 'APPLY_DATE', header: '申請日期', visible: true, format: formatDate },
    { field: 'TAX_AMT', header: '稅額', visible: true },
    { field: 'NTAX_AMT', header: '未稅總金額', visible: true },
    { field: 'AMT', header: '含稅總金額', visible: true },
    { field: 'SUBPOENA_STATUS_NAME', header: '傳票狀態', visible: true },
    { field: 'APRV_EMP_ID', header: '審核人編號', visible: true },
    { field: 'APRV_DATE', header: '審核日期', visible: true, format: formatDate },
    { field: 'PAY_DATE', header: '結帳日期', visible: true, format: formatDate },
    { field: 'NOTES', header: '說明', visible: true },
  ];

  addButton: AddButton[] = [
    {
      label: '作廢',
      icon: 'pi pi-ban text-red-500',
      action: (rowData: ASS12030QueryRow) => this.onVoid(rowData),
      disabled: () => !this.hasPermission(Actions.Delete),
    },
    {
      label: '刪除',
      icon: 'pi pi-trash',
      action: (rowData: ASS12030QueryRow) => this.onDeleteRow(rowData),
      disabled: () => !this.hasPermission(Actions.Delete),
    },
    {
      label: '下載報表',
      icon: 'pi pi-download',
      action: (rowData: ASS12030QueryRow) => this.onDownloadReport(rowData),
      disabled: () => !this.hasPermission(Actions.Report),
    },
  ];

  constructor(
    public readonly ass12030Service: ASS12030Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
    private readonly ass11100Service: ASS11100Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12030', 'ass/ass12030cru', this.queryForm, () =>
      this.onSubmit(this.queryForm),
    );
    this.loadDropdownOptions();
  }

  /** 新增(已詢價)：進入 CRU 後顯示「套用請購清單」 */
  onCreateQuoted(): void {
    if (!this.hasPermission(Actions.Create)) return;
    this.router.navigate(['account/ass/ass12030cru'], {
      state: {
        crudstatus: CRUDStatus.Create,
        rowdata: null,
        fromRoute: this.router.url,
        createMode: 'quoted',
      },
    });
  }

  /** 新增(未詢價)：進入 CRU 後顯示「套用詢價清單」 */
  onCreateUnquoted(): void {
    if (!this.hasPermission(Actions.Create)) return;
    this.router.navigate(['account/ass/ass12030cru'], {
      state: {
        crudstatus: CRUDStatus.Create,
        rowdata: null,
        fromRoute: this.router.url,
        createMode: 'unquoted',
      },
    });
  }

  /** 載入申請人、審核人、部門下拉 */
  loadDropdownOptions(): void {
    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        const options = list.map((item: { No?: string; Name?: string }) => ({
          value: item.No ?? '',
          label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
        this.empIdOptions = options;
        this.aprvEmpIdOptions = options;
      });
    this.dropDownListService
      .queryPOS2013_DropDownList({ VEN_Flag: '1' })
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.supplierIdOptions = list.map((item: { VEN_No?: string; No?: string; Name?: string }) => ({
          value: item.VEN_No ?? item.No ?? '',
          label: `${item.VEN_No ?? item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });
    this.subpoenaStatusOptions = getSYS1000Options('NEEDS_STATUS');
    // 品項：queryASS11040_DropDownList（固定資產品項主檔，與整條資產採購流程一致）
    this.dropdownApiService.queryASS11040_DropDownList().subscribe(options => {
      this.goodsIdOptions = options ?? [];
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
        this.whIdOptions = options;
      },
    })

  }

  private formatDate(d: Date | null): string {
    if (!d) return '';
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  queryFunction = (body: unknown): ReturnType<ASS12030Service['queryASS12030']> => {
    const raw = this.queryForm.getRawValue();

    const tableBody = body as Partial<QueryASS12030Request>;

    const payload: QueryASS12030Request = {
      SUBPOENA_ID: raw.subpoenaId ?? undefined,
      GOODS_ID: raw.goodsId ?? undefined,
      EMP_ID: raw.empId ?? undefined,
      ORG_ID: raw.orgId ?? undefined,
      SUPPLIER_ID: raw.supplierId ?? undefined,
      SUBPOENA_STATUS: raw.subpoenaStatus ?? undefined,

      APPLY_DATE_S: raw.applyDateFrom
        ? this.formatDate(raw.applyDateFrom)
        : undefined,

      APPLY_DATE_E: raw.applyDateTo
        ? this.formatDate(raw.applyDateTo)
        : undefined,

      APRV_EMP_ID: raw.aprvEmpId ?? undefined,

      APRV_DATE_S: raw.aprvDateFrom
        ? this.formatDate(raw.aprvDateFrom)
        : undefined,

      APRV_DATE_E: raw.aprvDateTo
        ? this.formatDate(raw.aprvDateTo)
        : undefined,

      PAY_DATE_S: raw.payDateFrom
        ? this.formatDate(raw.payDateFrom)
        : undefined,

      PAY_DATE_E: raw.payDateTo
        ? this.formatDate(raw.payDateTo)
        : undefined,

      TAX_AMT_S: raw.taxAmtFrom ?? undefined,
      TAX_AMT_E: raw.taxAmtTo ?? undefined,
      NTAX_AMT_S: raw.ntaxAmtFrom ?? undefined,
      NTAX_AMT_E: raw.ntaxAmtTo ?? undefined,
      AMT_S: raw.amtFrom ?? undefined,
      AMT_E: raw.amtTo ?? undefined,
      WH_ID: raw.whId ?? undefined,

      PageSize: tableBody.PageSize ?? raw.PageSize ?? 30,
      PageIndex: tableBody.PageIndex ?? raw.PageIndex ?? 1,

      // Table 有點排序 → 使用 Table 的
      // 沒有 → 預設申請日期 DESC
      SortBy: tableBody.SortBy ?? raw.SortBy ?? [
        {
          field: 'SUBPOENA_ID',
          order: -1,
        },
      ],
    };

    return this.ass12030Service.queryASS12030(payload);
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();

      this.lastQueryBody = {
        ...raw,

        PageSize: 30,
        PageIndex: 1,

        SortBy: [
          {
            field: 'SUBPOENA_ID',
            order: -1,
          },
        ],
      };

      this.loading = true;

      this.queryFunction(this.lastQueryBody)
        .pipe(
          finalize(() => (this.loading = false))
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;

            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? 0;

            this.queryStateService.setQueryState(
              this.ProgNo,
              raw
            );
          },
        });
    });
  }
  onDeleteRow(row: ASS12030QueryRow): void {
    const subpoenaId = row.SUBPOENA_ID;
    if (!subpoenaId) {
      this.messageService.warnBubble('無可刪除的資料');
      return;
    }
    this.messageService.confirm({
      header: '確認刪除',
      message: '是否確認刪除此筆資料？',
      accept: () => {
        this.loading = true;
        this.ass12030Service
          .deleteASS12030({ SUBPOENA_ID: subpoenaId })
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('刪除成功');
              this.onSubmit(this.queryForm);
            },
          });
      },
    });
  }

  onVoid(row: ASS12030QueryRow): void {
    const subpoenaId = row.SUBPOENA_ID;
    if (!subpoenaId) {
      this.messageService.warnBubble('無可作廢的資料');
      return;
    }
    this.messageService.confirm({
      header: '確認作廢',
      message: '是否確認作廢此筆資料？',
      accept: () => {
        this.loading = true;
        this.ass12030Service
          .voidASS12030({ SUBPOENA_ID: subpoenaId })
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('作廢成功');
              this.onSubmit(this.queryForm);
            },
          });
      },
    });
  }

  onDownloadReport(row: ASS12030QueryRow): void {
    const subpoenaId = row.SUBPOENA_ID;
    if (!subpoenaId) return;
    this.loading = true;
    this.ass12030Service
      .exportPDFASS12030({ SUBPOENA_ID: subpoenaId })
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: res => {
          const blob = res.body;
          if (!blob) {
            this.messageService.errorBubble('報表下載失敗');
            return;
          }
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ASS12030_${subpoenaId}.pdf`;
          a.click();
          globalThis.URL.revokeObjectURL(url);
          this.messageService.successBubble('報表下載成功');
        },
        error: () => {
          this.messageService.errorBubble('報表下載失敗');
        },
      });
  }
}
