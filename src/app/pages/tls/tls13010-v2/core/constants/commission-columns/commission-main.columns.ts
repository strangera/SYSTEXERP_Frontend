/**
 * 抽成項目主欄位定義
 */
import { TLS13010_DROPDOWN_OPTIONS } from '@pages/tls/shared/constants/tls13010.dropdown';
import { ColumnDef } from '@others/component/expandable-edit-table/expandable-edit-table.component';


export function getCommissionMainColumns(): ColumnDef[] {
  return [
    { field: 'tlt_id', header: '抽成類別', editable: false },
    { field: 'tlt_id_desc', header: '抽成類別名稱', editable: true },
    {
      field: 'cag_taxtype',
      header: '稅別',
      editable: true,
      type: 'dropdown',
      options: TLS13010_DROPDOWN_OPTIONS.cagTaxTypeOption,
      defaultValue: '0'
    },
    { field: 'sst_amount', header: '單筆交易金額(含)以上', editable: true, type: 'number', hidden: true },
    {
      field: 'sst_rate',
      header: '特價抽成(%)',
      editable: true,
      type: 'number',
      allowDecimal: true,
      decimalPlaces: 3,
      hidden: true
    },
    {
      field: 'remark',
      header: '折扣摘要',
      type: 'textarea',
      editable: false,
      style: 'max-width: 250px; white-space: pre-wrap; word-break: break-word; text-align: left;'
    },
    { field: 'cap_saletype2', header: '會員卡集點', editable: true, type: 'checkbox' },
    { field: 'cap_saletype1', header: '滿仟送佰', editable: true, type: 'checkbox' },
    { field: 'cap_saletype3', header: '收取禮劵', editable: true, type: 'checkbox' },
    { field: 'cap_saletype5', header: '收取商品提貨單', editable: true, type: 'checkbox' }
  ];
}
