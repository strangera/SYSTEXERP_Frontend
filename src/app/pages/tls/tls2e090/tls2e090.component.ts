import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, finalize } from 'rxjs';
import { Tls2e090Service, Tls2e090Data } from '@service/api/tls/tls2e090.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, convertDateToYYYYMM, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { AsyncPipe } from '@angular/common';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
// 2.2.14.9 專櫃帳款結帳彙總表
@Component({
  selector: 'app-tls2e090',
  templateUrl: './tls2e090.component.html',
  standalone: true,
  imports: [
    TableComponent, MenubarComponent, ButtonComponent, AccordionModule,
    FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent,
    MultiSelectComponent, CheckboxModule, RadiobuttonYNComponent, InputNumberComponent, // 新增的 Component
    TranslateModule, AsyncPipe
  ]
})
export class TLS2E090Component extends BasicQueryPageComponent<Tls2e090Data> implements OnInit {
  // 1. 查詢表單 (FormGroup) - 欄位名稱對應 API Tls2e090QueryBody
  queryForm = this.formBuilder.nonNullable.group({
    // 查詢年月 (月區間)
    sam_yyymm_Start: [],
    sam_yyymm_End: [],
    // 查詢條件 (多選)
    money_typeList: [[] as string[]], // 結帳方式
    tlt_term_typeList: [[] as string[]], // 抽成方式
    ven_no: [], // 廠商編號/名稱
    tlt_noList: [[] as string[]], // 專櫃編號
    org_idList: [[] as string[]], // 組織代號
    tlt_floorList: [[] as string[]], // 樓層
    tlt_buildingList: [[] as string[]], // 館別
    bus_typeList: [[] as string[]], // 大分類代碼/名稱
    bus_classList: [[] as string[][]], // 中分類代碼/名稱 (注意 API 介面為 string[][])
    // 查詢條件 (單選/輸入)
    rece_yn: [], // 是否開立業主發票 (對應舊的 vendorInvoice)
    // 篩選條件 (Checkbox)
    acc_payableNeg: [false], // 只顯示應付帳款小於0
    sam_ap_amtNeg: [false], // 只顯示進貨總額小於0
    check_day: [], // 結帳後幾日付款 (對應舊的 payDay, 現為數字輸入)
    isUnderLimitAmt: [false], // 只顯示包底抽成不足 (新增)
    invoice_type: [], // 請款單據別
    ...createPaginationConfig([{ field: 'ven_no', order: 1 }]), // 預設排序調整為 ven_no
  });

  totalRecords = 0;
  data: Tls2e090Data[] = [];
  // 表格欄位 (Columns) - 根據 Tls2e090Data 介面調整
  columns: Column[] = [
    // 基本資訊
    { field: 'ven_no', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '專櫃名稱' },
    { field: 'tlt_term_type_Name', header: '抽成方式' },
    { field: 'money_type_Name', header: '結帳方式' },
    { field: 'sam_yyymm', header: '結帳年月' },
    { field: 'bus_type_name', header: '大分類' },
    { field: 'sam_termno', header: '帳次' },
    { field: 'check_day', header: '付款日數' },

    // 銷貨相關 (金額欄位加上 type: 'currency')
    { field: 'sam_sales_namt', header: '銷貨淨額(應稅)', format: formatAmount },
    { field: 'sam_sales_notaxamt', header: '銷貨淨額(免稅)', format: formatAmount },
    { field: 'sam_sales_tax', header: '銷貨淨額(稅額)', format: formatAmount },

    // 抽成相關 (金額欄位加上 type: 'currency')
    { field: 'sam_profit', header: '抽成額(應稅)', format: formatAmount },
    { field: 'sam_notax_profit', header: '抽成額(免稅)', format: formatAmount },
    { field: 'sam_profit_tax', header: '抽成額(稅額)', format: formatAmount },

    // 進貨/應付相關 (金額欄位加上 type: 'currency')
    { field: 'sam_ap_namt', header: '進貨(應稅)', format: formatAmount },
    { field: 'sam_ap_notaxamt', header: '進貨(免稅)', format: formatAmount },
    { field: 'sam_ap_tax', header: '進項稅額', format: formatAmount },
    { field: 'sam_ap_amt', header: '進貨總額(含稅)', format: formatAmount }, // 應付帳款總額 (舊欄位名)

    // 代扣相關 (金額欄位加上 type: 'currency')
    { field: 'sam_fare_namt', header: '代扣未稅(開立)', format: formatAmount },
    { field: 'sam_fare_tax', header: '代扣稅額', format: formatAmount },
    { field: 'sam_fare_notaxamt', header: '代扣金額(不開立)', format: formatAmount },

    // 租金相關 (金額欄位加上 type: 'currency')
    { field: 'sam_rent_namt', header: '租金未稅', format: formatAmount },
    { field: 'sam_rent_tax', header: '租金稅額', format: formatAmount },

    // 結算結果 (金額欄位加上 type: 'currency')
    { field: 'acc_receivable', header: '應收合計', format: formatAmount },
    { field: 'sam_under_limit_amt', header: '包底抽成不足(含稅)', format: formatAmount },
    { field: 'acc_payable', header: '廠商應付帳款(含稅)', format: formatAmount },
  ];

  // 2. 選項資料 (Options) - 使用 Observable 配合 | async pipe
  money_typeOptions = getSYS1000Options('money_type');
  tlt_term_typeOptions = getSYS1000Options('tlt_term_type');
  ven_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  tlt_noOptions = this.dropdown.queryTltTalent();
  org_idOptions = this.dropdown.querySys3100();
  tlt_floorOptions = this.dropdown.querySys3900();
  tlt_buildingOptions = this.dropdown.querySys3800();
  bus_typeOptions = this.dropdown.queryTltBusType();
  bus_classOptions: IDropdownItem[] = [];
  invoiceTypeOptions = getSYS1000Options('invoice_type');

  constructor(
    private readonly tls2e090Service: Tls2e090Service,
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E090', 'tls/tls2e090cru', this.queryForm, (form) => this.onSubmit(form));
    // 監聽大分類變化
    this.queryForm.controls.bus_typeList.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value: string[]) => {
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
          this.bus_classOptions = Object.values(groupedData);
        });
      } else {
        this.bus_classOptions = [];
        this.queryForm.controls.bus_classList.setValue([]);
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const rawBusClassList = frm.getRawValue().bus_classList;
      const transformedBusClassList: string[][] = rawBusClassList.map((item: any) => {
        const busType = item.bus_type || '';
        const busClassNo = item.No || '';
        return [busType, busClassNo];
      });

      const body = {
        ...frm.getRawValue(),
        sam_yyymm_Start: convertDateToYYYYMM(frm.getRawValue().sam_yyymm_Start),
        sam_yyymm_End: convertDateToYYYYMM(frm.getRawValue().sam_yyymm_End),
        bus_classList: transformedBusClassList,
      }
      this.loading = true; // 開始載入
      this.tls2e090Service.queryTls2e090(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.loading = false;
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
      });
    });
  }
}
