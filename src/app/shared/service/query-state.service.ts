// 將狀態記錄在此服務
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class QueryStateService {
  private queryStates = new Map<string, BehaviorSubject<any>>();
  // 設置查詢條件
  setQueryState(key: string, value: any) {
    if (!this.queryStates.has(key)) {
      this.queryStates.set(key, new BehaviorSubject<any>(null));
    }
    this.queryStates.get(key)?.next(value);
  }
  // 獲取查詢條件 (直接回傳值)
  getQueryStateValue(key: string | undefined): any | undefined {
    if (!key) return undefined;
    // 如果 key 不存在，返回 undefined
    if (!this.queryStates.has(key)) {
      return undefined;
    }
    // 返回 BehaviorSubject 的當前值
    return this.queryStates.get(key)?.value;
  }
  // 獲取查詢條件 (回傳 BehaviorSubject)
  getQueryState(key: string | undefined): BehaviorSubject<any> | undefined {
    if (!key) return undefined;
    if (!this.queryStates.has(key)) {
      this.queryStates.set(key, new BehaviorSubject<any>(null));
    }
    return this.queryStates.get(key);
  }
  // 清除特定查詢條件
  clearQueryState(key: string) { this.queryStates.get(key)?.next(null); }
  // 清除所有查詢條件
  clearAllQueryStates() { this.queryStates.forEach(subject => subject.next(null)) }
}
