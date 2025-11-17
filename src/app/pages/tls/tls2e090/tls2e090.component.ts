import { DropdownApiService } from '@service/utility/dropdown-api.service';
import {
  Tls2e090Service,
  Tls2e090QueryBody, // 引入共用的 Request Body 介面
} from '../../../service/api/tls/tls2e090.service'; // ***Service 修改為 Tls2e090***
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { convertDateToYYYYMM } from '@shared/componentkit/table/table.model';
import { debounceTime, finalize, Observable } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { AsyncPipe } from '@angular/common';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ColumnGroup, ReportColumn } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
// 假設您在 tls2e090.model.ts 中定義了 columns1, columns2, columns3
import { columnGroup, columns1, columns2, columns3 } from './tls2e090.model'; // ***Model 修改為 tls2e090***
import { SelectButtonModule } from 'primeng/selectbutton';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { ApiResponse } from '@service/system/auth.service';

// 定義報表類型
type ReportType = '1' | '2' | '3';

// 2.2.14.8 專櫃帳款結算彙總表
// 將 MainData 的泛型設為 unknown，以便容納三種不同的資料結構
@Component({
  selector: 'app-tls2e090', // ***Selector 修改為 tls2e090***
  templateUrl: './tls2e090.component.html', // ***TemplateUrl 修改為 tls2e090***
  standalone: true,
  imports: [RadiobuttonComponent, SelectButtonModule, TableReportComponent, InputNumberComponent, AsyncPipe, RadiobuttonYNComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, CheckboxModule, TranslateModule]
})
export class TLS2E090Component extends BasicQueryPageComponent<any> implements OnInit { // ***Component Name 修改為 TLS2E090Component***

  // 報表類型切換，預設為 '1' (專櫃帳款結算彙總表)
  reportType: ReportType = '1';

  // 新增狀態：追蹤含稅/未稅，預設為 true (含稅)
  isTaxed = true;

  // Radio Button 選項
  taxOptions = [
    { label: '含稅', value: true },
    { label: '未稅', value: false },
  ];

  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm_Start: [new Date()], // 查詢年月(起)
    sam_yyymm_End: [new Date()], // 查詢年月(迄)
    money_typeList: [null], // 結帳方式 (通常是 List)
    ven_no: [], // 廠商編號
    tlt_noList: [null], // 專櫃編號
    org_idList: [null], // 組織編號
    tlt_floorList: [null], // 樓層
    tlt_buildingList: [null], // 館別 (API多出來的欄位)
    tlt_term_typeList: [null], // 抽成方式
    bus_typeList: [[] as string[]], // 大分類
    bus_classList: [[] as IDropdownItem[]], // 中分類
    rece_yn: [], // 開立業主發票 (原: vendorInvoice)
    acc_payableNeg: [false], // 只顯示應付帳款(ACC_PAYABLE)小於0 (布林值，預設給 false)
    sam_ap_amtNeg: [false], // 只顯示應付總金額(SAM_AP_AMT)小於0 (布林值，預設給 false)
    isUnderLimitAmt: [false], // 只顯示包底抽成不足 (布林值，預設給 false)
    check_day: [], // 結帳後n天付款
    invoice_type: [], // 請款單據別

