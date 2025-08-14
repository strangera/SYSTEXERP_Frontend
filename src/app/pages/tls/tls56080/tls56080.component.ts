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
import { Tls56080Service } from '@service/api/tls/tls56080.service';
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
    CalendarRangeQuickComponent,
  ],
})
export class TLS56080Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TRD_No: [null, [Validators.maxLength(16)]],
    TRD_Status: [null, [Validators.maxLength(1)]],
    LOGO_No: [null],
    HOS_No: [null, [Validators.maxLength(10)]],
    VEN_No: [null, [Validators.maxLength(16)]],
    TRD_Reason: [null, [Validators.maxLength(1)]],
    APPLY_USR_No: ['', [Validators.maxLength(16)]],
    APPLY_Date_Start: [null],
    APPLY_Date_End: [null],
    ...createPaginationConfig([{ field: 'TRD_No', order: 1 }]),
  });
  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'TRD_No', header: '調撥單編號', visible: true },
    { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDateTime },
    { field: 'VEN_No', header: '廠商編號', visible: true },
    { field: 'HOS_No', header: '倉別', visible: true },
    { field: 'IN_TotBuyAmt', header: '調入金額', visible: true },
    { field: 'OUT_TotBuyAmt', header: '調出金額', visible: true },
    { field: 'DIFF_TotBuyAmt', header: '差異金額', visible: true },
    { field: 'TRD_Reason', header: '調撥原因', visible: true, format: (value) => this.reasonOptions.find((item) => item.value === value)?.label || value },
    { field: 'APPLY_USR_No', header: '申請人', visible: true },
    { field: 'Confim_USR_No', header: '確認人', visible: true },
    { field: 'Confim_Date', header: '確認日期', visible: true, format: formatDateTime },
    { field: 'TRD_Remark', header: '說明', visible: true },
    { field: 'TRD_Status', header: '單據狀態', visible: true, format: (value) => this.transferStatusOptions.find((item) => item.value === value)?.label || value },
  ];

  addButton: AddButton[] = [
    {
      label: '確認', icon: 'pi pi-check-circle text-green-500', action: (selectedItems: any) => {
        this.batchUpdateStatus(selectedItems, TRDStatus.已確認);
      }, disabled: (item: any) => item.TRD_Status !== TRDStatus.申請中
    },
    {
      label: '審核', icon: 'pi pi-check text-orange-500', action: (selectedItems: any) => {
        this.batchUpdateStatus(selectedItems, TRDStatus.已審核);
      }, disabled: (item: any) => item.TRD_Status !== TRDStatus.已確認
    },
    {
      label: '作廢', icon: 'pi pi-trash text-red-500', action: (selectedItems: any) => {
        this.batchUpdateStatus(selectedItems, TRDStatus.作廢);
      }, disabled: (item: any) => item.TRD_Status !== TRDStatus.申請中
    },
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

  brandOptions: { label: string; value: string }[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  vendorOptions: { label: string; value: string }[] = [];
  userOptions: { label: string; value: string }[] = [];

  constructor(
    private tls56080Service: Tls56080Service,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56080', '/TLS/TLS56080CRU', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  loadDropdownOptions(): void {
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.brandOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ label: item.Name, value: item.No }));
    });
    // this.dropDownListService.queryPOS2010Options().pipe(untilDestroyed(this)).subscribe(options => {
    //   this.vendorOptions = options.Data.map(item => ({ label: `${item.VEN_No} - ${item.VEN_Name}`, value: item.VEN_No }));
    // });
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const mockData = [
        {
          TRD_No: 'TR20250813001',
          APPLY_Date: '2025-08-13',
          VEN_No: 'V001',
          HOS_No: 'H001',
          IN_TotBuyAmt: 500,
          OUT_TotBuyAmt: 500,
          DIFF_TotBuyAmt: 0,
          TRD_Reason: '1',
          APPLY_USR_No: 'U001',
          Confim_USR_No: null,
          Confim_Date: null,
          TRD_Remark: '備註1',
          TRD_Status: '1',
          id: 1
        },
        {
          TRD_No: 'TR20250812001',
          APPLY_Date: '2025-08-12',
          VEN_No: 'V002',
          HOS_No: 'H002',
          IN_TotBuyAmt: 1500,
          OUT_TotBuyAmt: 1500,
          DIFF_TotBuyAmt: 0,
          TRD_Reason: '2',
          APPLY_USR_No: 'U002',
          Confim_USR_No: 'U003',
          Confim_Date: '2025-08-12',
          TRD_Remark: '備註2',
          TRD_Status: '2',
          id: 2
        }
      ];
      // this.tls56080Service.queryTransferList(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
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
      TRD_Status: status
    };

    // this.tls56080Service.batchUpdateStatus(body).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(response => {
    //   this.messageService.successBubble(response.Message);
    //   this.onSubmit(this.queryForm);
    // });

    // 模擬成功訊息
    console.log(`批量更新單據狀態為 ${status}`, body);
    this.btnLoading = false;
    this.onSubmit(this.queryForm);
  }

  editDisabled(rowData: any) {
    return rowData.TRD_Status !== TRDStatus.申請中;
  }
}
