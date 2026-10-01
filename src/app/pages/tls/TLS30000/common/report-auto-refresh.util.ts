import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { formatDate } from '@angular/common';
import { interval } from 'rxjs';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 分鐘

/**
 * 查詢日期若為系統日，每 10 分鐘自動觸發重新查詢。
 * @param destroyRef      元件的 DestroyRef，用於自動取消訂閱
 * @param getQueryDate    回傳目前查詢日期的 getter（格式 'yyyy-MM-dd'；null/undefined 表示無日期或非單日報表）
 * @param refreshCallback 重新查詢的執行函式
 */
export function startReportAutoRefresh(
  destroyRef: DestroyRef,
  getQueryDate: () => string | Date | null | undefined,
  refreshCallback: () => void,
): void {
  interval(REFRESH_INTERVAL_MS)
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(() => {
      const raw = getQueryDate();
      if (!raw) return;
      const queryDate = formatDate(raw, 'yyyy-MM-dd', 'en-US');
      const today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
      if (queryDate === today) refreshCallback();
    });
}
