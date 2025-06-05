import { WhetherService } from './../../../service/basic/whether.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { DisplayService } from '../../../service/basic/display.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

@Component({
  selector: 'app-tls22030',
  templateUrl: './tls22030.component.html',
  styleUrls: ['./tls22030.component.scss'],
})
// 序號報表
export class TLS22030Component {
  ProgNo: string = '220008';
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
  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    saleStartDate: [, [Validators.required]], // 銷售開始日期
    saleEndDate: [, [Validators.required]], // 銷售結束日期
    cashRegisterCode: [], // 收銀機編號
    counterCode: [], // 專櫃編號
    listZeroDifference: [1, []], // 差異為0是否列出
    displayCondition: [1, []], // 顯示條件
  });

  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'transactionTotal', header: '總合', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'counterName', header: '專櫃名稱', visible: true },
    { field: 'date', header: '日期', visible: true },
    { field: 'backendTransactionCode', header: '後台交易電腦', visible: true },
    { field: 'backendTransactionDetails', header: '後台交易記錄', visible: true },
    { field: 'frontendTransactionCode', header: '前台清機電腦', visible: true },
    { field: 'frontendTransactionDetails', header: '前台清機記錄', visible: true },
    { field: 'invoiceStartNumber', header: '發票號碼(起)', visible: true },
    { field: 'invoiceEndNumber', header: '發票號碼(迄)', visible: true },
    { field: 'isSameDay', header: '當日是否欠發', visible: true },
    { field: 'isCrossDay', header: '跨日是否欠發', visible: true },
  ];


  listZeroDifferenceOptions: any[] = [];
  displayConditionOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private whetherService: WhetherService,
    private displayService: DisplayService
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.whetherService.getWhetherOptions().subscribe((data) => {
      this.listZeroDifferenceOptions = data;
    });

    this.displayService.getDisplay().subscribe((data) => {
      this.displayConditionOptions = data;
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
