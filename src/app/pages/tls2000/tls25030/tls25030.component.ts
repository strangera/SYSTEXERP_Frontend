import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/service/notification.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { ViolationCategoryService } from '../../../service/basic/violation-category.service';
import { FloorService } from '../../../service/basic/floor.service';
import { ViolationStatusService } from '../../../service/basic/violation-status.service';
import { DeductionItemService } from '../../../service/basic/deduction-item.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';


const now = new Date();

@Component({
  selector: 'app-tls25030',
  templateUrl: './tls25030.component.html',
  styleUrls: ['./tls25030.component.scss']
})
export class TLS25030Component {

  ProgNo: string = '220034';

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
    counterCode: [],  // 專櫃編號
    counterName: [],  // 專櫃名稱
    violationCategory: [],  // 違規類別編號
    deductionItem: [],  // 扣款項目
    amountStart: [],  // 金額開始
    amountEnd: [],  // 金額結束
    deductionDateStart: [],  // 扣款日期起
    deductionDateEnd: [],  // 扣款日期迄
    violationDateStart: [],  // 違規日期起
    violationDateEnd: [],  // 違規日期迄
    documentNumber: [],  // 單據編號
    issuingUnit: [],  // 開立單位
    createdBy: [],  // 建立者(輸入代號)
    floor: [],  // 樓層
    maintenanceDate: [],  // 維護日
    status: [],  // 狀態
  });

  // 下拉選單選項
  counterCodeOptions: any[] = [];
  violationCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  statusOptions: any[] = [];
  deductionItemOptions: any[] = [];
  organizationNumberOptions: any[] = [];

  // 表格資料
  data: any[] = [
    {  'documentNumber': '2405080001', 'counterNumber': '000231', 
      'isdelete': true, 'counterName': 'NIKE', 
      'deductionDate': '2024/05/08', 'violationCategoryCode': 'F',
      'deductionItem': '01', 
      'amount': '200 	', 'issuingUnit': '101700 / 品牌代理小組(停用)',
      'violationDateStart': '2024/05/08', 'creator': 'xcom', 
    'maintenanceDate': '2024/5/8', 'status': '建立', 
  'remarks': 'test' },

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'documentNumber', header: '單據號碼', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'counterName', header: '專櫃名稱', visible: true },
    { field: 'deductionDate', header: '扣款日期', visible: true },
    { field: 'violationCategoryCode', header: '違規類別編號', visible: true },
    { field: 'deductionItem', header: '扣款項目', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'issuingUnit', header: '開立單位', visible: true },
    { field: 'violationDateStart', header: '達規日期', visible: true },
    { field: 'creator', header: '建立者', visible: true },
    { field: 'maintenanceDate', header: '維護日', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'remarks', header: '備註', visible: true },
  ];
  

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private counterCodeService: CounterCodeService,  // 專櫃編號 service
    private violationCategoryService: ViolationCategoryService,  // 違規類別編號 service
    private floorService: FloorService,  // 樓層 service
    private violationStatusService: ViolationStatusService,  // 狀態 service
    private deductionItemService: DeductionItemService,  // 扣款項目 service
    private OrganizationNumberService:OrganizationNumberService
  ) {}

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterCodeOptions = data;
    });

    this.violationCategoryService.getViolationCategories().subscribe((data) => {
      this.violationCategoryOptions = data;
    });

    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });

    this.violationStatusService.getViolationStatuses().subscribe((data) => {
      this.statusOptions = data;
    });

    this.deductionItemService.getDeductionItems().subscribe((data) => {
      this.deductionItemOptions = data;
    });
    this.OrganizationNumberService.getOrganizationNumbers().subscribe((data) => {
      this.organizationNumberOptions = data;
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
          crudstatus: 'Create',
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS25030CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      const editData = {
        documentNumber: data.documentNumber,
        counterCode: data.counterCode,
        counterName: data.counterName,
        deductionDate: data.deductionDate,
        violationCategoryCode: data.violationCategoryCode,
        deductionItem: data.deductionItem,
        amount: data.amount,
        issuingUnit: data.issuingUnit,
        violationDateStart: data.violationDateStart,
        creator: data.creator,
        maintenanceDate: data.maintenanceDate,
        status: data.status,
        remarks:data.remarks




      };
      sessionStorage.setItem('editData', JSON.stringify(editData));

      sessionStorage.setItem('counterCodeOptions', JSON.stringify(this.counterCodeOptions));
      sessionStorage.setItem('violationCategoryOptions', JSON.stringify(this.violationCategoryOptions));
      sessionStorage.setItem('floorOptions', JSON.stringify(this.floorOptions));
      sessionStorage.setItem('statusOptions', JSON.stringify(this.statusOptions));
      sessionStorage.setItem('deductionItemOptions', JSON.stringify(this.deductionItemOptions));
      sessionStorage.setItem('organizationNumberOptions', JSON.stringify(this.organizationNumberOptions));

      const extras: NavigationExtras = { state: { crudstatus: CRUDStatus.Edit }, skipLocationChange: true };
      this.router.navigate(['TLS2000/TLS25030MOD'], extras);
    }
  }
  
  onDetail(data: any) {
    // Store data in session storage
    sessionStorage.setItem('detailData', JSON.stringify(data));
    sessionStorage.setItem('queryFormData', JSON.stringify(this.queryForm.value));
    
    let extras: NavigationExtras = {
      state: {
        crudstatus: 'Read'
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}