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
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { SupplementCategoryService } from '../../../service/basic/supplement-category.service';
import { FloorService } from '../../../service/basic/floor.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

const now = new Date();

@Component({
  selector: 'app-tls24030',
  templateUrl: './tls24030.component.html',
  styleUrl: './tls24030.component.scss'
})
export class TLS24030Component {


  ProgNo: string = '220026';

  // 權限變數
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
    { field: 'salesStatus', header: '銷售狀況', visible: true },
    { field: 'totalSalesAmount', header: '銷售金額合計', visible: true },
    { field: 'invoiceCode', header: '發票號碼', visible: true },
    { field: 'productCategory', header: '商品抽成類別', visible: true },
    { field: 'salesQuantity', header: '銷售數量', visible: true },
    { field: 'salesAmount', header: '銷售金額', visible: true },
    { field: 'taxType', header: '稅別', visible: true },
    { field: 'discountAmount', header: '折讓額', visible: true },
    { field: 'modifiableDiscount', header: '可修改折扣別/折扣別', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private supplementCategoryService: SupplementCategoryService,  // 補登類別 service
    private floorService: FloorService,  // 收銀機號 service
    private counterCodeService: CounterCodeService,  // 專櫃編號 service
  ) { }

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
