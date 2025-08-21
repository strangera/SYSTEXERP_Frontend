import { EngType } from '@service/api/ass/ass21010.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';

export interface ASS21010Payload {
  ID: number;
  ENG_MeterNo: string;
  Location_No: string;
  ENG_Type: string;
  SYS_StoreNo: string | null;
  Mid: number;
  ENG_Remark: string;
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
