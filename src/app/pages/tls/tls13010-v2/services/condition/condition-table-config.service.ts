/**
 * 條件設定表格配置服務
 * 委派給共用 V2ConditionTableConfigService
 */
import { Injectable } from '@angular/core';
import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { V2ConditionTableConfigService } from '../../../shared/services/v2-condition-table-config.service';
import { CommissionType, CommissionTypeLabels } from '../../core/constants';

@Injectable({
  providedIn: 'root'
})
export class ConditionTableConfigService {

  constructor(private sharedConfig: V2ConditionTableConfigService) {}

  // ===== 條件設定欄位（全部委派給共用服務） =====

  getContractInfoColumns(): ColumnDef[] { return this.sharedConfig.getContractInfoColumns(); }
  getFixedRentColumns(): ColumnDef[] { return this.sharedConfig.getFixedRentColumns(); }
  getBaseRentHigherColumns(): ColumnDef[] { return this.sharedConfig.getBaseRentHigherColumns(); }
  getBaseCommissionColumns(): ColumnDef[] { return this.sharedConfig.getBaseCommissionColumns(); }
  getGraduatedColumns(): ColumnDef[] { return this.sharedConfig.getGraduatedColumns(); }
  getBaseTierColumns(): ColumnDef[] { return this.sharedConfig.getBaseTierColumns(); }

  getColumnsByCommissionType(commissionType: string): ColumnDef[] {
    return this.sharedConfig.getColumnsByCommissionType(commissionType);
  }

  // ===== 工具方法 =====

  getCommissionTypeName(commissionType: string): string {
    return CommissionTypeLabels[commissionType as CommissionType] || `未知類型(${commissionType})`;
  }

  getTableTitle(commissionType: string): string {
    return this.getCommissionTypeName(commissionType);
  }

  getEmptyMessage(commissionType: string): string {
    return `尚未設定${this.getTableTitle(commissionType)}項目`;
  }

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
