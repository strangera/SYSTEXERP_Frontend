import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { TypeService } from '../../../service/basic/type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

const now = new Date();

@Component({
  selector: 'app-tls23060',
  templateUrl: './tls23060.component.html',
  styleUrl: './tls23060.component.scss'
})
export class TLS23060Component {

  ProgNo: string = '220015';

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
    saleDateStart: [, [Validators.required]], // 銷售日期* (開始)
    saleDateEnd: [, [Validators.required]], // 銷售日期* (結束)
    type: [], // 類型
    cashierCode: [], // 收銀機代號
    counterCode: [], // 專櫃編號
    floor: [], // 樓層
    sortOrder: [], // 排序
    recordsPerPage: [] // 每頁顯示筆數
  });

  // 表格資料
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'cashRegisterNumber', header: '收銀機號', visible: true },
    { field: 'counterNumber', header: '專櫃編號', visible: true },
    { field: 'counterName', header: '專櫃名稱', visible: true },
    { field: 'totalAmount', header: '總金額', visible: true },
    { field: 'cash', header: '現金', visible: true },
    { field: 'unitedLink', header: '聯合連線', visible: true },
    { field: 'unitedDisconnect', header: '聯合離線', visible: true },
    { field: 'unitedRedemption', header: '聯合紅利', visible: true },
    { field: 'creditCardConnected', header: '[信用卡]中信連線', visible: true },
    { field: 'creditCardDisconnected', header: '中信離線', visible: true },
    { field: 'creditCardRedemption', header: '中信紅利', visible: true },
    { field: 'parkingOneCard', header: '[一卡通]停車場', visible: true },
    { field: 'oneCard', header: '一卡通', visible: true },
    { field: 'voucher', header: '禮券', visible: true },
    { field: 'productDelivery', header: '商品提貨車', visible: true },
    { field: 'voucherHotStamp', header: '感熱紙抵用券', visible: true },
    { field: 'productVoucher', header: '商品抵用券', visible: true },
    { field: 'creditReceipt', header: '賣寮提貨單(應收帳款)', visible: true },
    { field: 'foreignVoucher', header: '外來禮券(抵用券)', visible: true },
    { field: 'foreignDelivery', header: '外來提貨單(抵用券)', visible: true },
    { field: 'activityVoucher', header: '活動券(自營)', visible: true },
    { field: 'discountVoucher', header: '折價券現抵', visible: true },
    { field: 'giftCardDiscount', header: '禮券餘額卡', visible: true },
    { field: 'giftCard', header: '提貨單餘額代卡', visible: true },
    { field: 'memberDiscount', header: '會員折扣', visible: true },
    { field: 'linePay', header: 'LINE PAY', visible: true },
    { field: 'appVoucher', header: 'APP抵用券', visible: true },
    { field: 'appOrder', header: 'APP提貨單', visible: true },
    { field: 'preSale', header: '預售', visible: true },
    { field: 'preSaleRevenue', header: '預售實收結帳', visible: true },
    { field: 'incomeAccount', header: '溢收帳', visible: true },
    { field: 'return', header: '退貨', visible: true },
    { field: 'exchange', header: '換貨作廢', visible: true },
    { field: 'proxyPayment', header: '代收付', visible: true }
  ];


  // 下拉選單選項
  typeOptions: any[] = [];
  floorOptions: any[] = [];
  sortOrderOptions: any[] = [];
  recordsPerPageOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private typeService: TypeService,
    private floorService: FloorService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.typeService.getTypeOptions().subscribe(data => {
      this.typeOptions = data;
    });

    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
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
