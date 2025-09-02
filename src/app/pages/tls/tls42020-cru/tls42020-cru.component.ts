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
import { DropDownListService } from '@service/utility/dropDownList.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { TLS42020Data, TLS42020InsertDetailData, TLS42020InsertRequest, TLS42020Service } from '@service/api/tls/tls42020.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

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
    SBM_Type: [null, Validators.required],
    TLT_No: [null, Validators.required],
    SBM_BegDate: ['', Validators.required],
    SBM_EndDate: ['', Validators.required]
  });

  data: TLS42020InsertDetailData[] = [];
  selectedRows: TLS42020InsertDetailData[] = [];


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
    private dropDownListService: DropDownListService,
    private tls42020Service: TLS42020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS42020', this.dataForm);
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const payload = this.insertRequestBody;
      // 呼叫insertTLS42020M
      this.tls42020Service.insertTLS42020M(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe(response => {
          this.messageService.successBubble('新增成功');
          this.onCancel();
        });
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
            label: `${item.No}-${item.Name}`,
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


  onDelete(rows: TLS42020InsertDetailData[]) {
    const idsToDelete = new Set(rows.map(item => item.SBM_SeqNo));
    this.data = this.data.filter((item: any) => !idsToDelete.has(item.SBM_SeqNo));
    this.selectedRows = [];
  }

  get insertRequestBody(): TLS42020InsertRequest {
    const fmrValue = this.dataForm.getRawValue();
    const mainData = {
      STO_No: '10',
      SBM_Type: fmrValue.SBM_Type!,
      TLT_No: fmrValue.TLT_No!,
      TLT_Name: this.tltNoOptions.find(item => item.value === fmrValue.TLT_No)?.label.split('-')[1],
      SBM_BegDate: fmrValue.SBM_BegDate!,
      SBM_EndDate: fmrValue.SBM_EndDate!
    };
    const detailData = this.data;

    // 為每一筆明細資料加上主檔欄位
    detailData.forEach(item => {
      item.STO_No = '10';
      item.SBM_Type = mainData.SBM_Type!;
      item.TLT_No = mainData.TLT_No!;
      item.TLT_Name = mainData.TLT_Name;
      item.SBM_BegDate = mainData.SBM_BegDate;
      item.SBM_EndDate = mainData.SBM_EndDate;
    });

    return {
      ...mainData,
      POS10271: detailData
    };
  }
}
