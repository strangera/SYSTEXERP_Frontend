import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryTLS56080Request, IQueryTLS56080Response, Tls56080Service } from '@service/api/tls/tls56080.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ProductAutocompleteComponent } from '@shared/biz-components/product-autocomplete/product-autocomplete';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from "@shared/componentkit/calendar-range-quick/calendar-range-quick.component";
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate } from '@shared/componentkit/table-report/table-report.model';
import { Column } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';

export const enum TRDStatus {
  申請中 = '1',
  已確認 = '2',
  已審核 = '3',
  已結案 = '7',
  作廢 = '9',
}

@Component({
  selector: 'app-tls56080',
  templateUrl: './tls56080.component.html',
  standalone: true,
  imports: [
    ProductAutocompleteComponent,
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
    CalendarRangeQuickComponent,
    ButtonModule,
    AsyncPipe
  ],
})
export class TLS56080Component extends BasicQueryPageComponent<IQueryTLS56080Response> implements OnInit {
  queryForm = this.formBuilder.group({
    TRD_No: [null, [Validators.maxLength(16)]],
    queryNo: [null, [Validators.maxLength(20)]],          // 非 POS2021 欄位，保留不設驗證
    HOS_NoList: [null],
    LOGO_NoList: [null],
    TRD_StatusList: [null],
    TRD_ReasonList: [null],
    APPLY_USR: [null],
    APPLY_Date_Start: [null],
    APPLY_Date_End: [null],
    APRV_USR: [null],
    APRV_Date_Start: [null],
    APRV_Date_End: [null],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'APPLY_Date', order: -1 }, { field: 'TRD_No', order: -1 }]],
  });
  totalRecords = 0;
  data: IQueryTLS56080Response[] = [];
  selectedItems: IQueryTLS56080Response[] = [];
  lastQuery: IQueryTLS56080Request | null = null;
  columns: Column[] = [
    { field: 'TRD_No', header: '調撥單編號', visible: true },
    { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDate },
    { field: 'VEN_No', header: '廠商編號', visible: true },
    { field: 'HOS_No', header: '倉別', visible: true },
    { field: 'IN_TotBuyAmt', header: '調入金額', visible: true },
    { field: 'OUT_TotBuyAmt', header: '調出金額', visible: true },
    { field: 'DIFF_TotBuyAmt', header: '差異金額', visible: true },
    { field: 'TRD_Reason', header: '調撥原因', visible: true, format: (value) => this.reasonOptions.find((item) => item.value === value)?.label || value },
    { field: 'APPLY_USR_No', header: '申請人', visible: true },
    { field: 'Confim_USR_No', header: '確認人', visible: true },
    { field: 'Confim_Date', header: '確認日期', visible: true, format: formatDate },
    { field: 'TRD_Remark', header: '說明', visible: true },
    { field: 'TRD_Status', header: '單據狀態', visible: true, format: (value) => this.transferStatusOptions.find((item) => item.value === value)?.label || value },
  ];

  transferStatusOptions = [
    { label: '申請中', value: '1' },
    { label: '已確認', value: '2' },
    { label: '已審核', value: '3' },
    { label: '已結案', value: '7' },
    { label: '作廢', value: '9' },
  ];

  reasonOptions = [
    { label: '庫存過高', value: '1' },
    { label: '同業調貨', value: '2' },
    { label: '同業缺貨', value: '3' },
    { label: '其它', value: '4' },
    { label: '特殊', value: '5' },
  ];

  brandOptions = this.dropdown.queryPluLogo();
  warehouseOptions = this.dropdown.queryPos2034();
  userOptions = this.dropdown.queryTblUser();

  constructor(
    public readonly tls56080Service: Tls56080Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56080', '/TLS/TLS56080CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.tls56080Service.queryTLS56080(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.lastQuery = frm.value;
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  btnLoading = false;

  batchUpdateStatus(status: string): void {
    const body = {
      DetailList: this.selectedItems.map(item => ({
        TRD_No: item.TRD_No,
        TRD_Status: status
      }))
    };
    this.btnLoading = true;
    this.tls56080Service.updateStatusTLS56080(body).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onSubmit(this.queryForm);
    });
  }
  checkStatus(status: string): boolean {
    return this.selectedItems.some(item => item.TRD_Status !== status);
  }
  editDisabled(rowData: IQueryTLS56080Response): boolean {
    return rowData.TRD_Status !== TRDStatus.申請中;
  }
}
