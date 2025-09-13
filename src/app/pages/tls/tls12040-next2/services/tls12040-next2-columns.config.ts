import { SHARED_DROPDOWN_OPTIONS } from '@shared/constants/business.constants';
import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
export class TLS12040Next2ColumnsConfig {

  static getContractInfoColumns(): ColumnDef[] {
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
        options: SHARED_DROPDOWN_OPTIONS.tltTermType,
        autoWidth: true
      },
      { field: 'tlt_bdate', header: '合約起始日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
      { field: 'tlt_edate', header: '合約終止日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
      { field: 'tlt_contract_bdate', header: '營運起始日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
      { field: 'tlt_contract_edate', header: '營運終止日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' }
    ];
  }

  static getDiscountColumns(discountOptions: any[] = []): ColumnDef[] {
    return [
      {
        field: 'is_selected',
        header: '是否新增',
        type: 'checkbox',
        editable: true,
        directEdit: true,
        width: '60px',
        autoEditOnSelect: true,
        autoSaveOnUnselect: true,
      },
      {
        field: 'copy_button',
        header: '複製',
        type: 'button',
        width: '60px',
        buttonLabel: '複製',
        buttonIcon: 'pi pi-copy',
        buttonClass: 'p-button-sm p-button-secondary',
        buttonTooltip: '複製此折扣設定',
        editable: false

      },
      { field: 'cag_barcode', header: '折扣別', type: 'dropdown', editable: false, options: discountOptions },
      { field: 'tlt_bdate', header: '合約起始日', type: 'date', editable: true },
      { field: 'tlt_edate', header: '合約終止日', type: 'date', editable: true },
      { field: 'cag_charge_rate', header: '抽成率', type: 'number', editable: true, allowDecimal: true, decimalPlaces: 4 }
    ];
  }

  static getAnnualColumns(): ColumnDef[] {
    return [
      { field: 'tlt_bdate', header: '帳務起', type: 'date', editable: true },
      { field: 'tlt_edate', header: '帳務迄', type: 'date', editable: true },
      { field: 'year_amount', header: '業績超過金額含', type: 'number', editable: true },
      { field: 'extra_rate', header: '抽成率', type: 'number', editable: true, allowDecimal: true, decimalPlaces: 4 }
    ];
  }

  static getLevelColumns(discountOptions: any[] = []): ColumnDef[] {
    return [
      {
        field: 'is_selected',
        header: '是否新增',
        type: 'checkbox',
        editable: true,
        directEdit: true,
        width: '60px',
        autoEditOnSelect: true,
        autoSaveOnUnselect: true,
      },
      {
        field: 'copy_button',
        header: '複製',
        type: 'button',
        width: '60px',
        buttonLabel: '複製',
        buttonIcon: 'pi pi-copy',
        buttonClass: 'p-button-sm p-button-secondary',
        buttonTooltip: '複製此扣款項目',
        editable: false
      },
      { field: 'cag_barcode', header: '折扣別', type: 'dropdown', editable: false, options: discountOptions },
      { field: 'level_bmount', header: '業績計算金額(起)', type: 'number', editable: true },
      { field: 'level_eamount', header: '業績計算金額(迄)', type: 'number', editable: true },
      { field: 'level_charge_rate', header: '抽成率', type: 'number', editable: true, allowDecimal: true, decimalPlaces: 4 }
    ];
  }

  static getCommissionColumns(): ColumnDef[] {
    return [
      { field: 'tlt_id', header: '抽成類別', editable: false },
      { field: 'tlt_id_desc', header: '抽成類別名稱', editable: true },
      { field: 'cag_taxtype', header: '稅別', editable: true, type: 'dropdown', options: SHARED_DROPDOWN_OPTIONS.cagTaxTypeOption },
      { field: 'sst_amount', header: '單筆交易金額(含)以上', editable: true, type: 'number' },
      { field: 'sst_rate', header: '特價抽成(%)', editable: true, type: 'number', allowDecimal: true, decimalPlaces: 3 },
      { field: 'cap_saletype2', header: '全館消費滿額集點活動', editable: true, type: 'checkbox' },
      { field: 'cap_saletype1', header: '滿件送佰', editable: true, type: 'checkbox' }
    ];
  }
}
