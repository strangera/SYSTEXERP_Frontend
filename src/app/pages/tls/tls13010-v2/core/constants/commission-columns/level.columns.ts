/**
 * 折扣別層級抽成設定欄位定義
 */
import { ColumnDef } from '@others/component/expandable-edit-table/expandable-edit-table.component';
import { DropdownOption } from '../../models/common.interface';

export function getLevelColumns(discountOptions: DropdownOption[] = []): ColumnDef[] {
  return [
    {
      field: 'selected',
      header: '是否新增',
      type: 'checkbox',
      editable: true
    },
    {
      field: 'copy_level_button',
      header: '複製',
      type: 'button',
      buttonIcon: 'pi pi-copy',
      buttonClass: 'p-button-sm p-button-secondary',
      buttonTooltip: '複製此折扣層級',
      style: 'width: 50px;',
      editable: false
    },
    {
      field: 'delete_level_button',
      header: '刪除',
      type: 'button',
      buttonIcon: 'pi pi-trash',
      buttonClass: 'p-button-sm p-button-danger',
      buttonTooltip: '刪除此折扣層級',
      style: 'width: 50px;',
      editable: false,
      showCondition: (rowData: unknown) => {
        const data = rowData as { _canDelete?: boolean };
        return data._canDelete !== false;
      }
    },
    {
      field: 'cag_barcode',
      header: '折扣別',
      type: 'dropdown',
      editable: false,
      options: discountOptions
    },
    {
      field: 'contract_period',
      header: '合約期間',
      type: 'text',
      editable: false
    },
    {
      field: 'level_bmount',
      header: '業績計算金額(起)',
      type: 'number',
      editable: true
    },
    {
      field: 'level_eamount',
      header: '業績計算金額(迄)',
      type: 'number',
      editable: true
    },
    {
      field: 'level_charge_rate',
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
