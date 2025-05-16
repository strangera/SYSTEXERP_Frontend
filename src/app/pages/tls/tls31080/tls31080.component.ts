import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';

import { FloorService } from '../../../service/basic/floor.service';
import { RegionService } from './../../../service/basic/region-code.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { TypeService } from './../../../service/basic/type.service';
import { TaxableService } from './../../../service/basic/taxable.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';

@Component({
  selector: 'app-tls31080',
  templateUrl: './tls31080.component.html',
  styleUrl: './tls31080.component.scss'
})

export class TLS31080Component {

  // 程式編號
  ProgNo: string = '230008';
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
    radiolist: [1, []], // 條件篩選, radioButton
    floor: [],  // 樓層
    region: [], //區域
    tax: [], //稅別
    type: [],
    organizationCode: [],  // 專櫃編號
    businessTypeCode: [],  // 大分類
    commissionType: [], // 抽成方式
    onedatedd: [],
    onedateyy: [],
    radio1: [],
    onedatemm: [],
    startdatetime: [], enddatetime: [],
    counterCode: [],  // 專櫃編號
  });

  daterangeOptions: any[] = [
    { value: 1, label: '全時段顯示' },
    { value: 2, label: '交易時間' },

  ];



  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  TypeOptions: any[] = [];
  counterCodeOptions: any[] = [];
  taxOptions: any[] = [];
  operationsOptions: any[] = [];
  selectedOption: string = '1'; // 預設選擇的欄位

  // 表格資料
  data: any[] = [];

  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: '1', header: '樓層名稱', visible: true },
    { field: '2', header: '營業目標', visible: true },
    { field: '3', header: '營業實績', visible: true },
    { field: '4', header: '達成率', visible: true },
    { field: '5', header: '營業目標佔比', visible: true },
    { field: '6', header: '營業實績佔比', visible: true },
    { field: '7', header: '交易筆數', visible: true },
    { field: '8', header: '客單價', visible: true },
    { field: '9', header: '坪數', visible: true },
    { field: '10', header: '坪效', visible: true },
    { field: '11', header: '營業實績', visible: true },
    { field: '12', header: '營業實績佔比', visible: true },
    { field: '13', header: '臨時櫃業績佔比', visible: true },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private floorService: FloorService,
    private RegionService: RegionService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private commissionTypeService: CommissionTypeService,
    private TypeService: TypeService,
    private TaxableService: TaxableService,
    private cooperationMethodService: CooperationMethodService,
    private counterCodeService: CounterCodeService,  // 專櫃編號
  ) { }


  ngOnInit(): void {


    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // Initialize dropdown options
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    this.RegionService.getRegionOptions().subscribe(data => {
      this.regionOptions = data;
    });
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => {
      this.organizationOptions = data;
    });
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.businessTypeCodeOptions = data;
    });
    this.commissionTypeService.getCommissionTypes().subscribe((data) => {
      this.commissionTypeOptions = data;
    });
    this.TypeService.getTypeOptions().subscribe(data => {
      this.TypeOptions = data;
    });
    this.cooperationMethodService.getCooperationMethods().subscribe(data => {
      this.operationsOptions = data;
    });
    this.TaxableService.getSystemTypes().subscribe(data => {
      this.taxOptions = data;
    });

    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterCodeOptions = data;
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
          queryform: this.queryForm
        },
        skipLocationChange: true
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


  onSystemTypeChange(selectedValue: any): void {
    this.selectedOption = selectedValue
  }
}
