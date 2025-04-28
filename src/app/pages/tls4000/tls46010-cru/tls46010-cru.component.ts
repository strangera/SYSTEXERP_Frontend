import { ValidationService } from './../../../shared/service/validation.service';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';
//

// 2.4.6.1 網路位置設定 CRU
@Component({
  selector: 'app-tls46010-cru',
  templateUrl: './tls46010-cru.component.html',
  styleUrl: './tls46010-cru.component.scss'
})
export class TLS46010CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // POS10015 門市系統主機設定檔

    // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL
    SYS_StoreNo: ['001', [Validators.maxLength(10)]], // 門市店號 預設值為001
    SYS_SrvNo: [, [Validators.maxLength(8)]], // 主機編號
    SYS_SrvIP: [, [Validators.maxLength(40)]], // 主機IP
    SYS_SrvPort: [20, [Validators.maxLength(40)]], // 主機連接埠 預設值為20
    SYS_SrvStatus: ['A', [Validators.maxLength(2)]], // 主機狀態 A=啟用 C=停用 預設值為A
    SYS_SrvName: ['', [Validators.maxLength(40)]], // 主機名稱
    SYS_SrvUsrID: ['', [Validators.maxLength(20)]], // 主機登入帳號
    SYS_SrvUsrPwd: ['', [Validators.maxLength(20)]], // 主機登入密碼

    //
    SYS_SRVDDir: ['/MyPOSData/PosDown', [Validators.maxLength(60)]], // 後台系統下載目錄 預設值為/MyPOSData/PosDown
    SYS_SRVUDir: ['/MyPOSData/PosUp', [Validators.maxLength(60)]], // 後台系統上傳目錄 預設值為/MyPOSData/PosUp
    SYS_MyPOSDDir: ['/MyPOSData/MyPOSDown', [Validators.maxLength(60)]], // 傳輸程式下載目錄 預設值為/MyPOSData/MyPOSDown
    SYS_MyPOSUDir: ['/MyPOSData/MyPOSUp', [Validators.maxLength(60)]], // 傳輸程式上傳目錄 預設值為/MyPOSData/MyPOSUp
    SYS_SRVDDirClt: ['/MyPOSData/PosDown', [Validators.maxLength(60)]], // 前台系統下載目錄 預設值為/MyPOSData/PosDown
    SYS_SRVUDirClt: ['/MyPOSData/PosUp', [Validators.maxLength(60)]], // 前台系統上傳目錄 預設值為/MyPOSData/PosUp

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
  SYS_SrvStatus_Option: any[] = [
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
    this.ProgNo = '240019';
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

    // 禁止用戶編輯店號 SYS_StoreNo 欄位
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
    this.router.navigate(['/TLS4000/TLS46010']);
  }
}
