import { NavigationExtras, Router } from '@angular/router';
import { inject } from '@angular/core';
import { NotificationService } from '../../component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { QueryStateService } from '../../service/query-state.service';
import { take } from 'rxjs';
import { UserInfo } from '../../models/system/userInfo';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';
import { CRUDStatus } from '../../models/system/CRUDstatus';
import { LazyLoadEvent } from '../../componentkit/table/table.model';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ConfirmationService } from 'primeng/api';
@UntilDestroy()
export class BasicQueryPageComponent<T> {
  ProgNo = '';
  cruPage = '';

  user?: UserInfo | null; // 使用者資訊
  funInfo?: FunsrightInfo; // 權限

  router: Router = inject(Router);
  messageService: NotificationService = inject(NotificationService);
  authService: AuthService = inject(AuthService);
  formBuilder: FormBuilder = inject(FormBuilder);
  queryStateService: QueryStateService = inject(QueryStateService);
  currentPageService: CurrentPageService = inject(CurrentPageService);
  confirmationService: ConfirmationService = inject(ConfirmationService);

  language = navigator.language;
  loading = false;
  submitted = false;
  // 初始化頁面
  initializePage(progNo: string, cruPage?: string, queryForm?: FormGroup, onSubmit?: (form: FormGroup) => void) {
    this.ProgNo = progNo; // 程式編號
    this.cruPage = cruPage ?? ''; // CRU路徑
    this.funInfo = this.authService.getUserPermissions(this.ProgNo); // 取得權限
    // 在初始化頁面後，通知選單更新選中狀態
    this.currentPageService.setCurrentProgNo(this.ProgNo);
    // 取得歷史紀錄(如果有的話)
    if (this.canPerformAction('10')) { // '查詢' 的 function_code 是 "10"
      this.queryStateService.getQueryState(this.ProgNo)?.pipe(take(1)).subscribe((query) => {
        if (query && queryForm && onSubmit) {
          queryForm?.patchValue(query);
          queryForm?.patchValue({ pageIndex: 1 });
          onSubmit(queryForm);
        }
      });
    }
  }
  canPerformAction(action: string): boolean {
    return this.funInfo?.PrivilegeBehavior?.some(behavior => behavior.function_code === action) || false;
  }
  navigateWithState(crudstatus: CRUDStatus, rowdata?: T | unknown) {
    const extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
        fromRoute: this.router.url, // 加入 fromRoute 並設定為目前頁面的 URL
      },
    };
    this.router.navigate([`account/${this.cruPage.toLocaleLowerCase()}`], extras);
  }
  // 移動路由
  onCreate(data?: unknown) {
    if (this.canPerformAction('20')) { // '新增' 的 function_code 是 "20"
      this.navigateWithState(CRUDStatus.Create, data);
    }
  }
  onEdit(data: T) {
    if (this.canPerformAction('30')) { // '修改' 的 function_code 是 "30"
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }
  onDetail(data: T) {
    if (this.canPerformAction('10')) { // '查詢' 的 function_code 是 "10"
      this.navigateWithState(CRUDStatus.Read, data);
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
      callback(); // 執行傳入的回調函數
    } else {
      this.loading = false;
    }

    this.messageService.unblockUi();
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
    queryForm.patchValue({
      pageSize: event.pageSize,
      pageIndex: event.pageIndex,
      SortBy: event.SortBy
    });
  }
}
