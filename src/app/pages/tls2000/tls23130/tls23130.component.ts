import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { BankService } from '../../../service/basic/bank.service'; // 卡種 service
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

@Component({
  selector: 'app-tls23130',
  templateUrl: './tls23130.component.html',
  styleUrls: ['./tls23130.component.scss']
})
export class TLS23130Component {

  ProgNo: string = '220022';

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
    saleDateStart: [{ value: '', disabled: true }, [Validators.required]], // 查詢日期起
    saleDateEnd: [{ value: '', disabled: true }, [Validators.required]],   // 查詢日期迄
    saleMonthYear: [{ value: '', disabled: true }], // 銷售年/月
    bankType: [],  // 卡種
    dateRadio: ['']  // 日期選擇單選
  });

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'cardNumber', header: '卡號', visible: true },
    { field: 'transactionSequence', header: '交易序號', visible: true },
    { field: 'machineNumber', header: '機號/名稱', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'date', header: '日期', visible: true },
    { field: 'installmentPeriod', header: '分期數', visible: true },
    { field: 'initialPayment', header: '頭期', visible: true },
    { field: 'monthlyPayment', header: '每期', visible: true },
  ];

  // 卡種選項
  bankOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private bankService: BankService, // 卡種 service
  ) {}

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.bankService.getBanks().subscribe(data => {
      this.bankOptions = data;
    });

    // Handle enabling/disabling fields based on radio selection
    this.queryForm.controls.dateRadio.valueChanges.subscribe(value => {
      // Reset and disable all date fields initially
      this.queryForm.controls.saleDateStart.disable();
      this.queryForm.controls.saleDateEnd.disable();
      this.queryForm.controls.saleMonthYear.disable();

      // Enable the selected fields based on the radio button
      if (value === 'saleDate') {
        this.queryForm.controls.saleDateStart.enable();
        this.queryForm.controls.saleDateEnd.enable();
      } else if (value === 'saleMonthYear') {
        this.queryForm.controls.saleMonthYear.enable();
      }
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
          queryform: this.queryForm.value,
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
          queryform: this.queryForm.value,
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
        queryform: this.queryForm.value,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
