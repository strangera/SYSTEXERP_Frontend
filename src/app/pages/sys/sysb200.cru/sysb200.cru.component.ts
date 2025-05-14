import { BankAccountCodeService } from './../../../service/basic/bank-account-code.service';
import { ApprovalStatusService } from './../../../service/basic/approval-status.service';
import { PaymentMethodService } from './../../../service/basic/payment-method.service';
import { PostageChargeService } from './../../../service/basic/postage-charge.service';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
//
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { MessageService } from 'primeng/api';
import { SYS1000Response } from '../../../shared/models/system/SYS1000';

@Component({
  selector: 'app-sysb200.cru',
  templateUrl: './sysb200.cru.component.html',
  styleUrl: './sysb200.cru.component.scss',
})
// 廠商基本資料維護作業 CRU
export class SYSB200CRUComponent
  extends BasicCrupageComponent
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [], // ID
    manufacturerID: ['', [Validators.required, Validators.maxLength(14)]], // 廠商編號
    manufacturerUID: [1, []], // 統一編號

    manufacturerCName: ['', [Validators.required, Validators.maxLength(60)]], // 廠商名稱(中文)
    manufacturerEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    manufacturerSName: ['', [Validators.maxLength(10)]], // 廠商簡稱

    postageCharge: [[] as number[], [Validators.required]], // 郵電費負擔

    registeredAddress: ['', [Validators.required, Validators.maxLength(100)]], // 公司登記地址
    mailingAddress: ['', [Validators.required, Validators.maxLength(100)]], // 發票地址
    registeredPhone: ['', [Validators.maxLength(15)]], // 公司登記電話
    companyFax: ['', [Validators.maxLength(15)]], // 公司傳真
    companyEmail: ['', [Validators.maxLength(60)]], // 公司電子郵件
    companyWebsite: ['', [Validators.maxLength(60)]], // 公司網址
    registeredEmail: ['', [Validators.maxLength(60)]], // 發票電子郵件
    // 聯絡人資料
    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
    // 付款資料
    // ----------------------------------------------------------------
    paynayMethod: [[] as number[], [Validators.required]], // 付款方式
    payBankCode: [[] as number[], [Validators.required]], // 廠商匯款銀行代號
    payBankID: ['', [Validators.required, Validators.maxLength(40)]], // 廠商銀行帳號
    payBankAccount: ['', [Validators.maxLength(64)]], // 廠商帳戶名稱
    payDay: [, [Validators.required]], // 付款期限(天數)
    ticketTitle: ['', [Validators.maxLength(20)]], // 票據抬頭

    approveState: [[] as number[], [Validators.required]], // 審核狀態
    remark: ['', [Validators.maxLength(160)]], // 備註
  });
  // ----------------------------------------------------------------
  postageChargeOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  approvalStatusOptions: any[] = [];
  payBankAccountOptions: any[] = [];
  manufacturerUIDOptions: any[] = [
    { value: 1, label: '統一編號' },
    { value: 2, label: '身份證字號' },
    { value: 3, label: '護照證號' },
  ];
  t111Options: SYS1000Response[] = [];
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    //
    private postageChargeService: PostageChargeService,
    private paymentMethodService: PaymentMethodService,
    private approvalStatusService: ApprovalStatusService,
    private bankAccountCodeService: BankAccountCodeService,
    //
    private messagehint: MessageService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '410002';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.postageChargeService.getSystemTypes().subscribe((data) => {
      this.postageChargeOptions = data;

      let postageChargeValues = this.postageChargeOptions.map(
        (system) => system.value,
      );
      this.dataForm.patchValue({
        postageCharge: postageChargeValues,
      });
    });
    //
    this.paymentMethodService.getSystemTypes().subscribe((data) => {
      this.paymentMethodOptions = data;

      let paymentMethodValues = this.paymentMethodOptions.map(
        (system) => system.value,
      );
      this.dataForm.patchValue({
        paynayMethod: paymentMethodValues,
      });
    });
    //
    this.approvalStatusService.getSystemTypes().subscribe((data) => {
      this.approvalStatusOptions = data;

      let paymentMethodValues = this.approvalStatusOptions.map(
        (system) => system.value,
      );
      this.dataForm.patchValue({
        approveState: paymentMethodValues,
      });
    });
    //
    this.bankAccountCodeService.getSystemTypes().subscribe((data) => {
      this.payBankAccountOptions = data;

      let bankCodeValues = this.payBankAccountOptions.map(
        (system) => system.value,
      );
      this.dataForm.patchValue({
        payBankCode: bankCodeValues,
      });
    });
    // ----------------------------------------------------------------
    // 從 sessionStorage 抓取資料
    const systemSettingString = sessionStorage.getItem('SYSTEMSetting');

    if (systemSettingString) {
      // 將 JSON 字串解析成 JavaScript 物件
      const systemSetting = JSON.parse(
        systemSettingString,
      ) as SYS1000Response[];
      // 篩選出 SYS_Type 為 'T111' 的項目
      this.t111Options = systemSetting.filter(
        (option) => option.SYS_Type === 'T111',
      );
    } else {
      this.t111Options = []; // 或者設定為空陣列
    }
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
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
  createItem(): FormGroup {
    return this.formBuilder.group({
      contactPerson: ['', [Validators.maxLength(12)]], // 聯絡人
      contactPersonTitle: ['', [Validators.maxLength(16)]], // 聯絡人職稱
      contactPersonUID: ['', [Validators.maxLength(10)]], // 聯絡人身份証字號
      contactPersonPhone: ['', [Validators.maxLength(15)]], // 聯絡人電話
      contactAddress: ['', [Validators.maxLength(100)]], // 聯絡人聯絡地址
      contactEmail: ['', [Validators.maxLength(60)]], // 聯絡人電子郵件
    });
  }
  isRead(): boolean {
    return this.crudstatus !== CRUDStatus.Read;
  }
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }
  onAddItem(): void {
    this.items.push(this.createItem());
  }
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('success_message'),
          );
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('updated-successfully'),
          );
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  } //CRU

  onCancel() {
    this.router.navigate(['/SYSB000/SYSB200']);
  }

  demoShowUp() {
    this.messagehint.add({
      severity: 'success',
      summary: '同公司登記地址',
      detail: '測試',
    });
  }
}
