import { ValidationService } from './../../../shared/service/validation.service';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';

// 2.4.6.3  TOUCH功能按鈕開/關設定 CRU
@Component({
  selector: 'app-tls46030-cru',
  templateUrl: './tls46030-cru.component.html',
  styleUrl: './tls46030-cru.component.scss'
})
export class TLS46030CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // 先設定主檔再設定明細檔

    // POS1004M_鍵盤設定主檔
    ECR_KBType: ['', [Validators.required, Validators.maxLength(6)]], // 鍵盤型態
    USR_Level: ['', [Validators.required, Validators.maxLength(6)]], // 鍵盤權限等級
    ECR_KBDesc: [,], // 鍵盤備註
    //
    CRT_Date: [], // 建立日期
    CRT_USR_No: [, [Validators.maxLength(8)]], // 建立人員
    CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
    UPD_Date: [], // 變更日期
    UPD_USR_No: [, [Validators.maxLength(8)]], // 變更人員
    UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名

    // POS1004_鍵盤設定明細檔 (ECR_KBType、USR_Level 與主檔一致)
    KB_ScanCode: [, [Validators.required, Validators.maxLength(4)]], // 按鍵代碼 (Scan Code)
    KB_Func: [, [Validators.maxLength(4)]], // 功能代碼
    KB_Arg1: ['', [Validators.maxLength(20)]], // 參數(1)
    KB_Arg2: ['', [Validators.maxLength(20)]], // 參數(2)
    KB_Arg3: ['', [Validators.maxLength(20)]], // 參數(3)
    KB_Display1: ['', [Validators.maxLength(20)]], // 按鍵顯示(第一行)
    KB_Display2: ['', [Validators.maxLength(20)]], // 按鍵顯示(第二行)
    //
    KB_Font: ['', [Validators.required, Validators.maxLength(20)]], // 顯示字型
    KB_Size: [, [Validators.required, Validators.maxLength(6)]], // 顯示字型大小
    KB_Fonttyped: [[] as number[]], // 顯示字型(粗體/斜體/底線)
    KB_Style: ['', [Validators.required, Validators.maxLength(1)]], // 按鍵型狀
    KB_Switch: ['', [Validators.required, Validators.maxLength(1)]], // ON/OFF
    KB_Width: [, [Validators.required, Validators.minLength(2), Validators.maxLength(10)]], // 寬度
    KB_Height: [, [Validators.required, Validators.minLength(2), Validators.maxLength(10)]], // 高度
    KB_Merge: ['', [Validators.required, Validators.maxLength(4)]], // 合併鍵的 按鍵代碼
    KB_Color: ['', [Validators.maxLength(30)]], // 顏色
    KB_FontColor: ['', [Validators.maxLength(30)]], // 字型顏色
    // 下面這些和主檔應該是一致的
    // CRT_Date: [], // 建立日期
    // CRT_USR_No: ['', [Validators.maxLength(8)]], // 建立人員
    // CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
    // UPD_Date: [], // 變更日期
    // UPD_USR_No: ['', [Validators.maxLength(8)]], // 變更人員
    // UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  KB_Fonttyped_Options: any[] = [
    { value: '1', label: '粗體' },
    { value: '2', label: '斜體' },
    { value: '3', label: '底線' },
  ];
  KB_Switch_Options: any[] = [
    { value: '1', label: '啟用' },
    { value: '2', label: '不啟用' },
  ];
  Color_Options: any[] = [
    { value: '1', label: '紅色' },
    { value: '2', label: '黃色' },
    { value: '3', label: '綠色' },
  ];
  KB_Style_Options: any[] = [
    { value: '1', label: '方形' },
    { value: '2', label: '矩形' },
    { value: '3', label: '橢圓' },
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
    this.ProgNo = '240021';
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
    this.router.navigate(['/TLS4000/TLS46030']);
  }
}
