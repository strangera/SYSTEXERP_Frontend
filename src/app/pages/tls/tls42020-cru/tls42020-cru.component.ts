import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS42020Data, TLS42020DetailData, TLS42020InsertDetailData, TLS42020InsertRequest, TLS42020Service, TLS42020UpdateRequest } from '@service/api/tls/tls42020.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { FieldChangeEvent } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

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
    TableEditComponent
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

  private readonly STORE_NO = '10';
  data: TLS42020DetailData[] = [];
  selectedRows: TLS42020DetailData[] = [];
  // 用於控制 table-edit 是否禁止 row 編輯（檢視模式使用）
  rowEditDisabledFn = (rowData: any) => this.isFormReadable;
  // 原始明細資料
  private originalDetailData: TLS42020DetailData[] = [];

  // 菜單類型下拉選項
  menuTypeOptions: DropdownOption[] = [
    { label: '一般菜單', value: 1 },
    { label: '員工菜單', value: 2 }
  ];
  // 專櫃編號下拉選項
  tltNoOptions: TLTOption[] = [];

  //#region 明細資料
  // 商品管理編號下拉選項
  PLU_MagNoOptions: any[] = [];

  // 明細資料欄位定義 (使用 table-edit 的 EditColumn 型別)
  columns: EditColumn[] = [
    {
      field: 'SBM_BtnNo',
      header: '菜單按鍵序號',
      type: 'input',
      validate: [validateRequired]

    },
    {
      field: 'PLU_MagNo',
      header: '商品管理碼',
      type: 'dropdown',
      options: (rowData?: any) => this.PLU_MagNoOptions, // 使用函數動態返回選項
      optionLabel: 'PLU_Name',
      optionValue: 'PLU_MagNo',
      showClear: true,
    },
    {
      field: 'PLU_No',
      header: '國際條碼',
      type: 'input',
      disabled: (value: any, index?: number, rowData?: any) => !!rowData?.PLU_MagNo // 若選擇商品管理碼則禁用
    },
    {
      field: 'PLU_Name',
      header: '商品名稱',
      type: 'input',
      validate: [validateRequired]

    },
    {
      field: 'PLU_PrnName',
      header: '商品列印名稱',
      type: 'input',
      validate: [validateRequired]

    },
    {
      field: 'PLU_FixPrc',
      header: '商品定價',
      type: 'inputNumber',
    },
    {
      field: 'PLU_SalePrc',
      header: '商品售價',
      type: 'inputNumber',
      validate: [validateRequired]
    }
  ];
  //#endregion

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

    // 代回明細資料
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      if (this.rowdata) {
        this.tls42020Service.queryTLS42020Detail({ tltNo: this.rowdata.TLT_No })
          .pipe(untilDestroyed(this))
          .subscribe(res => {
            this.data = res.Data;
            this.originalDetailData = res.Data;
          });
      }
    }
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      // 檢核 data 至少要有一筆
      if (this.data.length === 0) {
        this.messageService.errorBubble('請新增至少一筆明細資料');
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

  // 刪除明細資料
  onDelete(rows: TLS42020InsertDetailData[]): void {
    const idsToDelete = new Set(rows.map(item => item.SBM_SeqNo));
    this.data = this.data.filter(item => !idsToDelete.has(item.SBM_SeqNo));
    this.selectedRows = [];
  }

  // 選擇 PLU_MagNo (商品管理編號) 後自動帶出其他欄位的資料
  onFieldChange(event: FieldChangeEvent): void {
    // Normalize event shape to support different table implementations
    const anyEvent: any = event as any;
    const field = anyEvent.field ?? anyEvent.fieldName;
    const index = anyEvent.index ?? anyEvent.rowIndex;
    const value = anyEvent.value ?? anyEvent.newValue;
    const rowData = anyEvent.rowData ?? (typeof index === 'number' ? this.data[index] : undefined);

    if (field === 'PLU_MagNo' && typeof index === 'number') {
      const selectedProduct = this.PLU_MagNoOptions.find(item => item.PLU_MagNo === value);
      if (selectedProduct && rowData) {
        rowData.PLU_No = selectedProduct.PLU_No || selectedProduct.PLU_MagNo || '';
        rowData.PLU_Name = selectedProduct.PLU_Name || '';
        rowData.PLU_PrnName = selectedProduct.PLU_PrnName || selectedProduct.PLU_Name || '';
        rowData.PLU_FixPrc = selectedProduct.PLU_FixPrc || selectedProduct.PLU_FixPrc || '';
        rowData.PLU_SalePrc = selectedProduct.PLU_SalePrc || '';
        this.changeDetectorRef.detectChanges();
      }
    } else if (field === 'PLU_Name') {
      // 當手動輸入/修改 PLU_Name 時，同步更新 PLU_PrnName 為相同值（即時同步）
      if (rowData) {
        const newName = value ?? rowData.PLU_Name ?? '';
        rowData.PLU_PrnName = newName;
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  // 載入專櫃編號選項
  private loadOptions(): void {
    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.tltNoOptions = res.Data.map((item: any) => ({
          label: `${item.No}-${item.Name}`,
          value: item.No,
          name: item.Name
        }));
      });
  }

  //#region CRUD 操作
  private performInsert(payload: TLS42020InsertRequest): void {
    // debug: 印出要送出的 payload，方便後端錯誤追查
    console.debug('TLS42020 insert payload:', payload);

    this.tls42020Service.insertTLS42020M(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: () => {
          this.messageService.successBubble('新增成功');
          this.dataForm.reset();
          this.data = []; // 清空明細資料
        },
        error: (err) => {
          console.error('TLS42020 insert error:', err);
          const msg = err?.error?.Message || err?.message || JSON.stringify(err);
          this.messageService.errorBubble('新增失敗: ' + msg);
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
    // 轉成後端期望的 ISO 字串 (含 Z)
    const begDateISO = formValue.SBM_BegDate ? new Date(formValue.SBM_BegDate).toISOString() : '';
    const endDateISO = formValue.SBM_EndDate ? new Date(formValue.SBM_EndDate).toISOString() : '';

    const mainData = {
      STO_No: this.STORE_NO,
      SBM_Type: formValue.SBM_Type!,
      TLT_No: formValue.TLT_No!,
      TLT_Name: this.tltNoOptions.find(item => item.value === formValue.TLT_No)?.name ?? '',
      SBM_BegDate: begDateISO,
      SBM_EndDate: endDateISO
    };
    // 深拷貝明細資料並加上主檔欄位，符合 TLS42020InsertDetailData 格式
    const detailData: TLS42020InsertDetailData[] = this.data.map((item) => ({
      // 必要欄位
      MID: 0,
      status: '',
      // 複合主鍵
      STO_No: this.STORE_NO,
      SBM_Type: mainData.SBM_Type,
      TLT_No: mainData.TLT_No,
      SBM_BegDate: mainData.SBM_BegDate,
      SBM_EndDate: mainData.SBM_EndDate,
      // 明細資料
      SBM_SeqNo: item.SBM_SeqNo ?? '',  // 後端處理
      PLU_MagNo: item.PLU_MagNo ?? '',  // 若為空則由後端產生
      PLU_No: item.PLU_No,
      PLU_Name: item.PLU_Name,
      PLU_PrnName: item.PLU_PrnName,
      PLU_FixPrc: item.PLU_FixPrc !== undefined && item.PLU_FixPrc !== null ? String(item.PLU_FixPrc) : '',
      PLU_SalePrc: item.PLU_SalePrc !== undefined && item.PLU_SalePrc !== null ? String(item.PLU_SalePrc) : '',
      SBM_BtnNo: item.SBM_BtnNo
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
      MID: 0,
      STO_No: this.STORE_NO,
      SBM_Type: formValue.SBM_Type!,
      TLT_No: formValue.TLT_No!,
      TLT_Name: this.tltNoOptions.find(item => item.value === formValue.TLT_No)?.name ?? '',
      SBM_BegDate: formValue.SBM_BegDate!,
      SBM_EndDate: formValue.SBM_EndDate!
    };
    // 取得目前明細資料的 ID 集合
    const currentDetailIds = new Set(this.data.map(item => item.ID).filter(id => id));
    // 明細資料 - 轉換為 TLS42020UpdateDetailData 格式
    const detailData = this.data.map((item) => ({
      // 必要欄位
      MID: 0,
      STO_No: this.STORE_NO,
      // 複合主鍵
      SBM_Type: mainData.SBM_Type,
      TLT_No: mainData.TLT_No,
      SBM_BegDate: mainData.SBM_BegDate,
      SBM_EndDate: mainData.SBM_EndDate,
      // 明細資料
      SBM_SeqNo: item.SBM_SeqNo ?? '',  // 後端處理
      PLU_MagNo: item.PLU_MagNo ?? '',  // 若為空則由後端產生
      PLU_No: item.PLU_No,
      PLU_Name: item.PLU_Name,
      PLU_PrnName: item.PLU_PrnName,
      PLU_FixPrc: String(item.PLU_FixPrc),
      PLU_SalePrc: String(item.PLU_SalePrc),
      SBM_BtnNo: item.SBM_BtnNo,
      status: '',
      ID: typeof item.ID === 'number' ? item.ID : 0
    }));
    // 找出被刪除的資料 (原始資料中有，但目前資料中沒有的項目)
    const deletedDetailData = this.originalDetailData
      .filter(originalItem => originalItem.ID && !currentDetailIds.has(originalItem.ID))
      .map(item => ({
        MID: 0,
        STO_No: this.STORE_NO,
        SBM_Type: mainData.SBM_Type,
        TLT_No: mainData.TLT_No,
        SBM_BegDate: mainData.SBM_BegDate,
        SBM_EndDate: mainData.SBM_EndDate,
        SBM_SeqNo: item.SBM_SeqNo ?? '',
        PLU_MagNo: item.PLU_MagNo ?? '',
        PLU_No: item.PLU_No,
        PLU_Name: item.PLU_Name,
        PLU_PrnName: item.PLU_PrnName,
        PLU_FixPrc: String(item.PLU_FixPrc),
        PLU_SalePrc: String(item.PLU_SalePrc),
        SBM_BtnNo: item.SBM_BtnNo,
        status: 'deleted', // 被刪除的資料狀態設為 'deleted'
        ID: item.ID
      }));

    return {
      ...mainData,
      POS10271: [...detailData, ...deletedDetailData] // 合併現有資料和被刪除的資料
    };
  }
  //#endregion


  private requiredValidator(errorMessage: string) {
    // 符合 TableEdit 的 validate 函式簽名
    return (value: any, rowData?: any, data?: any[], field?: string, header?: string) => ({
      isValid: !!value,
      errorMessage: [errorMessage]
    });
  }

  // 載入 PLU_MagNo 選項
  loadPLU_MagNoOptions(tltNo: string): void {
    this.tls42020Service.dropdownTLS42020({ TLT_NO: [tltNo ?? ''] })
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(res => {
        // 將後端回傳資料 map 成 dropdown 可用格式 (PLU_MagNo, PLU_Name)
        this.PLU_MagNoOptions = (res.Data || []).map((item: any) => ({
          PLU_MagNo: item.PLU_MagNo ?? item.No ?? item.Value ?? item.value ?? item.PLUMagNo ?? '',
          PLU_Name: item.PLU_Name ?? item.Name ?? item.Label ?? item.label ?? item.PLUName ?? String(item)
        }));
      });
  }
}
