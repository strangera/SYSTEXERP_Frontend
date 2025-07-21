import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../component/notification-message/notification.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FunsrightInfo, PermissionsInfo } from '../../models/system/funsrightInfo';
import { UserInfo } from '../../models/system/userInfo';
import { CRUDStatus } from '../../models/system/CRUDstatus';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';
import { LazyLoadEvent } from '../../componentkit/table/table.model';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ConfirmationService } from 'primeng/api';
@UntilDestroy()
export class BasicCruPageComponent<T> {
  // Page No
  ProgNo = '';
  funInfo?: FunsrightInfo;
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
  confirmationService: ConfirmationService = inject(ConfirmationService);
  activatedRoute = inject(ActivatedRoute);
  previousRoute: string | null = null; // 新增用於儲存前一個路由的屬性
  // 判斷目前頁面是新增、修改、明細--------------------------------
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
    return this.funInfo?.PrivilegeBehavior?.some(behavior => behavior.function_code === '20') || false; // 假設 '20' 是新增的 function_code
  }
  canEdit(): boolean {
    return this.funInfo?.PrivilegeBehavior?.some(behavior => behavior.function_code === '30') || false; // 假設 '30' 是編輯的 function_code
  }
  // 通用的權限檢查方法
  canPerformAction(action: string): boolean {
    return this.funInfo?.PrivilegeBehavior?.some(behavior => behavior.function_code === action) || false;
  }
  initializePage(progNo: string, form?: FormGroup) {
    if (this.authService.currentUserValue) {
      this.user = this.authService.currentUserValue;
    }
    this.ProgNo = progNo;
    this.currentPageService.setCurrentProgNo(this.ProgNo);
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    this.previousRoute = state?.['fromRoute'] || this.activatedRoute.snapshot.queryParams['fromRoute'] || document.referrer || '/account/dashboard';
    this.rowdata = state?.['rowdata'];
    switch (state?.['crudstatus']) {
      case CRUDStatus.Create:
        this.formTitle = '新增資訊';
        this.crudstatus = CRUDStatus.Create;
        if (state?.['rowdata']) {
          form?.patchValue(state['rowdata']);
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
    this.loading = true;
    if (frm?.invalid) {
      this.logValidationErrors(frm);
      this.messageService.errorBubble('表單驗證失敗，請檢查輸入資料', '表單驗證失敗');
      this.loading = false;
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
  onCancel() {
    this.router.navigate([this.previousRoute]);
  }

  onLazyLoadData(event: LazyLoadEvent, dataForm: FormGroup) {
    dataForm.patchValue({
      pageSize: event.pageSize,
      pageIndex: event.pageIndex,
      SortBy: event.SortBy
    });
  }
}
