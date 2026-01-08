/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryPLUResponse, QueryTLS57040Request, Tls57040Service } from '@service/api/tls/tls57040.service';
import { QueryTLS57140DetailResponse, QueryTLS57140Request, QueryTLS57140ShowType, QueryTLS57140SummaryResponse, Tls57140Service } from '@service/api/tls/tls57140.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { Column, convertDateToYYYYMM, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { debounceTime, finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

@Component({
  selector: 'app-tls57140',
  templateUrl: './tls57140.component.html',
  styleUrl: './tls57140.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    InputNumberComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    DropdownTableComponent,
    MultiSelectComponent,
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
    /** 商品管理編號/國際條碼/廠商貨號 */
    PLU_MagNo: [null as string | null, Validators.maxLength(20)],
    /** 顯示方式 */
    ShowType: [QueryTLS57140ShowType.Summary, Validators.required],
    /** 分頁大小 */
    pageSize: [30],
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

  // 商品管理編號 (Dropdown-Table) 相關屬性
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', Validators.maxLength(20)],
    PLU_Name: ['', Validators.maxLength(60)],
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  suggestions: QueryPLUResponse[] = [];
  opData: QueryPLUResponse[] = [];
  opTotalRecords = 0;
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
  ];
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls57140Service: Tls57140Service,
    private readonly tls57040Service: Tls57040Service,
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
        { field: 'LOGO_NAME', header: '品牌' },
        { field: 'STK_SaleQty', header: '銷售數量', format: formatAmount },
        { field: 'STK_PriorQty', header: '期初存貨', format: formatAmount },
        { field: 'STK_CurrentQty', header: '期末存貨', format: formatAmount },
        { field: 'INV_TURNOVER', header: '週轉率' },
      ];
    } else if (showType === QueryTLS57140ShowType.Detail) {
      // 明細模式
      this.columns = [
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
        PageIndex: 1,
        PageSize: formValue.PageSize || 30,
        SortBy: formValue.ShowType === QueryTLS57140ShowType.Summary
          ? [{ field: 'LOGO_NAME', order: 1 }]
          : [{ field: 'LOGO_NAME', order: 1 }, { field: 'PLU_MagNo', order: 1 }],
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

  // 商品管理編號 (dropdown-table) 的自動完成輸入事件
  onAutoCompleteInputChange(event: any) {
    const body = {
      queryNo: event.PLU_MagNo || '',
      PLU_MagNo: undefined,
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    };
    this.tls57040Service.queryPLUForDropdown(body).pipe(
      untilDestroyed(this),
      debounceTime(300)
    ).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: `${item.PLU_MagNo}/${item.PLU_No}/${item.PLU_OrgPLUNo} - ${item.PLU_Name}`
      }))];
    });
  }

  // 商品管理編號 (dropdown-table) 的表單值改變事件
  onformValueChanged(event: QueryTLS57040Request) {
    this.opLoading = true;
    const body = {
      ...event,
      queryNo: undefined,
      PLU_MagNo: event.queryNo || '',
      PLU_Name: event.PLU_Name || '',
    };
    this.tls57040Service.queryPLUForDropdown(body).pipe(
      untilDestroyed(this),
      debounceTime(300)
    ).subscribe((results) => {
      this.opData = [...results.Data];
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }
}
