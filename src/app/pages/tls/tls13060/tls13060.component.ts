import { FloorService } from './../../../service/basic/floor.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LocationCodeService } from '../../../service/basic/locationcode.service';
import { OperationStatusService } from '../../../service/basic/operation-status.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls13060',
  templateUrl: './tls13060.component.html',
  styleUrls: ['./tls13060.component.scss'],
})
export class TLS13060Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    counterRecruitmentCode: [], // 專櫃招募編號
    vendorCode: [], // 廠商統一編號
    counterCode: [], // 專櫃編號
    counterName: [], // 櫃位名稱
    locationCode: [], // 位置編號
    operationStatus: [], // 營運狀況
    contractStartDate: [], // 契約起始日
    contractEndDate: [], // 契約截止日
    operationStartDate: [], // 營運起始日
    operationEndDate: [], // 營運截止日
    floorCode: [], // 樓層
    commissionType: [], // 抽成別
    paymentMethod: [], // 付款方式
    issueOwnerInvoice: [], // 是否開立業主發票
    useOwnerCashRegister: [], // 是否使用業主收銀機
    ownerCashCollection: [], // 是否為業主收現
    whetherOptions: [], // 通用選項
  });
  data: any[] = [];
  columns: Column[] = [
    { field: 'updateTime', header: '更新時間', visible: true },
    { field: 'locationNumber', header: '位置編號', visible: true },
    { field: 'vendorName', header: '廠商名稱', visible: true },
    { field: 'counterName', header: '櫃位名稱', visible: true },
    { field: 'counterNumber', header: '專櫃編號', visible: true },
    { field: 'isOwnerPOS', header: '是否使用業主收款機', visible: true },
    { field: 'isOwnerInvoice', header: '是否使用業主發票', visible: true },
    { field: 'memberCardPoints', header: '會員卡集點', visible: true },
    { field: 'isOwnerCash', header: '是否為業主收現', visible: true },
    { field: 'paymentMethod', header: '貨款支付方式', visible: true },
    { field: 'appPickupNote', header: 'APP提貨單', visible: true },
    { field: 'performanceCoupon', header: '成績抵用券', visible: true },
    { field: 'appCoupon', header: 'APP抵用券', visible: true },
    { field: 'productPickupNote', header: '商品提貨單', visible: true },
    { field: 'voucherBalanceCard', header: '證券餘額卡', visible: true },
    { field: 'pickupVoucherBalanceCard', header: '提貨單餘代卡', visible: true },
    { field: 'leadVoucher', header: '導券', visible: true },
    { field: 'externalPickupNotePaper', header: '外來提貨單(紙券)', visible: true },
    { field: 'externalVoucherPaper', header: '外來提貨券(紙券)', visible: true },
    { field: 'eventVoucher', header: '活動券(自券)', visible: true },
    { field: 'discountCoupon', header: '折價券', visible: true },
    { field: 'cashDiscount', header: '現抵', visible: true },
  ];

  // 下拉选单选项
  LocationCodeOptions: any[] = [];
  operationStatusOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  commissionCategoryOptions: any[] = [];
  whetherOptions: any[] = [];
  vendorOptions: any[] = [];
  floorOptions: any[] = [];
  paymentOptions: any[] = [];

  constructor(
    private LocationCodeService: LocationCodeService,
    private operationStatusService: OperationStatusService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private whetherService: WhetherService,
    private vendorService: VendorService,
    private floorService: FloorService,
    private commissionTypeService: CommissionTypeService,
    private paymentMethodService: PaymentMethod2Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13060', '/TLS/TLS13060CRU', this.queryForm, (form) => this.onSubmit(form));
    this.LocationCodeService.getSystemTypes().subscribe((data) => {
      this.LocationCodeOptions = data;
    });
    this.operationStatusService.getOperationStatuses().subscribe((data) => {
      this.operationStatusOptions = data;
    });
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.commissionTypeOptions = data;
    });
    this.whetherService.getWhetherOptions().subscribe((data) => {
      this.whetherOptions = data;
    });
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });
    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });
    this.commissionTypeService.getCommissionTypes().subscribe((data) => {
      this.commissionTypeOptions = data;
    });
    this.paymentMethodService.getPaymentMethods().subscribe((data) => {
      this.paymentOptions = data;
    });
  }

  onSubmit(frm: FormGroup) {

  }
}
