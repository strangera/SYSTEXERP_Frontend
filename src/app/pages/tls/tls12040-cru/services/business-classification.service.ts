import { Injectable } from '@angular/core';
import { DropdownOption } from '@shared/constants/business.constants';
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, shareReplay, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'  // 或 'any' 如果是 lazy-loaded module
})
export class BusinessClassificationService {
  // 快取機制：使用 Map 儲存已載入的資料，避免重複 API 呼叫
  private cache = new Map<string, DropdownOption[]>();

  // 用 BehaviorSubject 追蹤當前選擇（可選，用來在多 component 間共享狀態）
  private currentBusType$ = new BehaviorSubject<string | null>(null);
  private currentBusClass$ = new BehaviorSubject<string | null>(null);

  constructor(private sharedDropdownService: SharedDropdownService) { }

  /**
   * 載入大分類選項（bus_type）
   * @returns Observable<DropdownOption[]>
   */
  getBusTypeOptions(): Observable<DropdownOption[]> {
    const cacheKey = 'bus_types';
    if (this.cache.has(cacheKey)) {
      console.log('✅ 使用快取: 大分類');
      return of(this.cache.get(cacheKey)!);
    }

    return this.sharedDropdownService.getBustypeOptions().pipe(
      tap(options => this.cache.set(cacheKey, options)),  // 存入快取
      shareReplay(1),  // RxJS 分享快取，避免多訂閱重呼
      catchError(() => of([]))  // 錯誤處理，回空陣列
    );
  }

  /**
   * 根據大分類載入中分類選項（bus_class）
   * @param busType 大分類代碼
   * @returns Observable<DropdownOption[]>
   */
  getBusClassOptions(busType: string): Observable<DropdownOption[]> {
    if (!busType) return of([]);

    const cacheKey = `bus_classes_${busType}`;
    if (this.cache.has(cacheKey)) {
      console.log(`✅ 使用快取: 中分類 for ${busType}`);
      return of(this.cache.get(cacheKey)!);
    }

    return this.sharedDropdownService.getBusClassOptions(busType).pipe(
      tap(options => this.cache.set(cacheKey, options)),
      shareReplay(1),
      catchError(() => of([]))
    );
  }

  /**
   * 根據大分類和中分類載入小分類選項（bus_sclass）
   * @param busType 大分類代碼
   * @param busClass 中分類代碼
   * @returns Observable<DropdownOption[]>
   */
  getBusSClassOptions(busType: string, busClass: string): Observable<DropdownOption[]> {
    if (!busType || !busClass) return of([]);

    const cacheKey = `bus_sclasses_${busType}_${busClass}`;
    if (this.cache.has(cacheKey)) {
      console.log(`✅ 使用快取: 小分類 for ${busType}_${busClass}`);
      return of(this.cache.get(cacheKey)!);
    }

    return this.sharedDropdownService.getBusSClassOptions(busType, busClass).pipe(
      tap(options => this.cache.set(cacheKey, options)),
      shareReplay(1),
      catchError(() => of([]))
    );
  }

  // 可選：清除快取（如果資料需要刷新，例如使用者登出或資料更新）
  clearCache(): void {
    this.cache.clear();
  }

  // 可選：追蹤當前選擇（如果需要在多處同步）
  setCurrentBusType(busType: string): void {
    this.currentBusType$.next(busType);
  }

  getCurrentBusType(): Observable<string | null> {
    return this.currentBusType$.asObservable();
  }

  // 同樣可以加 setCurrentBusClass 等
}
