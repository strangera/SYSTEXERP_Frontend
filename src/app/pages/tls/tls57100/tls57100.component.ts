import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-tls57100',
  templateUrl: './tls57100.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    DropdownComponent,
    ReactiveFormsModule,
    InputTextComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    MultiSelectComponent,
    CalendarRangeQuickComponent
  ]
})
export class TLS57100Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    HOS_No: [null], // 倉庫代碼 multi-select
    LOGO_No: [null], // 品牌代碼 multi-select
    VEN_No: [''], // 廠商編號 multi-select
    APPLY_Date_Start: [null], // 申請日期 起 calendar-range
    APPLY_Date_End: [null], // 申請日期 迄
    APRV_Date_Start: [null], // 審核日期 起 calendar-range
    APRV_Date_End: [null], // 審核日期 迄
    documentType: [],
    inspectionReturnCode: ['', Validators.maxLength(16)],
    displayMode: [1],
  });
  totalRecords = 0;
  warehouseOptions: IDropdownItem[] = [];
  brandCodeOptions: IDropdownItem[] = [];
  vendorOptions: IDropdownItem[] = [];
  documentTypeOptions = [
    { value: 1, label: '進貨單' },
    { value: 2, label: '進退單' },
  ];
  priceChangeStatusOptions = [
    { value: 1, label: '已申請' },
    { value: 2, label: '已確認' },
    { value: 3, label: '已審核' }
  ];
  displayModeOptions = [
    { value: 1, label: '匯總' },
    { value: 2, label: '明細' },
  ];
  data: any[] = [];
  columns: any[] = [
    { field: 'warehouse', header: '倉別', visible: true },
    { field: 'brand', header: '品牌', visible: true },
    { field: 'applicationDate', header: '申請日期', visible: true },
    { field: 'approvalDate', header: '審核日期', visible: true },
    { field: 'orderNumber', header: '單號', visible: true },
    { field: 'orderType', header: '單據類型', visible: true },
    { field: 'orderStatus', header: '單據狀態', visible: true },
    { field: 'quantity', header: '數量', visible: true },
    { field: 'unitPrice', header: '售價', visible: true },
    { field: 'subtotal', header: '小計', visible: true },
  ];

  constructor(
    private readonly dropDownListService: DropDownListService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57100', 'tls/tls57100cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(response => {
      this.warehouseOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));// 倉別
    });
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
}
