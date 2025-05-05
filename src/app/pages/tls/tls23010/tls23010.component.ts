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
import { TransactionTypeService } from '../../../service/basic/transaction-type.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TransactionSubTypeService } from '../../../service/basic/transaction-sub-type.service';
import { CarrierTypeService } from '../../../service/basic/carrier-type.service';

const now = new Date();

@Component({
  selector: 'app-tls23010',
  templateUrl: './tls23010.component.html',
  styleUrl: './tls23010.component.scss'
})
export class TLS23010Component {
  ProgNo: string = '220010';

  // 權限
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
  queryForm = this.formBuilder.group({
    saleDate: [now, [Validators.required]], // 銷售日期*
    cashierCode: [], // 收銀機代號
    transactionSerialStart: [, [this.validationService.numberValidator]], // 交易序號(起)
    transactionSerialEnd: [, [this.validationService.numberValidator]], // 交易序號(迄)
    counterCode: [], // 專櫃編號
    invoiceStart: [], // 發票起始號碼
    invoiceEnd: [], // 發票結束號碼
    transactionType: [], // 交易型態
    statusFlag: [], // 狀態旗標
    transactionSubType: [], // 交易附屬型態
    cashierId: [], // 收銀員編號
    presaleCode: [], // 預售/訂金編號
    parkingCardNumber: [], // 停車卡號
    membershipNumber: [], // 會員卡號
    unifiedBusinessNumber: [], // 統一編號
    limitRecords: [], // 限制筆數
    loveCode: [], // 愛心碼
    carrierType: [], // 載具種類
    carrierNumber: [], // 載具號碼
    issueOwnerInvoice: [], // 是否開立業主發票
    ownerCollectCash: [], // 是否為業主收現
    displayRecordsPerPage: [], // 每頁顯示筆數
    limitnumber: [],//限制筆數
    checkTotalAmount: [],
  });

  // 表格資料
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'machineNumber', header: '機號', visible: true },
    { field: 'transactionSequence', header: '交易序號', visible: true },
    { field: 'terminalCode', header: '專櫃編號/名稱', visible: true },
    { field: 'uniformNumber', header: '統一編號', visible: true },
    { field: 'character', header: '字軌', visible: true },
    { field: 'invoiceStartNumber', header: '發票起號', visible: true },
    { field: 'invoiceEndNumber', header: '發票迄號', visible: true },
    { field: 'invoiceAmount', header: '發票金額', visible: true },
    { field: 'incomeAmount', header: '溢收金額', visible: true },
    { field: 'statusFlag', header: '狀態旗標', visible: true },
    { field: 'transactionStatus', header: '交易型態', visible: true },
    { field: 'affiliationStatus', header: '附屬型態', visible: true },
    { field: 'orderAmount', header: '訂金實收', visible: true },
    { field: 'foreignOfficer', header: '外交官免稅卡號', visible: true },
    { field: 'startTime', header: '起始時間', visible: true },
    { field: 'endTime', header: '結束時間', visible: true },
    { field: 'cashier', header: '收銀員', visible: true },
    { field: 'preSalesAmount', header: '預售/訂金編號', visible: true },
    { field: 'originalTransactionDate', header: '原交易日期', visible: true },
    { field: 'originalCashierNumber', header: '原收銀機代號', visible: true },
    { field: 'originalTransactionSequence', header: '原交易序號', visible: true },
    { field: 'originalCashierCode', header: '原交易序號', visible: true },
    { field: 'parkingCardNumber', header: '停車卡號', visible: true },
    { field: 'memberCardNumber', header: '會員卡號', visible: true },
    { field: 'discountAmount', header: '折扣讓金額', visible: true },
    { field: 'invoicePrintStatus', header: '銷貨清單列印狀態', visible: true },
    { field: 'donationStatus', header: '捐贈狀態', visible: true },
    { field: 'donationWelfareCode', header: '捐贈社福團體代碼', visible: true },
    { field: 'antiCounterfeitDeviceCode', header: '防偽隨機碼', visible: true },
    { field: 'sharedCarrierCode', header: '載具種類', visible: true },
    { field: 'sharedCarrierCode', header: '共通性載具號碼', visible: true },
    { field: 'eInvoiceSerial', header: '電子發票是否列印', visible: true },

  ];

  transactionTypeOptions: any[] = [];
  statusFlagOptions: any[] = [];
  whetherOptions: any[] = [];
  transactionSubTypeOptions: any[] = [];
  carrierTypeOptions: any[] = [];
  checkTotalAmount: any[] = [{ value: 1, label: '是' },
  { value: 2, label: '否' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private transactionTypeService: TransactionTypeService,
    private statusFlagService: StatusFlagService,
    private whetherService: WhetherService,
    private transactionSubTypeService: TransactionSubTypeService,
    private carrierTypeService: CarrierTypeService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.transactionTypeService.getTransactionTypes().subscribe(data => {
      this.transactionTypeOptions = data;
    });

    this.statusFlagService.getStatusFlags().subscribe(data => {
      this.statusFlagOptions = data;
    });
    this.whetherService.getWhetherOptions().subscribe((data) => {
      this.whetherOptions = data;
    });
    this.transactionSubTypeService.getTransactionSubType().subscribe((data) => {
      this.transactionSubTypeOptions = data;
    });
    this.carrierTypeService.getCarrierType().subscribe((data) => {
      this.carrierTypeOptions = data;
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
