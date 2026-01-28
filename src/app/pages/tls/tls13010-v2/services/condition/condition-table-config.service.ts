/**
 * 條件設定表格配置服務
 * 負責各種抽成類型的表格欄位定義
 */
import { Injectable } from '@angular/core';
import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { CommissionType, CommissionTypeLabels } from '../../core/constants';

@Injectable({
  providedIn: 'root'
})
export class ConditionTableConfigService {

  /**
   * 獲取專櫃契約書資訊欄位配置
   */
  getContractInfoColumns(): ColumnDef[] {
    return [
      { field: 'apply_no', header: '專櫃招募編號', type: 'text', editable: false, autoWidth: true },
      { field: 'tlt_no', header: '專櫃編號', type: 'text', editable: false, autoWidth: true },
      { field: 'tlt_name', header: '品牌(專櫃)名稱', type: 'text', editable: false, autoWidth: true },
      { field: 'ven_uniform', header: '廠商統編', type: 'text', editable: false, autoWidth: true },
      { field: 'VEN_Name', header: '廠商名稱', type: 'text', editable: false, autoWidth: true },
      { field: 'contract_subno', header: '版本編號', type: 'text', editable: false, autoWidth: true },
      { field: 'tlt_bdate', header: '合約起始日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
      { field: 'tlt_edate', header: '合約終止日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
      { field: 'tlt_contract_bdate', header: '營運起始日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
      { field: 'tlt_contract_edate', header: '營運終止日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' }
    ];
  }

  /**
   * 獲取固定租金表格配置 (抽成別 = 1)
   * 欄位: cag_bdate, cag_edate, base_rent
   */
  getFixedRentColumns(): ColumnDef[] {
    return [
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
      { field: 'base_rent', header: '租金金額', type: 'number', editable: true, autoWidth: true }
    ];
  }

  /**
   * 獲取底租抽成取高者表格配置 (抽成別 = 2)
   * 欄位: cag_bdate, cag_edate, base_rent
   * 注意: cag_charge_rate 在 Step 3 已設定，此處只設定租金
   */
  getBaseRentHigherColumns(): ColumnDef[] {
    return [
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
      { field: 'base_rent', header: '租金金額', type: 'number', editable: true, autoWidth: true }
    ];
  }

  /**
   * 獲取包底抽成表格配置 (抽成別 = 4)
   * 欄位: cag_bdate, cag_edate, limit_amt, limit_charge_rate
   */
  getBaseCommissionColumns(): ColumnDef[] {
    return [
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
      { field: 'limit_amt', header: '包底金額', type: 'number', editable: true, autoWidth: true },
      {
        field: 'limit_charge_rate',
        header: '抽成率(%)',
        type: 'number',
        editable: true,
        autoWidth: true,
        allowDecimal: true
      }
    ];
  }

  /**
   * 獲取層級抽成表格配置 (抽成別 = 5)
   * 欄位: seq_no, cag_bdate, cag_edate, start_number, end_number, charge_rate
   */
  getGraduatedColumns(): ColumnDef[] {
    return [
      { field: 'seq_no', header: '帳務期別', type: 'number', editable: false, autoWidth: true },
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
      { field: 'start_number', header: '階梯金額(起值)', type: 'number', editable: true, autoWidth: true },
      { field: 'end_number', header: '階梯金額(迄值)', type: 'number', editable: true, autoWidth: true, maxValue: 9999999999999, minValue: 0 },
      {
        field: 'charge_rate',
        header: '抽成率(%)',
        type: 'number',
        editable: true,
        autoWidth: true,
        allowDecimal: true
      }
    ];
  }

  /**
   * 獲取包底加層級表格配置 (抽成別 = 6)
   * 欄位: seq_no, cag_bdate, cag_edate, limit_amt, start_number, end_number, charge_rate
   */
  getBaseTierColumns(): ColumnDef[] {
    return [
      { field: 'seq_no', header: '帳務期別', type: 'text', editable: false, autoWidth: true },
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
      { field: 'limit_amt', header: '包底金額', type: 'number', editable: true, autoWidth: true },
      { field: 'start_number', header: '階梯金額(起值)', type: 'number', editable: true, autoWidth: true },
      { field: 'end_number', header: '階梯金額(迄值)', type: 'number', editable: true, autoWidth: true, maxValue: 9999999999999, minValue: 0 },
      {
        field: 'charge_rate',
        header: '抽成率(%)',
        type: 'number',
        editable: true,
        autoWidth: true,
        allowDecimal: true
      }
    ];
  }

  /**
   * 根據抽成類型獲取對應的表格配置
   */
  getColumnsByCommissionType(commissionType: string): ColumnDef[] {
    switch (commissionType) {
      case CommissionType.FIXED_RENT:
        return this.getFixedRentColumns();
      case CommissionType.BASE_RENT_HIGHER:
        return this.getBaseRentHigherColumns();
      case CommissionType.BASE_COMMISSION:
        return this.getBaseCommissionColumns();
      case CommissionType.GRADUATED:
        return this.getGraduatedColumns();
      case CommissionType.BASE_TIER:
        return this.getBaseTierColumns();
      default:
        return [];
    }
  }

  /**
   * 獲取抽成類型名稱
   */
  getCommissionTypeName(commissionType: string): string {
    return CommissionTypeLabels[commissionType as CommissionType] || `未知類型(${commissionType})`;
  }

  /**
   * 獲取表格標題
   */
  getTableTitle(commissionType: string): string {
    return this.getCommissionTypeName(commissionType);
  }

  /**
   * 獲取空資料提示訊息
   */
  getEmptyMessage(commissionType: string): string {
    const title = this.getTableTitle(commissionType);
    return `尚未設定${title}項目`;
  }

  /**
   * 檢查是否支援該抽成類型的條件設定
   * 注意: 一般抽成(3)不需要條件設定
   */
  isSupportedConditionType(commissionType: string): boolean {
    return [
      CommissionType.FIXED_RENT,
      CommissionType.BASE_RENT_HIGHER,
      CommissionType.BASE_COMMISSION,
      CommissionType.GRADUATED,
      CommissionType.BASE_TIER
    ].includes(commissionType as CommissionType);
  }
}
