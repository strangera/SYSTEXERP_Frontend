import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';

import { FloorService } from '../../../service/basic/floor.service';
import { RegionCodeService } from './../../../service/basic/region-code.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { TypeService } from './../../../service/basic/type.service';
import { TaxableService } from './../../../service/basic/taxable.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';

@Component({
  selector: 'app-tls31040',
  templateUrl: './tls31040.component.html',
  styleUrl: './tls31040.component.scss'
})

export class TLS31040Component {

    // 程式編號
    ProgNo: string = '230004';
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
    radiolist: [1, []], // 條件篩選, radioButton
    floor: [],  // 樓層
    region:[], //區域
    tax:[], //稅別
    type: [],
    organizationCode: [],  // 專櫃編號
    businessTypeCode: [],  // 業種
    commissionType: [], // 抽成方式
    onedatedd:[],
    onedateyy:[],
    weeks:[],
    radio1:[],
    onedatemm:[],
    halfyear:[],
    startdate:[],enddate:[],
    EventID:[],
    counterCode: [],  // 專櫃編號
  });

  daterangeOptions: any[] = [
    { value: 1, label: '日營業報表' },
    { value: 2, label: '週營業報表' },
    { value: 3, label: '月營業報表' },
    { value: 4, label: '半年營業報表' },
    { value: 5, label: '年營業報表' },
    { value: 6, label: '區間營業報表' },
    { value: 7, label: '活動區間營業報表' },
  ];

  halfyearOptions: any[] = [
    { value: 1, label: '上半年' },
    { value: 2, label: '下半年' },
  ];

  EventIDOptions: any[] = [
    { value: 1, label: '活動1' },
    { value: 2, label: '活動2' },
  ];

  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  TypeOptions: any[] = [];
  counterCodeOptions: any[] = [];
  taxOptions: any[]=[];
  operationsOptions: any[] = [];
  selectedOption: string ='1'; // 預設選擇的欄位

  // 表格資料
  data: any[] = [];
  data2: any[] = [];
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
    { field: '14', header: '月營業目標', visible: true },
    { field: '15', header: '營業實績', visible: true },
    { field: '16', header: '完成率', visible: true },
  ];


  columns2: any[] = [
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
    private regionCodeService: RegionCodeService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private commissionTypeService: CommissionTypeService,
    private TypeService:TypeService,
    private TaxableService: TaxableService,
       private cooperationMethodService: CooperationMethodService,
    private counterCodeService: CounterCodeService,  // 專櫃編號
  ) {}


  ngOnInit(): void {


    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // Initialize dropdown options
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    this.regionCodeService.getRegionCodes().subscribe(data => {
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
