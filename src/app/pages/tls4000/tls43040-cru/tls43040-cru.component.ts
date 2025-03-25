import { ValidationService } from './../../../shared/service/validation.service';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//

// 2.4.3.4 訊息群組維護作業 CRU
@Component({
  selector: 'app-tls43040-cru',
  templateUrl: './tls43040-cru.component.html',
  styleUrl: './tls43040-cru.component.scss'
})
export class TLS43040CRUComponent extends BasicCrupageComponent implements OnInit{

  ECR_DtlLimit_Options:any[] = [
    { value: 0, label: '不限制' },
    { value: 1, label: '符合明細設定的機台才列入群組' },
    { value: 2, label: '不符合明細設定的機台才列入群組' },
  ];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // POS1002GRM 收銀機群組主檔

    // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL
    ECR_GrpNo: ['自動填寫', [Validators.required, Validators.maxLength(20)]], // 機台群組編號
    ECR_GrpName: ['', [Validators.required, Validators.maxLength(64)]], // 機台群組名稱
    ECR_GrpDesc: ['', [Validators.maxLength(255)]], // 機台群組備註
    ECR_DtlLimit: [0, [Validators.maxLength(1)]], // 是否限制機台條件，POS1002GRD 0=不限制(預設) 1=符合明細設定的機台才列入群組 2=不符合明細設定的機台才列入群組

    // 以下可以不用顯示於查詢頁
    CRT_Date: [], // 建立日期
    CRT_USR_No: [, [Validators.maxLength(8)]], // 建立人員
    CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
    UPD_Date: [], // 變更日期
    UPD_USR_No: [, [Validators.maxLength(8)]], // 變更人員
    UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名
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
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '240012';
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
      // POS1002GRD 收銀機群組明細檔 (多筆)

      // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL
      // ECR_GrpNo: [, [Validators.maxLength(20)]], // 機台群組編號

      ECR_GrpSeqNo: ['自動填寫', [Validators.required, Validators.maxLength(6)]], // 機台群組序號

      ECR_No: ['', [Validators.maxLength(6)]], // 收銀機號 POS1002.ECR_No
      ECR_Type: ['', [Validators.maxLength(2)]], // 機台類型 POS1002.ECR_Type
      TLT_No: ['', [Validators.maxLength(8)]], // 專櫃編號
      
      BUILDING_No: ['', [Validators.maxLength(2)]], // 館別
      FLOOR_No: ['', [Validators.maxLength(2)]], // 樓層代碼
      AREA_No: ['', [Validators.maxLength(2)]], // 區域代碼

      // 以下可以不用顯示於查詢頁
      CRT_Date: [], // 建立日期
      CRT_USR_No: [, [Validators.maxLength(8)]], // 建立人員
      CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
      UPD_Date: [], // 變更日期
      UPD_USR_No: [, [Validators.maxLength(8)]], // 變更人員
      UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名
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
    this.router.navigate(['/TLS4000/TLS43040']);
  }
}
