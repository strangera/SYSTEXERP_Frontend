import { AsyncPipe, CommonModule, formatDate } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ColumnGroup, formatAmount } from '@others/component/table/table.model';
import { TLS31080Request, TLS31080Response, Tls31080Service } from '@service/api/tls/tls31080.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CategorySelectComponent } from '@shared/biz-components/category-select/category-select.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { combineLatest, debounceTime } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ReportColumn } from '../tls2f010-cru/tls2f010-table-report.model';
import { applyDisplayStatusVisibility } from '../TLS30000/common/report-display-status.util';
import { startReportAutoRefresh } from '../TLS30000/common/report-auto-refresh.util';
import { REPORT_AUTO_REFRESH_HINT_TEXT } from '../TLS30000/common/report-auto-refresh-hint.constant';
import { filterHourColumns } from '../TLS30000/common/report-hour-columns.const';
import { Tls31080CRUComponent } from './tls31080-cru/tls31080-cru.component';

@Component({
  selector: 'app-tls31080',
  templateUrl: './tls31080.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    CommonModule,
    CalendarComponent,
    InputNumberRangeComponent,
    ButtonComponent,
    TableModule,
    TableReportComponent,
    TranslateModule,
    MultiSelectComponent,
    ButtonModule,
    CheckboxModule,
    CategorySelectComponent,
    Tls31080CRUComponent,
  ]
})
export class TLS31080Component extends BasicQueryPageComponent<TLS31080Response> implements OnInit {
  readonly autoRefreshHintText = REPORT_AUTO_REFRESH_HINT_TEXT;
  queryForm = this.formBuilder.nonNullable.group({
    TxnDate: [yesterday, [Validators.required]],
    TimeMode: ['A'],
    TimeFromHH: [null, [Validators.min(0), Validators.max(23)]],
    TimeToHH: [null, [Validators.min(0), Validators.max(23)]],
    StoreNos: [this.authService.getUserInfo()?.SYS_StoreNo],
    Floors: [[]],
    Areas: [[]],
    category: [{ bus_type: [], bus_class: [], bus_sclass: [] }],
    CabinetKinds: [[]],
    OrgIds: [[]],
    CounterNos: [[]],
    ChargeTypes: [[]],
    Buildings: [[]],
    IncludeTax: [true],
    BizInvFlag: ['A'],
    PreSale: [false],
    ConsumerNum: [false],
  });

  reportTypeOptions = [
    { value: 'A', label: '全時段顯示' },
    { value: 'T', label: '交易時間' }
  ];

  totalRecords = 0;
  data: TLS31080Response[] = [];
  footerData: TLS31080Response[] = [];
  historyRequestBody: TLS31080Request | null = null;
  dialogVisible = false;
  selectedRow: TLS31080Response | null = null;
  btnPDFLoading = false;
  btnExcelLoading = false;

  columns: ReportColumn[] = this.buildColumns('A', null, null);

  private readonly formatReportAmount = (value: any) => {
    if (typeof value === 'string' && value.endsWith('%')) {
      return value;
    }
    return formatAmount(value);
  };

