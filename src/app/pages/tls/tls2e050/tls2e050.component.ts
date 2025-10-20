import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MainData,TotalData, Tls2e050Service } from '../../../service/api/tls/tls2e050.service';
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
import { Column, convertDateToYYYYMM, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { debounceTime, finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { AsyncPipe } from '@angular/common';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';

// 2.2.14.5 專櫃帳款試算彙總表
@Component({
  selector: 'app-tls2e050',
  templateUrl: './tls2e050.component.html',
  standalone: true,
  imports: [InputNumberComponent, AsyncPipe, RadiobuttonYNComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, CheckboxModule, CustomFooterTableComponent, TranslateModule]
})
export class TLS2E050Component extends BasicQueryPageComponent<MainData> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm_Start: [], // 查詢年月(起)
    sam_yyymm_End: [], // 查詢年月(迄)
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
    ...createPaginationConfig([{ field: 'ven_no', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: MainData[] = [];
  footerData: TotalData[] = [];
  columns: Column[] = [
    // 廠商及專櫃基本資訊
    { field: 'ven_no', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
    { field: 'tlt_term_type_Name', header: '抽成方式' },
    { field: 'sam_yyymm', header: '結帳年月' },
    { field: 'bus_type_name', header: '大分類' },
    { field: 'money_type_Name', header: '結帳方式' },

    // 帳務資訊
    { field: 'sam_termno', header: '帳次' },
    { field: 'check_day', header: '結帳後幾日付款' }, // 結帳後幾日付款

    // 銷貨淨額
    { field: 'sam_sales_namt', header: '銷貨淨額(應稅)', isTotal: true,format: formatAmount },
    { field: 'sam_sales_notaxamt', header: '銷貨淨額(免稅)', isTotal: true,format: formatAmount },
    { field: 'sam_sales_tax', header: '銷貨淨額(稅額)', isTotal: true,format: formatAmount },

    // 抽成額
    { field: 'sam_profit', header: '抽成額(應稅)', isTotal: true,format: formatAmount },
    { field: 'sam_notax_profit', header: '抽成額(免稅)', isTotal: true,format: formatAmount },
    { field: 'sam_profit_tax', header: '抽成額(稅額)', isTotal: true,format: formatAmount },

    // 進貨 (應付相關)
    { field: 'sam_ap_namt', header: '進貨(應稅)', isTotal: true,format: formatAmount },
    { field: 'sam_ap_notaxamt', header: '進貨(免稅)', isTotal: true,format: formatAmount },
    { field: 'sam_ap_tax', header: '進項稅額', isTotal: true,format: formatAmount },
    { field: 'sam_ap_amt', header: '進貨總額(含稅)', isTotal: true,format: formatAmount },

    // 代扣/租金 (應收項目)
    { field: 'sam_fare_namt', header: '代扣未稅(開立)', isTotal: true,format: formatAmount },
    { field: 'sam_fare_tax', header: '代扣稅額', isTotal: true,format: formatAmount },
    { field: 'sam_fare_notaxamt', header: '代扣金額(不開立)', isTotal: true,format: formatAmount },
    { field: 'sam_rent_namt', header: '租金未稅', isTotal: true,format: formatAmount },
    { field: 'sam_rent_tax', header: '租金稅額', isTotal: true,format: formatAmount },

    // 最終合計
    { field: 'acc_receivable', header: '應收合計', isTotal: true,format: formatAmount },
    { field: 'sam_under_limit_amt', header: '包底抽成不足(含稅)', isTotal: true,format: formatAmount },
    { field: 'acc_payable', header: '應付帳款(含稅)', isTotal: true,format: formatAmount },
  ];
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
    private readonly tls2e050Service: Tls2e050Service,
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E050', 'tls/tls2e050cru', this.queryForm, (form) => this.onSubmit(form));
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
    this.handleSubmit(frm, () => {
      this.tls2e050Service.queryTls2e050(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.footerData = response.footerData;
        this.totalRecords = response.TotalCount;
        this.messageService.successBubble(response.Message);
      })
    })
  }
}
