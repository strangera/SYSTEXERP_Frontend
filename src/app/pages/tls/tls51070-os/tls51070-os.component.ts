import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatDate } from '../../../shared/componentkit/table/table.model';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Tls51070Service } from '../../../service/api/tls/tls51070.service';

export interface Label{
  id: number,
  PLU_MagNo: string, // 商品管理碼
  PLU_Name: string,// 商品名稱
  Label_Qty: number // 標籤數量
  PLU_SalePrc: number // 商品售價
  PLU_Unit: string,// 商品單位
  PLU_OrgPLUNo: string,// 廠商貨號
  PLU_No: string,// 國際條碼
}

// 標籤檔至少輸入其中一項 檢核
export function atLeastOneFieldRequired(fields: string[]): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const hasAtLeastOne = fields.some(field => {
      const value = formGroup.get(field)?.value;
      return value !== null && value !== undefined && value.toString().trim() !== '';
    });

    return hasAtLeastOne ? null : { atLeastOneRequired: true };
  };
}

@Component({
  selector: 'app-tls51070-os',
  templateUrl: './tls51070-os.component.html',
  styleUrl: './tls51070-os.component.scss'
})
//處理 變價歷史紀錄/產生標籤檔
export class Tls51070OsComponent extends BasicQueryPageComponent<Label>
  implements OnInit{

  @ViewChild('labelTable') labelTable!: ExpandableEditTableComponent;
  @ViewChild('priceAlterTable') priceAlterTable!: ExpandableEditTableComponent;

  formTitle!: string; //表頭
  baseId = 0; //初始id
  state = window.history.state; // 接收標頭

  // 查詢 標籤檔定加入欄位
  queryLabelForm = this.formBuilder.group({
    PLU_MagNo: ['', [Validators.maxLength(20)]], // 商品管理碼
    PLU_No: ['', [Validators.maxLength(20)]], // 國際條碼
    PLU_OrgPLUNo: ['', [Validators.maxLength(20)]], // 廠商貨號
    Label_Qty: [1], // 標籤數量

    //分頁查詢
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  }, {
  validators: atLeastOneFieldRequired(['PLU_MagNo', 'PLU_No', 'PLU_OrgPLUNo']) //至少要填寫其中一項
  });

  // 查詢 變價歷史紀錄
  queryPriceForm = this.formBuilder.group({
    PLU_MagNo: ['', [Validators.required, Validators.maxLength(20)]], // 商品管理碼
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

    selectedItems: Label[] = [];// 多選項目
  // ----------------------------------------------------------------

  // ---------變價記錄 (price) 編輯表格 -------------------------------------------------------
    // label	資料
    priceData: Label[] = [];
    // label 展開式表格的欄位定義
    priceColumn: Column[] = [
      //---基本資料---
      { field: 'LOGO_Name', header: '品牌編號', visible: true },
      { field: 'PLU_MagNo', header: '商品編號', visible: true },
      { field: 'PLU_Name', header: '品名', visible: true },
      { field: 'PLU_NO', header: '國際條碼', visible: true },
      { field: 'PLU_OrgPLUNo', header: '商品貨號', visible: true },
      { field: 'CAT_LName', header: '大分類', visible: true },
      { field: 'CAT_MName', header: '中分類', visible: true },
      { field: 'CAT_SName', header: '小分類', visible: true },

      { field: 'PLU_OrderPrc_POS2004', header: '標準進價', visible: true },
      { field: 'PLU_SalePrc_POS2004', header: '商品售價', visible: true },

      //---變價歷程---
      { field: 'MAM_Date', header: '變價日期', visible: true,  format: formatDate},
      { field: 'MAM_NO', header: '變價單號', visible: true },
  
      { field: 'PLU_SalePrc', header: '變價前售價', visible: true },
      { field: 'MAM_UnitPrc', header: '變價後售價', visible: true },

      { field: 'PLU_OrderPrc', header: '變價前進價', visible: true },
      { field: 'MAM_OrderPrc', header: '變價後進價', visible: true },
    ];
  
    // 展開式表格的載入狀態
    expandpriceLoading = false;

    // selectedItems: Label[] = [];// 多選項目
  // ----------------------------------------------------------------
  constructor(private tls51070Service: Tls51070Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51070');

    //更新顯示表頭部
    console.log(this.state.destination); // 標籤檔或歷史紀錄查詢
    if(this.state.destination == 'history'){
      this.formTitle = '商品變價紀錄';
    }else if(this.state.destination == 'label'){
      this.formTitle = '產生標籤檔';
    }else{
      return
    }
  }

  onSubmitLabel(frm: FormGroup) {
    if (this.queryLabelForm.invalid) {
      if (this.queryLabelForm.errors?.['atLeastOneRequired']) {
        this.messageService.errorBubble('請至少填寫「商品管理碼」、「國際條碼」或「廠商貨號」其中一項');
      }
      return;
    }

    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
      this.loading = false;
      this.tls51070Service.getLabelTLS51070(frm.value).subscribe({
        next: (response) => {
          // console.log('回傳階層:', response.Data);
          if (response.Status === '0000') {
            const apiData = response.Data || [];
            console.log('標籤',apiData);

            // 賦值給 labelData（你想顯示的表格資料）
            const newLabelData = apiData.map((item: any) => ({
              id: this.baseId + 1, // 你原本的表格有使用 id 作為唯一值
              ...item
            }));

            this.baseId+=1;

            // ✅ 疊加進 labelData，允許重複
            this.labelData = [...this.labelData, ...newLabelData];

            console.log('標籤資料',this.labelData);


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
    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
      // 有資料的管理碼  "PLU_MagNo": "0700000002799"
      this.loading = false;
      this.tls51070Service.queryTLS51070_PriceChangeRecord(frm.value).subscribe({
        next: (response) => {
          // console.log('回傳階層:', response.Data);
          if (response.Status === '0000') {
            this.priceData  = response.Data;
            console.log('變價資料',this.priceData);

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
  exportLabel(){
    // 將 labelData 的每一筆物件複製一份，並移除 id 屬性
    const exportData = this.labelData.map(({ id, ...rest }) => rest);
    this.tls51070Service.exportLabel(exportData)
      .subscribe((response) => {
        // 處理匯出完成後的邏輯（如有需要）
         const result = response;
        // console.log('匯出標籤檔',result);

        // 建立 blob 對象
        const bom = '\uFEFF'; // UTF-8 BOM
        const blob = new Blob([bom + result], { type: 'text/plain;charset=utf-8' });

        // 建立下載連結
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exportLabel.txt'; // 檔案名稱
        a.click();

        // 釋放資源
        window.URL.revokeObjectURL(url);
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
}
