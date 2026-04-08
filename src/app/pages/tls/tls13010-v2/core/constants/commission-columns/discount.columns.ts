/**
 * 折扣設定欄位定義
 */
import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { DropdownOption } from '../../models/common.interface';

export function getDiscountColumns(discountOptions: DropdownOption[] = []): ColumnDef[] {
  return [
    {
      field: 'selected',
      header: '是否新增',
      type: 'checkbox',
      editable: true
    },
    {
      field: 'copy_button',
      header: '複製',
      type: 'button',
      buttonLabel: '複製',
      buttonIcon: 'pi pi-copy',
      buttonClass: 'p-button-sm p-button-secondary',
      buttonTooltip: '複製此折扣設定',
      editable: false
    },
    {
      field: 'cag_barcode',
      header: '折扣別',
      type: 'dropdown',
      editable: false,
      options: discountOptions
    },
    {
      field: 'tlt_bdate',
      header: '合約起始日',
      type: 'date',
      editable: true
    },
    {
      field: 'tlt_edate',
      header: '合約終止日',
      type: 'date',
      editable: true
    },
    {
      field: 'cag_charge_rate',
      header: '抽成率(%)',
      type: 'number',
      editable: true,
      allowDecimal: true,
      decimalPlaces: 2,
      useGrouping: false,
      maxValue: 100,
      minValue: 0
    }
  ];
}
