import { TLS13010_DROPDOWN_OPTIONS } from './../../tls13010/tls13010.dropdown';
import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Injectable } from '@angular/core';

/**
 * 表格配置管理服務
 * 負責各種表格的欄位定義和配置管理
 */
@Injectable({
  providedIn: 'root'
})
export class TLS12040TableConfigManager {

  private discountOptions: any[] = [];

  /**
   * 設定折扣選項
   */
  setDiscountOptions(options: any[]): void {
    this.discountOptions = options;
  }

  /**
   * 獲取契約資訊表格配置
   */
  getContractInfoColumns(): ColumnDef[] {
    return [
      { field: 'apply_no', header: '專櫃招募編號', type: 'text', editable: false, autoWidth: true },
      { field: 'tlt_no', header: '專櫃編號', type: 'text', editable: false, autoWidth: true },
      { field: 'tlt_name', header: '品牌(專櫃)名稱', type: 'text', editable: false, autoWidth: true },
      { field: 'ven_uniform', header: '廠商統編', type: 'text', editable: false, autoWidth: true },
      { field: 'VEN_Name', header: '廠商名稱', type: 'text', editable: false, autoWidth: true },
      { field: 'contract_subno', header: '版本編號', type: 'text', editable: false, autoWidth: true },
      {
        field: 'tlt_term_type',
        header: '抽成別',
        type: 'dropdown',
        editable: false,
        options: TLS13010_DROPDOWN_OPTIONS.tltTermType,
        autoWidth: true
      },
      { field: 'tlt_bdate', header: '合約起始日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
      { field: 'tlt_edate', header: '合約終止日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
      { field: 'tlt_contract_bdate', header: '營運起始日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
      { field: 'tlt_contract_edate', header: '營運終止日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' }
    ];
  }

  /**
   * 獲取固定租金表格配置
   */
  getFixedRentColumns(): ColumnDef[] {
    return [
      // { field: 'seq_no', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
      { field: 'base_rent', header: '租金金額', type: 'number', editable: true, autoWidth: true }
    ];
  }

  /**
   * 獲取底租抽成取高者表格配置
   */
  getBaseRentHigherColumns(): ColumnDef[] {
    return [
      // { field: 'seq_no', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
      { field: 'base_rent', header: '租金金額', type: 'number', editable: true, autoWidth: true },
      // {
      //   field: 'cag_charge_rate',
      //   header: '抽成率',
      //   type: 'number',
      //   editable: true,
      //   autoWidth: true,
      //   allowDecimal: true,
      //   decimalPlaces: 4
      // }
    ];
  }

  /**
   * 獲取一般抽成表格配置
   */
  getGeneralCommissionColumns(): ColumnDef[] {
    return [
      { field: 'tlt_id', header: '抽成類別', type: 'text', editable: false, autoWidth: true, readonly: true },
      { field: 'tlt_id_desc', header: '抽成類別名稱', type: 'text', editable: false, autoWidth: true, readonly: true },
      {
        field: 'cag_taxtype',
        header: '稅別',
        type: 'dropdown',
        editable: false,
        autoWidth: true,
        readonly: true,
        options: [
          { label: '應稅', value: '1' },
          { label: '免稅', value: '2' },
          { label: '零稅率', value: '3' }
        ]
      },
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
      {
        field: 'cag_barcode',
        header: '折扣別',
        type: 'dropdown',
        editable: true,
        autoWidth: true,
        options: this.discountOptions
      },
      {
        field: 'cag_charge_rate',
        header: '抽成率',
        type: 'number',
        editable: true,
        autoWidth: true,
        allowDecimal: true,
        decimalPlaces: 4
      }
    ];
  }

  /**
   * 獲取包底抽成表格配置
   */
  getBaseCommissionColumns(): ColumnDef[] {
    return [
      // { field: 'seq_no', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
      { field: 'limit_amt', header: '包底金額', type: 'number', editable: true, autoWidth: true },
      {
        field: 'limit_charge_rate',
        header: '抽成率',
        type: 'number',
        editable: true,
        autoWidth: true,
        allowDecimal: true,
        decimalPlaces: 4
      }
    ];
  }

  /**
   * 獲取層級抽成表格配置
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
        header: '抽成率',
        type: 'number',
        editable: true,
        autoWidth: true,
        allowDecimal: true,
        decimalPlaces: 4
      }
    ];
  }

  /**
   * 獲取包底加層級表格配置
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
        header: '抽成率',
        type: 'number',
        editable: true,
        autoWidth: true,
        allowDecimal: true,
        decimalPlaces: 4
      }
    ];
  }

  /**
   * 根據抽成類型獲取對應的表格配置
   */
  getColumnsByCommissionType(commissionType: string): ColumnDef[] {
    switch (commissionType) {
      case '1':
        return this.getFixedRentColumns();
      case '2':
        return this.getBaseRentHigherColumns();
      case '3':
        return this.getGeneralCommissionColumns();
      case '4':
        return this.getBaseCommissionColumns();
      case '5':
        return this.getGraduatedColumns();
      case '6':
        return this.getBaseTierColumns();
      default:
        return [];
    }
  }

  /**
   * 獲取表格標題
   */
  getTableTitle(commissionType: string): string {
    switch (commissionType) {
      case '1':
        return '固定租金';
      case '2':
        return '底租抽成取高者';
      case '3':
        return '一般抽成';
      case '4':
        return '包底抽成';
      case '5':
        return '層級抽成';
      case '6':
        return '包底加層級';
      default:
        return '未知類型';
    }
  }

  /**
   * 獲取空資料提示訊息
   */
  getEmptyMessage(commissionType: string): string {
    const title = this.getTableTitle(commissionType);
    return `尚未設定${title}項目`;
  }

  /**
   * 更新一般抽成的折扣選項
   */
  updateGeneralCommissionDiscountOptions(): void {
    // 這個方法會在折扣選項載入後被調用
    // 實際的欄位更新會在組件中處理
  }

  /**
   * 檢查是否支援該抽成類型
   */
  isSupportedCommissionType(commissionType: string): boolean {
    return ['1', '2', '3', '4', '5', '6'].includes(commissionType);
  }

  /**
   * 獲取抽成類型名稱
   */
  getCommissionTypeName(commissionType: string): string {
    switch (commissionType) {
      case '1': return '固定租金';
      case '2': return '底租抽成取高者';
      case '3': return '一般抽成';
      case '4': return '包底抽成';
      case '5': return '層級抽成';
      case '6': return '包底加層級';
      default: return `未知類型(${commissionType})`;
    }
  }
}
