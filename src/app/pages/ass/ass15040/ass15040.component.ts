import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS15040Service } from '@service/api/ass/ass15040.service';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { map, Observable, of } from 'rxjs';
import { formatAmount, formatDate } from 'src/app/shared/components/table-report/table-report.model';
import { Option } from '../../../service/utility/dropdown-api.model';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { FileExportService } from '../../../shared/service/file-export.service';
import { ASS15040TableReportComponent } from './ass15040-table-report.component';
import { PrintASS15040Request, QueryASS15040Request, QueryASS15040Response } from './ass15040.model';


// 3.1.5.4 財產目錄之會計科目報表
@UntilDestroy()
@Component({
  selector: 'app-ass15040',
  templateUrl: './ass15040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
    ASS15040TableReportComponent
  ],
})
export class ASS15040Component extends BasicQueryPageComponent<QueryASS15040Response> implements OnInit {
  queryForm = this.formBuilder.group({
    baseYYMM: [null as Date | string | null, Validators.required], // 基準日 YYYYMM
    keeperUnit: [null as string | null], // 保管單位
    accountCode: [null as string | null], // 會計科目代碼
    itemCode: [null as string | null], // 品項編號
  });

  data: QueryASS15040Response[] = [];
  totalRecords = 0;
  footerData: QueryASS15040Response[] = [];
  lastQueryBody?: QueryASS15040Request;
  readonly tableLoading = signal(false);
  exportPdfLoading = false;
  exportExcelLoading = false;

  columns: ReportColumn[] = [
    {
      field: '__ITEM_NO',
      header: '項次',
      visible: true,
      align: 'center',
      width: '70px',
      showSort: false,
      format: (value: any) => value ?? ''
    },
    { field: 'STYPE_ID', header: '會計科目代碼', visible: false, align: 'left' },
    { field: 'STYPE_NAME', header: '會計科目名稱', visible: false, align: 'left' },

    { field: 'ASSET_ID', header: '財產編號', visible: true, width: '150px' },
    { field: 'GOODS_ID', header: '品項編號', visible: true, width: '100px' },
    { field: 'GOODS_NAME', header: '品項名稱', visible: true, width: '100px' },

    { field: 'EXP_YEAR', header: '耐用年數', visible: true, format: formatAmount, width: '40px' },

    { field: 'GET_DATE', header: '購入日期', visible: true, align: 'right', format: formatDate, width: '100px' },

    { field: 'GET_COST', header: '取得成本', visible: true, align: 'right', format: formatAmount, width: '100px' },

    { field: 'RESI_VALUE', header: '預留殘值', visible: true, align: 'right', format: formatAmount, width: '40px' },

    { field: 'YEAR_BEGIN_DEPREAMT', header: '年初累計折舊', visible: true, align: 'right', format: formatAmount, width: '110px' },

    { field: 'PREV_DEPREAMT', header: '前期折舊', visible: false, align: 'right', format: formatAmount, width: '100px' },

    { field: 'YEAR_DEPREAMT', header: '本期折舊金額', visible: true, align: 'right', format: formatAmount, width: '110px' },

    { field: 'MONTH_DEPREAMT', header: '本月折舊金額', visible: true, align: 'right', format: formatAmount, width: '110px' },

    { field: 'ACCUMULATED_DEPREAMT', header: '累計折舊金額', visible: true, align: 'right', format: formatAmount, width: '110px' },

    { field: 'AMT', header: '帳面價值', visible: true, align: 'right', format: formatAmount, width: '100px' },

    { field: 'HOLD_ORG_ID', header: '保管單位代碼', visible: false, align: 'left' },

    { field: 'HOLD_ORG_NAME', header: '保管單位', visible: true, width: '50px' },

    { field: 'NOTES', header: '財產註記', visible: true, align: 'left', width: '150px' },
  ];

