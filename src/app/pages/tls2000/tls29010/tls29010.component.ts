import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
// Services for dropdowns
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { DiscountService } from '../../../service/basic/discount.service';
import { WhetherService } from '../../../service/basic/whether.service';

const now = new Date();

@Component({
  selector: 'app-tls29010',
  templateUrl: './tls29010.component.html',
  styleUrls: ['./tls29010.component.scss']
})
export class TLS29010Component {

  // 程式編號
  ProgNo: string = '220049';
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
    counterCode: [],  // 專櫃編號
    counterLocationCode: [],  // 專櫃位置編號
    productCategory: [],  // 商品類別
    discount: [],  // 折扣別
    startDate: [now],  // 開放起始日
    endDate: [now],  // 開放結束日
    isActive: [],  // 是否使用中
    createdBy: [],  // 建立者
    lastModifiedDate: [now],  // 維護日
  });

  // 表格資料
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'specialCounterNumber', header: '專櫃編號', visible: true },
    { field: 'specialCounterName', header: '專櫃名稱', visible: true },
    { field: 'productCategory', header: '商品類別', visible: true },
    { field: 'productCategoryName', header: '商品類別名稱', visible: true },
    { field: 'discountType', header: '折扣別', visible: true },
    { field: 'drawRate', header: '抽成率', visible: true },
    { field: 'openStartDate', header: '開放起始日', visible: true },
    { field: 'openEndDate', header: '開放結束日', visible: true },
    { field: 'creator', header: '建立者', visible: true },
    { field: 'creationDate', header: '建立日期', visible: true },
    { field: 'isInUse', header: '是否使用中', visible: true },
  ];


  // 下拉選單選項
  productCategoryOptions: any[] = [];
  discountOptions: any[] = [];
  isActiveOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private deductionbigCategoryService: DeductionbigCategoryService,
    private discountService: DiscountService,
    private whetherService: WhetherService
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // Initialize dropdown options
    this.deductionbigCategoryService.getLocalDeductionCategories().subscribe(data => {
      this.productCategoryOptions = data;
    });
    this.discountService.getLocalDiscountOptions().subscribe(data => {
      this.discountOptions = data;
    });
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.isActiveOptions = data;
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
          queryform: this.queryForm
        },
        skipLocationChange: true
      };
      this.router.navigate(['TLS2000/TLS29010CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm
        },
        skipLocationChange: true
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm
      },
      skipLocationChange: true
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
