import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FloorService } from '@service/basic/querySYS3900.service';
import { RegionService } from '@service/basic/querySYS3A00.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { AccordionModule } from 'primeng/accordion';
import { debounceTime, finalize } from 'rxjs';
import { TLS32030Data, TLS32030Service } from '../../../service/api/tls/tls32030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls32030',
  templateUrl: './tls32030.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, TableComponent, TranslateModule, RadiobuttonComponent, CalendarComponent, InputNumberComponent, DropdownComponent, NgIf, MultiSelectComponent, CalendarRangeQuickComponent]
})
export class TLS32030Component extends BasicQueryPageComponent<TLS32030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    // 日期查詢條件（單選報表類型）
    reportType: ['1', [Validators.required]], // 報表類型
    floor: [null], // 樓層
    region: [null], // 區域
    bus_type: [null], // 大分類
    bus_class: [null], // 中分類
    tlt_kind: [null], // 櫃別
    org_id: [null], // 組織代號
    tlt_term_type: [null], // 抽成別
    onedatedd: ['2024/12/12', [Validators.required]], // 日期（日報表）
    onedatedd_c: [null, [Validators.required]], // 比較日期（日報表）
    onedateyy: [null, [Validators.required]], // 年度（週/半年/年報表）
    weeks: [null], // 週數
    onedatemm: [null, [Validators.required]], // 年月（月報表）
    halfyear_onedateyy: [null, [Validators.required]], // 半年報表年度
    halfyear: [null], // 半年別
    year_onedateyy: [null, [Validators.required]], // 年報表年度
    startdate: [null, [Validators.required]], // 開始日期
    enddate: [null, [Validators.required]], // 結束日期
    onedateyy_c: [null, [Validators.required]], // 比較年度（週報表）
    weeks_c: [null], // 比較週數
    startdate_c: [null, [Validators.required]], // 比較開始日期（週報表用）
    enddate_c: [null, [Validators.required]], // 比較結束日期（週報表用）
    onedatemm_c: [null, [Validators.required]], // 比較年月（月報表）
    halfyear_onedateyy_c: [null, [Validators.required]], // 比較半年報表年度
    halfyear_c: [null], // 比較半年別
    year_onedateyy_c: [null, [Validators.required]], // 比較年報表年度
    sad_startdate: [null, [Validators.required]], // 區間開始日期
    sad_enddate: [null, [Validators.required]], // 區間結束日期
    sad_startdate_c: [null, [Validators.required]], // 比較區間開始日期
    sad_enddate_c: [null, [Validators.required]], // 比較區間結束日期
    eventID: [null], // 活動ID
    event_startdate: [null], // 活動開始日期
    event_enddate: [null], // 活動結束日期
    eventID_c: [null], // 比較活動ID
    event_startdate_c: [null], // 比較活動開始日期
    event_enddate_c: [null], // 比較活動結束日期
    tlt_no: [null], // 專櫃編號
    tax: [true], // 是否含稅
    tlt_building: [null], // 館別
    issue: ['2'], // 是否開立業主發票
    onedate_Startd_c: [null, [Validators.required]], // 比較日期起
    onedate_End: [null, [Validators.required]], // 比較日期迄
    onedatedd_c_Start: [null, [Validators.required]], // 比較日期起（日報表）
    onedatedd_c_End: [null, [Validators.required]], // 比較日期迄（日報表）
    onedate_Start: [null, [Validators.required]], // 比較日期起（週/半年/年報表）
    ...createPaginationConfig([{ field: 'team_name', order: -1 }])
  });

  totalRecords = 0;
  data: TLS32030Data[] = [];
  selectedItems: TLS32030Data[] = [];

  columnGroup = [
    { header: '單位', field: 'unit' },
    { header: '比較', field: 'compare' },
    { header: '基準', field: 'baseline' },
    { header: '成長率', field: 'growthRate' },
    { header: '差異', field: 'difference' },
  ];

  columns: Column[] = [
    // 基本資訊欄位
    { field: 'building', header: '館別', groupField: 'unit' },
    { field: 'organization', header: '組織', groupField: 'unit' },
    { field: 'counterType', header: '櫃別', groupField: 'unit' },
    { field: 'counterNumber', header: '專櫃編號', groupField: 'unit' },
    { field: 'counterName', header: '專櫃名稱', groupField: 'unit' },

    // 比較欄位群組 (2024/05/14)
    { field: 'compare_salesAmount', header: '銷售金額', groupField: 'compare' },
    { field: 'compare_salesCount', header: '銷售筆數', groupField: 'compare' },
    { field: 'compare_customerCount', header: '來客數', groupField: 'compare' },
    { field: 'compare_unitPrice', header: '日坪效', groupField: 'compare' },
    { field: 'compare_conversionRate', header: '達成率', groupField: 'compare' },
    { field: 'compare_averageSpend', header: '客單價', groupField: 'compare' },
    { field: 'compare_position', header: '位置排名', groupField: 'compare' },

    // 基準欄位群組 (2024/05/13)
    { field: 'baseline_salesAmount', header: '銷售金額', groupField: 'baseline' },
    { field: 'baseline_salesCount', header: '銷售筆數', groupField: 'baseline' },
    { field: 'baseline_customerCount', header: '來客數', groupField: 'baseline' },
    { field: 'baseline_unitPrice', header: '日坪效', groupField: 'baseline' },
    { field: 'baseline_conversionRate', header: '達成率', groupField: 'baseline' },
    { field: 'baseline_averageSpend', header: '客單價', groupField: 'baseline' },
    { field: 'baseline_position', header: '位置排名', groupField: 'baseline' },

    // 成長率欄位群組
    { field: 'growth_salesAmount', header: '銷售金額', groupField: 'growthRate' },
    { field: 'growth_salesCount', header: '銷售筆數', groupField: 'growthRate' },
    { field: 'growth_customerCount', header: '來客數', groupField: 'growthRate' },
    { field: 'growth_unitPrice', header: '日坪效', groupField: 'growthRate' },
    { field: 'growth_conversionRate', header: '達成率', groupField: 'growthRate' },
    { field: 'growth_averageSpend', header: '客單價', groupField: 'growthRate' },
    { field: 'growth_position', header: '位置排名', groupField: 'growthRate' },

    // 差異欄位群組
    { field: 'diff_salesAmount', header: '銷售金額', groupField: 'difference' },
    { field: 'diff_salesCount', header: '銷售筆數', groupField: 'difference' },
    { field: 'diff_customerCount', header: '來客數', groupField: 'difference' },
    { field: 'diff_unitPrice', header: '日坪效', groupField: 'difference' },
    { field: 'diff_conversionRate', header: '達成率', groupField: 'difference' },
    { field: 'diff_averageSpend', header: '客單價', groupField: 'difference' },
    { field: 'diff_position', header: '位置排名', groupField: 'difference' }
  ];

  //#region 選項
  bus_type_Option: IDropdownItem[] = []; // 大分類
  bus_class_Option: IDropdownItem[] = []; // 中分類
  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  commissionTypeOptions = getSYS1000Options('tlt_term_type');
  typeOptions: any[] = [];
  counterCodeOptions = this.dropdown.queryTltTalent();
  taxOptions: any[] = [
    { value: true, label: '含稅' },
    { value: false, label: '未稅' }
  ];
  operationsOptions = getSYS1000Options('store_way');

  reportTypeOptions: any[] = [
    { value: '1', label: '日營業報表' },
    { value: '2', label: '週營業報表' },
    { value: '3', label: '月營業報表' },
    { value: '4', label: '半年營業報表' },
    { value: '5', label: '年營業報表' },
    { value: '6', label: '區間營業報表' },
    { value: '7', label: '活動區間營業報表' },
  ];
  EventIDOptions: any[] = [
    { value: '1', label: '活動1' },
    { value: '2', label: '活動2' },
  ];
  halfyearOptions: any[] = [
    { value: '1', label: '上半年' },
    { value: '2', label: '下半年' },
  ];
  BUILDING_NO_Options: any[] = [];
  issueOptions: any[] = [
    { value: '0', label: '是' },
    { value: '1', label: '否' },
    { value: '2', label: '全部' },
  ];
  //#endregion

  constructor(
    private readonly dropdown: DropdownApiService,
    private tls32030Service: TLS32030Service,
    private floorService: FloorService,
    private regionService: RegionService,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS32030', 'tls/tls32030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
    // 初始化日期預設值
    this.setDateDefaults(this.queryForm.controls.reportType.value);
    // 當使用者切換報表類型時自動帶入相對應預設日期
    (this.queryForm.controls.reportType.valueChanges as unknown as import('rxjs').Observable<string | null>)
      .pipe(untilDestroyed(this))
      .subscribe((value: string | null) => this.setDateDefaults(value));
    this.dropDownListService.queryTLTBUSTYPE_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.bus_type_Option = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    });
    (this.queryForm.controls.bus_type.valueChanges as unknown as import('rxjs').Observable<string[]>)
      .pipe(debounceTime(300), untilDestroyed(this))
      .subscribe((value: string[]) => {
        if (value && value.length > 0) {
          this.dropDownListService.queryTLTBUSCLASS_DropDownList({ bus_type: value }).pipe(untilDestroyed(this)).subscribe(response => {
            const groupedData = response.Data.reduce((accumulator, currentItem) => {
              const groupKey = currentItem.bus_type || '';
              if (!accumulator[groupKey]) {
                accumulator[groupKey] = {
                  label: `${currentItem.bus_type} - ${currentItem.bus_type_name}`, // <-- 修正這裡！
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
            console.log(this.bus_class_Option);

          });
        } else {
          this.bus_class_Option = [];
        }
      });
  }

  private setDateDefaults(reportType: string | null) {
    const rt = reportType ?? '1';
    const today = new Date();
    const toStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const addDays = (d: Date, days: number) => {
      const r = new Date(d);
      r.setDate(r.getDate() + days);
      return r;
    };
    const startOfWeek = (d: Date) => {
      // 以週一為一週起始(day 1)，回傳週一
      const day = d.getDay(); // 0 Sunday, 1 Monday ...
      const diff = (day === 0) ? -6 : 1 - day; // 若為 Sunday(0) 則往前推6天至 Monday
      return addDays(toStartOfDay(d), diff);
    };
    const endOfWeek = (d: Date) => addDays(startOfWeek(d), 6);
    const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
    const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

    switch (rt) {
      case '1': // 日營業報表
        (this.queryForm.get('onedate_Start') as FormControl).setValue(toStartOfDay(today));
        (this.queryForm.get('onedate_End') as FormControl).setValue(toStartOfDay(today));
        const yesterday = addDays(toStartOfDay(today), -1);
        (this.queryForm.get('onedatedd_c_Start') as FormControl).setValue(yesterday);
        (this.queryForm.get('onedatedd_c_End') as FormControl).setValue(yesterday);
        break;
      case '2': // 週營業報表
        const sWeek = startOfWeek(today);
        const eWeek = endOfWeek(today);
        (this.queryForm.get('startdate') as FormControl).setValue(sWeek);
        (this.queryForm.get('enddate') as FormControl).setValue(eWeek);
        const prevSWeek = addDays(sWeek, -7);
        const prevEWeek = addDays(eWeek, -7);
        (this.queryForm.get('startdate_c') as FormControl).setValue(prevSWeek);
        (this.queryForm.get('enddate_c') as FormControl).setValue(prevEWeek);
        break;
      case '3': // 月營業報表
        const sMonth = startOfMonth(today);
        const prevMonthDate = addDays(sMonth, -1); // 上月最後一天
        const prevMonthFirst = startOfMonth(prevMonthDate);
        (this.queryForm.get('onedatemm') as FormControl).setValue(sMonth);
        (this.queryForm.get('onedatemm_c') as FormControl).setValue(prevMonthFirst);
        break;
      case '4': // 半年營業報表
        const month = today.getMonth() + 1; // 1-12
        if (month <= 6) {
          // 當前為上半年，基準為今年上半年，比較為去年下半年
          (this.queryForm.get('halfyear_onedateyy') as FormControl).setValue(new Date(today.getFullYear(), 0, 1));
          (this.queryForm.get('halfyear') as FormControl).setValue('1');
          (this.queryForm.get('halfyear_onedateyy_c') as FormControl).setValue(new Date(today.getFullYear() - 1, 0, 1));
          (this.queryForm.get('halfyear_c') as FormControl).setValue('2');
        } else {
          // 當前為下半年，基準為今年下半年，比較為今年上半年
          (this.queryForm.get('halfyear_onedateyy') as FormControl).setValue(new Date(today.getFullYear(), 0, 1));
          (this.queryForm.get('halfyear') as FormControl).setValue('2');
          (this.queryForm.get('halfyear_onedateyy_c') as FormControl).setValue(new Date(today.getFullYear(), 0, 1));
          (this.queryForm.get('halfyear_c') as FormControl).setValue('1');
        }
        break;
      case '5': // 年營業報表
        (this.queryForm.get('year_onedateyy') as FormControl).setValue(new Date(today.getFullYear(), 0, 1));
        (this.queryForm.get('year_onedateyy_c') as FormControl).setValue(new Date(today.getFullYear() - 1, 0, 1));
        break;
      default:
        break;
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls32030Service.queryTLS32030(frm.getRawValue())
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  // 載入下拉選項
  loadOptions() {
    // 樓層下拉選項
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    // 區域下拉選項
    this.regionService.getRegionOptions().subscribe(data => {
      this.regionOptions = data.map(item => ({
        ...item,
        value: typeof item.value === 'number' ? item.value.toString() : item.value
      }));
    });


  }
}
