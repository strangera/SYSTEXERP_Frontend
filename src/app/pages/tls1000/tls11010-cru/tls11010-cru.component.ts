import { UsageService } from './../../../service/basic/usage.service';
import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { RegionCodeService } from './../../../service/basic/region-code.service';
import { FloorService } from './../../../service/basic/floor.service';
// --Commonly used imports--
import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
import { NavigationExtras, Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { UserStatusService } from '../../../service/basic/user-status.service';
//
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

@Component({
  selector: 'app-tls11010-cru',
  templateUrl: './tls11010-cru.component.html',
  styleUrl: './tls11010-cru.component.scss'
})
// 2.1.1.1 專櫃位置資料維護 CRU
export class TLS11010CRUComponent extends BasicCrupageComponent implements OnInit{
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // POS2002_店位基本資料檔

    // id                  numeric(19,0) identity(1,1) not null,

    LOCATION_No: ['', [Validators.maxLength(10)]], // 店位代碼
    LOCATION_Name: ['', [Validators.maxLength(30)]], // 店位說明
    BUILDING_NO: [, [Validators.maxLength(2)]], // 館別(sys3800)
    FLOOR_NO: ['', [Validators.maxLength(2)]], // 樓層代碼(sys3900)
    AREA_NO: ['', [Validators.maxLength(2)]], // 區域代碼(sys3a00)
    GROSS_SPACE: ['', [Validators.maxLength(3), Validators.maxLength(7)]], // 毛坪(營業坪數)
    NET_SPACE: ['', [Validators.maxLength(3), Validators.maxLength(7)]], // 淨坪(簽約坪數)
    LOCATION_Status: [[] as number[]], // 使用狀態 0=空位 1=使用中 2=保留(不使用) 3=停用
    ORG_No: ['', [Validators.maxLength(6)]], // 組織代碼
    
    Location_Purpose: ['', [Validators.maxLength(2)]], // 用途別(SYS1000.T117)
    X_coordinate: [, [Validators.maxLength(10)]], // X座標
    Y_coordinate: [, [Validators.maxLength(10)]], // X座標
    Location_Remark: [,], // 備註

    // 以下可以不用顯示於查詢頁
    CRT_Date: [], // 建立日期
    CRT_USR_No: [, [Validators.maxLength(8)]], // 建立人員
    CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
    UPD_Date: [], // 變更日期
    UPD_USR_No: [, [Validators.maxLength(8)]], // 變更人員
    UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名
  });
  // ----------------------------------------------------------------

  floorOptions: any[] = [];
  RegionCodeOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  usageOptions: any[] = [];
  userStatusOptions: any[] = [];
  LOCATION_Status_Options: any[] = [
    { value: 0, label: '空位' },
    { value: 1, label: '使用中' },
    { value: 2, label: '保留(不使用)' },
    { value: 3, label: '停用' },
  ];
  BUILDING_NO_Options: any[] = [
    { value: 1, label: '1館' },
    { value: 2, label: '2館' },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private floorService: FloorService,
    private regionCodeService: RegionCodeService,
    private organizationNumberService: OrganizationNumberService,
    private usageService: UsageService,
    private userStatusService: UserStatusService,
    private translate: TranslateService,
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '210001';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    //
    this.regionCodeService.getRegionCodes().subscribe(data => {
      this.RegionCodeOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.OrganizationCodeOptions = data;
    });
    //
    this.usageService.getUsageCodes().subscribe(data => {
      this.usageOptions = data;
    });
    //
    this.userStatusService.getUserStatus().subscribe(data => {
      this.userStatusOptions = data;
    });
    // ----------------------------------------------------------------
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

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as unknown as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      // name: ['', [Validators.required, Validators.maxLength(14)]], // Input Text
      // CashRegisterType: ['1', Validators.required], // 收銀機型態
      // SalesDate: ['', Validators.required], // 銷售日期
      // CashRegisterCode: ['', Validators.required], // 收銀機代號
      // TransactionSerialNumber: ['', Validators.required], // 交易流水號
      // CounterNumber: ['', Validators.required], // 專櫃編號
      // TwoPartInvoiceNumberStart: ['', Validators.required], // 二聯發票號碼(起號)
      // TwoPartInvoiceNumberEnd: ['', Validators.required], // 二聯發票號碼(迄號)
      // TaxableAmount: ['', Validators.required], // 應稅金額
      // TaxFreeAmount: ['', Validators.required], // 免稅金額
    });
  }
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onSubmit(frm: FormGroup){
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid){
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }

  onCancel() {
    this.router.navigate(['/TLS1000/TLS11010']);
  }
}
