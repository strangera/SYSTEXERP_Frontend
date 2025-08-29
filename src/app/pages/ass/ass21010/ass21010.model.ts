import { EngType } from '@service/api/ass/ass21010.service';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

export interface ASS21010Data {
  ID: number;
  No: number;
  ENG_Type: keyof typeof EngType;
  ENG_MeterNo: string;
  Location_No: string;
  ENG_Remark: string;
}

export interface ASS21010Payload extends BaseQueryRequest {
  ID?: number;
  ENG_MeterNo?: string;
  Location_No?: string;
  ENG_Type?: EngType;
  SYS_StoreNo: string;
  Mid?: number;
  ENG_Remark?: string;
}

export interface ASS21010Delete {
  ID: number;
  ENG_MeterNo: string;
  Location_No: string;
  ENG_Type: EngType;
  SYS_StoreNo: string;
  Mid: number;
}

export interface ASS21010UpdateStatus extends Omit<BaseQueryResponse<unknown>, 'Data'> {
  Data: {
    IsUpdateSuccess: boolean;
    ErrorMsg: string;
  };
}

export interface ASS2100ENGMeterType {
  Id: number;
  ENG_MeterNo: string;
  Location_No: string;
  Location_Name: string;
  building_No: string;
  building_DESC: string;
  Floor_No: string;
  Floor_Desc: string;
  AREA_NO: string;
  AREA_DESC: string;
  Draw_X: string;
  Draw_Y: string;
  ENG_Type: EngType;
}
