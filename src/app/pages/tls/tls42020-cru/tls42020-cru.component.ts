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
import { finalize, forkJoin, map } from 'rxjs';

// 介面定義
interface DropdownOption {
  label: string;
  value: string;
}

interface TLTOption extends DropdownOption {
  name: string; // 專櫃名稱
}

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
  // 表單定義
  dataForm = this.formBuilder.nonNullable.group({
    SBM_Type: [null as number | null, Validators.required],
    TLT_No: [null as string | null, Validators.required],
    SBM_BegDate: ['', Validators.required],
    SBM_EndDate: ['', Validators.required]
  });

  data: TLS42020InsertDetailData[] = [];
  selectedRows: TLS42020InsertDetailData[] = [];

  // 下拉選項
  readonly menuTypeOptions: DropdownOption[] = [
    { label: '一般菜單', value: '1' },
    { label: '員工菜單', value: '2' }
  ];

  tltNoOptions: TLTOption[] = [];
  PLU_MagNoOptions: DropdownOption[] = [
    { label: '商品1', value: 'M001' },
    { label: '商品2', value: 'M002' }
  ];

  // 表格欄位定義
  columns: Column[] = [
    {
      field: 'SBM_BtnNo',
      header: '菜單按鍵序號',
      type: 'input',
      validate: [this.createRequiredValidator('菜單按鍵序號為必填欄位')],
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
      validate: [this.createRequiredValidator('國際條碼為必填欄位')],
      required: true
    },
    {
      field: 'PLU_Name',
      header: '商品名稱',
      type: 'input',
      validate: [this.createRequiredValidator('商品名稱為必填欄位')],
      required: true
    },
    {
      field: 'PLU_PrnName',
      header: '商品列印名稱',
      type: 'input',
      validate: [this.createRequiredValidator('商品列印名稱為必填欄位')],
      required: true
    },
    {
      field: 'PLU_FixPrc',
      header: '商品定價',
      type: 'input',
      validate: [this.createRequiredValidator('商品定價為必填欄位')],
      required: true
    },
    {
      field: 'PLU_SalePrc',
      header: '商品售價',
      type: 'input',
      validate: [this.createRequiredValidator('商品售價為必填欄位')],
      required: true
    }
  ];

  // 常數定義
  private readonly STORE_NO = '10';

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

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      // 檢核 data 至少要有一筆
      if (this.data.length === 0) {
        this.messageService.errorBubble('請至少新增一筆明細資料');
        this.loading = false;
        return;
      }
      const payload = this.createInsertRequestBody();
      this.performInsert(payload);
    });
  }

  onDelete(rows: TLS42020InsertDetailData[]): void {
    const idsToDelete = new Set(rows.map(item => item.SBM_SeqNo));
    this.data = this.data.filter(item => !idsToDelete.has(item.SBM_SeqNo));
    this.selectedRows = [];
  }

  // 私有方法
  private loadOptions(): void {
    const tltQuery$ = this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(
        map(res => res.Data.map((item: any) => ({
          label: `${item.No}-${item.Name}`,
          value: item.No,
          name: item.Name
        })))
      );

    const pluQuery$ = this.dropDownListService.queryPOS2004_DropDownList("POS1027M")
      .pipe(
        map(res => res.Data.map((item: any) => ({
          label: item.Name,
          value: item.No
        })))
      );

    forkJoin([tltQuery$, pluQuery$])
      .pipe(untilDestroyed(this))
      .subscribe(([tltOptions, pluOptions]) => {
        this.tltNoOptions = tltOptions;
        // this.PLU_MagNoOptions = pluOptions;
      });
  }

  private performInsert(payload: TLS42020InsertRequest): void {
    this.tls42020Service.insertTLS42020M(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: () => {
          this.messageService.successBubble('新增成功');
          this.onCancel();
        }
      });
  }

  private createInsertRequestBody(): TLS42020InsertRequest {
    const formValue = this.dataForm.getRawValue();
    const selectedTlt = this.tltNoOptions.find(item => item.value === formValue.TLT_No);

    if (!selectedTlt) {
      throw new Error('找不到對應的專櫃資訊');
    }

    const mainData = {
      STO_No: this.STORE_NO,
      SBM_Type: formValue.SBM_Type!,
      TLT_No: formValue.TLT_No!,
      TLT_Name: selectedTlt.name,
      SBM_BegDate: formValue.SBM_BegDate!,
      SBM_EndDate: formValue.SBM_EndDate!
    };

    // 深拷貝明細資料並加上主檔欄位
    const detailData = this.data.map(item => ({
      ...item,
      STO_No: this.STORE_NO,
      SBM_Type: mainData.SBM_Type,
      TLT_No: mainData.TLT_No,
      SBM_BegDate: mainData.SBM_BegDate,
      SBM_EndDate: mainData.SBM_EndDate
    }));

    return {
      ...mainData,
      POS10271: detailData
    };
  }

  private createRequiredValidator(errorMessage: string) {
    return (value: string) => ({
      isValid: !!value,
      errorMessage: [errorMessage]
    });
  }

  // Getter (保持向下相容)
  get insertRequestBody(): TLS42020InsertRequest {
    return this.createInsertRequestBody();
  }
}
