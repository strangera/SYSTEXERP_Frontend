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
  selector: 'app-tls43010-cru',
  templateUrl: './tls43010-cru.component.html',
  styleUrl: './tls43010-cru.component.scss'
})
export class TLS43010CRUComponent extends BasicCrupageComponent implements OnInit{
  
  NOT_Status_Options:any[] = [
    { value: 0, label: '未審核' },
    { value: 1, label: '已審核' },
    { value: 2, label: '已刪除' },
  ];

  NOT_DtlLimit_Options:any[] = [
    { value: 0, label: '不限制' },
    { value: 1, label: '符合明細設定的機台才播放' },
    { value: 2, label: '不符合明細設定的機台才播放' },
  ];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // POS50011 廣告資訊設定檔
    // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL

    NOT_No: ['', [Validators.required, Validators.maxLength(20)]], // 通告編號
    NOT_Date: [ ,[Validators.required]], // 通告日期
    NOT_BegDate: [ ,[Validators.required]], // 有效開始日期時間
    NOT_EndDate: [ ,[Validators.required]], // 有效結束日期時間
    NOT_File: ['', [Validators.required, Validators.maxLength(200)]], // 媒體檔案名稱
    NOT_Status: [0,[Validators.required, Validators.maxLength(1)]], // 狀態 0=未確認(未審核) 1=已確認(已審核) 2=已刪除
    NOT_Priority: [0, [Validators.required, Validators.maxLength(1)]], // 優先順序，預設值為0(在同一段時間的優先順序9-0, 9最優先)

    NOT_Note: [ ,[Validators.maxLength(255)]], // 備註
    NOT_PlayTime: [30,[Validators.maxLength(6)]], // 媒體檔播放秒數，預設值為30
    NOT_DtlLimit: [0, [Validators.maxLength(1)]], // 是否限制播放條件，POS50012 0=不限制(預設值) 1=符合明細設定的機台才播放 2=不符合明細設定的機台才播放*

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
    this.ProgNo = '240009';
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
      // POS50012 廣告資訊設定明細檔(多筆)

      // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL
      // NOT_No: ['', [Validators.required, Validators.maxLength(20)]], // 通告編號
      // NOT_Date: [ ,[Validators.required]], // 通告日期

      NOT_SeqNo: [, [Validators.required, Validators.maxLength(6)]], // 通告序號
      NOT_Status: [0,[Validators.required, Validators.maxLength(1)]], // 狀態 0=未確認(未審核) 1=已確認(已審核) 2=已刪除

      ECR_No: ['', [Validators.maxLength(6)]], // 收銀機號 POS1002.ECR_No
      TLT_No: ['', [Validators.maxLength(8)]], // 專櫃編號
      ECR_Type: ['', [Validators.maxLength(2)]], // 機台類型 POS1002.ECR_Type
      ECR_GrpNo: ['', [Validators.maxLength(20)]], // 機台群組編號
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
    this.router.navigate(['/TLS4000/TLS43010']);
  }
}
