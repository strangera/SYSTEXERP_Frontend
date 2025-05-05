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
  selector: 'app-tls31020',
  templateUrl: './tls31020.component.html',
  styleUrl: './tls31020.component.scss'
})

export class TLS31020Component {

  // 程式編號
  ProgNo: string = '230002';
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
    businessTypeCode: [],  // 業種
    commissionType: [], // 抽成方式
    onedatedd: [],
    onedateyy: [],
    weeks: [],
    radio1: [],
    onedatemm: [],
    halfyear: [],
    startdate: [], enddate: [],
    EventID: [],
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
  taxOptions: any[] = [];
  operationsOptions: any[] = [];
  selectedOption: string = '1'; // 預設選擇的欄位
  fileName = 'TableExport'; // 宣告 fileName 屬性
  // 表格資料
  data: any[] = [
    {
      "floorName": "B1",
      "BOTag": 17596000,
      "salesPerformance": 14112426,
      "achievementRate": "80.2%",
      "targetRatio": "22.7%",
      "performanceRatio": "20.7%",
      "transactionCount": 49118,
      "averageOrderValue": 287,
      "area": 1779.9,
      "areaEfficiency": 7929,
      "salesPerformanceTemp": 453605,
      "performanceRatioTemp": "3.2%",
      "temporaryBoothRatio": "18.2%"
    },
    {
      "floorName": "1F",
      "BOTag": 9709000,
      "salesPerformance": 8915524,
      "achievementRate": "91.8%",
      "targetRatio": "12.5%",
      "performanceRatio": "13.1%",
      "transactionCount": 9618,
      "averageOrderValue": 927,
      "area": 2618.03,
      "areaEfficiency": 3405,
      "salesPerformanceTemp": 32990,
      "performanceRatioTemp": "0.4%",
      "temporaryBoothRatio": "1.3%"
    },
    {
      "floorName": "2F",
      "BOTag": 9210000,
      "salesPerformance": 10659746,
      "achievementRate": "115.7%",
      "targetRatio": "11.9%",
      "performanceRatio": "15.6%",
      "transactionCount": 9420,
      "averageOrderValue": 1132,
      "area": 2707.56,
      "areaEfficiency": 3937,
      "salesPerformanceTemp": 509195,
      "performanceRatioTemp": "4.8%",
      "temporaryBoothRatio": "20.4%"
    },
    {
      "floorName": "3F",
      "BOTag": 17548800,
      "salesPerformance": 12307554,
      "achievementRate": "70.1%",
      "targetRatio": "22.6%",
      "performanceRatio": "18.0%",
      "transactionCount": 8241,
      "averageOrderValue": 1493,
      "area": 2215.1,
      "areaEfficiency": 5556,
      "salesPerformanceTemp": 27329,
      "performanceRatioTemp": "0.2%",
      "temporaryBoothRatio": "1.1%"
    },
    {
      "floorName": "4F",
      "BOTag": 9951000,
      "salesPerformance": 11108366,
      "achievementRate": "111.6%",
      "targetRatio": "12.8%",
      "performanceRatio": "16.3%",
      "transactionCount": 10769,
      "averageOrderValue": 1032,
      "area": 2097.9,
      "areaEfficiency": 5295,
      "salesPerformanceTemp": 1074942,
      "performanceRatioTemp": "9.7%",
      "temporaryBoothRatio": "43.1%"
    },
    {
      "floorName": "5F",
      "BOTag": 11092370,
      "salesPerformance": 9392435,
      "achievementRate": "84.7%",
      "targetRatio": "14.3%",
      "performanceRatio": "13.8%",
      "transactionCount": 14351,
      "averageOrderValue": 654,
      "area": 3594.1,
      "areaEfficiency": 2613,
      "salesPerformanceTemp": 0,
      "performanceRatioTemp": "0.0%",
      "temporaryBoothRatio": "0.0%"
    },
    {
      "floorName": "6F",
      "BOTag": 2467630,
      "salesPerformance": 1776299,
      "achievementRate": "72.0%",
      "targetRatio": "3.2%",
      "performanceRatio": "2.6%",
      "transactionCount": 4479,
      "averageOrderValue": 397,
      "area": 1444.7,
      "areaEfficiency": 1230,
      "salesPerformanceTemp": 398717,
      "performanceRatioTemp": "22.4%",
      "temporaryBoothRatio": "16.0%"
    }
  ];
  // data2: any[] = [];
  filteredData: any[] = [...this.data];
  // columns: any[] = [
  //   { field: 'floorName', header: '樓層名稱', visible: true },
  //   { field: 'BOTag', header: '營業目標', visible: true },
  //   { field: 'salesPerformance', header: '營業實績', visible: true },
  //   { field: 'achievementRate', header: '達成率', visible: true },
  //   { field: 'targetRatio', header: '營業目標佔比', visible: true },
  //   { field: 'performanceRatio', header: '營業實績佔比', visible: true },
  //   { field: 'transactionCount', header: '交易筆數', visible: true },
  //   { field: 'averageOrderValue', header: '客單價', visible: true },
  //   { field: 'area', header: '坪數', visible: true },
  //   { field: 'areaEfficiency', header: '坪效', visible: true },
  //   { field: 'salesPerformance', header: '營業實績', visible: true },
  //   { field: 'performanceRatio', header: '營業實績佔比', visible: true },
  //   { field: 'temporaryBoothRatio', header: '臨時櫃業績佔比', visible: true },
  //   { field: 'monthlyTarget', header: '月營業目標', visible: true },
  //   { field: 'monthlyPerformance', header: '營業實績', visible: true },
  //   { field: 'completionRate', header: '完成率', visible: true },
  // ];


