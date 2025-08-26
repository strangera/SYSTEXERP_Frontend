import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
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
import { debounceTime, finalize } from 'rxjs';
import { TLS31010Request, TLS31010Response, Tls31010Service } from '@service/api/tls/tls31010.service';
import { ButtonModule } from 'primeng/button';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TLS31020Response } from '@service/api/tls/tls31020.service';

@Component({
  selector: 'app-tls31020',
  templateUrl: './tls31020.component.html',
  styleUrl: './tls31020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    ButtonComponent,
    TableModule,
    RadiobuttonYNComponent,
    TranslateModule,
    TableComponent,
    MultiSelectComponent,
    ButtonModule
  ]
})

export class TLS31020Component extends BasicQueryPageComponent<TLS31020Response> implements OnInit{
  queryForm = this.formBuilder.nonNullable.group({
    TXN_Date: [yesterday],//交易日期 (要支援區間，待進行)
    // 合約查詢條件
    tlt_floor: [[]],// 樓層
    area_no: [[]],// 區域
    bus_type: [[] as string[]],//大分類
    bus_class: [[] as IDropdownItem[]],//中分類
    tlt_kind: [[]], //櫃別 (1.正櫃 2.臨時櫃 3.特賣會 4.虛擬櫃)
    tlt_term_type: [[]], // 抽成別 1:固定租金 2:底租抽成取高者3:一般抽成     4:包底抽成     5:階梯式抽成   6:包底加階梯   "
    org_id: [[]],  // 組織
    tlt_no: [[]],  // 專櫃編號 (未串apitable)
    IsRece_Yn: [null],  // 是否開立業主發票(是否開立業主發票(Y:是 N:否 預設全部))
    TaxType: ["Y"],  // 銷售金額是否含稅(Y:是 N:否 預設含稅)
    tlt_building: [[]],// 館別
    
    ...createPaginationConfig([{ field: 'tlt_building', order: 1 }])
  });
  totalRecords = 0;
  data: TLS31010Response[] = [];
  columns: Column[] = [
    { field: 'building_desc', header: '館別', visible: true },
    { field: 'org_name', header: '組織名稱', visible: true },
    { field: 'tlt_kind', header: '櫃別', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'location_no', header: '位置編號', visible: true },
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
  tlt_building_Option: IDropdownItem[] = []; // 館別
  tlt_floor_Option: IDropdownItem[] = []; // 樓層
  area_no_Option: IDropdownItem[] = []; // 區域
  bus_type_Option: IDropdownItem[] = []; // 大分類
  bus_class_Option: IDropdownItem[] = []; // 中分類
  org_id_Option: IDropdownItem[] = []; // 組織
  tlt_no_id_Option: IDropdownItem[] = []; // 專櫃編號

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls31010Service: Tls31010Service,
    private readonly httpClient: HttpClient
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS31020', 'TLS/TLS31020cru', this.queryForm, (frm) => this.onSubmit(frm));
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
        this.queryForm.controls.bus_class.setValue([]);
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
        bus_class: frm.getRawValue().bus_class.map((item: IDropdownItem) => item.No),
        TXN_Date: formatDate(frm.getRawValue().TXN_Date, 'yyyy-MM-dd', 'en-US'),
      } as TLS31010Request;

      console.log('送出請求',formValue);
      // this.tls31010Service.queryTLS31010(formValue).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      //   this.data = res.Data;
      //   this.totalRecords = res.TotalCount;
      //   this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      // })
    })
  }
  btnLoading = false;
  onReport(frm: FormGroup) {
    const printData = this.queryStateService.getQueryStateValue(this.ProgNo);
    const formValue = {
      ...printData,
      IsExcel: true,
      IsMerge: true,
      SortBy: undefined,
      pageIndex: undefined,
      pageSize: undefined,
      bus_class: frm.getRawValue().bus_class.map((item: IDropdownItem) => item.No),
      TXN_Date: formatDate(frm.getRawValue().TXN_Date, 'yyyy-MM-dd', 'en-US'),
    } as TLS31010Request;

    this.btnLoading = true;
    this.tls31010Service.printTLS31010(formValue).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this))
      .subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (res.Data && res.Data.Print_URL) {
          const downloadUrl = environment.ApiUrl + res.Data.Print_URL;
          window.open(downloadUrl, '_blank');
        }
      });
  }
}
