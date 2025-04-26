import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

const now = new Date();

@Component({
  selector: 'app-tls23070',
  templateUrl: './tls23070.component.html',
  styleUrl: './tls23070.component.scss'
})
export class TLS23070Component {

  ProgNo: string = '220016';

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
  queryForm = this.formBuilder.group({
    saleMonthYear: [, [Validators.required]], // 銷售年/月*
    counterCode: [] // 專櫃編號
  });

  // 表格資料
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'specialCounterCode', header: '專櫃編號', visible: true },
    { field: 'saleDate', header: '銷售日期', visible: true },
    { field: 'cashRegister', header: '收銀機號', visible: true },
    { field: 'totalAmount', header: '總金額', visible: true },
    { field: 'cash', header: '現金', visible: true },
    { field: 'unionConnect', header: '聯合連線', visible: true },
    { field: 'unionDisconnect', header: '聯合離線', visible: true },
    { field: 'unionRedemption', header: '聯合紅利', visible: true },
    { field: 'creditCardParking', header: '[信用卡] 中信停車場', visible: true },
    { field: 'creditCardUnion', header: '中信連線', visible: true },
    { field: 'creditCardUnionDisconnected', header: '中信離線', visible: true },
    { field: 'creditCardUnionRedemption', header: '中信紅利', visible: true },
    { field: 'oneCardParking', header: '[一卡通] 停車場', visible: true },
    { field: 'oneCard', header: '一卡通', visible: true },
    { field: 'giftCertificate', header: '禮券', visible: true },
    { field: 'productDelivery', header: '商品提貨單', visible: true },
    { field: 'paperCoupon', header: '感熱紙抵用券', visible: true },
    { field: 'productCoupon', header: '商品抵用券', visible: true },
    { field: 'specialDelivery', header: '專櫃提貨單(應收帳款)', visible: true },
    { field: 'externalCoupon', header: '外來禮券(抵用券)', visible: true },
    { field: 'externalDelivery', header: '外來提貨單(抵用券)', visible: true },
    { field: 'eventCoupon', header: '活動券(自營)', visible: true },
    { field: 'discountCoupon', header: '折價券現抵', visible: true },
    { field: 'giftCardBalance', header: '禮券餘額代卡', visible: true },
    { field: 'deliveryBalance', header: '提貨單餘代卡', visible: true },
    { field: 'membershipDiscount', header: '會員折抵', visible: true },
    { field: 'linePayParking', header: '[LINE PAY] 停車場', visible: true },
    { field: 'linePay', header: 'LINE PAY', visible: true },
    { field: 'appCoupon', header: 'APP抵用券', visible: true },
    { field: 'appOrder', header: 'APP提貨單', visible: true },
    { field: 'preOrderDeposit', header: '預售訂金', visible: true },
    { field: 'preOrderReceipt', header: '預售實收結帳', visible: true },
    { field: 'incomeReport', header: '溢收帳', visible: true },
    { field: 'returnGoods', header: '退貨', visible: true },
    { field: 'exchangeGoods', header: '換貨', visible: true },
    { field: 'operation', header: '作廢', visible: true }
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
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
