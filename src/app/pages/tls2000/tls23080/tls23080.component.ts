import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { WhetherService } from './../../../service/basic/whether.service';

@Component({
  selector: 'app-tls23080',
  templateUrl: './tls23080.component.html',
  styleUrls: ['./tls23080.component.scss']
})
export class TLS23080Component implements OnInit {

  ProgNo: string = '220017';

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
    queryStartDate: [{ value: null, disabled: true }],  // 查詢開始日期
    queryEndDate: [{ value: null, disabled: true }],    // 查詢結束日期
    cashRegisterCode: [],                               // 收銀機代號
    onedatemm: [{ value: null, disabled: true }],       // 月查詢
    whether: [],                                        // 是否
    radioOption: [''],                                  // Radio 選項
  });

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'cash', header: '現金', visible: true },
    { field: 'creditCardUnionGeneral', header: '[信用卡]聯合 一般卡', visible: true },
    { field: 'creditCardUnionAE', header: '[信用卡]聯合 AE卡', visible: true },
    { field: 'creditCardUnionDiner', header: '[信用卡]聯合 DINER卡', visible: true },
    { field: 'creditCardCitiGeneral', header: '[信用卡]中信 一般卡', visible: true },
    { field: 'creditCardCitiAE', header: '[信用卡]中信 AE卡', visible: true },
    { field: 'creditCardCitiDiner', header: '[信用卡]中信 DINER卡', visible: true },
    { field: 'creditCardCitiParkingGeneral', header: '[信用卡]中信·停車場 一般卡', visible: true },
    { field: 'creditCardCitiParkingAE', header: '[信用卡]中信·停車場 AE卡', visible: true },
    { field: 'creditCardCitiParkingDiner', header: '[信用卡]中信·停車場 DINER卡', visible: true },
    { field: 'easyCardParking', header: '[一卡通]停車場', visible: true },
    { field: 'voucher', header: '禮券', visible: true },
    { field: 'productCollectionOrder', header: '商品提貨單', visible: true },
    { field: 'thankYouVoucher', header: '感謝紙抵用券', visible: true },
    { field: 'productVoucher', header: '商品抵用券', visible: true },
    { field: 'expensiveGoodsReceipt', header: '貴賓提貨單(應收帳款)', visible: true },
    { field: 'externalGiftVoucher', header: '外來禮券(抵用券)', visible: true },
    { field: 'externalGoodsReceiptVoucher', header: '外來提貨單(抵用券)', visible: true },
    { field: 'selfRunActivityVoucher', header: '活動券(自營)', visible: true },
    { field: 'discountVoucher', header: '折價券', visible: true },
    { field: 'cashVoucher', header: '現抵', visible: true },
    { field: 'voucherRemainingCard', header: '禮券餘代卡', visible: true },
    { field: 'goodsReceiptRemainingCard', header: '提貨單餘代卡', visible: true },
    { field: 'memberDiscount', header: '會員折抵', visible: true },
    { field: 'linePay', header: 'LINE PAY', visible: true },
    { field: 'linePayParking', header: '[LINE PAY] 停車場', visible: true },
    { field: 'appVoucher', header: 'APP抵用券', visible: true },
    { field: 'appGoodsReceipt', header: 'APP提貨單', visible: true },
    { field: 'totalAmount', header: '總金額', visible: true },
  ];

  WhetherOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private whetherService: WhetherService,
  ) { }

  ngOnInit(): void {
    // Initialize permissions
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // Load 'whether' options
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.WhetherOptions = data;
    });
  }

  // Handle Radio Button Selection
  onRadioSelect(selected: string): void {
    if (selected === 'month') {
      this.queryForm.controls.radioOption.setValue('month');
      this.queryForm.controls.onedatemm.enable();
      this.queryForm.controls.queryStartDate.disable();
      this.queryForm.controls.queryEndDate.disable();
    } else if (selected === 'dateRange') {
      this.queryForm.controls.radioOption.setValue('dateRange');
      this.queryForm.controls.queryStartDate.enable();
      this.queryForm.controls.queryEndDate.enable();
      this.queryForm.controls.onedatemm.disable();
    }
  }

  canQuery(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.query) as boolean;
  }

  canAdd(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.add) as boolean;
  }

  canEdit(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.edit) as boolean;
  }

  onSubmit(frm: FormGroup): void {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Original query logic
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.queryForm.reset();  // Reset form
    this.queryForm.controls.onedatemm.disable();        // Disable 月查詢
    this.queryForm.controls.queryStartDate.disable();   // Disable 查詢開始日期
    this.queryForm.controls.queryEndDate.disable();     // Disable 查詢結束日期
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
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
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
