import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';

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
    ECR_No?: string;
    talent_id?: number;
    tlt_no?: string;
    tlt_name?: string;
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
  ECR_No?: string;
  talent_id?: number;
  tlt_no?: string;
  tlt_name?: string;
}

export interface TLS26010Payload {
  pod_no?: string;
  pod_desc: string;
  pod_sdate: string;
  pod_edate: string;
  pod_status: '0';
  ECR_Nos: { ECR_No: string, tlt_no: string, tlt_name: string; }[];
  tlt_nos: { tlt_no: string, tlt_name: string; }[];
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
    { No: '000001', Name: '000001' },
    { No: '000002', Name: '000002' },
    { No: '000003', Name: '000003' },
    { No: '000004', Name: '000004' },
    { No: '000005', Name: '000005' }
  ]
};

export const mockQueryTLS26010: BaseQueryResponse<TLS26010> = {
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
    {
      Data: [
        {
          pod_no: 'TEST001',
          pod_desc: '測試預購活動1',
          pod_sdate: '2025-01-01',
          pod_edate: '2025-01-31',
        },
        {
          pod_no: 'TEST002',
          pod_desc: '測試預購活動2',
          pod_sdate: '2025-02-01',
          pod_edate: '2025-02-28',
          ECR_No: '000002',
          talent_id: 2,
          tlt_no: '000008',
          tlt_name: 'CoCo 都可'
        }
      ],
      pod_status: '0',
      approved_usr_name: '',
      approved_date: null
    },
    {
      Data: [
        {
          pod_no: 'TEST003',
          pod_desc: '測試預購活動3',
          pod_sdate: '2025-03-01',
          pod_edate: '2025-03-31',
          ECR_No: '000002',
          talent_id: 2,
          tlt_no: '000106',
          tlt_name: '貝登堡'
        }
      ],
      pod_status: '1',
      approved_usr_name: '測試使用者B',
      approved_date: '2025-01-20'
    },
    {
      Data: [
        {
          pod_no: 'TEST004',
          pod_desc: '測試預購活動4',
          pod_sdate: '2025-04-01',
          pod_edate: '2025-04-30',
          ECR_No: '000003',
          talent_id: 3,
          tlt_no: 'Crocodile',
          tlt_name: '000215',
        },
        {
          pod_no: 'TEST005',
          pod_desc: '測試預購活動5',
          pod_sdate: '2025-05-01',
          pod_edate: '2025-05-31',
          ECR_No: '000003',
          talent_id: 3,
          tlt_no: 'Stressless 思特萊斯',
          tlt_name: '00203',
        },
        {
          pod_no: 'TEST006',
          pod_desc: '測試預購活動6',
          pod_sdate: '2025-06-01',
          pod_edate: '2025-06-30',
          ECR_No: '000003',
          talent_id: 3,
          tlt_no: '000204',
          tlt_name: 'FREE / FREE LOHAS / GLUTTONS',
        }
      ],
      pod_status: '1',
      approved_usr_name: '測試使用者C',
      approved_date: '2025-01-25'
    },
    {
      Data: [
        {
          pod_no: 'TEST007',
          pod_desc: '測試預購活動7',
          pod_sdate: '2025-07-01',
          pod_edate: '2025-07-31',
          ECR_No: '000004',
          talent_id: 4,
          tlt_no: '000507',
          tlt_name: 'K&A/ itabella'
        }
      ],
      pod_status: '9',
      approved_usr_name: '測試使用者D',
      approved_date: '2025-01-30'
    }
  ]
};