  // columns2: any[] = [
  //   { field: '1', header: '樓層名稱', visible: true },
  //   { field: '2', header: '營業目標', visible: true },
  //   { field: '3', header: '營業實績', visible: true },
  //   { field: '4', header: '達成率', visible: true },
  //   { field: '5', header: '營業目標佔比', visible: true },
  //   { field: '6', header: '營業實績佔比', visible: true },
  //   { field: '7', header: '交易筆數', visible: true },
  //   { field: '8', header: '客單價', visible: true },
  //   { field: '9', header: '坪數', visible: true },
  //   { field: '10', header: '坪效', visible: true },
  //   { field: '11', header: '營業實績', visible: true },
  //   { field: '12', header: '營業實績佔比', visible: true },
  //   { field: '13', header: '臨時櫃業績佔比', visible: true },
  // ];

  headerRow1: any[] = [
    [
      { field: '', header: '樓層名稱', visible: true, rowspan: 1, colspan: 1 },
      { field: '', header: '營業額', visible: true, rowspan: 1, colspan: 3 },
      { field: '', header: '營業佔比', visible: true, rowspan: 1, colspan: 2 },
      { field: '', header: '客單價', visible: true, rowspan: 1, colspan: 2 },
      { field: '', header: '營業坪效', visible: true, rowspan: 1, colspan: 2 },
      { field: '', header: '臨時櫃', visible: true, rowspan: 1, colspan: 3 },
      { field: '', header: '月累積', visible: true, rowspan: 1, colspan: 3 },
    ],
    // [
    //   { field: 'floorName', header: '樓層名稱', visible: true },
    //   { field: 'BOTag', header: '營業目標', visible: true },
    //   { field: 'salesPerformance', header: '營業實績', visible: true },
    //   { field: 'achievementRate', header: '達成率', visible: true },
    //   { field: 'targetRatio', header: '營業目標佔比', visible: true },
    //   { field: 'performanceRatio', header: '營業實績佔比', visible: true },
    //   { field: 'transactionCount', header: '交易筆數', visible: true },
    //   { field: 'averageOrderValue', header: '客單價', visible: true },
    //   { field: 'area', header: '坪數', visible: true },
    //   { field: 'areaEfficiency', header: '坪效', visible: true },
    //   { field: 'salesPerformance', header: '營業實績', visible: true },
    //   { field: 'performanceRatio', header: '營業實績佔比', visible: true },
    //   { field: 'temporaryBoothRatio', header: '臨時櫃業績佔比', visible: true },
    //   { field: 'monthlyTarget', header: '月營業目標', visible: true },
    //   { field: 'monthlyPerformance', header: '營業實績', visible: true },
    //   { field: 'completionRate', header: '完成率', visible: true },
    // ]
  ];

  // headerRow1: any[] = [
  //   { field: '', header: '樓層名稱', visible: true, rowspan: 2, colspan: 1 },
  //   { field: '', header: '營業額', visible: true, rowspan: 1, colspan: 3 },
  //   { field: '', header: '營業佔比', visible: true, rowspan: 1, colspan: 2 },
  //   { field: '', header: '客單價', visible: true, rowspan: 1, colspan: 2 },
  //   { field: '', header: '營業坪效', visible: true, rowspan: 1, colspan: 2 },
  //   { field: '', header: '臨時櫃', visible: true, rowspan: 1, colspan: 3 },
  //   { field: '', header: '月累積', visible: true, rowspan: 1, colspan: 3 },
  // ];

  headerRow2: any[] = [
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
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.query) as boolean;
  }

  canAdd(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.add) as boolean;
  }

  canEdit(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.edit) as boolean;
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
