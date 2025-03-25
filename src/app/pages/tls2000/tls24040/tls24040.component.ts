

  import { Component } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { NavigationExtras, Router } from '@angular/router';
  // 權限相關
  import {
    FunsrightInfo,
    PermissionsInfo,
  } from '../../../models/system/funsrightInfo';
  // 共用服務
  import { AuthService } from '../../../service/system/auth.service';
  import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
  import { NotificationService } from '../../../shared/service/notification.service';
  import { SupplementCategoryService } from '../../../service/basic/supplement-category.service';
  import { FloorService } from '../../../service/basic/floor.service';
  import { CounterCodeService } from '../../../service/basic/counter-code.service';
  import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

  const now = new Date();

  @Component({
    selector: 'app-tls24040',
    templateUrl: './tls24040.component.html',
    styleUrl: './tls24040.component.scss'
  })
  export class TLS24040Component {

    ProgNo: string = '220027';

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
    queryForm = this.formBuilder.group({
      saleDateStart: [, [Validators.required]], // 銷售日期起
      saleDateEnd: [, [Validators.required]],   // 銷售日期迄
      cashierCode: [, [Validators.required]],  // 收銀機號
      transactionSerial: [, [Validators.required]],  // 交易序號
    });

    // 下拉選單選項
    supplementCategoryOptions: any[] = [];
    cashierOptions: any[] = [];

  // 表格資料
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'saleDate', header: '銷售日期', visible: true },
    { field: 'cashRegisterCode', header: '收銀機代號', visible: true },
    { field: 'transactionNumber', header: '交易序號', visible: true },
    { field: 'counterCodeName', header: '專櫃編號/名稱', visible: true },
    { field: 'serialNumber', header: '序號', visible: true },
    { field: 'salesAmountTotal', header: '銷售金額', visible: true },
    { field: 'previousPaymentType', header: '前次付款別', visible: true },
    { field: 'creditCardOrCouponNumber', header: '信用卡卡號禮券號碼', visible: true },
    { field: 'isCorrected', header: '是否修正', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'paymentType', header: '付款別', visible: true },
    { field: 'cardType', header: '卡別', visible: true },
    { field: 'installmentPeriods', header: '分期期數', visible: true },
   
  ];


    constructor(
      private router: Router,
      private formBuilder: FormBuilder,
      private messageService: NotificationService,
      private authService: AuthService,
      private supplementCategoryService: SupplementCategoryService,  // 補登類別 service
      private floorService: FloorService,  // 收銀機號 service
      private counterCodeService: CounterCodeService,  // 專櫃編號 service
    ) {}

    ngOnInit(): void {
      this.funInfo = this.authService.getUserPermissions(this.ProgNo);

      this.supplementCategoryService.getSupplementCategories().subscribe((data) => {
        this.supplementCategoryOptions = data;
      });

      this.floorService.getFloors().subscribe((data) => {
        this.cashierOptions = data;
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
    onClearForm() {
      this.queryForm.reset();  // 重置表單
    }
  }

