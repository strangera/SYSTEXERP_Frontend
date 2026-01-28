/**
 * 抽成資料載入服務
 * 負責載入折扣選項和抽成資料
 */
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { CommissionItem } from '../../core/models/commission';
import { DropdownOption } from '../../core/models/common.interface';

export interface LoadCommissionOptions {
  talentId: string;
  isNewContract: boolean;
  currentCommissionType: string;
  contractStartDate: string;
  contractEndDate: string;
  discountOptions: DropdownOption[];
}

export interface LoadCommissionResult {
  success: boolean;
  data: CommissionItem[];
  error?: string;
}

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
        return options.map((item: { value: string; label: string }) => ({
          label: item.label || item.value,
          value: item.value
        }));
      }

      return [];
    } catch (error) {
      console.error('載入折扣選項失敗:', error);
      return [];
    }
  }

  /**
   * 載入抽成資料
   * 注意：實際的抽成資料載入由父組件透過 ContractFlowService 處理
   */
  async loadCommissionData(options: LoadCommissionOptions): Promise<LoadCommissionResult> {
    try {
      if (options.isNewContract) {
        // 新增模式：返回空陣列，由組件自行新增
        return { success: true, data: [] };
      }

      // 編輯/檢視模式：返回空陣列，由父組件透過 ContractFlowService 載入
      return { success: true, data: [] };
    } catch (error) {
      console.error('載入抽成資料失敗:', error);
      return {
        success: false,
        data: [],
        error: '載入抽成資料失敗'
      };
    }
  }

  /**
   * 初始化空的折扣設定列表 (從折扣選項建立)
   */
  initializeDiscountItems(
    discountOptions: DropdownOption[],
    contractStartDate: string,
    contractEndDate: string
  ): CommissionItem['discountSettingItems'] {
    if (!discountOptions || discountOptions.length === 0) {
      return [];
    }

    return discountOptions.map((option, index) => {
      const isFirstOption = index === 0;
      const is000Option = option.value === '000' || option.label?.includes('正品');
      const shouldSelectByDefault = isFirstOption && is000Option;

      return {
        id: this.generateTempId(),
        _source: 'new' as const,
        selected: shouldSelectByDefault,
        cag_barcode: option.value,
        tlt_bdate: new Date(contractStartDate),
        tlt_edate: new Date(contractEndDate),
        cag_charge_rate: 0,
        _status: 'new' as const,
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault
      };
    });
  }

  /**
   * 產生臨時 ID
   */
  private generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
