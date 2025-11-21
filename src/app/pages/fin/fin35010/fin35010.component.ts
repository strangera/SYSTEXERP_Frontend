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
  selector: 'app-fin35010',
  templateUrl: './fin35010.component.html',
  styleUrl: './fin35010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberRangeComponent,
    DropdownComponent,
    InputTextComponent,
    CalendarRangeComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class FIN35010Component extends BasicQpageComponent implements OnInit {
  // Form group controls matching the HTML
  queryForm = this.formBuilder.group({
    depositSerialNumberStart: [], // 保證金序號
    depositSerialNumberEnd: [],

    vendorCode: [], // 廠商編號
    counterCode: [], // 專櫃編號
    documentType: [], // 單據別
    amountStart: [], // 金額
    amountEnd: [],

    receiptDateStart: [], // 收款日期
    receiptDateEnd: [],

    depositDueDateStart: [], // 保證金到期日
    depositDueDateEnd: [],

    checkNumber: [], // 支票號碼
    financialInstitution: [], // 金融機構
    summary: [], // 摘要

    status: [], // 狀態
    statusChangeDateStart: [], // 狀態變更日期
    statusChangeDateEnd: [],

    debitAccount: [], // 收款會計科目(借)
    creditAccount: [], // 保證金會計科目(貸)

    voucherNumberStart: [], // 傳票編號
    voucherNumberEnd: [],

    clearingCode: [], // 立沖代號
    sourceSystem: [], // 來源系統別
    recruitmentNumberStart: [], // 專櫃招募編號
    recruitmentNumberEnd: [],

    depositType: [], // 保證金類型
    organizationCode: [], // 組織代號
    targetCode: [], // 對象別編號
    reconciliationKey: [], // 對帳KEY值
  });

  // Dropdown options
  vendorCodeOptions: any[] = [
    { value: 1, label: '00000000-1' },
    { value: 2, label: '00000000-2' },
    { value: 3, label: '00000000-3' },
    { value: 4, label: '00000000-4' },
    { value: 5, label: '00000000-5' },
    { value: 6, label: '00000000-7' },
    { value: 7, label: '00000000-8' },
    { value: 8, label: '00852492-1' },
    { value: 9, label: '01052878-1' },
    { value: 10, label: '01508949-1' },
  ];
  documentTypeOptions: any[] = [
    { value: 1, label: '現金' },
    { value: 2, label: '支票' },
    { value: 3, label: '商業本票' },
  ];
  financialInstitutionOptions: any[] = [
    { value: 1, label: '000000' },
    { value: 2, label: '000022' },
    { value: 3, label: '0040037' },
    { value: 4, label: '0040059' },
    { value: 5, label: '0040071' },
    { value: 6, label: '0040082' },
    { value: 7, label: '0040093' },
    { value: 8, label: '0040107' },
    { value: 9, label: '0040118' },
    { value: 10, label: '0040129' },
  ];
  statusOptions: any[] = [
    { value: 1, label: '建立' },
    { value: 2, label: '已退還' },
    { value: 3, label: '收款挪轉' },
  ];
  depositTypeOptions: any[] = [
    { value: 1, label: '押金' },
    { value: 2, label: '履約保證金' },
    { value: 3, label: '施工保證金' },
  ];
  organizationCodeOptions: any[] = [
    { value: 1, label: '全公司' },
    { value: 2, label: '稽核室' },
    { value: 3, label: '經營企劃部(停用)' },
    { value: 4, label: '行政Team(停用)' },
    { value: 5, label: '公關Team(停用)' },
    { value: 6, label: '營企Team(停用)' },
    { value: 7, label: '電子商務team(停用)' },
    { value: 8, label: '外商Team(停用)' },
    { value: 9, label: '個資小組' },
    { value: 10, label: '品牌代理小組(停用)' },
  ];
  targetCodeOptions: any[] = [
    { value: 1, label: '臺南紡織股份有限公司' },
    { value: 2, label: '統一企業股份有限公司' },
    { value: 3, label: '統正開發股份有限公司' },
  ];

  // Table data
  data: any[] = [];

  filteredData: any[] = [...this.data];

  columns: any[] = [
    { field: 'guaranteeSequenceNumber', header: '保證金序號', visible: true },
    { field: 'vendorCode', header: '廠商編號', visible: true },
    { field: 'dedicatedAccountNumber', header: '專戶編號', visible: true },
    { field: 'transactionType', header: '單據別', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'receiptDate', header: '收款日期', visible: true },
    { field: 'guaranteeDueDate', header: '保證金到期日', visible: true },
    { field: 'voucherNumber', header: '支票號碼', visible: true },
    { field: 'financialInstitution', header: '金融機構', visible: true },
    { field: 'ticketDueDate', header: '票據到期日', visible: true },
    { field: 'summary', header: '摘要', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'statusChangeDate', header: '狀態變更日期', visible: true },
    {
      field: 'receiptAccountingSubjectDebit',
      header: '收款會計科目(借)',
      visible: true,
    },
    {
      field: 'guaranteeAccountingSubjectCredit',
      header: '保證金會計科目(貸)',
      visible: true,
    },
    { field: 'clearingCode', header: '立沖代號', visible: true },
    { field: 'sourceSystem', header: '來源系統別', visible: true },
    {
      field: 'dedicatedRecruitmentNumber',
      header: '專戶招募編號',
      visible: true,
    },
    { field: 'guaranteeCategory', header: '保證金類型', visible: true },
    { field: 'organizationCode', header: '組織代號', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private messageService: NotificationService,
  ) {
    super(); // Call parent constructor
  }

  ngOnInit(): void {
    this.ProgNo = '130011';

    // Initialize dropdown options

    // Load dropdown options for various fields
  }
  onNext(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      this.router.navigate(['/SYS0000/SYS0220CRU']);
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitNext(frm: FormGroup) {
    // 查詢邏輯
    this.onNext(frm);
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
      this.router.navigate(['FIN3000/FIN35010CRU'], extras);
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
