import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';

@Injectable({
  providedIn: 'root'
})
export class TLS12040DiscountOptionsService {

  constructor(
    private locationOptionsService: LocationOptionsService
  ) { }

  /**
   * 載入折扣選項 - 參考 TLS13010 的實作
   */
  async loadDiscountOptions(): Promise<any[]> {
    try {
      // 使用與 TLS13010 相同的 API，但可能需要不同的參數
      const options = await firstValueFrom(
        this.locationOptionsService.getPaperTypeOptions('T102').pipe(
          catchError(error => {
            console.error('TLS12040 載入折扣選項時發生錯誤:', error);
            return of([]);
          })
        )
      );

      console.log('TLS12040 折扣選項載入完成:', options?.length || 0);
      return options || [];
    } catch (error) {
      console.error('TLS12040 載入折扣選項失敗:', error);
      return [];
    }
  }

  /**
   * 格式化折扣選項 - 確保與 TLS12040 的欄位格式相容
   */
  formatDiscountOptionsForTLS12040(options: any[]): any[] {
    return options.map(option => ({
      label: option.label || option.name || '',
      value: option.value || option.code || '',
      // 可能需要額外的 TLS12040 特定欄位
      description: option.description || ''
    }));
  }
}
