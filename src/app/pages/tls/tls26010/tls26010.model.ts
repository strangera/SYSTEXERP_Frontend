import { ApiError, ApiMeta, BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';

/**
 * @description
 * - data_type: 1: 讀取收銀機主檔中統收機台, 2: 讀取預購活動主檔中的收銀機台
 * - sdate: 起始日期
 * - edate: 結束日期
 */
export interface DependentDataQuery {
  data_type?: string;
  sdate: Date;
  edate: Date;
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
  tlt_nos?: string;
}

export interface TLS26010DetailResponse extends Omit<BaseQueryResponse<TLS26010Detail>, 'Data'> {
  Data: TLS26010Detail;
}

export interface TLS26010Detail {
  ecr_list: ECRTableData[];
  pod_info: {
    id: number;
    mid: number;
    pod_desc: string;
    pod_edate: Date;
    pod_no: string;
    pod_sdate: Date;
    pod_status: '0' | '1' | '9';
  } | null;
  talent_list: TLTTALENTData[];
}

export interface TLS26010Payload {
  pod_no?: string;
  pod_desc: string;
  pod_sdate: Date;
  pod_edate: Date;
  pod_status: '0' | '1' | '9';
  ECR_Nos?: string[];
  tlt_nos?: string[];
}

export interface ECRTableData {
  id: number;
  ECR_No: string;
  tlt_no: string;
  tlt_name: string | null;
}

export interface TLTTALENTData {
  id: number;
  tlt_no: string;
  tlt_name: string | null;
}

export const mockPreorderECRList: BaseQueryResponse<DropdownOption> = {
  Error: void 0,
  Message: '成功',
  Meta: {
    Timestamp: '2025-01-20T10:00:00.0000000Z',
    RequestId: 'test-request-id-12345'
  },
  Status: '0000',
  TotalCount: 3,
  TotalPage: 1,
  Data: [
    { No: '000001', Name: '01' },
    { No: '000002', Name: '02' },
    { No: '000003', Name: '03' },
    { No: '000004', Name: '04' },
    { No: '000005', Name: '05' }
  ]
};

export const mockTLS26010Data: BaseQueryResponse<TLS26010Data> = {
  Status: "0000",
  Data: [
    {
      CanDelete: "1",
      CanEdit: "1",
      id: 1,
      pod_no: "20250720001",
      pod_desc: "123456",
      pod_sdate: "2025-07-20T00:00:00" as unknown as Date,
      pod_edate: "2025-07-31T00:00:00" as unknown as Date,
      pod_status: "0",
      approved_usr_name: null,
      approved_date: null
    }
  ],
  Error: undefined,
  Meta: {
    Timestamp: "2025-07-29T06:52:12.3665130Z",
    RequestId: "7ea05a72-44b2-4405-bac0-ad68ed5fea9d"
  },
  Message: "成功",
  TotalCount: 1,
  TotalPage: 1
};
