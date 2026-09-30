import { AsyncPipe, formatDate } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ColumnGroup, formatAmount } from '@others/component/table/table.model';
import { applyDisplayStatusVisibility } from '@pages/tls/TLS30000/common/report-display-status.util';
import { startReportAutoRefresh } from '@pages/tls/TLS30000/common/report-auto-refresh.util';
import { REPORT_AUTO_REFRESH_HINT_TEXT } from '@pages/tls/TLS30000/common/report-auto-refresh-hint.constant';
import { TLS31010QueryData, TLS31010Request, Tls31010Service, TLS31010TotalData } from '@service/api/tls/tls31010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonYNComponent } from '@shared/components/radiobutton-yn/radiobutton-yn.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmountWithDecimals, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { finalize, merge } from 'rxjs';
import { BusClassItem, BusSClassItem } from 'src/app/service/utility/dropdown-api.model';
import { CategorySelectComponent } from 'src/app/shared/biz-components/category-select/category-select.component';
import { environment } from 'src/environments/environment';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

@Component({
  selector: 'app-tls31010',
  templateUrl: './tls31010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    ButtonComponent,
    TableModule,
    RadiobuttonYNComponent,
    TranslateModule,
    MultiSelectComponent,
    ButtonModule,
    RadiobuttonComponent,
    TableReportComponent,
    AsyncPipe,
    CategorySelectComponent,
    CheckboxModule,
  ]
})
export class TLS31010Component extends BasicQueryPageComponent<TLS31010QueryData> implements OnInit {
  readonly autoRefreshHintText = REPORT_AUTO_REFRESH_HINT_TEXT;
  public readonly tls31010Service = inject(Tls31010Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);
  queryForm = this.formBuilder.nonNullable.group({
    TXN_Date: [null, [Validators.required]],
    TLT_NO: [[]],
    tlt_building: [[]],
    tlt_floor: [[]],
    area_no: [[]],
    category: [{ bus_type: [], bus_class: [], bus_sclass: [] }],
    tlt_kind: [[]],
    tlt_term_type: [[]],
    org_id: [[]],
    TaxType: ['0'],
    IsRece_Yn: [null],
    PreSale: [false],
    ConsumerNum: [false],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });

  totalRecords = 0;
  data: TLS31010QueryData[] = [];
  footerData: TLS31010TotalData | null = null;
  lastQueryBody: TLS31010Request | null = null;
  btnLoading = false;

  columns: ReportColumn[] = [
    { field: 'building_desc', header: '館別', align: 'left' },
    { field: 'org_name', header: '組織名稱', align: 'left' },
    { field: 'tlt_kind', header: '櫃別', align: 'left' },
    { field: 'tlt_no', header: '專櫃編號', align: 'left' },
    { field: 'location_no', header: '位置編號', align: 'left' },
    { field: 'tlt_name', header: '專櫃名稱', align: 'left' },
    { field: 'budget', header: '營業目標', align: 'right', groupField: '營業額', format: formatAmount, isTotal: true },
    { field: 'AVN_TotSaleAmt', header: '營業實績', align: 'right', groupField: '營業額', format: formatAmount, isTotal: true },
    { field: 'AchievementRate', header: '達成率', align: 'right', groupField: '營業額', format: (v: number) => this.percent(v), exportFormat: 'suffix:%' as unknown as Record<string, string>[], isTotal: true },
    { field: 'BudgetRate', header: '營業目標佔比', align: 'right', groupField: '營業佔比', format: (v: number) => this.percent(v), exportFormat: 'suffix:%' as unknown as Record<string, string>[] },
    { field: 'PerformanceRate', header: '營業實績佔比', align: 'right', groupField: '營業佔比', format: (v: number) => this.percent(v), exportFormat: 'suffix:%' as unknown as Record<string, string>[] },
    { field: 'TxnCount', header: '交易筆數', align: 'right', groupField: '客單價', format: formatAmount, isTotal: true },
    { field: 'AvgTicket', header: '客單價', align: 'right', groupField: '客單價', format: formatAmount, isTotal: true },
    { field: 'tlt_space', header: '坪數', align: 'right', groupField: '營業坪效', isTotal: true, format: (v: number) => formatAmountWithDecimals(v, 2), exportFormat: 'number:comma2' as unknown as Record<string, string>[] },
    { field: 'MonthlyPSM', header: '坪效', align: 'right', groupField: '營業坪效', isTotal: true, format: (v: number) => formatAmountWithDecimals(v, 2), exportFormat: 'number:comma2' as unknown as Record<string, string>[] },
    { field: 'MonthlyBudgetTotal', header: '月營業目標', align: 'right', groupField: '月累計', format: formatAmount, isTotal: true },
    { field: 'MonthlySalesTotal', header: '營業實績', align: 'right', groupField: '月累計', format: formatAmount, isTotal: true },
    { field: 'CompletionRate', header: '完成率', align: 'right', groupField: '月累計', format: (v: number) => this.percent(v), exportFormat: 'suffix:%' as unknown as Record<string, string>[], isTotal: true },
    { field: 'PrePerformance', header: '預售業績', visible: false, format: formatAmount, align: 'right', isTotal: true },
    { field: 'ConsumerNum', header: '消費人數', visible: false, format: formatAmount, align: 'right', isTotal: true },
    { field: 'ConsumerOrder', header: '消費客單', visible: false, format: formatAmount, align: 'right', isTotal: true },
  ];

