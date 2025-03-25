import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { MessageService } from 'primeng/api';

interface Bank {
  id: number;     //系統代號(遞增)
  BNK_No: string; //銀行代碼
  Name: string;   //銀行名稱
  BNK_ShortName: string;  // 簡稱
  sub_BNK_No?: string; //分行代碼
  sub_Name?: string;   //分行名稱
  Min_Length: number;
  Max_Length: number;
  editing?: boolean;  // 加上這一行來表示是否處於編輯狀態
}

@Component({
  selector: 'app-sysbc00',
  templateUrl: './sysbc00.component.html',
  styleUrl: './sysbc00.component.scss'
})
// 銀行基本資料維護作業
export class SYSBC00Component extends BasicQpageComponent implements OnInit {

  // --editTable object---
  deductions: Bank[] = [];

  editingRows: Set<any> = new Set(); // 用來追蹤哪些列正在編輯
  selectedRows: Set<number> = new Set<number>(); // 追蹤被選取的資料列

  years = [2014, 2015, 2016, 2017, 2018, 2019, 2020];
  months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  organizations = [102220, 102221, 102222];
  invoiceStatuses = ['開立', '未開立'];
  units = ['坪數', '收銀機台數'];
  calculatedByDayOptions = ['是', '否'];
  dataForm = this.formBuilder.group({})
  // -- --
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    // APS1001 銀行主檔
    BNK_No: ['', [Validators.maxLength(5)]], // 金資中心銀行代碼
    BNK_Name: ['', [Validators.maxLength(60)]], // 銀行名稱
    BNK_ShortName: ['', [Validators.maxLength(10)]], // 銀行簡稱
    Min_Length_From: [, [Validators.max(99)]], // 該行帳號最小長度
    Min_Length_To: [, [Validators.max(99)]], // 該行帳號最小長度
    Max_Length_From: [, [Validators.max(99)]], // 該行帳號最大長度
    Max_Length_To: [, [Validators.max(99)]], // 該行帳號最大長度

    // 以下可以不用顯示於查詢頁
    CRT_Date: [], // 建立日期
    CRT_USR_No: [, [Validators.maxLength(8)]], // 建立人員
    CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
    UPD_Date: [], // 變更日期
    UPD_USR_No: [, [Validators.maxLength(8)]], // 變更人員
    UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { id:1, BNK_No: '0000022', Name: '中央銀行國庫局', BNK_ShortName: '中銀', Min_Length: 6, Max_Length: 6,
      children: [
        { id:1, BNK_BranchNo: '001', Name: '中央銀行國庫局 永康分行' },
        { id:2, BNK_BranchNo: '002', Name: '中央銀行國庫局 鹽行分行' }
      ]
    },
    { id:2, BNK_No: '0040037', Name: '台灣銀行',BNK_ShortName: '台銀', Min_Length: 14, Max_Length: 14,
      children: [
        { id:3, BNK_BranchNo: '003', Name: '台灣銀行 永康分行' },
      ]
    },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[]= [
    { field: 'BNK_No', header: '金資中心銀行代碼', visible: true },
    { field: 'Name', header: '銀行名稱', visible: true },
    { field: 'BNK_ShortName', header: '銀行簡稱', visible: true },
    { field: 'Min_Length', header: '該行帳號最小長度', visible: true },
    { field: 'Max_Length', header: '該行帳號最大長度', visible: true },
    // 其他欄位
  ];

