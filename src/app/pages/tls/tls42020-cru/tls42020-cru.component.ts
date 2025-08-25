import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG modules
import { PanelModule } from 'primeng/panel';

// Shared components
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

// Translation
import { TranslateModule } from '@ngx-translate/core';

// Common Angular
import { NgIf } from '@angular/common';

// Base class
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS42020Data } from '../tls42020/tls42020.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls42020-cru',
  templateUrl: './tls42020-cru.component.html',
  styleUrl: './tls42020-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    TranslateModule,
    NgIf,
    TableComponent
  ]
})
export class TLS42020CRUComponent extends BasicCruPageComponent<TLS42020Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    menuType: ['', Validators.required],
    tltNo: ['', Validators.required],
    SBM_BegDate: ['', Validators.required],
    SBM_EndDate: ['', Validators.required]
  });

  data: any[] = [];
  selectedRows: any[] = [];


  // 主檔下拉選項
  menuTypeOptions: any[] = [];
  tltNoOptions: any[] = [];

  // 明細下拉選項
  PLU_MagNoOptions: any[] = [
    {
      label: '商品1',
      value: '1'
    },
    {
      label: '商品2',
      value: '2'
    }
  ]; // 商品管理碼

  columns: Column[] = [
    {
      field: 'SBM_BtnNo',
      header: '菜單按鍵序號',
      type: 'input',
      validate: [(value: string) => ({ isValid: !!value, errorMessage: ['菜單按鍵序號為必填欄位'] })],
      required: true
    },
    {
      field: 'PLU_MagNo',
      header: '商品管理碼',
      type: 'dropdown',
      options: this.PLU_MagNoOptions,
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'PLU_No',
      header: '國際條碼',
      type: 'input',
      validate: [(value: string) => ({ isValid: !!value, errorMessage: ['國際條碼為必填欄位'] })],
      required: true
    },
    {
      field: 'PLU_Name',
      header: '商品名稱',
      type: 'input',
      validate: [(value: string) => ({ isValid: !!value, errorMessage: ['商品名稱為必填欄位'] })],
      required: true
    },
    {
      field: 'PLU_PrnName',
      header: '商品列印名稱',
      type: 'input',
      validate: [(value: string) => ({ isValid: !!value, errorMessage: ['商品列印名稱為必填欄位'] })],
      required: true
    },
    {
      field: 'PLU_FixPrc',
      header: '商品定價',
      type: 'input',
      validate: [(value: string) => ({ isValid: !!value, errorMessage: ['商品定價為必填欄位'] })],
      required: true
    },
    {
      field: 'PLU_SalePrc',
      header: '商品售價',
      type: 'input',
      validate: [(value: string) => ({ isValid: !!value, errorMessage: ['商品售價為必填欄位'] })],
      required: true
    }
  ];

  constructor(
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS42020', this.dataForm);
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
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

    this.dropDownListService.queryPOS2004_DropDownList("POS1027M")
      .subscribe(res => {
        this.PLU_MagNoOptions = res.Data
          .map((item: any) => ({
            label: item.Name,
            value: item.No
          }));
      });
  }


  onDelete(rows: any[]) {
    const idsToDelete = new Set(rows.map(item => item.SBM_SeqNo));
    this.data = this.data.filter((item: any) => !idsToDelete.has(item.SBM_SeqNo));
    this.selectedRows = [];
  }
}
