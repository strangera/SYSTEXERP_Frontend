import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

export interface ASS21020Data {
  Id?: number; // custom for sort
  ENG_Type: string;
  ENG_TypeDesc: string;
  ENG_MeterNo: string;
  CRT_Date: Date;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date?: Date;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  Details: ASS21020Detail[];
  CanDelete?: boolean;
}

export interface ASS21020Detail {
  Id: number; // custom for sort
  TalentId: number,
  TLT_No: string;
  TLT_Name: string;
  ApplyNo: string
  LocationNo?: string;
  TltSpace: number
  ENG_Rate: number;
  ENG_Remark: string | null;
}

export interface ASS21020Query extends BaseQueryRequest {
  EngTypes?: string;
  ENG_MeterNo?: string;
  TLT_No?: string;
  SYS_StoreNo?: string;
  Mid?: number;
  ENG_Rate?: number;
}

export interface ASS21020UpdateData {
  Id: number;
  ENG_Type: string;
  ENG_MeterNo: string;
  TLT_No: string;
  ENG_Rate: number;
  ENG_Remark?: string;
  TalentId: number; // 【新增欄位】必填
}

export interface ASS21020Update {
  UpdateASS21020Datas: ASS21020UpdateData[];
}

// 1. 定義單筆刪除的 Key 結構
export interface DeleteASS21020Key {
  ENG_Type: string;
  ENG_MeterNo: string;
}

// 2. 定義新的 API 請求 Payload 結構 (ASS21020Delete)
// 它現在包含一個 DeleteKeys 陣列
export interface ASS21020Delete {
  DeleteKeys: DeleteASS21020Key[];
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
  TLT_Name: string;
  TLT_No: string;
  TLT_bdate: Date;
  TLT_edate: Date;
  Water_Flag: string;
}
