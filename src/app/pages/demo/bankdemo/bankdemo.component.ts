import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-bankdemo',
  templateUrl: './bankdemo.component.html',
  styleUrl: './bankdemo.component.scss'
})
export class BankdemoComponent extends BasicQpageComponent implements OnInit {
  // --editTable object---
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

    chooseMain: ['', [Validators.maxLength(5)]], // 選銀行
    chooseSub: ['', [Validators.maxLength(5)]],  // 選分行
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    {
      id: 1, BNK_No: '0000022', Name: '中央銀行國庫局', BNK_ShortName: '中銀', Min_Length: 6, Max_Length: 6,
      children: [
        { id: 1, BNK_BranchNo: '001', Name: '中央銀行國庫局 永康分行' },
        { id: 2, BNK_BranchNo: '002', Name: '中央銀行國庫局 鹽行分行' }
      ]
    },
    {
      id: 2, BNK_No: '0040037', Name: '台灣銀行', BNK_ShortName: '台銀', Min_Length: 14, Max_Length: 14,
      children: [
        { id: 3, BNK_BranchNo: '003', Name: '台灣銀行 永康分行' },
      ]
    },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'BNK_No', header: '金資中心銀行代碼', visible: true },
    { field: 'Name', header: '銀行名稱', visible: true },
    { field: 'BNK_ShortName', header: '銀行簡稱', visible: true },
    { field: 'Min_Length', header: '該行帳號最小長度', visible: true },
    { field: 'Max_Length', header: '該行帳號最大長度', visible: true },
    // 其他欄位
  ];

  subColumns: any[] = [
    { field: 'BNK_BranchNo', header: '銀行分行代號', visible: true },
    { field: 'Name', header: '銀行分行名稱', visible: true },
    // 其他子欄位
  ];

  // 模擬的資料
  Data: any[] = [
    { id: 1, main_No: '0000022', main_Name: '中央銀行國庫局', main_ShortName: '中銀', sub_No: '101', sub_Name: '中央銀行國庫局 A分行' },
    { id: 2, main_No: '0000022', main_Name: '中央銀行國庫局', main_ShortName: '中銀', sub_No: '102', sub_Name: '中央銀行國庫局 B分行' },
    { id: 3, main_No: '0040037', main_Name: '台灣銀行', main_ShortName: '台銀', sub_No: '201', sub_Name: '台灣銀行 C分行' },
    { id: 4, main_No: '0040037', main_Name: '台灣銀行', main_ShortName: '台銀', sub_No: '202', sub_Name: '台灣銀行 D分行' },
  ];

  tableColumns = [
    { field: 'id', header: 'ID', visible: true },
    { field: 'code', header: '代碼', visible: true },
    { field: 'name', header: '名稱', visible: true }
  ];

  tableData = [
    { id: 1, code: '0000022', name: '中央銀行國庫局' },
    { id: 2, code: '0040037', name: '台灣銀行' },
  ];

  subtableData: any[] = [];
  isRequired = false;
  // ----------------------------------------------------------------

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private cd: ChangeDetectorRef // 注入 ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '410010';
    this.cruPage = '/SYSB000/SYSBC00CRU';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------

    // 監聽 chooseMain 的變化
    this.queryForm.controls['chooseMain'].valueChanges.subscribe((value) => {
      console.log('選擇銀行:', value);
      //清空子項目
      this.subtableData = [];
      this.queryForm.controls['chooseSub'].setValue(null);
      console.log('chooseSub', this.queryForm.controls['chooseSub'].value);

      this.updateTableData(value);
      this.cd.detectChanges(); // 手動觸發變更檢測
    });
  }
  updateTableData(mainValue: string | null) {
    // console.log('mainValue',typeof mainValue);
    const parsedValue = Number(mainValue) || 0; // 強制轉換為數字
    if (parsedValue == 1) {
      this.subtableData = [
        { id: 1, code: '101', name: '中央銀行國庫局 A分行' },
        { id: 2, code: '102', name: '中央銀行國庫局 B分行' },
      ];
    } else if (parsedValue == 2) {
      this.subtableData = [
        { id: 1, code: '201', name: '台灣銀行 C分行' },
        { id: 2, code: '202', name: '台灣銀行 D分行' },
      ];
    } else {
      this.subtableData = []; // 預設空陣列
    }
  }

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
