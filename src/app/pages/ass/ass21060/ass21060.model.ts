import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

export interface ASS21060Data {
  dataKey?: string;
  TLT_No: string;
  TLT_Name: string;
  TLT_BDate: Date | string | null;
  TLT_EDate: Date | string | null;
  Water_Flag: string;
  Electric_Flag: string;
  Gas_Flag: string;
  Contract_No: string | null;
  Contract_SubNo: string | null;
}

export interface ASS21060Query extends BaseQueryRequest {
  ContractYM: string;
  MeterTypes?: string[];
  TLT_NoStart?: string | null;
  TLT_NoEnd?: string | null;
  TLT_Name?: string | null;
  Contract_No?: string | null;
  Contract_SubNo?: string | null;
  pageSize: number;
  pageIndex: number;
}

export interface ASS21060MeterTypeOption {
  label: string;
  value: 'WATER' | 'ELECTRIC' | 'GAS';
}