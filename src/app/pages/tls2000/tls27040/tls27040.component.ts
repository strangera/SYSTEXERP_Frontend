import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
// Services for dropdowns
import { SalesStatusService } from '../../../service/basic/sales-status.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { CreditCardInputStatusService } from '../../../service/basic/credit-card-input-status.service';
import { InstallmentPeriodService } from '../../../service/basic/installment-period.service';
import { AcquiringBankService } from '../../../service/basic/acquiring-bank.service';
import { QueryFilterService } from '../../../service/basic/query-filter.service';
import { CreditCardTransactionTypeService } from '../../../service/basic/credit-card-transaction-type.service'; // Import for transaction type
import { CRUDStatus } from '../../../shared/enum/CRUDstatus'; // Add this import as requested

const now = new Date();

@Component({
  selector: 'app-tls27040',
  templateUrl: './tls27040.component.html',
  styleUrls: ['./tls27040.component.scss']
})
export class TLS27040Component {

  // 程式編號
  ProgNo: string = '220042';
  // 權限變數
  funInfo: FunsrightInfo = {};
  addPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.add,
  };
  queryPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.query,
  };
  editPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.edit,
  };

  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    cashierNumber: [],  // 收銀機號
    transactionNumber: [],  // 交易流水號
    counterNumber: [],  // 專櫃編號
    salesStatus: [],  // 銷售狀況
    cardType: [],  // 卡別
    amountStart: [, [this.validationService.numberValidator]],  // 金額開始
    amountEnd: [, [this.validationService.numberValidator]],  // 金額結束
    salesDateStart: [now],  // 銷售日期與時間開始
    salesDateEnd: [now],  // 銷售日期與時間結束
    cardNumber: [],  // 卡號
    edcNumber: [],  // EDC號碼
    billingDateStart: [now],  // 請款日期開始
    billingDateEnd: [now],  // 請款日期結束
    transactionType: [],  // 交易類別
    inputStatus: [],  // 輸入狀態
    authorizationCode: [],  // 授權碼
    installmentPeriod: [],  // 分期期數
    acquiringBank: [],  // 收單銀行
    queryFilter: []  // 查詢篩選
  });

  // 表格資料
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'cashRegisterCode', header: '收銀機代碼', visible: true },
    { field: 'transactionFlowCode', header: '交易流水號', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'cardType', header: '卡別', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'saleDate', header: '銷售日期', visible: true },
    { field: 'saleTime', header: '銷售時間', visible: true },
    { field: 'requestDate', header: '請款日期', visible: true },
    { field: 'cardNumber', header: '卡號', visible: true },
    { field: 'invoiceNumber', header: '發票號碼', visible: true },
    { field: 'edcCode', header: 'EDC號碼', visible: true },
    { field: 'approvalCode', header: '授權碼', visible: true },
    { field: 'saleStatus', header: '銷售狀況', visible: true },
    { field: 'transactionType', header: '交易類別', visible: true },
    { field: 'inputStatus', header: '輸入狀態', visible: true },
    { field: 'installmentCount', header: '分期期數', visible: true },
    { field: 'bank', header: '收單行', visible: true },
    { field: 'requestSource', header: '請款來源', visible: true },
    { field: 'creator', header: '建立者', visible: true },
    { field: 'creationDate', header: '建立日期', visible: true },
    { field: 'modifier', header: '修改者', visible: true },
    { field: 'modificationDate', header: '修改日期', visible: true },
  ];


  // 下拉選單選項
  salesStatusOptions: any[] = [];
  cardTypeOptions: any[] = [];
  inputStatusOptions: any[] = [];
  installmentPeriodOptions: any[] = [];
  acquiringBankOptions: any[] = [];
  queryFilterOptions: any[] = [];
  transactionTypeOptions: any[] = []; // For transaction type

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private salesStatusService: SalesStatusService,
    private cardTypeService: CardTypeService,
    private creditCardInputStatusService: CreditCardInputStatusService,
    private installmentPeriodService: InstallmentPeriodService,
    private acquiringBankService: AcquiringBankService,
    private queryFilterService: QueryFilterService,
    private creditCardTransactionTypeService: CreditCardTransactionTypeService // Inject service for transaction type
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // Initialize dropdown options
    this.salesStatusService.getSalesStatus().subscribe(data => {
      this.salesStatusOptions = data;
    });
    this.cardTypeService.getCardType().subscribe(data => {
      this.cardTypeOptions = data;
    });
    this.creditCardInputStatusService.getCreditCardInputStatuses().subscribe(data => {
      this.inputStatusOptions = data;
    });
    this.installmentPeriodService.getInstallmentPeriods().subscribe(data => {
      this.installmentPeriodOptions = data;
    });
    this.acquiringBankService.getAcquiringBanks().subscribe(data => {
      this.acquiringBankOptions = data;
    });
    this.queryFilterService.getQueryFilters().subscribe(data => {
      this.queryFilterOptions = data;
    });
    this.creditCardTransactionTypeService.getCreditCardTransactionTypes().subscribe(data => {
      this.transactionTypeOptions = data;
    });
  }

  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }

  canAdd(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  }

  canEdit(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm
        },
        skipLocationChange: true
      };
      this.router.navigate(['TLS2000/TLS27040CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm
        },
        skipLocationChange: true
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm
      },
      skipLocationChange: true
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
