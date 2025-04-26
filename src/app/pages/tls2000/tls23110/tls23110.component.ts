import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { SystemTypeService } from '../../../service/basic/system-type.service';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { TypeService } from '../../../service/basic/type.service';
import { CategoryService } from '../../../service/basic/category.service';

@Component({
  selector: 'app-tls23110',
  templateUrl: './tls23110.component.html',
  styleUrls: ['./tls23110.component.scss']
})
export class TLS23110Component {

  ProgNo: string = '220020';

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
    saleDateStart: [{ value: '', disabled: true }, Validators.required], // 銷售日期起
    saleDateEnd: [{ value: '', disabled: true }, Validators.required],   // 銷售日期迄
    saleMonthYear: [{ value: '', disabled: true }], // 年月
    productCategory: [],  // 商品抽成類別
    type: [],  // 類型
    category: [{ value: '', disabled: true }],  // 類別
    counterCode: [{ value: '', disabled: true }],  // 專櫃編號
    organizationCode: [{ value: '', disabled: true }],  // 組織代碼
    dateRadio: [''],  // 日期選項單選
    categoryRadio: ['']  // 類別選項單選
  });

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'fullPriceWithoutTax', header: '正品 - 未稅', visible: true },
    { field: 'fullPriceExemptedTax', header: '正品 - 免稅', visible: true },
    // ... existing columns ...
    { field: 'grandTotal', header: '合計 - 加總', visible: true },
  ];

  // 下拉選單選項
  systemTypeOptions: any[] = [];
  DeductionbigCategoryOptions: any[] = [];
  TypeOptions: any[] = [];
  CategoryOptions: any[] = [];
  CounterCodeOptions: any[] = [];
  OrganizationNumberOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private systemTypeService: SystemTypeService,
    private DeductionbigCategoryService: DeductionbigCategoryService,
    private TypeService: TypeService,
    private CategoryService: CategoryService,
    private CounterCodeService: CounterCodeService,
    private OrganizationNumberService: OrganizationNumberService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.systemTypeService.getSystemTypes().subscribe(data => {
      this.systemTypeOptions = data;
    });
    this.DeductionbigCategoryService.getLocalDeductionCategories().subscribe(data => {
      this.DeductionbigCategoryOptions = data;
    });
    this.TypeService.getTypeOptions().subscribe(data => {
      this.TypeOptions = data;
    });
    this.CategoryService.getCategories().subscribe(data => {
      this.CategoryOptions = data;
    });
    this.CounterCodeService.getCounterCodes().subscribe(data => {
      this.CounterCodeOptions = data;
    });
    this.OrganizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.OrganizationNumberOptions = data;
    });

    // Initialize radio button behaviors
    this.queryForm.controls.dateRadio.valueChanges.subscribe(value => {
      if (value === 'saleDate') {
        this.queryForm.controls.saleDateStart.enable();
        this.queryForm.controls.saleDateEnd.enable();
        this.queryForm.controls.saleMonthYear.disable();
        this.queryForm.controls.saleMonthYear.reset();
      } else if (value === 'saleMonthYear') {
        this.queryForm.controls.saleDateStart.disable();
        this.queryForm.controls.saleDateEnd.disable();
        this.queryForm.controls.saleDateStart.reset();
        this.queryForm.controls.saleDateEnd.reset();
        this.queryForm.controls.saleMonthYear.enable();
      }
    });

    this.queryForm.controls.categoryRadio.valueChanges.subscribe(value => {
      this.queryForm.controls.category.disable();
      this.queryForm.controls.counterCode.disable();
      this.queryForm.controls.organizationCode.disable();
      this.queryForm.controls.category.reset();
      this.queryForm.controls.counterCode.reset();
      this.queryForm.controls.organizationCode.reset();

      if (value === 'category') {
        this.queryForm.controls.category.enable();
      } else if (value === 'counterCode') {
        this.queryForm.controls.counterCode.enable();
      } else if (value === 'organizationCode') {
        this.queryForm.controls.organizationCode.enable();
      }
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
          queryform: this.queryForm.value,
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
          queryform: this.queryForm.value,
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
        queryform: this.queryForm.value,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
