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
  selector: 'app-tls27040-cru',
  templateUrl: './tls27040-cru.component.html',
  styleUrl: './tls27040-cru.component.scss'
})
export class TLS27040CRUComponent {

  // 程式編號
  ProgNo: string = '220042';
  // 權限變數
  funInfo?: FunsrightInfo;
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
  dataForm = this.formBuilder.group({
    cashRegisterNumber: [, Validators.required],  // 收銀機號
    transactionSerialNumber: [, Validators.required],  // 交易流水號
    counterID: [, Validators.required],  // 專櫃編號
    salesCondition: [, Validators.required],  // 銷售狀況
    cardCategory: [, Validators.required],  // 卡別
    amount: [, Validators.required],  // 金額
    salesDateStart: [now],  // 銷售日期與時間開始
    salesDateEnd: [now],  // 銷售日期與時間結束
    cardID: [],  // 卡號
    edcID: [],  // EDC號碼
    postingDate: [now, Validators.required],  // 入帳日期
    billingDate: [now, Validators.required],  // 請款日期
    transactionCategory: [],  // 交易類別
    entryStatus: [1, Validators.required],  // 輸入狀態
    authorizationCode: [],  // 授權碼
    installmentPeriodCount: [],  // 分期期數
    acquirerBank: [1, Validators.required],  // 收單銀行
    queryFilter: [],  // 查詢篩選
    transactionTime: [now, Validators.required],  // 時間
  });

  // 表格資料
  data: any[] = [
    { name: 'John', age: 25, email: 'john@example.com' },
    { name: 'Jane', age: 30, email: 'jane@example.com' }
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: 'email', header: 'Email', visible: true }
  ];

  // 下拉選單選項
  salesConditionOptions: any[] = [];
  cardCategoryOptions: any[] = [];
  entryStatusOptions: any[] = [];
  installmentPeriodCountOptions: any[] = [];
  acquirerBankOptions: any[] = [];
  queryFilterOptions: any[] = [];
  transactionCategoryOptions: any[] = []; // For transaction category
  formTitle: string = '';


  showConfirm: boolean = false;
  crudstatus: CRUDStatus = CRUDStatus.Read;

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
    private creditCardTransactionTypeService: CreditCardTransactionTypeService // Inject service for transaction category

  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // Initialize dropdown options
    this.salesStatusService.getSalesStatus().subscribe(data => {
      this.salesConditionOptions = data;
    });

    this.cardTypeService.getCardType().subscribe(data => {
      this.cardCategoryOptions = data;
    });
    this.creditCardInputStatusService.getCreditCardInputStatuses().subscribe(data => {
      this.entryStatusOptions = data;
    });
    this.installmentPeriodService.getInstallmentPeriods().subscribe(data => {
      this.installmentPeriodCountOptions = data;
    });
    this.acquiringBankService.getAcquiringBanks().subscribe(data => {
      this.acquirerBankOptions = data;
    });
    this.queryFilterService.getQueryFilters().subscribe(data => {
      this.queryFilterOptions = data;
    });
    this.creditCardTransactionTypeService.getCreditCardTransactionTypes().subscribe(data => {
      this.transactionCategoryOptions = data;
    });

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = '新增資料';
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        console.log(state.rowdata);
        this.formTitle = '編輯資料';
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = '顯示資料';
        this.Read(state.rowdata);
        break;
    }
  }

  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
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

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          dataForm: this.dataForm
        },
        skipLocationChange: true
      };
      this.router.navigate(['TLS2000/TLS27040'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          dataForm: this.dataForm
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
        dataForm: this.dataForm
      },
      skipLocationChange: true
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }

  get isFormEditable(): boolean {
    return (this.crudstatus === CRUDStatus.Create && this.canAdd()) || (this.crudstatus === CRUDStatus.Edit && this.canEdit());
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }

  onCancel() {
    this.router.navigate(['TLS2000/TLS21040']);
  }
}
