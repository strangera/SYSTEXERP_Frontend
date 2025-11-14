import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, ColumnGroup } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TLS31080Request, TLS31080Response, Tls31080Service } from '@service/api/tls/tls31080.service';
import { footerShowTotal, TLS31020Total } from '@service/api/tls/tls31020.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';

@Component({
  selector: 'app-tls31080',
  templateUrl: './tls31080.component.html',
  styleUrl: './tls31080.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    CommonModule,
    CalendarComponent,
    CalendarRangeQuickComponent,
    DropdownComponent,
    InputTextComponent,
    InputNumberRangeComponent,
    ButtonComponent,
    TableModule,
    TableReportComponent,
    RadiobuttonYNComponent,
    TranslateModule,
    TableComponent,
    MultiSelectComponent,
    ButtonModule
  ]
})

// 各時段之樓層營業報表
export class TLS31080Component extends BasicQueryPageComponent<TLS31080Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
      TxnDate: [yesterday, [Validators.required]],//交易日期_起
      TimeMode: ['A'],// 時段模式：'A'=全時段(預設)，'T'=依範圍 (全時段不用帶TimeFromHH、TimeToHH)
      TimeFromHH: [null, [Validators.min(0), Validators.max(23)]],// 起始小時 (0~23)，當 TimeMode='T' 時生效
      TimeToHH: [null, [Validators.min(0), Validators.max(23)]],// 結束小時 (0~23)，當 TimeMode='T' 時生效
      StoreNos: [this.authService.getUserInfo()?.SYS_StoreNo], //門市代號，多選以逗號分隔 (例: "001,002,003")
      Floors: [[]], //樓層代號，多選以逗號分隔
      Areas: [[]], //區域代號，多選以逗號分隔
      CatLNos: [[] as string[]], //大分類代號，多選以逗號分隔
      CatMNos: [[] as IDropdownItem[]], //中分類代號，多選以逗號分隔
      CabinetKinds: [[]], //櫃別類型，多選以逗號分隔 (TLTTALENT.tlt_kind)
      OrgIds: [[]], //組織代號，多選以逗號分隔
      CounterNos: [[]], //專櫃代號，多選以逗號分隔 (TLTTALENT.tlt_no)
      ChargeTypes: [[]], //抽成別，多選以逗號分隔 (POS5007.TLT_ID)
      Buildings: [[]], //館別代號，多選以逗號分隔 (TLTTALENT_LOCATION.tlt_building)
      IncludeTax: [true], //是否含稅：1=含稅(預設)，0=未稅
      BizInvFlag: ['A'], //是否開立業主發票：'A'=全部(預設)、'Y'=是、'N'=否

      // ...createPaginationConfig([{ field: 'tlt_kind', order: 1 }])
    });

    reportTypeOptions = [
      { value: 'A', label: '全時段顯示' },
      { value: 'T', label: '交易時間' }
    ];
  
    totalRecords = 0;
    data: TLS31080Response[] = [];
    footerTotal: TLS31020Total | null = null; // 總計取得原始資料
    footershowTotal: footerShowTotal | null = null; // 總計資料轉換名稱
    footershowPercent: footerShowTotal | null = null; // 總計資料轉換百分比
    historyRequestBody: TLS31080Request | null = null; //歷史查詢條件
  
    columns: Column[] = [
      { field: 'floor_desc', header: '樓層名稱', visible: true },
      { field: 'TimeType', header: '時段類型', visible: true }, // (營業實績 / 交易筆數 / 營業實績佔比)

      { field: 'H08', header: '08時段', visible: true },
      { field: 'H09', header: '09時段', visible: true },
      { field: 'H10', header: '10時段', visible: true },
      { field: 'H11', header: '11時段', visible: true },
      { field: 'H12', header: '12時段', visible: true },
      { field: 'H13', header: '13時段', visible: true },
      { field: 'H14', header: '14時段', visible: true },
      { field: 'H15', header: '15時段', visible: true },
      { field: 'H16', header: '16時段', visible: true },
      { field: 'H17', header: '17時段', visible: true },
      { field: 'H18', header: '18時段', visible: true },
      { field: 'H19', header: '19時段', visible: true },
      { field: 'H20', header: '20時段', visible: true },
      { field: 'H21', header: '21時段', visible: true },
      { field: 'H22', header: '22時段', visible: true },
      { field: 'H23', header: '23時段', visible: true },

      { field: 'Reentry', header: '補登金額或筆數', visible: true },
      { field: 'Subtotal', header: '小計', visible: true },
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
    TaxType_Option = [ // 銷售金額是否含稅
      { value: true, label: "是" },
      { value: false, label: "否" },
    ]
    BizInvFlag_Option = [ // 是否開立業主發票
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
    CounterNos_Option: IDropdownItem[] = []; // 專櫃代號
  
    constructor(
      private readonly dropDownListService: DropDownListService,
      public readonly tls31080Service: Tls31080Service,
    ) { super(); }
  
    ngOnInit(): void {
      this.initializePage('TLS31080', 'TLS/TLS31080cru', this.queryForm, (frm) => this.onSubmit(frm));
  
      // 日期表單控制
      this.onTimeModeChange('A');

      this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.tlt_building_Option = res.Data;
      })
      this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.tlt_floor_Option = res.Data;
      })
      this.dropDownListService.querySYS3A00_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.area_no_Option = res.Data;
      })
      this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.org_id_Option = res.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
      })
      this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.CounterNos_Option = res.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
      })
      // 獲取大分類下拉選項
      this.dropDownListService.queryTLTBUSTYPE_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
        this.bus_type_Option = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
      });
      // 監聽大分類變化
      this.queryForm.controls.CatLNos.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value: string[]) => {
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
          this.queryForm.controls.CatMNos.setValue([]);
        }
      });
    }
    onSubmit(frm: FormGroup) {
      this.handleSubmit(frm, () => {
        const raw = frm.getRawValue();

        const formValue = {
          ...raw,
          // 日期格式化
          TxnDate: formatDate(frm.getRawValue().TxnDate, 'yyyy-MM-dd', 'en-US'),

          // 分類轉成編號
          CatLNos: (raw.CatLNos || []).map((x: any) => x.No ?? x).join(','),
          CatMNos: (raw.CatMNos || []).map((x: any) => x.No ?? x).join(','),

          // 多選陣列轉成逗號字串
          Floors: (raw.Floors || []).join(','),
          Areas: (raw.Areas || []).join(','),
          CabinetKinds: (raw.CabinetKinds || []).join(','),
          OrgIds: (raw.OrgIds || []).join(','),
          CounterNos: (raw.CounterNos || []).join(','),
          ChargeTypes: (raw.ChargeTypes || []).join(','),
          Buildings: (raw.Buildings || []).join(','),
        } as TLS31080Request;
  
        console.log('送出request請求', formValue);
        this.tls31080Service.queryTLS31080(formValue).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
          this.data = res.Data ?? [];               // 查詢資料
          console.log('查詢結果', res.Data ?? []);
          // this.footerTotal = res.TotalData ?? null;;    // 總計資料
  
          // this.footershowTotal = this.footerTotal ? {          // 人工轉換欄位
          //   budget: this.footerTotal.TotalBudget,
          //   AVN_TotSaleAmt: this.footerTotal.TotalSales,
          //   TxnCount: this.footerTotal.TotalTxnCount,
          //   AvgTicket: this.footerTotal.AvgTicket,
          //   tlt_space: this.footerTotal.TotalSpace,
          //   MonthlyPSM: this.footerTotal.AvgPSM,
          //   MonthlyPayment: this.footerTotal.AvgMonthlyPayment,
          //   TempCounterSaleAmt: this.footerTotal.TotalTempCounterSales,
  
          //   MonthlyBudgetTotal: this.footerTotal.TotalMonthlyBudget,
          //   MonthlySalesTotal: this.footerTotal.TotalMonthlySales,
  
          //   AchievementRate: this.footerTotal.AvgAchievementRate,
          //   CompletionRate: this.footerTotal.AvgCompletionRate,
          // } : null;
  
          // this.historyRequestBody = formValue;                 // 查詢條件
          // console.log('查詢結果', res);
          // console.log('查詢總計', this.footerTotal);
          // console.log('查詢總計(轉換後)', this.footershowTotal);
  
          // this.totalRecords = res.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        })
      })
    }
    btnLoading = false;
    onReport(frm: FormGroup, isExcel: boolean) {
      const raw = frm.getRawValue();
      const formValue = {
          ...raw,
          // 日期格式化
          TxnDate: formatDate(frm.getRawValue().TxnDate, 'yyyy-MM-dd', 'en-US'),

          // 分類轉成編號
          CatLNos: (raw.CatLNos || []).map((x: any) => x.No ?? x).join(','),
          CatMNos: (raw.CatMNos || []).map((x: any) => x.No ?? x).join(','),

          // 多選陣列轉成逗號字串
          Floors: (raw.Floors || []).join(','),
          Areas: (raw.Areas || []).join(','),
          CabinetKinds: (raw.CabinetKinds || []).join(','),
          OrgIds: (raw.OrgIds || []).join(','),
          CounterNos: (raw.CounterNos || []).join(','),
          ChargeTypes: (raw.ChargeTypes || []).join(','),
          Buildings: (raw.Buildings || []).join(','),
        } as TLS31080Request;
  
      console.log('各時段之營業報表print請求', JSON.stringify(formValue));

      this.btnLoading = true;
      this.tls31080Service.exportTLS31080(formValue).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this))
        .subscribe(res => {
          this.messageService.successBubble(res.Message);
          if (res.Data) {
            console.log('查詢結果', res ?? []);
          }
      });
    }

    //#region 日期表單控制
    onTimeModeChange(mode: 'A' | 'T') {
      const from = this.queryForm.get('TimeFromHH');
      const to = this.queryForm.get('TimeToHH');

      if (mode === 'A') {
        from?.disable();
        to?.disable();

        from?.setValue(null); // 全時段重制為null
        to?.setValue(null);   // 全時段重制為null
      } else {
        from?.enable();
        to?.enable();
      }
    }

    onDetail1(event: any) {
      // 直接從查詢頁 state 拿已格式化好的 request
      const rawQuery = this.queryStateService.getQueryStateValue(this.ProgNo);

      if (!rawQuery) {
        this.messageService.errorBubble('請返回查詢頁重新操作');
        return;
      }

      // 將日期轉 string、分類轉編號、多選陣列轉逗號字串
      const formValue: TLS31080Request = {
        ...rawQuery,
        TxnDate: formatDate(rawQuery.TxnDate, 'yyyy-MM-dd', 'en-US'),
        CatLNos: (rawQuery.CatLNos || []).map((x: any) => x.No ?? x).join(','),
        CatMNos: (rawQuery.CatMNos || []).map((x: any) => x.No ?? x).join(','),
        Floors: (rawQuery.Floors || []).join(','),
        Areas: (rawQuery.Areas || []).join(','),
        CabinetKinds: (rawQuery.CabinetKinds || []).join(','),
        OrgIds: (rawQuery.OrgIds || []).join(','),
        CounterNos: (rawQuery.CounterNos || []).join(','),
        ChargeTypes: (rawQuery.ChargeTypes || []).join(','),
        Buildings: (rawQuery.Buildings || []).join(','),
      };

      // 再傳給明細方法
      this.onDetail(event, formValue);
    }
}
