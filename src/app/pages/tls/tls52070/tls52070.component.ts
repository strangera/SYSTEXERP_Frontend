import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { VendorService } from '../../../service/basic/vendor.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { BigCategoryService } from '../../../service/basic/big-category.service';
import { MidCategoryService } from '../../../service/basic/mid-category.service';
import { SmallCategoryService } from '../../../service/basic/small-category.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-tls52070',
  templateUrl: './tls52070.component.html',
  styleUrls: ['./tls52070.component.scss']
})
export class TLS52070Component {

  ProgNo: string = '250020';
  funInfo?: FunsrightInfo;



  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    vendorCode: [null, Validators.required],
    brandCode: [null, Validators.required],
    bigCategory: [null, Validators.required],
    midCategory: [null, Validators.required],
    smallCategory: [null, Validators.required],
    quantity: [100, Validators.required],
    startDate: [new Date(), Validators.required],
  });

  // Dropdown options
  vendorOptions: any[] = [];
  brandCodeOptions: any[] = [];
  bigCategoryOptions: any[] = [];
  midCategoryOptions: any[] = [];
  smallCategoryOptions: any[] = [];

  // 表格資料
  data: any[] = [
    { name: 'John', age: 25, email: 'john@example.com' },
    { name: 'Jane', age: 30, email: 'jane@example.com' },
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: 'email', header: 'Email', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private vendorService: VendorService,
    private brandCodeService: BrandCodeService,
    private bigCategoryService: BigCategoryService,
    private midCategoryService: MidCategoryService,
    private smallCategoryService: SmallCategoryService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.vendorService.getVendors().subscribe(data => this.vendorOptions = data);
    this.brandCodeService.getSystemTypes().subscribe(data => this.brandCodeOptions = data);
    this.bigCategoryService.getCategories().subscribe(data => this.bigCategoryOptions = data);
    this.midCategoryService.getSubCategories().subscribe(data => this.midCategoryOptions = data);
    this.smallCategoryService.getSmallCategories().subscribe(data => this.smallCategoryOptions = data);
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
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }

    this.loading = false;
    this.notificationService.unblockUi();
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
      this.router.navigate(['/demo/demoinputtableCRU'], extras);
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
      this.router.navigate(['/demo/demoinputtableCRU'], extras);
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
    this.router.navigate(['/demo/demoinputtableCRU'], extras);
  }
}
