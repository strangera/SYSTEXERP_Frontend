import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../service/notification.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
import { UserInfo } from '../../../models/system/userInfo';
import { CRUDStatus } from '../../enum/CRUDstatus';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';

export class BasicCruPageComponent<T> {
  // Page No
  ProgNo = '900001';
  funInfo: FunsrightInfo = {};
  rowdata: T | null = null;
  // 權限
  // ----------------------------------------------------------------
  user!: UserInfo;
  addPermission = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  editPermission = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // ----------------------------------------------------------------
  crudstatus: CRUDStatus = CRUDStatus.Read;
  formTitle = '';
  loading = false;  // 是否loading
  submitted = false;
  language = navigator.language;
  router = inject(Router);
  authService = inject(AuthService);
  messageService = inject(NotificationService);
  formBuilder = inject(FormBuilder);
  currentPageService: CurrentPageService = inject(CurrentPageService);
  // ----------------------------------------------------------------
  get isFormEditable(): boolean {
    return (this.crudstatus === CRUDStatus.Edit && this.canEdit());
  }

  get isFormCreateable(): boolean {
    return (this.crudstatus === CRUDStatus.Create && this.canAdd());
  }

  get isFormReadable(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }
  // ----------------------------------------------------------------
  canAdd(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  }

  canEdit(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
  }
  initializePage(progNo: string, form?: FormGroup) {
    this.user = this.authService.getUserInfo() as UserInfo;
    this.ProgNo = progNo;
    this.currentPageService.setCurrentProgNo(this.ProgNo);
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    this.rowdata = state?.['rowdata'];
    console.log(this.rowdata);
    switch (state?.['crudstatus']) {
      case CRUDStatus.Create:
        this.formTitle = '新增資訊';
        this.crudstatus = CRUDStatus.Create;
        if (this.rowdata) {
          form?.patchValue(this.rowdata);
        }
        break;
      case CRUDStatus.Edit:
        this.formTitle = '編輯資料';
        this.crudstatus = CRUDStatus.Edit;
        form?.patchValue(state?.['rowdata']);
        break;
      case CRUDStatus.Read:
        this.formTitle = '顯示資料';
        this.crudstatus = CRUDStatus.Read;
        form?.patchValue(state?.['rowdata']);
        form?.disable();
        break;
    }
  }

  // 提交
  handleSubmit(frm: FormGroup | null, callback: () => void) {
    this.messageService.blockUi();
    this.submitted = true;

    if (frm?.invalid) {
      this.logValidationErrors(frm);
      this.messageService.errorBubble('表單驗證失敗，請檢查輸入資料', '表單驗證失敗');
      return;
    }

    if (this.isFormCreateable || this.isFormEditable) {
      callback();
    }
    this.messageService.unblockUi();
    this.submitted = false;
  }

  private logValidationErrors(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      const controlErrors = form.get(key)?.errors;
      if (controlErrors) {
        Object.keys(controlErrors).forEach(errorKey => {
          console.log(`控件 ${key} 的驗證錯誤: ${errorKey}, 錯誤值:`, controlErrors[errorKey]);
        });
      }
    });
  }
}
