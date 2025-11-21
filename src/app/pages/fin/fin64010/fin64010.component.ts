import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { AuthService } from '../../../service/system/auth.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-fin64010',
  templateUrl: './fin64010.component.html',
  styleUrls: ['./fin64010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    InputNumberRangeComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class FIN64010Component extends BasicQpageComponent implements OnInit {
  // Form group controls matching the HTML
  queryForm = this.formBuilder.group({
    billNumber: [], // 票據號碼
    vendorCode: [], // 廠客代號
    bankAccountCode: [], // 銀行代號
    customerBankAccount: [], // 客戶銀行帳號
    issueDateStart: [], // 託收日
    issueDateEnd: [],
    dueDateStart: [], // 收票日
    dueDateEnd: [],
    expiryDateStart: [], // 到期日
    expiryDateEnd: [],
    expectedCashDateStart: [], // 預兌日
    expectedCashDateEnd: [],
    cashDateStart: [], // 兌現日
    cashDateEnd: [],
    amountStart: [], // 票面金額
    amountEnd: [],
    billTitle: [], // 收款單號
    billType: [], // 票據種類
    isCustomerBill: [], // 是否客票
    remarks: [], // 備註
    organizationCode: [], // 組織代號
    eventCode: [], // 活動代號
    status: [], // 狀態
    billStatus: [], // 票據狀態
    paymentBillNumber: [], // 應收票據會計科目
    voucherNumber: [], // 傳票號碼
    targetCode: [], // 對象別編號
    reconciliationKey: [], // 對帳KEY值
    salesmanCode: [], // 收票業務員代碼
    bankAccountCodeForCollection: [], // 公司銀行科目代號託收銀行
  });

  // Dropdown options
  vendorCodeOptions: any[] = [
    { value: 1, label: '00000000-1' },
    { value: 2, label: '00000000-2' },
    { value: 3, label: '00000000-3' },
    { value: 4, label: '00000000-4' },
    { value: 5, label: '00000000-5' },
  ];
  bankAccountCodeOptions: any[] = [
    { value: 1, label: '110301' },
    { value: 2, label: '110302' },
    { value: 3, label: '110303' },
  ];
  isCustomerBillOptions: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];
  billTypeOptions: any[] = [
    { value: 1, label: '本票' },
    { value: 2, label: '支票' },
  ];
  organizationCodeOptions: any[] = [
    { value: 1, label: '全公司' },
    { value: 2, label: '稽核室' },
    { value: 3, label: '經營企劃部' },
  ];
  eventCodeOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
    { value: 3, label: '003' },
  ];
  statusOptions: any[] = [
    { value: 1, label: '確定' },
    { value: 2, label: '拋轉' },
  ];
  billStatusOptions: any[] = [
    { value: 1, label: '作廢' },
    { value: 2, label: '未異動' },
    { value: 3, label: '託收' },
  ];
  salesmanCodeOptions: any[] = [
    { value: 1, label: 'S001' },
    { value: 2, label: 'S002' },
    { value: 3, label: 'S003' },
  ];
  targetCodeOptions: any[] = [
    { value: 1, label: '臺南紡織股份有限公司' },
    { value: 2, label: '統一企業股份有限公司' },
  ];

  // Table data
  data: any[] = [];

  filteredData: any[] = [...this.data];

  columns: any[] = [
    { field: 'ticketNumber', header: '票據號碼', visible: true },
    { field: 'customerCode', header: '顧客代號', visible: true },
    { field: 'provinceBankCode', header: '全省銀行代號', visible: true },
    { field: 'customerBankAccount', header: '客戶銀行帳號', visible: true },
    { field: 'companyBankAccount', header: '公司銀行科目代號託收銀行', visible: true },
    { field: 'receiptDate', header: '收票日', visible: true },
    { field: 'receiptNumber', header: '收款單號', visible: true },
    { field: 'dueDate', header: '到期日', visible: true },
    { field: 'prepaymentDate', header: '預免日', visible: true },
    { field: 'cashDate', header: '兌現日', visible: true },
    { field: 'ticketAmount', header: '票面金額', visible: true },
    { field: 'ticketType', header: '票據種類', visible: true },
    { field: 'isReceived', header: '是否客票', visible: true },
    { field: 'note', header: '備註', visible: true },
    { field: 'organizationCode', header: '組織代號', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'billStatus', header: '票據狀態', visible: true },
    { field: 'voucherNumber', header: '傳票號碼', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    super(); // Call parent constructor
  }

  ngOnInit(): void {
    this.ProgNo = '160014';

    // Initialize dropdown options
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['FIN3000/FIN64010CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
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
    let extras: NavigationExtras = {
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
    this.queryForm.reset(); // Reset form
  }
}
