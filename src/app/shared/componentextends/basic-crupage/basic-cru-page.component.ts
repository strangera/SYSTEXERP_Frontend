import { inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ConfirmationService } from 'primeng/api';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../component/notification-message/notification.service';
import { LazyLoadEvent } from '../../componentkit/table/table.model';
import { CRUDStatus } from '../../models/system/CRUDstatus';
import { FunsrightInfo, PermissionsInfo } from '../../models/system/funsrightInfo';
import { UserInfo } from '../../models/system/userInfo';
import { FormLabelService } from '@shared/service/form-label.service';
import { ValidationService } from '@shared/service/validation.service';
@UntilDestroy()
export abstract class BasicCruPageComponent<T> {
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
  private formLabelService = inject(FormLabelService);
  private valid = inject(ValidationService);
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
    this.formLabelService.clearLabels();
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
        const fieldName = this.formLabelService.getLabel(key) || key;
        Object.keys(controlErrors).forEach(errorKey => {
          const errorMessage = this.valid.getValidatorErrorMessage(errorKey, controlErrors[errorKey]);
          this.messageService.errorBubble(`此欄位 ${errorMessage}，請檢查輸入資料`, `「${fieldName}」驗證失敗`);
          console.log(`欄位 [${fieldName}] 的驗證錯誤: ${errorMessage} (驗證器: ${errorKey}), 錯誤值:`, controlErrors[errorKey]);
        });
      }
    });
  }
  onCancel() {
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
    this.router.navigate([this.previousRoute], extras);
  }

  onLazyLoadData(event: LazyLoadEvent, dataForm: FormGroup) {
    dataForm.patchValue({
      pageSize: event.pageSize,
      pageIndex: event.pageIndex,
      SortBy: event.SortBy
    });
  }
}
