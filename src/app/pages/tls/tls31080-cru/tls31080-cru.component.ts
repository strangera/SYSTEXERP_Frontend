import { IDropdownItem } from '@service/utility/dropDownList.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { Column, ColumnGroup, formatAmount, formatPercentage } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { ButtonModule } from 'primeng/button';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { QueryStateService } from '@shared/service/query-state.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TLS31080DetailRequest, TLS31080DetailResponse, TLS31080PrintDetailRequest, TLS31080Response, Tls31080Service } from '@service/api/tls/tls31080.service';

@Component({
  selector: 'app-tls31080-cru',
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
    MultiSelectComponent,
    ButtonModule
  ],
  templateUrl: './tls31080-cru.component.html'
})
export class Tls31080CRUComponent extends BasicCruPageComponent<TLS31080Response> implements OnInit{
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
  data: TLS31080DetailResponse[] = [];
  columns: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },

    { field: 'budget', header: '營業目標', visible: true, groupField: 'budgetAmt', format: formatAmount },
    { field: 'AVN_TotSaleAmt', header: '營業實績', visible: true, groupField: 'budgetAmt', format: formatAmount },
    { field: 'AchievementRate', header: '達成率', visible: true, groupField: 'budgetAmt', format: (value) => formatPercentage(value, 2) },
    { field: 'BudgetRate', header: '營業目標佔比', visible: true, groupField: 'sum', format: (value) => formatPercentage(value, 2) },
    { field: 'PerformanceRate', header: '營業實績佔比', visible: true, groupField: 'sum', format: (value) => formatPercentage(value, 2) },
    { field: 'TxnCount', header: '交易筆數', visible: true, groupField: 'custCnt', format: formatAmount },
    { field: 'AvgTicket', header: '客單價', visible: true, groupField: 'custCnt', format: formatAmount },
    { field: 'tlt_space', header: '坪數', visible: true, groupField: 'space' },
    { field: 'MonthlyPSM', header: '坪效', visible: true, groupField: 'space' },

    { field: 'MonthlyBudgetTotal', header: '月營業目標', visible: true, groupField: 'month', format: formatAmount },
    { field: 'MonthlySalesTotal', header: '營業實績', visible: true, groupField: 'month', format: formatAmount },
    { field: 'CompletionRate', header: '完成率', visible: true, groupField: 'month', format: (value) => formatPercentage(value, 2) },
  ];
  columnGroup: ColumnGroup[] = [
    { field: 'budgetAmt', header: '營業額' },
    { field: 'sum', header: '營業佔比' },
    { field: 'custCnt', header: '客單價' },
    { field: 'space', header: '營業坪效' },
    // { field: 'temp', header: '臨時櫃' }, // queryTLS31070
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
  queryConditions!: TLS31080DetailRequest;

  // ----------------------------------------------------------------
  constructor(
    private readonly tls31080Service: Tls31080Service,
    private readonly queryStateService: QueryStateService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS31080', this.dataForm);
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
    } as TLS31080PrintDetailRequest;

    console.log('單型態之營業報表print請求', JSON.stringify(formValue, null, 2));

    this.btnLoading = true;
    
    console.log('還沒有後端API');
    // this.tls31080Service.printTLS31080Detail(formValue).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this))
    //   .subscribe(res => {
    //     this.messageService.successBubble(res.Message);
    //     if (res.Data && res.Data.Print_URL) {
    //       const downloadUrl = environment.ApiUrl + res.Data.Print_URL;
    //       window.open(downloadUrl, '_blank');
    //     }
    //   });
  }

  queryTLS31030Detail() {
    // 把 bus_type 從 string[] 轉成 string
    const request: TLS31080DetailRequest = {
      ...this.queryConditions,
      paper_type: this.dataForm.get('paper_type')?.value ?? '',
    };

    //用Json顯示request
    console.log('單型態之營業報表request', JSON.stringify(request));

    console.log('還沒有後端API');

    // this.tls31080Service.queryTLS31080Detail(request).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
    //   console.log('單型態之營業報表response', res.Data);
    //   this.data = res.Data;
    //   // this.totalRecords = res.TotalCount;
    // })
  }
}
