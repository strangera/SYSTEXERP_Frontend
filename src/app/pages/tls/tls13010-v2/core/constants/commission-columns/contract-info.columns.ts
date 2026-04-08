/**
 * 專櫃契約書資訊欄位定義
 */
import { TLS13010_DROPDOWN_OPTIONS } from '@pages/tls/shared/constants/tls13010.dropdown';
import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';


export function getContractInfoColumns(): ColumnDef[] {
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
    {
      field: 'tlt_ctype_mtotal',
      header: '包底類別',
      type: 'dropdown',
      editable: false,
      options: TLS13010_DROPDOWN_OPTIONS.tltCtypeMtotal,
      autoWidth: true
    },
    {
      field: 'overall_status',
      header: '超出部份處理方式',
      type: 'dropdown',
      editable: false,
      options: TLS13010_DROPDOWN_OPTIONS.overallStatus,
      autoWidth: true
    },
    { field: 'tlt_bdate', header: '合約起始日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
    { field: 'tlt_edate', header: '合約終止日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
    { field: 'tlt_contract_bdate', header: '營運起始日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
    { field: 'tlt_contract_edate', header: '營運終止日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' }
  ];
}
