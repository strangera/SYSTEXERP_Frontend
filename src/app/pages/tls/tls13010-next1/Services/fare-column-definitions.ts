import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { TableValidators } from '@shared/componentkit/expandable-edit-table/table-validation.interface';
import { TLS13010_DROPDOWN_OPTIONS } from './../../tls13010/tls13010.dropdown';

/**
 * 扣款項目欄位定義
 * 將所有表格欄位定義集中管理
 */
export class FareColumnDefinitions {

  /**
   * 取得合約資訊欄位定義
   */
  static getContractInfoColumns(): ColumnDef[] {
    return [
      {
        field: 'apply_no',
        header: '專櫃招募編號',
        type: 'text',
        editable: false,
        autoWidth: true
      },
      {
        field: 'tlt_no',
        header: '專櫃編號',
        type: 'text',
        editable: false,
        autoWidth: true
      },
      {
        field: 'tlt_name',
        header: '品牌(專櫃)名稱',
        type: 'text',
        editable: false,
        autoWidth: true
      },
      {
        field: 'ven_uniform',
        header: '廠商統編',
        type: 'text',
        editable: false,
        autoWidth: true
      },
      {
        field: 'VEN_Name',
        header: '廠商名稱',
        type: 'text',
        editable: false,
        autoWidth: true
      },
      {
        field: 'contract_subno',
        header: '版本編號',
        type: 'text',
        editable: false,
        autoWidth: true
      },
      {
        field: 'tlt_term_type',
        header: '抽成別',
        type: 'dropdown',
        editable: false,
        options: TLS13010_DROPDOWN_OPTIONS.tltTermType,
        autoWidth: true
      },
      {
        field: 'tlt_bdate',
        header: '合約起始日',
        type: 'date',
        editable: false,
        autoWidth: true,
        dateFormat: 'full-date'
      },
      {
        field: 'tlt_edate',
        header: '合約終止日',
        type: 'date',
        editable: false,
        autoWidth: true,
        dateFormat: 'full-date'
      },
      {
        field: 'tlt_contract_bdate',
        header: '營運起始日',
        type: 'date',
        editable: false,
        autoWidth: true,
        dateFormat: 'full-date'
      },
      {
        field: 'tlt_contract_edate',
        header: '營運終止日',
        type: 'date',
        editable: false,
        autoWidth: true,
        dateFormat: 'full-date'
      }
    ];
  }

  /**
   * 取得 A 類型（一次扣款）欄位定義
   */
  static getDeductionAColumns(contractInfoData: any[] = []): ColumnDef[] {
    return [
      {
        field: 'is_selected',
        header: '新增',
        type: 'checkbox',
        editable: true,
        autoWidth: true,
      },
      {
        field: 'copy_button',
        header: '複製',
        type: 'button',
        // buttonLabel: '複製',
        // buttonLabel: '',
        buttonIcon: 'pi pi-copy',
        buttonClass: 'p-button-sm p-button-secondary',
        buttonTooltip: '複製此扣款項目',
        style: 'width: 50px;'
      },
      {
        field: 'cap_item',
        header: '扣款代號',
        type: 'text',
        editable: false,

      },
      {
        field: 'cap_name',
        header: '扣款名稱',
        type: 'text',
        editable: false,
        autoWidth: true,

      },
      {
        field: 'tpy_bdate',
        header: '起始年月',
        type: 'date',
        editable: true,
        dateFormat: 'year-month',
        required: true,

        defaultValueFunction: () => {
          if ((this as any)?._isCopiedItem) {
            return null; // 保持現有值
          }
          const contractInfo = contractInfoData[0];
          if (contractInfo?.tlt_contract_bdate) {
            return new Date(contractInfo.tlt_contract_bdate);
          }
          return null;
        }
      },
      {
        field: 'tpy_type',
        header: '單位',
        type: 'dropdown',
        editable: true,
        options: TLS13010_DROPDOWN_OPTIONS.tpyTypeOption,
        required: true,

      },
      {
        field: 'tpy_unitamt',
        header: '單價',
        type: 'number',
        editable: true,
        required: true,

        validators: [TableValidators.positive('單價必須大於0')]
      },
      {
        field: 'tpy_qty',
        header: '數量',
        type: 'number',
        editable: true,
        required: true,
        validators: [TableValidators.positive('數量必須大於0')],
        allowDecimal: true, // 是否允許小數點
        decimalPlaces: 3  // 小數位數，預設2位
      },
      {
        field: 'tpy_amount',
        header: '扣款金額(未稅)',
        type: 'number',
        editable: false,
        autoWidth: true,
        required: true,

      },
      {
        field: 'org_id',
        header: '組織',
        type: 'dropdown',
        editable: true,
        options: [], // 需要動態設定
        required: false,
        hidden: true,
      },
      {
        field: 'gui_flag',
        header: '開立發票',
        type: 'dropdown',
        editable: true,
        autoWidth: true,
        options: [
          { label: '開立', value: 'Y' },
          { label: '未開立', value: 'N' }
        ],
        required: true,
      }
    ];
  }

