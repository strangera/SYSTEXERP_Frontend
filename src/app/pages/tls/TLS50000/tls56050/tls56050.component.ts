import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryTLS56050Request, ITLS56050Response, Tls56050Service } from '@service/api/tls/tls56050.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ProductAutocompleteComponent } from '@shared/biz-components/product-autocomplete/product-autocomplete';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { Column, formatDateTime } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls56050',
  templateUrl: './tls56050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    TranslateModule,
    TableReportComponent,
    CommonModule,
    MultiSelectComponent,
    CalendarRangeComponent,
    ProductAutocompleteComponent,
    AsyncPipe
  ],
})
export class TLS56050Component extends BasicQueryPageComponent<ITLS56050Response> implements OnInit {
  queryForm = this.formBuilder.group({
    MVM_No: [null, [Validators.maxLength(14)]],               // varchar(12)
    queryNo: [null, [Validators.maxLength(20)]],          // 非 POS2021 欄位，保留不設驗證
    OUT_HOS_NoList: [null],          // varchar(6)
    IN_HOS_NoList: [null],          // varchar(6)
    LOGO_NoList: [null],                                        // 非 POS2021 欄位，保留不設驗證
    MVM_StatusList: [null],            // varchar(1)
    APPLY_Date_Start: [null],                             // datetime，預設無驗證
    APPLY_Date_End: [null],                               // datetime，預設無驗證
    APPLY_USR: [null, [Validators.maxLength(8)]],            // varchar(8)
    APRV_Date_Start: [null],                            // datetime，預設無驗證
    APRV_Date_End: [null],                              // datetime，預設無驗證
    APRV_USR: [null],          // varchar(8)
    OUTGODS_Date_Start: [null],                                 // datetime，預設無驗證
    OUTGODS_Date_End: [null],                                 // datetime，預設無驗證
    OUTGODS_USR: [null],          // varchar(8)
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'APPLY_Date', order: -1 }, { field: 'MVM_No', order: -1 }]],
  });
  totalRecords = 0;
  data: ITLS56050Response[] = [];
  lastQuery: IQueryTLS56050Request | null = null;
  columns: Column[] = [
    { field: 'MVM_No', header: '調撥單編號', visible: true },
    { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDateTime },
    { field: 'IN_HOS_No', header: '調入倉別', visible: true },
    { field: 'OUT_HOS_No', header: '調出倉別', visible: true },
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'MVM_Remark', header: '說明', visible: true },
    { field: 'CRT_USR_No', header: '申請人', visible: true },
    { field: 'Confirm_USR_No', header: '審核人編號', visible: true },
    { field: 'Confirm_USR_Name', header: '審核人姓名', visible: true },
    { field: 'Confirm_DATE', header: '審核日期', visible: true, format: formatDateTime },
    { field: 'MVM_Status', header: '單據狀態', visible: true, format: (value) => this.issuanceNoteStatusOptions2.find((item) => item.value === value)?.label || value },
  ];
  // 倉別調撥單狀態選項
  issuanceNoteStatusOptions = [
    { label: '已審核', value: '2' },
    { label: '已發貨', value: '3' },
    { label: '已收貨確認', value: '4' },
    // { label: '已作廢', value: '9' },
  ];

  // 倉別調撥單狀態選項
  issuanceNoteStatusOptions2 = [
    { label: '已申請', value: '1' },
    { label: '已審核', value: '2' },
    { label: '已發貨', value: '3' },
    { label: '已收貨確認', value: '4' },
    { label: '已作廢', value: '9' },
  ];

  brandOptions = this.dropDown.queryPluLogo(); // 品牌選項
  warehouseOptions = this.dropDown.queryPos2034(); // 倉別
  userOptions = this.dropDown.queryTblUser(); // 人員選項
  constructor(
    public readonly tls56050Service: Tls56050Service,
    private readonly dropDown: DropdownApiService,
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS56050', '/TLS/TLS56050CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const params = {
        ...frm.value,
        OUT_HOS_NoList: Array.isArray(frm.value.OUT_HOS_NoList) ? frm.value.OUT_HOS_NoList : [frm.value.OUT_HOS_NoList].filter(Boolean),
        IN_HOS_NoList: Array.isArray(frm.value.IN_HOS_NoList) ? frm.value.IN_HOS_NoList : [frm.value.IN_HOS_NoList].filter(Boolean),
        MVM_StatusList: Array.isArray(frm.value.MVM_StatusList) ? frm.value.MVM_StatusList : [frm.value.MVM_StatusList].filter(Boolean),
        LOGO_NoList: Array.isArray(frm.value.LOGO_NoList) ? frm.value.LOGO_NoList : [frm.value.LOGO_NoList].filter(Boolean),
        APPLY_USR: frm.value.APPLY_USR,
        APRV_USR: frm.value.APRV_USR,
      };
      this.tls56050Service.queryTLS56050(params).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.lastQuery = params;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  editDisabled(rowData: ITLS56050Response): boolean {
    // 如果狀態不是 '已審核'，則禁用行編輯
    return rowData.MVM_Status !== '2';
  }
}
