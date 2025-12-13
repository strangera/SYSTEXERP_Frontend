import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { footerShowTotal, TLS31020Total } from '@service/api/tls/tls31020.service';
import { TLS31040DetailItem, TLS31040DetailRequest, TLS31040PrintDetailRequest, TLS31040Response, Tls31040Service } from '@service/api/tls/tls31040.service';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, ColumnGroup, formatAmount, formatPercentage } from '@shared/componentkit/table/table.model';
import { QueryStateService } from '@shared/service/query-state.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-tls31040-cru',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    CalendarRangeQuickComponent,
    ButtonComponent,
    TableModule,
    TableReportComponent,
    RadiobuttonYNComponent,
    TranslateModule,
    TableComponent,
    MultiSelectComponent,
    ButtonModule
  ],
  templateUrl: './tls31040-cru.component.html'
})
export class Tls31040CRUComponent extends BasicCruPageComponent<TLS31040Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    tlt_kind: [''],//櫃別
    tlt_kind_name: [''],//櫃別名稱

    budget: [''],//營業目標
    AVN_TotSaleAmt: [''],//營業實績
    AchievementRate: [''],//達成率
    BudgetRate: [''],//營業目標佔比
    PerformanceRate: [''],//營業實績佔比
    TxnCount: [''],//交易筆數
    AvgTicket: [''],//客單價
    tlt_space: [''],//坪數
    MonthlyPSM: [''],//坪效

    TempCounterSaleAmt: [''],//營業實績
    TempCounterSalesRate: [''],//營業實績佔比
    TempCounterAmtRate: [''],//臨時櫃業績佔比

    MonthlyBudgetTotal: [''],//月營業目標
    MonthlySalesTotal: [''],//營業實績
    CompletionRate: [''],//完成率

  });
  totalRecords = 0;
  data: TLS31040DetailItem[] = [];
  footerTotal: TLS31020Total | null = null; // 總計
  footershowTotal: footerShowTotal | null = null; // 總計資料轉換名稱
  footershowPercent: footerShowTotal | null = null; // 總計資料轉換百分比
  historyRequestBody: TLS31040DetailRequest | null = null; //歷史查詢條件

  columns: Column[] = [
    { field: 'building_desc', header: '館別', visible: true },
    { field: 'org_name', header: '組織名稱', visible: true },
    { field: 'tlt_kind', header: '櫃別', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'location_no', header: '位置編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    // { field: 'bus_type', header: '大分類', visible: true }, // queryTLS31030
    // { field: 'bus_type_name', header: '大分類名稱', visible: true }, // queryTLS31030
    { field: 'budget', header: '營業目標', visible: true, groupField: 'budgetAmt', format: formatAmount },
    { field: 'AVN_TotSaleAmt', header: '營業實績', visible: true, groupField: 'budgetAmt', format: formatAmount },
    { field: 'AchievementRate', header: '達成率', visible: true, groupField: 'budgetAmt', format: (value) => formatPercentage(value, 2) },
    { field: 'BudgetRate', header: '營業目標佔比', visible: true, groupField: 'sum', format: (value) => formatPercentage(value, 2) },
    { field: 'PerformanceRate', header: '營業實績佔比', visible: true, groupField: 'sum', format: (value) => formatPercentage(value, 2) },
    { field: 'TxnCount', header: '交易筆數', visible: true, groupField: 'custCnt', format: formatAmount },
    { field: 'AvgTicket', header: '客單價', visible: true, groupField: 'custCnt', format: formatAmount },
    { field: 'tlt_space', header: '坪數', visible: true, groupField: 'space' },
    { field: 'MonthlyPSM', header: '坪效', visible: true, groupField: 'space' },

    // { field: 'TempCounterSaleAmt', header: '營業實績', visible: true, groupField: 'temp' }, // queryTLS31030
    // { field: 'TempCounterSalesRate', header: '營業實績佔比', visible: true, groupField: 'temp' }, // queryTLS31030
    // { field: 'TempCounterAmtRate', header: '臨時櫃業績佔比', visible: true, groupField: 'temp' }, // queryTLS31030

    { field: 'MonthlyBudgetTotal', header: '月營業目標', visible: true, groupField: 'month', format: formatAmount },
    { field: 'MonthlySalesTotal', header: '營業實績', visible: true, groupField: 'month', format: formatAmount },
    { field: 'CompletionRate', header: '完成率', visible: true, groupField: 'month', format: (value) => formatPercentage(value, 2) },
  ];
  columnGroup: ColumnGroup[] = [
    { field: 'budgetAmt', header: '營業額' },
    { field: 'sum', header: '營業佔比' },
    { field: 'custCnt', header: '客單價' },
    { field: 'space', header: '營業坪效' },
    // { field: 'temp', header: '臨時櫃' }, // queryTLS31030
    { field: 'month', header: '月累計' },
  ]
  tlt_kind_Option = [
    { value: "1", label: "正櫃" },
    { value: "2", label: "臨時櫃" },
    { value: "3", label: "特賣會" },
    { value: "4", label: "虛擬櫃" },
  ]
  tlt_term_type = [
    { value: "1", label: "固定租金" },
    { value: "2", label: "底租抽成取高者" },
    { value: "3", label: "一般抽成" },
    { value: "4", label: "包底抽成" },
    { value: "5", label: "層級抽成" },
    { value: "6", label: "包底加層級" },
  ]
  tlt_building_Option: IDropdownItem[] = []; // 館別
  tlt_floor_Option: IDropdownItem[] = []; // 樓層
  area_no_Option: IDropdownItem[] = []; // 區域
  bus_type_Option: IDropdownItem[] = []; // 大分類
  bus_class_Option: IDropdownItem[] = []; // 中分類
  bus_sclass_Option: IDropdownItem[] = []; // 小分類
  org_id_Option: IDropdownItem[] = []; // 組織

  //查詢頁查詢條件
  queryConditions!: TLS31040DetailRequest;

  // ----------------------------------------------------------------
  constructor(
    public readonly tls31040Service: Tls31040Service,
    private readonly queryStateService: QueryStateService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS31040', this.dataForm);
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    this.queryConditions = state?.['queryConditions'];
    console.log('這是前面的查詢條件', this.rowdata);
    console.log('讀取資料', this.dataForm.value);

    // 重新讀取類別資料
    if (this.queryConditions) {
      this.queryTLS31040Detail(); // 查詢單大分類之資料
    } else {
      this.messageService.errorBubble('請返回查詢頁重新操作');
    }
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  btnLoading = false;
  onReport(isExcel: boolean) {
    const formValue = {
      ...this.queryConditions,
      IsExcel: isExcel,
      tlt_kind: this.dataForm.get('tlt_kind')?.value ?? '',
      TXN_DateS: formatDate(this.queryConditions.TXN_DateS, 'yyyy-MM-dd', 'en-US'),
      TXN_DateE: formatDate(this.queryConditions.TXN_DateE, 'yyyy-MM-dd', 'en-US'),
    } as TLS31040PrintDetailRequest;

    console.log('單櫃別之營業報表print請求', JSON.stringify(formValue, null, 2));

    this.btnLoading = true;
    this.tls31040Service.printTLS31040Detail(formValue).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this))
      .subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (res.Data && res.Data.Print_URL) {
          const downloadUrl = environment.ApiUrl + res.Data.Print_URL;
          window.open(downloadUrl, '_blank');
        }
      });
  }

  queryTLS31040Detail() {
    // 把 bus_type 從 string[] 轉成 string
    const request: TLS31040DetailRequest = {
      ...this.queryConditions,
      tlt_kind: this.dataForm.get('tlt_kind')?.value ?? '',
      TXN_DateS: formatDate(this.queryConditions.TXN_DateS, 'yyyy-MM-dd', 'en-US'),
      TXN_DateE: formatDate(this.queryConditions.TXN_DateE, 'yyyy-MM-dd', 'en-US'),
    };

    //用Json顯示request
    console.log('單櫃別之營業報表request', JSON.stringify(request));

    this.tls31040Service.queryTLS31040Detail(request).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      console.log('單櫃別之營業報表response', res.Data);
      this.data = res.Data ?? [];               // 查詢資料
      this.footerTotal = res.TotalData ?? null;;    // 總計資料
      this.footershowTotal = this.footerTotal ? {          // 人工轉換欄位
        budget: this.footerTotal.TotalBudget,
        AVN_TotSaleAmt: this.footerTotal.TotalSales,
        TxnCount: this.footerTotal.TotalTxnCount,
        AvgTicket: this.footerTotal.AvgTicket,
        tlt_space: this.footerTotal.TotalSpace,
        MonthlyPSM: this.footerTotal.AvgPSM,
        MonthlyPayment: this.footerTotal.AvgMonthlyPayment,
        // TempCounterSaleAmt: this.footerTotal.TotalTempCounterSales,

        MonthlyBudgetTotal: this.footerTotal.TotalMonthlyBudget,
        MonthlySalesTotal: this.footerTotal.TotalMonthlySales,

        AchievementRate: this.footerTotal.AvgAchievementRate,
        CompletionRate: this.footerTotal.AvgCompletionRate,
      } : null;
      // this.footershowPercent = this.footerTotal ? {    // 人工轉換百分比欄位

      // } : null;

      this.historyRequestBody = request;                 // 查詢條件
      console.log('明細資料', this.data)
      console.log('明細總計', this.footerTotal);
      console.log('明細總計(轉換後)', this.footershowTotal);
      // console.log('明細條件',this.historyRequestBody);
      this.totalRecords = res.TotalCount;
    })
  }
}
