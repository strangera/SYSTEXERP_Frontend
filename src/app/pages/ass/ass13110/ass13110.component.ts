import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13110Service } from '@service/api/ass/ass13110.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount2, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ASS13110QueryRequest, ASS13110Row } from './ass13110.model';

// 3.1.3.11  資產差異表
@Component({
  selector: 'app-ass13110',
  templateUrl: './ass13110.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberRangeComponent,
    CalendarRangeComponent,
    DropdownComponent,
    MultiSelectComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
    DatePipe,
  ],
})
export class ASS13110Component extends BasicQueryPageComponent<ASS13110Row> implements OnInit {
  /** 查詢條件表單 */
  public readonly queryForm = this.formBuilder.group({
    CHK_ID_S: new FormControl<string | null>(null),  // 清點單號(起)
    CHK_ID_E: new FormControl<string | null>(null),  // 清點單號(迄)
    CHK_DATE_S: new FormControl<Date | null>(null),  // 清點日期(起)
    CHK_DATE_E: new FormControl<Date | null>(null),  // 清點日期(迄)
    CHK_EMP_ID: new FormControl<string | null>(null), // 清點人代碼
    CHK_STATUS: new FormControl<string[] | null>(null), // 資產狀態(盤點後)
    DEPRE_YN: new FormControl<string[] | null>(null),   // 資產類別
    pageSize: new FormControl<number>(30),
    pageIndex: new FormControl<number>(1),
  });

  /** 查詢結果 */
  public data: ASS13110Row[] = [];
  public totalRecords = 0;
  public lastQueryBody?:
    | ASS13110QueryRequest
    | (ASS13110QueryRequest & { pageSize?: number; pageIndex?: number });

  /** 表格欄位定義 */
  public readonly columns: ReportColumn[] = [
    { field: 'ASSET_ID', header: '資產編號' },
    { field: 'GOODS_ID', header: '品項編號' },
    { field: 'GOODS_NAME', header: '品項名稱' },
    { field: 'GET_DATE', header: '購入日期', format: formatDate },
    { field: 'GET_COST', header: '購入金額(未稅）', format: formatAmount2 },
    { field: 'TAL_DEPRE_AMT', header: '累計折舊金額', format: formatAmount2 },
    { field: 'BOOK_VALUE', header: '帳面價值', format: formatAmount2 },
    { field: 'ASSET_STATUS', header: '財產狀態(盤前)' },
    { field: 'HOLD_ORG_ID', header: '保管單位' },
    { field: 'HOLD_ORG_NAME', header: '保管單位名稱' },
    { field: 'USE_ORG_ID', header: '使用單位' },
    { field: 'DEPRE_YN', header: '資產類別' },
    { field: 'DEPRE_YM_B', header: '折舊起始年月' },
    { field: 'DEPRE_YM_E', header: '折舊結束年月' },
    { field: 'CHK_ID', header: '清點單號' },
    { field: 'CHK_DATE', header: '清點日期', format: formatDate },
    { field: 'CHK_EMP_ID', header: '清點人代碼' },
    { field: 'CHK_STATUS', header: '盤後資產狀態' },
    { field: 'CHK_STATUS_NAME', header: '盤後狀態名稱' },
  ];

  /** 下拉選單選項 */
  public userCodeOptions: { label: string; value: string }[] = [];
  public statusOptions: { label: string; value: string }[] = [];
  public assetTypeOptions: { label: string; value: string }[] = [
    { label: '資產', value: '1' },
    { label: '列管品', value: '2' },
  ];

  /** 匯出按鈕 loading 狀態 */
  public btnExportPdfLoading = false;

  constructor(
    private readonly service: ASS13110Service,
    private readonly dropdownService: DropDownListService,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13110', '', this.queryForm, form => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  /**
   * 載入下拉選單選項
   */
  private loadDropdownOptions(): void {
    // 清點人代碼
    this.dropdownService.queryTBLUSER_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.userCodeOptions = (res.Data ?? []).map((item: IDropdownItem) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
      },
    });

