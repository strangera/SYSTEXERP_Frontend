import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { POS2023DAMResponse, QueryTLS56070Request, Tls56070Service } from '@service/api/tls/tls56070.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from "@shared/componentkit/calendar-range-quick/calendar-range-quick.component";
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, formatAmount, formatDate, formatDateTime } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';

export const enum SCRPStatus {
  已申請 = '1',
  已審核 = '2',
  已作廢 = '9',
}

@Component({
  selector: 'app-tls56070',
  templateUrl: './tls56070.component.html',
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
    CalendarRangeQuickComponent,
    AsyncPipe,
    ButtonModule
  ],
})
export class TLS56070Component extends BasicQueryPageComponent<POS2023DAMResponse> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    DAM_No: [null, [Validators.maxLength(16)]],
    HOS_NoList: [null],
    LOGO_NoList: [null],
    DAM_StatusList: [null],
    APPLY_Date_Start: [null],
    APPLY_Date_End: [null],
    APPLY_USR: [null],
    APRV_Date_Start: [null],
    APRV_Date_End: [null],
    APRV_USR: [null],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'APPLY_Date', order: -1 }, { field: 'DAM_No', order: -1 }]],
  });
  totalRecords = 0;
  data: POS2023DAMResponse[] = [];
  selectedItems: POS2023DAMResponse[] = [];
  lastQuery: QueryTLS56070Request | null = null;
  columns: Column[] = [
    { field: 'DAM_No', header: '報廢單編號', visible: true },
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'HOS_No', header: '倉別代碼', visible: true },
    { field: 'HOS_NAME', header: '倉別名稱', visible: true },
    { field: 'org_id', header: '組織編號', visible: true },
    { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDate },
    { field: 'APPLY_USR_No', header: '申請人編號', visible: true },
    { field: 'APPLY_USR_Name', header: '申請人名稱', visible: true },
    { field: 'DAM_Status', header: '單據狀態', visible: true, format: (value) => this.scrapStatusOptions.find((item) => item.value === value)?.label || value },
    { field: 'APRV_Date', header: '審核日期', visible: true, format: formatDate },
    { field: 'APRV_USR_No', header: '審核人編號', visible: true },
    { field: 'APRV_USR_Name', header: '審核人名稱', visible: true },
    { field: 'DAM_TotQty', header: '報廢數量合計', visible: true, format: formatAmount },
    { field: 'DAM_TotBuyNet', header: '報廢未稅進價小計', visible: true, format: formatAmount },
    { field: 'DAM_TotBuyTax', header: '報廢進價稅額小計', visible: true, format: formatAmount },
    { field: 'DAM_TotBuyAmt', header: '報廢進價合計', visible: true, format: formatAmount },
    { field: 'DAM_TotSaleNet', header: '報廢未稅售價小計', visible: true, format: formatAmount },
    { field: 'DAM_TotSaleTax', header: '報廢售價稅額小計', visible: true, format: formatAmount },
    { field: 'DAM_TotSaleAmt', header: '報廢售價合計', visible: true, format: formatAmount },
    { field: 'VOID_Date', header: '作廢日期', visible: true, format: formatDate },
    { field: 'VOID_USR_No', header: '作廢人員', visible: true },
    { field: 'VOID_USR_Name', header: '作廢人員姓名', visible: true },
    { field: 'DAM_Date', header: '報廢日期', visible: true, format: formatDate },
    { field: 'DAM_USR_No', header: '報廢人員', visible: true },
    { field: 'DAM_USR_Name', header: '報廢人員姓名', visible: true },
    { field: 'ReAPRV_Date', header: '反審核日期', visible: false, format: formatDate },
    { field: 'ReAPRV_USR_No', header: '反審核人員', visible: false },
    { field: 'ReAPRV_USR_Name', header: '反審核人員姓名', visible: false },
    { field: 'DAM_Remark', header: '說明', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime }, // 建立日期
    { field: 'CRT_USR_No', header: '建立人員', visible: false }, // 建立人員
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 建立人員姓名
    { field: 'CRT_Date', header: '變更日期', visible: false, format: formatDateTime }, // 變更日期
    { field: 'CRT_USR_No', header: '變更人員', visible: false }, // 變更人員
    { field: 'CRT_USR_Name', header: '變更人員姓名', visible: false }, // 變更人員姓名
  ];
  scrapStatusOptions = getSYS1000Options('DAM_Status');

  brandOptions = this.dropdown.queryPluLogo();
  warehouseOptions = this.dropdown.queryPos2034();
  userOptions = this.dropdown.queryTblUser();

  constructor(
    public readonly tls56070Service: Tls56070Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56070', '/TLS/TLS56070CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.tls56070Service.queryTLS56070(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.data = response.Data;
        this.lastQuery = frm.value;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  btnLoading = signal(false);

  batchUpdateStatus(status: string): void {
    const body = {
      DetailList: this.selectedItems.map(item => ({
        DAM_No: item.DAM_No,
        DAM_Status: status
      }))
    };
    this.btnLoading.set(true);
    this.tls56070Service.updateStatusTLS56070(body).pipe(untilDestroyed(this), finalize(() => this.btnLoading.set(false))).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.selectedItems = [];
      this.onSubmit(this.queryForm);
    });
  }

  editDisabled(rowData: POS2023DAMResponse) {
    return rowData.DAM_Status !== SCRPStatus.已申請;
  }

  canExecuteAction(targetRequiredStatus: string): boolean {
    if (this.selectedItems.length === 0) return false;
    return this.selectedItems[0].DAM_Status === targetRequiredStatus;
  }
  isRowSelectable = (rowData: POS2023DAMResponse): boolean => {
    // 1. 基本條件：已報廢(3)或已作廢(9)永遠不能選
    if (rowData.DAM_Status !== '1' && rowData.DAM_Status !== '2') {
      return false;
    }

    // 2. 如果目前沒有選取任何東西，只要是 1 或 2 都可以選
    if (this.selectedItems.length === 0) {
      return true;
    }

    // 3. 動態互斥判斷
    const firstSelectedStatus = this.selectedItems[0].DAM_Status;

    // 如果目前選的是「已申請」，則只有「已申請」的可以繼續勾選
    // 如果目前選的是「已審核」，則只有「已審核」的可以繼續勾選
    return rowData.DAM_Status === firstSelectedStatus;
  }
}
