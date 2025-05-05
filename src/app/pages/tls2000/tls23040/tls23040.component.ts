import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { SystemTypeService } from '../../../service/basic/system-type.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { TransactionSubTypeService } from '../../../service/basic/transaction-sub-type.service';
import { TransactionTypeService } from '../../../service/basic/transaction-type.service';

const now = new Date();

@Component({
  selector: 'app-tls23040',
  templateUrl: './tls23040.component.html',
  styleUrl: './tls23040.component.scss',
})
export class TLS23040Component {
  ProgNo: string = '220013';
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
    saleDateStart: [now, [Validators.required]], // 銷售日期起
    saleDateEnd: [now, [Validators.required]], // 銷售日期迄
    cashierCode: [], // 收銀機代號
    transactionSerialStart: [, [this.validationService.numberValidator]], // 交易序號(起)
    transactionSerialEnd: [, [this.validationService.numberValidator]], // 交易序號(迄)
    counterCode: [], // 專櫃編號
    transactionType: [], // 交易型態
    statusFlag: [], // 狀態旗標
    transactionSubType: [], // 交易附屬型態
    carNumber: [], // 車卡號
    limitRecords: [], // 限制筆數
    membershipNumber: [], // 會員卡號
    invoiceNumber: [], // 發票號碼
  });

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'saleDate', header: '銷售日期', visible: true },
    { field: 'cashRegisterStatus', header: '機號', visible: true },
    { field: 'transactionSequence', header: '交易序號', visible: true },
    { field: 'counterCode', header: '專櫃編號/名稱', visible: true },
    { field: 'operator', header: '字軌', visible: true },
    { field: 'invoiceNumber', header: '發票號碼', visible: true },
    { field: 'invoiceAmount', header: '發票金額', visible: true },
    { field: 'transactionType', header: '交易型態', visible: true },
    { field: 'statusFlag', header: '狀態旗標', visible: true },
    { field: 'subsidiaryType', header: '附屬型態', visible: true },
    { field: 'foreignCurrency', header: '外文字軌號碼', visible: true },
    { field: 'closingTime', header: '結束時間', visible: true },
    { field: 'cashier', header: '收銀員', visible: true },
    { field: 'parkingCard', header: '停車卡號', visible: true },
    { field: 'originalTransactionDate', header: '原交易日期', visible: true },
    { field: 'originalRegisterStatus', header: '原收銀機狀況', visible: true },
    {
      field: 'originalTransactionSequence',
      header: '原交易序號',
      visible: true,
    },
    { field: 'memberCard', header: '會員卡號', visible: true },
    { field: 'memberBonus', header: '會員積點折抵', visible: true },
  ];

  systemTypeOptions: any[] = [];
  statusFlagOptions: any[] = [];
  transactionSubTypeOptions: any[] = [];
  transactionTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private systemTypeService: SystemTypeService,
    private statusFlagService: StatusFlagService,
    private transactionSubTypeService: TransactionSubTypeService,
    private transactionTypeService: TransactionTypeService
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.systemTypeService.getSystemTypes().subscribe((data) => {
      this.systemTypeOptions = data;
    });
    this.statusFlagService.getStatusFlags().subscribe((data) => {
      this.statusFlagOptions = data;
    });
    this.transactionSubTypeService.getTransactionSubType().subscribe((data) => {
      this.transactionSubTypeOptions = data;
    });
    this.transactionTypeService.getTransactionTypes().subscribe((data) => {
      this.transactionTypeOptions = data;
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
    this.queryForm.reset(); // 重置表單
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
