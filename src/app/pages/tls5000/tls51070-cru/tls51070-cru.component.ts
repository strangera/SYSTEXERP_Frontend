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
import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { TransportationMethodService } from '../../../service/basic/transportation-method.service';

// 2.5.1.7  商品基本資料 CRU
@Component({
  selector: 'app-tls51070-cru',
  templateUrl: './tls51070-cru.component.html',
  styleUrl: './tls51070-cru.component.scss'
})
export class TLS51070CRUComponent extends BasicCrupageComponent implements OnInit{
  venderIDOptions: any[] = [];
  storageOptions: any[] = [];
  transportationOptions: any[] = [];
  purchaseStatusOptions: any[] = [
    { value: 1, label: '正常採購' },
    { value: 2, label: '停止採購' },
  ];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    merchantID: [, [Validators.required, Validators.maxLength(32),this.validationService.numberValidator]], // 商品管理編號
    merchantCName: ['', [Validators.required, Validators.maxLength(32)]], // 商品中文名稱
    merchantEName: ['', [Validators.maxLength(100)]], // 商品英文名稱
    venderCode: [, [Validators.maxLength(30),this.validationService.numberValidator]], // 廠商貨號
    internationalCode: [, [Validators.required, Validators.maxLength(20),this.validationService.numberValidator]], // 國際條碼
    lCategory: [, [Validators.required]], // 大分類代碼
    mCategory: [, [Validators.required]], // 中分類代碼
    sCategory: [, [Validators.required]], // 小分類代碼
    illustrate: [, ], // 說明
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
    private transportationMethodService: TransportationMethodService,
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '250007';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => {
      this.storageOptions = data;
    });
    // ----------------------------------------------------------------
    this.vendorService.getVendors().subscribe(data => {
      this.venderIDOptions = data;
    });
    // ----------------------------------------------------------------
    this.transportationMethodService.getSystemTypes().subscribe(data => {
      this.transportationOptions = data;
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
      venderID: [], // 廠商編號/名稱
      transportation: [], // 運輸方式
      deliveryDays: [, [Validators.maxLength(3), ]], // 送貨天數
      purchaseStatus: [], // 採購狀態
      restockingPrice: [], // 最後進價
      restockingDate: [], // 最後進貨日
      remark: [''], // 單項備註
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
    this.router.navigate(['/TLS5000/TLS51070']);
  }
  //-------------------------------------------------------------------------------------------------------------
}
