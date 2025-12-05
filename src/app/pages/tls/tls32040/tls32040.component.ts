import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26050Service } from '@service/api/tls/tls26050.service';
import { TLS32040Request, TLS32040Response, TLS32040Service } from '@service/api/tls/tls32040.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatAmount, formatPercentage } from '@shared/componentkit/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { debounceTime, finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

const today = new Date();

@Component({
  selector: 'app-tls32040',
  templateUrl: './tls32040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CalendarComponent,
    CalendarRangeComponent,
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

export class TLS32040Component extends BasicQueryPageComponent<TLS32040Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    BaseDateFrom: [today],  //交易日期開始
    BaseDateTo: [today],  // 交易日期結束
    CompareDateFrom: [yesterday as Date | null],// 比較日期開始
    CompareDateTo: [yesterday as Date | null],//比較日期結束

    // 合約查詢條件
    FloorList: [[]],// 樓層
    AreaList: [[]],// 區域
    BusTypeList: [[] as string[]],//大分類
    BusClassList: [[] as IDropdownItem[]],//中分類
    TltKindList: [[]], //櫃別 (1.正櫃 2.臨時櫃 3.特賣會 4.虛擬櫃)
    OrgList: [[]],  // 組織
    TltNoList: [[]], //專櫃編號 (queryTLTTALENT_DropDownList)
    TermTypeList: [[]], // 抽成別 1:固定租金 2:底租抽成取高者3:一般抽成     4:包底抽成     5:層級抽成   6:包底加層級   "
    BuildingList: [[]],// 館別

    AmtTaxMode: ["G"],  // 銷售金額是否含稅(G:是 N:否 預設含稅)
    ReceFilter: ['A'],  // 是否開立業主發票(是否開立業主發票(Y:是 N:否 A:預設全部))

    pageSize: [20],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'RowType', order: 1 }]],
  });

  // 日期查詢條件表單
  dateForm = this.formBuilder.nonNullable.group({
    // 日期查詢條件（單選報表類型）
    reportType: ['1'], // 報表類型

    // --- 日報（type 1）使用的單一基準 / 比較日期
    onedatedd: [today],        // 基準日期 (日)

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

  // 比較表單 (只負責顯示，送出的是主表的CompareDateFrom、CompareDateTo)
  c_dateForm = this.formBuilder.nonNullable.group({
    // 日期查詢條件（單選報表類型）
    reportType: ['1'], // 報表類型

    // --- 日報（type 1）使用的單一基準 / 比較日期
    onedatedd: [yesterday as Date | null],        // 基準日期 (日)

    // --- 週報（type 2）相關
    onedateyy: [new Date()],      // 基準年度 (年字串)
    weeks: [''],                                           // 基準週數 (輸入)
    startdate: [null as Date | null],           // 基準開始日期 (由週數帶出)
    enddate: [null as Date | null],             // 基準結束日期 (由週數帶出)

    // --- 月報（type 3）
    onedatemm: [null as Date | null],       // 基準年月 (可由 calendar 取值)

    // --- 半年報（type 4）
    halfyear_onedateyy: [new Date()],
    halfyear: ['1' as string | null],         // 上/下半年

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
    { value: '1', label: '活動1', BaseDateFrom: null, BaseDateTo: null },
    { value: '2', label: '活動2', BaseDateFrom: null, BaseDateTo: null },
  ];

  reportTypeOptions = [
    { value: '1', label: '日營業報表' },
    { value: '2', label: '週營業報表' },
    { value: '3', label: '月營業報表' },
    { value: '4', label: '半年營業報表' },
    { value: '5', label: '年營業報表' },
    // { value: '6', label: '區間營業報表' }, //本作業不使用
  ];

  totalRecords = 0;
  data: TLS32040Response[] = [];
  historyRequestBody: TLS32040Request | null = null; //歷史查詢條件

  columns: Column[] = [
    { field: 'RowType', header: '列別', visible: true },
    { field: 'TeamId', header: '單位代碼', visible: true },
    { field: 'TeamName', header: '單位名稱', visible: true },
    { field: 'OrgId', header: '樓組代碼', visible: true },
    { field: 'OrgName', header: '樓組名稱', visible: true },
    { field: 'Base_Target', header: '本期銷售目標', visible: true, format: formatAmount },
    { field: 'Base_SaleAmt', header: '本期銷售金額', visible: true, format: formatAmount },
    { field: 'Base_AchieveRate', header: '本期達成率', visible: true, format: (value) => formatPercentage(value, 2) },
    { field: 'Base_TxnCnt', header: '本期交易筆數', visible: true },
    { field: 'Base_AvgTicket', header: '本期客單價', visible: true, format: formatAmount },

    { field: 'Comp_SaleAmt', header: '上期銷售金額', visible: true, format: formatAmount },
    { field: 'Comp_TxnCnt', header: '上期交易筆數', visible: true },
    { field: 'Comp_AvgTicket', header: '上期客單價', visible: true, format: formatAmount },
    { field: 'Growth_SaleAmtPct', header: '成長比', visible: true, format: (value) => formatPercentage(value, 2) },

    { field: 'Diff_SaleAmt', header: '銷售金額差異', visible: true, format: formatAmount },
    { field: 'Diff_TxnCnt', header: '交易筆數差異', visible: true },
    { field: 'Diff_AvgTicket', header: '客單價差異', visible: true, format: formatAmount },
    { field: 'Space', header: '營業坪數', visible: true },
    { field: 'Base_DaySpaceEff', header: '本期日平均坪效', visible: true }
  ];
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
    { value: "G", label: "是" },
    { value: "N", label: "否" },
  ]
  ReceFilter_Option = [
    { value: "A", label: "全部" },
    { value: "Y", label: "是" },
    { value: "N", label: "否" },
  ]
  tlt_building_Option: IDropdownItem[] = []; // 館別
  tlt_floor_Option: IDropdownItem[] = []; // 樓層
  area_no_Option: IDropdownItem[] = []; // 區域
  bus_type_Option: IDropdownItem[] = []; // 大分類
  bus_class_Option: IDropdownItem[] = []; // 中分類
  org_id_Option: IDropdownItem[] = []; // 組織
  tlt_no_id_Option: IDropdownItem[] = []; // 專櫃編號

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls32040Service: TLS32040Service,
    private tls26050Service: TLS26050Service, // 日期的api，套用現有模式
    private datePipe: DatePipe,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS32040', 'TLS/TLS32040cru', this.queryForm, (frm) => this.onSubmit(frm));

    // 日期表單控制
    this.onReportTypeChange('1');
    this.setReadOnlyFields();

    // 監聽 dateForm 的變化，套用日期到 queryForm(比較日是基準日帶入結果，不進行自行控制)
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
    this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.tlt_no_id_Option = res.Data;
    })
    // 獲取大分類下拉選項
    this.dropDownListService.queryTLTBUSTYPE_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.bus_type_Option = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    });
    // 監聽大分類變化
    this.queryForm.controls.BusTypeList.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value: string[]) => {
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
        this.queryForm.controls.BusTypeList.setValue([]);
      }
    });

    this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.org_id_Option = res.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    })
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = {
        ...frm.getRawValue(),

        ReportType: this.dateForm.get('reportType')?.value, // 從日期表單抓
        BaseDateFrom: formatDate(frm.getRawValue().BaseDateFrom, 'yyyy-MM-dd', 'en-US'),
        BaseDateTo: formatDate(frm.getRawValue().BaseDateTo, 'yyyy-MM-dd', 'en-US'),
        CompareDateFrom: formatDate(frm.getRawValue().CompareDateFrom, 'yyyy-MM-dd', 'en-US'),
        CompareDateTo: formatDate(frm.getRawValue().CompareDateTo, 'yyyy-MM-dd', 'en-US'),
        FloorList: (frm.getRawValue().FloorList || []).join(','),
        AreaList: (frm.getRawValue().AreaList || []).join(','),

        BusTypeList: (frm.getRawValue().BusTypeList || []).join(','), //這邊怪怪的之後可能會改成舊的模式(還是大: "大字串", 中: "中字串")
        BusClassList: (frm.getRawValue().BusClassList || []) //這邊怪怪的之後可能會改成舊的模式
          .map((x: any) => x.No)
          .join(','),

        TltKindList: (frm.getRawValue().TltKindList || []).join(','),
        OrgList: (frm.getRawValue().OrgList || []).join(','),
        TltNoList: (frm.getRawValue().TltNoList || []).join(','),
        TermTypeList: (frm.getRawValue().TermTypeList || []).join(','),
        BuildingList: (frm.getRawValue().BuildingList || []).join(','),

      } as TLS32040Request;

      console.log('主查詢請求', formValue);

      this.tls32040Service.queryTLS32040(formValue).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {

        this.data = res.Data ?? [];                           // 查詢資料
        this.historyRequestBody = formValue;                  // 查詢條件
        this.totalRecords = res.TotalCount;              // 等候端
        console.log('主查詢結果', res.Data);
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
      BusTypeList: (frm.getRawValue().BusTypeList || []).map((x: any) => (x.BusTypeList, x.No)),
      BaseDateFrom: formatDate(frm.getRawValue().BaseDateFrom, 'yyyy-MM-dd', 'en-US'),
      BaseDateTo: formatDate(frm.getRawValue().BaseDateTo, 'yyyy-MM-dd', 'en-US'),
      CompareDateFrom: formatDate(frm.getRawValue().CompareDateFrom, 'yyyy-MM-dd', 'en-US'),
      CompareDateTo: formatDate(frm.getRawValue().CompareDateTo, 'yyyy-MM-dd', 'en-US'),
    }
    // } as TLS31020PrintRequest;

    console.log('送出print請求_api尚未提供', formValue);

    this.btnLoading = true;
    // this.tls31020Service.printTLS31020(formValue).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this))
    //   .subscribe(res => {
    //     this.messageService.successBubble(res.Message);
    //     if (res.Data && res.Data.Print_URL) {
    //       const downloadUrl = environment.ApiUrl + res.Data.Print_URL;
    //       window.open(downloadUrl, '_blank');
    //     }
    //   });
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
        this.c_dateForm.get(key)?.clearValidators();
      }
    });

    // 根據報表類型設定必要欄位驗證
    switch (reportType) {
      case '1': // 日營業報表
        this.dateForm.get('onedatedd')?.setValidators([Validators.required]);
        this.c_dateForm.get('onedatedd')?.setValidators([Validators.required]);
        break;
      case '2': // 週營業報表
        this.dateForm.get('onedateyy')?.setValidators([Validators.required]);
        this.dateForm.get('weeks')?.setValidators([Validators.required]);
        this.dateForm.get('startdate')?.setValidators([Validators.required]);
        this.dateForm.get('enddate')?.setValidators([Validators.required]);

        this.c_dateForm.get('onedateyy')?.setValidators([Validators.required]);
        this.c_dateForm.get('weeks')?.setValidators([Validators.required]);
        this.c_dateForm.get('startdate')?.setValidators([Validators.required]);
        this.c_dateForm.get('enddate')?.setValidators([Validators.required]);
        break;
      case '3': // 月營業報表
        this.dateForm.get('onedatemm')?.setValidators([Validators.required]);
        this.c_dateForm.get('onedatemm')?.setValidators([Validators.required]);
        break;
      case '4': // 半年營業報表
        this.dateForm.get('halfyear_onedateyy')?.setValidators([Validators.required]);
        this.c_dateForm.get('halfyear_onedateyy')?.setValidators([Validators.required]);
        break;
      case '5': // 年營業報表
        this.dateForm.get('year_onedateyy')?.setValidators([Validators.required]);
        this.c_dateForm.get('year_onedateyy')?.setValidators([Validators.required]);
        break;
      case '6': // 區間營業報表
        this.dateForm.get('sad_startdate')?.setValidators([Validators.required]);
        this.dateForm.get('sad_enddate')?.setValidators([Validators.required]);
        this.c_dateForm.get('sad_startdate')?.setValidators([Validators.required]);
        this.c_dateForm.get('sad_enddate')?.setValidators([Validators.required]);
        break;
      case '7': // 活動區間營業報表
        this.dateForm.get('event_startdate')?.setValidators([Validators.required]);
        this.dateForm.get('event_enddate')?.setValidators([Validators.required]);
        this.c_dateForm.get('event_startdate')?.setValidators([Validators.required]);
        this.c_dateForm.get('event_enddate')?.setValidators([Validators.required]);
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
    this.dateForm.controls['event_startdate'].setValue(this.EventIDOptions.find(x => x.value === event)?.BaseDateFrom ?? null);
    this.dateForm.controls['event_enddate'].setValue(this.EventIDOptions.find(x => x.value === event)?.BaseDateTo ?? null);
  }

  // #region 同步日期選單內容給表單日期
  private syncDateToQueryForm() {
    const reportType = this.dateForm.get('reportType')?.value;

    let start: Date | null = null;
    let end: Date | null = null;
    //---比較日期---
    let compareStart: Date | null = null;
    let compareEnd: Date | null = null;

    const today = new Date();
    const yesterday = new Date(today);
    //---

    switch (reportType) {
      case '1': // 日報
        start = this.dateForm.get('onedatedd')?.value ?? null;
        end = start;

        // 比較表單
        if (start) {
          yesterday.setDate(start.getDate() - 1);
          compareStart = yesterday;
          compareEnd = yesterday;

          console.log('比較日期(日報)', compareStart);

          this.c_dateForm.get('onedatedd')?.setValue(compareStart);
        }
        break;

      case '2': // 週報
        start = this.dateForm.get('startdate')?.value ?? null;
        end = this.dateForm.get('enddate')?.value ?? null;

        // 比較表單
        if (start) {
          compareStart = new Date(start as Date);
          compareStart.setDate((start.getDate() - 7) as number);

          compareEnd = new Date(compareStart);
          compareEnd.setDate(compareStart.getDate() + 6);

          // 以start為準推算比較年度/週數
          const compareYear = compareEnd.getFullYear();
          const compareYearDate = new Date(compareYear, 0, 1);
          const compareWeek = this.getWeekNumber(compareEnd);

          this.c_dateForm.get('onedateyy')?.setValue(compareYearDate);
          this.c_dateForm.get('weeks')?.setValue(compareWeek);
          this.c_dateForm.get('startdate')?.setValue(compareStart);
          this.c_dateForm.get('enddate')?.setValue(compareEnd);
        }
        break;

      case '3': { // 月報
        const onedatemm = this.dateForm.get('onedatemm')?.value as Date | null;
        if (onedatemm) {
          start = new Date(onedatemm.getFullYear(), onedatemm.getMonth(), 1);
          end = new Date(onedatemm.getFullYear(), onedatemm.getMonth() + 1, 0);

          // 比較表單
          const compareMonth = new Date(onedatemm.getFullYear(), onedatemm.getMonth() - 1, 1);
          compareStart = new Date(compareMonth.getFullYear(), compareMonth.getMonth(), 1);
          compareEnd = new Date(compareMonth.getFullYear(), compareMonth.getMonth() + 1, 0);

          this.c_dateForm.get('onedatemm')?.setValue(compareStart);
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

            // 比較：去年下半年
            compareStart = new Date(year - 1, 6, 1);
            compareEnd = new Date(year - 1, 11, 31);
            this.c_dateForm.get('halfyear_onedateyy')?.setValue(compareStart);
            this.c_dateForm.get('halfyear')?.setValue('2');
          } else if (half === '2') { // 下半年
            start = new Date(year, 6, 1);
            end = new Date(year, 11, 31);

            // 比較：今年上半年
            compareStart = new Date(year, 0, 1);
            compareEnd = new Date(year, 5, 30);
            this.c_dateForm.get('halfyear_onedateyy')?.setValue(compareStart);
            this.c_dateForm.get('halfyear')?.setValue('1');
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

          // 比較：去年下半年
          compareStart = new Date(year - 1, 0, 1);
          compareEnd = new Date(year - 1, 11, 31);

          this.c_dateForm.get('year_onedateyy')?.setValue(compareStart);
        }
        break;
      }
    }

    // 套用到 queryForm
    if (start) this.queryForm.get('BaseDateFrom')?.setValue(start);
    if (end) this.queryForm.get('BaseDateTo')?.setValue(end);

    // ----- 寫入比較日期 -----
    this.queryForm.get('CompareDateFrom')?.setValue(compareStart);
    this.queryForm.get('CompareDateTo')?.setValue(compareEnd);

    console.log('比較日期(起)', this.queryForm.get('CompareDateFrom')?.value);
    console.log('比較日期(迄)', this.queryForm.get('CompareDateTo')?.value);
  }

  onDetail1(event: any) {
    const queryConditions = this.queryStateService.getQueryStateValue(this.ProgNo);
    this.onDetail(event, queryConditions);
  }

  // 算比較表單的週數
  getWeekNumber(d: Date) {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayNum = date.getDay() || 7; // 週日為 7
    date.setDate(date.getDate() + 4 - dayNum);
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return String(weekNo);
  }
}
