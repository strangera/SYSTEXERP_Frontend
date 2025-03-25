import { ValidationService } from './../../../shared/service/validation.service';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';

// 2.4.1.2 收銀機EDC資料維護 CRU
@Component({
  selector: 'app-tls41020-cru',
  templateUrl: './tls41020-cru.component.html',
  styleUrl: './tls41020-cru.component.scss'
})
export class TLS41020CRUComponent extends BasicCrupageComponent implements OnInit{
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // POS1002EDC 收銀機EDC設定檔
    SYS_StoreNo: ['000', [Validators.required, Validators.maxLength(10)]], // 收銀機所屬門市店號
    ECR_No: [, [Validators.required, Validators.maxLength(6)]], // 收銀機號
    EDC_No: [, [Validators.required, Validators.maxLength(8)]], // 信用卡刷卡機代碼
    ECR_LocNo: [, [Validators.maxLength(10)]], // 收銀機位置 #JOIN POS1002
    EDC_BegDate: [,[Validators.required]], // 啟用日期
    EDC_EdnDate: [,[Validators.required]], // 停用日期
    EDC_Status: [, [Validators.required, Validators.maxLength(2)]], // 信用卡刷卡機狀態 A=啟用 C=停用
    ECR_TLT_No: [, [Validators.maxLength(20)]], // 機台所屬專櫃編號
    ECR_TLT_Name: ['', [Validators.maxLength(60)]], // 機台所屬專櫃名稱
    //
    EDC_IP1: [, [Validators.maxLength(20)]], // 第一台信用卡刷卡機IP
    EDC_IP2: [, [Validators.maxLength(20)]], // 第二台信用卡刷卡機IP
    EDC_IP3: [, [Validators.maxLength(20)]], // 第三台信用卡刷卡機IP
    EDC_TmID1: [, [Validators.maxLength(8)]], // 第一台信用卡刷卡機端末機代碼
    EDC_TmID2: [, [Validators.maxLength(8)]], // 第二台信用卡刷卡機端末機代碼
    EDC_TmID3: [, [Validators.maxLength(8)]], // 第三台信用卡刷卡機端末機代碼

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
  EDC_Status_Option: any[] = [
    { value: 'A', label: '啟用' },
    { value: 'C', label: '停用' },
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
    this.ProgNo = '240002';
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

    // 禁用 SYS_StoreNo 欄位
    this.dataForm.get('SYS_StoreNo')?.disable();

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
    this.router.navigate(['/TLS4000/TLS41020']);
  }
}
