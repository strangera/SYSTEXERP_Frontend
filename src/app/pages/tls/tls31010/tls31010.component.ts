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
  selector: 'app-tls31010',
  templateUrl: './tls31010.component.html',
  styleUrl: './tls31010.component.scss'
})

export class TLS31010Component {

  // 程式編號
  ProgNo: string = '230001';
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
    counterCode: [],  // 專櫃編號
  });

  daterangeOptions: any[] = [
    { value: 1, label: '日營業報表' },
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


  // 表格資料
  data: any[] = [
    { 'BOTag': '9876', },
  ];
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

  headerRows: any[] = [
    [
      { field: '', header: '樓層名稱', visible: true, rowspan: 2, colspan: 1 },
      { field: '', header: '營業額', visible: true, rowspan: 1, colspan: 3 },
      { field: '', header: '營業佔比', visible: true, rowspan: 1, colspan: 2 },
      { field: '', header: '客單價', visible: true, rowspan: 1, colspan: 2 },
      { field: '', header: '營業坪效', visible: true, rowspan: 1, colspan: 2 },
      { field: '', header: '臨時櫃', visible: true, rowspan: 1, colspan: 3 },
      { field: '', header: '月累積', visible: true, rowspan: 1, colspan: 3 },
    ],
    [
      { field: 'floorName', header: '樓層名稱', visible: true },
      { field: 'BOTag', header: '營業目標', visible: true },
      { field: 'salesPerformance', header: '營業實績', visible: true },
      { field: 'achievementRate', header: '達成率', visible: true },
      { field: 'targetRatio', header: '營業目標佔比', visible: true },
      { field: 'performanceRatio', header: '營業實績佔比', visible: true },
      { field: 'transactionCount', header: '交易筆數', visible: true },
      { field: 'averageOrderValue', header: '客單價', visible: true },
      { field: 'area', header: '坪數', visible: true },
      { field: 'areaEfficiency', header: '坪效', visible: true },
      { field: 'salesPerformance', header: '營業實績', visible: true },
      { field: 'performanceRatio', header: '營業實績佔比', visible: true },
      { field: 'temporaryBoothRatio', header: '臨時櫃業績佔比', visible: true },
      { field: 'monthlyTarget', header: '月營業目標', visible: true },
      { field: 'monthlyPerformance', header: '營業實績', visible: true },
      { field: 'completionRate', header: '完成率', visible: true },
    ]
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
}
