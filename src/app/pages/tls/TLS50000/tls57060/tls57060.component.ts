import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryPLUResponse, QueryTLS57040Request, Tls57040Service } from '@service/api/tls/tls57040.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, createPaginationConfig } from '@others/component/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-tls57060',
  templateUrl: './tls57060.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    DropdownTableComponent
  ],
})
export class TLS57060Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    displayMode: [null],
    TXN_SaleNoteNo: ['', Validators.maxLength(8)],
    TXN_DateStart: [yesterday],
    TXN_DateEnd: [yesterday],
    TLT_Name: [null],
    PLU_MagNo: ['', Validators.maxLength(20)],
    PLU_No: ['', Validators.maxLength(13)],
    VEN_No: [null],
    pageSize: [30],
    pageIndex: [1],
  });
  totalRecords = 0;
  displayModeOptions = [
    { value: 1, label: '匯總' },
    { value: 2, label: '明細' },
  ];
  brandCodeOptions: IDropdownItem[] = [];
  vendorOptions: IDropdownItem[] = [];
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  suggestions: QueryPLUResponse[] = [];
  opData: QueryPLUResponse[] = [];
  opTotalRecords = 0;
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', mainDataField: true },
  ];
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  data: any[] = [];
  lastQueryBody: any = {};
  columns: Column[] = [
    { field: 'salesOrderNumber', header: '銷售單號', visible: true },
    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'cashRegister', header: '收銀機號', visible: true },
    { field: 'transactionSequence', header: '交易序號', visible: true },
    { field: 'brand', header: '品牌', visible: true },
    { field: 'invoiceNumber', header: '發票號碼', visible: true },
    { field: 'quantity', header: '數量', visible: true },
    { field: 'salesFixedPrice', header: '銷售定價', visible: true },
    { field: 'salesAmount', header: '銷售金額', visible: true },
    { field: 'adjustmentAmount', header: '整形折價', visible: true },
    { field: 'adjustmentDiscount', header: '整形折扣', visible: true },
  ];

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls57040Service: Tls57040Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57060', 'tls/tls57060cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandCodeOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));// 品牌
    })
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.vendorOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` })); // 廠商
    })
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => { });
  }
  // 商品管理編號 (dropdown-table) 的自動完成輸入事件
  onAutoCompleteInputChange(event: any) {
    const body = {
      queryNo: event.PLU_MagNo || '',
      PLU_MagNo: undefined,
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }
    this.tls57040Service.queryPLUForDropdown(body).pipe(untilDestroyed(this), debounceTime(300)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: `${item.PLU_MagNo} - ${item.PLU_Name}`
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
      PLU_No: event.PLU_No || '',
      PLU_OrgPLUNo: event.PLU_OrgPLUNo || '',
      PLU_Name: event.PLU_Name || '',
    };
    this.tls57040Service.queryPLUForDropdown(body).pipe(untilDestroyed(this), debounceTime(300)).subscribe((results) => {
      this.opData = [...results.Data]; // 更新data資料
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }
}