    // 分頁欄位
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],

    // 報表類型切換
    is_tax: [true],
  });

  // 1.專櫃帳款結算彙總表 2.專櫃銷貨彙總表-依抽成3.專櫃銷貨彙總表-依類別
  typeOptions = [
    { label: '專櫃帳款結算彙總表', value: '1' },
    { label: '專櫃銷貨彙總表-依抽成', value: '2' },
    { label: '專櫃銷貨彙總表-依類別', value: '3' }
  ];

  totalRecords = 0;
  data: any[] = [];
  lastQueryBody: any = null;
  footerData: any = null;

  // 初始化時先使用 columns1
  columns: any = columns1;
  columnGroup?: ColumnGroup[] = columnGroup;

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
    public readonly tls2e090Service: Tls2e090Service, // ***Service 注入修改***
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    // 設置初始查詢方法為第一個報表 (queryTls2e090)
    this.initializePage('TLS2E090', 'tls/tls2e090cru', this.queryForm, (form) => this.onSubmit(form)); // ***ProgNo/route 修改為 TLS2E090/tls2e090cru***

    // 監聽大分類變化 (保持不變)
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

          this.bus_classOptions = Object.values(groupedData);
        });
      } else {
        this.bus_classOptions = [];
        this.queryForm.controls.bus_classList.setValue([]);
      }
    });
  }

  // 處理 SelectButton 切換
  switchReport(type: ReportType) {
    // 如果切換到報表 2 或 3，設定 isTaxed 預設值
    if (type === '2' || type === '3') {
      this.isTaxed = true; // 預設為含稅
    }

    // 1. 切換欄位定義 (由 getDynamicColumns 處理)
    this.columns = this.getDynamicColumns();

    // 2. 清空數據
    this.data = [];
    this.footerData = null;
    this.totalRecords = 0;
    this.lastQueryBody = null;

    // 3. 觸發查詢 (可選)
    this.onSubmit(this.queryForm);
  }

  // 處理含稅/未稅切換
  onTaxChange(value: boolean) {
    this.isTaxed = value;
    // 動態更新欄位
    this.columns = this.getDynamicColumns();
  }

  // 動態取得表格欄位
  getDynamicColumns(): ReportColumn[] {
    let baseColumns: any;
    if (this.reportType === '1') {
      return columns1;
    } else if (this.reportType === '2') {
      baseColumns = columns2;
    } else { // '3'
      baseColumns = columns3;
    }

    if (this.isTaxed) {
      // 顯示含稅欄位 (AmtXXX, ProfitXXX)
      return baseColumns.filter((col: ReportColumn) => {
        // 排除 Namt 開頭的欄位
        return !col.field.startsWith('Namt');
      });
    } else {
      // 顯示未稅欄位 (NamtXXX, ProfitXXX)
      return baseColumns.filter((col: ReportColumn) => {
        // 排除 Amt 開頭的欄位
        return !col.field.startsWith('Amt');
      });
    }
  }

  // 取得當前報表應使用的查詢 Function (用於 TableReport 的分頁/排序)
  getCurrentQueryFunction() {
    switch (this.reportType) {
      case '1':
        return this.tls2e090Service.queryTls2e090.bind(this.tls2e090Service);
      case '2':
        return this.tls2e090Service.querySalCharge.bind(this.tls2e090Service);
      case '3':
        return this.tls2e090Service.querySalChargeCategory.bind(this.tls2e090Service);
      default:
        return this.tls2e090Service.queryTls2e090.bind(this.tls2e090Service);
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const rawBusClassList = frm.getRawValue().bus_classList;
      const transformedBusClassList: string[][] = rawBusClassList.map((item: any) => {
        const busType = item.bus_type || '';
        const busClassNo = item.No || '';
        return [busType, busClassNo];
      });

      const rawFormValue = frm.getRawValue();

      // 組裝 Request Body，補齊 Service 介面要求的欄位
      const body: Tls2e090QueryBody = {
        ...rawFormValue,
        sam_yyymm_Start: convertDateToYYYYMM(rawFormValue.sam_yyymm_Start),
        sam_yyymm_End: convertDateToYYYYMM(rawFormValue.sam_yyymm_End),
        bus_classList: transformedBusClassList,
        // 補齊 Service/Swagger 中有，但表單未定義的欄位
        isNet: true,
        cash_yn: '',
        store_wayList: [],
      }

      // 根據 reportType 呼叫不同的 Service 方法
      let query$: Observable<ApiResponse<any, any>>;
      switch (this.reportType) {
        case '1':
          query$ = this.tls2e090Service.queryTls2e090(body);
          break;
        case '2':
          query$ = this.tls2e090Service.querySalCharge(body);
          break;
        case '3':
          query$ = this.tls2e090Service.querySalChargeCategory(body);
          break;
      }

      query$.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        if (res.Data.length > 0) {
          this.data = res.Data;
          this.lastQueryBody = body;
          // footerData 總是取第一個元素，如果存在
          this.footerData = res.footerData && res.footerData.length > 0 ? res.footerData[0] : null;
          this.totalRecords = res.TotalCount;
        } else {
          this.data = [];
          this.footerData = null;
          this.totalRecords = 0;
          this.lastQueryBody = body;
        }
      });
    });
  }
}
