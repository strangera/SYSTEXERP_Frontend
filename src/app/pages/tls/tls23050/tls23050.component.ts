import { FloorService } from './../../../service/basic/floor.service';
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
import { SystemTypeService } from '../../../service/basic/system-type.service';
import { TypeService } from '../../../service/basic/type.service';

const now = new Date();

@Component({
  selector: 'app-tls23050',
  templateUrl: './tls23050.component.html',
  styleUrl: './tls23050.component.scss'
})
export class TLS23050Component {

  ProgNo: string = '220014';
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
    saleDateStart: [, [Validators.required]], // 銷售日期起
    saleDateEnd: [, [Validators.required]], // 銷售日期迄
    type: [], // 類型
    cashierCode: [], // 收銀機代號
    Floor: [],

  });

  // 表格資料
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'cashRegisterNumber', header: '收銀機號', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'counterName', header: '專櫃名稱', visible: true },
    { field: 'totalAmount', header: '總金額', visible: true },
    { field: 'cash', header: '現金', visible: true },
    { field: 'combinedOrder', header: '聯合', visible: true },
    { field: 'combinedConnected', header: '聯合連線', visible: true },
    { field: 'combinedDisconnected', header: '聯合離線', visible: true },
    { field: 'combinedBonus', header: '聯合紅利', visible: true },
    { field: 'creditCard', header: '[信用卡]中信', visible: true },
    { field: 'creditCardConnected', header: '中信連線', visible: true },
    { field: 'creditCardDisconnected', header: '中信離線', visible: true },
    { field: 'creditCardBonus', header: '中信紅利', visible: true },
    { field: 'oneCard', header: '[一卡通]停車場', visible: true },
    { field: 'oneCardConnected', header: '一卡通連線', visible: true },
    { field: 'voucher', header: '停車券', visible: true },
    { field: 'productCollectionCart', header: '商品提集車', visible: true },
    { field: 'voucherExchange', header: '感熱紙抵用券', visible: true },
    { field: 'productVoucher', header: '商品抵用券', visible: true },
    { field: 'internalDeliveryVoucher', header: '實家提貨單(應收帳款)', visible: true },
    { field: 'externalVoucher', header: '外來禮券(抵用券)', visible: true },
    { field: 'externalDeliveryVoucher', header: '外來提貨單(抵用券)', visible: true },
    { field: 'selfOrganizedVoucher', header: '活動券(自營)', visible: true },
    { field: 'discountVoucher', header: '折價券', visible: true },
    { field: 'invoiceExchange', header: '換抵', visible: true },
    { field: 'voucherRemainingCard', header: '禮券餘額代卡', visible: true },
    { field: 'exchangeRemainingCard', header: '提貨單餘額代卡', visible: true },
    { field: 'memberDiscount', header: '會員折扣', visible: true },
    { field: 'linePay', header: 'LINE PAY', visible: true },
    { field: 'appVoucher', header: 'APP抵用券', visible: true },
    { field: 'appDelivery', header: 'APP提貨單', visible: true },
    { field: 'orderPrepay', header: '預售訂金', visible: true },
    { field: 'orderCollectBalance', header: '預售實收結帳', visible: true },
    { field: 'profitAccount', header: '溢收帳', visible: true },
    { field: 'return', header: '退貨', visible: true },
    { field: 'exchangeProcessing', header: '換貨作廢', visible: true }
  ];


  systemTypeOptions: any[] = [];
  typeOptions: any[] = [];
  FloorOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,

    private systemTypeService: SystemTypeService,
    private typeService: TypeService,
    private FloorService: FloorService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.systemTypeService.getSystemTypes().subscribe(data => {
      this.systemTypeOptions = data;
    });
    this.typeService.getTypeOptions().subscribe(data => {
      this.typeOptions = data;
    });
    this.FloorService.getFloors().subscribe(data => {
      this.FloorOptions = data;
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
