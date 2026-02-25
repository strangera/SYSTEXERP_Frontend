import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryTLS56040Request, ITLS56040Data, Tls56040Service } from '@service/api/tls/tls56040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ProductAutocompleteComponent } from '@shared/biz-components/product-autocomplete/product-autocomplete';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from "@shared/componentkit/calendar-range-quick/calendar-range-quick.component";
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, Column, formatDate } from '@shared/componentkit/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

export const enum MVMStatus {
  已申請 = '1',
  已審核 = '2',
  已發貨 = '3',
  已收貨確認 = '4',
  已作廢 = '9',
}

@Component({
  selector: 'app-tls56040',
  templateUrl: './tls56040.component.html',
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
export class TLS56040Component extends BasicQueryPageComponent<ITLS56040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    MVM_No: [null, [Validators.maxLength(14)]],
    MVM_StatusList: [null], // 使用 MVM_StatusList 陣列
    queryNo: [null, [Validators.maxLength(20)]], // 對應 PLU_MagNo
    LOGO_NoList: [null], // 使用 LOGO_NoList 陣列
    OUT_HOS_NoList: [null], // 使用 OUT_HOS_NoList 陣列
    IN_HOS_NoList: [null], // 使用 IN_HOS_NoList 陣列
    APPLY_USR: [this.authService.currentUserValue?.user_No], // 對應 APPLY_USR
    APPLY_Date_Start: [yesterday],
    APPLY_Date_End: [yesterday],
    APRV_USR: [null as string | null], // 對應 APRV_USR
    APRV_Date_Start: [null],
    APRV_Date_End: [null],
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'MVM_No', order: 1 }]],
  });
  totalRecords = 0;
  data: ITLS56040Data[] = [];
  lastQuery: IQueryTLS56040Request | null = null;
  columns: Column[] = [
    { field: 'MVM_No', header: '調撥單編號', visible: true },
    { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDate },
    { field: 'IN_HOS_No', header: '調入倉別', visible: true },
    { field: 'OUT_HOS_No', header: '調出倉別', visible: true },
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'MVM_Remark', header: '說明', visible: true },
    { field: 'APPLY_USR_No', header: '申請人編號', visible: true },
    { field: 'APPLY_USR_Name', header: '申請人姓名', visible: true },
    { field: 'APRV_USR_No', header: '審核人編號', visible: true },
    { field: 'APRV_USR_Name', header: '審核人姓名', visible: true },
    { field: 'APRV_Date', header: '審核日期', visible: true, format: formatDate },
    { field: 'MVM_Status', header: '調撥狀態', visible: true, format: (value) => this.issuanceNoteStatusOptions.find((item) => item.value === value)?.label || value },
  ];
  addButton: AddButton[] = [
    { label: '審核', icon: 'pi pi-check-circle text-green-500', action: (rowData: ITLS56040Data) => { this.statusChange(rowData, MVMStatus.已審核); }, disabled: (rowData: ITLS56040Data) => rowData.MVM_Status !== MVMStatus.已申請 }, // 審核
    { label: '反審核', icon: 'pi pi-undo text-orange-500', action: (rowData: ITLS56040Data) => { this.statusChange(rowData, MVMStatus.已申請); }, disabled: (rowData: ITLS56040Data) => rowData.MVM_Status !== MVMStatus.已審核 }, // 反審核
    { label: '作廢', icon: 'pi pi-trash text-red-500', action: (rowData: ITLS56040Data) => { this.statusChange(rowData, MVMStatus.已作廢); }, disabled: (rowData: ITLS56040Data) => rowData.MVM_Status !== MVMStatus.已申請 }, // 作廢
  ];

  // 倉別調撥單狀態選項
  issuanceNoteStatusOptions = getSYS1000Options('MVM_Status')

  brandOptions = this.dropDown.queryPluLogo(); // 品牌選項
  warehouseOptions = this.dropDown.queryPos2034(); // 倉別
  userOptions = this.dropDown.queryTblUser(); // 人員選項

  constructor(
    public readonly tls56040Service: Tls56040Service,
    private readonly dropDown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56040', '/TLS/TLS56040CRU', this.queryForm, (form) => this.onSubmit(form));
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
      this.tls56040Service.queryTLS56040(params).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.lastQuery = params;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  btnLoading = false;
  statusChange(rowData: ITLS56040Data, status: string) {
    this.btnLoading = true;
    const body = {
      DetailList: [
        {
          MVM_No: rowData.MVM_No,
          MVM_Status: status
        }
      ]
    };
    this.tls56040Service.updateStatusTLS56040(body).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onSubmit(this.queryForm);
    });
  }

  editDisabled(rowData: ITLS56040Data) {
    return rowData.MVM_Status !== MVMStatus.已申請;
  }
}
