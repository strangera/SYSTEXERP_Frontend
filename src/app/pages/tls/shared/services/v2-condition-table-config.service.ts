import { Injectable } from '@angular/core';
import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';

/**
 * V2 共用條件設定表格配置服務
 * 供 tls13010-v2、tls12040-v2 共用
 */
@Injectable({
  providedIn: 'root'
})
export class V2ConditionTableConfigService {

  // ===== 條件設定表格欄位 =====

  getFixedRentColumns(): ColumnDef[] {
    return [
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, style: 'width: 33%' },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, style: 'width: 33%' },
      { field: 'base_rent', header: '租金金額', type: 'number', editable: true, style: 'width: 33%' }
    ];
  }

  getBaseRentHigherColumns(): ColumnDef[] {
    return [
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, style: 'width: 33%' },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, style: 'width: 33%' },
      { field: 'base_rent', header: '租金金額', type: 'number', editable: true, style: 'width: 33%' }
    ];
  }

  getBaseCommissionColumns(): ColumnDef[] {
    return [
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, style: 'width: 25%' },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, style: 'width: 25%' },
      { field: 'limit_amt', header: '包底金額', type: 'number', editable: true, style: 'width: 25%' },
      {
        field: 'limit_charge_rate',
        header: '抽成率(%)',
        type: 'number',
        editable: true,
        style: 'width: 25%',
        allowDecimal: true
      }
    ];
  }

  getGraduatedColumns(): ColumnDef[] {
    const w = 'width: 16%';
    return [
      { field: 'seq_no', header: '帳務期別', type: 'number', editable: false, style: w },
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, style: w },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, style: w },
      { field: 'start_number', header: '階梯金額(起值)', type: 'number', editable: true, style: w },
      { field: 'end_number', header: '階梯金額(迄值)', type: 'number', editable: true, style: w, maxValue: 9999999999999, minValue: 0 },
      {
        field: 'charge_rate',
        header: '抽成率(%)',
        type: 'number',
        editable: true,
        style: w,
        allowDecimal: true
      }
    ];
  }

  getBaseTierColumns(): ColumnDef[] {
    const w = 'width: 14%';
    return [
      { field: 'seq_no', header: '帳務期別', type: 'text', editable: false, style: w },
      { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, style: w },
      { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, style: w },
      { field: 'limit_amt', header: '包底金額', type: 'number', editable: true, style: w },
      { field: 'start_number', header: '階梯金額(起值)', type: 'number', editable: true, style: w },
      { field: 'end_number', header: '階梯金額(迄值)', type: 'number', editable: true, style: w, maxValue: 9999999999999, minValue: 0 },
      {
        field: 'charge_rate',
        header: '抽成率(%)',
        type: 'number',
        editable: true,
        style: w,
        allowDecimal: true
      }
    ];
  }

  // ===== 契約資訊欄位 =====

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

  // ===== 工具方法 =====

  getColumnsByCommissionType(commissionType: string): ColumnDef[] {
    switch (commissionType) {
      case '1': return this.getFixedRentColumns();
      case '2': return this.getBaseRentHigherColumns();
      case '4': return this.getBaseCommissionColumns();
      case '5': return this.getGraduatedColumns();
      case '6': return this.getBaseTierColumns();
      default: return [];
    }
  }

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

  getTableTitle(commissionType: string): string {
    return this.getCommissionTypeName(commissionType);
  }

  getEmptyMessage(commissionType: string): string {
    return `尚未設定${this.getTableTitle(commissionType)}項目`;
  }

  isSupportedConditionType(commissionType: string): boolean {
    return ['1', '2', '4', '5', '6'].includes(commissionType);
  }
}
