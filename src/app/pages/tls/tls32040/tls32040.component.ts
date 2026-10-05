import { CommonModule, DatePipe, formatDate, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { formatAmount, formatPercentage } from '@others/component/table/table.model';
import { TLS26050Service } from '@service/api/tls/tls26050.service';
import { TLS32040ChartRequest, TLS32040Request, TLS32040Response, TLS32040Service } from '@service/api/tls/tls32040.service';
import { DropDownListService, IDropdownItem, ITLTBUSSCLASSInfo } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { debounceTime, finalize, map, of, switchMap, tap } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ColumnGroup, formatAmountWithDecimals, ReportColumn } from '../tls2f010-cru/tls2f010-table-report.model';
import { TLS32040ChartResponse } from './../../../service/api/tls/tls32040.service';
import { Tls32040CRUComponent } from './tls32040-cru/tls32040-cru.component';

const today = new Date();
const yesterday = new Date(today);

@Component({
  selector: 'app-tls32040',
  templateUrl: './tls32040.component.html',
  styles: [`
    :host ::ng-deep {
      .bg-group-base {
        background-color: #e3edf4 !important;
      }
      .bg-group-compare {
        background-color: #e2f2e5 !important;
      }
      .bg-group-diff {
        background-color: #fff1e0 !important;
      }
      .bg-group-growth {
        background-color: #f3e9f7 !important;
      }
      .p-datatable-tbody > tr:hover > td.bg-group-base {
        background-color: #d4e3ee !important;
      }
      .p-datatable-tbody > tr:hover > td.bg-group-compare {
        background-color: #d3e9d8 !important;
      }
      .p-datatable-tbody > tr:hover > td.bg-group-diff {
        background-color: #ffe6c7 !important;
      }
      .p-datatable-tbody > tr:hover > td.bg-group-growth {
        background-color: #ebd9f2 !important;
      }
    }
  `],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CalendarComponent,
    CalendarRangeComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    TableModule,
    TableReportComponent,
    RadiobuttonComponent,
    TranslateModule,
    MultiSelectComponent,
    ButtonModule,
    ChartModule,
    CheckboxModule,
    Tls32040CRUComponent,
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
    BusSClassList: [[] as IDropdownItem[]],//小分類
    TltKindList: [[]], //櫃別 (1.正櫃 2.臨時櫃 3.特賣會 4.虛擬櫃)
    OrgList: [[]],  // 組織
    TltNoList: [[]], //專櫃編號 (queryTLTTALENT_DropDownList)
    TermTypeList: [[]], // 抽成別 1:固定租金 2:底租抽成取高者3:一般抽成     4:包底抽成     5:層級抽成   6:包底加層級   "
    BuildingList: [[]],// 館別

    AmtTaxMode: ["G"],  // 銷售金額是否含稅(G:是 N:否 預設含稅)
    ReceFilter: ['A'],  // 是否開立業主發票(是否開立業主發票(Y:是 N:否 A:預設全部))

    PreSale: [false],
    ConsumerNum: [false],

    pageSize: [20],
    pageIndex: [1], // 你將初始頁碼改為 1
    // SortBy: [[{ field: 'RowType', order: 1 }]],
  });

  // 日期查詢條件表單
  dateForm = this.formBuilder.nonNullable.group({
    // 日期查詢條件（單選報表類型）
    reportType: ['DAY'], // 報表類型

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
    reportType: ['DAY'], // 報表類型

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
    sad_startdate: [null as Date | null],
    sad_enddate: [null as Date | null],
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
    { value: 'DAY', label: '日營業報表' },
    { value: 'WEEK', label: '週營業報表' },
    { value: 'MONTH', label: '月營業報表' },
    { value: 'HALFYEAR', label: '半年營業報表' },
    { value: 'YEAR', label: '年營業報表' },
    { value: 'SAD', label: '區間營業報表' },
  ];

  totalRecords = 0;
  data: TLS32040Response[] = [];
  chartData: any = []; // 圖檔資料
  chart_options: any = []; // 圖檔欄位
  historyRequestBody: TLS32040Request | null = null; //歷史查詢條件
  dialogVisible = false;
  selectedRow: TLS32040Response | null = null;

  isPreSale = this.queryForm.get('PreSale')?.value ?? false;
  isConsumerNum = this.queryForm.get('ConsumerNum')?.value ?? false;
  columns: ReportColumn[] = [
    { field: 'TeamId', header: '單位代碼', visible: true, align: 'left' },
    { field: 'TeamName', header: '單位名稱', visible: true, align: 'left' },
    { field: 'OrgId', header: '樓組代碼', visible: true, align: 'left' },
    { field: 'OrgName', header: '樓組名稱', visible: true, align: 'left' },
    // ================= 本期 Group =================
    { field: 'Base_Target', header: '本期銷售目標', visible: true, format: formatAmount, align: 'right', groupField: '本期' },
    { field: 'Base_SaleAmt', header: '本期銷售金額', visible: true, format: formatAmount, align: 'right', groupField: '本期' },
    { field: 'Base_AchieveRate', header: '本期達成率', visible: true, format: (value) => formatPercentage(value, 2), align: 'right', groupField: '本期' },
    { field: 'Base_TxnCnt', header: '本期交易筆數', visible: true, format: formatAmount, align: 'right', groupField: '本期' },
    { field: 'Base_AvgTicket', header: '本期客單價', visible: true, format: formatAmount, align: 'right', groupField: '本期' },
    // 動態預售與消費指標 (本期)
    { field: 'Base_PrePerformance', header: '本期預售實績', visible: this.isPreSale, format: formatAmount, align: 'right', groupField: '本期' },
    { field: 'Base_ConsumerNum', header: '本期消費人數', visible: this.isConsumerNum, format: formatAmount, align: 'right', groupField: '本期' },
    { field: 'Base_ConsumerOrder', header: '本期消費客單', visible: this.isConsumerNum, format: formatAmount, align: 'right', groupField: '本期' },
    // ================= 上期 Group =================
    { field: 'Comp_SaleAmt', header: '上期銷售金額', visible: true, format: formatAmount, align: 'right', groupField: '上期' },
    { field: 'Comp_TxnCnt', header: '上期交易筆數', visible: true, format: formatAmount, align: 'right', groupField: '上期' },
    { field: 'Comp_AvgTicket', header: '上期客單價', visible: true, format: formatAmount, align: 'right', groupField: '上期' },
    // 動態預售與消費指標 (上期)
    { field: 'Comp_PrePerformance', header: '上期預售實績', visible: this.isPreSale, format: formatAmount, align: 'right', groupField: '上期' },
    { field: 'Comp_ConsumerNum', header: '上期消費人數', visible: this.isConsumerNum, format: formatAmount, align: 'right', groupField: '上期' },
    { field: 'Comp_ConsumerOrder', header: '上期消費客單', visible: this.isConsumerNum, format: formatAmount, align: 'right', groupField: '上期' },

    // ================= 差異 Group =================
    { field: 'Growth_SaleAmtPct', header: '成長比', visible: true, format: (value) => formatPercentage(value, 2), align: 'right', groupField: '差異' },
    { field: 'Diff_SaleAmt', header: '銷售金額差異', visible: true, format: formatAmount, align: 'right', groupField: '差異' },
    { field: 'Diff_TxnCnt', header: '交易筆數差異', visible: true, format: formatAmount, align: 'right', groupField: '差異' },
    { field: 'Diff_AvgTicket', header: '客單價差異', visible: true, format: formatAmount, align: 'right', groupField: '差異' },
    // 動態預售與消費指標 (差異)
    { field: 'Diff_PrePerformance', header: '預售實績差異', visible: this.isPreSale, format: formatAmount, align: 'right', groupField: '差異' },
    { field: 'Diff_ConsumerNum', header: '消費人數差異', visible: this.isConsumerNum, format: formatAmount, align: 'right', groupField: '差異' },
    { field: 'Diff_ConsumerOrder', header: '消費客單差異', visible: this.isConsumerNum, format: formatAmount, align: 'right', groupField: '差異' },

    // ================= 坪效 Group =================
    { field: 'Space', header: '營業坪數', visible: true, format: (value) => formatAmountWithDecimals(value, 2), align: 'right', groupField: '坪效' },
    { field: 'Base_DaySpaceEff', header: '本期日平均坪效', visible: true, format: formatAmount, align: 'right', groupField: '坪效' },
  ];
  // 報表分組標頭：本期/上期/差異/坪效，基本資訊與預售/消費人數欄位維持無群組（比照 TLS31010 既有慣例）
  columnGroup: ColumnGroup[] = [
    { field: '本期', header: '本期' },
    { field: '上期', header: '上期' },
    { field: '差異', header: '差異' },
    { field: '坪效', header: '坪效' },
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
  bus_sclass_Option: IDropdownItem[] = []; // 小分類
  org_id_Option: IDropdownItem[] = []; // 組織
  tlt_no_id_Option: IDropdownItem[] = []; // 專櫃編號

  btnPDFLoading = false; // PDF excel 讀取進度條
  btnExcelLoading = false; // PDF excel 讀取進度條
  platformId = inject(PLATFORM_ID);

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls32040Service: TLS32040Service,
    private readonly tls26050Service: TLS26050Service, // 日期的api，套用現有模式
    private readonly datePipe: DatePipe,
    private readonly cd: ChangeDetectorRef
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS32040', 'TLS/TLS32040cru', this.queryForm, (frm) => this.onSubmit(frm));
    this.columns = this.columns.map((col): ReportColumn => ({
      ...col,
      cellClass: () => {
        switch (col.groupField) {
          case '本期': return 'bg-group-base';
          case '上期': return 'bg-group-compare';
          case '差異': return 'bg-group-diff';
          case '坪效': return 'bg-group-growth';
          default: return '';
        }
      },
    }));
    // 1. 初始化 UI 狀態與驗證器
    this.onReportTypeChange('DAY');
    this.setReadOnlyFields();

    // 2. 【關鍵】先從 State 還原資料（純資料 patchValue）
    // 處理基準日期表單
    const savedDate = this.queryStateService.getQueryStateValue('tls32040_Date');
    if (savedDate) {
      // 如果 savedDate 是整個 FormGroup 物件，則取 .value；如果是 rawValue 則直接用
      const dateVal = savedDate.value ? savedDate.value : savedDate;
      this.dateForm.patchValue(dateVal, { emitEvent: false });
    }

    // 處理自定義比較表單
    const savedCDate = this.queryStateService.getQueryStateValue('tls32040_CDate');
    if (savedCDate) {
      const cDateVal = savedCDate.value ? savedCDate.value : savedCDate;
      this.c_dateForm.patchValue(cDateVal, { emitEvent: false });
    }

    // 3. 【關鍵】還原後手動執行同步，確保 queryForm 拿到正確的初始日期
    this.syncDateToQueryForm();
    this.syncCDateToQueryForm();

    // 4. 最後才啟動監聽 (這時後的監聽才會持續有效且不會被覆蓋)
    this.dateForm.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.syncDateToQueryForm();
      });

    this.c_dateForm.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.syncCDateToQueryForm();
      });

    // 週報：修改年度後依現有週數重新帶出日期範圍
    this.dateForm.controls.onedateyy.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.queryWeek('base'));
    this.c_dateForm.controls.onedateyy.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.queryWeek('compare'));

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
      this.tlt_no_id_Option = res.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
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
    // 監聽中分類變化，獲取小分類並分組
    this.queryForm.controls.BusClassList.valueChanges.pipe(
      debounceTime(300),
      untilDestroyed(this),
      map(selectedMValues => selectedMValues || []),

      // 使用 switchMap 取消前一次的請求，確保只處理最新的選取
      switchMap((selectedMValues: IDropdownItem[]) => {
        if (selectedMValues.length === 0) {
          this.bus_sclass_Option = [];
          this.queryForm.controls.BusSClassList.setValue([]);
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

    this.queryForm.get('PreSale')?.valueChanges.subscribe(() => {
      this.setColumns();
    });
    this.queryForm.get('ConsumerNum')?.valueChanges.subscribe(() => {
      this.setColumns();
    });
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

        BusTypeList: (frm.getRawValue().BusTypeList),
        BusClassList: (frm.getRawValue().BusClassList || []).map((item: any) => ({
          BusType: item.bus_type ?? '',
          BusClass: item.No ?? ''
        })),
        BusSClassList: (frm.getRawValue().BusSClassList || []).map((item: any) => ({
          BusType: item.bus_type ?? '',
          BusClass: item.CAT_MNo ?? '',
          BusSClass: item.No ?? ''
        })),

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
        this.totalRecords = res.Data.length;              // 等候端
        console.log('主查詢結果', res.Data);
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        // ---同步儲存比較表單的query資訊---
        this.queryStateService.setQueryState('tls32040_Date', this.dateForm);
        this.queryStateService.setQueryState('tls32040_CDate', this.c_dateForm);
        // ------
      })
    })
  }
  onReport(frm: FormGroup, isExcel: boolean) {
    if (isExcel == false) {
      const formValue = {
        ...frm.getRawValue(),

        ReportType: this.dateForm.get('reportType')?.value, // 從日期表單抓
        BaseDateFrom: formatDate(frm.getRawValue().BaseDateFrom, 'yyyy-MM-dd', 'en-US'),
        BaseDateTo: formatDate(frm.getRawValue().BaseDateTo, 'yyyy-MM-dd', 'en-US'),
        CompareDateFrom: formatDate(frm.getRawValue().CompareDateFrom, 'yyyy-MM-dd', 'en-US'),
        CompareDateTo: formatDate(frm.getRawValue().CompareDateTo, 'yyyy-MM-dd', 'en-US'),
        FloorList: (frm.getRawValue().FloorList || []).join(','),
        AreaList: (frm.getRawValue().AreaList || []).join(','),

        BusTypeList: (frm.getRawValue().BusTypeList),
        BusClassList: (frm.getRawValue().BusClassList || []).map((item: any) => ({
          BusType: item.bus_type ?? '',
          BusClass: item.No ?? ''
        })),
        BusSClassList: (frm.getRawValue().BusSClassList || []).map((item: any) => ({
          BusType: item.bus_type ?? '',
          BusClass: item.CAT_MNo ?? '',
          BusSClass: item.No ?? ''
        })),

        TltKindList: (frm.getRawValue().TltKindList || []).join(','),
        OrgList: (frm.getRawValue().OrgList || []).join(','),
        TltNoList: (frm.getRawValue().TltNoList || []).join(','),
        TermTypeList: (frm.getRawValue().TermTypeList || []).join(','),
        BuildingList: (frm.getRawValue().BuildingList || []).join(','),

      } as TLS32040Request;

      this.btnPDFLoading = true;
      this.tls32040Service.exportTLS32040PDF(formValue).pipe(finalize(() => this.btnPDFLoading = false), untilDestroyed(this))
        .subscribe(blob => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            globalThis.open(blobUrl, '_blank');
          }
        });
    } else {
      const formValue = {
        ...frm.getRawValue(),

        ReportType: this.dateForm.get('reportType')?.value, // 從日期表單抓
        BaseDateFrom: formatDate(frm.getRawValue().BaseDateFrom, 'yyyy-MM-dd', 'en-US'),
        BaseDateTo: formatDate(frm.getRawValue().BaseDateTo, 'yyyy-MM-dd', 'en-US'),
        CompareDateFrom: formatDate(frm.getRawValue().CompareDateFrom, 'yyyy-MM-dd', 'en-US'),
        CompareDateTo: formatDate(frm.getRawValue().CompareDateTo, 'yyyy-MM-dd', 'en-US'),
        FloorList: (frm.getRawValue().FloorList || []).join(','),
        AreaList: (frm.getRawValue().AreaList || []).join(','),

        BusTypeList: (frm.getRawValue().BusTypeList),
        BusClassList: (frm.getRawValue().BusClassList || []).map((item: any) => ({
          BusType: item.bus_type ?? '',
          BusClass: item.No ?? ''
        })),
        BusSClassList: (frm.getRawValue().BusSClassList || []).map((item: any) => ({
          BusType: item.bus_type ?? '',
          BusClass: item.CAT_MNo ?? '',
          BusSClass: item.No ?? ''
        })),

        TltKindList: (frm.getRawValue().TltKindList || []).join(','),
        OrgList: (frm.getRawValue().OrgList || []).join(','),
        TltNoList: (frm.getRawValue().TltNoList || []).join(','),
        TermTypeList: (frm.getRawValue().TermTypeList || []).join(','),
        BuildingList: (frm.getRawValue().BuildingList || []).join(','),

      } as TLS32040Request;

      this.btnExcelLoading = true;
      this.tls32040Service.exportTLS32040Excel(formValue).pipe(finalize(() => this.btnExcelLoading = false), untilDestroyed(this))
        .subscribe(blob => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);

            // ⭐ 建議加下載功能
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = '組織業績總表.xlsx'; // 可以依需求改檔名
            a.click();
            URL.revokeObjectURL(blobUrl);
          }
        });
    }
  }

  // #region 呼叫圖檔(這邊先不用做，既有規格有，新版規格沒有)
  onChart(frm: FormGroup) {
    const formValue = {
      ...frm.getRawValue(),

      Year: formatDate(frm.getRawValue().BaseDateFrom, 'yyyy', 'en-US'), //圖表要抓年分

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
    } as TLS32040ChartRequest
    this.tls32040Service.queryTLS32040Chart(formValue).pipe(finalize(() => this.loading = false), untilDestroyed(this))
      .subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (res.Data) {
          const chartData = this.buildLineChartData(res.Data);
          this.chartData = chartData;   // 綁定資料
          this.initChart();     // 初始化 options
          console.log('圖表資料', chartData);
        }
      });
  }

  /** ------------------------------------------
   * PrimeNG 官方樣式格式
   * ------------------------------------------ */
  private initChart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.chart_options = {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };

    this.cd.markForCheck();
  }

  // 圖檔格式化
  private buildLineChartData(rows: TLS32040ChartResponse[]) {
    // 建立 1~12 月的 labels
    const labels = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);

    // grouped[OrgName][Month] = SaleAmt
    const grouped: Record<string, Record<number, number>> = {};

    rows.forEach(r => {
      if (!grouped[r.OrgName]) grouped[r.OrgName] = {};
      grouped[r.OrgName][r.SaleMonth] = r.SaleAmt;
    });

    // 產生 datasets
    const datasets = Object.keys(grouped).map((orgName) => {
      return {
        label: orgName,
        data: labels.map((_, monthIndex) => {
          return grouped[orgName][monthIndex + 1] ?? 0; // 沒資料補 0
        }),
        tension: 0.3,
        borderWidth: 2,
        fill: false
      };
    });

    return { labels, datasets };
  }

  // #region 日期選單事件
  // 依年度+週數帶出日期範圍；base = 左側 dateForm、compare = 右側 c_dateForm，各自獨立不互相覆蓋
  queryWeek(target: 'base' | 'compare') {
    const form = target === 'base' ? this.dateForm : this.c_dateForm;
    const year = form.controls.onedateyy.value;
    const weeks = form.controls.weeks.value;
    if (!year || !weeks) return;

    const payload = {
      onedateyy: this.datePipe.transform(year, 'yyyy') ?? '',
      weeks,
    };

    this.tls26050Service.queryTLS26050Week(payload).pipe(untilDestroyed(this)).subscribe((response) => {
      const week = response.Data?.[0];
      form.controls.startdate.setValue(week?.WeekStart ? new Date(week.WeekStart) : null);
      form.controls.enddate.setValue(week?.WeekEnd ? new Date(week.WeekEnd) : null);
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
      case 'DAY': // 日營業報表
        this.dateForm.get('onedatedd')?.setValidators([Validators.required]);
        this.c_dateForm.get('onedatedd')?.setValidators([Validators.required]);
        break;
      case 'WEEK': // 週營業報表
        this.dateForm.get('onedateyy')?.setValidators([Validators.required]);
        this.dateForm.get('weeks')?.setValidators([Validators.required]);
        this.dateForm.get('startdate')?.setValidators([Validators.required]);
        this.dateForm.get('enddate')?.setValidators([Validators.required]);

        this.c_dateForm.get('onedateyy')?.setValidators([Validators.required]);
        this.c_dateForm.get('weeks')?.setValidators([Validators.required]);
        this.c_dateForm.get('startdate')?.setValidators([Validators.required]);
        this.c_dateForm.get('enddate')?.setValidators([Validators.required]);
        break;
      case 'MONTH': // 月營業報表
        this.dateForm.get('onedatemm')?.setValidators([Validators.required]);
        this.c_dateForm.get('onedatemm')?.setValidators([Validators.required]);
        break;
      case 'HALFYEAR': // 半年營業報表
        this.dateForm.get('halfyear_onedateyy')?.setValidators([Validators.required]);
        this.c_dateForm.get('halfyear_onedateyy')?.setValidators([Validators.required]);
        break;
      case 'YEAR': // 年營業報表
        this.dateForm.get('year_onedateyy')?.setValidators([Validators.required]);
        this.c_dateForm.get('year_onedateyy')?.setValidators([Validators.required]);
        break;
      case 'SAD': // 區間營業報表
        this.dateForm.get('sad_startdate')?.setValidators([Validators.required]);
        this.dateForm.get('sad_enddate')?.setValidators([Validators.required]);
        this.c_dateForm.get('sad_startdate')?.setValidators([Validators.required]);
        this.c_dateForm.get('sad_enddate')?.setValidators([Validators.required]);
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
    //---

    switch (reportType) {
      case 'DAY': // 日報
        // 1. 取得基準日
        start = this.dateForm.get('onedatedd')?.value ?? null;
        end = start;

        // 2. 計算比較日 (基準日的前一天)
        if (start) {
          // 必須 new Date() 避免直接修改到基準日的物件參考
          const baseDate = new Date(start);
          const prevDay = new Date(baseDate);
          prevDay.setDate(baseDate.getDate() - 1);

          compareStart = prevDay;
          compareEnd = prevDay;

          // 3. 更新比較表單的顯示數值 (使用 { emitEvent: false } 避免觸發 syncCDateToQueryForm 造成的重複計算)
          this.c_dateForm.get('onedatedd')?.setValue(compareStart, { emitEvent: false });
        }
        break;

      case 'WEEK': // 週報
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

          // emitEvent: false：只更新右側顯示，避免觸發右側年度監聽重查週別 API
          this.c_dateForm.patchValue({
            onedateyy: compareYearDate,
            weeks: compareWeek,
            startdate: compareStart,
            enddate: compareEnd,
          }, { emitEvent: false });
        }
        break;

      case 'MONTH': { // 月報
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

      case 'HALFYEAR': { // 半年報
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

      case 'YEAR': { // 年報
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

      case 'SAD': // 區間報：直接分別取用 dateForm / c_dateForm 的日期，不鎖定也不自動帶入
        start = this.dateForm.get('sad_startdate')?.value as Date | null;
        end = this.dateForm.get('sad_enddate')?.value as Date | null;
        compareStart = this.c_dateForm.get('sad_startdate')?.value as Date | null;
        compareEnd = this.c_dateForm.get('sad_enddate')?.value as Date | null;
        break;
    }

    // 套用到 queryForm
    if (start) this.queryForm.get('BaseDateFrom')?.setValue(start);
    if (end) this.queryForm.get('BaseDateTo')?.setValue(end);

    // ----- 寫入比較日期 -----
    this.queryForm.get('CompareDateFrom')?.setValue(compareStart);
    this.queryForm.get('CompareDateTo')?.setValue(compareEnd);

    // console.log('比較日期(起)', this.queryForm.get('CompareDateFrom')?.value);
    // console.log('比較日期(迄)', this.queryForm.get('CompareDateTo')?.value);
  }

  // 用戶輸入的比較表單也同步到主表
  private syncCDateToQueryForm(): void {
    const type = this.dateForm.get('reportType')?.value; //這邊要抓主表的reportType

    let compareStart: Date | null = null;
    let compareEnd: Date | null = null;

    switch (type) {
      case 'DAY': { // 日報
        const d = this.c_dateForm.controls.onedatedd.value;
        compareStart = d;
        compareEnd = d;
        break;
      }

      case 'WEEK': { // 週報：日期範圍由 queryWeek('compare') 呼叫週別 API 帶出，與左側同一套週數定義
        compareStart = this.c_dateForm.controls.startdate.value;
        compareEnd = this.c_dateForm.controls.enddate.value;
        break;
      }

      case 'MONTH': { // 月報
        const m = this.c_dateForm.controls.onedatemm.value;
        if (m) {
          // 計算該月的第一天和最後一天
          const monthDate = new Date(m);
          compareStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          compareEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        }
        break;
      }

      case 'HALFYEAR': { // 半年報
        const yearValue = this.c_dateForm.controls.halfyear_onedateyy.value;
        const year = yearValue instanceof Date ? yearValue.getFullYear() : Number(yearValue);
        const half = String(this.c_dateForm.controls.halfyear.value);

        if (year && half) {
          if (half === '1') { // 上半年
            compareStart = new Date(year, 0, 1);      // 1/1
            compareEnd = new Date(year, 5, 30);        // 6/30
          } else if (half === '2') { // 下半年
            compareStart = new Date(year, 6, 1);       // 7/1
            compareEnd = new Date(year, 11, 31);       // 12/31
          }
        }
        break;
      }

      case 'YEAR': { // 年報
        const yearValue = this.c_dateForm.controls.year_onedateyy.value;
        const year = yearValue instanceof Date ? yearValue.getFullYear() : Number(yearValue);

        if (year) {
          compareStart = new Date(year, 0, 1);         // 1/1
          compareEnd = new Date(year, 11, 31);         // 12/31
        }
        break;
      }

      case 'SAD': { // 區間報
        compareStart = this.c_dateForm.controls.sad_startdate.value;
        compareEnd = this.c_dateForm.controls.sad_enddate.value;
        break;
      }
    }

    // 更新到 queryForm
    this.queryForm.controls.CompareDateFrom.setValue(compareStart);
    this.queryForm.controls.CompareDateTo.setValue(compareEnd);

    // console.log('比較日期(起)', compareStart);
    // console.log('比較日期(迄)', compareEnd);
  }

  //清除日期查詢條件
  onClearDate() {
    //dateForm設定為日營業報，日期今天
    this.dateForm.reset({
      reportType: 'DAY',
      onedatedd: today,
    });

    //c_dateForm設定為日營業報，日期昨天
    this.c_dateForm.reset({
      reportType: 'DAY',
      onedatedd: yesterday,
    });

    // 2. 手動觸發一次驗證與同步，確保畫面與 queryForm 狀態正確
    this.onReportTypeChange('DAY');
    this.setReadOnlyFields();
    this.syncDateToQueryForm();
  }

  //能否顯示明細的row控制項

  onDetail1(event: TLS32040Response) {
    if (event.RowType === 'TEAM' && this.historyRequestBody) {
      this.selectedRow = event;
      this.dialogVisible = true;
    } else {
      this.messageService.infoBubble('非合計欄位才可查看明細');
    }
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

  setColumns() {
    const isPreSale = this.queryForm.get('PreSale')?.value === true;
    const isConsumerNum = this.queryForm.get('ConsumerNum')?.value === true;

    const visibleMap: Record<string, boolean> = {
      // 預售實績 3 欄
      Base_PrePerformance: isPreSale,
      Comp_PrePerformance: isPreSale,
      Diff_PrePerformance: isPreSale,

      // 消費人數 3 欄
      Base_ConsumerNum: isConsumerNum,
      Comp_ConsumerNum: isConsumerNum,
      Diff_ConsumerNum: isConsumerNum,

      // 消費客單 3 欄
      Base_ConsumerOrder: isConsumerNum,
      Comp_ConsumerOrder: isConsumerNum,
      Diff_ConsumerOrder: isConsumerNum,
    };

    this.columns = this.columns.map(col => ({
      ...col,
      visible: visibleMap[col.field] ?? col.visible
    }));
  }
}
