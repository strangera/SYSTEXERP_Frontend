import { ValidationService } from './../../../shared/service/validation.service';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';

// 2.4.5.3 收銀機開關機時間表 CRU
@Component({
  selector: 'app-tls45030-cru',
  templateUrl: './tls45030-cru.component.html',
  styleUrl: './tls45030-cru.component.scss'
})
export class TLS45030CRUComponent extends BasicCrupageComponent implements OnInit{
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // POS7004_非銷售資料記錄檔
    
    SYS_StoreNo: [, [Validators.required, Validators.maxLength(10)]], // 收銀機所屬門市店號
    TXN_Date: [, [Validators.required]], // 交易日期
    ECR_No: [, [Validators.required, Validators.maxLength(6)]], // 收銀機號
    TXN_No: [, [Validators.required, Validators.maxLength(6)]], // 交易序號
    FNS_Class: [, [Validators.required, Validators.maxLength(2)]], // 班別

    FNS_DateTime: [, [Validators.required]], // 操作日期時間
    FNS_Op_Cod: [, [Validators.required, Validators.maxLength(8)]], // 收銀員編號
    FNS_Flag: [, [Validators.required]], // 方式 0=登入 1=開錢櫃 2=零用金 3=繳大鈔 4=關機清帳 5=授權 6=登出 8=變更密碼 9=開機

    FNS_Amount: [, [Validators.required, Validators.maxLength(8)]], // 金額，未輸入金額的操作則固定為零
    FNS_Data: ['', [Validators.maxLength(50)]], // 非銷售資料
    TLT_No: [, [Validators.maxLength(8)]], // 專櫃編號
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  FNS_Flag_Option: any[] = [
    { value: 0, label: '登入' },
    { value: 1, label: '開錢櫃' },
    { value: 2, label: '零用金' },
    { value: 3, label: '繳大鈔' },
    { value: 4, label: '關機清帳' },
    { value: 5, label: '授權' },
    { value: 6, label: '登出' },
    { value: 8, label: '變更密碼' },
    { value: 9, label: '開機' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private translate: TranslateService,
    //
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '240018';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
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
      // name: ['', [Validators.required, Validators.maxLength(14)]], // Input Text
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
    this.router.navigate(['/TLS4000/TLS45030']);
  }
}
