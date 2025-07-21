interface ECROption {
  ECR_No: string;
  ECR_Name: string;
}

interface TLTOption {
  tlt_no: string;
  tlt_name: string;
}

export const enum ApprovalStatus {
  未核准 = '0',
  已核准 = '1',
  刪除 = '9',
}

/**
 * @description
 * data_type: 1: 讀取收銀機主檔中統收機台, 2: 讀取預購活動主檔中的收銀機台
 * SYS3800s: 館別編號
 * SYS3900s: 樓層編號
 */
export interface PreorderECRListQuery {
  data_type: string;
  SYS3800s: { building_no: string; }[];
  SYS3900s: { floor_no: string; }[];
}

/**
 * @description
 * data_type: 1: 讀取收銀機主檔中統收機台, 2: 讀取預購活動主檔中的收銀機台
 * SYS3800s: 館別編號
 * SYS3900s: 樓層編號
 */
export interface TLTTALENTQuery {
  SYS3800s: { building_no: string; }[];
  SYS3900s: { floor_no: string; }[];
}

export interface TLS26010Query {
  ECR_Nos: string[];
  tlt_nos: string[];
  pod_sdate_S: string;
  pod_sdate_E: string;
  pod_edate_S: string;
  pod_edate_E: string;
}

export interface TLS26010 {
  Data: {
    pod_no: string;
    pod_desc: string;
    pod_sdate: string;
    pod_edate: string;
  }[];
  pod_status: '0' | '1' | '9';
  approved_usr_name: string;
  approved_date: string | null;
}

export interface TLS26010Data {
  pod_no: string;
  pod_desc: string;
  pod_sdate: string;
  pod_edate: string;
  pod_status: '0' | '1' | '9';
  approved_usr_name: string;
  approved_date: string | null;
}

export interface TLS26010Payload {
  pod_sdate: string;
  pod_edate: string;
  pod_desc: string;
  pod_status: '0';
  ECR_Nos: { ECR_No: string, tht_no: string, tlt_name: string; }[];
  tlt_nos: { tlt_no: string, tlt_name: string; }[];
}
