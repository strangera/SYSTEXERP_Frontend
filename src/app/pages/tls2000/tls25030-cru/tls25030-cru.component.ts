import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { Component, OnInit } from '@angular/core';
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
import { WhetherService } from '../../../service/basic/whether.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';

const now = new Date();

@Component({
  selector: 'app-tls25030-cru',
  templateUrl: './tls25030-cru.component.html',
  styleUrl: './tls25030-cru.component.scss'
})
export class TLS25030CRUComponent extends BasicCrupageComponent implements OnInit  {



  // 查詢表單
  loading: boolean = false;
  // submitted: boolean = false;
  dataForm = this.formBuilder.group({
    counterCode: [],  // 專櫃編號
    counterName: [],  // 專櫃名稱
    violationCategory: [],  // 違規類別編號
    deductionItem: [],  // 扣款項目
    amountStart: [],  // 金額開始
    amountEnd: [],  // 金額結束
    deductionDateStart: [now, [Validators.required]],  // 扣款日期起
    deductionDateEnd: [now, [Validators.required]],  // 扣款日期迄
    violationDateStart: [now, [Validators.required]],  // 違規日期起
    violationDateEnd: [now, [Validators.required]],  // 違規日期迄
    documentNumber: [],  // 單據編號
    issuingUnit: [],  // 開立單位
    createdBy: [],  // 建立者(輸入代號)
    floor: [],  // 樓層
    maintenanceDate: [now, [Validators.required]],  // 維護日
    status: [],  // 狀態
    whether: [],  // 狀態
    remark: [],
  });

  // 下拉選單選項
  counterCodeOptions: any[] = [];
  violationCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  statusOptions: any[] = [];
  deductionItemOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  whetherOptions: any[] = [];


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
    private OrganizationNumberService:OrganizationNumberService,
    private whetherService:WhetherService,
  ) {super();  // 呼叫父類建構子
    }

  ngOnInit(): void {

    this.ProgNo = '220034';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterCodeOptions = data;
    });

    this.violationCategoryService.getViolationCategories().subscribe((data) => {
      this.violationCategoryOptions = data;
    });

    this.whetherService.getWhetherOptions().subscribe((data) => {
      this.whetherOptions = data;
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
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }
  }
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }


  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }

  // canAdd(): boolean {
  //   return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  // }

  // canEdit(): boolean {
  //   return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
  // }

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

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Create',
          dataForm: this.dataForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS25030'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Edit',
          rowdata: data,
          dataForm: this.dataForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: 'Read',
        rowdata: data,
        dataForm: this.dataForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['TLS2000/TLS25030'], extras);
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }  
  
  onCancel() {
    this.router.navigate(['/demo/demoInputTable']);
  }
}
