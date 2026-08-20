import { inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SystemDataService } from '@service/system/system-data.service';
import { UserInfo } from '@shared/models/system/userInfo';
import { FormLabelService } from '@shared/service/form-label.service';
import { Actions, PermissionGuardService } from '@shared/service/permission-guard.service';
import { ValidationService } from '@shared/service/validation.service';
import { finalize, Observable } from 'rxjs';
import { CurrentPageService } from '../../../core/layout/app.menulist/current-page.service';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../components/notification-message/notification.service';
import { LazyLoadEvent } from '@others/component/table/table.model';
import { CRUDStatus } from '../../models/system/CRUDstatus';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { environment } from 'src/environments/environment';
@UntilDestroy()
export abstract class BasicCruPageComponent<T> {
  protected readonly now: Date = new Date();
  // 品牌設定（南紡/精誠依 build configuration 切換），供樣板直接綁 {{ brand.companyFullName }} 等
  readonly brand = environment.brand;
  // constructor
  authService = inject(AuthService);
  router = inject(Router);
  messageService = inject(NotificationService);
  formBuilder = inject(FormBuilder);
  currentPageService = inject(CurrentPageService);
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
  public readonly Actions = Actions;
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
    if (!this.previousRoute) {
      this.previousRoute = state?.['fromRoute'] || this.activatedRoute.snapshot.queryParams['fromRoute'] || document.referrer || '/account/dashboard';
    }
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

  /**
   * 【地雷 3】共用 loading 收尾運算子（與查詢頁基底相同行為）。
   *
   * 放進 API 串流的 .pipe() 裡，不論「成功 / 失敗 / 被取消」都會自動：
   *   1. 關閉 this.loading（送出按鈕轉圈圈）
   *   2. 解除全螢幕遮罩 unblockUi()
   * 解決「儲存 / 更新 API 噴錯後送出按鈕卡在 loading」的問題。
   *
   * 用法：
   *   this.service.save(payload).pipe(
   *     this.withLoading(),
   *     takeUntilDestroyed(this.destroyRef),
   *   ).subscribe({ next: res => { ... } });
   *
   * @param onFinalize 選填，頁面專屬的額外收尾
   */
  protected withLoading<R>(onFinalize?: () => void) {
    return (source$: Observable<R>): Observable<R> =>
      source$.pipe(
        finalize(() => {
          this.loading = false;
          this.messageService.unblockUi();
          onFinalize?.();
        }),
      );
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
    } else {
      this.loading = false;
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
  onCancel(returnValue?: any) {
    // 確保返回正確的查詢頁面
    const queryPageRoute = this.previousRoute?.includes('account/')
      ? this.previousRoute
      : `/account/${this.ProgNo.toLowerCase().slice(0, 3)}/${this.ProgNo.toLowerCase()}`;

    const extras: NavigationExtras = {
      state: {
        fromRoute: this.router.url,
        data: returnValue
      },
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
