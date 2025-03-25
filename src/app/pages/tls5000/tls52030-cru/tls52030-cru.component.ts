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
import { UserCodeService } from './../../../service/basic/user-code.service';
import { VendorService } from './../../../service/basic/vendor.service';
import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';

// 2.5.2.3  進貨驗收作業CRU
@Component({
  selector: 'app-tls52030-cru',
  templateUrl: './tls52030-cru.component.html',
  styleUrl: './tls52030-cru.component.scss'
})
export class TLS52030CRUComponent extends BasicCrupageComponent implements OnInit{
  storageOptions:any[] = [];
  vendorIDOptions:any[] = [];
  applicantOptions:any[] = [];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    incomeOrder: [, [this.validationService.numberValidator]], // 進貨驗收單號
    storage: [, [Validators.required]], // 倉別
    vendorID: [, [Validators.required]], // 廠商編號
    purchasePrice: [, [this.validationService.numberValidator]], // 進貨驗收金額
    tax: [0, [this.validationService.numberValidator]], // 稅額
    totalPrice: [0, [this.validationService.numberValidator]], // 合計金額
    totalSales: [0, [this.validationService.numberValidator]], // 售價總計
    remark: [, ], // 進貨驗收單說明
    //
    applicant: [, [Validators.required]], // 申請人
    applicantdate: [, [Validators.required]], // 申請日期
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
    private vendorService: VendorService,
    private userCodeService: UserCodeService,
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '250016';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => {
      this.storageOptions = data;
    });
    // ----------------------------------------------------------------
    this.vendorService.getVendors().subscribe(data => {
      this.vendorIDOptions = data;
    });
    // ----------------------------------------------------------------
    this.userCodeService.getUserCode().subscribe(data => {
      this.applicantOptions = data;
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
      itemNumber: [, [Validators.maxLength(20), ]], // 商品管理編號/名稱
      internationalBarcode: [, [Validators.maxLength(20), ]], // 國際條碼
      shouldCheckNumber: [, [this.validationService.numberValidator]], // 應驗數量
      checkNumber: [, [this.validationService.numberValidator]], // 驗收數量
      itemUnit: ['', [Validators.maxLength(14)]], // 商品單位
      purchaseSinglePrice: [, [this.validationService.numberValidator]], // 採購單價
      checkSinglePrice: [, [this.validationService.numberValidator]], // 驗收單價
      taxType: ['', [Validators.maxLength(20)]], // 稅別
      noTaxPrice: [, [this.validationService.numberValidator]], // 未稅金額
      salesPrice: [, [this.validationService.numberValidator]], // 售價
      totalSalesPrice: [, [this.validationService.numberValidator]], // 售價小計
      purchaseOrderNumber: [, [this.validationService.numberValidator]], // 採購單編號
      remark: [, ], // 單項備註
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
    this.router.navigate(['/TLS5000/TLS52030']);
  }
  //-------------------------------------------------------------------------------------------------------------
}
