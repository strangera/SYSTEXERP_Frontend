import { DropDownListService, IDropdownItem, ITLTBUSSCLASSInfo } from '@service/utility/dropDownList.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, ColumnGroup, formatAmount, formatPercentage } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, finalize, map, of, switchMap, tap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { environment } from 'src/environments/environment';
import { footerShowTotal, TLS31020Item, TLS31020PrintRequest, TLS31020Request, TLS31020Response, Tls31020Service, TLS31020Total } from '@service/api/tls/tls31020.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { TLS26050Service } from '@service/api/tls/tls26050.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

@Component({
  selector: 'app-tls31020',
  templateUrl: './tls31020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CalendarComponent,
    CalendarRangeQuickComponent,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    TableModule,
    TableReportComponent,
    RadiobuttonYNComponent,
    RadiobuttonComponent,
    TranslateModule,
    TableComponent,
    MultiSelectComponent,
    ButtonModule
  ]
})

// 各樓層之營業報表
export class TLS31020Component extends BasicQueryPageComponent<TLS31020Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TXN_DateS: [yesterday],//交易日期開始
    TXN_DateE: [yesterday],  // 交易日期結束
    // 合約查詢條件
    tlt_building: [[]],// 館別
    tlt_floor: [[]],// 樓層
    area_no: [[]],// 區域
    bus_type: [[] as string[]],//大分類
    bus_class: [[] as IDropdownItem[]],//中分類
    bus_sclass: [[] as IDropdownItem[]],//小分類
    tlt_kind: [[]], //櫃別 (1.正櫃 2.臨時櫃 3.特賣會 4.虛擬櫃)
    tlt_term_type: [[]], // 抽成別 1:固定租金 2:底租抽成取高者3:一般抽成     4:包底抽成     5:層級抽成   6:包底加層級   "
    org_id: [[]],  // 組織
    TaxType: ["0"],  // 銷售金額是否含稅(0:是 1:否 預設含稅)
    IsRece_Yn: [null],  // 是否開立業主發票(是否開立業主發票(Y:是 N:否 預設全部))
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'tlt_floor', order: 1 }]],
  });

  // 日期查詢條件表單
  dateForm = this.formBuilder.nonNullable.group({
    // 日期查詢條件（單選報表類型）
    reportType: ['1'], // 報表類型

    // --- 日報（type 1）使用的單一基準 / 比較日期
    onedatedd: [yesterday],        // 基準日期 (日)

    // --- 週報（type 2）相關
    onedateyy: [new Date()],      // 基準年度 (年字串)
    weeks: [''],                                           // 基準週數 (輸入)
    startdate: [null as Date | null],           // 基準開始日期 (由週數帶出)
    enddate: [null as Date | null],             // 基準結束日期 (由週數帶出)

    // --- 月報（type 3）
    onedatemm: [null],       // 基準年月 (可由 calendar 取值)

    // --- 半年報（type 4）
    halfyear_onedateyy: [new Date()],
    halfyear: ['1'],         // 上/下半年

    // --- 年報（type 5）
    year_onedateyy: [new Date()],

    // --- 區間報（type 6）
    sad_startdate: [null],
    sad_enddate: [null],

    // --- 活動區間報（type 7）
    eventID: [null],
    event_startdate: [null as Date | null],
    event_enddate: [null as Date | null],
  });

  halfyearOptions = [
    { value: '1', label: '上半年' },
    { value: '2', label: '下半年' },
  ];

  EventIDOptions = [
    { value: '1', label: '活動1', TXN_DateS: null, TXN_DateE: null },
    { value: '2', label: '活動2', TXN_DateS: null, TXN_DateE: null },
  ];

  reportTypeOptions = [
    { value: '1', label: '日營業報表' },
    { value: '2', label: '週營業報表' },
    { value: '3', label: '月營業報表' },
    { value: '4', label: '半年營業報表' },
    { value: '5', label: '年營業報表' },
    { value: '6', label: '區間營業報表' },
  ];

  totalRecords = 0;
  data: TLS31020Item[] = [];
  footerTotal: TLS31020Total | null = null; // 總計取得原始資料
  footershowTotal: footerShowTotal | null = null; // 總計資料轉換名稱
  footershowPercent: footerShowTotal | null = null; // 總計資料轉換百分比
  historyRequestBody: TLS31020Request | null = null; //歷史查詢條件

  columns: Column[] = [
    // { field: 'tlt_floor', header: '樓層代碼', visible: false },
    { field: 'floor_desc', header: '樓層名稱', visible: true },

    { field: 'budget', header: '營業目標', visible: true, groupField: 'budgetAmt', format: formatAmount },
    { field: 'AVN_TotSaleAmt', header: '營業實績', visible: true, groupField: 'budgetAmt', format: formatAmount },
    { field: 'AchievementRate', header: '達成率', visible: true, groupField: 'budgetAmt', format: (value) => formatPercentage(value, 2) },
    { field: 'BudgetRate', header: '營業目標佔比', visible: true, groupField: 'sum', format: (value) => formatPercentage(value, 2) },
    { field: 'PerformanceRate', header: '營業實績佔比', visible: true, groupField: 'sum', format: (value) => formatPercentage(value, 2) },
    { field: 'TxnCount', header: '交易筆數', visible: true, groupField: 'custCnt', format: formatAmount },
    { field: 'AvgTicket', header: '客單價', visible: true, groupField: 'custCnt', format: formatAmount },
    { field: 'tlt_space', header: '坪數', visible: true, groupField: 'space' },
    { field: 'MonthlyPSM', header: '月坪效', visible: true, groupField: 'space' },

    { field: 'TempCounterSaleAmt', header: '營業實績', visible: true, groupField: 'temp', format: formatAmount },
    { field: 'TempCounterSalesRate', header: '營業實績佔比', visible: true, groupField: 'temp', format: formatAmount },
    { field: 'TempCounterAmtRate', header: '臨時櫃業績佔比', visible: true, groupField: 'temp', format: formatAmount },

    { field: 'MonthlyBudgetTotal', header: '月營業目標', visible: true, groupField: 'month', format: formatAmount },
    { field: 'MonthlySalesTotal', header: '營業實績', visible: true, groupField: 'month', format: formatAmount },
    { field: 'CompletionRate', header: '完成率', visible: true, groupField: 'month', format: (value) => formatPercentage(value, 2) },
  ];
  columnGroup: ColumnGroup[] = [
    { field: 'budgetAmt', header: '營業額' },
    { field: 'sum', header: '營業佔比' },
    { field: 'custCnt', header: '客單價' },
    { field: 'space', header: '營業坪效' },
    { field: 'temp', header: '臨時櫃' },
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
  TaxType_Option = [
    { value: "0", label: "是" },
    { value: "1", label: "否" },
  ]
  tlt_building_Option: IDropdownItem[] = []; // 館別
  tlt_floor_Option: IDropdownItem[] = []; // 樓層
  area_no_Option: IDropdownItem[] = []; // 區域
  bus_type_Option: IDropdownItem[] = []; // 大分類
  bus_class_Option: IDropdownItem[] = []; // 中分類
  bus_sclass_Option: IDropdownItem[] = []; // 小分類
  org_id_Option: IDropdownItem[] = []; // 組織
  tlt_no_id_Option: IDropdownItem[] = []; // 專櫃編號

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls31020Service: Tls31020Service,
    private tls26050Service: TLS26050Service, // 日期的api，套用現有模式
    private datePipe: DatePipe,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS31020', 'TLS/TLS31020cru', this.queryForm, (frm) => this.onSubmit(frm));

    // 日期表單控制
    this.onReportTypeChange('1');
    this.setReadOnlyFields();

    // 監聽 dateForm 的變化，套用日期到 queryForm
    this.dateForm.valueChanges.subscribe(() => {
      this.syncDateToQueryForm();
    });

    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.tlt_building_Option = res.Data;
    })
    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.tlt_floor_Option = res.Data;
    })
    this.dropDownListService.querySYS3A00_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.area_no_Option = res.Data;
    })
    // 獲取大分類下拉選項
    this.dropDownListService.queryTLTBUSTYPE_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.bus_type_Option = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    });
    // 監聽大分類變化
    this.queryForm.controls.bus_type.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value: string[]) => {
      if (value && value.length > 0) {
        this.dropDownListService.queryTLTBUSCLASS_DropDownList({ bus_type: value }).pipe(untilDestroyed(this)).subscribe(response => {
          const groupedData = response.Data.reduce((accumulator, currentItem) => {
            const groupKey = currentItem.bus_type || '';
            if (!accumulator[groupKey]) {
              accumulator[groupKey] = {
                label: currentItem.bus_type_name,
                items: []
              };
            }

            accumulator[groupKey].items.push({
              ...currentItem,
              label: `${currentItem.No} - ${currentItem.Name}`,
            });

            return accumulator;
          }, {} as Record<string, any>);

          // 最後，將分組物件的值轉換為陣列，得到最終的分組下拉清單格式
          this.bus_class_Option = Object.values(groupedData);
        });
      } else {
        this.bus_class_Option = [];
        this.bus_sclass_Option = [];
        this.queryForm.controls.bus_sclass.setValue([]);
        this.queryForm.controls.bus_class.setValue([]);
      }
    });
    // 監聽中分類變化，獲取小分類並分組
    this.queryForm.controls.bus_class.valueChanges.pipe(
      debounceTime(300),
      untilDestroyed(this),
      map(selectedMValues => selectedMValues || []),

      // 使用 switchMap 取消前一次的請求，確保只處理最新的選取
      switchMap((selectedMValues: IDropdownItem[]) => {
        if (selectedMValues.length === 0) {
          this.bus_sclass_Option = [];
          this.queryForm.controls.bus_sclass.setValue([]);
          //  統一回傳型別，避免 TypeScript 推斷成 never[]
          return of({ selectedMValues: [], data: [] });
        }

        //  組成符合新 API 的請求格式
        const queryTLTBUSSCLASSInfos: ITLTBUSSCLASSInfo[] = selectedMValues
          .filter(v => v && v.bus_type) // 過濾 undefined
          .map(v => ({
            bus_type: v.bus_type!,   // 非空斷言
            bus_class: v.No
          }));

        //  呼叫新 API（一次呼整包）
        return this.dropDownListService.queryTLTBUSSCLASS_DropDownList_new({ queryTLTBUSSCLASSInfos }).pipe(
          map(res => ({ selectedMValues, data: res.Data }))
        );
      }),

      tap(result => {
        console.log('所有 API 呼叫結果：', result);
      })
    ).subscribe(result => {

      const groupedData = result.selectedMValues.reduce((accumulator, mValue) => {
      const groupKey = `${mValue.bus_type}_${mValue.No}`;
      const groupLabel = `${mValue.bus_type_name} - ${mValue.Name}`;

        //  過濾小分類資料對應到當前中分類
        const items = result.data
          .filter(item => item.bus_type === mValue.bus_type && item.bus_class === mValue.No)
          .map(item => ({
            ...item,
            label: `${item.No} - ${item.Name}`,
            bus_type: mValue.bus_type,
            bus_type_name: mValue.bus_type_name,
            CAT_MNo: mValue.No,
            CAT_MName: mValue.Name
          }));

        //  去重
        const uniqueItemsMap = new Map<string, typeof items[0]>();
        items.forEach(item => {
          if (!uniqueItemsMap.has(item.No)) {
            uniqueItemsMap.set(item.No, item);
          }
        });


        accumulator[groupKey] = {
          label: groupLabel,
          items: Array.from(uniqueItemsMap.values())
        };

        return accumulator;
      }, {} as Record<string, any>);

      this.bus_sclass_Option = Object.values(groupedData);
      console.log('最終分組後的小分類選項：', this.bus_sclass_Option);
    });

    this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.org_id_Option = res.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    })
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('中分類', frm.getRawValue().bus_class);
      console.log('小分類', frm.getRawValue().bus_sclass);
      const formValue = {
        ...frm.getRawValue(),
        // bus_class: (frm.getRawValue().bus_class || []).map((item: any) => item.No),
        // bus_sclass: (frm.getRawValue().bus_sclass || []).map((item: any) => item.No),
        bus_class: (frm.getRawValue().bus_class || []).map((x: any) => [x.bus_type, x.No]),
        bus_sclass: (frm.getRawValue().bus_sclass || []).map((x: any) => [x.bus_type, x.bus_class, x.No]),

        TXN_DateS: formatDate(frm.getRawValue().TXN_DateS, 'yyyy-MM-dd', 'en-US'),
        TXN_DateE: formatDate(frm.getRawValue().TXN_DateE, 'yyyy-MM-dd', 'en-US'),
      } as TLS31020Request;

      console.log('送出query請求', formValue);
      this.tls31020Service.queryTLS31020(formValue).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {

        // this.data = res.Data?.QueryData ?? [];               // 查詢資料
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
          TempCounterSaleAmt: this.footerTotal.TotalTempCounterSales,

          MonthlyBudgetTotal: this.footerTotal.TotalMonthlyBudget,
          MonthlySalesTotal: this.footerTotal.TotalMonthlySales,

          AchievementRate: this.footerTotal.AvgAchievementRate,
          CompletionRate: this.footerTotal.AvgCompletionRate,
        } : null;
        // this.footershowPercent = this.footerTotal ? {    // 人工轉換百分比欄位

        // } : null;

        this.historyRequestBody = formValue;                 // 查詢條件
        console.log('查詢結果', this.data);
        console.log('查詢總計', this.footerTotal);
        console.log('查詢總計(轉換後)', this.footershowTotal);

        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      })
    })
  }
  btnLoading = false;
  onReport(frm: FormGroup, isExcel: boolean) {
    const printData = this.queryStateService.getQueryStateValue(this.ProgNo);
    const formValue = {
      ...printData,
      IsExcel: isExcel,
      IsMerge: true,
      SortBy: undefined,
      pageIndex: undefined,
      pageSize: undefined,
      bus_class: frm.getRawValue().bus_class.map((item: IDropdownItem) => item.No),
      TXN_DateS: formatDate(frm.getRawValue().TXN_DateS, 'yyyy-MM-dd', 'en-US'),
      TXN_DateE: formatDate(frm.getRawValue().TXN_DateE, 'yyyy-MM-dd', 'en-US'),
    } as TLS31020PrintRequest;

    console.log('送出print請求', formValue);

    this.btnLoading = true;
    this.tls31020Service.printTLS31020(formValue).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this))
      .subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (res.Data && res.Data.Print_URL) {
          const downloadUrl = environment.ApiUrl + res.Data.Print_URL;
          window.open(downloadUrl, '_blank');
        }
      });
  }

  // #region 日期選單事件
  queryWeek(event: string) {
    const control = this.dateForm.controls['onedateyy'];
    if (!control.value) return;

    const payload = {
      onedateyy: this.datePipe.transform(control.value, 'yyyy') ?? '',
      weeks: event,
    };

    this.tls26050Service.queryTLS26050Week(payload).subscribe((response) => {
      this.dateForm.controls['startdate'].setValue(response.Data[0].WeekStart ? new Date(response.Data[0].WeekStart) : null);
      this.dateForm.controls['enddate'].setValue(response.Data[0].WeekEnd ? new Date(response.Data[0].WeekEnd) : null);
    });
  }

  onReportTypeChange(event: any) {
    // 根據報表類型設定欄位驗證
    const reportType = event;

    // 清除所有驗證器
    Object.keys(this.dateForm.controls).forEach(key => {
      if (key !== 'reportType') {
        this.dateForm.get(key)?.clearValidators();
      }
    });

    // 根據報表類型設定必要欄位驗證
    switch (reportType) {
      case '1': // 日營業報表
        this.dateForm.get('onedatedd')?.setValidators([Validators.required]);
        break;
      case '2': // 週營業報表
        this.dateForm.get('onedateyy')?.setValidators([Validators.required]);
        this.dateForm.get('weeks')?.setValidators([Validators.required]);
        this.dateForm.get('startdate')?.setValidators([Validators.required]);
        this.dateForm.get('enddate')?.setValidators([Validators.required]);
        break;
      case '3': // 月營業報表
        this.dateForm.get('onedatemm')?.setValidators([Validators.required]);
        break;
      case '4': // 半年營業報表
        this.dateForm.get('halfyear_onedateyy')?.setValidators([Validators.required]);
        break;
      case '5': // 年營業報表
        this.dateForm.get('year_onedateyy')?.setValidators([Validators.required]);
        break;
      case '6': // 區間營業報表
        this.dateForm.get('sad_startdate')?.setValidators([Validators.required]);
        this.dateForm.get('sad_enddate')?.setValidators([Validators.required]);
        break;
      case '7': // 活動區間營業報表
        this.dateForm.get('event_startdate')?.setValidators([Validators.required]);
        this.dateForm.get('event_enddate')?.setValidators([Validators.required]);
        break;
    }

    // 更新所有欄位驗證狀態
    Object.keys(this.dateForm.controls).forEach(key => {
      this.dateForm.get(key)?.updateValueAndValidity();
    });
  }

  setReadOnlyFields() {
    this.dateForm.controls['startdate'].disable();
    this.dateForm.controls['enddate'].disable();
    this.dateForm.controls['event_startdate'].disable();
    this.dateForm.controls['event_enddate'].disable();
  }

  // 活動下拉改變
  queryEvent(event: any) {
    console.log(event);
    console.log(this.EventIDOptions);
    this.dateForm.controls['event_startdate'].setValue(this.EventIDOptions.find(x => x.value === event)?.TXN_DateS ?? null);
    this.dateForm.controls['event_enddate'].setValue(this.EventIDOptions.find(x => x.value === event)?.TXN_DateE ?? null);
  }

  // #region 同步日期選單內容給表單日期
  private syncDateToQueryForm() {
    const reportType = this.dateForm.get('reportType')?.value;

    let start: Date | null = null;
    let end: Date | null = null;

    switch (reportType) {
      case '1': // 日報
        start = this.dateForm.get('onedatedd')?.value ?? null;
        end = start;
        break;

      case '2': // 週報
        start = this.dateForm.get('startdate')?.value ?? null;
        end = this.dateForm.get('enddate')?.value ?? null;
        break;

      case '3': { // 月報
        const onedatemm = this.dateForm.get('onedatemm')?.value as Date | null;
        if (onedatemm) {
          start = new Date(onedatemm.getFullYear(), onedatemm.getMonth(), 1);
          end = new Date(onedatemm.getFullYear(), onedatemm.getMonth() + 1, 0);
        }
        break;
      }

      case '4': { // 半年報
        const dateValue = this.dateForm.get('halfyear_onedateyy')?.value as Date | string;
        const year = dateValue instanceof Date ? dateValue.getFullYear() : Number(dateValue);
        const half = String(this.dateForm.get('halfyear')?.value); // 確保是字串

        if (year) {
          if (half === '1') { // 上半年
            start = new Date(year, 0, 1);
            end = new Date(year, 5, 30);
          } else if (half === '2') { // 下半年
            start = new Date(year, 6, 1);
            end = new Date(year, 11, 31);
          }
        }
        break;
      }

      case '5': { // 年報
        const dateValue = this.dateForm.get('year_onedateyy')?.value as Date | string;
        const year = dateValue instanceof Date ? dateValue.getFullYear() : Number(dateValue);

        if (year) {
          start = new Date(year, 0, 1);
          end = new Date(year, 11, 31);
        }
        break;
      }

      case '6': // 區間報
        start = this.dateForm.get('sad_startdate')?.value ?? null;
        end = this.dateForm.get('sad_enddate')?.value ?? null;
        break;
    }

    // 套用到 queryForm
    if (start) this.queryForm.get('TXN_DateS')?.setValue(start);
    if (end) this.queryForm.get('TXN_DateE')?.setValue(end);
  }

  onDetail1(event: any) {
    const queryConditions = this.queryStateService.getQueryStateValue(this.ProgNo);
    this.onDetail(event, queryConditions);
  }
}