    // 資產狀態(盤點後)
    this.dropdownService
      .querySYS1000_DropDownList({ SYS_Type: 'ASSET_STATUS' })
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.statusOptions = (res.Data ?? []).map((item: IDropdownItem) => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No,
          }));
        },
      });
  }

  /**
   * 分頁查詢函式，供 table-report 使用
   *
   * 說明：
   * - table-report 內部分頁參數使用小寫 `pageSize` / `pageIndex`
   * - 後端 API 則使用 `PageSize` / `PageIndex`
   * - 這裡統一接收大小寫兩種寫法，並轉成 ApiRequest 規範再送出
   */
  public queryFunction = (
    body: Partial<ASS13110QueryRequest> & { pageSize?: number; pageIndex?: number },
  ): Observable<ApiResponse<ASS13110Row[]>> => {
    const raw = this.queryForm.getRawValue();

    const pageSize =
      body.pageSize ??
      body.PageSize ??
      raw.pageSize ??
      30;

    const pageIndex =
      body.pageIndex ??
      body.PageIndex ??
      raw.pageIndex ??
      1;

    const payload: ASS13110QueryRequest = {
      CHK_ID_S: raw.CHK_ID_S != null ? String(raw.CHK_ID_S) : undefined,
      CHK_ID_E: raw.CHK_ID_E != null ? String(raw.CHK_ID_E) : undefined,
      CHK_DATE_S: raw.CHK_DATE_S
        ? this.datePipe.transform(raw.CHK_DATE_S, 'yyyy-MM-dd') ?? undefined
        : undefined,
      CHK_DATE_E: raw.CHK_DATE_E
        ? this.datePipe.transform(raw.CHK_DATE_E, 'yyyy-MM-dd') ?? undefined
        : undefined,
      CHK_EMP_ID: raw.CHK_EMP_ID || undefined,
      CHK_STATUS: raw.CHK_STATUS && raw.CHK_STATUS.length ? raw.CHK_STATUS : undefined,
      DEPRE_YN: raw.DEPRE_YN && raw.DEPRE_YN.length ? raw.DEPRE_YN : undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body.SortBy,
    };

    const cleanPayload = removeEmptyValues(payload) as ASS13110QueryRequest;
    return this.service.queryASS13110(cleanPayload);
  };

  /**
   * 查詢送出
   */
  public onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = this.queryForm.getRawValue();
      this.lastQueryBody = {
        CHK_ID_S: raw.CHK_ID_S != null ? String(raw.CHK_ID_S) : undefined,
        CHK_ID_E: raw.CHK_ID_E != null ? String(raw.CHK_ID_E) : undefined,
        CHK_DATE_S: raw.CHK_DATE_S
          ? this.datePipe.transform(raw.CHK_DATE_S, 'yyyy-MM-dd') ?? undefined
          : undefined,
        CHK_DATE_E: raw.CHK_DATE_E
          ? this.datePipe.transform(raw.CHK_DATE_E, 'yyyy-MM-dd') ?? undefined
          : undefined,
        CHK_EMP_ID: raw.CHK_EMP_ID || undefined,
        CHK_STATUS: raw.CHK_STATUS && raw.CHK_STATUS.length ? raw.CHK_STATUS : undefined,
        DEPRE_YN: raw.DEPRE_YN && raw.DEPRE_YN.length ? raw.DEPRE_YN : undefined,
        PageSize: raw.pageSize || 30,
        PageIndex: raw.pageIndex || 1,
      };

      this.loading = true;
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody!)
        .pipe(
          finalize(() => {
            this.loading = false;
          }),
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? this.data.length;
          },
        });
    });
  }

  /**
   * 匯出資產差異表 PDF
   */
  public onExportPdf(): void {
    if (!this.lastQueryBody) {
      // 尚未查詢時，以目前表單值作為匯出條件
      const raw = this.queryForm.getRawValue();
      this.lastQueryBody = {
        CHK_ID_S: raw.CHK_ID_S != null ? String(raw.CHK_ID_S) : undefined,
        CHK_ID_E: raw.CHK_ID_E != null ? String(raw.CHK_ID_E) : undefined,
        CHK_DATE_S: raw.CHK_DATE_S
          ? this.datePipe.transform(raw.CHK_DATE_S, 'yyyy-MM-dd') ?? undefined
          : undefined,
        CHK_DATE_E: raw.CHK_DATE_E
          ? this.datePipe.transform(raw.CHK_DATE_E, 'yyyy-MM-dd') ?? undefined
          : undefined,
        CHK_EMP_ID: raw.CHK_EMP_ID || undefined,
        CHK_STATUS: raw.CHK_STATUS && raw.CHK_STATUS.length ? raw.CHK_STATUS : undefined,
        DEPRE_YN: raw.DEPRE_YN && raw.DEPRE_YN.length ? raw.DEPRE_YN : undefined,
        PageSize: raw.pageSize || 30,
        PageIndex: raw.pageIndex || 1,
      };
    }

    const query = this.lastQueryBody as Partial<ASS13110QueryRequest> & {
      pageSize?: number;
      pageIndex?: number;
    };

    const exportPayload: ASS13110QueryRequest = {
      CHK_ID_S: query.CHK_ID_S != null ? String(query.CHK_ID_S) : undefined,
      CHK_ID_E: query.CHK_ID_E != null ? String(query.CHK_ID_E) : undefined,
      CHK_DATE_S: query.CHK_DATE_S,
      CHK_DATE_E: query.CHK_DATE_E,
      CHK_EMP_ID: query.CHK_EMP_ID,
      CHK_STATUS: query.CHK_STATUS,
      DEPRE_YN: query.DEPRE_YN,
      PageSize: query.pageSize ?? query.PageSize ?? 30,
      PageIndex: query.pageIndex ?? query.PageIndex ?? 1,
      SortBy: query.SortBy,
    };

    this.btnExportPdfLoading = true;
    this.service
      .exportASS13110Pdf(exportPayload)
      .pipe(
        finalize(() => {
          this.btnExportPdfLoading = false;
        }),
      )
      .subscribe({
        next: blob => {
          if (!blob) {
            return;
          }
          const now = new Date();
          const timestamp =
            now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
          const fileName = `資產差異表${timestamp}.pdf`;

          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(blobUrl);
        },
      });
  }

  /**
   * 清除查詢條件
   */
  public onClearForm(): void {
    this.queryForm.reset({
      CHK_ID_S: null,
      CHK_ID_E: null,
      CHK_DATE_S: null,
      CHK_DATE_E: null,
      CHK_EMP_ID: null,
      CHK_STATUS: null,
      DEPRE_YN: null,
      pageSize: 30,
      pageIndex: 1,
    });
    this.data = [];
    this.totalRecords = 0;
    this.lastQueryBody = undefined;
  }
}

