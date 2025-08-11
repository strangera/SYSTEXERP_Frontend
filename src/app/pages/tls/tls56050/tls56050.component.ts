import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDateTime } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { CommonModule } from '@angular/common';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';

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
    TableComponent,
    CommonModule,
    MultiSelectComponent,
    DropdownTableComponent,
    CalendarRangeQuickComponent
  ],
})
export class TLS56050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    MVM_No: [null, [Validators.maxLength(12)]],               // varchar(12)
    MVM_Status: [null, [Validators.maxLength(1)]],            // varchar(1)
    PLU_MagNo: [null, [Validators.maxLength(20)]],          // 非 POS2021 欄位，保留不設驗證
    LOGO_No: [null],                                        // 非 POS2021 欄位，保留不設驗證
    OUT_HOS_No: [null, [Validators.maxLength(6)]],          // varchar(6)
    IN_HOS_No: [null, [Validators.maxLength(6)]],          // varchar(6)
    CRT_USR_No: ['', [Validators.maxLength(8)]],            // varchar(8)
    UPD_USR_No: ['', [Validators.maxLength(8)]],            // varchar(8)
    MVM_SenderNo: ['', [Validators.maxLength(8)]],          // varchar(8)
    MVM_Date_Start: [new Date()],                             // datetime，預設無驗證
    MVM_Date_End: [new Date()],                               // datetime，預設無驗證
    MVM_ConfirmDate_Start: [null],                            // datetime，預設無驗證
    MVM_ConfirmDate_End: [null],                              // datetime，預設無驗證
    MVM_Sender_Start: [null],                                 // datetime，預設無驗證
    MVM_Sender_End: [null],                                 // datetime，預設無驗證
    ...createPaginationConfig([{ field: 'MVM_No', order: 1 }]),  // 分頁與排序參數，不需加驗證
  });
  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'MVM_No', header: '調撥單編號', visible: true },
    { field: 'CRT_Date', header: '申請日期', visible: true, format: formatDateTime },
    { field: 'IN_HOS_No', header: '調入倉別', visible: true },
    { field: 'OUT_HOS_No', header: '調出倉別', visible: true },
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'MVM_Remark', header: '說明', visible: true },
    { field: 'CRT_USR_No', header: '申請人', visible: true },
    { field: 'Confirm_USR_No', header: '審核人編號', visible: true },
    { field: 'Confirm_USR_Name', header: '審核人姓名', visible: true },
    { field: 'Confirm_DATE', header: '審核日期', visible: true, format: formatDateTime },
    { field: 'MVM_Status', header: '單據狀態', visible: true, format: (value) => this.issuanceNoteStatusOptions.find((item) => item.value === value)?.label || value },
  ];
  // 倉別調撥單狀態選項
  issuanceNoteStatusOptions = [
    { label: '已審核', value: '2' },
    { label: '已發貨', value: '3' },
    { label: '已收貨確認', value: '4' },
    { label: '已作廢', value: '9' },
  ];

  brandOptions: { label: string; value: string }[] = [];// 品牌
  warehouseOptions: { label: string; value: string }[] = []; // 倉別
  userOptions: { label: string; value: string }[] = [];

  constructor(
    private tls52010Service: Tls52010Service,
    private dropDownListService: DropDownListService,
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS56050', '/TLS/TLS56050CRU', this.queryForm, (form) => this.onSubmit(form));
    // 倉別 (HOS_No)
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ label: item.Name, value: item.No }));
    });
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.brandOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.queryForm.patchValue({ CRT_USR_No: this.authService.currentUserValue?.user_No });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
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
    { field: 'PLU_MagNo', header: '管理編號', mainDataField: true },
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
}
