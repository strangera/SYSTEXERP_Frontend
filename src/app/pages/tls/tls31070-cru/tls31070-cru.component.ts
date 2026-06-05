import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { footerShowTotal, TLS31020Total } from '@service/api/tls/tls31020.service';
import { TLS31070DetailItem, TLS31070DetailRequest, TLS31070PrintDetailRequest, TLS31070Response, Tls31070Service } from '@service/api/tls/tls31070.service';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { ColumnGroup, formatAmount, formatPercentage } from '@shared/componentkit/table/table.model';
import { QueryStateService } from '@shared/service/query-state.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { formatAmountWithDecimals, ReportColumn } from '../tls2f010-cru/tls2f010-table-report.model';

@Component({
  selector: 'app-tls31070-cru',
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
    RadiobuttonYNComponent,
    TranslateModule,
    TableComponent,
    TableReportComponent,
    MultiSelectComponent,
    ButtonModule
  ],
  templateUrl: './tls31070-cru.component.html'
})
export class Tls31070CRUComponent extends BasicCruPageComponent<TLS31070Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    paper_type: [''],//型態
    paper_type_desc: [''],//型態名稱
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
  data: TLS31070DetailItem[] = [];
  footerTotal: TLS31020Total | null = null; // 總計
  footershowTotal: footerShowTotal | null = null; // 總計資料轉換名稱
  footershowPercent: footerShowTotal | null = null; // 總計資料轉換百分比
  historyRequestBody: TLS31070DetailRequest | null = null; //歷史查詢條件
  columns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號', align: 'left' },
    { field: 'tlt_name', header: '專櫃名稱', align: 'left' },
    { field: 'budget', header: '營業目標', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'AVN_TotSaleAmt', header: '營業實績', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'AchievementRate', header: '達成率', groupField: '營業額', format: (value) => formatPercentage(value, 2), align: 'right' },
    { field: 'BudgetRate', header: '營業目標佔比', groupField: '營業佔比', format: (value) => formatPercentage(value, 2), align: 'right' },
    { field: 'PerformanceRate', header: '營業實績佔比', groupField: '營業佔比', format: (value) => formatPercentage(value, 2), align: 'right' },
    { field: 'TxnCount', header: '交易筆數', groupField: '客單價', format: formatAmount, align: 'right' },
    { field: 'AvgTicket', header: '客單價', groupField: '客單價', format: formatAmount, align: 'right' },
    { field: 'tlt_space', header: '坪數', groupField: '營業坪效', format: (value) => formatAmountWithDecimals(value, 2), align: 'right' },
    { field: 'MonthlyPSM', header: '坪效', groupField: '營業坪效', format: formatAmount, align: 'right' },
    { field: 'MonthlyBudgetTotal', header: '月營業目標', groupField: '月累計', format: formatAmount, align: 'right' },
    { field: 'MonthlySalesTotal', header: '月營業實績', groupField: '月累計', format: formatAmount, align: 'right' },
    { field: 'CompletionRate', header: '完成率', groupField: '月累計', format: (value) => formatPercentage(value, 2), align: 'right' },
    { field: 'PreOrderAmt', header: '預售實績', format: formatAmount, align: 'right' },
  ];
  columnGroup: ColumnGroup[] = [
    { field: '營業額', header: '營業額' },
    { field: '營業佔比', header: '營業佔比' },
    { field: '客單價', header: '客單價' },
    { field: '營業坪效', header: '營業坪效' },
    // { field: 'temp', header: '臨時櫃' }, // queryTLS31070
    { field: '月累計', header: '月累計' },
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
  queryConditions!: TLS31070DetailRequest;

  // ----------------------------------------------------------------
  constructor(
    public readonly tls31070Service: Tls31070Service,
    private readonly queryStateService: QueryStateService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS31070', this.dataForm);
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    this.queryConditions = state?.['queryConditions'];
    console.log('這是前面的查詢條件', this.rowdata);
    console.log('讀取資料', this.dataForm.value);

    // 重新讀取類別資料
    if (this.queryConditions) {
      this.queryTLS31030Detail(); // 查詢單大分類之資料
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
      paper_type: this.dataForm.get('paper_type')?.value ?? '',
      bus_class: (this.queryConditions.bus_class || []).map((x: any) => [x.bus_type, x.No]),
      bus_sclass: (this.queryConditions.bus_sclass || []).map((x: any) => [x.bus_type, x.bus_class, x.No]),
      TXN_DateS: formatDate(this.queryConditions.TXN_DateS, 'yyyy-MM-dd', 'en-US'),
      TXN_DateE: formatDate(this.queryConditions.TXN_DateE, 'yyyy-MM-dd', 'en-US'),
    } as TLS31070PrintDetailRequest;

    console.log('單型態之營業報表print請求', JSON.stringify(formValue, null, 2));

    this.btnLoading = true;
    this.tls31070Service.printTLS31070Detail(formValue).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this))
      .subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (res.Data && res.Data.Print_URL) {
          const downloadUrl = environment.ApiUrl + res.Data.Print_URL;
          globalThis.open(downloadUrl, '_blank');
        }
      });
  }

  queryTLS31030Detail() {
    // 把 bus_type 從 string[] 轉成 string
    const request: TLS31070DetailRequest = {
      ...this.queryConditions,
      paper_type: this.dataForm.get('paper_type')?.value ?? '',
      bus_class: (this.queryConditions.bus_class || []).map((x: any) => [x.bus_type, x.No]),
      bus_sclass: (this.queryConditions.bus_sclass || []).map((x: any) => [x.bus_type, x.bus_class, x.No]),
      TXN_DateS: formatDate(this.queryConditions.TXN_DateS, 'yyyy-MM-dd', 'en-US'),
      TXN_DateE: formatDate(this.queryConditions.TXN_DateE, 'yyyy-MM-dd', 'en-US'),
    };

    //用Json顯示request
    console.log('單型態之營業報表request', JSON.stringify(request));

    this.tls31070Service.queryTLS31070Detail(request).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      console.log('單型態之營業報表response', res);
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
        PreOrderAmt: this.footerTotal.TotalPreOrderAmt,
        MonthlyBudgetTotal: this.footerTotal.TotalMonthlyBudget,
        MonthlySalesTotal: this.footerTotal.TotalMonthlySales,
        AchievementRate: this.footerTotal.AvgAchievementRate,
        CompletionRate: this.footerTotal.AvgCompletionRate,
      } : null;

      this.historyRequestBody = request;                 // 查詢條件
      console.log('明細資料', this.data)
      console.log('明細總計', this.footerTotal);
      console.log('明細總計(轉換後)', this.footershowTotal);
      // console.log('明細條件',this.historyRequestBody);
      this.totalRecords = res.TotalCount;
    })
  }
}
