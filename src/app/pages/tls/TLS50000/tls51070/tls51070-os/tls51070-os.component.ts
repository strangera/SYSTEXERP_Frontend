import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Tls51070Service } from '@service/api/tls/tls51070.service';
import { IPOS2004DetailData, IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { ExportLabelService } from '@service/utility/exportLabel.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateMinNumber, validateNumber, validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs/operators';

export interface Label {
  id: number,
  PLU_MagNo: string, // 商品管理碼
  PLU_Name: string,// 商品名稱
  Label_Qty: number // 標籤數量
  PLU_SalePrc: number // 商品售價
  PLU_Unit: string,// 商品單位
  PLU_OrgPLUNo: string,// 廠商貨號
  PLU_No: string,// 國際條碼
}

@Component({
  selector: 'app-tls51070-os',
  templateUrl: './tls51070-os.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    DropdownTableComponent,
    TableEditComponent
  ]
})
//處理 變價歷史紀錄/產生標籤檔
export class Tls51070OsComponent extends BasicCruPageComponent<Label> implements OnInit {
  baseId = 0; //初始id
  state = window.history.state; // 接收標頭
  // 查詢 變價歷史紀錄
  queryPriceForm = this.formBuilder.group({
    KeyWord: ['', [Validators.maxLength(20), Validators.required]], // 20260112調整: 商品管理編號/國際條碼/廠商貨號都以KeyWord送出
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  // ---------標籤檔 (label) 編輯表格 至少要一筆-------------------------------------------------------
  labelData: Label[] = [];
  labelColumn: EditColumn[] = [
    {
      field: 'PLU_No', header: '國際條碼',
      width: '150px',
      type: 'input',
      onBlur: (rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) => this.onPLU_MagNoBlur(rowData, value, col, index),
      validate: [validateRequired],
    },
    { field: 'PLU_MagNo', header: '商品管理碼' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'Label_Qty', header: '標籤數量', width: '150px', type: 'inputNumber', validate: [validateRequired, validateNumber, validateMinNumber(1)] },
    { field: 'PLU_SalePrc', header: '商品售價' },
    { field: 'PLU_Unit', header: '商品單位' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
  ];
  // ---------變價記錄 (price) 編輯表格 -------------------------------------------------------
  // label	資料
  priceData: Label[] = [];
  selectedItems: Label[] = [];// 多選項目
  // label 展開式表格的欄位定義
  priceColumn1: Column[] = [
    { field: 'LOGO_Name', header: '品牌代碼', visible: true },
    { field: 'PLU_MagNo', header: '商品編號', visible: true },
    { field: 'PLU_Name', header: '品名', visible: true },
    { field: 'PLU_NO', header: '國際條碼', visible: true },
    { field: 'PLU_OrgPLUNo', header: '商品貨號', visible: true },
    { field: 'CAT_LName', header: '大分類', visible: true },
    { field: 'CAT_MName', header: '中分類', visible: true },
    { field: 'CAT_SName', header: '小分類', visible: true },
    { field: 'PLU_OrderPrc_POS2004', header: '標準進價', visible: true, format: formatAmount },
    { field: 'PLU_SalePrc_POS2004', header: '商品售價', visible: true, format: formatAmount },
  ];
  priceColumn2: Column[] = [
    { field: 'LOGO_Name', header: '品牌代碼', visible: false },
    { field: 'PLU_MagNo', header: '商品編號', visible: false },
    { field: 'PLU_Name', header: '品名', visible: false },
    { field: 'PLU_NO', header: '國際條碼', visible: false },
    { field: 'PLU_OrgPLUNo', header: '商品貨號', visible: false },
    { field: 'CAT_LName', header: '大分類', visible: false },
    { field: 'CAT_MName', header: '中分類', visible: false },
    { field: 'CAT_SName', header: '小分類', visible: false },
    { field: 'PLU_OrderPrc_POS2004', header: '標準進價', visible: false, format: formatAmount },
    { field: 'PLU_SalePrc_POS2004', header: '商品售價', visible: false, format: formatAmount },
    { field: 'MAM_Date', header: '變價日期', visible: true, format: formatDate },
    { field: 'MAM_NO', header: '變價單號', visible: true },
    { field: 'PLU_SalePrc', header: '變價前售價', visible: true, format: formatAmount },
    { field: 'MAM_UnitPrc', header: '變價後售價', visible: true, format: formatAmount },
    { field: 'PLU_OrderPrc', header: '變價前進價', visible: true, format: formatAmount },
    { field: 'MAM_OrderPrc', header: '變價後進價', visible: true, format: formatAmount },
  ];
  // 展開式表格的載入狀態
  expandpriceLoading = false;
  constructor(
    private tls51070Service: Tls51070Service,
    private tls52010Service: Tls52010Service,
    private readonly exportLabelService: ExportLabelService,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51070');
    if (this.state.destination == 'history') {
      this.formTitle = '商品變價紀錄';
    } else if (this.state.destination == 'label') {
      this.formTitle = '產生標籤檔';
    } else {
      return
    }
  }

  onSubmitLabel(frm: FormGroup) {
    frm.get('queryNo')?.setValue(frm.get('KeyWord')?.value);
    this.handleSubmit(frm, () => {
      this.tls51070Service.getLabelTLS51070(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        if (response.Status === '0000') {
          const apiData = response.Data || [];
          const newLabelData = apiData.map((item: any) => ({
            id: this.baseId + 1, // 你原本的表格有使用 id 作為唯一值
            ...item
          }));
          this.baseId += 1;
          this.labelData = [...this.labelData, ...newLabelData];
        }
      });
    });
  }

  // 變價紀錄 查詢
  onSubmitPrice(frm: FormGroup) {
    frm.get('queryNo')?.setValue(frm.get('KeyWord')?.value);
    this.handleSubmit(frm, () => {
      this.tls51070Service.queryTLS51070_PriceChangeRecord(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        if (response.Status === '0000') {
          this.priceData = response.Data;
          if (!this.priceData || this.priceData.length === 0) {
            this.messageService.infoBubble('該商品無變價紀錄');
          }
        }
      });
    });
  }

  // 匯出標籤檔
  exportLabel() {
    if (!this.labelData || this.labelData.length === 0) {
      this.messageService.errorBubble('尚未產生標籤資料，請先查詢後再匯出');
      return;
    }

    // 1. 取得所有必填欄位的 field 名稱
    const requiredFields = this.labelColumn
      .filter(col => col.validate?.includes(validateRequired))
      .map(col => col.field);

    const isAllValid = this.labelData.every((row) => {
      // 檢查該列中所有必填欄位是否有值 (排除 null, undefined, 空字串)
      return requiredFields.every(field => {
        const value = (row as any)[field];
        return value !== null && value !== undefined && value !== '';
      });
    });

    // 3. 根據檢查結果進行後續動作
    if (!isAllValid) {
      this.messageService.errorBubble('標籤資料有必填欄位未填寫，請檢查！');
      return;
    }

    const exportData = this.labelData.map(({ ...rest }) => {
      return {
        PLU_MagNo: rest.PLU_MagNo,
        PLU_Name: rest.PLU_Name,
        PLU_SalePrc: rest.PLU_SalePrc,
        Label_Qty: rest.Label_Qty,
        PLU_Unit: rest.PLU_Unit,
        PLU_OrgPLUNo: rest.PLU_OrgPLUNo,
        PLU_No: rest.PLU_No
      }
    });
    this.exportLabelService.ExportLabel_Other(exportData).subscribe();
  }

  onPLU_MagNoBlur(rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) {
    if (!value || value.trim() === '') {
      this.labelData.splice(index, 1);
      this.labelData = [...this.labelData];
      this.cdr.detectChanges();
      return;
    }
    setTimeout(() => {
      const body = {
        VEN_No: '',
        LOGO_No: '',
        queryNo: value || '',
        pageSize: 30,
        pageIndex: 1,
        SortBy: [{ field: 'PLU_No', order: 1 }],
      };
      this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
        if (results.Data && results.Data.length > 0) {
          const newData = results.Data[0];
          const updatedRow: Label = {
            ...this.labelData[index], // 保留原本的 id 等資訊
            PLU_MagNo: newData.PLU_MagNo,
            PLU_Name: newData.PLU_Name,
            PLU_SalePrc: newData.PLU_SalePrc,
            PLU_Unit: newData.PLU_Unit,
            PLU_OrgPLUNo: newData.PLU_OrgPLUNo,
            PLU_No: newData.PLU_No
          };
          this.labelData[index] = updatedRow;
          this.labelData = [...this.labelData];
          this.cdr.detectChanges();
        } else {
          this.messageService.errorBubble('查無該商品資訊，已移除該行');
          this.labelData.splice(index, 1);
          this.labelData = [...this.labelData];
          this.cdr.detectChanges();
        }
      });
    }, 50);
  }

  //!!! 國際條碼/商品管理編號/廠商貨號
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼/商品管理編號/廠商貨號', mainDataField: true },
  ];
  onAutoCompleteInputChange(event: Record<'label', string>) {
    const body = {
      VEN_No: '',
      LOGO_No: '',
      queryNo: event.label || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_No', order: 1 }],
    }
    // !!! 若有自己這隻的API請改成自己的
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_No + '/' + item.PLU_MagNo + '/' + item.PLU_OrgPLUNo + ' - ' + item.PLU_Name
      }))];
    });
  }
}
