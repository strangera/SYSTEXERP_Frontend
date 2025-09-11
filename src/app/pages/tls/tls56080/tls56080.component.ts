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
import { IQueryTLS56080Response, Tls56080Service } from '@service/api/tls/tls56080.service';
import { finalize } from 'rxjs';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';

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
    DropdownTableComponent
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
    ...createPaginationConfig([{ field: 'TRD_No', order: 1 }]),
  });
  totalRecords = 0;
  data: IQueryTLS56080Response[] = [];
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
      label: '確認', icon: 'pi pi-check-circle text-green-500', action: (selectedItems: IQueryTLS56080Response) => {
        this.batchUpdateStatus(selectedItems, TRDStatus.已確認);
      }, disabled: (item: IQueryTLS56080Response) => item.TRD_Status !== TRDStatus.申請中
    },
    {
      label: '審核', icon: 'pi pi-check text-orange-500', action: (selectedItems: IQueryTLS56080Response) => {
        this.batchUpdateStatus(selectedItems, TRDStatus.已審核);
      }, disabled: (item: IQueryTLS56080Response) => item.TRD_Status !== TRDStatus.已確認
    },
    {
      label: '作廢', icon: 'pi pi-trash text-red-500', action: (selectedItems: IQueryTLS56080Response) => {
        this.batchUpdateStatus(selectedItems, TRDStatus.作廢);
      }, disabled: (item: IQueryTLS56080Response) => item.TRD_Status !== TRDStatus.申請中
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
    private readonly tls52010Service: Tls52010Service
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
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.tls56080Service.queryTLS56080(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  btnLoading = false;

  batchUpdateStatus(selectedItems: IQueryTLS56080Response, status: string): void {
    this.btnLoading = true;
    const body = {
      DetailList: [
        {
          TRD_No: selectedItems.TRD_No,
          TRD_Status: status
        }
      ]
    };
    this.tls56080Service.updateStatusTLS56080(body).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onSubmit(this.queryForm);
    });
  }
  // 管理編號
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', mainDataField: true },
  ];
  opData: IQueryPOS2004DetailResponse[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;
  onAutoCompleteInputChange(event: any) {
    const body = {
      ...event,
      VEN_No: '',
      LOGO_No: '',
      queryNo: event.PLU_MagNo || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data];
    });
  }
  onformValueChanged(event: IQueryPOS2004DetailRequest) {
    this.opLoading = true;
    const body = {
      queryNo: event.queryNo || '',
      PLU_Name: event.PLU_Name || '',
      VEN_No: '',
      LOGO_No: '',
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...results.Data]; // 更新data資料
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }
  editDisabled(rowData: IQueryTLS56080Response): boolean {
    return rowData.TRD_Status !== TRDStatus.申請中;
  }
}