  subColumns: any[]= [
    { field: 'BNK_BranchNo', header: '銀行分行代號', visible: true },
    { field: 'Name', header: '銀行分行名稱', visible: true },
    // 其他子欄位
  ];
  // ----------------------------------------------------------------

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private messageService2: MessageService,
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '410010';
    this.cruPage = '/SYSB000/SYSBC00CRU';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 編輯列銀行資料
    this.deductions = [
      { id: 1, BNK_No: '0000022', Name: '中央銀行國庫局',sub_BNK_No: '001', sub_Name:'台中分行', BNK_ShortName: '中銀', Min_Length: 6, Max_Length: 6},
      { id: 2, BNK_No: '0000022', Name: '中央銀行國庫局',sub_BNK_No: '003', sub_Name:'高雄分行', BNK_ShortName: '中銀', Min_Length: 6, Max_Length: 6},
      { id: 3, BNK_No: '0000022', Name: '中央銀行國庫局',sub_BNK_No: '004', sub_Name:'台南分行', BNK_ShortName: '中銀', Min_Length: 6, Max_Length: 6},
      { id: 4, BNK_No: '0040037', Name: '台灣銀行',sub_BNK_No: '001', sub_Name:'桃園分行', BNK_ShortName: '台銀', Min_Length: 14, Max_Length: 14},
      { id: 5, BNK_No: '0040037', Name: '台灣銀行',sub_BNK_No: '002', sub_Name:'彰化分行', BNK_ShortName: '台銀', Min_Length: 14, Max_Length: 14}
    ];
    // ----------------------------------------------------------------
  }

  //--動態列處理邏輯--

  // 全選功能
  selectAllDeductions(): void {
    this.selectedRows = new Set(this.deductions.map(deduction => deduction.id));
  }

  // 取消全選功能
  deselectAllDeductions(): void {
    this.selectedRows.clear();
  }

  // 確認是否被選取
  isSelected(row: Bank): boolean {
    return this.selectedRows.has(row.id);
  }

  // 切換單列選取狀態
  toggleSelection(row: Bank): void {
    if (this.selectedRows.has(row.id)) {
      this.selectedRows.delete(row.id);
    } else {
      this.selectedRows.add(row.id);
    }
  }

  // 當所有資料都被選取時，自動勾選表頭的全選框。
  get allSelected(): boolean {
    return this.selectedRows.size === this.deductions.length;
  }

  addNewRow() {
    const newRow: Bank = { 
      id: this.deductions.length + 1, 
      BNK_No: '', 
      Name: '', 
      BNK_ShortName: '', 
      sub_BNK_No: '', 
      sub_Name: '', 
      Min_Length: 0, 
      Max_Length: 0, 
      editing: true // 新增行直接進入編輯狀態
    };
    this.deductions.push(newRow);
  }

  // 刪除所選擇的資料列
  deleteSelectedRows() {
    // 先過濾出所有未選中的資料列
    this.deductions = this.deductions.filter(deduction => !this.selectedRows.has(deduction.id));
    // 清空選中的資料列集合
    this.selectedRows.clear();
    // 顯示刪除提示訊息
    this.messageService2.add({ severity: 'warn', summary: '刪除成功', detail: '已刪除選中的資料' });
  }

  // 編輯行初始化
  onRowEditInit(row: Bank) {
    // 當開始編輯時，將該行的 editing 狀態設置為 true
    row.editing = true;
    this.editingRows.add(row); // 加入到編輯行集合
  }

  // 儲存編輯的資料
  onRowEditSave(row: Bank) {
    // 更新月份字串
    // const month = row.YearMonth.getMonth() + 1;  // getMonth() 返回的月份從 0 開始，所以需要 +1
    
    row.editing = false; // 取消編輯後設置為非編輯狀態
    this.editingRows.delete(row);
    this.messageService2.add({ severity: 'success', summary: '保存成功', detail: '已成功儲存編輯的資料' });
    console.log('儲存資料', this.deductions);
  }

  // 取消編輯
  onRowEditCancel(row: Bank, index: number) {
    row.editing = false; // 取消編輯後設置為非編輯狀態
    this.editingRows.delete(row);
    this.deductions[index] = { ...this.deductions[index] }; // 恢復原始資料
  }

  onRowDelete(row: Bank) {
    this.deductions = this.deductions.filter(ded => ded !== row);
    this.messageService2.add({ severity: 'warn', summary: '刪除成功', detail: '已刪除選中的資料' });
  }

  //------

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(this.router, CRUDStatus.Create, null, this.cruPage);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(this.router, CRUDStatus.Read, data, this.cruPage);
  }
  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
}
