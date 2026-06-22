import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { CurrentPageService } from '../../core/layout/app.menulist/current-page.service';
import { SYS0790Service } from '../../service/api/sys/sys0790.service';
import { AuthService } from '../../service/system/auth.service';
import { SystemDataService } from '../../service/system/system-data.service';

/**
 * 使用者作業按鈕歷程追蹤（SYS0790）。
 * 由 app-button 在每次點擊後 fire-and-forget 呼叫，業務操作不受 log 寫入結果影響。
 */
@Injectable({ providedIn: 'root' })
export class OperationLogService {
  private readonly auth = inject(AuthService);
  private readonly currentPage = inject(CurrentPageService);
  private readonly systemData = inject(SystemDataService);
  private readonly router = inject(Router);
  private readonly sys0790 = inject(SYS0790Service);

  logButtonClick(buttonName: string | undefined): void {
    const user = this.auth.currentUserValue;
    if (!user?.user_No) return;

    const progNo = this.currentPage.getCurrentProgNo() ?? '';
    const progName = progNo
      ? (this.systemData.getUserPermissions(progNo)?.prog_name ?? '')
      : '';

    this.sys0790
      .insertSYS0790Log({
        UserNo: user.user_No,
        UserName: user.user_Name ?? '',
        FunctionCode: progNo,
        FunctionName: progName,
        ButtonName: buttonName ?? '',
        LinkUrl: this.router.url,
      })
      .pipe(catchError(() => EMPTY))
      .subscribe();
  }
}
