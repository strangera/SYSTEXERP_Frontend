/**
 * TLS12040-v2 位置項目介面
 */

import { DataStatus } from '../../constants/workflow-step.enum';

/**
 * 位置項目
 */
export interface LocationItem {
  /** ID */
  id?: number | string;
  /** 招募編號 */
  apply_no?: string;
  /** 合約ID */
  talent_id?: string;
  /** 位置編號 */
  location_no?: string;
  /** 館別代碼 */
  tlt_building?: string;
  /** 館別名稱 */
  building_desc?: string;
  /** 樓層代碼 */
  tlt_floor?: string;
  /** 樓層名稱 */
  floor_desc?: string;
  /** 區域代碼 */
  area_no?: string;
  /** 區域名稱 */
  area_desc?: string;
  /** 營業坪數 */
  tlt_space?: number;
  /** 業績分攤(%) */
  sale_rate?: number;
  /** 起始日 */
  tlt_bdate?: string | Date;
  /** 截止日 */
  tlt_edate?: string | Date;
  /** 資料狀態 */
  _status?: DataStatus;
}

/**
 * 位置選擇選項
 */
export interface LocationOption {
  location_no: string;
  location_name: string;
  tlt_building: string;
  building_desc: string;
  tlt_floor: string;
  floor_desc: string;
  area_no: string;
  area_desc: string;
}
