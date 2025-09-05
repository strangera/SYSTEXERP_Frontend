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
import { TLS42020Data, TLS42020DetailData, TLS42020InsertDetailData, TLS42020InsertRequest, TLS42020Service, TLS42020UpdateRequest } from '@service/api/tls/tls42020.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize, forkJoin, map } from 'rxjs';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

// 介面定義
interface DropdownOption {
  label: string;
  value: string | number;
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

  data: TLS42020DetailData[] = [];
  selectedRows: TLS42020DetailData[] = [];

  // 下拉選項
  readonly menuTypeOptions: DropdownOption[] = [
    { label: '一般菜單', value: 1 },
    { label: '員工菜單', value: 2 }
  ];

  tltNoOptions: TLTOption[] = [];
  PLU_MagNoOptions: POS2004Item[] = [
    {
      PLU_MagNo: 'A001',
      PLU_No: '4711234567890',
      PLU_Name: '經典漢堡',
      PLU_SalePrc: 120,
      label: 'A001-經典漢堡'
    },
    {
      PLU_MagNo: 'B001',
      PLU_No: '4711234567893',
      PLU_Name: '薯條(大)',
      PLU_SalePrc: 60,
      label: 'B001-薯條(大)'
    },
    {
      PLU_MagNo: 'C001',
      PLU_No: '4711234567895',
      PLU_Name: '可樂(大)',
      PLU_SalePrc: 35,
      label: 'C001-可樂(大)'
    },
    {
      PLU_MagNo: 'D001',
      PLU_No: '4711234567897',
      PLU_Name: '巧克力聖代',
      PLU_SalePrc: 55,
      label: 'D001-巧克力聖代'
    }
  ];

  // 表格欄位定義
  columns: Column[] = [
    {
      field: 'SBM_BtnNo',
      header: '菜單按鍵序號',
      type: 'input',
      validate: [this.requiredValidator('菜單按鍵序號為必填欄位')],
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
      validate: [this.requiredValidator('國際條碼為必填欄位')],
      required: true
    },
    {
      field: 'PLU_Name',
      header: '商品名稱',
      type: 'input',
      validate: [this.requiredValidator('商品名稱為必填欄位')],
      required: true
    },
    {
      field: 'PLU_PrnName',
      header: '商品列印名稱',
      type: 'input',
      validate: [this.requiredValidator('商品列印名稱為必填欄位')],
      required: true
    },
    {
      field: 'PLU_FixPrc',
      header: '商品定價',
      type: 'input',
      validate: [this.requiredValidator('商品定價為必填欄位')],
      required: true
    },
    {
      field: 'PLU_SalePrc',
      header: '商品售價',
      type: 'input',
      validate: [this.requiredValidator('商品售價為必填欄位')],
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
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      // 呼叫讀取明細api
      if (this.rowdata) {
        this.tls42020Service.queryTLS42020Detail({ tltNo: this.rowdata.TLT_No })
          .pipe(untilDestroyed(this))
          .subscribe(res => {
            this.data = res.Data;
          });
      }
    }
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      // 檢核 data 至少要有一筆
      if (this.data.length === 0) {
        this.messageService.errorBubble('請至少有一筆明細資料');
        this.loading = false;
        return;
      }
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          // 新增邏輯
          const payload = this.createInsertRequestBody();
          this.performInsert(payload);
          break;
        case CRUDStatus.Edit:
          // 編輯邏輯
          const updatePayload = this.createUpdateRequestBody();
          this.performUpdate(updatePayload);
          break;
      }
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

    // this.dropDownListService.queryPOS2004_DropDownList("POS1027M")
    //   .pipe(untilDestroyed(this))
    //   .subscribe(res => {
    //     this.PLU_MagNoOptions = res.Data
    //     this.changeDetectorRef?.detectChanges();
    //   });
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

  private performUpdate(payload: TLS42020UpdateRequest): void {
    this.tls42020Service.updateTLS42020(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: () => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        }
      });
  }

  private createInsertRequestBody(): TLS42020InsertRequest {
    const formValue = this.dataForm.getRawValue();

    // 主檔資料
    const mainData = {
      STO_No: this.STORE_NO,
      SBM_Type: formValue.SBM_Type!,
      TLT_No: formValue.TLT_No!,
      SBM_BegDate: formValue.SBM_BegDate!,
      SBM_EndDate: formValue.SBM_EndDate!
    };

    // 深拷貝明細資料並加上主檔欄位
    const detailData = this.data
      .map((item, index) => ({
        ...item,
        STO_No: this.STORE_NO,
        SBM_Type: mainData.SBM_Type,
        TLT_No: mainData.TLT_No,
        SBM_BegDate: mainData.SBM_BegDate,
        SBM_EndDate: mainData.SBM_EndDate,
        PLU_FixPrc: String(item.PLU_FixPrc ?? ''),
        PLU_SalePrc: String(item.PLU_SalePrc ?? ''),
        PLU_MagNo: item.PLU_MagNo ?? `${mainData.TLT_No}${(index + 1).toString().padStart(4, '0')}`,
        // TODO: 流水號 邏輯待確認，目前先傳index
        SBM_SeqNo: (index + 1).toString()
      }));

    return {
      ...mainData,
      POS10271: detailData
    };
  }

  private createUpdateRequestBody(): TLS42020UpdateRequest {
    const formValue = this.dataForm.getRawValue();

    // 主檔資料
    const mainData = {
      ID: this.rowdata!.id, // 從原始資料取得 ID
      STO_No: this.STORE_NO,
      SBM_Type: formValue.SBM_Type!,
      TLT_No: formValue.TLT_No!,
      TLT_Name: this.tltNoOptions.find(item => item.value === formValue.TLT_No)?.name ?? '',
      SBM_BegDate: formValue.SBM_BegDate!,
      SBM_EndDate: formValue.SBM_EndDate!
    };

    // 明細資料 - 轉換為 TLS42020UpdateDetailData 格式
    const detailData = this.data.map((item, index) => ({
      ...item,
      STO_No: this.STORE_NO,
      SBM_Type: mainData.SBM_Type,
      TLT_No: mainData.TLT_No,
      SBM_BegDate: mainData.SBM_BegDate,
      SBM_EndDate: mainData.SBM_EndDate,
      PLU_MagNo: item.PLU_MagNo ?? `${mainData.TLT_No}${(index + 1).toString().padStart(4, '0')}`,
      PLU_FixPrc: String(item.PLU_FixPrc ?? ''),
      PLU_SalePrc: String(item.PLU_SalePrc ?? ''),
      ID: item.ID
    }));

    return {
      ...mainData,
      POS10271: detailData
    };
  }

  private requiredValidator(errorMessage: string) {
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
