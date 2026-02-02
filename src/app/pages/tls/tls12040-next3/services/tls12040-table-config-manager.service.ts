import { Injectable } from '@angular/core';
import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { V1ConditionTableConfigService } from '../../shared/services/v1-condition-table-config.service';
import { TLS13010_DROPDOWN_OPTIONS } from './../../tls13010/tls13010.dropdown';

/**
 * TLS12040 表格配置管理服務
 * 條件設定欄位委派給共用 V1ConditionTableConfigService
 */
@Injectable({
  providedIn: 'root'
})
export class TLS12040TableConfigManager {

  constructor(private sharedConfig: V1ConditionTableConfigService) {}

  // ===== 折扣選項（委派給共用服務） =====

  setDiscountOptions(options: any[]): void {
    this.sharedConfig.setDiscountOptions(options);
  }

  // ===== 契約資訊（TLS12040 專用，含抽成別 dropdown） =====

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

  // ===== 條件設定欄位（全部委派給共用服務） =====

  getFixedRentColumns(): ColumnDef[] { return this.sharedConfig.getFixedRentColumns(); }
  getBaseRentHigherColumns(): ColumnDef[] { return this.sharedConfig.getBaseRentHigherColumns(); }
  getGeneralCommissionColumns(): ColumnDef[] { return this.sharedConfig.getGeneralCommissionColumns(); }
  getBaseCommissionColumns(): ColumnDef[] { return this.sharedConfig.getBaseCommissionColumns(); }
  getGraduatedColumns(): ColumnDef[] { return this.sharedConfig.getGraduatedColumns(); }
  getBaseTierColumns(): ColumnDef[] { return this.sharedConfig.getBaseTierColumns(); }

  getColumnsByCommissionType(commissionType: string): ColumnDef[] {
    return this.sharedConfig.getColumnsByCommissionType(commissionType);
  }

  // ===== 工具方法（委派給共用服務） =====

  getTableTitle(commissionType: string): string { return this.sharedConfig.getTableTitle(commissionType); }
  getEmptyMessage(commissionType: string): string { return this.sharedConfig.getEmptyMessage(commissionType); }
  isSupportedCommissionType(commissionType: string): boolean { return this.sharedConfig.isSupportedCommissionType(commissionType); }
  getCommissionTypeName(commissionType: string): string { return this.sharedConfig.getCommissionTypeName(commissionType); }
}
