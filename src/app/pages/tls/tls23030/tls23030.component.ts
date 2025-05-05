import { WhetherService } from './../../../service/basic/whether.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { SystemTypeService } from '../../../service/basic/system-type.service';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { PaymentTypeService } from '../../../service/basic/payment-type.service';
import { TransactionTypeService } from '../../../service/basic/transaction-type.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { TicketStatusService } from '../../../service/basic/ticket-status-service.service';
import { DisplayModeService } from '../../../service/basic/display-mode.service';

const now = new Date();

@Component({
  selector: 'app-tls23030',
  templateUrl: './tls23030.component.html',
  styleUrl: './tls23030.component.scss'
})
export class TLS23030Component {
  ProgNo: string = '220012';

  // 权限
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

  // 查询表单
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    saleDateStart: [now, [Validators.required]], // 銷售日期 起
    saleDateEnd: [now, [Validators.required]], // 銷售日期 迄
    cashierCode: [], // 收銀機代號
    transactionSerialStart: [, [this.validationService.numberValidator]], // 交易序號(起)
    transactionSerialEnd: [, [this.validationService.numberValidator]], // 交易序號(迄)
    counterCode: [], // 專櫃編號
    paymentType: [], // 付款別
    amountStart: [], // 金額 起
    amountEnd: [], // 金額 迄
    transactionType: [], // 交易型態
    membershipNumber: [], // 會員卡號
    creditCardType: [], // 信用卡別
    creditCardNumber: [], // 信用卡卡號
    installment: [], // 是否分期
    voucherStatus: [], // 券類(己開/未開)
    organizationCode: [], // 組識編號
    batchVoucherSearch: [], // 是否查詢券類大批
    issueOwnerInvoice: [], // 是否開立業主發票
    ownerCollectCash: [], // 是否為業主收現
    recordsPerPage: [], // 每頁顯示筆數
    limitnumber: [, Validators.required],//限制筆數
    displayMode: [], // 顯示方式
  });

  // 表格数据
  data: any[] = [

    // 其他数据
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'cashierNumber', header: '收銀機代號', visible: true },
    { field: 'transactionSequence', header: '交易序號', visible: true },
    { field: 'franchiseNumber', header: '專櫃編號', visible: true },
    { field: 'transactionType', header: '交易型態', visible: true },
    { field: 'paymentType', header: '付款別', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'taxAmount', header: '備抵稅額', visible: true },
    { field: 'creditCardType', header: '信用卡類別', visible: true },
    { field: 'creditCardNumber', header: '信用卡卡號/條碼', visible: true },
    { field: 'isInstallment', header: '是否分期', visible: true },
    { field: 'memberCardNumber', header: '會員卡號', visible: true },
    { field: 'organizationNumber', header: '組織編號', visible: true }
  ];

  systemTypeOptions: any[] = [];
  paymentTypeOptions: any[] = [];
  transactionTypeOptions: any[] = [];
  cardTypeOptions: any[] = [];
  WhetherOptions: any[] = [];
  ticketStatusOptions: any[] = [];
  displayModeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private systemTypeService: SystemTypeService,
    private paymentTypeService: PaymentTypeService,
    private transactionTypeService: TransactionTypeService,
    private cardTypeService: CardTypeService,
    private whetherService: WhetherService,
    private ticketStatusService: TicketStatusService,
    private displayModeService: DisplayModeService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.systemTypeService.getSystemTypes().subscribe(data => {
      this.systemTypeOptions = data;
    });
    this.displayModeService.getDisplayModes().subscribe((data) => (this.displayModeOptions = data));
    this.paymentTypeService.getPaymentTypes().subscribe(data => {
      this.paymentTypeOptions = data;
    });
    this.transactionTypeService.getTransactionTypes().subscribe(data => {
      this.transactionTypeOptions = data;
    });
    this.cardTypeService.getCardType().subscribe(data => {
      this.cardTypeOptions = data;
    });
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.WhetherOptions = data;
    });
    this.ticketStatusService.getTicketStatuses().subscribe(data => {
      this.ticketStatusOptions = data;
    });
  }

  canQuery(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.query) as boolean;
  }

  canAdd(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.add) as boolean;
  }

  canEdit(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.edit) as boolean;
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交逻辑
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
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
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
}
