import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { ITLS56050Response, Tls56050Service } from '@service/api/tls/tls56050.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatDateTime } from '@shared/componentkit/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

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
export class TLS56050Component extends BasicQueryPageComponent<ITLS56050Response> implements OnInit {
  queryForm = this.formBuilder.group({
    MVM_No: [null, [Validators.maxLength(12)]],               // varchar(12)
    queryNo: [null, [Validators.maxLength(20)]],          // 非 POS2021 欄位，保留不設驗證
    OUT_HOS_NoList: [null],          // varchar(6)
    IN_HOS_NoList: [null],          // varchar(6)
    LOGO_NoList: [null],                                        // 非 POS2021 欄位，保留不設驗證
    MVM_StatusList: [null],            // varchar(1)
    APPLY_Date_Start: [yesterday],                             // datetime，預設無驗證
    APPLY_Date_End: [yesterday],                               // datetime，預設無驗證
    APPLY_USR: [this.authService.currentUserValue?.user_No, [Validators.maxLength(8)]],            // varchar(8)
    APRV_Date_Start: [null],                            // datetime，預設無驗證
    APRV_Date_End: [null],                              // datetime，預設無驗證
    APRV_USR: [''],          // varchar(8)
    OUTGODS_Date_Start: [null],                                 // datetime，預設無驗證
    OUTGODS_Date_End: [null],                                 // datetime，預設無驗證
    OUTGODS_USR: [''],          // varchar(8)
    ...createPaginationConfig([{ field: 'MVM_No', order: 1 }]),  // 分頁與排序參數，不需加驗證
  });
  totalRecords = 0;
  data: ITLS56050Response[] = [];
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
    { field: 'MVM_Status', header: '單據狀態', visible: true, format: (value) => this.issuanceNoteStatusOptions2.find((item) => item.value === value)?.label || value },
  ];
  // 倉別調撥單狀態選項
  issuanceNoteStatusOptions = [
    { label: '已審核', value: '2' },
    { label: '已發貨', value: '3' },
    { label: '已收貨確認', value: '4' },
    { label: '已作廢', value: '9' },
  ];

  // 倉別調撥單狀態選項
  issuanceNoteStatusOptions2 = [
    { label: '已申請', value: '1' },
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
    private readonly tls56050Service: Tls56050Service
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
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
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
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
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
  editDisabled(rowData: ITLS56050Response): boolean {
    // 如果狀態不是 '已審核'，則禁用行編輯
    return rowData.MVM_Status !== '2';
  }
}
