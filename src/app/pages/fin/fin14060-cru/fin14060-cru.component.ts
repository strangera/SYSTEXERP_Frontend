import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { TaxTypeService } from '../../../service/basic/tax-type.service';
import { AllInvoiceCategoryService } from '../../../service/basic/all-invoice-category.service';
import { UsageTypeService } from '../../../service/basic/usage-type.service';
import { VendorService } from '../../../service/basic/vendor.service';

// 1.1.4.6 非二聯式收銀機發票調整作業 CRU
@Component({
  selector: 'app-fin14060-cru',
  templateUrl: './fin14060-cru.component.html',
  styleUrl: './fin14060-cru.component.scss'
})
export class FIN14060CRUComponent extends BasicCrupageComponent implements OnInit {
  //
  invoiceCategoryOptions: any[] = [];
  usageOptions: any[] = [];
  buyerUidOptions: any[] = [];
  taxTypeOptions: any[] = [];
  assetsRemrkOptions: any[] = [
    { value: 1, label: '固定資產' },
    { value: 2, label: '土地' },
  ];

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    invoiceCategory: [], // 發票類型
    usage: [], // 使用別

    wordTrack: ['', [Validators.required, Validators.maxLength(2)]], // 字軌
    invoiceNumber: [, [Validators.required, Validators.maxLength(8)]], // 發票號碼
    invoiceDate: [, [Validators.required]], // 發票日期
    buyerUid: [, [Validators.required]], // 買受人統一編號
    taxType: [, [Validators.required]], // 課稅別
    subpoena: [, [this.validationService.numberValidator, Validators.maxLength(11)]], // 傳票號碼
    assetsRemrk: [], // 資產註記
    invoiceTitle: ['', [Validators.maxLength(64)]], // 發票抬頭
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
    private allInvoiceCategoryService: AllInvoiceCategoryService,
    private usageTypeService: UsageTypeService,
    private vendorService: VendorService,
    private taxTypeService: TaxTypeService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110021';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.vendorService.getVendors().subscribe(data => {
      this.buyerUidOptions = data;
    });
    //
    this.allInvoiceCategoryService.getAllInvoiceCategorys().subscribe(data => {
      this.invoiceCategoryOptions = data;
    });
    //
    this.usageTypeService.getSystemTypes().subscribe(data => {
      this.usageOptions = data;
    });
    //
    this.taxTypeService.getTaxTypes().subscribe(data => {
      this.taxTypeOptions = data;
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
      itemName: ['', [Validators.maxLength(20)]], // 品項
      itemNumber: [, [Validators.maxLength(8)]], // 含稅金額(僅供參考)
      taxPrice: [, [Validators.maxLength(8)]], // 單價
      singlePrice: [, [Validators.maxLength(8)]], // 單價
      cash: [, [Validators.required, Validators.maxLength(8)]], // 銷售金額
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
    this.router.navigate(['/FIN1000/FIN14060']);
  }
  //--------------------------------------------------------------------------------------------------------------
}
