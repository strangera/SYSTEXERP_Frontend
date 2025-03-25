import { Component, OnInit } from '@angular/core';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table-style',
  templateUrl: './table-style.component.html',
  styleUrl: './table-style.component.scss'
})
export class TableStyleComponent extends BasicQpageComponent implements OnInit {
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { id:1, BNK_No: '0000022', BNK_Name: '中央銀行國庫局', BNK_ShortName: '中銀', Min_Length: 6, Max_Length: 6,
      children: [
        { id:1,BNK_BranchNo: '001', BNK_BranchName: '中央銀行國庫局 永康分行' },
        { id:2,BNK_BranchNo: '002', BNK_BranchName: '中央銀行國庫局 鹽行分行' }
      ]
    },
    { id:2, BNK_No: '0040037', BNK_Name: '台灣銀行',BNK_ShortName: '台銀', Min_Length: 14, Max_Length: 14,
      children: [
        { id:3,BNK_BranchNo: '003', BNK_BranchName: '台灣銀行 永康分行' },
      ]
    },
    // 其他資料
  ];
  columns: any[]= [
    { field: 'BNK_No', header: '金資中心銀行代碼', visible: true },
    { field: 'BNK_Name', header: '銀行名稱', visible: true },
    { field: 'BNK_ShortName', header: '銀行簡稱', visible: true },
    { field: 'Min_Length', header: '該行帳號最小長度', visible: true },
    { field: 'Max_Length', header: '該行帳號最大長度', visible: true },
    // 其他欄位
  ];

  // ----------------------------------------------------------------
  filter_columns: any = "['name', 'code']";
  dialog_columns: any[]= [
    { field: 'id', header: 'Key', visible: true },
    { field: 'name', header: '功能名稱', visible: true },
    { field: 'code', header: '功能代碼', visible: true },
    // 其他欄位
  ];

  dialog_rows = [
    { id:1, name: '專櫃營運管理', code: 'SYS2000' },
    { id:2, name: '資材管理系統', code: 'SYSA000' },
    { id:3, name: '應付帳款系統', code: 'SYSP000' },
    { id:4, name: '零用金管理系統', code: 'SYSQ000' },
    { id:5, name: '應收帳款系統', code: 'SYSR000' },
    { id:6, name: '預算管理系統', code: 'SYSS000' },
    { id:7, name: '總帳管理系統', code: 'SYST000' },
    { id:8, name: '票據管理系統', code: 'SYSU000' },
    { id:9, name: '禮券管理系統', code: 'SYSV000' },
    { id:10, name: '自營管理系統', code: 'SYSW000' },
  ];


  subColumns: any[]= [
    { field: 'BNK_BranchNo', header: '銀行分行代號', visible: true },
    { field: 'BNK_BranchName', header: '銀行分行名稱', visible: true },
    // 其他子欄位
  ];

  constructor(
    private router: Router,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '900001';
    this.cruPage = '/demo/demoInputTableCRU';
    //
    // ----------------------------------------------------------------
  }


  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(this.router, CRUDStatus.Read, data, this.cruPage);
  }
}
