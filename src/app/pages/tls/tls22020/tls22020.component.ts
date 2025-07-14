import { WhetherService } from './../../../service/basic/whether.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';

@Component({
  templateUrl: './tls22020.component.html',
})

export class TLS22020Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    salesDate: [],
    ECR_No: [[]],
    status1: [''],
    status2: [''],
    cashierStartCode: [[this.validationService.numberValidator]], // 收銀機代號起
    cashierEndCode: [[this.validationService.numberValidator]], // 收銀機代號迄
    listZeroDifference: [[]], // 差異為0是否列出
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
  statusOptions = [
    { label: '是', value: 'yes' },
    { label: '否', value: 'no' }
  ];
  ECRNoOptions: any[] = [];
  constructor(
    private validationService: ValidationService,
    private whetherService: WhetherService,
    private ECRNoService: ECRNoService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22020', '/TLS/TLS22020cru', this.queryForm, (form) => this.onSubmit(form));
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;
    });

    // 👉 模擬假資料
    this.data = [
      {
        cashRegisterCode: 'A001',
        dedicatedLane: 'Y',
        cashDetail: 10000,
        cashZ: 10000,
        cashDifference: 0,
        jointCreditCardDetail: 2000,
        jointCreditCardZ: 2000,
        jointCreditCardDifference: 0,
        chinaTrustParkingCardDetail: 500,
        chinaTrustParkingCardZ: 500,
        chinaTrustParkingCardDifference: 0,
        chinaTrustCreditCardDetail: 3000,
        chinaTrustCreditCardZ: 3000,
        chinaTrustCreditCardDifference: 0,
        ezCardParkingDetail: 0,
        ezCardParkingZ: 0,
        ezCardParkingDifference: 0,
        ezCardDetail: 100,
        ezCardZ: 100,
        ezCardDifference: 0,
        giftVoucherDetail: 800,
        giftVoucherZ: 800,
        giftVoucherDifference: 0,
        goodsDeliveryNoteDetail: 0,
        goodsDeliveryNoteZ: 0,
        goodsDeliveryNoteDifference: 0,
        thermalVoucherDetail: 0,
        thermalVoucherZ: 0,
        thermalVoucherDifference: 0,
        productVoucherDetail: 0,
        productVoucherZ: 0,
        productVoucherDifference: 0,
        awardDeliveryNoteDetail: 0,
        awardDeliveryNoteZ: 0,
        awardDeliveryNoteDifference: 0,
        externalGiftVoucherDetail: 0,
        externalGiftVoucherZ: 0,
        externalGiftVoucherDifference: 0,
        externalDeliveryNoteDetail: 0,
        externalDeliveryNoteZ: 0,
        externalDeliveryNoteDifference: 0,
        activityVoucherDetail: 0,
        activityVoucherZ: 0,
        activityVoucherDifference: 0,
        discountVoucherDetail: 0,
        discountVoucherZ: 0,
        discountVoucherDifference: 0,
        cashCouponDetail: 0,
        cashCouponZ: 0,
        cashCouponDifference: 0,
        giftCardBalanceDetail: 0,
        giftCardBalanceZ: 0,
        giftCardBalanceDifference: 0,
        deliveryNoteWithCardDetail: 0,
        deliveryNoteWithCardZ: 0,
        deliveryNoteWithCardDifference: 0,
        memberDiscountDetail: 0,
        memberDiscountZ: 0,
        memberDiscountDifference: 0,
        linePayParkingDetail: 0,
        linePayParkingZ: 0,
        linePayParkingDifference: 0,
        linePayDetail: 0,
        linePayZ: 0,
        linePayDifference: 0,
        appVoucherDetail: 0,
        appVoucherZ: 0,
        appVoucherDifference: 0,
        appDeliveryNoteDetail: 0,
        appDeliveryNoteZ: 0,
        appDeliveryNoteDifference: 0,
        detailTotalAmount: 20000,
        bAccountTotalAmount: 20000,
        differenceAmount: 0
      }
    ];

    this.filteredData = [...this.data];
  }


  //   canQuery(): boolean {
  //     return true;
  //   }

  //   canAdd(): boolean {
  //     return true;
  //   }

  //   canEdit(): boolean {
  //     return true;
  //   }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log(123);
    })
  }

}
