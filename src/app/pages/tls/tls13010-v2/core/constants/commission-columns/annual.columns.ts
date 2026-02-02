/**
 * 年度總業績抽成設定欄位定義
 */
import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';

export function getAnnualColumns(): ColumnDef[] {
  return [
    {
      field: 'tlt_bdate',
      header: '帳務起',
      type: 'date',
      editable: true
    },
    {
      field: 'tlt_edate',
      header: '帳務迄',
      type: 'date',
      editable: true
    },
    {
      field: 'year_amount',
      header: '業績超過金額含',
      type: 'number',
      editable: true
    },
    {
      field: 'extra_rate',
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