  private buildColumns(TimeMode: string, TimeFromHH: number | null, TimeToHH: number | null): ReportColumn[] {
    const filteredHours = filterHourColumns(TimeMode, TimeFromHH, TimeToHH)
      .map(col => ({ ...col, format: this.formatReportAmount }));
    const isPreSale = this.queryForm.get('PreSale')?.value === true;
    const isConsumerNum = this.queryForm.get('ConsumerNum')?.value === true;

    return [
      { field: 'floor_desc', header: '樓層名稱', visible: true, align: 'left' },
      { field: 'TimeType', header: '時段類型', visible: true, align: 'left' },
      ...filteredHours,
      { field: 'Reentry', header: '補登', visible: true, format: this.formatReportAmount, align: 'right' },
      { field: 'PresaleCheckout', header: '預售結帳', visible: true, format: this.formatReportAmount, align: 'right' },
      { field: 'PrePerformance', header: '預售業績', visible: isPreSale, format: this.formatReportAmount, align: 'right', isTotal: true },
      { field: 'ConsumerNum', header: '消費人數', visible: isConsumerNum, format: this.formatReportAmount, align: 'right', isTotal: true },
      { field: 'ConsumerOrder', header: '消費客單', visible: isConsumerNum, format: this.formatReportAmount, align: 'right', isTotal: true },
      { field: 'Subtotal', header: '小計', visible: true, format: this.formatReportAmount, align: 'right' },
    ];
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const cat = raw.category || {};
      const formValue = {
        ...raw,
        TxnDate: formatDate(frm.getRawValue().TxnDate, 'yyyy-MM-dd', 'en-US'),
        CatLNos: (cat.bus_type || []).join(','),
        CatMNos: (cat.bus_class || []).map((x: any) => x.No ?? x).join(','),
        CatSNos: (cat.bus_sclass || []).map((x: any) => x.No ?? x).join(','),
        category: undefined,
        Floors: (raw.Floors || []).join(','),
        Areas: (raw.Areas || []).join(','),
        CabinetKinds: (raw.CabinetKinds || []).join(','),
        OrgIds: (raw.OrgIds || []).join(','),
        CounterNos: (raw.CounterNos || []).join(','),
        ChargeTypes: (raw.ChargeTypes || []).join(','),
        Buildings: (raw.Buildings || []).join(','),
      } as TLS31080Request;

      this.executeQuery(formValue, frm.getRawValue());
    });
  }

  private executeQuery(formValue: TLS31080Request, rawFormValue?: unknown) {
    this.tls31080Service.queryTLS31080(formValue)
      .pipe(this.withLoading(), takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        // ★ 核心修正點：正確解構雙層 Data
        // res 是 ApiResponse，res.Data 是 queryTLS31080Result 物件
        const resultObj = res?.Data || {};
        const resData = Array.isArray(resultObj.Data) ? resultObj.Data : []; // 確保一定是 Array
        const totalData = resultObj.TotalData || {};

        // 明細顯示格式：
        // 1. 營業實績 / 交易筆數 => 千分位
        // 2. 營業實績佔比 => 加上 %
        this.data = resData.map((row: TLS31080Response) => this.formatDisplayRow(row));

        // 總計固定顯示三列：營業實績、交易筆數、營業實績佔比，並套用相同顯示格式
        this.footerData = this.buildFooterRows(resData, totalData)
          .map((row: TLS31080Response) => this.formatDisplayRow(row));

        this.historyRequestBody = formValue;
        this.totalRecords = res.TotalCount ?? resData.length;
        if (rawFormValue) this.queryStateService.setQueryState(this.ProgNo, rawFormValue);
      });
  }

  /**
   * 報表需要統計 / 顯示的數值欄位。
   * H00~H23 為各時段，後面為報表附加統計欄位。
   */
  private readonly summaryFields = [
    ...Array.from({ length: 24 }, (_, i) => `H${i.toString().padStart(2, '0')}`),
    'Reentry',
    'PresaleCheckout',
    'PrePerformance',
    'ConsumerNum',
    'ConsumerOrder',
    'Subtotal',
  ];

  /**
   * 表格顯示格式：
   * 1. 營業實績、交易筆數：加千分位逗號
   * 2. 營業實績佔比：加上 %
   *
   * 直接處理 row 的顯示值，不依賴 table-report 的 column.format。
   */
  private formatDisplayRow(row: TLS31080Response): TLS31080Response {
    if (!row) {
      return row;
    }

    if (row.TimeType === '營業實績佔比') {
      return this.formatPercentageRow(row);
    }

    if (row.TimeType !== '營業實績' && row.TimeType !== '交易筆數') {
      return row;
    }

    const result: any = { ...row };
    this.summaryFields.forEach(field => {
      const value = result[field];
      if (value !== null && value !== undefined && value !== '') {
        result[field] = this.formatThousands(value);
      }
    });

    return result as TLS31080Response;
  }

  /**
   * 數字轉千分位。
   * 例如：425243 => 425,243
   */
  private formatThousands(value: any): string {
    const numericValue = this.toNumber(value);
    return numericValue.toLocaleString('en-US', {
      maximumFractionDigits: 20,
    });
  }

  /**
   * 「營業實績佔比」加上 %。
   */
  private formatPercentageRow(row: TLS31080Response): TLS31080Response {
    if (row?.TimeType !== '營業實績佔比') {
      return row;
    }

    const result: any = { ...row };
    this.summaryFields.forEach(field => {
      const value = result[field];
      if (value !== null && value !== undefined && value !== '') {
        const numericValue = Number(String(value).replace('%', ''));
        result[field] = Number.isFinite(numericValue)
          ? `${this.trimPercentage(numericValue)}%`
          : value;
      }
    });

    return result as TLS31080Response;
  }

  /**
   * 建立總計三列：
   * 1. 營業實績
   * 2. 交易筆數
   * 3. 營業實績佔比
   */
  private buildFooterRows(resData: TLS31080Response[], totalData: any): TLS31080Response[] {
    const salesRows = resData.filter(x => x?.TimeType === '營業實績');
    const txnRows = resData.filter(x => x?.TimeType === '交易筆數');

    const salesTotal: any = {
      floor_desc: '',
      TimeType: '營業實績',
    };

    const txnTotal: any = {
      floor_desc: '',
      TimeType: '交易筆數',
    };

    // 營業實績：優先沿用後端 TotalData；若沒有對應值，再由明細加總。
    this.summaryFields.forEach(field => {
      const totalField = this.getTotalDataField(field);
      const backendValue = totalField ? totalData?.[totalField] : undefined;
      salesTotal[field] = backendValue ?? this.sumField(salesRows, field);
      txnTotal[field] = this.sumField(txnRows, field);
    });

    // 保留原本交易總筆數。若明細沒有 Subtotal，使用後端 TotalTxnCount。
    txnTotal.Subtotal = txnTotal.Subtotal || totalData?.TotalTxnCount || 0;
    txnTotal.TotalCount = totalData?.TotalTxnCount ?? txnTotal.Subtotal ?? 0;
    salesTotal.TotalCount = totalData?.TotalTxnCount ?? 0;

    const percentageTotal: any = {
      floor_desc: '',
      TimeType: '營業實績佔比',
    };

    const salesGrandTotal = this.toNumber(salesTotal.Subtotal);
    this.summaryFields.forEach(field => {
      const value = this.toNumber(salesTotal[field]);
      const percentage = salesGrandTotal === 0 ? 0 : (value / salesGrandTotal) * 100;
      percentageTotal[field] = `${this.trimPercentage(percentage)}%`;
    });

    // 總營業實績本身的佔比固定為 100%。
    percentageTotal.Subtotal = salesGrandTotal === 0 ? '0%' : '100%';

    return [
      salesTotal as TLS31080Response,
      txnTotal as TLS31080Response,
      percentageTotal as TLS31080Response,
    ];
  }

  private getTotalDataField(field: string): string | null {
    if (/^H\d{2}$/.test(field)) {
      return `Total${field}`;
    }

    const map: Record<string, string> = {
      Reentry: 'TotalReentry',
      PresaleCheckout: 'TotalPresaleCheckout',
      PrePerformance: 'TotalPrePerformance',
      ConsumerNum: 'TotalConsumerNum',
      ConsumerOrder: 'TotalConsumerOrder',
      Subtotal: 'TotalSales',
    };

    return map[field] ?? null;
  }

  private sumField(rows: TLS31080Response[], field: string): number {
    return rows.reduce((sum, row: any) => sum + this.toNumber(row?.[field]), 0);
  }

  private toNumber(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const numericValue = Number(String(value).replaceAll(',', '').replace('%', ''));
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  private trimPercentage(value: number): string {
    return value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  }

  columnGroup: ColumnGroup[] = [
    { field: 'budgetAmt', header: '營業額' },
    { field: 'sum', header: '營業佔比' },
    { field: 'custCnt', header: '客單價' },
    { field: 'space', header: '營業坪效' },
    { field: 'temp', header: '臨時櫃' },
    { field: 'month', header: '月累計' },
  ];

  tlt_kind_Option = [
    { value: "1", label: "正櫃" }, { value: "2", label: "臨時櫃" },
    { value: "3", label: "特賣會" }, { value: "4", label: "虛擬櫃" },
  ];

  tlt_term_type = [
    { value: "1", label: "固定租金" }, { value: "2", label: "底租抽成取高者" },
    { value: "3", label: "一般抽成" }, { value: "4", label: "包底抽成" },
    { value: "5", label: "層級抽成" }, { value: "6", label: "包底加層級" },
  ];

  TaxType_Option = [
    { value: true, label: "是" },
    { value: false, label: "否" },
  ];

  BizInvFlag_Option = [
    { value: "A", label: "全部" },
    { value: "Y", label: "是" },
    { value: "N", label: "否" },
  ];

  private readonly dropdown = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly tls31080Service = inject(Tls31080Service);

  tlt_building_Option = this.dropdown.querySys3800();
  tlt_floor_Option = this.dropdown.querySys3900();
  area_no_Option = this.dropdown.querySys3A00();
  org_id_Option = this.dropdown.querySys3100();
  CounterNos_Option = this.dropdown.queryTltTalent();

  ngOnInit(): void {
    this.initializePage('TLS31080', '', this.queryForm, (frm) => this.onSubmit(frm));
    this.onTimeModeChange('A');

    combineLatest([
      this.queryForm.controls.TimeMode.valueChanges,
      this.queryForm.controls.TimeFromHH.valueChanges,
      this.queryForm.controls.TimeToHH.valueChanges,
    ]).pipe(debounceTime(50), takeUntilDestroyed(this.destroyRef)).subscribe(([mode, from, to]) => {
      this.columns = this.buildColumns(mode, from, to);
    });

    this.queryForm.get('PreSale')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.setColumns();
    });

    this.queryForm.get('ConsumerNum')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.setColumns();
    });

    // 查詢日期若為系統日，每 10 分鐘自動重新查詢一次
    startReportAutoRefresh(this.destroyRef, () => this.historyRequestBody?.TxnDate, () => {
      if (this.historyRequestBody) this.executeQuery(this.historyRequestBody);
    });
  }

  onReport(frm: FormGroup, isExcel: boolean) {
    const raw = frm.getRawValue();
    const cat = raw.category || {};
    const formValue = {
      ...raw,
      TxnDate: formatDate(frm.getRawValue().TxnDate, 'yyyy-MM-dd', 'en-US'),
      CatLNos: (cat.bus_type || []).join(','),
      CatMNos: (cat.bus_class || []).map((x: any) => x.No ?? x).join(','),
      CatSNos: (cat.bus_sclass || []).map((x: any) => x.No ?? x).join(','),
      category: undefined,
      Floors: (raw.Floors || []).join(','),
      Areas: (raw.Areas || []).join(','),
      CabinetKinds: (raw.CabinetKinds || []).join(','),
      OrgIds: (raw.OrgIds || []).join(','),
      CounterNos: (raw.CounterNos || []).join(','),
      ChargeTypes: (raw.ChargeTypes || []).join(','),
      Buildings: (raw.Buildings || []).join(','),
    } as TLS31080Request;

    if (isExcel) {
      this.btnExcelLoading = true;
      this.tls31080Service.exportTLS31080(formValue).subscribe({
        next: (blob) => {
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '各時段之營業報表.xlsx';
          a.click();
          globalThis.URL.revokeObjectURL(url);
          this.btnExcelLoading = false;
        },
        error: () => this.btnExcelLoading = false
      });
    } else {
      this.btnPDFLoading = true;
      this.tls31080Service.exportTLS31080PDF(formValue).subscribe({
        next: (blob) => {
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '各時段之營業報表.pdf';
          a.click();
          globalThis.URL.revokeObjectURL(url);
          this.btnPDFLoading = false;
        },
        error: () => this.btnPDFLoading = false
      });
    }
  }

  onTimeModeChange(mode: 'A' | 'T') {
    const from = this.queryForm.get('TimeFromHH');
    const to = this.queryForm.get('TimeToHH');
    if (mode === 'A') {
      from?.disable();
      to?.disable();
      from?.setValue(null);
      to?.setValue(null);
    } else {
      from?.enable();
      to?.enable();
    }
  }

  onDetail1(event: TLS31080Response) {
    this.selectedRow = event;
    this.dialogVisible = true;
  }

  setColumns() {
    this.columns = applyDisplayStatusVisibility(this.columns, {
      preSale: this.queryForm.get('PreSale')?.value === true,
      consumerNum: this.queryForm.get('ConsumerNum')?.value === true,
    });
  }
}