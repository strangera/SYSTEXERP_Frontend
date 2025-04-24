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
  // 獲取查詢條件
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
