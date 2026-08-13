import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  ASS15020QueryRequest,
  ASS15020QueryRow,
} from '@pages/ass/ass15020/ass15020.model';
import { ASS15020Service } from '@service/api/ass/ass15020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn, formatDate } from '@shared/components/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { map } from 'rxjs/operators';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';

/** 3.1.5.2 財產保管清冊 */
@UntilDestroy()
@Component({
  selector: 'app-ass15020',
  templateUrl: './ass15020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS15020Component
  extends BasicQueryPageComponent<ASS15020QueryRow>
  implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    keepingDepartment: [null as string | null],
    usageUnit: [null as string | null],
    usageDepartment: [null as string | null],
    usagePerson: [null as string | null],
    propertyCode: [null as string | null],
    itemCode: [null as string | null],
    propertyType: [null as string | null],
    assetStatus: [null as string | null],
    purchaseDateFrom: [null as string | null],
    purchaseDateTo: [null as string | null],
    grouping: ['HOLD_ORG_ID' as string],
  });

  keepingDepartmentOptions: { value: string; label: string }[] = [];
  usageUnitOptions: { value: string; label: string }[] = [];
  usageDepartmentOptions: { value: string; label: string }[] = [];
  usagePersonOptions: { value: string; label: string }[] = [];
  propertyCodeOptions: { value: string; label: string }[] = [];
  itemCodeOptions: { value: string; label: string }[] = [];
  propertyTypeOptions: { value: string; label: string }[] = [];
  assetStatusOptions: { value: string; label: string }[] = [];
  groupingOptions: { value: string; label: string }[] = [
    { value: 'HOLD_ORG_ID', label: '有保管部門' },
    { value: 'HOLD_EMP_ID', label: '保管人員' },
    { value: 'GOODS_ID', label: '品項編號' },
    { value: 'DEPRE_YN', label: '財產類型' },
  ];

  readonly tableData = signal<ASS15020QueryRow[]>([]);
  readonly totalRecords = signal<number>(0);

  // API Data.Total：全部查詢資料總計
  readonly totalSummary = signal({
    TtlOriPurchaseAmt: 0,
    TtlChangeAmt: 0,
    TtlTotalAmt: 0,
  });

  readonly tableLoading = signal<boolean>(false);
  exportExcelLoading = false;
  lastQueryBody?: ASS15020QueryRequest;
  private readonly defaultPageSize = 30;

  columns: ReportColumn[] = [
    { field: 'ASSET_ID', header: '資產編號', visible: true, width: '100px' },
    { field: 'GOODS_ID', header: '品項編號', visible: true, width: '100px' },
    { field: 'GOODS_NAME', header: '品項名稱', visible: true },
    { field: 'EQUIP_ID', header: '設備編號', visible: true },
    {
      field: 'GET_DATE',
      header: '購入日期',
      visible: true,
      format: (v: string) => formatDate(v),
    },
    { field: 'ASSET_STATUS_NAME', header: '資產狀態', visible: true },
    { field: 'HOLD_ORG_NAME', header: '保管單位', visible: true },
    { field: 'HOLD_EMP_NAME', header: '保管人', visible: true },
    { field: 'USE_ORG_NAME', header: '使用單位', visible: true },
    { field: 'USE_EMP_NAME', header: '使用人', visible: true },
    {
      field: 'FIR_GET_COST',
      header: '原購入金額',
      visible: true,
      align: 'right',
      format: (v: number) => this.formatMoney(v),
      width: '100px',
    },
    {
      field: 'CHANGE_COST',
      header: '異動金額', // (GET_COST - FIR_GET_COST)
      visible: true,
      align: 'right',
      format: (v: number) => this.formatMoney(v),
      width: '100px',
    },
    {
      field: 'TOTAL_COST',
      header: '合計金額', // 合計金額 / 最終資產金額 (SQL 已處理 ISNULL)
      visible: true,
      align: 'right',
      format: (v: number) => this.formatMoney(v),
      width: '100px',
    },
    { field: 'NOTES', header: '備註', visible: true },
  ];

  get footerData(): { label: string; FIR_GET_COST: number; CHANGE_COST: number; TOTAL_COST: number } | null {
    if (this.totalRecords() <= 0) {
      return null;
    }

    const total = this.totalSummary();

    return {
      label: '合計',
      FIR_GET_COST: this.toSafeNumber(total.TtlOriPurchaseAmt),
      CHANGE_COST: this.toSafeNumber(total.TtlChangeAmt),
      TOTAL_COST: this.toSafeNumber(total.TtlTotalAmt),
    };
  }

  constructor(
    private readonly dropdownApi: DropdownApiService,
    private readonly ass15020Service: ASS15020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'ASS15020',
      'ass/ass15020cru',
      this.queryForm,
      (form) => this.onSubmit(form)
    );
    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
    this.dropdownApi
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        const list = opts ?? [];
        this.keepingDepartmentOptions = list;
        this.usageDepartmentOptions = list;
      });

    this.dropdownApi
      .queryTblUser()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.usagePersonOptions = opts ?? [];
      });

    this.dropdownApi
      .queryTblUserOrgidAsOrg()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.usageUnitOptions = opts ?? [];
      });

    this.dropdownApi
      .queryASS11040DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.itemCodeOptions = opts ?? [];
      });

    this.dropdownApi
      .querySys1000({ SYS_Type: 'ASSET_TYPE' })
      .pipe(
        untilDestroyed(this),
        map((items) =>
          (items ?? []).map((item) => ({
            value: item.No,
            label: `${item.No} - ${item.Name}`,
          }))
        )
      )
      .subscribe((opts) => {
        this.propertyTypeOptions = opts;
      });

    this.dropdownApi
      .querySys1000({ SYS_Type: 'ASSET_STATUS' })
      .pipe(
        untilDestroyed(this),
        map((items) =>
          (items ?? []).map((item) => ({
            value: item.No,
            label: `${item.No} - ${item.Name}`,
          }))
        )
      )
      .subscribe((opts) => {
        this.assetStatusOptions = opts;
      });

    this.dropdownApi
      .queryFAASSETChooseList_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.propertyCodeOptions = opts ?? [];
      });
  }

  private buildRequest(body?: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): ASS15020QueryRequest {
    const raw = this.queryForm.getRawValue();
    const pageSize = body?.pageSize ?? body?.PageSize ?? this.defaultPageSize;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? 1;
    const sortBy = Array.isArray(body?.SortBy) ? body?.SortBy : undefined;

    const payload: ASS15020QueryRequest = {
      STO_NO: this.authService.currentUserValue?.SYS_StoreNo ?? undefined,
      HOLD_ORG_ID: raw.keepingDepartment || undefined,
      USE_ORG_ID: raw.usageUnit || undefined,
      USE_EMP_ID: raw.usagePerson || undefined,
      ASSET_ID: raw.propertyCode || undefined,
      GOODS_ID: raw.itemCode || undefined,
      DEPRE_YN: raw.propertyType || undefined,
      ASSET_STATUS: raw.assetStatus || undefined,
      GET_DATE_S: this.toApiDateValue(raw.purchaseDateFrom),
      GET_DATE_E: this.toApiDateValue(raw.purchaseDateTo),
      GROUP: raw.grouping || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: sortBy,
    };

    return removeEmptyValues(payload) as ASS15020QueryRequest;
  }

  queryFunction = (body: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }) => {
    const request = this.buildRequest(body);
    this.lastQueryBody = request;

    return this.ass15020Service.queryASS15020(request).pipe(
      map((res: any) => {
        // API 實際結構：
        // Data.Details   -> 明細
        // Data.Total     -> 全部資料總計
        // Data.TotalRows -> 總筆數
        // Data.TotalPages-> 總頁數
        const responseData = res?.Status === '0000' ? res?.Data : null;

        const list: ASS15020QueryRow[] = Array.isArray(responseData?.Details)
          ? responseData.Details
          : [];

        const mapped = list.map((row, idx) => ({
          ...row,
          RowNum: row.RowNum ?? idx + 1,
          ID: row.ID ?? row.ASSET_ID ?? `row-${idx}`,
        }));

        return {
          Data: mapped,
          TotalCount: responseData?.TotalRows ?? res?.TotalCount ?? mapped.length,
          TotalPages: responseData?.TotalPages ?? res?.TotalPage ?? 0,
          Total: {
            TtlOriPurchaseAmt: this.toSafeNumber(
              responseData?.Total?.TtlOriPurchaseAmt
            ),
            TtlChangeAmt: this.toSafeNumber(
              responseData?.Total?.TtlChangeAmt
            ),
            TtlTotalAmt: this.toSafeNumber(
              responseData?.Total?.TtlTotalAmt
            ),
          },
        };
      })
    );
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.lastQueryBody = this.buildRequest({
        pageSize: this.defaultPageSize,
        pageIndex: 1,
        SortBy: this.lastQueryBody?.SortBy,
      });
      this.tableLoading.set(true);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: (res) => {
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
            this.totalSummary.set(
              res.Total ?? {
                TtlOriPurchaseAmt: 0,
                TtlChangeAmt: 0,
                TtlTotalAmt: 0,
              }
            );
          },
          error: () => {
            this.tableData.set([]);
            this.totalRecords.set(0);
            this.totalSummary.set({
              TtlOriPurchaseAmt: 0,
              TtlChangeAmt: 0,
              TtlTotalAmt: 0,
            });
          },
        });
    });
  }

  private buildExportPayload(): ASS15020QueryRequest {
    return this.buildRequest({
      PageSize: this.lastQueryBody?.PageSize ?? 0,
      PageIndex: this.lastQueryBody?.PageIndex ?? 0,
      SortBy: this.lastQueryBody?.SortBy,
    });
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  private getTimestamp(): string {
    const now = new Date();
    return now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') + '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');
  }

  onExportExcel(): void {
    const payload = this.buildExportPayload();
    this.exportExcelLoading = true;
    this.ass15020Service
      .exportExcelASS15020(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.exportExcelLoading = false)
      )
      .subscribe(blob => {
        if (blob) {
          this.downloadBlob(blob, `財產保管清冊_${this.getTimestamp()}.xlsx`);
        }
      });
  }

  private toApiDateValue(value: unknown): string | undefined {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return undefined;
  }

  private toSafeNumber(value: unknown): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') {
      const parsed = Number(value.replaceAll(',', '').trim());
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  private formatMoney(value: unknown): string {
    return this.toSafeNumber(value).toLocaleString('en-US');
  }

  onClearForm(): void {
    this.queryForm.reset({ grouping: 'HOLD_ORG_ID' });
  }

  override onDetail(data: ASS15020QueryRow): void {
    this.navigateWithState(CRUDStatus.Read, data);
  }
}