// 修改後的 tls12040-charge-data.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { ChargeSettingBusinessModel, TLS12040ChargeQueryResponse } from '../models/tls12040-next2.model';

@Injectable()
export class TLS12040ChargeDataService {
  private readonly tls12040Service = inject(TLS12040Service);
  private readonly locationOptionsService = inject(LocationOptionsService);

  /**
   * 載入折扣選項 - 新增方法
   */
  async loadDiscountOptions(): Promise<any[]> {
    try {
      console.log('載入 TLS12040 折扣選項...');

      const options = await firstValueFrom(
        this.locationOptionsService.getPaperTypeOptions('T102').pipe(
          catchError(error => {
            console.error('載入折扣選項時發生錯誤:', error);
            return of([]);
          })
        )
      );

      console.log('TLS12040 折扣選項載入完成:', options?.length || 0);
      return options || [];
    } catch (error) {
      console.error('載入折扣選項失敗:', error);
      return [];
    }
  }

  async loadChargeData(applyNo: string): Promise<ChargeSettingBusinessModel[]> {
    try {

      console.log('查詢抽成資料, apply_no:', applyNo);

      // 使用 firstValueFrom 替代 toPromise
      const response = await firstValueFrom(
        this.tls12040Service.queryTLS12040Charge(applyNo).pipe(
          tap(res => console.log('API 回應:', res)),
          catchError(error => {
            console.error('API 呼叫失敗:', error);
            throw error;
          })
        )
      );

      console.log('API 回應狀態:', response?.Status);

      // 檢查 API 回應
      if (!response) {
        throw new Error('API 回應為空');
      }

      if (response.Status !== '0000') {
        const errorMessage = response.Message || '查詢抽成資料失敗';
        throw new Error(errorMessage);
      }

      // 檢查是否有資料
      const chargeSettings = response.Data?.ChargeSettings || [];
      console.log('原始資料數量:', chargeSettings.length);

      // 轉換資料
      const businessModels = this.convertApiToBusinessModel(chargeSettings);

      console.log('資料轉換完成, 項目數:', businessModels.length);
      return businessModels;

    } catch (error) {
      console.error('載入抽成資料失敗:', error);
      throw error;
    }
  }

  /**
   * 建立完整的折扣項目列表（包含所有選項）- 參考 TLS13010 邏輯
   */
  private buildCompleteDiscountItems(existingDetails: any[], discountOptions: any[], contractStartDate: string, contractEndDate: string): any[] {
    const result: any[] = [];

    discountOptions?.forEach((option, index) => {
      const existingItem = existingDetails.find(detail => detail.cag_barcode === option.value);

      if (existingItem) {
        // 已設定的項目
        result.push({
          id: existingItem.id || this.generateTempId(),
          selected: true,
          cag_barcode: existingItem.cag_barcode,
          tlt_bdate: existingItem.tlt_bdate ? new Date(existingItem.tlt_bdate) : new Date(contractStartDate),
          tlt_edate: existingItem.tlt_edate ? new Date(existingItem.tlt_edate) : new Date(contractEndDate),
          cag_charge_rate: existingItem.cag_charge_rate || 0,
          _status: 'original',
          is_configured: true,
          is_enabled: true
        });
      } else {
        // 未設定的項目
        const isFirstOption = index === 0;
        const shouldSelectByDefault = isFirstOption &&
          (option.value === '000' || option.label?.includes('正品'));

        result.push({
          id: this.generateTempId(),
          selected: shouldSelectByDefault,
          cag_barcode: option.value,
          tlt_bdate: new Date(contractStartDate),
          tlt_edate: new Date(contractEndDate),
          cag_charge_rate: 0,
          _status: shouldSelectByDefault ? 'new' : 'new',
          is_configured: shouldSelectByDefault,
          is_enabled: shouldSelectByDefault
        });
      }
    });

    return result;
  }

  private convertApiToBusinessModel(apiData: any[]): ChargeSettingBusinessModel[] {
    return apiData.map((item, index) => {
      console.log(`轉換項目 ${index + 1}:`, item);

      return {
        id: item.id || (index + 1),
        apply_no: item.apply_no || 0,
        tlt_id: item.tlt_id || '',
        tlt_id_desc: item.tlt_id_desc || `抽成類別${index + 1}`,
        cag_bdate: item.cag_bdate || '',
        cag_edate: item.cag_edate || '',
        cag_taxtype: item.cag_taxtype || '1',
        sst_amount: item.sst_amount || null,
        sst_rate: item.sst_rate || null,
        cap_saletype1: item.cap_saletype1 || 'N',
        cap_saletype2: item.cap_saletype2 || 'N',
        cag_remark: item.cag_remark || '',

        _status: 'original' as const,
        _isExpanded: false,

        ChargeDetails: this.convertChargeDetails(item.ChargeDetails || []),
        YearChargeDetails: this.convertYearChargeDetails(item.YearChargeDetails || []),
        LevelChargeDetails: this.convertLevelChargeDetails(item.LevelChargeDetails || [])
      };
    });
  }

  private convertChargeDetails(apiDetails: any[]) {
    return apiDetails.map(detail => ({
      id: detail.id || null,
      apply_no: detail.apply_no || 0,
      tlt_id: detail.tlt_id || '',
      cag_barcode: detail.cag_barcode || '',
      tlt_bdate: detail.tlt_bdate || null,
      tlt_edate: detail.tlt_edate || null,
      cag_charge_rate: detail.cag_charge_rate || null,
      barcode_desc: detail.barcode_desc || '',
      is_configured: detail.is_configured || false,
      is_enabled: detail.is_enabled || false,
      _status: 'original' as const,
      _isSelected: false
    }));
  }

  private convertYearChargeDetails(apiDetails: any[]) {
    return apiDetails.map(detail => ({
      id: detail.id || 0,
      apply_no: detail.apply_no || 0,
      tlt_id: detail.tlt_id || '',
      tlt_bdate: detail.tlt_bdate || '',
      tlt_edate: detail.tlt_edate || '',
      year_amount: detail.year_amount || 0,
      extra_rate: detail.extra_rate || 0,
      _status: 'original' as const,
      _isSelected: false
    }));
  }

  private convertLevelChargeDetails(apiDetails: any[]) {
    return apiDetails.map(detail => ({
      id: detail.id || null,
      apply_no: detail.apply_no || 0,
      tlt_id: detail.tlt_id || '',
      seq_no: detail.seq_no || 1,
      cag_barcode: detail.cag_barcode || '',
      level_bmount: detail.level_bmount || null,
      level_eamount: detail.level_eamount || null,
      level_charge_rate: detail.level_charge_rate || null,
      barcode_desc: detail.barcode_desc || '',
      is_configured: detail.is_configured || false,
      is_enabled: detail.is_enabled || false,
      _status: 'original' as const,
      _isSelected: false
    }));
  }

  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }
}
