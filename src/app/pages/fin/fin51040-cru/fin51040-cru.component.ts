import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
@Component({
    selector: 'app-fin51040-cru',
    templateUrl: './fin51040-cru.component.html',
    styleUrl: './fin51040-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, NgFor, ButtonDynamicallydeleteComponent, ButtonDynamicallyaddComponent, ButtonComponent, NgIf, TranslateModule]
})
export class FIN51040CRUComponent
  extends BasicCrupageComponent
  implements OnInit {
  // 初始化表單
  dataForm = this.formBuilder.nonNullable.group({
    summonsCode: [], // 傳票編號
    subpoenaType: [], // 傳票種類
    subpoenaForm: [], // 傳票型態
    subpoenaDate: [], // 傳票日期
    subpoenaSummary: [], // 傳票摘要
    checkoutNumber: [], // 結帳單號
    subpoenaTransferStatus: [], // 傳票拋轉狀態
    creator: [], // 建立者
    creationDate: [], // 建立日
    modifier: [], // 修改/拋轉者
    modificationDate: [], // 修改/拋轉日
    items: this.formBuilder.array([this.createItem()]), // 動態新增項目
  });

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '150004';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
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

  // 取得動態項目
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  // 取得動態項目的表單控制
  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // 創建動態項目
  createItem(): FormGroup {
    return this.formBuilder.group({
      subjectCode: ['', Validators.required], // 科目代號
      summary: [], // 摘要
      debitAmount: [0, [Validators.required, Validators.min(0)]], // 借方金額
      creditAmount: [0, [Validators.required, Validators.min(0)]], // 貸方金額
      organizationCode: ['', Validators.required], // 組織代號
      activityCode: [], // 活動代號
      reversalCode: [], // 立沖代號
      vendorCode: [], // 廠商編號
      objectCode: [], // 對象別編號
      reconciliationKey: [], // 對帳KEY值
    });
  }

  // 移除動態項目
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  // 動態新增項目
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  // 編輯方法
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  // 讀取方法
  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // 表單提交方法
  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(
        this.translate.instant('form_error_message')
      );
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // 新增操作的邏輯
          this.messageService.successBubble(
            this.translate.instant('success_message')
          );
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // 編輯操作的邏輯
          this.messageService.successBubble(
            this.translate.instant('updated-successfully')
          );
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  // 表單提交調用
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  // 取消按鈕的邏輯
  onCancel() {
    this.router.navigate(['FIN5000/FIN51040']);
  }
}
