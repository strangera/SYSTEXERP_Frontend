import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryTLS56060Request, ITLS56060Response, Tls56060Service } from '@service/api/tls/tls56060.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ProductAutocompleteComponent } from '@shared/biz-components/product-autocomplete/product-autocomplete';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, formatDateTime } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-tls56060',
  templateUrl: './tls56060.component.html',
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
    AsyncPipe
  ],
})
export class TLS56060Component extends BasicQueryPageComponent<ITLS56060Response> implements OnInit {
  queryForm = this.formBuilder.group({
    MVM_No: [null, [Validators.maxLength(14)]],               // varchar(12)
    queryNo: [null, [Validators.maxLength(20)]],          // 非 POS2021 欄位，保留不設驗證
    IN_HOS_NoList: [null],          // varchar(6)
    LOGO_NoList: [null],                                        // 非 POS2021 欄位，保留不設驗證
    MVM_StatusList: [null],            // varchar(1)
    CRT_USR_No: [null],            // varchar(8)
    DEP_No: [null],                                         // 非 POS2021 欄位，保留不設驗證
    OUTGODS_Date_Start: [null],                                 // datetime，預設無驗證
    OUTGODS_Date_End: [null],                                 // datetime，預設無驗證
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'APPLY_Date', order: -1 }, { field: 'MVM_No', order: -1 }]],
  });
  totalRecords = 0;
  data: ITLS56060Response[] = [];
  lastQuery: IQueryTLS56060Request | null = null;
  columns: Column[] = [
    { field: 'MVM_No', header: '調撥單編號', visible: true },
    { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDateTime },
    { field: 'IN_HOS_No_NAME', header: '調入倉別', visible: true },
    { field: 'OUT_HOS_No_NAME', header: '調出倉別', visible: true },
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'MVM_Remark', header: '說明', visible: true },
    { field: 'APPLY_USR_No', header: '申請人編號', visible: true },
    { field: 'APPLY_USR_Name', header: '申請人姓名', visible: true },
    { field: 'APRV_USR_No', header: '審核人編號', visible: true },
    { field: 'APRV_USR_Name', header: '審核人姓名', visible: true },
    { field: 'APRV_Date', header: '審核日期', visible: true, format: formatDateTime },
    { field: 'MVM_Status', header: '單據狀態', visible: true, format: (value) => this.issuanceNoteStatusOptions.find((item) => item.value === value)?.label || value },
  ];
  // 倉別調撥單狀態選項
  issuanceNoteStatusOptions = [
    { label: '已發貨', value: '3' },
    { label: '已收貨確認', value: '4' },
  ];
  brandOptions = this.dropDown.queryPluLogo(); // 品牌選項
  warehouseOptions = this.dropDown.queryPos2034(); // 倉別
  userOptions = this.dropDown.queryTblUser(); // 人員選項
  DEP_NoOptions: { label: string; value: string }[] = [];// 部門編號
  constructor(
    public readonly tls56060Service: Tls56060Service,
    private readonly dropDown: DropdownApiService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS56060', '/TLS/TLS56060CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const body = {
        PageSize: formValue.pageSize,
        PageIndex: formValue.pageIndex,
        SortBy: formValue.SortBy,
        MVM_No: formValue.MVM_No,
        queryNo: formValue.queryNo,
        IN_HOS_NoList: formValue.IN_HOS_NoList,
        LOGO_NoList: formValue.LOGO_NoList,
        MVM_StatusList: formValue.MVM_StatusList,
        OUTGODS_Date_Start: formValue.OUTGODS_Date_Start,
        OUTGODS_Date_End: formValue.OUTGODS_Date_End,
      }
      this.tls56060Service.queryTLS56060(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(results => {
        this.data = results.Data; // 更新data資料
        this.lastQuery = body;
        this.totalRecords = results.TotalCount;
      });
    });
  }
  editDisabled(rowData: ITLS56060Response): boolean {
    // 如果狀態不是 '已發貨'，則禁用行編輯
    return rowData.MVM_Status !== '3';
  }
}
