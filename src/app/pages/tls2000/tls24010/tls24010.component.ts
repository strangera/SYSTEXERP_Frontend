import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { SupplementCategoryService } from '../../../service/basic/supplement-category.service';
import { FloorService } from '../../../service/basic/floor.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

// 交易補登作業
@Component({
  selector: 'app-tls24010',
  templateUrl: './tls24010.component.html',
  styleUrls: ['./tls24010.component.scss']
})
export class TLS24010Component implements OnInit {
  ProgNo: string = '220024';

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


  // 下拉選單選項
  supplementCategoryOptions: any[] = [];
  cashierOptions: any[] = [];
  counterCodeOptions: any[] = [];
  invoiceCarrierTypeOptions: any[] = [];  // 電子發票載具種類選項

  // 表格資料
  data: any[] = [];
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
    { field: 'remark', header: '備註', visible: true }
  ];
  // 初始化表單
  queryForm = this.formBuilder.group({
    supplementCategory: [, [Validators.required]],  // 補登類別
    saleDateStart: [, [Validators.required]],  // 銷售日期起
    saleDateEnd: [, [Validators.required]],  // 銷售日期迄
    cashierCode: [],  // 收銀機號
    counterCode: [, [Validators.required]],  // 專櫃編號
    transactionSerial: [],  // 交易序號
    invoiceCarrierType: [],  // 電子發票載具種類
    visitorCount: [],  // 來客數
    cashierNumber: [88888888]  // 收銀員編號
  });
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private supplementCategoryService: SupplementCategoryService,
    private floorService: FloorService,  // 收銀機號
    private counterCodeService: CounterCodeService,  // 專櫃編號
  ) {

  }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 取得下拉選單選項
    this.supplementCategoryService.getSupplementCategories().subscribe((data) => {
      this.supplementCategoryOptions = data;
    });

    this.floorService.getFloors().subscribe((data) => {
      this.cashierOptions = data;
    });

    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterCodeOptions = data;
    });

    // 假設有一個服務獲取電子發票載具種類選項
    this.getInvoiceCarrierTypeOptions();
  }

  getInvoiceCarrierTypeOptions(): void {
    // 假設有一個服務來獲取電子發票載具種類選項
    this.invoiceCarrierTypeOptions = [
      { label: '載具1', value: 1 },
      { label: '載具2', value: 2 },
      { label: '載具3', value: 3 }
    ];
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

  onSubmit(frm: FormGroup): void {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 查詢邏輯
      console.log(frm.value);
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.queryForm.reset();  // 重置表單
  }

  onCreate(): void {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm.value,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS24010CRU'], extras);
    }
  }

  onEdit(data: any): void {
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

  onDetail(data: any): void {
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
