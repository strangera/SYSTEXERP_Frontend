

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { SupplementCategoryService } from '../../../service/basic/supplement-category.service';
import { FloorService } from '../../../service/basic/floor.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';


const now = new Date();

@Component({
  selector: 'app-tls24010-mod',
  templateUrl: './tls24010-mod.component.html',
  styleUrl: './tls24010-mod.component.scss'
})
export class TLS24010ModComponent {
  ProgNo: string = '220024';

  // 權限變數
  funInfo?: FunsrightInfo;




  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    supplementCategory: [],  // 補登類別
    saleDateStart: [, [Validators.required]], // 銷售日期起
    saleDateEnd: [, [Validators.required]],   // 銷售日期迄
    cashierCode: [],  // 收銀機號
    counterCode: [],  // 專櫃編號
    transactionSerial: [],  // 交易序號
  });

  // 下拉選單選項
  supplementCategoryOptions: any[] = [];
  cashierOptions: any[] = [];
  counterCodeOptions: any[] = [];

  // 表格資料
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'cashRegisterStatus', header: '收銀機代號', visible: true },
    { field: 'transactionFlow', header: '交易流水號', visible: true },
    { field: 'invoiceNumber', header: '發票號碼', visible: true },
    { field: 'invoiceStatus', header: '發票狀態', visible: true },
    { field: 'counterName', header: '專櫃編號/名稱', visible: true },
    { field: 'transactionType', header: '交易型態', visible: true },
    { field: 'salesTotal', header: '銷售總額', visible: true },
    { field: 'invoiceAmount', header: '發票金額/已開發票金額', visible: true },
    { field: 'profitAmount', header: '溢收金額', visible: true },
    { field: 'transactionCount', header: '交易筆數/銷售單數', visible: true },
    { field: 'repairer', header: '補登者', visible: true },
    { field: 'repairDate', header: '補登日期', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private supplementCategoryService: SupplementCategoryService,
    private floorService: FloorService,  // 收銀機號
    private counterCodeService: CounterCodeService,  // 專櫃編號
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.supplementCategoryService.getSupplementCategories().subscribe((data) => {
      this.supplementCategoryOptions = data;
    });

    this.floorService.getFloors().subscribe((data) => {
      this.cashierOptions = data;
    });

    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterCodeOptions = data;
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
