import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { AccordionModule } from 'primeng/accordion';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Tls51070Service } from '../../../service/api/tls/tls51070.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '../../../shared/componentkit/table/table.model';
import { ExportLabelService } from './../../../service/utility/exportLabel.service';

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
  imports: [MenubarComponent, ButtonComponent, AccordionModule, NgIf, FormsModule, ReactiveFormsModule, InputNumberComponent, ExpandableEditTableComponent, TableComponent, DropdownTableComponent]
})
//處理 變價歷史紀錄/產生標籤檔
export class Tls51070OsComponent extends BasicQueryPageComponent<Label> implements OnInit {

  @ViewChild('labelTable') labelTable!: ExpandableEditTableComponent;
  @ViewChild('priceAlterTable') priceAlterTable!: ExpandableEditTableComponent;

  formTitle!: string; //表頭
  baseId = 0; //初始id
  state = window.history.state; // 接收標頭

  // 查詢 標籤檔定加入欄位
  queryForm = this.formBuilder.group({
    KeyWord: ['', [Validators.maxLength(20)]], // 20260112調整: 商品管理編號/國際條碼/廠商貨號都以KeyWord送出

    Label_Qty: [1], // 標籤數量

    //分頁查詢
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });

  // 查詢 變價歷史紀錄
  queryPriceForm = this.formBuilder.group({
    KeyWord: ['', [Validators.maxLength(20)]], // 20260112調整: 商品管理編號/國際條碼/廠商貨號都以KeyWord送出
    //分頁查詢
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });

  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  // ---------標籤檔 (label) 編輯表格 至少要一筆-------------------------------------------------------
  // label	資料
  labelData: Label[] = [];
  // label 展開式表格的欄位定義
  labelColumn: ColumnDef[] = [
    { field: 'PLU_MagNo', header: '商品管理碼', editable: false, type: 'text' },
    { field: 'PLU_Name', header: '商品名稱', editable: false, type: 'text' },
    { field: 'Label_Qty', header: '標籤數量', editable: true, type: 'number' },
    { field: 'PLU_SalePrc', header: '商品售價', editable: false, type: 'number' },
    { field: 'PLU_Unit', header: '商品單位', editable: false, type: 'text' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號', editable: false, type: 'text' },
    { field: 'PLU_No', header: '國際條碼', editable: false, type: 'text' },
  ];

  // 展開式表格的載入狀態
  expandlabelLoading = false;

  //預覽標籤資料
  previewLabelData: Label | null = null;

  selectedItems: Label[] = [];// 多選項目
  // ----------------------------------------------------------------

  // ---------變價記錄 (price) 編輯表格 -------------------------------------------------------
  // label	資料
  priceData: Label[] = [];
  // label 展開式表格的欄位定義
  priceColumn1: Column[] = [
    //---基本資料---
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
    //---基本資料---
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
    //---變價歷程---
    { field: 'MAM_Date', header: '變價日期', visible: true, format: formatDate },
    { field: 'MAM_NO', header: '變價單號', visible: true },

    { field: 'PLU_SalePrc', header: '變價前售價', visible: true, format: formatAmount },
    { field: 'MAM_UnitPrc', header: '變價後售價', visible: true, format: formatAmount },

    { field: 'PLU_OrderPrc', header: '變價前進價', visible: true, format: formatAmount },
    { field: 'MAM_OrderPrc', header: '變價後進價', visible: true, format: formatAmount },
  ];

  // 展開式表格的載入狀態
  expandpriceLoading = false;

  // selectedItems: Label[] = [];// 多選項目
  // ----------------------------------------------------------------
  constructor(
    private tls51070Service: Tls51070Service,
    private tls52010Service: Tls52010Service,
    private readonly exportLabelService: ExportLabelService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51070');

    //更新顯示表頭部
    console.log(this.state.destination); // 標籤檔或歷史紀錄查詢
    if (this.state.destination == 'history') {
      this.formTitle = '商品變價紀錄';
    } else if (this.state.destination == 'label') {
      this.formTitle = '產生標籤檔';
    } else {
      return
    }

    // 監聽 KeyWord 變化並觸發標籤檔預覽
    this.queryForm.get('KeyWord')?.valueChanges.pipe(
      debounceTime(500),    // 延遲 500ms，等待使用者停止輸入或完成選擇
      distinctUntilChanged(), // 只有值真的改變時才觸發
      untilDestroyed(this)  // 組件銷毀時取消訂閱
    ).subscribe(value => {
      if (value) {
        this.previewLabel(); // 有值就呼叫預覽
      } else {
        this.previewLabelData = null; // 清空欄位時，清空預覽區塊
      }
    });
  }

  onSubmitLabel(frm: FormGroup) {
    // 將KeyWord值設定到queryNo
    frm.get('queryNo')?.setValue(frm.get('KeyWord')?.value);
    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
      this.loading = false;
      this.tls51070Service.getLabelTLS51070(frm.value).subscribe({
        next: (response) => {
          // console.log('回傳階層:', response.Data);
          if (response.Status === '0000') {
            const apiData = response.Data || [];
            console.log('標籤', apiData);

            // 賦值給 labelData（你想顯示的表格資料）
            const newLabelData = apiData.map((item: any) => ({
              id: this.baseId + 1, // 你原本的表格有使用 id 作為唯一值
              ...item
            }));

            this.baseId += 1;

            // ✅ 疊加進 labelData，允許重複
            this.labelData = [...this.labelData, ...newLabelData];

            console.log('標籤資料', this.labelData);


          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  // 變價紀錄 查詢
  onSubmitPrice(frm: FormGroup) {
    // 將KeyWord值設定到queryNo
    frm.get('queryNo')?.setValue(frm.get('KeyWord')?.value);
    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
      // 有資料的管理碼  "PLU_MagNo": "0700000002799"
      this.loading = false;
      this.tls51070Service.queryTLS51070_PriceChangeRecord(frm.value).subscribe({
        next: (response) => {
          // console.log('回傳階層:', response.Data);
          if (response.Status === '0000') {
            this.priceData = response.Data;
            console.log('變價資料', this.priceData);

            // ✅ 新增：如果沒有資料，顯示提示訊息
            if (!this.priceData || this.priceData.length === 0) {
              this.messageService.infoBubble('該商品無變價紀錄');
            }

          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  onBack() {
    this.router.navigate(['account/tls/tls51070']);
  }

  // 匯出標籤檔
  exportLabel() {
    if (!this.labelData || this.labelData.length === 0) {
      this.messageService.errorBubble('尚未產生標籤資料，請先查詢後再匯出');
      return;
    }

    if (this.labelTable) {
      // 檢查是否正在編輯「主行」(editingRow 不為 null 代表有行正在編輯)
      if (this.labelTable.editingRow !== null) {
        this.messageService.warnBubble('明細表格尚有未儲存的編輯項目，請先點擊「打勾」儲存或「取消」結束編輯。');
        return; // 中斷送出流程
      }
    }

    // 將 labelData 的每一筆物件複製一份，並移除 id 屬性
    const exportData = this.labelData.map(({ id, ...rest }) => rest);
    this.exportLabelService.ExportLabel_Other(exportData).subscribe();
  }

  //預覽標籤檔
  previewLabel() {
    const frm = this.queryForm;
    if (frm.invalid) return;

    this.tls51070Service.getLabelTLS51070(frm.value).subscribe({
      next: (response) => {
        if (response.Status === '0000' && response.Data && response.Data.length > 0) {
          const previewData = response.Data[0]; // 只取第一筆預覽
          console.log('預覽資料:', previewData);

          this.previewLabelData = previewData; // ✅ 更新 HTML 預覽用變數
        } else {
          this.previewLabelData = null; // 無結果清空預覽
        }
      },
      error: (err) => {
        console.error('無對應資料:', err);
        this.previewLabelData = null;
      }
    });
  }

  // label 明細檔案操作
  onRowSave(event: any) {
    // 確認事件對象有預期的屬性
    if (event && 'oldData' in event && 'newData' in event) {
      console.log('儲存主表格行:', event);
      // 這裡可以加入實際的API儲存邏輯
    } else {
      console.warn('收到未預期的事件格式:', event);
    }
  }

  onRowCancel(event: any) {
    console.log('取消主表格編輯:', event);
  }

  //刪除label
  deleteLabel(selectedItems: any[]): void {
    if (confirm(`確定要刪除 ${selectedItems.length} 個國際條碼項目嗎？`)) {
      const selectedIds = selectedItems.map(item => item.id);

      // 移除勾選的資料
      this.labelData = this.labelData.filter(item => !selectedIds.includes(item.id));

      // 清除已選項目（外部資料模型）
      this.selectedItems = [];

      // ✅ 清除 ExpandableEditTableComponent 的內部勾選狀態
      if (this.labelTable) {
        this.labelTable.selectedItems = [];
      }

      this.messageService.successBubble(`已刪除標籤資料`);
      console.log('刪除後的標籤資料', this.labelData);
    }
  }

  //---label 新ID---
  generateLabelId(data: Label[]): number {
    const maxId = Math.max(...data.map(p => p.id), 0);
    return maxId + 1;
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
