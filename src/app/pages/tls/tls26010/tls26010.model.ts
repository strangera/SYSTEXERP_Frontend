import { BaseQueryResponse } from '@shared/models/api/base-api.interface';

/**
 * @description
 * - data_type: 1: 讀取收銀機主檔中統收機台, 2: 讀取預購活動主檔中的收銀機台
 * - sdate: 起始日期
 * - edate: 結束日期
 */
export interface DependentDataQuery {
  data_type?: string;
  building_no?: string | null;
  floor_no?: string | null;
}

export interface TLS26010Query {
  ECR_Nos: string[];
  tlt_nos: string[];
  pod_sdate_S: Date;
  pod_sdate_E: Date;
  pod_edate_S: Date;
  pod_edate_E: Date;
}

/**
 * @description
 * - CanDelete: 是否可刪除 (0=否, 1=是)
 * - CanEdit: 是否可編輯 (0=否, 1=是)
 * - approved_date: 核准日期
 * - approved_usr_name: 核准人員姓名
 * - id: 主鍵，自動編號
 * - pod_desc: 活動名稱
 * - pod_edate: 活動終止日期
 * - pod_no: 活動編號
 * - pod_sdate: 活動起始日期
 * - pod_status: 活動狀態 (0=未核準,1=已核準,9=刪除)
 * - ECR_Nos: 收銀機號碼列表
 * - area_no: 區域編號
 * - build_no: 館別編號
 * - floor_no: 樓層編號
 * - talent_id: 專櫃ID
 * - tlt_nos: 專櫃號碼列表
 */
export interface TLS26010Data {
  CanDelete: '0' | '1';
  CanEdit: '0' | '1';
  approved_date: Date | null;
  approved_usr_name: string | null;
  id: number;
  pod_desc: string;
  pod_edate: Date;
  pod_no: string;
  pod_sdate: Date;
  pod_status: '0' | '1' | '9';
  ECR_Nos?: string[];
  area_no?: string;
  build_no?: string;
  floor_no?: string;
  talent_id?: number;
  tlt_nos?: string[];
}

export interface TLS26010DetailResponse extends Omit<BaseQueryResponse<TLS26010Detail>, 'Data'> {
  Data: TLS26010Detail;
}

/** * @description
 * - ecr_list: 收銀機清單
 * - pod_info: 預售活動基本資訊
 * - talent_list: 櫃位清單
 */
export interface TLS26010Detail {
  ecr_list: EcrItem[];
  pod_info: PodInfo;
  talent_list: TalentItem[];
}

/** * @description
 * - id: 主鍵，自動編號
 * - pod_no: 預售活動編號
 * - pod_desc: 預售活動名稱
 * - pod_sdate: 預售活動起始日期
 * - pod_edate: 預售活動終止日期
 * - pod_status: 預售活動狀態 (0=未核准, 1=已核准, 9=刪除)
 */
export interface PodInfo {
  id?: number;
  pod_no?: string;
  pod_desc: string;
  pod_sdate: Date;
  pod_edate: Date;
  pod_status?: '0' | '1' | '9';
}

/** * @description
 * - id: 主鍵，自動編號
 * - ECR_No: 收銀機編號
 * - tlt_no: 櫃位編號
 * - tlt_name: 櫃位名稱
 * - Status: 操作狀態 (original=原始, modify=修改, delete=刪除, new=新增)
 */
export interface EcrItem {
  id?: number;
  ECR_No: string;
  tlt_no: string;
  tlt_name: string;
  Status?: 'original' | 'modify' | 'delete' | 'new';
}

/**
 * @description
 * - id: 主鍵，自動編號
 * - tlt_no: 櫃位編號
 * - tlt_name: 櫃位名稱
 * - Status: 操作狀態 (original=原始, modify=修改, delete=刪除, new=新增)
 */
export interface TalentItem {
  id?: number;
  tlt_no: string;
  tlt_name: string;
  Status?: 'original' | 'modify' | 'delete' | 'new';
}

/** * @description
 * - pod_info: 活動基本資訊
 * - ecr_list: ECR 清單
 * - talent_list: 櫃位清單
 */
export interface PodCreateRequest {
  pod_info: PodInfo;
  ecr_list: EcrItem[];
  talent_list: TalentItem[];
}

/** * @description
 * - pod_info: 活動基本資訊
 * - ecr_list: ECR 清單
 * - talent_list: 櫃位清單
 */
export interface PodUpdateRequest {
  pod_info: PodInfo;
  ecr_list: EcrItem[];
  talent_list: TalentItem[];
}

export type PodRequest = PodCreateRequest | PodUpdateRequest;
