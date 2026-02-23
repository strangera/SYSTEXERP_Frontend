import { Injectable } from '@angular/core';
import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { V1ConditionTableConfigService } from '../../shared/services/v1-condition-table-config.service';
import { TLS13010_DROPDOWN_OPTIONS } from './../../tls13010/tls13010.dropdown';
import { getContractInfoColumns as getSharedContractInfoColumns } from '../../tls13010-v2/core/constants/commission-columns';

/**
 * TLS13010 表格配置管理服務
 * 條件設定欄位委派給共用 V1ConditionTableConfigService
 */
@Injectable({
  providedIn: 'root'
})
export class TableConfigManager {

  constructor(private sharedConfig: V1ConditionTableConfigService) {}

  // ===== 折扣選項（委派給共用服務） =====

  setDiscountOptions(options: any[]): void {
    this.sharedConfig.setDiscountOptions(options);
  }

  // ===== 契約資訊（統一使用 contract-info.columns.ts） =====

  getContractInfoColumns(): ColumnDef[] {
    return getSharedContractInfoColumns();
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

  updateGeneralCommissionDiscountOptions(): void {
    // 折扣選項載入後被調用，實際更新在組件中處理
  }
}
