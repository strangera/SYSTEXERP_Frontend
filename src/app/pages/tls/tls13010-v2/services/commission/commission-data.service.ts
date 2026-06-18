/**
 * 抽成資料載入服務
 * 負責載入折扣選項
 */
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LocationOptionsService } from 'src/app/shared/services/dropdownservice/location-options.service';
import { DropdownOption } from '../../core/models/common.interface';

@Injectable({ providedIn: 'root' })
export class CommissionDataService {
  private locationOptionsService = inject(LocationOptionsService);

  /**
   * 載入折扣別選項 - 使用帶排序的 API
   */
  async loadDiscountOptions(): Promise<DropdownOption[]> {
    try {
      // 使用帶排序的 API，返回的資料已經按照 Sort 欄位排序
      const options = await firstValueFrom(
        this.locationOptionsService.querySYS1000_DropDownListWithSort('T102').pipe(
          catchError(error => {
            console.error('載入折扣選項時發生錯誤:', error);
            return of([]);
          })
        )
      );

      // 轉換為 DropdownOption 格式
      if (options && Array.isArray(options)) {
        return options.map((item: { value: string; label: string; sort?: number }) => ({
          label: item.label || item.value,
          value: item.value,
          sort: item.sort
        }));
      }

      return [];
    } catch (error) {
      console.error('載入折扣選項失敗:', error);
      return [];
    }
  }
}
