import { Injectable } from '@angular/core';

export interface TLS23010CacheState {
  merged: any[];                         // 已經 append 後的完整資料
  pages: Map<number, any[]>;             // 分頁快取
  currentPage: number;
  totalPage?: number;
  totalCount?: number;
  scrollTop?: number;                    // 捲動位置
  printedAt?: string;
  dateStart?: string;
  dateEnd?: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class TLS23010CacheService {
  private store = new Map<string, TLS23010CacheState>();

  makeKey(query: any): string {
    // 用查詢條件當 key（必要欄位自行調整）
    const keyObj = {
      TXN_DateStart: query?.TXN_DateStart ?? null,
      TXN_DateEnd: query?.TXN_DateEnd ?? null,
      // ...有用到的其他查詢欄位
      __v: 1, // schema 版本
    };
    return `TLS23010:${JSON.stringify(keyObj)}`;
  }

  getState(key: string): TLS23010CacheState | undefined {
    return this.store.get(key);
  }

  setState(key: string, partial: Partial<TLS23010CacheState>): TLS23010CacheState {
    const prev = this.store.get(key);
    const next: TLS23010CacheState = {
      merged: prev?.merged ?? [],
      pages: prev?.pages ?? new Map<number, any[]>(),
      currentPage: prev?.currentPage ?? 1,
      totalPage: prev?.totalPage,
      totalCount: prev?.totalCount,
      scrollTop: prev?.scrollTop,
      printedAt: prev?.printedAt,
      dateStart: prev?.dateStart,
      dateEnd: prev?.dateEnd,
      timestamp: Date.now(),
      ...partial,
    };
    this.store.set(key, next);
    return next;
  }

  setPage(key: string, pageIndex: number, rows: any[]) {
    const state = this.setState(key, {});
    state.pages.set(pageIndex, rows);
    // merged 也更新（維持 append 的結果）
    const mergedPages: any[] = [];
    const maxPage = Math.max(...Array.from(state.pages.keys()));
    for (let i = 1; i <= maxPage; i++) {
      const pg = state.pages.get(i);
      if (pg?.length) mergedPages.push(...pg);
      else break; // 斷層就停
    }
    state.merged = mergedPages;
    this.store.set(key, state);
  }

  getPage(key: string, pageIndex: number): any[] | undefined {
    return this.store.get(key)?.pages.get(pageIndex);
  }

  clear(key?: string) {
    if (key) this.store.delete(key);
    else this.store.clear();
  }
}
