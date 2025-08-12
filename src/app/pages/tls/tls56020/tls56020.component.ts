import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
// Services
import { UserCodeService } from '../../../service/basic/user-code.service';
// Shared
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '../../../service/api/tls/tls52010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownTableComponent, FieldsConfig } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';

@Component({
  selector: 'app-tls56020',
  templateUrl: './tls56020.component.html',
  styleUrls: ['./tls56020.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    TranslateModule,
    TableComponent,
    MultiSelectComponent,
    DropdownTableComponent,
    ReactiveFormsModule,
    InputNumberComponent

  ],
})
export class TLS56020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    issuanceNoteCode: [],
    HOS_NoList: [[]], // 倉別
    queryNo: ['', [Validators.maxLength(20)]], // 查詢編號 input
    LOGO_NoList: [[]], // 品牌代碼 multi-select
    issuanceType: [null],
    issuanceNoteStatus: [null],
    APPLY_USR: [null],
    APRV_USR: [null],
    APPLY_Date_Start: [null], // 申請日期 起
    APPLY_Date_End: [null],   // 申請日期 迄
    APRV_Date_Start: [null],  // 審核日期 起
    APRV_Date_End: [null],    // 審核日期 迄
  });

  // Dropdown options
  warehouseOptions: { label: string, value: string }[] = []; // 倉別
  brandOptions: { label: string, value: string }[] = []; // 品牌代碼
  issuanceTypeOptions: { label: string, value: string }[] = [];
  issuanceNoteStatusOptions: { label: string, value: string }[] = [];
  userOptions: { label: string, value: string }[] = [];

  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'issuanceNoteCode', header: '領用單編號', visible: true },
    { field: 'APPLY_Date', header: '申請日期', visible: true },
    { field: 'issuanceType', header: '領用類別', visible: true },
    { field: 'HOS_No', header: '倉別', visible: true },
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'DEPT_No', header: '部門', visible: true },
    { field: 'Remark', header: '說明', visible: true },
    { field: 'APPLY_USR', header: '申請人', visible: true },
    { field: 'APRV_USR', header: '審核人', visible: true },
    { field: 'APRV_Date', header: '審核日期', visible: true },
    { field: 'status', header: '單據狀態', visible: true },
  ];

  constructor(
    private userCodeService: UserCodeService,
    private tls52010Service: Tls52010Service,
    private dropDownListService: DropDownListService

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56020', '/TLS/TLS56020CRU', this.queryForm, (form) => this.onSubmit(form));
    // 倉別 (HOS_No)
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this),
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => { this.warehouseOptions = options; });
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this),
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => { this.brandOptions = options.map(item => ({ label: `${item.value} - ${item.label}`, value: item.value })); });

    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this),
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => {
      this.userOptions = options;
    });
    this.issuanceNoteStatusOptions=[
      { label: '已申請', value: '1' },
      { label: '已審核', value: '2' },
      { label: '已領用', value: '3' },
      { label: '已作廢', value: '9' },
    ];
  this.issuanceTypeOptions = [
      { label: '贈品領用', value: '1' },
      { label: '公關活動', value: '2' },
  ];
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();
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
  onFormValueChanged(event: IQueryPOS2004DetailRequest) {
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
