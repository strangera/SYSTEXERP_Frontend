// !!! TMS底層寫法
// !!! 看是要用這個底層還是原本的
import { HasPermissionsValue } from '../../directive/has-permission.directive';
import { NavigationExtras, Router } from '@angular/router';
import { inject } from '@angular/core';
import { NotificationService } from '../../component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { QueryStateService } from '../../service/query-state.service';
import { take } from 'rxjs';
import { UserInfo } from '../../models/system/userInfo';
import { FunsrightInfo, PermissionsInfo } from '../../models/system/funsrightInfo';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';
import { CRUDStatus } from '../../enum/CRUDstatus';

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

  language = navigator.language;
  loading = false;
  submitted = false;

  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };

  // 初始化頁面
  initializePage(progNo: string, cruPage?: string) {
    this.ProgNo = progNo; // 程式編號
    this.cruPage = cruPage ?? ''; // CRU路徑
    this.funInfo = this.authService.getUserPermissions(this.ProgNo); // 取得權限
    // 無API測試用
    // this.funInfo?.PrivilegeBehavior = [PermissionsInfo.query, PermissionsInfo.add, PermissionsInfo.edit, PermissionsInfo.delete, PermissionsInfo.export, PermissionsInfo.report, PermissionsInfo.print];
    // 在初始化頁面後，通知選單更新選中狀態
    this.currentPageService.setCurrentProgNo(this.ProgNo);
  }

  hasPermission(permission: PermissionsInfo): boolean {
    // return this.funInfo?.PrivilegeBehavior?.includes(permission); // !!! 後端權限調整後再使用
    return true; // 測試用
  }
  canPerformAction(action: PermissionsInfo): boolean {
    return this.hasPermission(action);
  }
  navigateWithState(crudstatus: CRUDStatus, rowdata?: T, pageroute?: string) {
    const extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
        fromRoute: this.router.url, // 加入 fromRoute 並設定為目前頁面的 URL
      },
    };
    this.router.navigate([pageroute || this.cruPage], extras);
  }
  // 移動路由
  onCreate() {
    if (this.canPerformAction(PermissionsInfo.add)) {
      this.navigateWithState(CRUDStatus.Create);
    }
  }
  onEdit(data: T) {
    if (this.canPerformAction(PermissionsInfo.edit)) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }
  onDetail(data: T) {
    if (this.canPerformAction(PermissionsInfo.query)) {
      this.navigateWithState(CRUDStatus.Read, data);
    }
  }
  canDelete() {
    if (this.canPerformAction(PermissionsInfo.query)) {
      this.navigateWithState(CRUDStatus.Delete);
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
    if (this.canPerformAction(PermissionsInfo.query)) {
      this.queryStateService.getQueryState(storageKey)?.pipe(take(1)).subscribe((query) => {
        if (query) {
          queryForm.patchValue(query);
          onSubmit(queryForm);
        }
      });
    }
  }
}
