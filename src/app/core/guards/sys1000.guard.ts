import { inject, Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { SystemDataService } from '@service/system/system-data.service';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Sys1000Guard implements CanActivate {
  private readonly systemData = inject(SystemDataService);
  private readonly notification = inject(NotificationService);

  canActivate(): Observable<boolean> | boolean {
    if (SystemOptionsService.isReady()) {
      return true;
    }

    if (!localStorage.getItem('UserInfo')) {
      return true; // 未登入，交給 AuthGuard 處理
    }

    return this.systemData.queryAllSystemCode().pipe(
      map(() => true),
      catchError(() => {
        this.notification.warnBubble('部分下拉選單可能無法正常顯示，請重新整理頁面或聯繫系統管理員。', '系統代碼載入失敗');
        return of(true); // 放行，不阻斷導覽
      })
    );
  }
}
