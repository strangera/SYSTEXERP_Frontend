import { inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SystemDataService } from '@service/system/system-data.service';
import { FormStatusService } from '@shared/service/form-status.service';
import { Actions, PermissionGuardService } from '@shared/service/permission-guard.service';
import { finalize, Observable, take } from 'rxjs';
import { CurrentPageService } from '../../../core/layout/app.menulist/current-page.service';
import { LoadingService } from '../../../core/services/loading.service';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../components/notification-message/notification.service';
import { LazyLoadEvent } from '@others/component/table/table.model';
import { CRUDStatus } from '../../models/system/CRUDstatus';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { UserInfo } from '../../models/system/userInfo';
import { QueryStateService } from '../../service/query-state.service';
import { environment } from 'src/environments/environment';
@UntilDestroy()
export abstract class BasicQueryPageComponent<T> {
  protected readonly now: Date = new Date();
  // 品牌設定（南紡/精誠依 build configuration 切換），供樣板直接綁 {{ brand.companyFullName }} 等
  readonly brand = environment.brand;
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
  activatedRoute = inject(ActivatedRoute);
  systemDataService = inject(SystemDataService);
  private permissionGuard = inject(PermissionGuardService);
  protected formStatusService = inject(FormStatusService);
  protected loadingService = inject(LoadingService);
  public readonly Actions = Actions;
  hasPermission(action: string): boolean {
    return this.permissionGuard.hasPermission(this.ProgNo, action);
  }

  language = navigator.language;

  private _loading = false;
  get loading(): boolean {
    return this._loading;
  }
  set loading(value: boolean) {
    this._loading = value;
    if (value) {
      this.loadingService.startLoading();
    } else {
      this.loadingService.stopLoading();
    }
  }
  submitted = false;

  // 初始化方法
  public abstract ngOnInit(): void;

  initializePage(progNo: string, cruPage?: string, queryForm?: FormGroup, onSubmit?: (form: FormGroup) => void) {
    this.ProgNo = progNo.toUpperCase();
    this.formStatusService.resetStatus(this.ProgNo);
    this.cruPage = cruPage ?? '';
    this.funInfo = this.systemDataService.getUserPermissions(this.ProgNo);
    this.currentPageService.setCurrentProgNo(this.ProgNo);
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    const previousRoute = state?.['fromRoute'] || '/account/dashboard';
    // 通用規則：檢查 previousRoute 是否包含 ProgNo（例如 tls13010），涵蓋 CRU 和所有 next 頁面
    const isFromRelatedRoute = previousRoute.includes(this.ProgNo.toLowerCase());
    if (this.hasPermission(Actions.Query) && isFromRelatedRoute && queryForm) {
      // 監聽按鈕截取初始值的狀態
      this.formStatusService.waitForReady(this.ProgNo).subscribe(() => {
        console.log('表單已準備好，開始還原查詢狀態');
        const query = this.queryStateService.getQueryStateValue(this.ProgNo);
        if (query) {
          queryForm?.patchValue(query);
          queryForm?.patchValue({ pageIndex: 1 });
          if (onSubmit) {
            onSubmit(queryForm);
          }
        }
      });
    }
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
    if (this.hasPermission(Actions.Create)) { // '新增' 的 function_code 是 "20"
      this.navigateWithState(CRUDStatus.Create, data, queryConditions);
    }
  }
  onEdit(data: T, queryConditions?: any) {
    if (this.hasPermission(Actions.Edit)) { // '修改' 的 function_code 是 "30"
      this.navigateWithState(CRUDStatus.Edit, data, queryConditions);
    }
  }
  onDetail(data: T, queryConditions?: any) {
    if (this.hasPermission(Actions.Query)) { // '查詢' 的 function_code 是 "10"
      this.navigateWithState(CRUDStatus.Read, data, queryConditions);
    }
  }
  onCopy(data: T) {
    this.navigateWithState(CRUDStatus.Create, data);
  }

  /**
   * 【地雷 3】共用 loading 收尾運算子。
   *
   * 把它放進 API 串流的 .pipe() 裡，不論「成功 / 失敗 / 被取消」都會自動：
   *   1. 關閉 this.loading（按鈕、查詢列轉圈圈）
   *   2. 解除全螢幕遮罩 unblockUi()
   * 徹底解決「API 噴錯後 loading 旗標關不掉、轉圈圈卡死」的問題。
   *
   * 為什麼放這裡而不是各頁手寫 finalize？
   *   全站 658 頁繼承本基底，手寫一定有人漏；集中在基底，一行 pipe 全站一致。
   *
   * 用法：
   *   this.queryFunction(body).pipe(
   *     this.withLoading(() => this.tableLoading.set(false)), // 選填：頁面自己的額外狀態
   *     takeUntilDestroyed(this.destroyRef),                  // 訂閱仍要自行退訂
   *   ).subscribe({ next: res => { ... } });
   *
   * @param onFinalize 選填，頁面專屬的額外收尾（例如關閉 table 自己的 loading signal）
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

  // 送出查詢
  handleSubmit(
    queryForm: FormGroup,
    callback: () => void,
    setLoading?: (value: boolean) => void,
    setSubmitted?: (value: boolean) => void
  ) {
    console.log(queryForm.value);
    // 1. 決定如何處理 Loading
    // 如果有傳入 setLoading，就執行它；否則就改原本的 this.loading
    const updateLoading = (val: boolean) => {
      if (setLoading) {
        setLoading(val);
      } else {
        this.loading = val;
      }
    };
    // 2. 決定如何處理 Submitted
    const updateSubmitted = (val: boolean) => {
      if (setSubmitted) {
        setSubmitted(val);
      } else {
        this.submitted = val;
      }
    };
    updateSubmitted(true);
    updateLoading(true);
    this.messageService.blockUi();
    if (queryForm.valid) {
      updateSubmitted(false);
      callback();
    } else {
      this.logValidationErrors(queryForm);
      updateLoading(false);
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
    if (this.hasPermission(Actions.Query)) { // '查詢' 的 function_code 是 "10"
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

    // 同步到子類別常用屬性（若存在）
    try {
      if ((this as any).pageIndex !== undefined && event.pageIndex !== undefined) {
        (this as any).pageIndex = event.pageIndex;
      }
      if ((this as any).pageSize !== undefined && event.pageSize !== undefined) {
        (this as any).pageSize = event.pageSize;
      }
      const sb = event.SortBy ?? event.SortBy;
      if (sb) {
        // 保存原始 SortBy 結構以便子類使用完整排序資訊
        (this as any).sortMeta = sb;
        if (Array.isArray(sb) && sb.length > 0) {
          (this as any).sortBy = String(sb[0].field ?? '');
          (this as any).sortOrder = sb[0].order ?? 1;
        } else if (typeof sb === 'string') {
          (this as any).sortBy = sb;
          (this as any).sortOrder = 1;
        }
      }
    } catch (e) {
      // ignore
    }
  }
}
