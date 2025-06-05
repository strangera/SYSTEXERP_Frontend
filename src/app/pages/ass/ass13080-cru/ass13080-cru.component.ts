import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { ItemCodeService } from '../../../service/basic/item-code.service';
import { SharedCodeService } from '../../../service/basic/shared-code.service';
import { AssetStatusService } from '../../../service/basic/asset-status.service';
import { AssetsTypeService } from '../../../service/basic/assets-type.service';
import { NeedPayTicketService } from '../../../service/basic/need-pay-ticket.service';

//3.1.3.8  資產變賣作業 CRU
@Component({
  selector: 'app-ass13080-cru',
  templateUrl: './ass13080-cru.component.html',
  styleUrl: './ass13080-cru.component.scss'
})
export class ASS13080CRUComponent extends BasicCrupageComponent implements OnInit {
  shareCodeOptions: any[] = [];
  assetsCodeOptions: any[] = [];
  assetsStatusOptions: any[] = [];
  userCodeOptions: any[] = [];
  organizationOptions: any[] = [];
  assetTypeOptions: any[] = [];
  accountingCodeOptions: any[] = [];
  supplierCodeOptions: any[] = [];
  alteredAmountOptions: any[] = [
    { value: 1, label: 'EV1505004' },
    { value: 2, label: 'EV1505002' },
  ];
  orderNumberOptions: any[] = [
    { value: 1, label: '201410300001' },
    { value: 2, label: '201410300002' },
    { value: 3, label: '201410300003' },
  ];


  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    //
    assetsCode: [, [Validators.required]], // 資產編號
    itemCode: [, [Validators.required, Validators.maxLength(13)]], // 品項編號／名稱
    assetStatus: [, [Validators.required]], // 資產狀態
    assetType: [, [Validators.required]], // 資產類型
    shareCode: [], // 攤提代號
    // 採購資訊
    orderNumber: [], // 採購單號
    purchaseDate: [], // 購入日期
    purchaseAmount: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 購入金額
    alteredAmount: [], // 異動金額
    supplierCode: [], // 供應商編號
    accountingCode_Borrow: [, [Validators.required]], // 會計科目(借)
    accountingCode_loan: [, [Validators.required]], // 會計科目(貸)
    entryDate: [, [Validators.required]], // 入帳日期
    deviceCode: [, Validators.maxLength(10)], // 設備編號
    // 折舊資訊
    accountingCode_Depreciation: [, [Validators.required]], // 折舊會計科目
    accountingCode_totalDepreciation: [, [Validators.required]], // 	累計折舊科目
    depreciationLife: [, [Validators.required, Validators.maxLength(8)]], // 折舊年限
    alteredLife: [, [Validators.required, Validators.maxLength(8)]], // 異動年限
    reservedAmount: [, [Validators.required, Validators.maxLength(8)]], // 預留殘值
    depreciationDue: [, [Validators.maxLength(8)]], // 折舊到期
    spreadMonth: [, [Validators.maxLength(8)]], // 已攤提月數
    spreadAmount: [, [Validators.maxLength(8)]], // 未攤提金額
    nonsSreadAmount: [, [Validators.maxLength(8)]], // 已攤提金額
    // 保管資訊
    keeper: [], // 保管人
    keeperUnit: [], // 保管單位
    user: [], // 使用人
    userUnit: [], // 使用單位
    loactionNumber: [, Validators.maxLength(10)], // 位置編號
    maintenanceCode: [, Validators.maxLength(11)], // 維修合約編號
    // 處分資訊
    scrapDate: [], // 變賣日期
    scrapManufacturers: [[Validators.required]], // 變賣廠商
    entryVoucherNumber: [], // 入帳傳票編號
    soldAmount: [, [Validators.required]], // 變賣金額(含稅)
    voucherRemark: [,], // 變賣說明
    // 其他
    assetsRemark: [,], // 資產註記
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
    //
    private sharedCodeService: SharedCodeService,
    private itemCodeService: ItemCodeService,
    private assetStatusService: AssetStatusService,
    private usercodeService: UserCodeService,
    private organizationNumberService: OrganizationNumberService,
    private assetsTypeService: AssetsTypeService,
    private needPayTicketService: NeedPayTicketService,
    private vendorService: VendorService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310023';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.sharedCodeService.getSharedCode().subscribe(data => {
      this.shareCodeOptions = data;
    });
    //
    this.itemCodeService.getSystemTypes().subscribe(data => {
      this.assetsCodeOptions = data;
    });
    //
    this.assetStatusService.getAssetStatus().subscribe(data => {
      this.assetsStatusOptions = data;
    });
    //
    this.usercodeService.getUserCode().subscribe(data => {
      this.userCodeOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationOptions = data;
    });
    //
    this.assetsTypeService.getAssetsTypes().subscribe(data => {
      this.assetTypeOptions = data;
    });
    //
    this.needPayTicketService.getNeedPayTickets().subscribe(data => {
      this.accountingCodeOptions = data;
    });
    //
    this.vendorService.getVendors().subscribe(data => {
      this.supplierCodeOptions = data;
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
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
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

    console.log(this.accordionTabCss);
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
      // services: ['', [Validators.required, Validators.maxLength(120)]], // 服務項目
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
  }//CRU

  onCancel() {
    this.router.navigate(['/ASS1000/ASS13080']);
  }
}
