import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { TLS42020Service, TLS42020DetailData, TLS42020Data } from '../../../service/api/tls/tls42020.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';

// Shared & UI
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { validate } from 'uuid';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-tls42020',
  templateUrl: './tls42020.component.html',
  styleUrl: './tls42020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    CalendarRangeComponent,
    TableComponent,
    TranslateModule
  ]
})
export class TLS42020Component extends BasicQueryPageComponent<TLS42020Data> implements OnInit {
  queryForm = this.fb.group({
    menuType: [[]],           // 菜單類別(多選)
    tltNo: [[]],              // 專櫃編號(多選)
    SBM_BegDate_s: [null, Validators.required],    // 開始日期(起)
    SBM_BegDate_e: [null, Validators.required],    // 開始日期(迄)
    SBM_EndDate_s: [null, Validators.required],                         // 結束日期(起)
    SBM_EndDate_e: [null, Validators.required],                         // 結束日期(迄)
    ...createPaginationConfig([])
  });

  totalRecords = 0;
  data: TLS42020Data[] = [];
  selectedItems: TLS42020Data[] = [];

  // 下拉選單選項
  menuTypeOptions: { label: string, value: string }[] = [];
  tltNoOptions: { label: string, value: string }[] = [];

  columns: Column[] = [
    { field: 'SBM_Type', header: '菜單類別', visible: true, format: (value: string) => { return value === '1' ? '一般菜單' : '員工菜單' } },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '專櫃名稱', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false },
    { field: 'CRT_USR_No', header: '建立者編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立者姓名', visible: false },
    { field: 'UPD_Date', header: '更新日期', visible: false },
    { field: 'UPD_USR_No', header: '更新者編號', visible: false },
    { field: 'UPD_USR_Name', header: '更新者姓名', visible: false },
    { field: 'id', header: 'ID', visible: false },
    { field: 'mid', header: 'MID', visible: false },
    { field: 'STO_No', header: '店舖編號', visible: false },
    { field: 'SBM_BegDate', header: '開始日期', visible: false },
    { field: 'SBM_EndDate', header: '結束日期', visible: false },
  ];

  expansionColumns: Column[] = [
    { field: 'CRT_Date', header: '建立日期', hidden: true },
    { field: 'CRT_USR_No', header: '建立者編號', hidden: true },
    { field: 'CRT_USR_Name', header: '建立者姓名', hidden: true },
    { field: 'UPD_Date', header: '更新日期', hidden: true },
    { field: 'UPD_USR_No', header: '更新者編號', hidden: true },
    { field: 'UPD_USR_Name', header: '更新者姓名', hidden: true },
    { field: 'ID', header: 'ID', hidden: true },
    { field: 'MID', header: 'MID', hidden: true },
    { field: 'STO_No', header: '店舖編號', hidden: true },
    { field: 'SBM_Type', header: '子菜單類別', hidden: true },
    { field: 'TLT_No', header: '專櫃編號', hidden: true },
    { field: 'SBM_BegDate', header: '開始日期', hidden: true },
    { field: 'SBM_EndDate', header: '結束日期', hidden: true },
    { field: 'SBM_SeqNo', header: '序號', hidden: true },
    { field: 'SBM_BtnNo', header: '菜單按鍵序號', visible: true },
    { field: 'PLU_MagNo', header: '商品貨號', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_PrnName', header: '商品列印名稱', visible: true },
    { field: 'PLU_FixPrc', header: '商品定價', visible: true, format: formatAmount },
    { field: 'PLU_SalePrc', header: '商品售價', visible: true, format: formatAmount },
  ];

  constructor(
    private fb: FormBuilder,
    private tls42020Service: TLS42020Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS42020', 'tls/tls42020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls42020Service.queryTLS42020(frm.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  };

  loadOptions() {
    this.menuTypeOptions = [
      { label: '一般菜單', value: '1' },
      { label: '員工菜單', value: '2' },
    ];

    this.dropDownListService.queryTLTTALENT_DropDownList()
      .subscribe(res => {
        this.tltNoOptions = res.Data
          .map((item: any) => ({
            label: `${item.No}-${item.Name}`,
            value: item.No
          }));
      });
  }

  loadDetails = (rowData: TLS42020Data): Observable<{ Data: TLS42020DetailData[] }> => {
    return this.tls42020Service.queryTLS42020Detail({
      STO_No: rowData.STO_No
    });
  };
}