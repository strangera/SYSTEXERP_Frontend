import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { PluLogo } from '../../../shared/models/tls/tls000.model';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Tls51070Service } from '../../../service/api/tls/tls51070.service';

export interface Label{
  id: number,
  PLU_MagNO: string, // 商品管理碼
  PLU_Name: string,// 商品名稱
  Label_Qty: number // 標籤數量
  PLU_SalePrc: number // 商品售價
  PLU_Unit: string,// 商品單位
  PLU_OrgPLUNo: string,// 廠商貨號
  PLU_NO: string,// 國際條碼
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
  baseId = 0; //初始id

  // 查詢
  queryForm = this.formBuilder.group({
    // PLULOGO  商品品牌設定檔
    PLU_MagNo: ['', [Validators.required, Validators.maxLength(20)]], // 商品管理碼
    PLU_No: ['', [Validators.required, Validators.maxLength(20)]], // 國際條碼
    PLU_OrgPLUNo: ['', [Validators.required, Validators.maxLength(20)]], // 廠商貨號
    Label_Qty: [], // 標籤數量

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
      { field: 'PLU_MagNO', header: '商品管理碼', editable: false, type: 'text' },
      { field: 'PLU_Name', header: '商品名稱', editable: false, type: 'text' },
      { field: 'Label_Qty', header: '標籤數量', editable: true, type: 'number' },
      { field: 'PLU_SalePrc', header: '商品售價', editable: false, type: 'number' },
      { field: 'PLU_Unit', header: '商品單位', editable: false, type: 'text' },
      { field: 'PLU_OrgPLUNo', header: '廠商貨號', editable: false, type: 'text' },
      { field: 'PLU_NO', header: '國際條碼', editable: false, type: 'text' },
    ];
    // 預設新項目模板
    defaultNewLabel = {
      PLU_MagNO: '', // 商品管理碼
      PLU_Name: '',
      Label_Qty: 0,
      PLU_SalePrc: 0,
      PLU_Unit: '',
      PLU_OrgPLUNo: '',
      PLU_NO: ''
    };
  
    // 展開式表格的載入狀態
    expandlabelLoading = false;

    selectedItems: Label[] = [];// 多選項目
  // ----------------------------------------------------------------
  constructor(private tls51070Service: Tls51070Service) {
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
      this.tls51070Service.getLabelTLS51070(frm.value).subscribe({
        next: (response) => {
          // console.log('回傳階層:', response.Data);
          if (response.Status === '0000') {
            const apiData = response.Data || [];
            console.log('標籤',apiData);

            // 賦值給 labelData（你想顯示的表格資料）
            const newLabelData = apiData.map((item: any, index: number) => ({
              id: this.baseId + 1, // 你原本的表格有使用 id 作為唯一值
              PLU_MagNO: item.PLU_MagNO,
              PLU_Name: item.PLU_Name,
              Label_Qty: item.Label_Qty || 0, // 預設數量為 0
              PLU_SalePrc: item.PLU_SalePrc,
              PLU_Unit: item.PLU_Unit,
              PLU_OrgPLUNo: item.PLU_OrgPLUNo,
              PLU_NO: item.PLU_NO,
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
      this.messageService.successBubble(`已刪除 ${this.selectedItems.length} 國際條碼`);
    }
  }

    //---label 新ID---
    generateLabelId(data: Label[]): number {
      const maxId = Math.max(...data.map(p => p.id), 0);
      return maxId + 1;
    }
}
