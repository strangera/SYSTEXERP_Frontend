import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { formatAmount, formatPercentage } from '@others/component/table/table.model';
import { TLS26050Service } from '@service/api/tls/tls26050.service';
import { TLS32050Request, TLS32050Response, TLS32050Service } from '@service/api/tls/tls32050.service';
import { DropDownListService, IDropdownItem, ITLTBUSSCLASSInfo } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ColumnGroup, formatAmountWithDecimals, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { debounceTime, finalize, map, of, switchMap, tap } from 'rxjs';
import { yesterday } from 'src/app/shared/models/system/query-form.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { Tls32050CRUComponent } from './tls32050-cru/tls32050-cru.component';

@Component({
  selector: 'app-tls32050',
  templateUrl: './tls32050.component.html',
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
    MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CommonModule,
    CalendarComponent, CalendarRangeComponent, DropdownComponent, InputTextComponent,
    ButtonComponent, TableModule, TableReportComponent, RadiobuttonComponent,
    TranslateModule, MultiSelectComponent, ButtonModule, CheckboxModule, Tls32050CRUComponent,
  ]
})
export class TLS32050Component extends BasicQueryPageComponent<TLS32050Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    BaseDateFrom: [new Date()],      // 交易日期開始
    BaseDateTo: [new Date()],        // 交易日期結束
    CompareDateFrom: [yesterday as Date | null], // 比較日期開始
    CompareDateTo: [yesterday as Date | null],   // 比較日期結束
    // 合約查詢條件
    FloorList: [[]],                 // 樓層
    AreaList: [[]],                  // 區域
    BusTypeList: [[] as string[]],   // 大分類
    BusClassList: [[] as IDropdownItem[]],  // 中分類
    BusSClassList: [[] as IDropdownItem[]], // 小分類
    TltKindList: [[]],               // 櫃別 (1.正櫃 2.臨時櫃 3.特賣會 4.虛擬櫃)
    OrgList: [[]],                   // 組織
    TltNoList: [[]],                 // 專櫃編號
    TermTypeList: [[]],              // 抽成別
    BuildingList: [[]],              // 館別
    AmtTaxMode: ["G"],               // 銷售金額是否含稅 (G:含稅 N:未稅)
    ReceFilter: ['A'],               // 是否開立業主發票 (Y:是 N:否 A:全部)
    PreSale: [false],                // 是否顯示預售欄位
    ConsumerNum: [false],            // 是否顯示消費人數/客單欄位
    pageSize: [20],
    pageIndex: [1],
  });

  // 日期查詢條件表單
  dateForm = this.formBuilder.nonNullable.group({
    reportType: ['1'],
    onedatedd: [new Date()],
    onedateyy: [new Date()],
    weeks: [''],
    startdate: [null as Date | null],
    enddate: [null as Date | null],
    onedatemm: [null],
    halfyear_onedateyy: [new Date()],
    halfyear: ['1'],
    year_onedateyy: [new Date()],
    sad_startdate: [null],
    sad_enddate: [null],
    eventID: [null],
    event_startdate: [null as Date | null],
    event_enddate: [null as Date | null],
  });

  c_dateForm = this.formBuilder.nonNullable.group({
    reportType: ['1'],
    onedatedd: [yesterday as Date | null],
    onedateyy: [new Date()],
    weeks: [''],
    startdate: [null as Date | null],
    enddate: [null as Date | null],
    onedatemm: [null as Date | null],
    halfyear_onedateyy: [new Date()],
    halfyear: ['1' as string | null],
    year_onedateyy: [new Date()],
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
    { value: '1', label: '日營業報表' },
    { value: '2', label: '週營業報表' },
    { value: '3', label: '月營業報表' },
    { value: '4', label: '半年營業報表' },
    { value: '5', label: '年營業報表' },
    { value: '6', label: '區間營業報表' },
  ];

  totalRecords = 0;
  data: TLS32050Response[] = [];
  historyRequestBody: TLS32050Request | null = null;
  dialogVisible = false;
  selectedRow: TLS32050Response | null = null;

  isPreSale = this.queryForm.get('PreSale')?.value ?? false;
  isConsumerNum = this.queryForm.get('ConsumerNum')?.value ?? false;

  // 1. 重構 ReportColumn 清單，納入 9 個動態預售與消費欄位
  columns: ReportColumn[] = [
    { field: 'BuildingName', header: '館別', visible: true, align: 'left', width: '35px' },
    { field: 'TeamId', header: '單位代碼', visible: true, align: 'left', width: '50px' },
    { field: 'TeamName', header: '單位名稱', visible: true, align: 'left', width: '100px' },
    { field: 'OrgId', header: '樓組代碼', visible: true, align: 'left', width: '50px' },
    { field: 'OrgName', header: '樓組名稱', visible: true, align: 'left', width: '100px' },
    { field: 'TltKindName', header: '櫃別名稱', visible: true, align: 'left', width: '100px' },
    { field: 'Bus_Class', header: '中分類代碼', visible: true, align: 'left', width: '15px' },
    { field: 'BusClassName', header: '中分類名稱', visible: true, align: 'left' },

    // ================= 本期 Group =================
    { field: 'Base_Target', header: '本期銷售目標', visible: true, format: formatAmount, align: 'right', width: '100px', groupField: '本期' },
    { field: 'Base_SaleAmt', header: '本期銷售金額', visible: true, format: formatAmount, align: 'right', width: '100px', groupField: '本期' },
    { field: 'Base_AchieveRate', header: '本期達成率', visible: true, format: (value) => formatPercentage(value, 2), align: 'right', groupField: '本期' },
    { field: 'Base_TxnCnt', header: '本期交易筆數', visible: true, format: formatAmount, align: 'right', groupField: '本期' },
    { field: 'Base_AvgTicket', header: '本期客單價', visible: true, format: formatAmount, align: 'right', groupField: '本期' },
    { field: 'Base_PrePerformance', header: '本期預售實績', visible: this.isPreSale, format: formatAmount, align: 'right', groupField: '本期' },
    { field: 'Base_ConsumerNum', header: '本期消費人數', visible: this.isConsumerNum, format: formatAmount, align: 'right', groupField: '本期' },
    { field: 'Base_ConsumerOrder', header: '本期消費客單', visible: this.isConsumerNum, format: formatAmount, align: 'right', groupField: '本期' },

    // ================= 上期 Group =================
    { field: 'Comp_SaleAmt', header: '上期銷售金額', visible: true, format: formatAmount, align: 'right', width: '100px', groupField: '上期' },
    { field: 'Comp_TxnCnt', header: '上期交易筆數', visible: true, format: formatAmount, align: 'right', groupField: '上期' },
    { field: 'Comp_AvgTicket', header: '上期客單價', visible: true, format: formatAmount, align: 'right', groupField: '上期' },
    { field: 'Comp_PrePerformance', header: '上期預售實績', visible: this.isPreSale, format: formatAmount, align: 'right', groupField: '上期' },
    { field: 'Comp_ConsumerNum', header: '上期消費人數', visible: this.isConsumerNum, format: formatAmount, align: 'right', groupField: '上期' },
    { field: 'Comp_ConsumerOrder', header: '上期消費客單', visible: this.isConsumerNum, format: formatAmount, align: 'right', groupField: '上期' },

    // ================= 差異 Group =================
    { field: 'Growth_SaleAmtPct', header: '成長比', visible: true, format: (value) => formatPercentage(value, 2), align: 'right', groupField: '差異' },
    { field: 'Diff_SaleAmt', header: '銷售金額差異', visible: true, format: formatAmount, align: 'right', width: '100px', groupField: '差異' },
    { field: 'Diff_TxnCnt', header: '交易筆數差異', visible: true, format: formatAmount, align: 'right', groupField: '差異' },
    { field: 'Diff_AvgTicket', header: '客單價差異', visible: true, format: formatAmount, align: 'right', groupField: '差異' },
    { field: 'Diff_PrePerformance', header: '預售實績差異', visible: this.isPreSale, format: formatAmount, align: 'right', groupField: '差異' },
    { field: 'Diff_ConsumerNum', header: '消費人數差異', visible: this.isConsumerNum, format: formatAmount, align: 'right', groupField: '差異' },
    { field: 'Diff_ConsumerOrder', header: '消費客單差異', visible: this.isConsumerNum, format: formatAmount, align: 'right', groupField: '差異' },

    // ================= 坪效 Group =================
    { field: 'Space', header: '營業坪數', visible: true, format: (value) => formatAmountWithDecimals(value, 2), align: 'right', width: '100px', groupField: '坪效' },
    { field: 'Base_DaySpaceEff', header: '本期日平均坪效', visible: true, format: formatAmount, align: 'right', groupField: '坪效' },

    // 保留原預售金額獨立欄位 (依需求保留)
    { field: 'AVN_PreOrderAmt', header: '預售金額', visible: true, format: formatAmount, align: 'right' },
  ];

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
  ];
  tlt_term_type = [
    { value: "1", label: "固定租金" },
    { value: "2", label: "底租抽成取高者" },
    { value: "3", label: "一般抽成" },
    { value: "4", label: "包底抽成" },
    { value: "5", label: "層級抽成" },
    { value: "6", label: "包底加層級" },
  ];
  TaxType_Option = [
    { value: "G", label: "是" },
    { value: "N", label: "否" },
  ];
  ReceFilter_Option = [
    { value: "A", label: "全部" },
    { value: "Y", label: "是" },
    { value: "N", label: "否" },
  ];

  tlt_building_Option: IDropdownItem[] = [];
  tlt_floor_Option: IDropdownItem[] = [];
  area_no_Option: IDropdownItem[] = [];
  bus_type_Option: IDropdownItem[] = [];
  bus_class_Option: IDropdownItem[] = [];
  bus_sclass_Option: IDropdownItem[] = [];
  org_id_Option: IDropdownItem[] = [];
  tlt_no_id_Option: IDropdownItem[] = [];

  btnPDFLoading = false;
  btnExcelLoading = false;
  platformId = inject(PLATFORM_ID);

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls32050Service: TLS32050Service,
    private readonly tls26050Service: TLS26050Service,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS32050', 'TLS/TLS32050cru', this.queryForm, (frm) => this.onSubmit(frm));
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

    this.onReportTypeChange('1');
    this.setReadOnlyFields();

    const savedDate = this.queryStateService.getQueryStateValue('tls32050_Date');
    if (savedDate) {
      const dateVal = savedDate.value ? savedDate.value : savedDate;
      this.dateForm.patchValue(dateVal, { emitEvent: false });
    }

    const savedCDate = this.queryStateService.getQueryStateValue('tls32050_CDate');
    if (savedCDate) {
      const cDateVal = savedCDate.value ? savedCDate.value : savedCDate;
      this.c_dateForm.patchValue(cDateVal, { emitEvent: false });
    }

    this.syncDateToQueryForm();
    this.syncCDateToQueryForm();

    this.dateForm.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => { this.syncDateToQueryForm(); });

    this.c_dateForm.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => { this.syncCDateToQueryForm(); });

    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => { this.tlt_building_Option = res.Data; });
    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => { this.tlt_floor_Option = res.Data; });
    this.dropDownListService.querySYS3A00_DropDownList().pipe(untilDestroyed(this)).subscribe(res => { this.area_no_Option = res.Data; });
    this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.tlt_no_id_Option = res.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });

    this.dropDownListService.queryTLTBUSTYPE_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.bus_type_Option = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });

    this.queryForm.controls.BusTypeList.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value: string[]) => {
      if (value && value.length > 0) {
        this.dropDownListService.queryTLTBUSCLASS_DropDownList({ bus_type: value }).pipe(untilDestroyed(this)).subscribe(response => {
          const groupedData = response.Data.reduce((accumulator, currentItem) => {
            const groupKey = currentItem.bus_type || '';
            if (!accumulator[groupKey]) {
              accumulator[groupKey] = { label: currentItem.bus_type_name, items: [] };
            }
            accumulator[groupKey].items.push({ ...currentItem, label: `${currentItem.No} - ${currentItem.Name}` });
            return accumulator;
          }, {} as Record<string, any>);
          this.bus_class_Option = Object.values(groupedData);
        });
      } else {
        this.bus_class_Option = [];
        this.bus_sclass_Option = [];
        this.queryForm.controls.BusSClassList.setValue([]);
        this.queryForm.controls.BusClassList.setValue([]);
      }
    });

    this.queryForm.controls.BusClassList.valueChanges.pipe(
      debounceTime(300),
      untilDestroyed(this),
      map(selectedMValues => selectedMValues || []),
      switchMap((selectedMValues: IDropdownItem[]) => {
        if (selectedMValues.length === 0) {
          this.bus_sclass_Option = [];
          this.queryForm.controls.BusSClassList.setValue([]);
          return of({ selectedMValues: [], data: [] });
        }
        const queryTLTBUSSCLASSInfos: ITLTBUSSCLASSInfo[] = selectedMValues
          .filter(v => v && v.bus_type)
          .map(v => ({ bus_type: v.bus_type!, bus_class: v.No }));
        return this.dropDownListService.queryTLTBUSSCLASS_DropDownList_new({ queryTLTBUSSCLASSInfos }).pipe(
          map(res => ({ selectedMValues, data: res.Data }))
        );
      }),
      tap(result => { console.log('所有 API 呼叫結果：', result); })
    ).subscribe(result => {
      const groupedData = result.selectedMValues.reduce((accumulator, mValue) => {
        const groupKey = `${mValue.bus_type}_${mValue.No}`;
        const groupLabel = `${mValue.bus_type_name} - ${mValue.Name}`;
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
        const uniqueItemsMap = new Map<string, typeof items[0]>();
        items.forEach(item => {
          if (!uniqueItemsMap.has(item.No)) {
            uniqueItemsMap.set(item.No, item);
          }
        });
        accumulator[groupKey] = { label: groupLabel, items: Array.from(uniqueItemsMap.values()) };
        return accumulator;
      }, {} as Record<string, any>);
      this.bus_sclass_Option = Object.values(groupedData);
    });

    this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.org_id_Option = res.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });

    this.queryForm.get('PreSale')?.valueChanges.subscribe(() => { this.setColumns(); });
    this.queryForm.get('ConsumerNum')?.valueChanges.subscribe(() => { this.setColumns(); });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = {
        ...frm.getRawValue(),
        BaseDateFrom: formatDate(frm.getRawValue().BaseDateFrom, 'yyyy-MM-dd', 'en-US'),
        BaseDateTo: formatDate(frm.getRawValue().BaseDateTo, 'yyyy-MM-dd', 'en-US'),
        CompareDateFrom: formatDate(frm.getRawValue().CompareDateFrom, 'yyyy-MM-dd', 'en-US'),
        CompareDateTo: formatDate(frm.getRawValue().CompareDateTo, 'yyyy-MM-dd', 'en-US'),
        FloorList: (frm.getRawValue().FloorList || []).join(','),
        AreaList: (frm.getRawValue().AreaList || []).join(','),
        BusTypeList: (frm.getRawValue().BusTypeList),
        BusClassList: (frm.getRawValue().BusClassList || []).map((x: any) => [x.bus_type ?? '', x.No ?? '']),
        BusSClassList: (frm.getRawValue().BusSClassList || []).map((x: any) => [x.bus_type ?? '', x.bus_class ?? x.CAT_MNo ?? '', x.No ?? '']),
        TltKindList: (frm.getRawValue().TltKindList || []).join(','),
        OrgList: (frm.getRawValue().OrgList || []).join(','),
        TltNoList: (frm.getRawValue().TltNoList || []).join(','),
        TermTypeList: (frm.getRawValue().TermTypeList || []).join(','),
        BuildingList: (frm.getRawValue().BuildingList || []).join(','),
        PreSale: frm.getRawValue().PreSale,           // 補上 PreSale
        ConsumerNum: frm.getRawValue().ConsumerNum,   // 補上 ConsumerNum
      } as TLS32050Request;

      console.log('查詢請求', formValue);
      this.tls32050Service.queryTLS32050(formValue).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data ?? [];
        this.historyRequestBody = formValue;
        this.totalRecords = res.Data.length;
        console.log('主查詢結果', res.Data);
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        this.queryStateService.setQueryState('tls32050_Date', this.dateForm);
        this.queryStateService.setQueryState('tls32050_CDate', this.c_dateForm);
      });
    });
  }

  onReport(frm: FormGroup, isExcel: boolean) {
    if (this.dateForm.invalid) {
      this.messageService.errorBubble('基準資料為必填');
      return;
    }
    if (this.c_dateForm.invalid) {
      this.messageService.errorBubble('比較資料為必填');
      return;
    }

    const formValue = {
      ...frm.getRawValue(),
      ReportType: this.dateForm.get('reportType')?.value,
      BaseDateFrom: formatDate(frm.getRawValue().BaseDateFrom, 'yyyy-MM-dd', 'en-US'),
      BaseDateTo: formatDate(frm.getRawValue().BaseDateTo, 'yyyy-MM-dd', 'en-US'),
      CompareDateFrom: formatDate(frm.getRawValue().CompareDateFrom, 'yyyy-MM-dd', 'en-US'),
      CompareDateTo: formatDate(frm.getRawValue().CompareDateTo, 'yyyy-MM-dd', 'en-US'),
      FloorList: (frm.getRawValue().FloorList || []).join(','),
      AreaList: (frm.getRawValue().AreaList || []).join(','),
      BusTypeList: (frm.getRawValue().BusTypeList),
      BusClassList: (frm.getRawValue().BusClassList || []).map((x: any) => [x.bus_type ?? '', x.No ?? '']),
      BusSClassList: (frm.getRawValue().BusSClassList || []).map((x: any) => [x.bus_type ?? '', x.bus_class ?? x.CAT_MNo ?? '', x.No ?? '']),
      TltKindList: (frm.getRawValue().TltKindList || []).join(','),
      OrgList: (frm.getRawValue().OrgList || []).join(','),
      TltNoList: (frm.getRawValue().TltNoList || []).join(','),
      TermTypeList: (frm.getRawValue().TermTypeList || []).join(','),
      BuildingList: (frm.getRawValue().BuildingList || []).join(','),
      PreSale: frm.getRawValue().PreSale,           // 2. 匯出加入 PreSale 開關
      ConsumerNum: frm.getRawValue().ConsumerNum,   // 2. 匯出加入 ConsumerNum 開關
    } as TLS32050Request;

    if (isExcel) {
      this.btnExcelLoading = true;
      this.tls32050Service.exportTLS32050(formValue).pipe(finalize(() => this.btnExcelLoading = false), untilDestroyed(this))
        .subscribe(blob => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = '中分類業績報表.xlsx';
            a.click();
            URL.revokeObjectURL(blobUrl);
          }
        });
    } else {
      this.btnPDFLoading = true;
      this.tls32050Service.exportTLS32050PDF(formValue).pipe(finalize(() => this.btnPDFLoading = false), untilDestroyed(this))
        .subscribe(blob => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = '中分類業績報表.pdf';
            a.click();
            URL.revokeObjectURL(blobUrl);
          }
        });
    }
  }

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
    const reportType = event;
    Object.keys(this.dateForm.controls).forEach(key => {
      if (key !== 'reportType') {
        this.dateForm.get(key)?.clearValidators();
        this.c_dateForm.get(key)?.clearValidators();
      }
    });

    switch (reportType) {
      case '1':
        this.dateForm.get('onedatedd')?.setValidators([Validators.required]);
        this.c_dateForm.get('onedatedd')?.setValidators([Validators.required]);
        break;
      case '2':
        this.dateForm.get('onedateyy')?.setValidators([Validators.required]);
        this.dateForm.get('weeks')?.setValidators([Validators.required]);
        this.dateForm.get('startdate')?.setValidators([Validators.required]);
        this.dateForm.get('enddate')?.setValidators([Validators.required]);
        this.c_dateForm.get('onedateyy')?.setValidators([Validators.required]);
        this.c_dateForm.get('weeks')?.setValidators([Validators.required]);
        this.c_dateForm.get('startdate')?.setValidators([Validators.required]);
        this.c_dateForm.get('enddate')?.setValidators([Validators.required]);
        break;
      case '3':
        this.dateForm.get('onedatemm')?.setValidators([Validators.required]);
        this.c_dateForm.get('onedatemm')?.setValidators([Validators.required]);
        break;
      case '4':
        this.dateForm.get('halfyear_onedateyy')?.setValidators([Validators.required]);
        this.c_dateForm.get('halfyear_onedateyy')?.setValidators([Validators.required]);
        break;
      case '5':
        this.dateForm.get('year_onedateyy')?.setValidators([Validators.required]);
        this.c_dateForm.get('year_onedateyy')?.setValidators([Validators.required]);
        break;
      case '6':
        this.dateForm.get('sad_startdate')?.setValidators([Validators.required]);
        this.dateForm.get('sad_enddate')?.setValidators([Validators.required]);
        this.c_dateForm.get('sad_startdate')?.setValidators([Validators.required]);
        this.c_dateForm.get('sad_enddate')?.setValidators([Validators.required]);
        break;
      case '7':
        this.dateForm.get('event_startdate')?.setValidators([Validators.required]);
        this.dateForm.get('event_enddate')?.setValidators([Validators.required]);
        this.c_dateForm.get('event_startdate')?.setValidators([Validators.required]);
        this.c_dateForm.get('event_enddate')?.setValidators([Validators.required]);
        break;
    }

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

  queryEvent(event: any) {
    this.dateForm.controls['event_startdate'].setValue(this.EventIDOptions.find(x => x.value === event)?.BaseDateFrom ?? null);
    this.dateForm.controls['event_enddate'].setValue(this.EventIDOptions.find(x => x.value === event)?.BaseDateTo ?? null);
  }

  private syncDateToQueryForm() {
    const reportType = this.dateForm.get('reportType')?.value;
    let start: Date | null = null;
    let end: Date | null = null;
    let compareStart: Date | null = null;
    let compareEnd: Date | null = null;

    switch (reportType) {
      case '1':
        start = this.dateForm.get('onedatedd')?.value ?? null;
        end = start;
        if (start) {
          const baseDate = new Date(start);
          const prevDay = new Date(baseDate);
          prevDay.setDate(baseDate.getDate() - 1);
          compareStart = prevDay;
          compareEnd = prevDay;
          this.c_dateForm.get('onedatedd')?.setValue(compareStart, { emitEvent: false });
        }
        break;
      case '2':
        start = this.dateForm.get('startdate')?.value ?? null;
        end = this.dateForm.get('enddate')?.value ?? null;
        if (start) {
          compareStart = new Date(start as Date);
          compareStart.setDate((start.getDate() - 7) as number);
          compareEnd = new Date(compareStart);
          compareEnd.setDate(compareStart.getDate() + 6);
          const compareYear = compareEnd.getFullYear();
          const compareYearDate = new Date(compareYear, 0, 1);
          const compareWeek = this.getWeekNumber(compareEnd);
          this.c_dateForm.get('onedateyy')?.setValue(compareYearDate);
          this.c_dateForm.get('weeks')?.setValue(compareWeek);
          this.c_dateForm.get('startdate')?.setValue(compareStart);
          this.c_dateForm.get('enddate')?.setValue(compareEnd);
        }
        break;
      case '3': {
        const onedatemm = this.dateForm.get('onedatemm')?.value as Date | null;
        if (onedatemm) {
          start = new Date(onedatemm.getFullYear(), onedatemm.getMonth(), 1);
          end = new Date(onedatemm.getFullYear(), onedatemm.getMonth() + 1, 0);
          const compareMonth = new Date(onedatemm.getFullYear(), onedatemm.getMonth() - 1, 1);
          compareStart = new Date(compareMonth.getFullYear(), compareMonth.getMonth(), 1);
          compareEnd = new Date(compareMonth.getFullYear(), compareMonth.getMonth() + 1, 0);
          this.c_dateForm.get('onedatemm')?.setValue(compareStart);
        }
        break;
      }
      case '4': {
        const dateValue = this.dateForm.get('halfyear_onedateyy')?.value as Date | string;
        const year = dateValue instanceof Date ? dateValue.getFullYear() : Number(dateValue);
        const half = String(this.dateForm.get('halfyear')?.value);
        if (year) {
          if (half === '1') {
            start = new Date(year, 0, 1);
            end = new Date(year, 5, 30);
            compareStart = new Date(year - 1, 6, 1);
            compareEnd = new Date(year - 1, 11, 31);
            this.c_dateForm.get('halfyear_onedateyy')?.setValue(compareStart);
            this.c_dateForm.get('halfyear')?.setValue('2');
          } else if (half === '2') {
            start = new Date(year, 6, 1);
            end = new Date(year, 11, 31);
            compareStart = new Date(year, 0, 1);
            compareEnd = new Date(year, 5, 30);
            this.c_dateForm.get('halfyear_onedateyy')?.setValue(compareStart);
            this.c_dateForm.get('halfyear')?.setValue('1');
          }
        }
        break;
      }
      case '5': {
        const dateValue = this.dateForm.get('year_onedateyy')?.value as Date | string;
        const year = dateValue instanceof Date ? dateValue.getFullYear() : Number(dateValue);
        if (year) {
          start = new Date(year, 0, 1);
          end = new Date(year, 11, 31);
          compareStart = new Date(year - 1, 0, 1);
          compareEnd = new Date(year - 1, 11, 31);
          this.c_dateForm.get('year_onedateyy')?.setValue(compareStart);
        }
        break;
      }
      case '6': // 區間報：直接分別取用 dateForm / c_dateForm 的日期，不鎖定也不自動帶入
        start = this.dateForm.get('sad_startdate')?.value as Date | null;
        end = this.dateForm.get('sad_enddate')?.value as Date | null;
        compareStart = this.c_dateForm.get('sad_startdate')?.value as Date | null;
        compareEnd = this.c_dateForm.get('sad_enddate')?.value as Date | null;
        break;
    }

    if (start) this.queryForm.get('BaseDateFrom')?.setValue(start);
    if (end) this.queryForm.get('BaseDateTo')?.setValue(end);
    this.queryForm.get('CompareDateFrom')?.setValue(compareStart);
    this.queryForm.get('CompareDateTo')?.setValue(compareEnd);
  }

  private syncCDateToQueryForm(): void {
    const type = this.dateForm.get('reportType')?.value;
    let compareStart: Date | null = null;
    let compareEnd: Date | null = null;

    switch (type) {
      case '1': {
        const d = this.c_dateForm.controls.onedatedd.value;
        compareStart = d;
        compareEnd = d;
        break;
      }
      case '2': {
        const chooseYear = this.c_dateForm.get('onedateyy')?.value ?? null;
        const chooseWeeks = this.c_dateForm.get('weeks')?.value ?? null;
        if (chooseYear && chooseWeeks) {
          const yearNumber = chooseYear.getFullYear();
          const { weekStart, weekEnd } = this.getDateRangeByYearWeek(yearNumber, Number(chooseWeeks));
          this.queryForm.patchValue({ CompareDateFrom: weekStart, CompareDateTo: weekEnd });
        }
        break;
      }
      case '3': {
        const m = this.c_dateForm.controls.onedatemm.value;
        if (m) {
          const monthDate = new Date(m);
          compareStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          compareEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        }
        break;
      }
      case '4': {
        const yearValue = this.c_dateForm.controls.halfyear_onedateyy.value;
        const year = yearValue instanceof Date ? yearValue.getFullYear() : Number(yearValue);
        const half = String(this.c_dateForm.controls.halfyear.value);
        if (year && half) {
          if (half === '1') {
            compareStart = new Date(year, 0, 1);
            compareEnd = new Date(year, 5, 30);
          } else if (half === '2') {
            compareStart = new Date(year, 6, 1);
            compareEnd = new Date(year, 11, 31);
          }
        }
        break;
      }
      case '5': {
        const yearValue = this.c_dateForm.controls.year_onedateyy.value;
        const year = yearValue instanceof Date ? yearValue.getFullYear() : Number(yearValue);
        if (year) {
          compareStart = new Date(year, 0, 1);
          compareEnd = new Date(year, 11, 31);
        }
        break;
      }
      case '6': { // 區間報
        compareStart = this.c_dateForm.controls.sad_startdate.value;
        compareEnd = this.c_dateForm.controls.sad_enddate.value;
        break;
      }
    }

    this.queryForm.controls.CompareDateFrom.setValue(compareStart);
    this.queryForm.controls.CompareDateTo.setValue(compareEnd);
  }

  onClearDate() {
    this.dateForm.reset({ reportType: '1', onedatedd: new Date() });
    this.c_dateForm.reset({ reportType: '1', onedatedd: yesterday });
    this.onReportTypeChange('1');
    this.setReadOnlyFields();
    this.syncDateToQueryForm();
  }

  onDetail1(event: TLS32050Response) {
    if (event.RowType === 'TEAM' && this.historyRequestBody) {
      this.selectedRow = event;
      this.dialogVisible = true;
    } else {
      this.messageService.infoBubble('非合計欄位才可查看明細');
    }
  }

  getWeekNumber(d: Date) {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayNum = date.getDay() || 7;
    date.setDate(date.getDate() + 4 - dayNum);
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return String(weekNo);
  }

  getDateRangeByYearWeek(year: number, week: number) {
    const simple = new Date(year, 0, 4);
    const dayOfWeek = simple.getDay() || 7;
    const firstWeekMonday = new Date(simple);
    firstWeekMonday.setDate(simple.getDate() - dayOfWeek + 1);
    const weekStart = new Date(firstWeekMonday);
    weekStart.setDate(firstWeekMonday.getDate() + (week - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { weekStart, weekEnd };
  }

  // 3. 修正動態欄位切換邏輯
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