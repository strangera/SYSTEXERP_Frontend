import { WhetherService } from './../../../service/basic/whether.service';
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
import { ValidationService } from '../../../shared/service/validation.service';
const day = new Date();
@Component({
  selector: 'app-tls22020',
  templateUrl: './tls22020.component.html',
  styleUrl: './tls22020.component.scss'
})
export class TLS22020Component {

  ProgNo: string = '220007';
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
    saleDate: [day, [Validators.required]], // 銷售日期
    cashierStartCode: [, [this.validationService.numberValidator]], // 收銀機代號起
    cashierEndCode: [, [this.validationService.numberValidator]], // 收銀機代號迄
    listZeroDifference: [, []], // 差異為0是否列出
    displayOptions: [1, []], // 顯示選項, radioButton
  });
  // 表格資料
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'cashRegisterCode', header: '收銀機代號', visible: true },
    { field: 'dedicatedLane', header: '專櫃', visible: true },
    { field: 'cashDetail', header: '現金-明細', visible: true },
    { field: 'cashZ', header: '現金-Z帳', visible: true },
    { field: 'cashDifference', header: '現金-差額', visible: true },

    { field: 'jointCreditCardDetail', header: '聯合信用卡-明細', visible: true },
    { field: 'jointCreditCardZ', header: '聯合信用卡-Z帳', visible: true },
    { field: 'jointCreditCardDifference', header: '聯合信用卡-差額', visible: true },

    { field: 'chinaTrustParkingCardDetail', header: '中信-停車場信用卡-明細', visible: true },
    { field: 'chinaTrustParkingCardZ', header: '中信-停車場信用卡-Z帳', visible: true },
    { field: 'chinaTrustParkingCardDifference', header: '中信-停車場信用卡-差額', visible: true },

    { field: 'chinaTrustCreditCardDetail', header: '中信信用卡-明細', visible: true },
    { field: 'chinaTrustCreditCardZ', header: '中信信用卡-Z帳', visible: true },
    { field: 'chinaTrustCreditCardDifference', header: '中信信用卡-差額', visible: true },

    { field: 'ezCardParkingDetail', header: '[一卡通]停車場-明細', visible: true },
    { field: 'ezCardParkingZ', header: '[一卡通]停車場-Z帳', visible: true },
    { field: 'ezCardParkingDifference', header: '[一卡通]停車場-差額', visible: true },

    { field: 'ezCardDetail', header: '一卡通-明細', visible: true },
    { field: 'ezCardZ', header: '一卡通-Z帳', visible: true },
    { field: 'ezCardDifference', header: '一卡通-差額', visible: true },

    { field: 'giftVoucherDetail', header: '禮券-明細', visible: true },
    { field: 'giftVoucherZ', header: '禮券-Z帳', visible: true },
    { field: 'giftVoucherDifference', header: '禮券-差額', visible: true },

    { field: 'goodsDeliveryNoteDetail', header: '商品提貨單-明細', visible: true },
    { field: 'goodsDeliveryNoteZ', header: '商品提貨單-Z帳', visible: true },
    { field: 'goodsDeliveryNoteDifference', header: '商品提貨單-差額', visible: true },

    { field: 'thermalVoucherDetail', header: '感熱紙抵用券-明細', visible: true },
    { field: 'thermalVoucherZ', header: '感熱紙抵用券-Z帳', visible: true },
    { field: 'thermalVoucherDifference', header: '感熱紙抵用券-差額', visible: true },

    { field: 'productVoucherDetail', header: '商品抵用券-明細', visible: true },
    { field: 'productVoucherZ', header: '商品抵用券-Z帳', visible: true },
    { field: 'productVoucherDifference', header: '商品抵用券-差額', visible: true },

    { field: 'awardDeliveryNoteDetail', header: '獎賞提貨單(應收帳款)-明細', visible: true },
    { field: 'awardDeliveryNoteZ', header: '獎賞提貨單(應收帳款)-Z帳', visible: true },
    { field: 'awardDeliveryNoteDifference', header: '獎賞提貨單(應收帳款)-差額', visible: true },

    { field: 'externalGiftVoucherDetail', header: '外來禮券(抵用券)-明細', visible: true },
    { field: 'externalGiftVoucherZ', header: '外來禮券(抵用券)-Z帳', visible: true },
    { field: 'externalGiftVoucherDifference', header: '外來禮券(抵用券)-差額', visible: true },

    { field: 'externalDeliveryNoteDetail', header: '外來提貨單(抵用券)-明細', visible: true },
    { field: 'externalDeliveryNoteZ', header: '外來提貨單(抵用券)-Z帳', visible: true },
    { field: 'externalDeliveryNoteDifference', header: '外來提貨單(抵用券)-差額', visible: true },

    { field: 'activityVoucherDetail', header: '活動券(自營)-明細', visible: true },
    { field: 'activityVoucherZ', header: '活動券(自營)-Z帳', visible: true },
    { field: 'activityVoucherDifference', header: '活動券(自營)-差額', visible: true },

    { field: 'discountVoucherDetail', header: '折價券-明細', visible: true },
    { field: 'discountVoucherZ', header: '折價券-Z帳', visible: true },
    { field: 'discountVoucherDifference', header: '折價券-差額', visible: true },

    { field: 'cashCouponDetail', header: '現鈔-明細', visible: true },
    { field: 'cashCouponZ', header: '現鈔-Z帳', visible: true },
    { field: 'cashCouponDifference', header: '現鈔-差額', visible: true },

    { field: 'giftCardBalanceDetail', header: '禮券餘代卡-明細', visible: true },
    { field: 'giftCardBalanceZ', header: '禮券餘代卡-Z帳', visible: true },
    { field: 'giftCardBalanceDifference', header: '禮券餘代卡-差額', visible: true },

    { field: 'deliveryNoteWithCardDetail', header: '提貨單餘代卡-明細', visible: true },
    { field: 'deliveryNoteWithCardZ', header: '提貨單餘代卡-Z帳', visible: true },
    { field: 'deliveryNoteWithCardDifference', header: '提貨單餘代卡-差額', visible: true },

    { field: 'memberDiscountDetail', header: '會員折抵-明細', visible: true },
    { field: 'memberDiscountZ', header: '會員折抵-Z帳', visible: true },
    { field: 'memberDiscountDifference', header: '會員折抵-差額', visible: true },

    { field: 'linePayParkingDetail', header: '[LINE PAY] 停車場-明細', visible: true },
    { field: 'linePayParkingZ', header: '[LINE PAY] 停車場-Z帳', visible: true },
    { field: 'linePayParkingDifference', header: '[LINE PAY] 停車場-差額', visible: true },

    { field: 'linePayDetail', header: 'LINE PAY-明細', visible: true },
    { field: 'linePayZ', header: 'LINE PAY-Z帳', visible: true },
    { field: 'linePayDifference', header: 'LINE PAY-差額', visible: true },

    { field: 'appVoucherDetail', header: 'APP 抵用券-明細', visible: true },
    { field: 'appVoucherZ', header: 'APP 抵用券-Z帳', visible: true },
    { field: 'appVoucherDifference', header: 'APP 抵用券-差額', visible: true },

    { field: 'appDeliveryNoteDetail', header: 'APP 提貨單-明細', visible: true },
    { field: 'appDeliveryNoteZ', header: 'APP 提貨單-Z帳', visible: true },
    { field: 'appDeliveryNoteDifference', header: 'APP 提貨單-差額', visible: true },
    { field: 'detailTotalAmount', header: '明細總金額', visible: true },
    { field: 'bAccountTotalAmount', header: 'Z帳總金額', visible: true },
    { field: 'differenceAmount', header: '差額', visible: true },
  ];


  // 下拉選單選項
  machinedisplayOptions: any[] = [];
  whetherOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private whetherService: WhetherService
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;
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
