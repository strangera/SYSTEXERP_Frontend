import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { SystemTypeService } from '../../../service/basic/system-type.service';
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
import { TaxableService } from '../../../service/basic/taxable.service';
import { DiscountService } from '../../../service/basic/discount.service';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { WhetherService } from '../../../service/basic/whether.service';

const now = new Date();

@Component({
  selector: 'app-tls23020',
  templateUrl: './tls23020.component.html',
  styleUrl: './tls23020.component.scss'
})
export class TLS23020Component {
  ProgNo: string = '220011';

  // 权限
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

  // 查询表单
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    saleDate: [now, [Validators.required]], // 銷售日期*
    cashierCode: [], // 收銀機代號
    transactionSerialStart: [, [this.validationService.numberValidator]], // 交易序號(起)
    transactionSerialEnd: [, [this.validationService.numberValidator]], // 交易序號(迄)
    counterCode: [], // 專櫃編號
    invoiceNumber: [], // 字軌發票號碼
    itemPriceStart: [], // 單項售價 (起)
    itemPriceEnd: [], // 單項售價 (迄)
    taxType: [], // 稅別
    discountType: [], // 原折扣別
    commissionCategory: [], // 商品抽成類別
    itemNumber: [], // 單品編號
    ownershipDiscountType: [], // 歸屬折扣別
    displayStatus: [], // 顯示狀態
    issueOwnerInvoice: [], // 是否開立業主發票
    ownerCollectCash: [], // 是否為業主收現
    recordsPerPage: [], // 每頁顯示筆數
    limitnumber: [],//限制筆數
    checkTotalAmount: [],
  });

  // 表格数据
  data: any[] = [

    // 其他数据
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'saleDate', header: '銷售日期', visible: true },
    { field: 'cashRegisterStatus', header: '收銀機代號', visible: true },
    { field: 'transactionSequence', header: '交易序號', visible: true },
    { field: 'counterCode', header: '專櫃編號/名稱', visible: true },
    { field: 'invoiceCode', header: '發票號碼', visible: true },
    { field: 'unitPrice', header: '單項售價', visible: true },
    { field: 'untaxedAmount', header: '未稅(免稅)金額', visible: true },
    { field: 'tax', header: '稅額', visible: true },
    { field: 'discountAmount', header: '稅額', visible: true },
    { field: 'promotionCategory', header: '商品抽成類別', visible: true },
    { field: 'originalDiscount', header: '原折扣', visible: true },
    { field: 'categoryDiscount', header: '歸類折扣', visible: true },
    { field: 'taxCategory', header: '稅別', visible: true },
    { field: 'itemCode', header: '單品編號', visible: true },
    { field: 'status', header: '狀態', visible: true },
  ];
  
  systemTypeOptions: any[] = [];
  taxableOptions: any[] = [];
  discountOptions: any[] = [];
  deductionbigCategoryOptions: any[] = [];
  whetherOptions: any[] = [];
  checkTotalAmount: any[] = [    { value: 1, label: '是' },
    { value: 2, label: '否' },
    ];
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private systemTypeService: SystemTypeService,
    private taxableService:TaxableService,
    private discountService: DiscountService,
    private deductionbigCategoryService:DeductionbigCategoryService,
    private whetherService:WhetherService,
  ) {}

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.systemTypeService.getSystemTypes().subscribe(data => {
      this.systemTypeOptions = data;
    });
    this.taxableService.getSystemTypes().subscribe(data => {
      this.taxableOptions = data;
    });
    this.discountService.getLocalDiscountOptions().subscribe(data => {
      this.discountOptions = data;
    });
    this.deductionbigCategoryService.getLocalDeductionCategories().subscribe(data => {
      this.deductionbigCategoryOptions = data;
    });
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
      // 提交逻辑
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
