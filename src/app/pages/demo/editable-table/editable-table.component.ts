import { MessageService } from 'primeng/api';
import { Component, Injectable, OnInit } from '@angular/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { NavigationExtras, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { PermissionsInfo } from '../../../shared/models/system/funsrightInfo';


interface Deduction {
  serialNumber: number;
  deductionCode: string;
  deductionName: string;
  YearMonth: Date;
  unit: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  organization: number;
  invoiceStatus: string;
  editing?: boolean;  // 加上這一行來表示是否處於編輯狀態
}

// 可修改table範例元件
@Component({
  selector: 'app-editable-table',
  templateUrl: './editable-table.component.html',
  styleUrl: './editable-table.component.scss'
})

export class EditableTableComponent extends BasicCrupageComponent implements OnInit {
  deductions: Deduction[] = [];

  editingRows: Set<any> = new Set(); // 用來追蹤哪些列正在編輯
  selectedRows: Set<number> = new Set<number>(); // 追蹤被選取的資料列

  years = [2014, 2015, 2016, 2017, 2018, 2019, 2020];
  months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  organizations = [102220, 102221, 102222];
  invoiceStatuses = ['開立', '未開立'];
  units = ['坪數', '收銀機台數'];
  calculatedByDayOptions = ['是', '否'];
  loading: boolean = false;
  dataForm = this.formBuilder.group({})

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private messageService2: MessageService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '210010';

    // 一次扣款資料
    this.deductions = [
      { serialNumber: 1, deductionCode: 'A01', deductionName: '開標費財費', YearMonth: new Date(2015, 0), unit: '', unitPrice: 10000, quantity: 1, amount: 10000, organization: 102220, invoiceStatus: '開立' },
      { serialNumber: 2, deductionCode: 'A02', deductionName: '識別證', YearMonth: new Date(2012, 1), unit: '', unitPrice: 0, quantity: 0, amount: 0, organization: 102220, invoiceStatus: '開立' },
      { serialNumber: 3, deductionCode: 'A03', deductionName: '影印費', YearMonth: new Date(2014, 2), unit: '', unitPrice: 0, quantity: 0, amount: 0, organization: 102220, invoiceStatus: '開立' },
      { serialNumber: 4, deductionCode: 'A04', deductionName: '紙袋、包裝費', YearMonth: new Date(2014, 3), unit: '', unitPrice: 0, quantity: 0, amount: 0, organization: 102220, invoiceStatus: '開立' },
      { serialNumber: 5, deductionCode: 'A05', deductionName: '簽票費用', YearMonth: new Date(2015, 4), unit: '', unitPrice: 0, quantity: 0, amount: 0, organization: 102220, invoiceStatus: '開立' }
    ];
  }

  // 計算發票月的方法
  getInvoicePeriod(date: Date): string {
    const month = date.getMonth() + 1; // JavaScript 的月份從 0 開始
    const startMonth = month % 2 === 0 ? month - 1 : month; // 找到對應的發票月開始月份
    const endMonth = startMonth + 1; // 發票月的結束月份
    return `${startMonth}-${endMonth}月`; // 回傳發票月字串
  }

  // 全選功能
  selectAllDeductions(): void {
    this.selectedRows = new Set(this.deductions.map(deduction => deduction.serialNumber));
  }

  // 取消全選功能
  deselectAllDeductions(): void {
    this.selectedRows.clear();
  }

  // 確認是否被選取
  isSelected(row: Deduction): boolean {
    return this.selectedRows.has(row.serialNumber);
  }

  // 切換單列選取狀態
  toggleSelection(row: Deduction): void {
    if (this.selectedRows.has(row.serialNumber)) {
      this.selectedRows.delete(row.serialNumber);
    } else {
      this.selectedRows.add(row.serialNumber);
    }
  }

  // 當所有資料都被選取時，自動勾選表頭的全選框。
  get allSelected(): boolean {
    return this.selectedRows.size === this.deductions.length;
  }

  onSubmitNext(): void {
    this.router.navigate(['TLS1000/TLS13010NEXT2']);
  }
  onCancel() {
    this.router.navigate(['TLS1000/TLS13010']);
  }//CRU
  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU
  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Implement your form submission logic here
      console.log(frm.value);
    }

    this.loading = false;
    this.messageService.unblockUi();
  }
  // Check if the user has query permission
  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }

  addNewRow() {
    const newRow: Deduction = {
      serialNumber: this.deductions.length + 1,
      deductionCode: '',
      deductionName: '',
      YearMonth: new Date(2024, 0, 1),
      unit: '',
      unitPrice: 0,
      quantity: 0,
      amount: 0,
      organization: 102220,
      invoiceStatus: '未開立',
      editing: true // 新增行直接進入編輯狀態
    };
    this.deductions.push(newRow);
  }

  // 刪除所選擇的資料列
  deleteSelectedRows() {
    // 先過濾出所有未選中的資料列
    this.deductions = this.deductions.filter(deduction => !this.selectedRows.has(deduction.serialNumber));
    // 清空選中的資料列集合
    this.selectedRows.clear();
    // 顯示刪除提示訊息
    this.messageService2.add({ severity: 'warn', summary: '刪除成功', detail: '已刪除選中的資料' });
  }

  // 編輯行初始化
  onRowEditInit(row: Deduction) {
    // 當開始編輯時，將該行的 editing 狀態設置為 true
    row.editing = true;
    this.editingRows.add(row); // 加入到編輯行集合
  }

  // 儲存編輯的資料
  onRowEditSave(row: Deduction) {
    // 更新月份字串
    const month = row.YearMonth.getMonth() + 1;  // getMonth() 返回的月份從 0 開始，所以需要 +1

    row.editing = false; // 取消編輯後設置為非編輯狀態
    this.editingRows.delete(row);
    this.messageService2.add({ severity: 'success', summary: '保存成功', detail: '已成功儲存編輯的資料' });
    console.log('儲存資料', this.deductions);
  }

  // 取消編輯
  onRowEditCancel(row: Deduction, index: number) {
    row.editing = false; // 取消編輯後設置為非編輯狀態
    this.editingRows.delete(row);
    this.deductions[index] = { ...this.deductions[index] }; // 恢復原始資料
  }

  onRowDelete(row: Deduction) {
    this.deductions = this.deductions.filter(ded => ded !== row);
    this.messageService2.add({ severity: 'warn', summary: '刪除成功', detail: '已刪除選中的資料' });
  }
}
