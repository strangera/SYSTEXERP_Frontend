export interface QueryASS13010SortField {
  field: string;
  order: number;
}

export interface QueryASS13010Request {
  PageSize: number;
  PageIndex: number;
  OrderBy?: string | null;
  Offset?: number | null;
  SortBy?: QueryASS13010SortField[] | null;
  MID?: number | null;
  STO_NO?: string | null;
  ASSET_ID?: string | null;
  GOODS_ID?: string | null;
  ASSET_STATUS?: string | null;
  DEPRE_YN?: string | null;
  SUBPOENA_ID?: string | null;
  GET_DATE_S?: string | null;
  GET_DATE_E?: string | null;
  GET_COST_S?: number | null;
  GET_COST_E?: number | null;
  BILL_DATE_S?: string | null;
  BILL_DATE_E?: string | null;
  EXP_YEAR_S?: number | null;
  EXP_YEAR_E?: number | null;
  HOLD_EMP_ID?: string | null;
  USE_EMP_ID?: string | null;
  LOCATION_ID?: string | null;
}

export interface QueryASS13010Response {
  ID: number;
  ASSET_ID: string | null;
  GOODS_ID: string | null;
  ASSET_STATUS: string | null;
  ASSET_STATUS_NAME: string | null;
  DEPRE_YN: string | null;
  DEPRE_YN_NAME: string | null;
  SUBPOENA_ID: string | null;
  GET_DATE: string | null;
  GET_COST: number | null;
  BILL_DATE: string | null;
  DEPRE_ID: string | null;
}

export interface QueryASS13010Result {
  QueryData: QueryASS13010Response[];
  TotalRows: number;
  TotalPages: number;
}

export interface QueryASS13010ResultApiResponse {
  Status: string;
  Data: QueryASS13010Result | null;
  Error?: {
    Code?: string;
    Message?: string;
    Details?: string;
  } | null;
  Meta?: {
    Timestamp?: string;
    RequestId?: string;
  } | null;
  Message?: string | null;
  TotalCount?: number;
  TotalPage?: number;
}

