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
  selector: 'app-fin63020',
  templateUrl: './fin63020.component.html',
  styleUrls: ['./fin63020.component.scss'],
})
export class FIN63020Component extends BasicQpageComponent implements OnInit {
  // Form group controls matching the HTML
  queryForm = this.formBuilder.group({
    billNumber: [], // 票據號碼
    vendorCode: [], // 廠客代號
    bankAccountCode: [], // 公司銀行科目代號
    issueDateStart: [], // 開票日
    issueDateEnd: [],
    dueDateStart: [], // 到期日
    dueDateEnd: [],
    cashDateStart: [], // 兌現日
    cashDateEnd: [],
    amountStart: [], // 票面金額
    amountEnd: [],
    billTitle: [], // 票據抬頭
    endorsementProhibited: [], // 票據禁止背書轉讓
    remarks: [], // 備註
    organizationCode: [], // 組織代號
    eventCode: [], // 活動代號
    billStatus: [], // 票據狀態
    status: [], // 狀態
    collectionStatus: [], // 領取狀態
    collectionDateStart: [], // 領取日期
    collectionDateEnd: [],
    paymentBillNumber: [], // 應付票據開票單號
    paymentAccount: [], // 應付票據會計科目
    voucherNumber: [], // 傳票號碼
    targetCode: [], // 對象別編號
    reconciliationKey: [] // 對帳KEY值
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
    { value: 3, label: '110303' }
  ];
  endorsementProhibitedOptions: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' }
  ];
  organizationCodeOptions: any[] = [
    { value: 1, label: '全公司' },
    { value: 2, label: '稽核室' },
    { value: 3, label: '經營企劃部' }
  ];
  eventCodeOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
    { value: 3, label: '003' },
  ];
  billStatusOptions: any[] = [
    { value: 1, label: '作廢' },
    { value: 2, label: '未異動' },
    { value: 3, label: '到期' },
  ];
  statusOptions: any[] = [
    { value: 1, label: '確定' },
    { value: 2, label: '拋轉' }
  ];
  collectionStatusOptions: any[] = [
    { value: 1, label: '已領' },
    { value: 2, label: '未領' },
    { value: 2, label: '郵寄' }
  ];
  targetCodeOptions: any[] = [
    { value: 1, label: '臺南紡織股份有限公司' },
    { value: 2, label: '統一企業股份有限公司' }
  ];

  // Table data
  data: any[] = [];

  filteredData: any[] = [...this.data];

  columns: any[] = [
    { field: 'billNumber', header: '票據號碼', visible: true },
    { field: 'customerCode', header: '顧客代號', visible: true },
    { field: 'companyBankAccountingSubjectCode', header: '公司銀行科目代號', visible: true },
    { field: 'issueDate', header: '開票日', visible: true },
    { field: 'dueDate', header: '到期日', visible: true },
    { field: 'cashDate', header: '兌現日', visible: true },
    { field: 'billAmount', header: '票面金額', visible: true },
    { field: 'billEndorsement', header: '票據抬頭', visible: true },
    { field: 'notes', header: '備註', visible: true },
    { field: 'organizationCode', header: '組織代號', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'billStatus', header: '票據狀態', visible: true },
    { field: 'collectionStatus', header: '領取狀態', visible: true },
    { field: 'collectionDate', header: '領取日期', visible: true },
    { field: 'voucherNumber', header: '傳票號碼', visible: true },
    { field: 'dueVoucherNumber', header: '到期傳票號碼', visible: true },
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
    this.ProgNo = '160009';

    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // Load dropdown options for various fields (already initialized above)
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
    this.router.navigate(['FIN6000/FIN63020CRU']);
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
      this.router.navigate(['FIN3000/FIN63020CRU'], extras);
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
