import { MerchantStatusService } from './../../../service/basic/merchant-status.service';
import { MerchantTypeService } from './../../../service/basic/merchant-type.service';
import { BrandCodeService } from './../../../service/basic/brand-code.service';
import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
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

// 2.5.1.7  商品基本資料
@Component({
  selector: 'app-tls51070',
  templateUrl: './tls51070.component.html',
  styleUrl: './tls51070.component.scss'
})
export class TLS51070Component {
  ProgNo: string = '250007';
  // 權限
  funInfo?: FunsrightInfo;
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    merchantID: [, [Validators.maxLength(32), this.validationService.numberValidator]], // Input serial number
    merchantName: ['', [Validators.maxLength(32)]], // Input Text
    internationalCode: [, [Validators.maxLength(32), this.validationService.numberValidator]], // Input serial number
    venderCode: [, [Validators.maxLength(32), this.validationService.numberValidator]], // Input serial number
    brandCode: [], // DropDown
    lCategory: [], // DropDown
    mCategory: [], // DropDown
    sCategory: [], // DropDown
    merchantType: [], // DropDown
    merchantUnit: [], // DropDown
    merchantStatus: [[] as number[], [Validators.required]], // MultiSelect
    illustrate: [,], // editor text
    editortext: [,], // editor text
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    //{ contactPerson: 'A先生', contactDate: '2024-08-08', UID: '123' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 1, progress: '未審核'},
    //{ contactPerson: 'B先生', contactDate: '2024-08-09', UID: '456' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 2, progress: '已審核'},
    //{ contactPerson: 'C先生', contactDate: '2024-08-10', UID: '789' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 3, progress: '未審核'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'contactPerson', header: '商品管理編碼', visible: true },
    { field: 'contactDate', header: '國際條碼', visible: true },
    { field: 'UID', header: '廠商貨號', visible: true },
    { field: 'industryType', header: '商品名稱', visible: true },
    { field: 'category', header: '大分類代號', visible: true },
    { field: 'version', header: '大分類名稱', visible: true },
    { field: 'rentNumber', header: '中分類代號', visible: true },
    { field: 'progress', header: '中分類名稱', visible: true },
    { field: 'col1', header: '小分類代號', visible: true },
    { field: 'col2', header: '小分類名稱', visible: true },
    { field: 'col3', header: '商品售價', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------

  storageOptions: any[] = [];
  brandCodeOptions: any[] = [];
  merchantTypeOptions: any[] = [];
  merchantUnitOptions: any[] = [{ value: 1, label: '01-件' },];
  merchantStatusOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private brandCodeService: BrandCodeService,
    private merchantTypeService: MerchantTypeService,
    private merchantStatusService: MerchantStatusService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => {
      this.storageOptions = data;
    });
    // ----------------------------------------------------------------
    this.brandCodeService.getSystemTypes().subscribe(data => {
      this.brandCodeOptions = data;
    });
    // ----------------------------------------------------------------
    this.merchantTypeService.getSystemTypes().subscribe(data => {
      this.merchantTypeOptions = data;
    });
    // ----------------------------------------------------------------
    this.merchantStatusService.getSystemTypes().subscribe(data => {
      this.merchantStatusOptions = data;

      // 全選填入
      // let allSystemValues = this.merchantStatusOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   merchantStatus: allSystemValues
      // });
    });
  }

  // 權限
  // ----------------------------------------------------------------
  canQuery(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.query) as boolean;
  }
  canAdd(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.add) as boolean;
  }
  canEdit(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.edit) as boolean;
  }
  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
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
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  onDetail(data: any) {
    console.log(data);
    this.navigateWithState(CRUDStatus.Read, data);
  }

  navigateWithState(crudstatus: CRUDStatus, rowdata?: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
      },
    };

    console.log(crudstatus);

    this.router.navigate(['/TLS5000/TLS51070CRU'], extras);
  }
}
