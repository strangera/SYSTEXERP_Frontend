import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, ColumnGroup, createPaginationConfig, formatAmount, formatPercentage } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { environment } from 'src/environments/environment';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { TLS31040PrintRequest, TLS31040Request, TLS31040Response, Tls31040Service } from '@service/api/tls/tls31040.service';

@Component({
  selector: 'app-tls31040',
  templateUrl: './tls31040.component.html',
  styleUrl: './tls31040.component.scss',
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
  ]
})

// 各櫃別之營業報表
export class TLS31040Component extends BasicQueryPageComponent<TLS31040Response> implements OnInit{
  queryForm = this.formBuilder.nonNullable.group({
    TXN_DateS: [yesterday, [Validators.required]],//交易日期_起
    TXN_DateE: [yesterday, [Validators.required]],//交易日期_迄
    // 合約查詢條件
    tlt_building: [[]],// 館別
    tlt_floor: [[]],// 樓層
    area_no: [[]],// 區域
    bus_type: [[] as string[]],//大分類
    bus_class: [[] as IDropdownItem[]],//中分類
    bus_sclass: [[] as IDropdownItem[]],//小分類
    tlt_kind: [[]], //櫃別 (1.正櫃 2.臨時櫃 3.特賣會 4.虛擬櫃)
    tlt_term_type: [[]], // 抽成別 1:固定租金 2:底租抽成取高者3:一般抽成     4:包底抽成     5:階梯式抽成   6:包底加階梯   "
    org_id: [[]],  // 組織
    TaxType: ["1"],  // 銷售金額是否含稅(1:是 0:否 預設含稅)
    IsRece_Yn: [null],  // 是否開立業主發票(是否開立業主發票(Y:是 N:否 預設全部))


    // ...createPaginationConfig([{ field: 'tlt_kind', order: 1 }])
  });
  totalRecords = 0;
  data: TLS31040Response[] = [];
  columns: Column[] = [
    // { field: 'building_desc', header: '館別', visible: true },
    // { field: 'org_name', header: '組織名稱', visible: true },
    // { field: 'tlt_kind', header: '櫃別', visible: true },
    // { field: 'tlt_no', header: '專櫃編號', visible: true },
    // { field: 'location_no', header: '位置編號', visible: true },
    // { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'bus_type', header: '櫃別', visible: true }, 
    { field: 'bus_type_name', header: '櫃別名稱', visible: true }, 

    { field: 'budget', header: '營業目標', visible: true, groupField: 'budgetAmt', format: formatAmount },
    { field: 'AVN_TotSaleAmt', header: '營業實績', visible: true, groupField: 'budgetAmt', format: formatAmount },
    { field: 'AchievementRate', header: '達成率', visible: true, groupField: 'budgetAmt', format: (value) => formatPercentage(value, 2) },
    { field: 'BudgetRate', header: '營業目標佔比', visible: true, groupField: 'sum', format: (value) => formatPercentage(value, 2) },
    { field: 'PerformanceRate', header: '營業實績佔比', visible: true, groupField: 'sum', format: (value) => formatPercentage(value, 2) },
    { field: 'TxnCount', header: '交易筆數', visible: true, groupField: 'custCnt', format: formatAmount },
    { field: 'AvgTicket', header: '客單價', visible: true, groupField: 'custCnt', format: formatAmount },
    { field: 'tlt_space', header: '坪數', visible: true, groupField: 'space' },
    { field: 'MonthlyPSM', header: '坪效', visible: true, groupField: 'space' },

    { field: 'TempCounterSaleAmt', header: '營業實績', visible: true, groupField: 'temp' }, 
    { field: 'TempCounterSalesRate', header: '營業實績佔比', visible: true, groupField: 'temp' },
    { field: 'TempCounterAmtRate', header: '臨時櫃業績佔比', visible: true, groupField: 'temp' }, 

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
    { value: "5", label: "階梯式抽成" },
    { value: "6", label: "包底加階梯" },
  ]
  TaxType_Option = [
    { value: "1", label: "是" },
    { value: "0", label: "否" },
  ]
  tlt_building_Option: IDropdownItem[] = []; // 館別
  tlt_floor_Option: IDropdownItem[] = []; // 樓層
  area_no_Option: IDropdownItem[] = []; // 區域
  bus_type_Option: IDropdownItem[] = []; // 大分類
  bus_class_Option: IDropdownItem[] = []; // 中分類
  bus_sclass_Option: IDropdownItem[] = []; // 小分類
  org_id_Option: IDropdownItem[] = []; // 組織

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls31040Service: Tls31040Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS31040', 'TLS/TLS31040cru', this.queryForm, (frm) => this.onSubmit(frm));
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
    this.dropDownListService.queryPOS2003_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.bus_type_Option = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    });
    // 監聽大分類變化
    this.queryForm.controls.bus_type.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value: string[]) => {
      if (value && value.length > 0) {
        this.dropDownListService.queryPOS20031_DropDownList({ CAT_LNo: value }).pipe(untilDestroyed(this)).subscribe(response => {
          const groupedData = response.Data.reduce((accumulator, currentItem) => {
            const groupKey = currentItem.CAT_LNo || '';
            if (!accumulator[groupKey]) {
              accumulator[groupKey] = {
                label: currentItem.CAT_LName,
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
    this.queryForm.controls.bus_class.valueChanges.pipe(debounceTime(300), untilDestroyed(this),
      map(selectedMValues => selectedMValues || []),
      // 使用 switchMap 取消前一次的請求，確保只處理最新的選取
      switchMap((selectedMValues: IDropdownItem[]) => {
        if (selectedMValues.length === 0) {
          this.bus_sclass_Option = [];
          this.queryForm.controls.bus_sclass.setValue([]);
          return of([]);// 如果沒有選取任何中分類，直接回傳空陣列
        }
        const requests = [];
        // 根據選取的中分類，為每一個中分類組建一個 API 請求
        for (const mValue of selectedMValues) {
          if (mValue && mValue.CAT_LNo) {
            requests.push(
              this.dropDownListService.queryPOS20032_DropDownList({ CAT_LNo: [mValue.CAT_LNo], CAT_MNo: [mValue.No] }).pipe(
                map(res => ({
                  LNo: mValue.CAT_LNo,
                  LName: mValue.CAT_LName,
                  MNo: mValue.No,
                  MName: mValue.Name,
                  Data: res.Data
                }))
              )
            );
          }
        }
        return forkJoin(requests);
      }),
      tap(results => {
        console.log('所有 API 呼叫結果：', results);
      })
    ).subscribe(results => {
      // 處理合併和分組的邏輯
      const groupedData = results.reduce((accumulator, group) => {
        const groupKey = `${group.LNo}_${group.MNo}`;

        if (!accumulator[groupKey]) {
          accumulator[groupKey] = {
            label: `${group.LName} - ${group.MName}`,
            items: []
          };
        }

        const newItems = group.Data.map(item => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
          CAT_LNo: group.LNo,
          CAT_LName: group.LName,
          CAT_MNo: group.MNo,
          CAT_MName: group.MName
        }));
        const existingItems = accumulator[groupKey].items;
        const allItems = [...existingItems, ...newItems];

        const uniqueItemsMap = new Map();
        allItems.forEach(item => {
          // 使用 No 作為鍵來去重
          if (!uniqueItemsMap.has(item.No)) {
            uniqueItemsMap.set(item.No, item);
          }
        });

        accumulator[groupKey].items = Array.from(uniqueItemsMap.values());

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
      const formValue = {
        ...frm.getRawValue(),
        bus_class: frm.getRawValue().bus_class.map((item: IDropdownItem) => item.No),
        bus_sclass: frm.getRawValue().bus_sclass.map((item: IDropdownItem) => item.No),
      } as TLS31040Request;

      console.log('送出request請求', formValue);
      this.tls31040Service.queryTLS31040(formValue).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        console.log('各櫃別之營業報表response', res.Data);
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, formValue);
      })
    })
  }
  btnLoading = false;
  onReport(frm: FormGroup, isExcel: boolean) {
    const printData = this.queryStateService.getQueryStateValue(this.ProgNo);
    const formValue = {
      ...printData,
      IsExcel: isExcel,
      // IsMerge: true,
      // SortBy: undefined,
      // pageIndex: undefined,
      // pageSize: undefined,
      bus_class: frm.getRawValue().bus_class.map((item: IDropdownItem) => item.No),
      bus_sclass: frm.getRawValue().bus_class.map((item: IDropdownItem) => item.No),
      // TXN_Date: formatDate(frm.getRawValue().TXN_Date, 'yyyy-MM-dd', 'en-US'),
    } as TLS31040PrintRequest;

    console.log('各大分類之營業報表print請求', JSON.stringify(formValue));

    this.btnLoading = true;
    this.tls31040Service.printTLS31040(formValue).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this))
      .subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (res.Data && res.Data.Print_URL) {
          const downloadUrl = environment.ApiUrl + res.Data.Print_URL;
          window.open(downloadUrl, '_blank');
        }
      });
  }

  onDetail1(event: any) {
    const queryConditions = this.queryStateService.getQueryStateValue(this.ProgNo);
    this.onDetail(event, queryConditions);
  }
}
