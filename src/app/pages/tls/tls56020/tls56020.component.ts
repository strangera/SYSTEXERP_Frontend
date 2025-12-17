import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls52010Service } from '@service/api/tls/tls52010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize, map } from 'rxjs/operators';
import { Tls56020Service } from '../../../service/api/tls/tls56020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownTableComponent, FieldsConfig } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import {
  TLS56020Item,
  TLS56020_COLUMNS,
  buildTLS56020QueryBody,
} from './tls56020.model';

interface IQueryPOS2004DetailRequest {
  queryNo?: string;
  PLU_Name?: string;
  VEN_No?: string;
  LOGO_No?: string;
}
interface IQueryPOS2004DetailResponse {
  PLU_MagNo: string;
  PLU_No: string;
  PLU_OrgPLUNo: string;
  PLU_Name: string;
}

@UntilDestroy()
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
    InputNumberComponent,
  ],
})
export class TLS56020Component extends BasicQueryPageComponent<TLS56020Item> implements OnInit {
  // === 查詢條件：完全對齊後端 ===
  queryForm = this.formBuilder.group({
    SPM_No: ['', [Validators.maxLength(20)]],    // 領用單編號
    queryNo: ['', [Validators.maxLength(50)]],   // 管理編號/關鍵字
    HOS_NoList: [[]],                            // 倉別 (多選)
    LOGO_NoList: [[]],                           // 品牌 (多選)
    SPM_TypeList: [[]],                          // 領用類別 (多選)
    SPM_StatusList: [[]],                        // 單據狀態 (多選)
    APPLY_USR: [''],
    APPLY_Date_Start: [null],
    APPLY_Date_End: [null],
    APRV_USR: [''],
    APRV_Date_Start: [null],
    APRV_Date_End: [null],
    issuanceNoteStatus: [null],
    issuanceType: [null],
    issuanceNoteCode: [null],
  });

  // 下拉選項
  warehouseOptions: { label: string; value: string }[] = []; // 倉別
  brandOptions: { label: string; value: string }[] = [];     // 品牌
  issuanceTypeOptions: { label: string; value: string }[] = [
    { label: '贈品領用', value: '1' },
    { label: '公關活動', value: '2' },
  ];
  issuanceNoteStatusOptions: { label: string; value: string }[] = [
    { label: '已申請', value: '1' },
    { label: '已審核', value: '2' },
    { label: '已領用', value: '3' },
    { label: '已作廢', value: '9' },
  ];
  userOptions: { label: string; value: string }[] = [];

  // 清單
  data: TLS56020Item[] = [];
  totalRecords = 0;
  columns: Column[] = TLS56020_COLUMNS;

  constructor(
    private tls56020Service: Tls56020Service,
    private dropDownListService: DropDownListService,
    private readonly tls52010Service: Tls52010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56020', '/TLS/TLS56020CRU', this.queryForm, (form) => this.onSubmit(form));

    // 倉別
    this.dropDownListService.getPOS2034Options().pipe(
      untilDestroyed(this),
      map(res => (res?.Data ?? []).map((x: any) => ({ label: x.Name, value: x.No })))
    ).subscribe(options => this.warehouseOptions = options);

    // 品牌
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(
      untilDestroyed(this),
      map(res => (res?.Data ?? []).map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })))
    ).subscribe(options => this.brandOptions = options);

    // 人員
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(
      untilDestroyed(this),
      map(res => (res?.Data ?? []).map((x: any) => ({ label: x.Name, value: x.No })))
    ).subscribe(options => this.userOptions = options);
  }

  canQuery(): boolean { return true; }
  canAdd(): boolean { return true; }
  canEdit(): boolean { return true; }

  // === 查詢 ===
  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;

    const paging = createPaginationConfig([{ field: 'SPM_No', order: 1 }]);
    const body = buildTLS56020QueryBody(frm.value, paging);

    this.tls56020Service.queryTLS56020(body).pipe(
      finalize(() => this.loading = false),
      untilDestroyed(this)
    ).subscribe(res => {
      this.data = (res?.Data ?? []) as TLS56020Item[];
      this.totalRecords = res?.TotalCount ?? this.data.length;
      this.queryStateService.setQueryState(this.ProgNo, body);
    });
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset({
      SPM_No: '',
      queryNo: '',
      HOS_NoList: null,
      LOGO_NoList: null,
      SPM_TypeList: null,
      SPM_StatusList: null,
      APPLY_USR: '',
      APPLY_Date_Start: null,
      APPLY_Date_End: null,
      APRV_USR: '',
      APRV_Date_Start: null,
      APRV_Date_End: null,
    });
  }

  // === 商品查詢（供 app-dropdown-table 使用） ===
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]],
    PLU_Name: ['', [Validators.maxLength(60)]],
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
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
  // 自動完成輸入
  onAutoCompleteInputChange(event: any) {
    const body = {
      PageSize: 30,
      PageIndex: 1,
      OrderBy: '',
      Offset: 0,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
      queryNo: event.PLU_MagNo || '',
      PLU_Name: event.PLU_Name || '',
      LOGO_No: '',
      HOS_No: '',
    };
    this.tls52010Service.queryPOS2004Detail_TLS56020(body).pipe(untilDestroyed(this)).subscribe((results) => {
      const data = results?.Data ?? [];
      this.suggestions = [...data.map((item: any) => ({
        ...item,
        label: item.PLU_MagNo + ' - ' + item.PLU_Name + ' - ' + item.PLU_No + ' - ' + item.PLU_OrgPLUNo,
      }))];
    });
  }
  onformValueChanged(event: IQueryPOS2004DetailRequest) {
    this.opLoading = true;
    const body = {
      PageSize: 30,
      PageIndex: 1,
      OrderBy: '',
      Offset: 0,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
      queryNo: event.queryNo || '',
      PLU_Name: event.PLU_Name || '',
      LOGO_No: '',
      HOS_No: '',
    };
    this.tls52010Service.queryPOS2004Detail_TLS56020(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...(results?.Data ?? [])]; // 更新data資料
      this.opTotalRecords = results?.TotalCount ?? 0;
      this.opLoading = false;
    });
  }
}
