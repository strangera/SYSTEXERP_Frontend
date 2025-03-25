import { ValidationService } from './../../../shared/service/validation.service';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

@Component({
  selector: 'app-sysbc00.cru',
  templateUrl: './sysbc00.cru.component.html',
  styleUrl: './sysbc00.cru.component.scss'
})
// 銀行基本資料維護作業 CRU
export class SYSBC00CRUComponent extends BasicCrupageComponent implements OnInit{
  CashRegisterTypeItems: any[] = [
    { label: '業主', value: '1' },
    { label: '非業主', value: '2' },
  ];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // APS1001 銀行主檔
    BNK_No: ['', [Validators.maxLength(5)]], // 金資中心銀行代碼
    BNK_Name: ['', [Validators.maxLength(60)]], // 銀行名稱
    BNK_ShortName: ['', [Validators.maxLength(10)]], // 銀行簡稱
    Min_Length: [, [this.validationService.numberValidator, Validators.max(99)]], // 該行帳號最小長度
    Max_Length: [, [this.validationService.numberValidator, Validators.max(99)]], // 該行帳號最大長度
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
    this.ProgNo = '410010';
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
      // APS1004 銀行分行代碼檔
      BNK_BranchNo: ['', [Validators.maxLength(3)]], // 銀行分行代號
      BNK_BranchName: ['', [Validators.maxLength(50)]], // 銀行分行名稱

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

    // 清空原本的 items 並重新填入分行資料
    this.items.clear();
    if (rowdata.children) {
      console.log('有分行資料');
      rowdata.children.forEach((branch: any) => {
        const branchForm = this.createItem();
        branchForm.patchValue(branch);
        this.items.push(branchForm);
      });
    }
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
    this.router.navigate(['/SYSB000/SYSBC00']);
  }
}