  columnGroup: ColumnGroup[] = [
    { field: '營業額', header: '營業額' },
    { field: '營業佔比', header: '營業佔比' },
    { field: '客單價', header: '客單價' },
    { field: '營業坪效', header: '營業坪效' },
    { field: '月累計', header: '月累計' },
  ];

  tlt_kind_Option = getSYS1000Options('TLT_Kind');
  tlt_term_type = getSYS1000Options('tlt_term_type');
  tlt_noListOption = this.dropdown.queryTltTalent();
  tlt_building_Option = this.dropdown.querySys3800();
  tlt_floor_Option = this.dropdown.querySys3900();
  area_no_Option = this.dropdown.querySys3A00();
  org_id_Option = this.dropdown.querySys3100();

  ngOnInit(): void {
    this.initializePage('TLS31010', 'TLS/TLS31010cru', this.queryForm, (frm) => this.onSubmit(frm));
    // 初始化欄位顯示狀態
    this.setColumns();
    // 監聽「顯示狀態」勾選變化：同步更新前端顯示與已暫存的 lastQueryBody
    const preSale$ = this.queryForm.get('PreSale')!.valueChanges;
    const consumerNum$ = this.queryForm.get('ConsumerNum')!.valueChanges;
    merge(preSale$, consumerNum$).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.setColumns();
      this.syncLastQueryBodyWithDisplayStatus();
    });

    // 查詢日期若為系統日，每 10 分鐘自動重新查詢一次
    startReportAutoRefresh(this.destroyRef, () => this.lastQueryBody?.TXN_Date, () => {
      if (this.lastQueryBody) this.executeQuery(this.lastQueryBody);
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = this.buildRequestBody(frm.getRawValue());
      this.executeQuery(formValue);
    });
  }

  private executeQuery(formValue: TLS31010Request) {
    this.tls31010Service.queryTLS31010(formValue).pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.data = res.Data;
      this.lastQueryBody = formValue;
      this.totalRecords = res.TotalCount;
      this.footerData = res.TotalData ?? null;
    });
  }

  onReport(isExcel = true) {
    if (!this.lastQueryBody) {
      this.messageService.errorBubble('請先進行查詢後再列印');
      return;
    }

    this.btnLoading = true;
    const printBody: TLS31010Request = { ...this.lastQueryBody, IsExcel: isExcel };

    this.tls31010Service.printTLS31010(printBody).pipe(finalize(() => this.btnLoading = false), takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.messageService.successBubble(res.Message);
      if (res.Data?.Print_URL) {
        const downloadUrl = environment.ApiUrl + res.Data.Print_URL;
        globalThis.open(downloadUrl, '_blank');
      }
    });
  }

  /** 動態更新表格欄位可見度 */
  private setColumns() {
    this.columns = applyDisplayStatusVisibility(this.columns, {
      preSale: !!this.queryForm.get('PreSale')?.value,
      consumerNum: !!this.queryForm.get('ConsumerNum')?.value,
      fallbackWhenUnset: true,
    });
  }

  /** 當切換顯示狀態勾選時，即時更新 lastQueryBody 中的值 */
  private syncLastQueryBodyWithDisplayStatus() {
    if (!this.lastQueryBody) return;

    const { PreSale, ConsumerNum } = this.queryForm.getRawValue();
    this.lastQueryBody = {
      ...this.lastQueryBody,
      PreSale,
      ConsumerNum
    };
  }

  /** 將 Form RawValue 轉為 API TLS31010Request 格式 */
  private buildRequestBody(rawValue: any): TLS31010Request {
    const cat = rawValue.category || {};
    return {
      ...rawValue,
      TXN_Date: rawValue.TXN_Date ? formatDate(rawValue.TXN_Date, 'yyyy-MM-dd', 'en-US') : null,
      TLT_NO: rawValue.TLT_NO?.length ? rawValue.TLT_NO : null,
      tlt_floor: rawValue.tlt_floor?.length ? rawValue.tlt_floor : null,
      area_no: rawValue.area_no?.length ? rawValue.area_no : null,
      org_id: rawValue.org_id?.length ? rawValue.org_id : null,
      tlt_kind: rawValue.tlt_kind?.length ? rawValue.tlt_kind : null,
      tlt_term_type: rawValue.tlt_term_type?.length ? rawValue.tlt_term_type : null,
      bus_type: cat.bus_type?.length ? cat.bus_type : null,
      bus_class: cat.bus_class?.map((item: BusClassItem) => [item.bus_type, item.No]) || null,
      bus_sclass: cat.bus_sclass?.map((item: BusSClassItem) => [item.bus_type, item.bus_class, item.No]) || null,
      tlt_building: rawValue.tlt_building?.length ? rawValue.tlt_building : null,
      IsRece_Yn: rawValue.IsRece_Yn ?? null,
      TaxType: rawValue.TaxType || '0',
      category: undefined,
    } as TLS31010Request;
  }

  private percent(v: number): string {
    if (v === null || v === undefined) return '';
    const n = Number(v);
    return Number.isNaN(n) ? '' : `${n.toFixed(2)}%`;
  }
}