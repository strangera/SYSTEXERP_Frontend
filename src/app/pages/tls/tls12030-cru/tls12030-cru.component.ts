import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ValidationService } from '../../../shared/service/validation.service';
//
import { WillingnessLevelService } from './../../../service/basic/willingness-level.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { BusinessTypeService } from '../../../service/basic/businesstype.service';
import { FloorService } from './../../../service/basic/floor.service';
import { RegionService } from './../../../service/basic/region-code.service';
import { LocationService } from './../../../service/basic/location.service';
import { BusinessTypeCodeService } from './../../../service/basic/business-type-code-service.service';
import { VendorService } from './../../../service/basic/vendor.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
    selector: 'app-tls12030-cru',
    templateUrl: './tls12030-cru.component.html',
    styleUrl: './tls12030-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, DropdownComponent, CalendarComponent, EditorTextComponent, NgFor, ButtonDynamicallydeleteComponent, ButtonDynamicallyaddComponent, ButtonComponent, NgIf, TranslateModule]
})

// 2.1.2.3 專櫃意向書維護CRU
export class TLS12030CRUComponent extends BasicCrupageComponent implements OnInit {
  vendorUIDOptions: any[] = [];
  negotiatorOptions: any[] = [];
  industryCodeOptions: any[] = [];
  locationNumberOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  contractStatusOptions: any[] = [];
  businessTypeOptions: any[] = [];
  cooperateOptions: any[] = [{ value: 1, label: '專櫃' }];
  willingnessLevelOptions: any[] = [];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    recruitmentNumber: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 專櫃招募編號
    brandName: ['', [Validators.required, Validators.maxLength(50)]], // 品牌(櫃位名稱)
    vendorUID: [[] as number[], [Validators.required]], // 廠商統一編號
    versionNumber: [, [this.validationService.numberValidator, Validators.maxLength(10)]], // 版本編號
    negotiator: [[] as number[],], // 洽談者
    industryCode: [[] as number[],], // 大分類
    negotiationDate: [,], // 洽談日期
    businessType: [[] as number[],], // 營業型態

    replyDate: [,], // 回函日期
    replyEndDate: [,], // 回函截止日
    contractStartDate: [,], // 合約起始日
    contractEndDate: [,], // 合約截止日

    cooperationMethod: [, [Validators.required]], // 配合方式
    willingnessLevel: [, [Validators.required]], // 意願等級
    margin: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 履約保證金
    remark: [,], // 備註
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,

    //----constructor replace---
    private vendorService: VendorService,
    private userCodeService: UserCodeService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private locationService: LocationService,
    private RegionService: RegionService,
    private floorService: FloorService,
    private businessTypeService: BusinessTypeService,
    private willingnessLevelService: WillingnessLevelService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '210005';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.vendorService.getVendors().subscribe(data => {
      this.vendorUIDOptions = data;
    });
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.negotiatorOptions = data;
    });
    //
    this.locationService.getLocations().subscribe(data => {
      this.locationNumberOptions = data;
    });
    //
    this.RegionService.getRegionOptions().subscribe(data => {
      this.regionOptions = data;
    });
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    //
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe(data => {
      this.industryCodeOptions = data;
    });
    //
    this.businessTypeService.getBusinessTypes().subscribe(data => {
      this.businessTypeOptions = data;
    });
    //
    this.willingnessLevelService.getSystemTypes().subscribe(data => {
      this.willingnessLevelOptions = data;
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
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      locationNumber: [[] as number[]], // 位置編號
      region: [[] as number[]], // 樓層
      floor: [[] as number[]], // 區域
      squareMeters: ['', [Validators.maxLength(5)]], // 營業坪數
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

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
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
    this.router.navigate(['/TLS1000/TLS12030']);
  }
  //-------------------------------------------------------------------------------------------------------------
}
