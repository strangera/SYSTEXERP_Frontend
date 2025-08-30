import { BaseQueryRequest, BaseQueryResponse } from "@shared/models/api/base-api.interface";

export interface ASS21020Data {
  ID: number;
  ENG_Type: string;
  ENG_MeterNo: string;
  TLT_No: string;
  ENG_Rate: number;
  ENG_Remark: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface ASS21020Payload extends BaseQueryRequest {
  ENG_MeterNo?: string;
  Location_No?: string;
  SYS_StoreNo?: string;
  Mid?: number;
  ENG_Rate?: number;
  ID?: string;
  ENG_Type?: string;
  TLT_No?: string;
  ENG_Remark?: string;
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
}

export interface QueryTLTPayload {
  SYS3800s?: {
    building_no: string;
    building_desc?: string;
  }[],
  SYS3900s?: {
    floor_no: string;
    floor_desc?: string;
  }[];

}
