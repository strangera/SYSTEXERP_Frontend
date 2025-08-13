import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AddButton, Column, createPaginationConfig, formatDateTime } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { CommonModule } from '@angular/common';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CalendarRangeQuickComponent } from "@shared/componentkit/calendar-range-quick/calendar-range-quick.component";
import { Tls56070Service } from '@service/api/tls/tls56070.service';
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
    TableComponent,
    CommonModule,
    MultiSelectComponent,
    CalendarRangeQuickComponent
  ],
})
export class TLS56070Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    SCRP_No: [null, [Validators.maxLength(16)]],
    LOGO_No: [null],
    SCRP_Status: [null],
    APPLY_USR_No: [null],
    APRV_USR_No: [null],
    APPLY_Date_Start: [null],
    APPLY_Date_End: [null],
    APRV_Date_Start: [null],
    APRV_Date_End: [null],
    HOS_No: [null],
    ...createPaginationConfig([{ field: 'SCRP_No', order: 1 }]),
  });
  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'SCRP_No', header: '報廢單編號', visible: true },
    { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDateTime },
    { field: 'HOS_No', header: '倉別', visible: true },
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'SCRP_Remark', header: '說明', visible: true },
    { field: 'APPLY_USR_No', header: '申請人', visible: true },
    { field: 'APRV_USR_No', header: '審核人', visible: true },
    { field: 'APRV_Date', header: '審核日期', visible: true, format: formatDateTime },
    { field: 'SCRP_Status', header: '單據狀態', visible: true, format: (value) => this.scrapStatusOptions.find((item) => item.value === value)?.label || value },
  ];

  multipleButtons: AddButton[] = [
    {
      label: '審核', icon: 'pi pi-check-circle text-green-500', action: (selectedItems) => {
        this.batchUpdateStatus(selectedItems, SCRPStatus.已審核);
      }, disabled: (item) => item.SCRP_Status !== SCRPStatus.已申請
    },
    {
      label: '已報廢', icon: 'pi pi-trash text-red-500', action: (selectedItems) => {
        this.batchUpdateStatus(selectedItems, SCRPStatus.已作廢);
      }, disabled: (item) => item.SCRP_Status !== SCRPStatus.已審核
    },
  ];

  scrapStatusOptions = [
    { label: '已申請', value: '1' },
    { label: '已審核', value: '2' },
    { label: '已作廢', value: '9' },
  ];

  brandOptions: { label: string; value: string }[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  userOptions: { label: string; value: string }[] = [];

  constructor(
    private tls56070Service: Tls56070Service,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56070', '/TLS/TLS56070CRU', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  loadDropdownOptions(): void {
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.brandOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ label: item.Name, value: item.No }));
    });
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const mockData = [
        {
          SCRP_No: 'SCRP20250813001',
          APPLY_Date: '2025-08-13',
          LOGO_No: 'LOGO01',
          HOS_No: 'H001',
          SCRP_TotBuyAmt: 1000,
          APPLY_USR_No: 'U001',
          APRV_USR_No: null,
          APRV_Date: null,
          SCRP_Remark: '備註1',
          SCRP_Status: '1',
          id: 1
        },
        {
          SCRP_No: 'SCRP20250812001',
          APPLY_Date: '2025-08-12',
          LOGO_No: 'LOGO02',
          HOS_No: 'H002',
          SCRP_TotBuyAmt: 500,
          APPLY_USR_No: 'U002',
          APRV_USR_No: 'U003',
          APRV_Date: '2025-08-12',
          SCRP_Remark: '備註2',
          SCRP_Status: '2',
          id: 2
        }
      ];
      // this.tls56070Service.queryScrapList(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
      //   this.data = response.Data;
      //   this.totalRecords = response.TotalCount;
      // });
      this.data = mockData;
      this.totalRecords = mockData.length;
      this.loading = false;
    });
  }

  btnLoading = false;

  batchUpdateStatus(selectedItems: any[], status: string): void {
    this.btnLoading = true;
    const idList = selectedItems.map(item => item.id);
    const body = {
      idList: idList,
      SCRP_Status: status
    };

    // this.tls56070Service.batchUpdateStatus(body).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(response => {
    //   this.messageService.successBubble(response.Message);
    //   this.onSubmit(this.queryForm);
    // });

    // 模擬成功訊息
    console.log(`批量更新報廢單狀態為 ${status}`, body);
    this.btnLoading = false;
    this.onSubmit(this.queryForm);
  }

  editDisabled(rowData: any) {
    return rowData.SCRP_Status !== SCRPStatus.已申請;
  }
}
