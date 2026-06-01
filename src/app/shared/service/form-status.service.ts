import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FormStatusService {
  // 記錄該程式編號 (ProgNo) 的表單初始狀態是否已截取完成
  private readonly formInitializedSource = new BehaviorSubject<{ progNo: string, isReady: boolean }>({ progNo: '', isReady: false });

  // 發出訊號：通知初始值已存好
  notifyReady(progNo: string) {
    this.formInitializedSource.next({ progNo, isReady: true });
  }

  // 監聽訊號：過濾出特定 ProgNo 且 isReady 為 true 的事件
  waitForReady(progNo: string): Observable<any> {
    return this.formInitializedSource.asObservable().pipe(
      filter(status => status.progNo === progNo && status.isReady),
      take(1) // 只需要觸發一次
    );
  }

  // 重置狀態 (用於離開頁面時)
  resetStatus(progNo: string) {
    this.formInitializedSource.next({ progNo, isReady: false });
  }
}
