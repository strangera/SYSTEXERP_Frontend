import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { DropDownListService, POS2004Item } from '@service/utility/dropDownList.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, FieldChangeEvent } from '@shared/componentkit/table/table.model';
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
  PLU_MagNoOptions: POS2004Item[] = [];

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
      options: () => this.PLU_MagNoOptions, // 使用函數動態返回選項
      optionLabel: 'label',
      optionValue: 'PLU_MagNo',
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
    private tls42020Service: TLS42020Service,
    private changeDetectorRef: ChangeDetectorRef

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
      if (this.data.filter(item => item.SBM_SeqNo.startsWith('save')).length === 0) {
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

  // 選擇商品管理碼後自動帶出其他欄位的資料
  onFieldChange(event: FieldChangeEvent): void {
    if (event.field === 'PLU_MagNo' && event.index !== undefined) {
      // 當 PLU_MagNo (商品管理碼) 改變時，自動帶入相關資料
      const selectedProduct = this.PLU_MagNoOptions.find(item => item.PLU_MagNo === event.value);
      if (selectedProduct) {
        // 更新該行的其他欄位
        const rowData = this.data[event.index];
        // FIXME: 欄位對應待確認
        if (rowData) {
          rowData.PLU_No = selectedProduct.PLU_No || '';
          rowData.PLU_Name = selectedProduct.PLU_Name || '';
          rowData.PLU_PrnName = selectedProduct.PLU_Name || '';
          rowData.PLU_FixPrc = selectedProduct.PLU_SalePrc || '';
          rowData.PLU_SalePrc = selectedProduct.PLU_SalePrc || '';

          // 觸發變更檢測
          this.changeDetectorRef.detectChanges();
        }
      }
    }
  }

  // 私有方法
  private loadOptions(): void {
    // 載入專櫃編號選項
    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.tltNoOptions = res.Data.map((item: any) => ({
          label: `${item.No}-${item.Name}`,
          value: item.No,
          name: item.Name
        }));
      });

    this.dropDownListService.queryPOS2004_DropDownList("POS1027M")
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.PLU_MagNoOptions = res.Data
        this.changeDetectorRef?.detectChanges();
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
    const detailData = this.data
      .filter(item => item.SBM_SeqNo.startsWith('save'))
      .map((item, index) => ({
        ...item,
        STO_No: this.STORE_NO,
        SBM_Type: mainData.SBM_Type,
        TLT_No: mainData.TLT_No,
        SBM_BegDate: mainData.SBM_BegDate,
        SBM_EndDate: mainData.SBM_EndDate,
        PLU_MagNo: item.PLU_MagNo ?? `${mainData.TLT_No}${(index + 1).toString().padStart(4, '0')}`
        // TODO: 流水號 邏輯待確認
        // SBM_SeqNo:
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
