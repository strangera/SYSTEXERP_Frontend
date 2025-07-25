import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';

/**
 * @description
 * data_type: 1: 讀取收銀機主檔中統收機台, 2: 讀取預購活動主檔中的收銀機台
 * sdate: 起始日期
 * edate: 結束日期
 */
export interface QueryPayload {
  data_type?: string;
  sdate: string;
  edate: string;
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
    build_no?: string;
    floor_no?: string;
    area_no?: string;
    pod_no: string;
    pod_desc: string;
    pod_sdate: string;
    pod_edate: string;
    ECR_Nos?: string[];
    tlt_nos?: string[];
    talent_id?: number;
  }[];
  pod_status: '0' | '1' | '9';
  approved_usr_name: string;
  approved_date: string | null;
}

export interface TLS26010Data {
  build_no?: string;
  floor_no?: string;
  area_no?: string;
  pod_no: string;
  pod_desc: string;
  pod_sdate: string;
  pod_edate: string;
  pod_status: '0' | '1' | '9';
  approved_usr_name: string;
  approved_date: string | null;
  ECR_Nos?: string[];
  tlt_nos?: string[];
  talent_id?: number;
}

export interface TLS26010Payload {
  pod_no?: string;
  pod_desc: string;
  pod_sdate: string;
  pod_edate: string;
  pod_status: '0';
  ECR_Nos?: string[];
  tlt_nos?: string[];
}

export interface ECRTableData {
  ECR_No: string;
  tlt_no: string;
  tlt_name: string;
}

export interface TLTTALENTData {
  tlt_no: string;
  tlt_name: string;
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
          area_no: 'A',
          pod_no: 'TEST001',
          pod_desc: '測試預購活動1',
          pod_sdate: '2025-01-01',
          pod_edate: '2025-01-31',
          ECR_Nos: ['000001'],
        },
        {
          floor_no: '1F',
          pod_no: 'TEST002',
          pod_desc: '測試預購活動2',
          pod_sdate: '2025-02-01',
          pod_edate: '2025-02-28',
          ECR_Nos: ['000001', '000002'],
          tlt_nos: ['000008'],
        }
      ],
      pod_status: '0',
      approved_usr_name: '',
      approved_date: null
    },
    {
      Data: [
        {
          build_no: 'B1',
          pod_no: 'TEST003',
          pod_desc: '測試預購活動3',
          pod_sdate: '2025-03-01',
          pod_edate: '2025-03-31',
          ECR_Nos: ['000002'],
          tlt_nos: ['000106'],
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
          ECR_Nos: ['000003'],
          tlt_nos: ['000215'],
          talent_id: 3,
        },
        {
          build_no: 'B2',
          floor_no: 'A2',
          pod_no: 'TEST005',
          pod_desc: '測試預購活動5',
          pod_sdate: '2025-05-01',
          pod_edate: '2025-05-31',
          ECR_Nos: ['000003'],
          tlt_nos: ['00203'],
          talent_id: 3,
        },
        {
          build_no: 'B3',
          floor_no: '2F',
          area_no: 'C',
          pod_no: 'TEST006',
          pod_desc: '測試預購活動6',
          pod_sdate: '2025-06-01',
          pod_edate: '2025-06-30',
          ECR_Nos: ['000003'],
          tlt_nos: ['000204'],
          talent_id: 3,
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
          ECR_Nos: ['000004'],
          tlt_nos: ['000507'],
          talent_id: 4,
        }
      ],
      pod_status: '9',
      approved_usr_name: '測試使用者D',
      approved_date: '2025-01-30'
    }
  ]
};
