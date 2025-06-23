import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { VendorService } from '../../../service/basic/vendor.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { RegionService } from '../../../service/basic/region-code.service';
import { OperationStatusService } from '../../../service/basic/operation-status.service';
import { FloorService } from '../../../service/basic/floor.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { LocationCodeService } from '../../../service/basic/locationcode.service';

@Component({
  selector: 'app-tls14010',
  templateUrl: './tls14010.component.html',
  styleUrls: ['./tls14010.component.scss']
})
export class TLS14010Component {
  ProgNo: string = '210017';
  // 權限
  funInfo?: FunsrightInfo;



  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    counterCode: [],
    counterName: [],
    vendorCode: [],
    regionCode: [],
    floorCode: [],
    businessTypeCode: [],
    operationStatus: [],
    startserial: [],
    endserial: [],
    contractStatus: [],
    startDate: [],
    endDate: [],
    businessTypeCodeOptions: [],
    LocationCodeOptions: [], // 位置編號
  });

  // 表格数据
  data: any[] = [
    { name: 'John', age: 25, email: 'john@example.com' },
    { name: 'Jane', age: 30, email: 'jane@example.com' },
    // 其他数据
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'name', header: 'name', visible: true },
    { field: 'age', header: 'age', visible: true },
    { field: 'email', header: 'email', visible: true },
  ];

  // 下拉选单选项
  vendorOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  operationStatusOptions: any[] = [];
  contractStatusOptions: any[] = [];
  LocationCodeOptions: any[] = [];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private vendorService: VendorService,
    private contractStatusService: ContractStatusService,
    private RegionService: RegionService,
    private floorService: FloorService,
    private operationStatusService: OperationStatusService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private LocationCodeService: LocationCodeService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });
    this.RegionService.getRegionOptions().subscribe((data) => {
      this.regionOptions = data;
    });
    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });
    this.operationStatusService.getOperationStatuses().subscribe((data) => {
      this.operationStatusOptions = data;
    });
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.businessTypeCodeOptions = data;
    });
    this.contractStatusService.getContractStatuses().subscribe((data) => {
      this.contractStatusOptions = data;
    });
    this.LocationCodeService.getSystemTypes().subscribe((data) => {
      this.LocationCodeOptions = data;
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
