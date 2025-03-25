import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { PaymentMethodService } from '../../../service/basic/payment-method.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { UserCodeService } from '../../../service/basic/user-code.service';

//3.1.1.7 備用供應商資料維護作業 CRU
@Component({
  selector: 'app-ass11070-cru',
  templateUrl: './ass11070-cru.component.html',
  styleUrl: './ass11070-cru.component.scss'
})
export class ASS11070CRUComponent extends BasicCrupageComponent implements OnInit{
  receptionPersonOptions: any[] = [];
  vendorUIDOptions: any[] = [];
  bussinessOptions: any[] = [
    { value: 1, label: '工廠直銷' },
    { value: 2, label: '代理商' },
    { value: 3, label: '經銷商' },
    { value: 4, label: '零售連鎖' },
    { value: 5, label: '零售一般' },
  ];
  paymentMethodOptions:any[]=[];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    buildDate: [,[Validators.required]], // 建檔日期
    receptionPerson: [[] as number[],[Validators.required]], // 接洽人員
    vendorUID: [[] as number[],[Validators.required]], // 廠商統一編號
    bussinessModel: [1, []], // 營運模式
    vendorCName: ['', [Validators.required, Validators.maxLength(60)]], // 廠商名稱(中文)
    vendorEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    //
    contactPerson: ['', [Validators.required, Validators.maxLength(60)]], // 聯絡人
    contactPhone: [, [Validators.required, Validators.maxLength(15)]], // 聯絡人電話(O)
    contactTitle: ['', [Validators.maxLength(60)]], // 聯絡人職稱
    contactFax: [, [Validators.maxLength(60)]], // 聯絡人傳真
    contactCellphone: [, [Validators.maxLength(10)]], // 聯絡人行動電話
    contactEmail: ['', [Validators.required, Validators.maxLength(100)]], // 聯絡人電子郵件
    //
    companyAddress: ['', [Validators.required, Validators.maxLength(100)]], // 公司地址
    companyResponsibility: ['', [Validators.maxLength(60)]], // 公司負責人
    //
    paymentMethod: [1, []], // 付款方式
    startserialticket: [, [this.validationService.numberValidator]], // 票期
    endserialticket: [, [this.validationService.numberValidator]], // 票期
    //
    remark: [, ], // 備註
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
    private userCodeService: UserCodeService,
    private vendorService: VendorService,
    private paymentMethodService: PaymentMethodService,
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310007';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.receptionPersonOptions = data;
    });
    //
    this.vendorService.getVendors().subscribe(data => {
      this.vendorUIDOptions = data;
    });
    //
    this.paymentMethodService.getSystemTypes().subscribe(data => {
      this.paymentMethodOptions = data;
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
        this.accordionTabCss= 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss= 'edit-accordionTab';
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
      services: ['', [Validators.required, Validators.maxLength(120)]], // 服務項目
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
  }//CRU

  onCancel() {
    this.router.navigate(['/ASS1000/ASS11070']);
  }
  //----------------------------------------------------------------------------------------------------------------------------------
}
