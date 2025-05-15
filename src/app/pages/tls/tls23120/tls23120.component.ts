import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { RegionCodeService } from '../../../service/basic/region-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

@Component({
  selector: 'app-tls23120',
  templateUrl: './tls23120.component.html',
  styleUrls: ['./tls23120.component.scss']
})
export class TLS23120Component {

  ProgNo: string = '220021';

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
    organizationCode: [{ value: '', disabled: true }],  // 專櫃編號
    regionCode: [{ value: '', disabled: true }],  // 區域
    floorCode: [{ value: '', disabled: true }],  // 樓層
    businessTypeCode: [{ value: '', disabled: true }],  // 大分類
    whetherDisplayBusinessType: [],  // 是否顯示大分類
    locationRadio: ['']  // 地點選項單選
  });

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'area', header: '區分', visible: true },
    { field: 'transactionCount', header: '銷貨筆數', visible: true },
    { field: 'netSales', header: '淨銷貨', visible: true },
    { field: 'businessTax', header: '營業稅', visible: true },
    { field: 'transactionAmount', header: '銷貨金額', visible: true },
    { field: 'preSaleCount', header: '預售筆數', visible: true },
    { field: 'preSaleAmount', header: '預售金額', visible: true },
    { field: 'settleCount', header: '結帳筆數', visible: true },
    { field: 'settleAmount', header: '結帳金額', visible: true },
  ];

  // 下拉選單選項
  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  whetherOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private regionCodeService: RegionCodeService, // 區域 service
    private floorService: FloorService, // 樓層 service
    private businessTypeCodeService: BusinessTypeCodeService, // 大分類 service
    private organizationNumberService: OrganizationNumberService, // 專櫃編號 service
    private whetherService: WhetherService, // 是否顯示大分類 service
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => {
      this.organizationOptions = data;
    });
    this.regionCodeService.getRegionCodes().subscribe((data) => {
      this.regionOptions = data;
    });
    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.businessTypeCodeOptions = data;
    });
    this.whetherService.getWhetherOptions().subscribe((data) => {
      this.whetherOptions = data;
    });

    // Initialize radio button behavior for location selection
    this.queryForm.controls.locationRadio.valueChanges.subscribe(value => {
      // Reset and disable all fields
      this.queryForm.controls.organizationCode.disable();
      this.queryForm.controls.regionCode.disable();
      this.queryForm.controls.floorCode.disable();
      this.queryForm.controls.businessTypeCode.disable();
      this.queryForm.controls.organizationCode.reset();
      this.queryForm.controls.regionCode.reset();
      this.queryForm.controls.floorCode.reset();
      this.queryForm.controls.businessTypeCode.reset();

      // Enable the selected field(s)
      if (value === 'organizationCode') {
        this.queryForm.controls.organizationCode.enable();
      } else if (value === 'regionOrFloor') {
        this.queryForm.controls.regionCode.enable();
        this.queryForm.controls.floorCode.enable();
      } else if (value === 'businessTypeCode') {
        this.queryForm.controls.businessTypeCode.enable();
      }
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