  /**
   * 取得 B 類型（每月扣款）欄位定義
   */
  static getDeductionBColumns(contractInfoData: any[] = []): ColumnDef[] {
    return [
      {
        field: 'is_selected',
        header: '新增',
        type: 'checkbox',
        editable: true,

        // autoEditOnSelect: true,
        // autoSaveOnUnselect: true,
      },
      {
        field: 'copy_button',
        header: '複製',
        type: 'button',
        // buttonLabel: '複製',
        // buttonLabel: '',
        buttonIcon: 'pi pi-copy',
        buttonClass: 'p-button-sm p-button-secondary',
        buttonTooltip: '複製此扣款項目',
        style: 'width: 50px;'
      },
      {
        field: 'cap_item',
        header: '扣款代號',
        type: 'text',
        editable: false,
      },
      {
        field: 'cap_name',
        header: '扣款名稱',
        type: 'text',
        editable: false,
        autoWidth: true,
      },
      {
        field: 'tpy_bdate',
        header: '扣款起始年月',
        type: 'date',
        editable: true,
        autoWidth: true,
        dateFormat: 'year-month',
        required: true,

        defaultValueFunction: () => {
          if ((this as any)?._isCopiedItem) {
            return null; // 保持現有值
          }
          const contractInfo = contractInfoData[0];
          if (contractInfo?.tlt_contract_bdate) {
            return new Date(contractInfo.tlt_contract_bdate);
          }
          return null;
        }
      },
      {
        field: 'tpy_edate',
        header: '扣款結束年月',
        type: 'date',
        editable: true,
        dateFormat: 'year-month',
        required: true,

        defaultValueFunction: () => {
          if ((this as any)?._isCopiedItem) {
            return null; // 保持現有值
          }
          const contractInfo = contractInfoData[0];
          if (contractInfo?.tlt_contract_edate) {
            return new Date(contractInfo.tlt_contract_edate);
          }
          return null;
        }
      },
      {
        field: 'tpy_type',
        header: '單位',
        type: 'dropdown',
        editable: true,
        options: TLS13010_DROPDOWN_OPTIONS.tpyTypeOption,
        autoWidth: true,
        required: true,

      },
      {
        field: 'tpy_unitamt',
        header: '單價',
        type: 'number',
        editable: true,
        required: true,
        validators: [TableValidators.positive('單價必須大於0')],
      },
      {
        field: 'tpy_qty',
        header: '數量',
        type: 'number',
        allowDecimal: true,
        editable: true,
        required: true,
        validators: [TableValidators.positive('數量必須大於0')],
      },
      {
        field: 'tpy_amount',
        header: '扣款金額(未稅)',
        type: 'number',
        editable: false,
      },
      {
        field: 'gui_flag',
        header: '是否開立發票',
        type: 'dropdown',
        editable: true,
        options: [
          { label: '開立', value: 'Y' },
          { label: '未開立', value: 'N' }
        ],
        required: true,
      },
      {
        field: 'day_account',
        header: '是否以日計算',
        type: 'dropdown',
        editable: true,
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' }
        ],
        required: true,
      },
      {
        field: 'interval',
        header: '扣款週期數(月)',
        type: 'number',
        editable: true,
        required: true,
      }
    ];
  }

  /**
   * 取得 C 類型（平均分攤）欄位定義
   */
  static getDeductionCColumns(contractInfoData: any[] = []): ColumnDef[] {
    return [
      {
        field: 'is_selected',
        header: '新增',
        type: 'checkbox',
        editable: true,

        // autoEditOnSelect: true,
        // autoSaveOnUnselect: true,
      },
      {
        field: 'copy_button',
        header: '複製',
        type: 'button',
        // buttonLabel: '複製',
        buttonIcon: 'pi pi-copy',
        buttonClass: 'p-button-sm p-button-secondary',
        buttonTooltip: '複製此扣款項目',

      },
      {
        field: 'auto_calc',
        header: '自動計算',
        type: 'button',
        // buttonLabel: '自動計算',
        buttonIcon: 'pi pi-calculator',
        buttonClass: 'p-button-sm p-button-info',
        buttonTooltip: '根據總金額自動計算',

      },
      {
        field: 'cap_item',
        header: '扣款代號',
        type: 'text',
        editable: false,

      },
      {
        field: 'cap_name',
        header: '扣款名稱',
        type: 'text',
        editable: false,
        autoWidth: true,

      },
      {
        field: 'tpy_bdate',
        header: '扣款起始年月',
        type: 'date',
        editable: true,
        dateFormat: 'year-month',
        required: true,

        defaultValueFunction: () => {
          const contractInfo = contractInfoData[0];
          if (contractInfo?.tlt_contract_bdate) {
            return new Date(contractInfo.tlt_contract_bdate);
          }
          return null;
        }
      },
      {
        field: 'tpy_edate',
        header: '扣款結束年月',
        type: 'date',
        editable: true,
        dateFormat: 'year-month',
        required: true,

        defaultValueFunction: () => {
          const contractInfo = contractInfoData[0];
          if (contractInfo?.tlt_contract_edate) {
            return new Date(contractInfo.tlt_contract_edate);
          }
          return null;
        }
      },
      {
        field: 'tpy_totalamt',
        header: '總金額',
        type: 'number',
        editable: true,
        autoWidth: true,
        required: true,

      },
      {
        field: 'period_nos',
        header: '期數',
        type: 'number',
        editable: false, // 設為不可編輯，因為要自動計算
        // 關鍵：為期數添加動態預設值函數
        defaultValueFunction: () => {
          const contractInfo = contractInfoData[0];
          if (contractInfo?.tlt_contract_bdate && contractInfo?.tlt_contract_edate) {
            try {
              const startDate = new Date(contractInfo.tlt_contract_bdate);
              const endDate = new Date(contractInfo.tlt_contract_edate);

              // 檢查日期有效性
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.warn('⚠️ 合約日期無效，期數預設為 1');
                return 1;
              }

              // 計算期數
              if (startDate <= endDate) {
                const startYear = startDate.getFullYear();
                const startMonth = startDate.getMonth();
                const endYear = endDate.getFullYear();
                const endMonth = endDate.getMonth();

                const calculatedPeriods = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
                const finalPeriods = Math.max(1, calculatedPeriods);

                console.log('🎯 期數預設值計算:', {
                  合約起始: `${startYear}/${startMonth + 1}`,
                  合約結束: `${endYear}/${endMonth + 1}`,
                  計算期數: finalPeriods
                });

                return finalPeriods;
              } else {
                console.warn('⚠️ 合約起始日期大於結束日期，期數預設為 1');
                return 1;
              }
            } catch (error) {
              console.error('❌ 期數預設值計算錯誤:', error);
              return 1;
            }
          }

          console.log('📝 沒有合約日期資訊，期數預設為 1');
          return 1;
        }
      },
      {
        field: 'tpy_amount',
        header: '每月金額',
        type: 'number',
        editable: true,
        autoWidth: true,
        required: true,

      },
      {
        field: 'down_payment',
        header: '首期金額',
        type: 'number',
        editable: false,
        required: true,
      },
      {
        field: 'org_id',
        header: '組織',
        type: 'dropdown',
        editable: true,
        options: [], // 需要動態設定
        required: false,
        hidden: true,
      },
      {
        field: 'gui_flag',
        header: '是否開立發票',
        type: 'dropdown',
        editable: true,
        options: [
          { label: '開立', value: 'Y' },
          { label: '未開立', value: 'N' }
        ],
        required: true,
      }
    ];
  }

  /**
   * 取得 D 類型（比率分攤）欄位定義
   */
  static getDeductionDColumns(contractInfoData: any[] = []): ColumnDef[] {
    return [
      {
        field: 'is_selected',
        header: '新增',
        type: 'checkbox',
        editable: true,

        // autoEditOnSelect: true,
        // autoSaveOnUnselect: true,
      },
      {
        field: 'copy_button',
        header: '複製',
        type: 'button',
        // buttonLabel: '複製',
        buttonIcon: 'pi pi-copy',
        buttonClass: 'p-button-sm p-button-secondary',
        buttonTooltip: '複製此扣款項目',

      },
      {
        field: 'cap_item',
        header: '扣款代號',
        type: 'text',
        editable: false,
      },
      {
        field: 'cap_name',
        header: '扣款名稱',
        type: 'text',
        editable: false,
        autoWidth: true,
        style: 'white-space: normal; word-break: break-word; line-height: 1.3; max-width: 150px; min-width: 100px;'
      },
      {
        field: 'cap_saletype',
        header: '銷售類型',
        type: 'dropdown',
        editable: true,
        autoWidth: true,
        options: TLS13010_DROPDOWN_OPTIONS.capSaletypeOptions,
      },
      {
        field: 'instms_type',
        header: '期數',
        type: 'dropdown',
        editable: true,
        autoWidth: true,
        options: TLS13010_DROPDOWN_OPTIONS.instmsTypeOptions,
      },
      {
        field: 'edc_bank',
        header: '收單行',
        type: 'dropdown',
        editable: true,
        autoWidth: true,
        options: TLS13010_DROPDOWN_OPTIONS.edcBankOptions,
      },
      {
        field: 'pay_no',
        header: '支付編號',
        type: 'dropdown',
        editable: true,
        autoWidth: true,
        options: [],
      },
      {
        field: 'calc_type',
        header: '券類計算方式',
        type: 'dropdown',
        editable: true,
        autoWidth: true,
        options: TLS13010_DROPDOWN_OPTIONS.calcTypeOptions,
      },
      {
        field: 'over_base_rate',
        header: '超過基準比率',
        type: 'number',
        editable: true,
        autoWidth: true,
      },
      {
        field: 'rent_plus_rate',
        header: '加抽比率',
        type: 'number',
        editable: true,
        required: true,
        allowDecimal: true,
        decimalPlaces: 3,
        autoWidth: true,
        style: 'min-width: 80px; width: 100px;',
      },
      {
        field: 'down_payment',
        header: '超過基準金額',
        type: 'number',
        editable: true,
        autoWidth: true,
      },
      {
        field: 'tpy_bdate',
        header: '扣款起始年月',
        type: 'date',
        editable: true,
        autoWidth: true,
        dateFormat: 'year-month',
        style: 'min-width: 120px; width: 140px;',
        required: true,

        defaultValueFunction: () => {
          const contractInfo = contractInfoData[0];
          if (contractInfo?.tlt_contract_bdate) {
            return new Date(contractInfo.tlt_contract_bdate);
          }
          return null;
        }
      },
      {
        field: 'tpy_edate',
        header: '扣款結束年月',
        type: 'date',
        editable: true,
        dateFormat: 'year-month',
        required: true,
        style: 'min-width: 120px; width: 140px;',
        defaultValueFunction: () => {
          const contractInfo = contractInfoData[0];
          if (contractInfo?.tlt_contract_edate) {
            return new Date(contractInfo.tlt_contract_edate);
          }
          return null;
        }
      },
      {
        field: 'tpy_type',
        header: '單位',
        type: 'dropdown',
        editable: true,
        options: TLS13010_DROPDOWN_OPTIONS.tpyTypeOption,
        autoWidth: true,
        required: true,

      },
      {
        field: 'tpy_rate',
        header: '比率',
        type: 'number',
        editable: true,
        required: true,
        allowDecimal: true,
        decimalPlaces: 3,
        style: 'min-width: 80px; width: 100px;', // 加寬讓數字可以完整顯示
      },
      {
        field: 'org_id',
        header: '組織',
        type: 'dropdown',
        editable: true,
        options: [], // 需要動態設定
        required: false,
        hidden: true,
      },
      {
        field: 'gui_flag',
        header: '是否開立發票',
        type: 'dropdown',
        editable: true,
        options: [
          { label: '開立', value: 'Y' },
          { label: '未開立', value: 'N' }
        ],
        required: true,
      }
    ];
  }

  /**
   * 取得 E 類型（活動扣款）欄位定義
   */
  static getDeductionEColumns(contractInfoData: any[] = []): ColumnDef[] {
    return [
      {
        field: 'is_selected',
        header: '新增',
        type: 'checkbox',
        editable: true,

        // autoEditOnSelect: true,
        // autoSaveOnUnselect: true,
      },
      {
        field: 'copy_button',
        header: '複製',
        type: 'button',
        // buttonLabel: '複製',
        buttonIcon: 'pi pi-copy',
        buttonClass: 'p-button-sm p-button-secondary',
        buttonTooltip: '複製此扣款項目',

      },
      {
        field: 'cap_item',
        header: '扣款代號',
        type: 'text',
        editable: false,
      },
      {
        field: 'cap_name',
        header: '扣款名稱',
        type: 'text',
        editable: false,
        autoWidth: true,
      },
      {
        field: 'tpy_bdate',
        header: '扣款起始年月',
        type: 'date',
        editable: true,
        dateFormat: 'year-month',
        required: true,

        defaultValueFunction: () => {
          const contractInfo = contractInfoData[0];
          if (contractInfo?.tlt_contract_bdate) {
            return new Date(contractInfo.tlt_contract_bdate);
          }
          return null;
        }
      },
      {
        field: 'tpy_edate',
        header: '扣款結束年月',
        type: 'date',
        editable: true,
        dateFormat: 'year-month',
        required: true,

        defaultValueFunction: () => {
          const contractInfo = contractInfoData[0];
          if (contractInfo?.tlt_contract_edate) {
            return new Date(contractInfo.tlt_contract_edate);
          }
          return null;
        }
      },
      {
        field: 'cap_saletype',
        header: '銷售類型',
        type: 'dropdown',
        editable: true,
        autoWidth: true,
        options: TLS13010_DROPDOWN_OPTIONS.capSaletypeOptionsE,
      },
      {
        field: 'tpy_type',
        header: '單位',
        type: 'dropdown',
        editable: true,
        options: TLS13010_DROPDOWN_OPTIONS.tpyTypeOption,
        autoWidth: true,
        required: true,

      },
      {
        field: 'tpy_rate',
        header: '比率',
        type: 'number',
        editable: true,
        required: true,
        allowDecimal: true,
        decimalPlaces: 3,

      },
      {
        field: 'pay_no',
        header: '支付編號',
        type: 'dropdown',
        editable: true,
        autoWidth: true,
        options: [],
      },
      {
        field: 'org_id',
        header: '組織',
        type: 'dropdown',
        editable: true,
        options: [], // 需要動態設定
        required: false,
        hidden: true,
      },
      {
        field: 'gui_flag',
        header: '是否開立發票',
        type: 'dropdown',
        editable: true,
        options: [
          { label: '開立', value: 'Y' },
          { label: '未開立', value: 'N' }
        ],
        required: true,
      }
    ];
  }

  /**
   * 更新欄位定義中的組織選項
   */
  static updateOrgOptionsInColumns(columns: ColumnDef[], orgOptions: any[]): ColumnDef[] {
    return columns.map(col => {
      if (col.field === 'org_id') {
        return { ...col, options: [...orgOptions] };
      }
      return col;
    });
  }

  /**
 * 更新欄位定義中的支付編號選項
 */
  static updatePayNoOptionsInColumns(columns: ColumnDef[], payNoOptions: any[]): ColumnDef[] {
    return columns.map(col => {
      if (col.field === 'pay_no') {
        return { ...col, options: [...payNoOptions] };
      }
      return col;
    });
  }

  /**
   * 設置欄位為唯讀模式
   */
  static setColumnsReadonly(columns: ColumnDef[], readonly: boolean): ColumnDef[] {
    return columns.map(col => ({
      ...col,
      editable: readonly ? false : (col.field === 'is_selected' ? true : col.editable)
    }));
  }
}
