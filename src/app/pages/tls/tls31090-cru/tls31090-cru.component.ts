import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS31090DetailResponse, TLS31090Request, TLS31090Response, Tls31090Service } from '@service/api/tls/tls31090.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { ColumnGroup, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { ReportColumn } from '../tls2f010-cru/tls2f010-table-report.model';

@Component({
  selector: 'app-tls31090-cru',
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
  templateUrl: './tls31090-cru.component.html'
})
export class Tls31090CRUComponent extends BasicCruPageComponent<TLS31090Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    BusTypeName: [null],// 業種名稱
    TimeType: [null],// 時段類型 (營業實績 / 交易筆數 / 營業實績佔比)
    H08: [null], // 08 時段
    H09: [null], // 09 時段
    H10: [null], // 10 時段
    H11: [null], // 11 時段
    H12: [null], // 12 時段
    H13: [null], // 13 時段
    H14: [null], // 14 時段
    H15: [null], // 15 時段
    H16: [null], // 16 時段
    H17: [null], // 17 時段
    H18: [null], // 18 時段
    H19: [null], // 19 時段
    H20: [null], // 20 時段
    H21: [null], // 21 時段
    H22: [null], // 22 時段
    H23: [null], // 23 時段
    Reentry: [null], //預售結帳
    PresaleCheckout: [null], //補登金額或筆數
    Subtotal: [null], //小計

  });
  totalRecords = 0;
  data: TLS31090DetailResponse[] = [];
  historyRequestBody: any = null; //歷史查詢條件
  columns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃代號', visible: true, align: 'left' },
    { field: 'tlt_name', header: '專櫃名稱', visible: true, align: 'left' },
    { field: 'floor_desc', header: '樓層名稱', visible: true, align: 'left' },
    { field: 'TimeType', header: '時段類型', visible: true, align: 'left' }, // (營業實績 / 交易筆數 / 營業實績佔比)

    { field: 'H08', header: '08時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H09', header: '09時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H10', header: '10時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H11', header: '11時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H12', header: '12時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H13', header: '13時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H14', header: '14時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H15', header: '15時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H16', header: '16時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H17', header: '17時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H18', header: '18時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H19', header: '19時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H20', header: '20時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H21', header: '21時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H22', header: '22時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H23', header: '23時段', visible: true, format: formatAmount, align: 'right' },

    { field: 'ReentryAmt', header: '補登', visible: true },
    { field: 'PresaleCheckoutAmt', header: '預售結帳', visible: true },
    { field: 'SubTotal', header: '小計', visible: true },
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
  queryConditions!: TLS31090Request;

  // ----------------------------------------------------------------
  constructor(
    public readonly tls31090Service: Tls31090Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS31090', this.dataForm);
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    this.queryConditions = state?.['queryConditions'];

    console.log('查詢頁request條件', this.queryConditions);
    console.log('查詢頁response點選項目', this.dataForm.value);

    // 讀取大分類選單
    this.dropDownListService.queryTLTBUSTYPE_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.bus_type_Option = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
        console.log('大分類選單', this.bus_type_Option);

        // 在這裡才呼叫查詢 (因為大分類選單已經準備好了)
        if (this.queryConditions) {
          this.queryTLS31090Detail();
        } else {
          this.messageService.errorBubble('請返回查詢頁重新操作');
        }
      });
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  onReport(isExcel: boolean) {
    //後端: 先做主表，就系統明細沒有匯出
  }

  queryTLS31090Detail() {
    this.loading = true;

    // 原本大分類是['01','02]，假設選01，那就是 CatLNos:['01]
    const CatLNosDesc = this.dataForm.get('BusTypeName')?.value ?? '';

    // 使用者可能沒選，就會 matched = undefined
    // 假設 CatLNosDesc 抓不到就停止
    if (!CatLNosDesc) {
      this.messageService.errorBubble('無效的大分類名稱，請重新操作');
      this.loading = false;
      return;
    }

    // 確認有沒又配對到的項目
    const matched = this.bus_type_Option.find(x => x.Name === CatLNosDesc);

    // --- 確保轉成陣列 ---
    // 如果找到 matched.No (string)，就包成 [matched.No] (string[])
    // 如果沒找到，就給空陣列 []
    const CatLNosValue: string[] = matched?.No ? [matched.No] : [];

    const request: TLS31090Request = {
      ...this.queryConditions,
      CatLNos: CatLNosValue
    };
    //用Json顯示request
    console.log('時段之業種營業報表request', request);

    this.tls31090Service.queryTLS31090Detail(request).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      console.log('時段之業種營業報表response', res.Data);
      this.data = res.Data ?? [];               // 查詢資料
      this.totalRecords = res.Data.length;      // 長度計算筆數
      this.historyRequestBody = request;        // 查詢條件
      this.loading = false;
    })
  }

}
