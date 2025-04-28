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
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';
import { AccountingPeriodService } from '../../../service/basic/accounting-period.service';
import { WhetherService } from '../../../service/basic/whether.service';

@Component({
  selector: 'app-tls21030-cru',
  templateUrl: './tls21030-cru.component.html',
  styleUrl: './tls21030-cru.component.scss'
})
export class TLS21030CRUComponent {

  ProgNo: string = '220003';
  // 權限
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
  dataForm = this.formBuilder.group({
    settlementMethod: [1, Validators.required],       // 結帳方式
    accountingPeriod: [1, Validators.required],       // 帳次
    useOwnerInvoice: [1, Validators.required],        // 是否使用業主發票
    description1: [],           // 說明1
    description2: [],           // 說明2
    description3: [],           // 說明3
  });



  // 下拉選單選項
  settlementMethodOptions: any[] = [];
  accountingPeriodOptions: any[] = [];
  useOwnerInvoiceOptions: any[] = [];
  formTitle: string = '';
  showConfirm: boolean = false;
  crudstatus: CRUDStatus = CRUDStatus.Read;
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
    this.dataForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.dataForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS21030'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.dataForm,
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
        queryform: this.dataForm,
      },
      skipLocationChange: true,
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
  onCancel() {
    this.router.navigate(['TLS2000/TLS21030']);
  }
}
