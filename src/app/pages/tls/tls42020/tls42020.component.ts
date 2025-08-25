import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize, of } from 'rxjs';

// PrimeNG modules
import { AccordionModule } from 'primeng/accordion';

// Shared components
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';

// Translation
import { TranslateModule } from '@ngx-translate/core';

// Base class and interfaces
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { TableComponent } from '@shared/componentkit/table/table.component';

export interface TLS42020Data {
  menuType: string;
  tltNo: string;
  tltName: string;
  details: any[];
}

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
    TranslateModule,
    TableComponent
  ]
})
export class TLS42020Component extends BasicQueryPageComponent<TLS42020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    menuType: [[]], // 菜單類別
    tltNo: [[]], // 專櫃編號/名稱
    SBM_BegDate_start: [null], // 有效起始日期
    SBM_BegDate_end: [null], // 有效結束日期
    SBM_EndDate_start: [null], // 有效起始日期
    SBM_EndDate_end: [null], // 有效結束日期
    ...createPaginationConfig([]) // 分頁和排序參數
  });

  totalRecords = 0;
  data: TLS42020Data[] = [];
  selectedItems: TLS42020Data[] = [];

  // 下拉選單
  menuTypeOptions: any[] = [];
  tltNoOptions: any[] = [];

  columns: Column[] = [
    { field: 'menuType', header: '菜單類別', visible: true },
    { field: 'tltNo', header: '專櫃編號', visible: true },
    { field: 'tltName', header: '專櫃名稱', visible: true }
  ];

  expansionColumns: Column[] = [
    { field: 'SBM_BtnNo', header: '菜單按鍵序號', visible: true },
    { field: 'PLU_MagNo', header: '商品管理碼', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_PrnName', header: '商品列印名稱', visible: true },
    { field: 'PLU_FixPrc', header: '商品定價', visible: true },
    { field: 'PLU_SalePrc', header: '商品售價', visible: true }
  ];

  constructor(
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
      this.loading = false
      this.loadFakeData();
      this.queryStateService.setQueryState(this.ProgNo, frm.value);
    });
  };

  loadFakeData() {
    this.data = [
      { menuType: '一般', tltNo: '001', tltName: 'Name1', details: [] },
      { menuType: '一般', tltNo: '002', tltName: 'Name2', details: [] },
      { menuType: '一般', tltNo: '003', tltName: 'Name3', details: [] }
    ];
    this.totalRecords = this.data.length;
  }

  loadOptions() {
    this.menuTypeOptions = [
      { label: '一般菜單', value: '1' },
      { label: '員工菜單', value: '2' },
    ];

    this.dropDownListService.queryTLTTALENT_DropDownList()
      .subscribe(res => {
        this.tltNoOptions = res.Data
          .map((item: any) => ({
            label: item.Name,
            value: item.No
          }));
      });
  }

  loadDetails = (rowData: any) => {
    console.log('loadDetails');
    return of({
      Data: [
        {
          SBM_SeqNo: '001',
          SBM_BtnNo: 'BTN001',
          PLU_MagNo: 'MAG001',
          PLU_No: '1234567890123',
          PLU_Name: '商品名稱1',
          PLU_PrnName: '列印名稱1',
          PLU_FixPrc: 100,
          PLU_SalePrc: 90
        },
        {
          SBM_SeqNo: '002',
          SBM_BtnNo: 'BTN002',
          PLU_MagNo: 'MAG002',
          PLU_No: '1234567890124',
          PLU_Name: '商品名稱2',
          PLU_PrnName: '列印名稱2',
          PLU_FixPrc: 200,
          PLU_SalePrc: 180
        },
        {
          SBM_SeqNo: '003',
          SBM_BtnNo: 'BTN003',
          PLU_MagNo: 'MAG003',
          PLU_No: '1234567890125',
          PLU_Name: '商品名稱3',
          PLU_PrnName: '列印名稱3',
          PLU_FixPrc: 150,
          PLU_SalePrc: 135
        }
      ]
    });
  };

  // TODO: 待實作
  importExcel() {
    console.log('importExcel');
  }
}