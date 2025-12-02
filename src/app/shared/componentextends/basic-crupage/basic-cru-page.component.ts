import { inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SystemDataService } from '@service/system/system-data.service';
import { UserInfo } from '@shared/models/system/userInfo';
import { FormLabelService } from '@shared/service/form-label.service';
import { PermissionGuardService } from '@shared/service/permission-guard.service';
import { ValidationService } from '@shared/service/validation.service';
import { ConfirmationService } from 'primeng/api';
import { CurrentPageService } from '../../../core/layout/app.menulist/current-page.service';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../component/notification-message/notification.service';
import { LazyLoadEvent } from '../../componentkit/table/table.model';
import { CRUDStatus } from '../../models/system/CRUDstatus';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
@UntilDestroy()
export abstract class BasicCruPageComponent<T> {
  // constructor
  authService = inject(AuthService);
  router = inject(Router);
  messageService = inject(NotificationService);
  formBuilder = inject(FormBuilder);
  currentPageService = inject(CurrentPageService);
  confirmationService = inject(ConfirmationService);
  activatedRoute = inject(ActivatedRoute);
  formLabelService = inject(FormLabelService);
  systemDataService = inject(SystemDataService);
  private valid = inject(ValidationService);
  private permissionGuard = inject(PermissionGuardService);

  protected useReadonlyInsteadOfDisable = false;
  // 權限
  ProgNo = '';
  funInfo?: FunsrightInfo;
  rowdata: T | null = null;
  queryData: any;
  user: UserInfo = this.authService.currentUserValue!;
  // CRU----------------------------------------------------------------
  crudstatus: CRUDStatus = CRUDStatus.Read;
  formTitle = '';
  // 狀態 ----------------------------------------------------------------
  loading = false;  // 是否loading
  submitted = false;
  previousRoute: string | null = null; // 新增用於儲存前一個路由的屬性
  language = navigator.language;
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
    return this.hasPermission('20');
  }
  canEdit(): boolean {
    return this.hasPermission('30');
  }
  // 通用的權限檢查方法
  hasPermission(action: string): boolean {
    return this.permissionGuard.hasPermission(this.ProgNo, action);
  }
  initializePage(progNo: string, form?: FormGroup, options?: { useReadonly?: boolean }) {
    this.formLabelService.clearLabels();

    this.ProgNo = progNo;
    this.currentPageService.setCurrentProgNo(this.ProgNo);
    this.funInfo = this.systemDataService.getUserPermissions(this.ProgNo);

    // 設定是否使用 readonly 模式 搭配各共通元件的readonly參數 by bruce tls13010 && tls12040 會用到 我先用參數搭配[readonly] = 'XXX' 或是 [readonly] = 'true' 控
    if (options?.useReadonly) {
      this.useReadonlyInsteadOfDisable = true;
    }

    const state = this.router.lastSuccessfulNavigation?.extras.state;
    this.previousRoute = state?.['fromRoute'] || this.activatedRoute.snapshot.queryParams['fromRoute'] || document.referrer || '/account/dashboard';
    this.rowdata = state?.['rowdata'];
    this.queryData = state?.['queryConditions']
    console.log(state?.['rowdata'])
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
        // 根據設定決定要不要 disable
        if (!this.useReadonlyInsteadOfDisable) {
          form?.disable();
        }
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
    // 確保返回正確的查詢頁面
    const queryPageRoute = this.previousRoute?.includes('account/')
      ? this.previousRoute
      : `/account/${this.ProgNo.toLowerCase()}`;

    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
    this.router.navigate([queryPageRoute], extras);
  }

  onLazyLoadData(event: LazyLoadEvent, dataForm: FormGroup) {
    dataForm.patchValue({
      pageSize: event.pageSize,
      pageIndex: event.pageIndex,
      SortBy: event.SortBy
    });
  }
}
