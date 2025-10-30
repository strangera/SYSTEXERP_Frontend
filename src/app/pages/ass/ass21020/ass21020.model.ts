import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { EngType } from '../ass21010/ass21010.model';

export interface ASS21020Data {
  Id?: number; // custom for sort
  ENG_Type: string;
  ENG_MeterNo: string;
  CRT_Date: Date;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date?: Date;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  Details: ASS21020Detail[];
}

export interface ASS21020Detail {
  TLT_No: string;
  TLT_Name: string;
  Location_No?: string;
  NET_SPACE?: number;
  ENG_Rate: number;
  ENG_Remark: string;
  status?: 'original' | 'modified' | 'new' | 'deleted';
  _isAutoInsertCandidate?: boolean;
}

export interface ASS21020Query extends BaseQueryRequest {
  EngTypes?: string;
  ENG_MeterNo?: string;
  Location_No?: string;
  SYS_StoreNo?: string;
  Mid?: number;
  ENG_Rate?: number;
}

export interface ASS21020Update {
  ENG_Type: string;
  ENG_MeterNo: string;
  TLT_No: string;
  ENG_Rate: number;
  ENG_Remark?: string;
}

export interface ASS21020Delete {
  ENG_Type: EngType;
  ENG_MeterNo: string;
}

export interface ASS21020UpdateStatus extends Omit<BaseQueryResponse<unknown>, 'Data'> {
  Data: {
    IsUpdateSuccess: boolean;
    ErrorMsg: string;
  };
}

export interface TLTByFlag {
  TLT_No: string;
  Location_No: string;
  TLT_Name: string;
  NET_SPACE: number;
  TLT_bdate: Date;
  TLT_edate: Date;
  Water_Flag: string;
  Electric_Flag: string;
  Gas_Flag: string;
  Apply_No: string;
  ENG_Rate?: number;
  ENG_Remark?: string;
}

export interface ASS21020CRUTable extends TLTByFlag {
  Apply_No: string;
  ENG_Rate: number;
  ENG_Remark: string;
  Electric_Flag: string;
  Gas_Flag: string;
  Location_No: string;
  NET_SPACE: number;
  TLT_Name: string;
  TLT_No: string;
  TLT_bdate: Date;
  TLT_edate: Date;
  Water_Flag: string;
}
