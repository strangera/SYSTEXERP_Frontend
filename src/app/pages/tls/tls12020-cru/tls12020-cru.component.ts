import { FloorService } from './../../../service/basic/floor.service';
import { IndustryTypeService } from './../../../service/basic/industry-type.service';
import { LocationService } from '../../../service/basic/location.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { WillingnessLevelService } from './../../../service/basic/willingness-level.service';
import { UserCodeService } from './../../../service/basic/user-code.service';
// --Commonly used imports--
import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ValidationService } from '../../../shared/service/validation.service';

// 2.1.2.2 專櫃訪談記錄維護CRU
@Component({
  selector: 'app-tls12020-cru',
  templateUrl: './tls12020-cru.component.html',
  styleUrl: './tls12020-cru.component.scss'
})
export class TLS12020CRUComponent extends BasicCrupageComponent implements OnInit {
  positionNumberOptions: any[] = [];
  vendorUIDOptions: any[] = [];
  interviewerOptions: any[] = [];
  willingnessLevelOptions: any[] = [];
  industryCodeOptions: any[] = [];
  floorOptions: any[] = [];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    vendorUID: [, [Validators.required]], // 廠商統一編號
    vendorCName: ['', [Validators.required, Validators.maxLength(60)]], // 廠商名稱(中文)
    vendorEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    brand: ['', [Validators.maxLength(30)]], // 品牌
    industryCode: [], // 大分類
    contactPerson: ['', [Validators.required, Validators.maxLength(12)]], // 聯絡人

    oContactPhone: [, [Validators.required, Validators.maxLength(18)]], // 聯絡人電話(O)
    contactTitle: ['', [Validators.maxLength(20)]], // 聯絡人頭銜
    fContactPhone: ['', [Validators.maxLength(18)]], // 聯絡人電話(F)
    contactPhone: ['', [Validators.maxLength(15)]], // 聯絡人行動電話
    contactEmail: ['', [Validators.maxLength(60)]], // 聯絡人電子郵件
    companyAddress: ['', [Validators.maxLength(100)]], // 公司住址

    interviewDate: [, [Validators.required]], // 訪談日期
    interviewDate24: [, [Validators.required]], // 訪談時間(24H)
    willingnessLevel: [, [Validators.required]], // 意願等級
    floor: [], // 接洽樓層
    locationNumber: [, [Validators.maxLength(60)]], // 接洽位置編號

    negotiationPoints: [,], // 洽談重點及交換資料記錄
    remark: [,], // 備註
    interviewer: [, [Validators.required]], // 訪談人員
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
    private locationService: LocationService,
    private vendorService: VendorService,
    private userCodeService: UserCodeService,
    private willingnessLevelService: WillingnessLevelService,
    private industryTypeService: IndustryTypeService,
    private floorService: FloorService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '210004';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.locationService.getLocations().subscribe(data => {
      this.positionNumberOptions = data;
    });
    //
    this.vendorService.getVendors().subscribe(data => {
      this.vendorUIDOptions = data;
    });
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.interviewerOptions = data;
    });
    //
    this.willingnessLevelService.getSystemTypes().subscribe(data => {
      this.willingnessLevelOptions = data;
    });
    //
    this.industryTypeService.getSystemTypes().subscribe(data => {
      this.industryCodeOptions = data;
    });
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
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
    this.router.navigate(['/TLS1000/TLS12020']);
  }
  //-------------------------------------------------------------------------------------------------------------
}
