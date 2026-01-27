/**
 * 位置資訊狀態
 */
export type LocationStatus = 'new' | 'modified' | 'deleted' | 'original';

/**
 * 櫃位位置項目
 */
export interface LocationItem {
  id?: number | string;
  location_no: string;
  tlt_building: string;
  tlt_floor: string;
  area_no: string;
  tlt_space: number;
  building_desc: string;
  floor_desc: string;
  area_desc: string;
  _status?: LocationStatus;
  _isNew?: boolean;
  _isEmpty?: boolean;
  _hasDuplicateError?: boolean;
  _hasError?: boolean;
  _errorMessage?: string;
}

/**
 * 清理後的位置資訊 (提交用)
 */
export interface CleanLocationInfo {
  id?: number;
  location_no: string;
  tlt_building?: string;
  tlt_floor?: string;
  area_no?: string;
  tlt_space?: number;
  _status?: LocationStatus;
}
