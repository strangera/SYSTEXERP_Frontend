import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-fin34030',
  templateUrl: './fin34030.component.html',
  styleUrl: './fin34030.component.scss'
})
export class FIN34030Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    fncCode: [], // 廠客代號
    accountCode: [], // 科目代號
    displayAmount: [2], // 應付金額是否顯示
    showZeroBalance: [2], // 帳款餘額為零是否顯示
    sAdjDate: [], // 調整日期範圍的開始日期
    eAdjDate: [], // 調整日期範圍的結束日期
    sPostDate: [], // 立帳日期範圍的開始日期
    ePostDate: [], // 立帳日期範圍的結束日期
    sRpd: [], // 收/付款日期範圍的開始日期
    eRpd: [], // 收/付款日期範圍的結束日期
    displayOnlyCounter: [2], // 是否只顯示專櫃
  });

  // 下拉選單選項
  fncCodeOptions: any[] = [];
  accountCodeOptions: any[] = [];
  displayAmountOptions: any[] = []; // 應付金額是否顯示選項
  showZeroBalanceOptions: any[] = []; // 帳款餘額為零是否顯示選項
  displayOnlyCounterOptions: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'vendorDescription', header: '廠商代號說明', visible: true },
    { field: 'vendorName', header: '廠商名稱', visible: true },
    { field: 'contractType', header: '條約別', visible: true },
    { field: 'receiptMethod', header: '收款/應收沖帳號碼', visible: true },
    { field: 'invoiceNumber', header: '立帳傳票號碼', visible: true },
    { field: 'accountingDescription', header: '會計科目編號及名稱', visible: true },
    { field: 'establishDate', header: '立帳日期', visible: true },
    { field: 'dueDate', header: '到期日', visible: true },
    { field: 'receiptAmount', header: '應收(付)立帳金額', visible: true },
    { field: 'collectedAmount', header: '收(付)款金額', visible: true },
    { field: 'adjustmentAmount', header: '調整金額', visible: true },
    { field: 'accountBalance', header: '應收(付)帳款餘額', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private ifdisplayService: IfdisplayService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '130009';
    // 初始化下拉選單選項
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.ifdisplayService.getOptions().subscribe((data) => (this.displayAmountOptions = data));
    this.ifdisplayService.getOptions().subscribe((data) => (this.showZeroBalanceOptions = data));
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 查詢提交邏輯
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onCreate() {
    if (this.canAdd()) {
      const extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['FIN3000/FIN34030CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      const extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoinputtableCRU'], extras);
    }
  }

  onDetail(data: any) {
    const extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoinputtableCRU'], extras);
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