  keeperUnitOptions: Option[] = [];
  accountCodeOptions: Option[] = [];
  itemCodeOptions: Option[] = [];

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private readonly ass15040Service: ASS15040Service,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS15040', '', this.queryForm, frm => this.onSubmit(frm));
    this.loadDropdownOptions();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(
      frm,
      () => {
        if (!this.hasPermission(this.Actions.Query)) {
          this.tableLoading.set(false);
          return;
        }
        const payload = this.buildQueryRequest();
        if (!payload) {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.tableLoading.set(false);
          return;
        }
        this.lastQueryBody = payload;
        this.ass15040Service.queryASS15040(payload).pipe(untilDestroyed(this)).subscribe({
          next: res => {
            if (res?.Status !== '0000') {
              this.data = [];
              this.totalRecords = 0;
              this.messageService.warnBubble(res?.Message || '查無資料或查詢失敗');
              return;
            }
            const rows = res?.Data?.QueryData ?? [];

            let itemNo = 0;

            const processedRows = rows.map(row => {
              // 小計、總計都不編項次
              if (
                row.STYPE_NAME === '小計' ||
                row.STYPE_NAME === '總計'
              ) {
                return {
                  ...row,
                  __ITEM_NO: null
                };
              }

              itemNo++;

              return {
                ...row,
                __ITEM_NO: itemNo
              };
            });

            // 小計保留原本位置，總計移到 footer
            this.data = processedRows.filter(
              x => x.STYPE_NAME !== '總計'
            );

            this.footerData = processedRows.filter(
              x => x.STYPE_NAME === '總計'
            );

            // 總筆數只算實際明細
            this.totalRecords = itemNo;
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.messageService.warnBubble('查詢失敗，請稍後再試');
            this.loading = false;
            this.tableLoading.set(false);
          },
          complete: () => {
            this.loading = false;
            this.tableLoading.set(false);
          },
        });
      },
      v => this.tableLoading.set(v),
    );
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  /**
   * 表格分頁/排序回呼。table-report 於 onSort 時會把 SortBy（multiSortMeta）
   * 併入 body 呼叫此函式，後端排序後回傳。service 為巢狀結構，此處展平成 ApiResponse<T[]>。
   */
  public queryFunction = (
    body: QueryASS15040Request,
  ): Observable<ApiResponse<QueryASS15040Response[]>> => {
    const base = this.lastQueryBody ?? this.buildQueryRequest();
    if (!base) {
      return of({
        Status: '0000',
        Data: [],
        Error: null,
        Meta: { Timestamp: '', RequestId: '' },
        Message: '',
        TotalCount: 0,
        TotalPage: 0,
      } as ApiResponse<QueryASS15040Response[]>);
    }
    const payload: QueryASS15040Request = {
      ...base,
      PageIndex: body?.PageIndex ?? base.PageIndex ?? 1,
      PageSize: body?.PageSize ?? base.PageSize ?? 9999,
      SortBy: body?.SortBy ?? base.SortBy,
    };
    return this.ass15040Service.queryASS15040(payload).pipe(
      untilDestroyed(this),
      map(res => ({
        ...res,
        Data: res.Data?.QueryData ?? [],
        TotalCount: res.Data?.TotalCount ?? res.TotalCount ?? 0,
      }) as ApiResponse<QueryASS15040Response[]>),
    );
  };

  override onCreate(): void {
    if (this.hasPermission(this.Actions.Create)) {
      this.navigateWithState(CRUDStatus.Create, null);
    }
  }

  override onEdit(data: any): void {
    if (this.hasPermission(this.Actions.Edit)) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  override onDetail(data: any): void {
    this.navigateWithState(CRUDStatus.Read, data);
  }

  onExportPdf(): void {
    const payload = this.buildExportRequest();
    if (!payload) return;
    if ((this.data?.length ?? 0) === 0) {
      this.messageService.warnBubble('目前無資料可供下載。');
      return;
    }
    const export$ = this.ass15040Service.exportPDFASS15040(payload);
    this.fileExportService
      .executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', v => (this.exportPdfLoading = v))
      .subscribe();
  }

  onExportExcel(): void {
    const payload = this.buildExportRequest();
    if (!payload) return;
    if ((this.data?.length ?? 0) === 0) {
      this.messageService.warnBubble('目前無資料可供下載。');
      return;
    }
    const export$ = this.ass15040Service.exportExcelASS15040(payload);
    this.fileExportService
      .executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', v => (this.exportExcelLoading = v))
      .subscribe();
  }

  private loadDropdownOptions(): void {
    this.dropdownApiService
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.keeperUnitOptions = opts ?? []));

    // 目前無 queryFASAccNoDropDownList，先用 GLS1005 科目下拉代替
    this.dropdownApiService
      .queryGls1005()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.accountCodeOptions = opts ?? []));

    this.dropdownApiService
      .queryFasItemDropdown({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.itemCodeOptions = opts ?? []));
  }

  private buildQueryRequest(): QueryASS15040Request | null {
    const q = this.queryForm.getRawValue();
    const baseYM = this.toYYYYMM(q.baseYYMM);
    if (!baseYM) {
      this.messageService.warnBubble('請輸入正確的基準日（yyyyMM）');
      return null;
    }
    const request: QueryASS15040Request = {
      BaseYM: baseYM,
      STYPE_ID: q.accountCode || null,
      HOLD_ORG_ID: q.keeperUnit || null,
      GOODS_ID: q.itemCode || null,
      PageIndex: 1,
      PageSize: 9999,
    };
    return request;
  }

  private buildExportRequest(): PrintASS15040Request | null {
    const q = this.queryForm.getRawValue();
    const baseYM = this.toYYYYMM(q.baseYYMM);
    if (!baseYM) {
      this.messageService.warnBubble('請輸入正確的基準日（yyyyMM）');
      return null;
    }
    return {
      BaseYM: baseYM,
      STYPE_ID: q.accountCode || null,
      HOLD_ORG_ID: q.keeperUnit || null,
      GOODS_ID: q.itemCode || null,
    };
  }

  private toYYYYMM(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return null;
      const y = value.getFullYear().toString();
      const m = (value.getMonth() + 1).toString().padStart(2, '0');
      return `${y}${m}`;
    }
    const normalized = String(value).trim().replaceAll('/', '');
    return /^\d{6}$/.test(normalized) ? normalized : null;
  }

}
