import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
import { AnalysisdateCService } from './../../../service/basic/analysisdate-c.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-fin35060',
  templateUrl: './fin35060.component.html',
  styleUrl: './fin35060.component.scss',
})
export class FIN35060Component extends BasicQpageComponent implements OnInit {
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
    { field: 'receiptDate', header: '付款日期', visible: true },
    { field: 'guaranteeDueDate', header: '保證金到期日', visible: true },
    { field: 'voucherNumber', header: '支票號碼', visible: true },
    { field: 'financialInstitution', header: '金融機構', visible: true },
    { field: 'ticketDueDate', header: '票據到期日', visible: true },
    { field: 'summary', header: '摘要', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'statusChangeDate', header: '狀態變更日期', visible: true },
    {
      field: 'receiptAccountingSubjectDebit',
      header: '付款會計科目(貸)',
      visible: true,
    },
    {
      field: 'guaranteeAccountingSubjectCredit',
      header: '保證金會計科目(借)',
      visible: true,
    },
    { field: 'clearingCode', header: '立沖代號', visible: true },
    { field: 'sourceSystem', header: '來源系統別', visible: true },
    {
      field: 'dedicatedRecruitmentNumber',
      header: '專櫃招募編號',
      visible: true,
    },
    { field: 'organizationCode', header: '組織代號', visible: true },
    { field: 'guaranteeCategory', header: '保證金類型', visible: true },

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
    this.ProgNo = '130016';

    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // Load dropdown options for various fields
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
      this.router.navigate(['FIN3000/FIN35060CRU'], extras);
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
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
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
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }

  onClearForm() {
    this.queryForm.reset(); // Reset form
  }
}
