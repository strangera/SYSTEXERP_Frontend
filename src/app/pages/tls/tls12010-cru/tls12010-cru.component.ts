import { ManagementMethodService } from './../../../service/basic/management-method.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
// --Commonly used imports--
import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';

// 2.1.2.1 潛在客戶資料維護CRU
@Component({
  selector: 'app-tls12010-cru',
  templateUrl: './tls12010-cru.component.html',
  styleUrl: './tls12010-cru.component.scss'
})
export class TLS12010CRUComponent extends BasicCrupageComponent implements OnInit {
  //
  contactPersonOptions: any[] = [];
  industryCodeOptions: any[] = [];
  businessStyleOptions: any[] = [];
  vendorUIDOptions: any[] = [
    { value: 1, label: '統編' },
    { value: 2, label: '身份証字號' },
    { value: 3, label: '員工ID' },
  ];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    onedatedd: [, [Validators.required]], // 建檔日期
    contactPerson: [[] as number[], [Validators.required]], // 接洽人員
    vendorUID: [1, [Validators.required]], // 廠商統一編號
    vendorCName: ['', [Validators.required, Validators.maxLength(60)]], // 廠商名稱(中文)
    vendorEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    brandCName: ['', [Validators.maxLength(30)]], // 品牌名稱(中文)
    brandEName: ['', [Validators.maxLength(30)]], // 品牌名稱(英文)
    industryCode: [[] as number[], [Validators.required]], // 大分類代號

    cPerson: ['', [Validators.required, Validators.maxLength(12)]], // 聯絡人
    cPhone: ['', [Validators.required, Validators.maxLength(60)]], // 聯絡人電話(O)
    cTitle: ['', [Validators.maxLength(20)]], // 聯絡人頭銜
    cFax: ['', [Validators.maxLength(60)]], // 聯絡人傳真
    cCellphone: ['', [Validators.maxLength(15)]], // 聯絡人行動電話
    cEmail: ['', [Validators.maxLength(60)]], // 聯絡人電子郵件

    companyAdress: ['', [Validators.maxLength(60)]], // 公司通訊地址
    companyResponsibility: ['', [Validators.maxLength(12)]], // 公司負責人
    businessStyle: [], // 經營方式
    requiredArea: [, [Validators.maxLength(8)]], // 需求面積
    origin: ['', [Validators.maxLength(20)]], // 商品出產地
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
    private userCodeService: UserCodeService,
    private vendorService: VendorService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private managementMethodService: ManagementMethodService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '210003';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.contactPersonOptions = data;
    });
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe(data => {
      this.industryCodeOptions = data;
    });
    //
    this.managementMethodService.getSystemTypes().subscribe(data => {
      this.businessStyleOptions = data;
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
      otherMall: ['', [Validators.maxLength(30)]], // 其他商場
      annualTurnover: ['', [Validators.maxLength(17)]], // 面積 / 年營業額
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
    this.router.navigate(['/TLS1000/TLS12010']);
  }
  //---------------------------------------------------------------------------------------------------------------
}
