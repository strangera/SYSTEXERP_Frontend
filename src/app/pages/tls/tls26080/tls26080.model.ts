import { BaseQueryResponse } from '@shared/models';

export interface TLS26080Data {
  // id: number;
  // activityType: string;
  // department: string;
  // activityGroup: string;
  // activityName: string;
  // activityStartDate: string;
  // activityEndDate: string;
  // activityOfficialDate: string;
  // CRT_Date?: string;
  // CRT_USR_No?: string;
  // CRT_USR_Name?: string;
  // UPD_Date?: string;
  // UPD_USR_No?: string;
  // UPD_USR_Name?: string;
  // CanDel: boolean;

  str_no: string;
  pod_no: string;
  pod_type: string;
  pod_status: '0' | '1' | '9';
  pod_desc?: string;
  org_id?: string;
  cap_item?: string;
  pod_sdate: string;
  pod_edate: string;
  approved_usrno?: string;
  approved_usr_name?: string;
  approved_date?: string;
}

export interface TLS26080Query {

}



export const mockQueryTLS26080: BaseQueryResponse<TLS26080Data> = {
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
      str_no: 'STR001',
      pod_type: '預購',
      pod_no: 'POD001',
      pod_status: '0',
      pod_desc: '2025年1月預購活動',
      org_id: '營運部(DEPT001)',
      cap_item: 'CA1',
      pod_sdate: '2025-01-01',
      pod_edate: '2025-01-31',
    },
    {
      str_no: 'STR002',
      pod_type: '滿千送百發行',
      pod_no: 'POD002',
      pod_status: '1',
      cap_item: 'CA2',
      pod_sdate: '2025-02-01',
      pod_edate: '2025-02-28',
      approved_usrno: 'USR001',
      approved_usr_name: '張三',
      approved_date: '2025-02-01',
    },
    {
      str_no: 'STR003',
      pod_type: '滿千送百兌回',
      pod_no: 'POD003',
      pod_status: '9',
      pod_desc: '2025年3月滿千送百兌回活動',
      org_id: '財務部(DEPT003)',
      cap_item: 'CA3',
      pod_sdate: '2025-03-01',
      pod_edate: '2025-03-31',
      approved_usrno: 'USR002',
      approved_usr_name: '李四',
      approved_date: '2025-03-01',
    },
    {
      str_no: 'STR004',
      pod_type: '會員卡集點-銷售',
      pod_no: 'POD004',
      pod_status: '0',
      pod_desc: '2025年4月會員卡集點活動',
      org_id: '人事部(DEPT004)',
      cap_item: 'CA4',
      pod_sdate: '2025-04-01',
      pod_edate: '2025-04-30',
    },
    {
      str_no: 'STR005',
      pod_type: '會員卡集點-點數',
      pod_no: 'POD005',
      pod_status: '1',
      pod_desc: '2025年5月會員卡集點活動',
      cap_item: 'CA5',
      pod_sdate: '2025-05-01',
      pod_edate: '2025-05-31',
      approved_usrno: 'USR004',
      approved_usr_name: '趙六',
      approved_date: '2025-05-01',
    },
    {
      str_no: 'STR006',
      pod_type: '全館消費滿額集點-銷售',
      pod_no: 'POD006',
      pod_status: '0',
      org_id: '營運部(DEPT001)',
      cap_item: 'CA6',
      pod_sdate: '2025-06-01',
      pod_edate: '2025-06-30',
    },
    {
      str_no: 'STR007',
      pod_type: '全館消費滿額集點-點數',
      pod_no: 'POD007',
      pod_status: '1',
      pod_desc: '2025年7月全館消費滿額集點活動',
      org_id: '行銷部(DEPT002)',
      cap_item: 'CA7',
      pod_sdate: '2025-07-01',
      pod_edate: '2025-07-31',
      approved_usrno: 'USR005',
      approved_usr_name: '王五',
      approved_date: '2025-07-01',
    },
    {
      str_no: 'STR008',
      pod_type: '期間開放折扣',
      pod_no: 'POD008',
      pod_status: '9',
      pod_desc: '2025年8月期間開放折扣活動',
      org_id: '財務部(DEPT003)',
      cap_item: 'CA8',
      pod_sdate: '2025-08-01',
      pod_edate: '2025-08-31',
      approved_usrno: 'USR006',
      approved_usr_name: '周七',
      approved_date: '2025-08-01',
    },
  ]
};
