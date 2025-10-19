import { inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ConfirmationService } from 'primeng/api';
import { take } from 'rxjs';
import { CurrentPageService } from '../../../core/layout/app.menulist/current-page.service';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../component/notification-message/notification.service';
import { LazyLoadEvent } from '../../componentkit/table/table.model';
import { CRUDStatus } from '../../models/system/CRUDstatus';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { UserInfo } from '../../models/system/userInfo';
import { QueryStateService } from '../../service/query-state.service';
@UntilDestroy()
export abstract class BasicQueryPageComponent<T> {
  protected readonly now: Date = new Date();
  ProgNo = '';
  cruPage = '';

  user?: UserInfo | null; // 使用者資訊
  funInfo?: FunsrightInfo; // 權限

  router: Router = inject(Router);
  messageService = inject(NotificationService);
  authService = inject(AuthService);
  formBuilder = inject(FormBuilder);
  queryStateService = inject(QueryStateService);
  currentPageService = inject(CurrentPageService);
  confirmationService = inject(ConfirmationService);
  activatedRoute = inject(ActivatedRoute);

  language = navigator.language;
  loading = false;
  submitted = false;

  // 初始化方法
  public abstract ngOnInit(): void;

  initializePage(progNo: string, cruPage?: string, queryForm?: FormGroup, onSubmit?: (form: FormGroup) => void) {
    this.ProgNo = progNo.toUpperCase();
    this.cruPage = cruPage ?? '';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.currentPageService.setCurrentProgNo(this.ProgNo);
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    const previousRoute = state?.['fromRoute'] || '/account/dashboard';
    // 通用規則：檢查 previousRoute 是否包含 ProgNo（例如 tls13010），涵蓋 CRU 和所有 next 頁面
    const isFromRelatedRoute = previousRoute.includes(this.ProgNo.toLowerCase());
    if (this.canPerformAction('10') && isFromRelatedRoute && queryForm) {
      console.log('Previous Route:', previousRoute); // 調試輸出
      const query = this.queryStateService.getQueryStateValue(this.ProgNo);
      if (query) {
        queryForm?.patchValue(query);
        queryForm?.patchValue({ pageIndex: 1 });
        if (onSubmit) {
          onSubmit(queryForm);
        }
      }
    }
  }
  canPerformAction(action: string): boolean {
    return this.funInfo?.PrivilegeBehavior?.some(behavior => behavior.function_code === action) || false;
  }
  navigateWithState(crudstatus: CRUDStatus, rowdata?: T | unknown, queryConditions?: any) {
    const extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
        fromRoute: this.router.url, // 加入 fromRoute 並設定為目前頁面的 URL
        queryConditions: queryConditions
      },
    };
    this.router.navigate([`account/${this.cruPage.toLocaleLowerCase()}`], extras);
  }
  // 移動路由
  onCreate(data?: unknown, queryConditions?: any) {
    if (this.canPerformAction('20')) { // '新增' 的 function_code 是 "20"
      this.navigateWithState(CRUDStatus.Create, data, queryConditions);
    }
  }
  onEdit(data: T, queryConditions?: any) {
    if (this.canPerformAction('30')) { // '修改' 的 function_code 是 "30"
      this.navigateWithState(CRUDStatus.Edit, data, queryConditions);
    }
  }
  onDetail(data: T, queryConditions?: any) {
    if (this.canPerformAction('10')) { // '查詢' 的 function_code 是 "10"
      this.navigateWithState(CRUDStatus.Read, data, queryConditions);
    }
  }
  canDelete() {
    if (this.canPerformAction('40')) { // '刪除' 的 function_code 是 "40"
      this.navigateWithState(CRUDStatus.Delete);
    }
  }
  onCopy(data: T) {
    if (this.canPerformAction('20')) { // '複製' 的 function_code 是 "20"
      this.navigateWithState(CRUDStatus.Create, data);
    }
  }

  // 送出查詢
  handleSubmit(queryForm: FormGroup, callback: () => void) {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (queryForm.valid) {
      this.submitted = false;
      callback(); // 執行傳入的回調函數
    } else {
      this.logValidationErrors(queryForm);
      this.loading = false;
    }

    this.messageService.unblockUi();
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
  // 修改處理歷史查詢的方法
  handleQueryRestore(
    queryForm: FormGroup,
    storageKey: string,
    onSubmit: (form: FormGroup) => void,
  ) {
    if (this.canPerformAction('10')) { // '查詢' 的 function_code 是 "10"
      this.queryStateService.getQueryState(storageKey)?.pipe(take(1)).subscribe((query) => {
        if (query) {
          queryForm.patchValue(query);
          onSubmit(queryForm);
        }
      });
    }
  }

  onLazyLoadData(event: LazyLoadEvent, queryForm: FormGroup) {
    const query = this.queryStateService.getQueryStateValue(this.ProgNo)
    if (query) {
      queryForm.patchValue(query);
    }
    queryForm.patchValue({
      pageSize: event.pageSize,
      pageIndex: event.pageIndex,
      SortBy: event.SortBy
    });
  }
}
