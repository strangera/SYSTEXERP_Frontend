import { LocationCodeService } from './../../../service/basic/locationcode.service';
import { FloorService } from './../../../service/basic/floor.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services

// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { BigCategoryService } from '../../../service/basic/big-category.service';
import { MidCategoryService } from '../../../service/basic/mid-category.service';
import { SmallCategoryService } from '../../../service/basic/small-category.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';

@Component({
  selector: 'app-cpm21050',
  templateUrl: './cpm21050.component.html',
  styleUrl: './cpm21050.component.scss',
})
export class CPM21050Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    activityItemCode: [], // 活動用品代號
    activityItemName: [], // 活動用品名稱
    equipmentCategory: [], // 設備類別代號
    supplyNature: [], // 用品性質
    brandModel: [], // 廠牌型號
    specificationDetail: [], // 規格明細
    productSerialNumber: [], // 產品序號
    accessoryEquipment: [], // 附屬設備
    storageLocation: [], // 存放地點
    custodian: [], // 保管人
  });

  // Dropdown options
  equipmentCategoryOptions: any[] = [
    { value: 1, label: '000001' },
    { value: 2, label: '000002' },
  ];
  supplyNatureOptions: any[] = [
    { value: 1, label: '耗材' },
    { value: 2, label: '贈品' },
    { value: 3, label: '一般' },
  ];
  Departmentcode: any[] = [];
  floor: any[] = [];
  location: any[] = [];

  // Data for table
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'activityItemCode', header: '活動用品代號', visible: true },
    { field: 'activityItemName', header: '活動用品名稱', visible: true },
    { field: 'equipmentCategoryName', header: '設備類別名稱', visible: true },
    { field: 'itemProperty', header: '用品性質', visible: true },
    { field: 'brandModelNumber', header: '廠牌型號', visible: true },
    { field: 'specificationDetails', header: '規格明細', visible: true },
    { field: 'serialNumber', header: '產品序號', visible: true },
    { field: 'attachedEquipment', header: '附屬設備', visible: true },
    { field: 'storageLocation', header: '存放地點', visible: true },
    { field: 'custodian', header: '保管人', visible: true },
    { field: 'CurrentInventoryQuantity', header: '目前庫存量', visible: true },

  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private bigCategoryService: BigCategoryService,
    private midCategoryService: MidCategoryService,
    private smallCategoryService: SmallCategoryService,
    private organizationNumberService: OrganizationNumberService,
    private floorService: FloorService,
    private locationCodeService: LocationCodeService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '520005';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.organizationNumberService
      .getOrganizationNumbers()
      .subscribe((data) => (this.Departmentcode = data));
    this.floorService.getFloors().subscribe((data) => (this.floor = data));
    this.locationCodeService
      .getSystemTypes()
      .subscribe((data) => (this.location = data));
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 查詢邏輯
      // Implement your query logic here
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
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
      this.router.navigate(['CPM2000/CPM21050CRU'], extras);
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
    this.queryForm.reset(); // 重置表單
  }
}
