import { ValidationService } from './../../../shared/service/validation.service';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';

// 2.4.2.1 快速鍵維護作業 CRU
@Component({
  selector: 'app-tls42010-cru',
  templateUrl: './tls42010-cru.component.html',
  styleUrl: './tls42010-cru.component.scss'
})
export class TLS42010CRUComponent extends BasicCrupageComponent implements OnInit{
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // POS10271_收銀菜單明細檔

    // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL
    // STO_No: ['', [Validators.maxLength(10)]], // 分店編號(ALL代表代表不分店號)
    SBM_Type: [1, [Validators.required, Validators.maxLength(6)]], // 菜單類別 (1=一般菜單(預設值)  2=員工菜單)
    PLU_No: ['', [Validators.maxLength(20)]], // 商品條碼，預設為商品貨號
    TLT_No: ['', [Validators.required, Validators.maxLength(20)]], // 專櫃編號
    TLT_Name: ['', [Validators.maxLength(60)]], // 專櫃名稱
    SBM_BegDate: [,[Validators.required]], // 有效啟始日期
    SBM_EndDate: [,[Validators.required]], // 有效結束日期
    
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  SBM_Type_Options: any[] = [
    { value: 1, label: '一般菜單' },
    { value: 2, label: '員工菜單' },
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
    this.ProgNo = '240007';
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

    // 禁用 SYS_StoreNo 欄位
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
      // POS10271_收銀菜單明細檔
      // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL 

      // index: STO_No, SBM_Type, TLT_No
      
      // STO_No: ['000', [Validators.required, Validators.maxLength(10)]], // 分店編號(ALL代表代表不分店號)
      // SBM_Type: ['', [Validators.required, Validators.maxLength(6)]], // 菜單類別 (1=一般菜單  2=員工菜單)
      // TLT_No: ['', [Validators.required, Validators.maxLength(20)]], // 專櫃編號
      SBM_SeqNo: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(6)]], // 菜單序號
      PLU_MagNo: ['', [Validators.required, Validators.maxLength(20)]], // 商品貨號
      PLU_Name: ['', [Validators.required, Validators.maxLength(60)]], // 商品名稱(收銀系統顯示)
      PLU_PrnName: ['', [Validators.required, Validators.maxLength(60)]], // 商品列印名稱(菜單按鍵顯示名稱)
      PLU_FixPrc: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(10)]], // 商品定價
      PLU_SalePrc: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(10)]], // 商品售價
      SBM_BtnNo: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(6)]], // 菜單按鍵序號，同一個按鍵序號可能為多筆，以菜單序號 SBM_SeqNo 較大優先

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
  }//CRU

  onCancel() {
    this.router.navigate(['/TLS4000/TLS42010']);
  }
}
