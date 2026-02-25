import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextComponent } from "@shared/componentkit/input-text/input-text.component";
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { map } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Tls56030Service } from './../../../service/api/tls/TLS56030.service';
@Component({
  selector: 'app-tls56030',
  templateUrl: './tls56030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    TranslateModule,
    TableComponent,
    InputTextComponent,
    MultiSelectComponent,
    ReactiveFormsModule,
    InputTextComponent
  ],
})
export class TLS56030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    RPM_No: ['', [Validators.maxLength(20)]],   // 單號
    HOS_NoList: [[]],                          // 倉別
    org_idList: [[]],                          // 機構/單位
    LOGO_NoList: [[]],                         // 品牌代碼 multi-select
    RPM_StatusList: [[]],                      // 狀態
    APPLY_USRList: [[]],                       // 申請人
    APPLY_Date_Start: [null],                  // 申請日期 起
    APPLY_Date_End: [null],                    // 申請日期 迄
    ...createPaginationConfig([{ field: 'RPM_No', order: 1 }]), // 分頁和排序參數
    pageSize: [30],
  });
  expansionRowsPerPageOptions: number[] = [30, 60, 90, 120, 150];


  // Dropdown options
  warehouseOptions: { label: string, value: string }[] = []; // 倉別
  brandOptions: { label: string, value: string }[] = []; // 品牌代碼
  issuanceTypeOptions: { label: string, value: string }[] = [];
  issuanceNoteStatusOptions: { label: string, value: string }[] = [];
  userOptions: { label: string, value: string }[] = [];
  departmentOptions: { label: string, value: string }[] = []; // 部門下拉選單選項

  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'RPM_No', header: '領用單編號', visible: true },
    { field: 'APPLY_Date', header: '申請日期', visible: true },
    { field: 'RPM_Type_Name', header: '領用類別', visible: true },
    { field: 'HOS_NAME', header: '倉別', visible: true },
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'Org_Name', header: '部門', visible: true },
    { field: 'RPM_Remark', header: '說明', visible: true },
    { field: 'APPLY_USR_Name', header: '申請人', visible: true },
    { field: 'APRV_USR_Name', header: '審核人', visible: true },
    { field: 'APRV_Date', header: '審核日期', visible: true },
    { field: 'RPM_Status_Name', header: '單據狀態', visible: true },
  ];


  constructor(
    private dropDownListService: DropDownListService,
    private tls56030Service: Tls56030Service

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56030', '/TLS/TLS56030CRU', this.queryForm, (form) => this.onSubmit(form));
    // 倉別 (HOS_No)
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this),
      map(response => (response?.Data ?? []).map((x: any) => ({ label: `${x.No}-${x.Name}`, value: x.No })))
    ).subscribe(options => { this.warehouseOptions = options; });
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(
      untilDestroyed(this),
      map(res => (res?.Data ?? []).map((x: any) => ({ label: `${x.No}-${x.Name}`, value: x.No })))
    ).subscribe(options => this.brandOptions = options);

    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this),
      map(res => (res?.Data ?? []).map((x: any) => ({ label: `${x.No}-${x.Name}`, value: x.No })))
    ).subscribe(options => {
      this.userOptions = options;
    });
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.departmentOptions = (response.Data || []).map((x: any) => ({
          label: `${x.No}-${x.Name}`,
          value: x.No
        }));
      });
    this.issuanceNoteStatusOptions = [
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



  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;

    this.tls56030Service.queryTLS56030(frm.value).pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          this.data = res?.Data ?? [];
          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.loading = false;
        },

      });
  }
  // 當列的 RPM_Status 為 3 (已領退) 或 9 (已作廢) 時，讓 edit 按鈕呈現唯讀/禁用
  isEditDisabled(row: any): boolean {
    const status = row?.RPM_Status ?? row?.RPM_Status;
    const s = String(status ?? '').trim();
    return s === '3' || s === '9' || Number(s) === 3 || Number(s) === 9;
  }
  insertRecord(payload: any) {
    this.tls56030Service.insertTLS56030(payload).pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          console.log('新增成功', res);
          this.onSubmit(this.queryForm); // 重新查詢
        },
        error: (err) => console.error('新增失敗', err)
      });
  }
  updateRecord(payload: any) {
    this.tls56030Service.updateTLS56030(payload).pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          console.log('更新成功', res);
          this.onSubmit(this.queryForm);
        },
      });
  }
  updateStatus(payload: any) {
    this.tls56030Service.updateStatusTLS56030(payload).pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          console.log('狀態更新成功', res);
          this.onSubmit(this.queryForm);
        },
      });
  }
  queryPOS2004Detail(body: any) {
    this.tls56030Service.queryPOS2004Detail_TLS56030(body).pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          console.log('商品明細', res.Data);
        },
      });
  }


}
