import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { ITLS56040Data, Tls56040Service } from '@service/api/tls/tls56040.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from "@shared/componentkit/calendar-range-quick/calendar-range-quick.component";
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AddButton, Column, createPaginationConfig, formatDate } from '@shared/componentkit/table/table.model';
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
export class TLS56040Component extends BasicQueryPageComponent<ITLS56040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    MVM_No: [null, [Validators.maxLength(12)]],
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
    ...createPaginationConfig([{ field: 'MVM_No', order: 1 }]),
  });
  totalRecords = 0;
  data: ITLS56040Data[] = [];
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
  issuanceNoteStatusOptions = [
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
    private tls56040Service: Tls56040Service,
    private dropDownListService: DropDownListService,
    private readonly tls52010Service: Tls52010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56040', '/TLS/TLS56040CRU', this.queryForm, (form) => this.onSubmit(form));
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
      this.tls56040Service.queryTLS56040(params).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  // 管理編號
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼/商品管理編號/廠商貨號', mainDataField: true },
  ];
  onAutoCompleteInputChange(event: Record<'label', string>) {
    const body = {
      VEN_No: '',
      LOGO_No: '',
      queryNo: event.label || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_No', order: 1 }],
    }
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_No + '/' + item.PLU_MagNo + '/' + item.PLU_OrgPLUNo + ' - ' + item.PLU_Name
      }))];
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
