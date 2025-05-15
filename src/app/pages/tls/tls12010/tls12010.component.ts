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
import { UserCodeService } from '../../../service/basic/user-code.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';

// 2.1.2.1 潛在客戶資料維護
@Component({
  selector: 'app-tls12010',
  templateUrl: './tls12010.component.html',
  styleUrl: './tls12010.component.scss'
})
export class TLS12010Component {
  ProgNo: string = '210003';
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
    startdate: [], // 建檔日期
    enddate: [], // 建檔日期
    contactPerson: [[] as number[]], // 接洽人員
    vendorUID: [[] as number[]], // 廠商統一編號
    vendorCName: ['', [Validators.maxLength(60)]], // 廠商名稱(中文)
    vendorEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    brandCName: ['', [Validators.maxLength(30)]], // 品牌名稱(中文)
    brandEName: ['', [Validators.maxLength(30)]], // 品牌名稱(英文)
    industryCode: [[] as number[]], // 大分類代號
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { startdate: '2024-08-08', contactPerson: '林小姐', vendorUID: '123', vendorCName: '中文廠商名1', brandCName: '廠商1', brandEName: 'vendor1', industryCode: '10', brandFrom: '產地'},
    // { startdate: '2024-08-09', contactPerson: '林先生', vendorUID: '456', vendorCName: '中文廠商名2', brandCName: '廠商2', brandEName: 'vendor2', industryCode: '11', brandFrom: '產地'},
    // { startdate: '2024-08-10', contactPerson: '王小姐', vendorUID: '789', vendorCName: '中文廠商名3', brandCName: '廠商3', brandEName: 'vendor3', industryCode: '12', brandFrom: '產地'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'startdate', header: '建檔日期', visible: true },
    { field: 'contactPerson', header: '接洽人員', visible: true },
    { field: 'vendorUID', header: '廠商統一編號', visible: true },
    { field: 'vendorCName', header: '廠商公司名稱(中文)', visible: true },
    { field: 'brandCName', header: '品牌名稱(中文)', visible: true },
    { field: 'brandEName', header: '品牌名稱(英文)', visible: true },
    { field: 'industryCode', header: '大分類代號', visible: true },
    { field: 'brandFrom', header: '產品出產地', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  contactPersonOptions: any[] = [];
  vendorUIDOptions: any[] = [];
  industryCodeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private userCodeService: UserCodeService,
    private vendorService: VendorService,
    private businessTypeCodeService: BusinessTypeCodeService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.contactPersonOptions = data;
    });
    //
    this.vendorService.getVendors().subscribe(data => {
      this.vendorUIDOptions = data;
    });
    //
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe(data => {
      this.industryCodeOptions = data;
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

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      //console.log("extra", extras);
      this.router.navigate(['/TLS1000/TLS12010CRU'], extras);
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
        skipLocationChange: true
      };

      this.router.navigate(['/TLS1000/TLS12010CRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true
    };

    this.router.navigate(['/TLS1000/TLS12010CRU'], extras);
  }
}
