import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Tls51070Service } from '@service/api/tls/tls51070.service';
import { IPOS2004DetailData } from '@service/api/tls/tls52010.service';
import { Pos2004SearchKey } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ExportLabelService } from '@service/utility/exportLabel.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateMinNumber, validateNumber, validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs/operators';
import { ProductAutocompleteComponent } from "src/app/shared/biz-components/product-autocomplete/product-autocomplete";

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
    TableEditComponent,
    ProductAutocompleteComponent
  ]
})
//處理 變價歷史紀錄/產生標籤檔
export class Tls51070OsComponent extends BasicCruPageComponent<Label> implements OnInit {
  private tls51070Service = inject(Tls51070Service);
  private readonly exportLabelService = inject(ExportLabelService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dropDown = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);
  baseId = 0; //初始id
  state = globalThis.history.state; // 接收標頭
  queryPriceForm = this.formBuilder.group({
    KeyWord: ['', [Validators.maxLength(20), Validators.required]], // 20260112調整: 商品管理編號/國際條碼/廠商貨號都以KeyWord送出
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
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
  priceData: Label[] = [];
  selectedItems: Label[] = [];// 多選項目
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
  expandpriceLoading = false;

  ngOnInit(): void {
    this.initializePage('TLS51070');
    this.formTitle = this.state.destination == 'history' ? '商品變價紀錄' : '產生標籤檔';
  }

  onSubmitLabel(frm: FormGroup) {
    this.runQuery(frm, () => {
      this.tls51070Service.getLabelTLS51070(frm.value).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading = false)).subscribe(response => {
        const apiData: Omit<Label, 'id'>[] = response.Data || [];
        const newLabelData = apiData.map((item) => ({
          id: this.baseId + 1, // 你原本的表格有使用 id 作為唯一值
          ...item
        }));
        this.baseId += 1;
        this.labelData = [...this.labelData, ...newLabelData];
      });
    });
  }

  // 變價紀錄 查詢
  onSubmitPrice(frm: FormGroup) {
    this.runQuery(frm, () => {
      this.tls51070Service.queryTLS51070_PriceChangeRecord(frm.value).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading = false)).subscribe(response => {
        this.priceData = response.Data;
        if (!this.priceData || this.priceData.length === 0) {
          this.messageService.infoBubble('該商品無變價紀錄');
        }
      });
    });
  }

  // 這頁是查詢/產生標籤用途，不是真正的新增或編輯存檔，
  // 不能用繼承來的 handleSubmit()（會被 isFormCreateable/isFormEditable 卡住，
  // 因為導頁進來時 crudstatus 一直是預設的 Read，永遠不會執行 callback）。
  private runQuery(frm: FormGroup, callback: () => void) {
    this.submitted = true;
    if (frm.invalid) {
      this.loading = false;
      return;
    }
    this.submitted = false;
    this.loading = true;
    callback();
  }

  // 匯出標籤檔
  exportLabel() {
    if (!this.labelData || this.labelData.length === 0) {
      this.messageService.errorBubble('尚未產生標籤資料，請先查詢後再匯出');
      return;
    }
    // 1. 取得所有必填欄位的 field 名稱
    const requiredFields = this.labelColumn.filter(col => col.validate?.includes(validateRequired)).map(col => col.field);
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
    this.loading = true;
    this.exportLabelService.ExportLabel_Other(exportData).pipe(finalize(() => { this.loading = false })).subscribe();
  }

  onPLU_MagNoBlur(rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) {
    if (!value || value.trim() === '') {
      this.labelData.splice(index, 1);
      this.labelData = [...this.labelData];
      this.cdr.detectChanges();
      return;
    }
    setTimeout(() => {
      const body: Pos2004SearchKey = {
        SearchKey: value.trim()
      };
      this.dropDown.queryPOS2004_BySearchKey(body).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((results) => {
        if (results && results.length > 0) {
          const newData = results[0]; // 取得第一筆匹配項
          const updatedRow: Label = {
            ...this.labelData[index],
            PLU_MagNo: newData.PLU_MagNo,
            PLU_No: newData.PLU_No,
            PLU_Name: newData.PLU_Name,
            PLU_SalePrc: newData.PLU_SalePrc,
            PLU_Unit: newData.PLU_Unit,
            PLU_OrgPLUNo: newData.PLU_OrgPLUNo
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
}
