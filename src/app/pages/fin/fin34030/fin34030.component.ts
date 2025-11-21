import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-fin34030',
  templateUrl: './fin34030.component.html',
  styleUrl: './fin34030.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CalendarRangeComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule]
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
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '130009';
    // 初始化下拉選單選項
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
      this.router.navigate(['/demoCRU'], extras);
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
    this.router.navigate(['/demoCRU'], extras);
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
