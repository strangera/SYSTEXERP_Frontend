import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTLS57140DetailResponse, QueryTLS57140Request, QueryTLS57140ShowType, QueryTLS57140SummaryResponse, Tls57140Service } from '@service/api/tls/tls57140.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { convertDateToYYYYMM, formatAmount } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { ProductAutocompleteComponent } from 'src/app/shared/biz-components/product-autocomplete/product-autocomplete';

@Component({
  selector: 'app-tls57140',
  templateUrl: './tls57140.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    InputNumberComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    MultiSelectComponent,
    ProductAutocompleteComponent
  ]
})
export class TLS57140Component extends BasicQueryPageComponent<QueryTLS57140DetailResponse | QueryTLS57140SummaryResponse> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    /** 年月 */
    STK_YM: [new Date(), Validators.required],
    /** 倉別 */
    HOS_No: [null as string[] | null],
    /** 品牌 */
    LOGO_No: [null as string[] | null],
    /** 國際條碼/商品管理編號/廠商貨號 */
    PLU_MagNo: [null as string | null, Validators.maxLength(20)],
    /** 顯示方式 */
    ShowType: [QueryTLS57140ShowType.Summary, Validators.required],
    /** 分頁大小 */
    pageSize: [500],
  });

  // Dropdown options
  /** 倉別選項 */
  HOSOptions: IDropdownItem[] = [];
  /** 品牌選項 */
  LOGOOptions: IDropdownItem[] = [];

  /** 顯示方式選項 */
  showTypeOptions = [
    { value: QueryTLS57140ShowType.Summary, label: '彙總' },
    { value: QueryTLS57140ShowType.Detail, label: '明細' },
  ];

  // Table data
  data: (QueryTLS57140DetailResponse | QueryTLS57140SummaryResponse)[] = [];
  totalRecords = 0;
  lastQueryBody: QueryTLS57140Request | null = null;
  columns: ReportColumn[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls57140Service: Tls57140Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57140');

    // 監聽「顯示方式」變更，切換表格欄位
    this.queryForm.controls.ShowType.valueChanges.pipe(untilDestroyed(this)).subscribe(mode => {
      this.updateTableColumns(mode);
    });
    this.updateTableColumns(this.queryForm.controls.ShowType.value);

    // 載入倉別選項
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(response => {
      this.HOSOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });

    // 載入品牌選項
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.LOGOOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
  }

  /**
   * 根據顯示模式切換表格欄位
   * @param showType 1: 彙總, 2: 明細
   */
  updateTableColumns(showType: QueryTLS57140ShowType | null) {
    if (showType === QueryTLS57140ShowType.Summary) {
      // 彙總模式
      this.columns = [
        { field: 'LOGO_No', header: '品牌代碼' },
        { field: 'LOGO_NAME', header: '品牌' },
        { field: 'STK_SaleQty', header: '銷售數量', format: formatAmount },
        { field: 'STK_PriorQty', header: '期初存貨', format: formatAmount },
        { field: 'STK_CurrentQty', header: '期末存貨', format: formatAmount },
        { field: 'INV_TURNOVER', header: '週轉率' },
      ];
    } else if (showType === QueryTLS57140ShowType.Detail) {
      // 明細模式
      this.columns = [
        { field: 'LOGO_No', header: '品牌代碼' },
        { field: 'LOGO_NAME', header: '品牌' },
        { field: 'PLU_MagNo', header: '商品管理編號' },
        { field: 'PLU_NO', header: '國際條碼' },
        { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
        { field: 'PLU_NAME', header: '品名' },
        { field: 'PLU_OrderPrc', header: '標準進價', format: formatAmount },
        { field: 'PLU_SalePrc', header: '商品售價', format: formatAmount },
        { field: 'STK_SaleQty', header: '銷售數量', format: formatAmount },
        { field: 'STK_PriorQty', header: '期初存貨', format: formatAmount },
        { field: 'STK_CurrentQty', header: '期末存貨', format: formatAmount },
        { field: 'INV_TURNOVER', header: '迴轉率' },
      ];
    }
    this.data = [];
    console.log("data.length: " + this.data.length);
    this.totalRecords = 0;
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const requestBody: QueryTLS57140Request = {
        ShowType: formValue.ShowType,
        STK_YM: convertDateToYYYYMM(formValue.STK_YM),
        HOS_No: formValue.HOS_No || undefined,
        LOGO_No: formValue.LOGO_No || undefined,
        PLU_MagNo: formValue.PLU_MagNo || undefined,
        pageIndex: 1,
        pageSize: formValue.pageSize || 500,
        SortBy: formValue.ShowType === QueryTLS57140ShowType.Summary
          ? [{ field: 'LOGO_No', order: 1 }]
          : [{ field: 'LOGO_No', order: 1 }, { field: 'PLU_MagNo', order: 1 }],
      };

      this.tls57140Service.queryTLS57140(requestBody).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe(response => {
        this.lastQueryBody = requestBody;
        this.data = response.Data || [];
        this.totalRecords = response.TotalCount || 0;
      });
    });
  }
}
