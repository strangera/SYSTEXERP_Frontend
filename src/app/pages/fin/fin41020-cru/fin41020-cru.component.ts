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
    selector: 'app-fin41020-cru',
    templateUrl: './fin41020-cru.component.html',
    styleUrls: ['./fin41020-cru.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextComponent,
        NgFor,
        ButtonDynamicallydeleteComponent,
        ButtonDynamicallyaddComponent,
        ButtonComponent,
        NgIf,
        TranslateModule,
    ],
})
export class FIN41020CRUComponent
  extends BasicCrupageComponent
  implements OnInit {
  // 表單初始化
  dataForm = this.formBuilder.nonNullable.group({
    departmentCode: ['', [Validators.required]], // 部門代號
    version: ['', [Validators.required]], // 版本
    year: ['', [Validators.required]], // 年
    accountCode: ['', [Validators.required]], // 會計科目
    items: this.formBuilder.array([this.createItem()]), // 動態新增的項目
  });

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    super(); // 呼叫父類的建構子
  }

  ngOnInit(): void {
    // 初始化程式
    this.ProgNo = '140002';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    // 根據 CRUD 狀態來設置不同的邏輯
    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }

    console.log(this.accordionTabCss);
  }

  // 取得動態新增的項目
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  // 取得動態項目的表單控制
  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // 創建動態表單項目
  createItem(): FormGroup {
    return this.formBuilder.group({
      month: ['', [Validators.required]], // 月
      amount: ['', [Validators.required]], // 金額
      remark: ['', Validators.maxLength(255)], // 備註
    });
  }

  // 動態移除項目
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  // 編輯邏輯
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  // 讀取邏輯
  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // 動態新增項目
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  // 提交邏輯
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
          // 假設有保存邏輯
          // this.storeService.addRecord(frm.value).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('success_message')
          );
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // 假設有更新邏輯
          // this.storeService.updateRecord(frm.value).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('updated-successfully')
          );
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  // 最終提交表單
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  // 取消按鈕邏輯
  onCancel() {
    this.router.navigate(['FIN4000/FIN41020']);
  }
}
