import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { TransactionMachineService } from '../../../service/basic/transaction-machine.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';


const now = new Date();

@Component({
  selector: 'app-tls23140',
  templateUrl: './tls23140.component.html',
  styleUrls: ['./tls23140.component.scss']
})
export class TLS23140Component {

  ProgNo: string = '220023';

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
    transactionDateStart: [, [Validators.required]], // 交易日期起
    transactionDateEnd: [, [Validators.required]],   // 交易日期迄
    transactionMachine: [],  // 交易機號
    counterNumber: [],  // 專櫃編號
    voucherAmount: [],  // 單筆交易中有價卷總金額達N萬
    transactionSerialNumber: [],  // 交易序號
  });

  // 表格資料
  data: any[] = [
  
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'transactionDate', header: '交易日期', visible: true },
    { field: 'transactionMachineNumber', header: '交易機號', visible: true },
    { field: 'franchiseNumber', header: '專櫃編號', visible: true },
    { field: 'franchiseName', header: '專櫃名稱', visible: true },
    { field: 'recruitmentNumber', header: '招募編號', visible: true },
    { field: 'transactionSerialNumber', header: '交易序號', visible: true },
    { field: 'voucherAmount', header: '有價卷金額', visible: true }
  ];

  // 交易機號下拉選單選項
  transactionMachineOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private transactionMachineService: TransactionMachineService, // 交易機號 service
  ) {}

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.transactionMachineService.getTransactionMachines().subscribe(data => {
      this.transactionMachineOptions = data;
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
