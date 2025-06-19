// tls13010.constants.ts
import { CommissionType } from '../models/tls13010.models';

// 抽成類型描述
export const COMMISSION_TYPE_DESCRIPTIONS = {
  [CommissionType.FIXED_RENT]: '固定租金',
  [CommissionType.BASE_RENT_HIGHER]: '底租抽成取高者',
  [CommissionType.GENERAL]: '一般抽成',
  [CommissionType.BASE_COMMISSION]: '包底抽成',
  [CommissionType.GRADUATED]: '階梯式抽成',
  [CommissionType.BASE_TIER]: '包底加階梯'
};

// 表格欄位定義
export const TABLE_COLUMNS = {
  // 契約資訊欄位
  CONTRACT_INFO: [
    { field: 'apply_no', header: '專櫃招募編號', type: 'text' },
    { field: 'talent_id', header: '專櫃編號', type: 'text' },
    { field: 'tlt_name', header: '品牌(專櫃)名稱', type: 'text' },
    { field: 'ven_uniform', header: '廠商統編', type: 'text' },
    { field: 'VEN_Name', header: '廠商名稱', type: 'text' },
    { field: 'contract_subno', header: '版本編號', type: 'text' },
    { field: 'comm_comp_type', header: '抽成別', type: 'dropdown' },
    { field: 'tlt_bdate', header: '合約起始日', type: 'date' },
    { field: 'tlt_edate', header: '合約終止日', type: 'date' },
    { field: 'tlt_contract_bdate', header: '營運起始日', type: 'date' },
    { field: 'tlt_contract_edate', header: '營運終止日', type: 'date' }
  ],

  // 固定租金欄位
  FIXED_RENT: [
    { field: 'ischeck', header: '是否新增', type: 'checkbox' },
    { field: 'A', header: '帳務期別', type: 'text' },
    { field: 'B', header: '帳務起', type: 'date' },
    { field: 'C', header: '帳務迄', type: 'date' },
    { field: 'D', header: '租金金額', type: 'number' }
  ],

  // 底租抽成取高者欄位
  BASE_RENT_HIGHER: [
    { field: 'ischeck', header: '是否新增', type: 'checkbox' },
    { field: 'A', header: '帳務期別', type: 'text' },
    { field: 'B', header: '帳務起', type: 'date' },
    { field: 'C', header: '帳務迄', type: 'date' },
    { field: 'D', header: '租金金額', type: 'number' },
    { field: 'E', header: '抽成率', type: 'number' }
  ],

  // 包底抽成欄位
  BASE_COMMISSION: [
    { field: 'ischeck', header: '是否新增', type: 'checkbox' },
    { field: 'A', header: '帳務期別', type: 'text' },
    { field: 'B', header: '帳務起', type: 'date' },
    { field: 'C', header: '帳務迄', type: 'date' },
    { field: 'D', header: '包底金額', type: 'number' },
    { field: 'E', header: '抽成率', type: 'number' }
  ],

  // 階梯式抽成欄位
  GRADUATED: [
    { field: 'ischeck', header: '是否新增', type: 'checkbox' },
    { field: 'A', header: '帳務期別', type: 'text' },
    { field: 'B', header: '帳務起', type: 'date' },
    { field: 'C', header: '帳務迄', type: 'date' },
    { field: 'D', header: '階梯金額(起值)', type: 'number' },
    { field: 'E', header: '階梯金額(迄值)', type: 'number' },
    { field: 'F', header: '抽成率', type: 'number' }
  ],

  // 包底加階梯欄位
  BASE_TIER: [
    { field: 'ischeck', header: '是否新增', type: 'checkbox' },
    { field: 'A', header: '帳務期別', type: 'text' },
    { field: 'B', header: '帳務起', type: 'date' },
    { field: 'C', header: '帳務迄', type: 'date' },
    { field: 'D', header: '包底金額', type: 'number' },
    { field: 'E', header: '階梯金額(起值)', type: 'number' },
    { field: 'F', header: '階梯金額(迄值)', type: 'number' },
    { field: 'G', header: '抽成率', type: 'number' }
  ]
};

// 錯誤訊息
export const ERROR_MESSAGES = {
  LOAD_FAILED: '載入資料失敗，請稍後再試',
  SAVE_FAILED: '儲存資料失敗，請稍後再試',
  SUBMIT_FAILED: '提交資料失敗，請稍後再試',
  INVALID_DATA: '資料格式不正確，請檢查後再試',
  NETWORK_ERROR: '網路連線異常，請檢查網路後再試'
};

// 成功訊息
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '資料儲存成功',
  SUBMIT_SUCCESS: '資料提交成功'
};
