import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS31080Request, TLS31080Response, Tls31080Service } from '@service/api/tls/tls31080.service';
import { DropDownListService, IDropdownItem, ITLTBUSSCLASSInfo } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { ColumnGroup, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { debounceTime, finalize, map, of, switchMap, tap } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { ReportColumn } from '../tls2f010-cru/tls2f010-table-report.model';

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
    // TxnDate: [yesterday, [Validators.required]],//交易日期_起
    TxnDate: [new Date(2025, 0, 1), [Validators.required]],//交易日期_起 (測試)
    TimeMode: ['A'],// 時段模式：'A'=全時段(預設)，'T'=依範圍 (全時段不用帶TimeFromHH、TimeToHH)
    TimeFromHH: [null, [Validators.min(0), Validators.max(23)]],// 起始小時 (0~23)，當 TimeMode='T' 時生效
    TimeToHH: [null, [Validators.min(0), Validators.max(23)]],// 結束小時 (0~23)，當 TimeMode='T' 時生效
    StoreNos: [this.authService.getUserInfo()?.SYS_StoreNo], //門市代號，多選以逗號分隔 (例: "001,002,003")
    Floors: [[]], //樓層代號，多選以逗號分隔
    Areas: [[]], //區域代號，多選以逗號分隔
    CatLNos: [[] as string[]], //大分類代號，多選以逗號分隔
    CatMNos: [[] as IDropdownItem[]], //中分類代號，多選以逗號分隔
    CatSNos: [[] as IDropdownItem[]],//小分類
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
  footerData: TLS31080Response | null = null;
  historyRequestBody: TLS31080Request | null = null; //歷史查詢條件

  btnPDFLoading = false;
  btnExcelLoading = false;

  columns: ReportColumn[] = [
    { field: 'floor_desc', header: '樓層名稱', visible: true, align: 'left' },
    { field: 'TimeType', header: '時段類型', visible: true, align: 'left' }, // (營業實績 / 交易筆數 / 營業實績佔比)

    { field: 'H00', header: '00時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H01', header: '01時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H02', header: '02時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H03', header: '03時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H04', header: '04時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H05', header: '05時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H06', header: '06時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H07', header: '07時段', visible: true, format: formatAmount, align: 'right' },
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
    { field: 'Reentry', header: '補登金額或筆數', visible: true, format: formatAmount, align: 'right' },
    { field: 'PreOrderAmt', header: '預售實績', visible: true, format: formatAmount, align: 'right' },
    { field: 'PresaleCheckout', header: '預售結帳', visible: true, format: formatAmount, align: 'right' },
    { field: 'Subtotal', header: '小計', visible: true, format: formatAmount, align: 'right' },

    // 營業實績總計
    { field: 'TotalCount', header: '交易筆數', visible: true, format: formatAmount, align: 'right' },
    // { field: 'TotalPage', header: '總頁數', visible: true, format: formatAmount, align: 'right' },
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
  bus_sclass_Option: IDropdownItem[] = []; // 小分類
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
        this.bus_sclass_Option = [];
        this.queryForm.controls.CatSNos.setValue([]);
        this.queryForm.controls.CatMNos.setValue([]);
      }
    });
    // 監聽中分類變化，獲取小分類並分組
    this.queryForm.controls.CatMNos.valueChanges.pipe(
      debounceTime(300),
      untilDestroyed(this),
      map(selectedMValues => selectedMValues || []),

      // 使用 switchMap 取消前一次的請求，確保只處理最新的選取
      switchMap((selectedMValues: IDropdownItem[]) => {
        if (selectedMValues.length === 0) {
          this.bus_sclass_Option = [];
          this.queryForm.controls.CatSNos.setValue([]);
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
        CatSNos: (raw.CatSNos || []).map((x: any) => x.No ?? x).join(','),

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
        this.data = res.Data.Data ?? [];               // 查詢資料
        this.footerData = {
          floor_desc: '營業實績',
          TimeType: '',

          TotalCount: res.Data.TotalData.TotalTxnCount ?? 0, // 交易筆數總計
          Subtotal: res.Data.TotalData.TotalSales ?? 0, // 營業實績總計
          Reentry: res.Data.TotalData.TotalReentry ?? 0,
          PreOrderAmt: res.Data.TotalData.TotalPreOrderAmt ?? 0,
          PresaleCheckout: res.Data.TotalData.TotalPresaleCheckout ?? 0,

          H00: res.Data.TotalData.TotalH00 ?? 0,
          H01: res.Data.TotalData.TotalH01 ?? 0,
          H02: res.Data.TotalData.TotalH02 ?? 0,
          H03: res.Data.TotalData.TotalH03 ?? 0,
          H04: res.Data.TotalData.TotalH04 ?? 0,
          H05: res.Data.TotalData.TotalH05 ?? 0,
          H06: res.Data.TotalData.TotalH06 ?? 0,
          H07: res.Data.TotalData.TotalH07 ?? 0,
          H08: res.Data.TotalData.TotalH08 ?? 0,
          H09: res.Data.TotalData.TotalH09 ?? 0,
          H10: res.Data.TotalData.TotalH10 ?? 0,
          H11: res.Data.TotalData.TotalH11 ?? 0,
          H12: res.Data.TotalData.TotalH12 ?? 0,
          H13: res.Data.TotalData.TotalH13 ?? 0,
          H14: res.Data.TotalData.TotalH14 ?? 0,
          H15: res.Data.TotalData.TotalH15 ?? 0,
          H16: res.Data.TotalData.TotalH16 ?? 0,
          H17: res.Data.TotalData.TotalH17 ?? 0,
          H18: res.Data.TotalData.TotalH18 ?? 0,
          H19: res.Data.TotalData.TotalH19 ?? 0,
          H20: res.Data.TotalData.TotalH20 ?? 0,
          H21: res.Data.TotalData.TotalH21 ?? 0,
          H22: res.Data.TotalData.TotalH22 ?? 0,
          H23: res.Data.TotalData.TotalH23 ?? 0,
        }
        this.totalRecords = res.Data.Data.length;      // 長度計算筆數
        console.log('查詢結果', res.Data ?? []);
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      })
    })
  }
  onReport(frm: FormGroup, isExcel: boolean) {
    console.log('匯出Excel');
    const raw = frm.getRawValue();
    const formValue = {
      ...raw,
      // 日期格式化
      TxnDate: formatDate(frm.getRawValue().TxnDate, 'yyyy-MM-dd', 'en-US'),

      // 分類轉成編號
      CatLNos: (raw.CatLNos || []).map((x: any) => x.No ?? x).join(','),
      CatMNos: (raw.CatMNos || []).map((x: any) => x.No ?? x).join(','),
      CatSNos: (raw.CatSNos || []).map((x: any) => x.No ?? x).join(','),

      // 多選陣列轉成逗號字串
      Floors: (raw.Floors || []).join(','),
      Areas: (raw.Areas || []).join(','),
      CabinetKinds: (raw.CabinetKinds || []).join(','),
      OrgIds: (raw.OrgIds || []).join(','),
      CounterNos: (raw.CounterNos || []).join(','),
      ChargeTypes: (raw.ChargeTypes || []).join(','),
      Buildings: (raw.Buildings || []).join(','),
    } as TLS31080Request;

    console.log('各時段之營業報表print請求(Excel)', JSON.stringify(formValue));

    if (isExcel) {
      console.log('匯出Excel');
      this.btnExcelLoading = true;
      this.tls31080Service.exportTLS31080(formValue).subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '各時段之營業報表.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.btnExcelLoading = false;
      });
    } else {
      console.log('匯出PDF');
      this.btnPDFLoading = true;
      this.tls31080Service.exportTLS31080PDF(formValue).subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '各時段之營業報表.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        this.btnPDFLoading = false;
      });
    }
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
      CatSNos: (rawQuery.CatSNos || []).map((x: any) => x.No ?? x).join(','),
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
