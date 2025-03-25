import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ValidationService } from '../../../shared/service/validation.service';
//
import { VendorService } from './../../../service/basic/vendor.service';
import { BrandCodeService } from './../../../service/basic/brand-code.service';
import { ManagementIDService } from './../../../service/basic/management-id.service';
import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';

// 2.5.2.1  採購單維護作業 CRU
@Component({
  selector: 'app-tls52010-cru',
  templateUrl: './tls52010-cru.component.html',
  styleUrl: './tls52010-cru.component.scss'
})
export class TLS52010CRUComponent extends BasicCrupageComponent implements OnInit{
  storageOptions:any[] = [];
  managementIDOptions:any[] = [];
  brandIDOptions:any[] = [];
  vendorIDOptions:any[] = [];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    purchaseOrder: [, [this.validationService.numberValidator]], // 採購單號
    storage: [, [Validators.required]], // 倉別
    brandID: [, [Validators.required]], // 品牌編號
    vendorID: [, [Validators.required]], // 廠商編號
    applicant: [''], // 申請人
    applicantdate: [], // 申請日期
    cost: [0, [this.validationService.numberValidator]], // 採購金額
    tax: [0, [this.validationService.numberValidator]], // 稅額
    totalCost: [0, [this.validationService.numberValidator]], // 合計金額
    totalSales: [0, [this.validationService.numberValidator]], // 售價總計
    editortext: [, ], // 採購單說明
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
    private bigCategoryCodeService: BigCategoryCodeService,
    private managementIDService: ManagementIDService,
    private brandCodeService: BrandCodeService,
    private vendorService: VendorService,
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '250014';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => {
      this.storageOptions = data;
    });
    // ----------------------------------------------------------------
    this.managementIDService.getSystemTypes().subscribe(data => {
      this.managementIDOptions = data;
    });
    // ----------------------------------------------------------------
    this.brandCodeService.getSystemTypes().subscribe(data => {
      this.brandIDOptions = data;
    });
    // ----------------------------------------------------------------
    this.vendorService.getVendors().subscribe(data => {
      this.vendorIDOptions = data;
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
      managementID: [], // 商品管理編號/名稱
      internationalBarcode: [''], // 國際條碼
      unit: [''], // 商品單位
      packageNumber: [], // 包裝入數
      taxType: [''], // 稅別
      amount: [, [Validators.required, Validators.maxLength(9)]], // 數量
      unitPrice: [, [Validators.maxLength(9)]], // 單價
      subtotal: [, [Validators.maxLength(9)]], // 小計
      sellingPrice: [, [Validators.maxLength(9)]], // 售價
      sellingPriceSubtotal: [, [Validators.maxLength(9)]], // 售價小計
      singleRemark: [''], // 單項備註
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
    this.router.navigate(['/TLS5000/TLS52010']);
  }
  //-------------------------------------------------------------------------------------------------------------
}
