import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ValidationService } from '../../../shared/service/validation.service';
//

// 2.4.1.5 發票訊息維護作業 CRU
@Component({
  selector: 'app-tls41050-cru',
  templateUrl: './tls41050-cru.component.html',
  styleUrl: './tls41050-cru.component.scss'
})
export class TLS41050CRUComponent extends BasicCrupageComponent implements OnInit{
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // POS5001_通告檔
    // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL
    STO_No: ['', [Validators.required, Validators.maxLength(10)]], // 門市店號
    NOT_DateTime: [,[Validators.required]], // 通告產生時間
    NOT_Type: ['000000',[Validators.required, Validators.maxLength(6)]], // 通告顯示種類，固定為000000
    /*  101=即時顯示通告   102=暫停時顯示通告 103=功能鍵顯示通告 104=客戶顯示器顯示通告 105=銷貨明細表列印訊息 */

    //
    ECR_No: ['XXXXXX', [Validators.required, Validators.maxLength(6)]], // 收銀機號，固定為XXXXXX
    NOT_BegDateTime: [,[Validators.required]], // 結束時間
    NOT_EndDateTime: [,[Validators.required]], // 結束時間
    NOT_Desc: [,[Validators.maxLength(255)]], // 通告內容
    NOT_Status: ['A',[Validators.maxLength(2)]], // 通告狀態 A=已生效(預設值) D=已刪除
    NOT_Remark: ['', [Validators.maxLength(60)]], // 通告備註

    NOT_DispRt: [0, [Validators.maxLength(0)]], // 即時顯示 Y/N，預設N
    NOT_DispSpd: [0, [Validators.maxLength(0)]], // 暫停時顯示 Y/N，預設N
    NOT_DispBtn: [0, [Validators.maxLength(0)]], // 按下功能鍵顯示 Y/N，預設N
    NOT_DispCd: [0, [Validators.maxLength(0)]], // 客顯器顯示 Y/N，預設N
    NOT_Prn: [0, [Validators.maxLength(0)]], // 銷貨明細表列印 Y/N，預設N

    // 以下可以不用顯示於查詢頁
    CRT_Date: [], // 建立日期
    CRT_USR_No: ['', [Validators.maxLength(8)]], // 建立人員
    CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
    UPD_Date: [], // 變更日期
    UPD_USR_No: ['', [Validators.maxLength(8)]], // 變更人員
    UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  NOT_Type_Options: any[] = [
    { value: 101, label: '即時顯示通告' },
    { value: 102, label: '暫停時顯示通告' },
    { value: 103, label: '功能鍵顯示通告' },
    { value: 104, label: '客戶顯示器顯示通告' },
    { value: 105, label: '銷貨明細表列印訊息' },
  ];
  NOT_Status_Options: any[] = [
    { value: 'A', label: '已生效' },
    { value: 'D', label: '已刪除' },
  ];
  YNoptions: any[] = [
    { value: 1, label: '是' },
    { value: 0, label: '否' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,
    //
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '240005';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
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

    // 禁用 SYS_StoreNo 欄位 (STO_No)
    this.dataForm.get('STO_No')?.disable();
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
      // POS5001D 通告設定明細檔(多筆)

      // STO_No              VARCHAR(06)         NOT NULL,      /*分店編號*/
      // NOT_DateTime        DATETIME            NOT NULL,      /*通告產生日期時間*/
      // NOT_Type            VARCHAR(06)         NOT NULL,      /*通告顯示種類*//*  101=即時顯示通告   102=暫停時顯示通告 103=功能鍵顯示通告 104=客戶顯示器顯示通告 105=銷貨明細表列印訊息 */
      // ECR_No              VARCHAR(06)             NULL,      /*收銀機號 POS1002.ECR_No*/ 

      // INDEX IDX_POS5001_MST ON POS5001 (STO_No, NOT_DateTime, NOT_Type, ECR_No);

      NOT_SeqNo: [, [this.validationService.numberValidator,Validators.required, Validators.maxLength(6)]], // 通告序號
      TLT_No: ['', [Validators.maxLength(8)]], // 專櫃編號

      ECR_Type:['',[Validators.maxLength(2)]], // 機台類型 POS1002.ECR_Type
      ECR_GrpNo:['',[Validators.maxLength(20)]], // 機台群組編號
      
      BUILDING_No:['',[Validators.maxLength(2)]], // 館別
      FLOOR_No:['',[Validators.maxLength(2)]], // 樓層代碼
      AREA_No:['',[Validators.maxLength(2)]], // 區域代碼

      // 以下可以不用顯示於查詢頁
      CRT_Date: [], // 建立日期
      CRT_USR_No: ['', [Validators.maxLength(8)]], // 建立人員
      CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
      UPD_Date: [], // 變更日期
      UPD_USR_No: ['', [Validators.maxLength(8)]], // 變更人員
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
      console.log('有子資料');
      rowdata.children.forEach((children: any) => {
        const branchForm = this.createItem();
        branchForm.patchValue(children);
        this.items.push(branchForm);
      });
    }else{
      console.log('無子資料');
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
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }  
  
  onCancel() {
    this.router.navigate(['/TLS4000/TLS41050']);
  }
  //-------------------------------------------------------------------------------------------------------------
}
