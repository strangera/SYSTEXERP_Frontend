import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
import { VoucherTypeService } from '../../../service/basic/voucher-type.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';
import { AccountingPeriodService } from '../../../service/basic/accounting-period.service';
import { WhetherService } from '../../../service/basic/whether.service';

@Component({
  selector: 'app-tls21030',
  templateUrl: './tls21030.component.html',
  styleUrls: ['./tls21030.component.scss'],
})
export class TLS21030Component {

  ProgNo: string = '220003';
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
    settlementMethod: [],       // 結帳方式
    accountingPeriod: [],       // 帳次
    useOwnerInvoice: [],        // 是否使用業主發票
    description1: [],           // 說明1
    description2: [],           // 說明2
    description3: [],           // 說明3
  });

  // 表格資料
  data: any[] = [

    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [

    { field: 'settlementMethod', header: '結帳方式', visible: true },
    { field: 'account', header: '帳次', visible: true },
    { field: 'useBizReceipt', header: '是否使用業主發票', visible: true },
    { field: 'remark1', header: '說明1', visible: true },
    { field: 'remark2', header: '說明2', visible: true },
    { field: 'remark3', header: '說明3', visible: true }
  ];


  // 下拉選單選項
  settlementMethodOptions: any[] = [];
  accountingPeriodOptions: any[] = [];
  useOwnerInvoiceOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private settlementMethodService: SettlementMethodService,
    private accountingPeriodService: AccountingPeriodService,
    private whetherService: WhetherService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 根據服務來加載下拉選單選項
    this.settlementMethodService.getSettlementMethods().subscribe((data) => {
      this.settlementMethodOptions = data;
    });
    this.accountingPeriodService.getLocalAccountingPeriods().subscribe((data) => {
      this.accountingPeriodOptions = data;
    });
    this.whetherService.getWhetherOptions().subscribe((data) => {
      this.useOwnerInvoiceOptions = data;
    });
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
    this.router.navigate(['TLS2000/TLS21030MOD']);
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
      this.router.navigate(['TLS2000/TLS21030CRU'], extras);
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
