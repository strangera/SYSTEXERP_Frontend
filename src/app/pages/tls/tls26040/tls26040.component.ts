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
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { FloorService } from '../../../service/basic/floor.service';

import { ValidationService } from '../../../shared/service/validation.service';
//預售管理作業
const now = new Date();

@Component({
  selector: 'app-tls26040',
  templateUrl: './tls26040.component.html',
  styleUrls: ['./tls26040.component.scss']
})
export class TLS26040Component {

  ProgNo: string = '220038';

  // 權限變數
  funInfo?: FunsrightInfo;




  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    preSaleDateStart: [now, [Validators.required]], // 預售日期起
    preSaleDateEnd: [now, [Validators.required]],   // 預售日期迄
    checkoutDateStart: [now, [Validators.required]], // 結帳日期起
    checkoutDateEnd: [now, [Validators.required]],   // 結帳日期迄
    cashierCode: [],  // 收銀機機號
    counterCode: [],  // 專櫃編號
    batchNumber: [],  // 批號
  });

  // 下拉選單選項
  floorOptions: any[] = [];

  // 表格資料
  data: any[] = [
    { preSaleDate: '2015/04/16', accountDate: '2015/04/23', cashRegisterCode: '002301', categoryCode: '000230', batch: '20150423001', transactionSerial: '002351', amount: 1422, isdelete: true },
    { preSaleDate: '2015/04/16', accountDate: '2015/04/23', cashRegisterCode: '003431', categoryCode: '000343', batch: '20150423001', transactionSerial: '001925', amount: 5175, isdelete: true },
    { preSaleDate: '2015/04/16', accountDate: '2015/04/23', cashRegisterCode: '003431', categoryCode: '000343', batch: '20150423001', transactionSerial: '001926', amount: 1880, isdelete: true },
    { preSaleDate: '2015/04/16', accountDate: '2015/04/23', cashRegisterCode: '000601', categoryCode: '000060', batch: '20150423001', transactionSerial: '000295', amount: 20462, isdelete: true },
    { preSaleDate: '2015/04/16', accountDate: '2015/04/23', cashRegisterCode: '002351', categoryCode: '000235', batch: '20150423001', transactionSerial: '000307', amount: 2124, isdelete: true },
    { preSaleDate: '2015/04/16', accountDate: '2015/04/23', cashRegisterCode: '002911', categoryCode: '000291', batch: '20150423001', transactionSerial: '000715', amount: 6792, isdelete: true },
    { preSaleDate: '2015/04/16', accountDate: '2015/04/23', cashRegisterCode: '002311', categoryCode: '000231', batch: '20150423001', transactionSerial: '011248', amount: 1350, isdelete: true },
    { preSaleDate: '2015/04/16', accountDate: '2015/04/23', cashRegisterCode: '002311', categoryCode: '000231', batch: '20150423001', transactionSerial: '011249', amount: 400, isdelete: true },
    { preSaleDate: '2015/04/16', accountDate: '2015/04/23', cashRegisterCode: '000731', categoryCode: '000073', batch: '20150423001', transactionSerial: '001928', amount: 3411, isdelete: true }
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'preSaleDate', header: '預售日期', visible: true },
    { field: 'accountDate', header: '結帳日期', visible: true },
    { field: 'cashRegisterCode', header: '收銀機號', visible: true },
    { field: 'categoryCode', header: '櫃別編號', visible: true },
    { field: 'batchNumber', header: '批號', visible: true },
    { field: 'transactionSerial', header: '交易序號', visible: true },
    { field: 'amount', header: '金額', visible: true }
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private floorService: FloorService,  // 樓層 service
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.floorService.getFloors().subscribe((data) => {
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
          crudstatus: 'Create',
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS26040CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Edit',
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS26040CRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: 'Read',
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['TLS2000/TLS26040CRU'], extras);
  }
  onRE() {
    this.router.navigate(['TLS2000/TLS26040MOD']);
  }
}
