import { ValidationService } from './../../../shared/service/validation.service';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';

// 2.4.1.3 收銀專櫃人員資料維護作業 CRU
@Component({
  selector: 'app-tls41030-cru',
  templateUrl: './tls41030-cru.component.html',
  styleUrl: './tls41030-cru.component.scss'
})
export class TLS41030CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // POS2001 收銀員資料檔

    USR_No: [, [Validators.required, Validators.maxLength(8)]], // 收銀員編號
    USR_Name: ['', [Validators.required, Validators.maxLength(20)]], // 收銀員姓名
    USR_Passwd: ['', [Validators.required, Validators.maxLength(20)]], // 密碼
    USR_Level: ['XXXXXX', [Validators.required, Validators.maxLength(6)]], // 收銀鍵盤等級(編號)
    USR_Auth: [, [Validators.required, Validators.maxLength(6)]], // 收銀員授權等級

    USR_JobStatus: ['J', [Validators.required, Validators.maxLength(2)]], // 收銀員狀態 J=在職(預設) Q=離職
    USR_Class: ['R', [Validators.required, Validators.maxLength(2)]], // 收銀員等級 R=一般(預設) M=店長 S=系統管理者
    USR_RegType: [2, [Validators.required, Validators.maxLength(2)]], // 收銀員區分 2=獨立收銀(預設) 1=集中收銀

    USR_TLT_No: [, [Validators.maxLength(20)]], // 收銀員所屬櫃編
    USR_TLT_Name: ['', [Validators.maxLength(60)]], // 收銀員所屬櫃位名稱

    USR_OnJobDate: [], // 啟用日期
    USR_QuitDate: [], // 停用日期

    // USR_ID: ['', [Validators.maxLength(10)]], // 身份證字號
    // USR_Birth: [], // 生日
    // USR_TitleName: ['', [Validators.maxLength(20)]], // 職稱
    // USR_Tel: [, [Validators.maxLength(15)]], // 聯絡電話
    // USR_Addr: ['', [Validators.maxLength(80)]], // 聯絡地址
    // USR_BloodType: ['', [Validators.maxLength(2)]], // 血型
    // USR_EmerContact: ['', [Validators.maxLength(20)]], // 緊急聯絡人
    // USR_EmerContactRel: ['', [Validators.maxLength(10)]], // 關係
    // USR_ICE_No: ['', [Validators.maxLength(15)]], // 緊急聯絡電話

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
  USR_JobStatus_Options: any[] = [
    { value: 'J', label: '在職' },
    { value: 'Q', label: '離職' },
  ];
  USR_Class_Options: any[] = [
    { value: 'R', label: '一般' },
    { value: 'M', label: '店長' },
    { value: 'S', label: '系統管理者' },
  ];
  USR_RegType_Options: any[] = [
    { value: 2, label: '獨立收銀' },
    { value: 1, label: '集中收銀' },
  ];
  USR_TLT_No_Options: any[] = [
    { value: 0, label: 'store1' },
    { value: 1, label: 'store2' },
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
    this.ProgNo = '240003';
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
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
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

    // 禁用 USR_TLT_Name 欄位
    this.dataForm.get('USR_TLT_Name')?.disable();
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
    this.router.navigate(['/TLS4000/TLS41030']);
  }
}
