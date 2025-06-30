import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { PluLogo } from '../../../shared/models/tls/tls000.model';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';

export interface Label{
  id: number,
  PLU_MagNo: string, // 商品管理碼
  PLU_Name: string,// 商品名稱
  labelNumber: number // 標籤數量
  PLU_SalePrc: number // 商品售價
  PLU_Unit: string,// 商品單位
  PLU_OrgPLUNo: string,// 廠商貨號
  PLU_No: string,// 國際條碼
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

  formTitle!: string; //表頭

  // 查詢
  queryForm = this.formBuilder.group({
    // PLULOGO  商品品牌設定檔
    PLU_MagNo: ['', [Validators.maxLength(20)]], // 商品管理碼/國際條碼/廠商貨號
    labelNumber: [], // 標籤數量

    //分頁查詢
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  // ---------國際條碼 (POS2005) 編輯表格 至少要一筆-------------------------------------------------------
    // 國際條碼編號	下拉
    labelData: Label[] = [];
    // label 展開式表格的欄位定義
    labelColumn: ColumnDef[] = [
      { field: 'PLU_MagNo', header: '商品管理碼', editable: false, type: 'text' },
      { field: 'PLU_Name', header: '商品名稱', editable: false, type: 'text' },
      { field: 'labelNumber', header: '標籤數量', editable: true, type: 'number' },
      { field: 'PLU_SalePrc', header: '商品售價', editable: false, type: 'number' },
      { field: 'PLU_Unit', header: '商品單位', editable: false, type: 'text' },
      { field: 'PLU_OrgPLUNo', header: '廠商貨號', editable: false, type: 'text' },
      { field: 'PLU_No', header: '國際條碼', editable: false, type: 'text' },
    ];
    // 預設新項目模板
    defaultNewLabel = {
      PLU_MagNo: '', // 商品管理碼
      PLU_Name: '',
      labelNumber: 0,
      PLU_SalePrc: 0,
      PLU_Unit: '',
      PLU_OrgPLUNo: '',
      PLU_No: ''
    };
  
    // 展開式表格的載入狀態
    expandlabelLoading = false;

    selectedItems: Label[] = [];// 多選項目
  // ----------------------------------------------------------------
  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51070');

    //更新顯示表頭部
    const state = window.history.state;
    console.log(state.destination); // 標籤檔或歷史紀錄查詢
    if(state.destination == 'history'){
      this.formTitle = '變更歷史紀錄';
    }else if(state.destination == 'label'){
      this.formTitle = '產生標籤檔';
    }else{
      return
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
      this.loading = false;
      // this.tls51060Service.queryTLS51060(frm.value).subscribe({
      //   next: (response) => {
      //     // console.log('回傳階層:', response.Data);
      //     if (response.Status === '0000') {
      //       this.data = response.Data || [];
      //       console.log('Result', this.data);
      //       this.totalRecords = response.TotalCount || response.Data.length;
      //       this.queryStateService.setQueryState(this.ProgNo, frm.value);
      //     } else {
      //       console.error('API error:', response.Status, response.Message);
      //     }
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      //   error: (err: string) => {
      //     console.error('API error:', err);
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      // });
    });
  }

  isRowSelectable(rowData: PluLogo): boolean {
    return rowData.CanDel
  }

  onBack() {
    this.router.navigate(['account/TLS/TLS51070']);
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

  // 新增 label
  addPOSLabel(): void {
    const newPerson = {
      ...this.defaultNewLabel,
      id: this.generateLabelId(this.labelData),
      details: [] // 確保明細陣列存在
    };

    this.labelData.push(newPerson);

    // 自動進入編輯模式
    setTimeout(() => {
      const index = this.labelData.indexOf(newPerson);
      if (index >= 0) {
        this.labelTable.onRowEditInit(newPerson, index);
      }
    }, 0);
  }

  //刪除label
  deleteLabel(): void {
    if (confirm(`確定要刪除 ${this.selectedItems.length} 個國際條碼項目嗎？`)) {
      this.selectedItems.forEach(item => {
        const index = this.labelData.findIndex(d => d.id === item.id);
        if (index > -1) {
            this.labelData.splice(index, 1);
        }
      });
      this.messageService.successBubble(`已刪除 ${this.selectedItems.length} 個位置項目`);
    }
  }

    //---label 新ID---
    generateLabelId(data: Label[]): number {
      const maxId = Math.max(...data.map(p => p.id), 0);
      return maxId + 1;
    }
}
