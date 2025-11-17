import { BusSClass, DropDownListService, IDropdownItem, ITLTBUSSCLASSRequest } from '@service/utility/dropDownList.service';
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
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { TLS31010QueryData, TLS31010Request, Tls31010Service, TLS31010TotalData } from '@service/api/tls/tls31010.service';
import { ButtonModule } from 'primeng/button';
import { formatDate } from '@angular/common';
import { environment } from 'src/environments/environment';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';

@Component({
  selector: 'app-tls31010',
  templateUrl: './tls31010.component.html',
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
    MultiSelectComponent,
    ButtonModule,
    RadiobuttonComponent,
    CustomFooterTableComponent
  ]
})

export class TLS31010Component extends BasicQueryPageComponent<TLS31010QueryData> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TXN_Date: [yesterday],//交易日期
    tlt_building: [[]],// 館別
    tlt_floor: [[]],// 樓層
    area_no: [[]],// 區域
    bus_type: [[] as string[]],//大分類
    bus_class: [[] as IDropdownItem[]],//中分類
    bus_sclass: [[] as IDropdownItem[]],//小分類
    tlt_kind: [[]], //櫃別 (1.正櫃 2.臨時櫃 3.特賣會 4.虛擬櫃)
    tlt_term_type: [[]], // 抽成別 1:固定租金 2:底租抽成取高者3:一般抽成     4:包底抽成     5:層級抽成   6:包底加層級   "
    org_id: [[]],  // 組織
    TaxType: ['Y'],  // 銷售金額是否含稅
    IsRece_Yn: [null],  // 是否開立業主發票(是否開立業主發票(Y:是 N:否))
    ...createPaginationConfig([{ field: 'tlt_building', order: 1 }])
  });
  totalRecords = 0;
  data: TLS31010QueryData[] = [];
  // 假設 formatAmount 和 formatPercentage 已經被定義和引入

  columns: Column[] = [
    { header: '總計', field: 'group_name', hidden: true },
    // --- 不需要總計或為文字描述的欄位 ---
    { field: 'building_desc', header: '館別', visible: true }, // '總計' 或 'Total'
    { field: 'org_name', header: '組織名稱', visible: true },
    { field: 'tlt_kind', header: '櫃別', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'location_no', header: '位置編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },

    // --- 需要總計的欄位 (對應 TLS31010TotalData) ---
    // 總預算 (TotalBudget) -> budget
    { field: 'budget', header: '營業目標', visible: true, groupField: 'budgetAmt', format: formatAmount, isTotal: true },

    // 總銷售額 (TotalSales) -> AVN_TotSaleAmt
    { field: 'AVN_TotSaleAmt', header: '營業實績', visible: true, groupField: 'budgetAmt', format: formatAmount, isTotal: true },

    // 平均達成率 (AvgAchievementRate) -> AchievementRate
    { field: 'AchievementRate', header: '達成率', visible: true, groupField: 'budgetAmt', format: (value) => formatPercentage(value, 2), isTotal: true },

    // 佔比通常不需要顯示總計，或總計為 100%，但在這裡沒有 TotalData 的總佔比，故保持
    { field: 'BudgetRate', header: '營業目標佔比', visible: true, groupField: 'sum', format: (value) => formatPercentage(value, 2) },
    { field: 'PerformanceRate', header: '營業實績佔比', visible: true, groupField: 'sum', format: (value) => formatPercentage(value, 2) },

    // 總交易筆數 (TotalTxnCount) -> TxnCount
    { field: 'TxnCount', header: '交易筆數', visible: true, groupField: 'custCnt', format: formatAmount, isTotal: true },

    // 平均客單價 (AvgTicket) -> AvgTicket
    { field: 'AvgTicket', header: '客單價', visible: true, groupField: 'custCnt', format: formatAmount, isTotal: true },

    // 總坪數 (TotalSpace) -> tlt_space
    { field: 'tlt_space', header: '坪數', visible: true, groupField: 'space', isTotal: true },

    // 平均坪效 (AvgPSM) -> MonthlyPSM
    { field: 'MonthlyPSM', header: '坪效', visible: true, groupField: 'space', isTotal: true },

    // 月總預算 (TotalMonthlyBudget) -> MonthlyBudgetTotal
    { field: 'MonthlyBudgetTotal', header: '月營業目標', visible: true, groupField: 'month', format: formatAmount, isTotal: true },

    // 月總銷售 (TotalMonthlySales) -> MonthlySalesTotal
    { field: 'MonthlySalesTotal', header: '營業實績', visible: true, groupField: 'month', format: formatAmount, isTotal: true },

    // 平均完成率 (AvgCompletionRate) -> CompletionRate
    { field: 'CompletionRate', header: '完成率', visible: true, groupField: 'month', format: (value) => formatPercentage(value, 2), isTotal: true },
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
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls31010Service: Tls31010Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS31010', 'TLS/TLS31010cru', this.queryForm, (frm) => this.onSubmit(frm));
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
        this.bus_sclass_Option = [];
        this.queryForm.controls.bus_sclass.setValue([]);
        this.queryForm.controls.bus_class.setValue([]);
      }
    });
    // 監聽中分類變化，獲取小分類並分組
    this.queryForm.controls.bus_class.valueChanges.pipe(debounceTime(300), untilDestroyed(this),
      map(selectedMValues => selectedMValues || []),
      // 使用 switchMap 取消前一次的請求，並處理 API 呼叫
      switchMap((selectedMValues: IDropdownItem[]) => {
        if (selectedMValues.length === 0) {
          this.bus_sclass_Option = [];
          this.queryForm.controls.bus_sclass.setValue([]);
          return of(null); // 如果沒有選取任何中分類，回傳 null
        }

        // 1. 組建成 ITLTBUSSCLASSRequest 結構
        const queryTLTBUSSCLASSInfos = selectedMValues
          .filter(mValue => mValue.bus_type && mValue.No) // 確保有必要的代碼
          .map(mValue => ({
            // 這裡 bus_type 和 bus_class 必須是單一字串
            bus_type: mValue.bus_type!, // 大分類代碼 (單一字串)
            bus_class: mValue.No,     // 中分類代碼 (單一字串)
          }));

        if (queryTLTBUSSCLASSInfos.length === 0) {
          this.bus_sclass_Option = [];
          this.queryForm.controls.bus_sclass.setValue([]);
          return of(null);
        }

        // 2. 準備 API 請求的 Payload
        const payload: ITLTBUSSCLASSRequest = { queryTLTBUSSCLASSInfos };

        // 3. 呼叫 API，並將中分類的完整資訊 (用於分組標籤) 附加到 stream
        // 我們只需要 selectedMValues 的子集，用於後續的分組標籤
        const busClassGroupInfo = selectedMValues
          .filter(mValue => mValue.bus_type && mValue.No);

        return this.dropDownListService.queryTLTBUSSCLASS_DropDownList(payload).pipe(
          map(res => ({
            data: res.Data,
            busClassGroupInfo: busClassGroupInfo
          }))
        );
      })
    ).subscribe(results => {
      // 檢查結果是否為 null 或沒有資料
      if (!results || !results.data || results.data.length === 0) {
        this.bus_sclass_Option = [];
        return;
      }

      // 處理合併和分組的邏輯
      const groupedData = results.data.reduce((accumulator, item: BusSClass) => {
        // 使用 大分類代碼 + 中分類代碼 作為群組鍵，確保唯一性
        const groupKey = `${item.bus_type}_${item.bus_class}`;

        if (!accumulator[groupKey]) {
          // 找到對應的中分類 IDropdownItem 來獲取其名稱
          const selectedClass = results.busClassGroupInfo.find(
            info => info.bus_type === item.bus_type && info.No === item.bus_class
          );

          // 取得名稱：大分類名稱 (bus_type_name) - 中分類名稱 (bus_class_name)
          const busTypeName = selectedClass?.bus_type_name || item.bus_type;
          const busClassName = selectedClass?.Name || item.bus_class_name;

          const groupLabel = `${busTypeName} - ${busClassName}`;

          accumulator[groupKey] = {
            label: groupLabel, // <-- 群組標籤：大分類名稱 - 中分類名稱
            items: []
          };
        }

        // 小分類項目標籤：No - Name
        accumulator[groupKey].items.push({
          ...item,
          label: `${item.No} - ${item.Name}`, // <-- 小分類項目標籤：代碼 - 名稱
        });

        return accumulator;
      }, {} as Record<string, any>);

      this.bus_sclass_Option = Object.values(groupedData);
    });
    this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.org_id_Option = res.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    })
  }
  footerData: any;
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

      // 1. 映射 bus_class：[ [大代碼, 中代碼], [大代碼, 中代碼], ... ]
      const busClassList = frm.getRawValue().bus_class.map((item: IDropdownItem) => [item.bus_type!, item.No]);

      // 2. 映射 bus_sclass：[ [大代碼, 中代碼, 小代碼], ... ]
      const busSClassList = frm.getRawValue().bus_sclass.map((item: IDropdownItem & BusSClass) => [item.bus_type!, item.bus_class!, item.No]);


      // 3. 檢查並決定最終傳遞的 bus_class 值
      // 如果有值，則為 [ [代碼組合], [代碼組合], ... ] (二層陣列)
      // 範例：[ ["10","00"], ["10","03"] ]
      const finalBusClass = (busClassList.length > 0) ? busClassList : []; // 移除額外的 [[]] 包裝

      // 4. 檢查並決定最終傳遞的 bus_sclass 值
      // 範例：[ ["10","00","01"], ["10","03","01"], ... ]
      const finalBusSClass = (busSClassList.length > 0) ? busSClassList : []; // 移除額外的 [[]] 包裝

      const formValue = {
        ...frm.getRawValue(),

        // 應用新的空值處理邏輯和層次修正
        bus_class: finalBusClass,
        bus_sclass: finalBusSClass,

        // 其他欄位保持不變
        tlt_building: (frm.getRawValue().tlt_building || []).map((item: IDropdownItem) => item.No),
        tlt_floor: (frm.getRawValue().tlt_floor || []).map((item: IDropdownItem) => item.No),
        area_no: (frm.getRawValue().area_no || []).map((item: IDropdownItem) => item.No),

        tlt_kind: (frm.getRawValue().tlt_kind || []).map((item: IDropdownItem) => item.value),
        tlt_term_type: (frm.getRawValue().tlt_term_type || []).map((item: IDropdownItem) => item.value),
        org_id: (frm.getRawValue().org_id || []).map((item: IDropdownItem) => item.No),

        // 其他單值欄位
        TXN_Date: formatDate(frm.getRawValue().TXN_Date, 'yyyy-MM-dd', 'en-US'),
      } as TLS31010Request;

      // ... (呼叫 API 及其餘邏輯保持不變)
      this.tls31010Service.queryTLS31010(formValue)
        .pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        )
        .subscribe(res => {
          this.data = res.Data.QueryData;
          this.totalRecords = res.TotalCount;
          const mappedFooter = mapTotalDataToQueryData(res.Data.TotalData);
          this.footerData = [mappedFooter];
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
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
      bus_sclass: frm.getRawValue().bus_sclass.map((item: IDropdownItem) => item.No),
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
const mapTotalDataToQueryData = (totalData: TLS31010TotalData): TLS31010QueryData => {
  return {
    // 固定的總計欄位
    group_name: '總計',
    building_desc: '總計', // 假設您想在第一欄顯示總計
    org_name: '',
    tlt_kind: '',
    tlt_no: '',
    location_no: '',
    tlt_name: 'Total', // 或其他總計標識

    // 映射數值欄位
    budget: totalData.TotalBudget,
    AVN_TotSaleAmt: totalData.TotalSales,
    AchievementRate: totalData.AvgAchievementRate,
    BudgetRate: 0, // 假設沒有對應值，設為 0 或 null
    PerformanceRate: 0, // 假設沒有對應值
    TxnCount: totalData.TotalTxnCount,
    AvgTicket: totalData.AvgTicket,
    tlt_space: totalData.TotalSpace,
    MonthlyPSM: totalData.AvgPSM,
    MonthlyBudgetTotal: totalData.TotalMonthlyBudget,
    MonthlySalesTotal: totalData.TotalMonthlySales,
    CompletionRate: totalData.AvgCompletionRate,
  };
};
