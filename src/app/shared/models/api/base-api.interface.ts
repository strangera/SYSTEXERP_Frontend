export interface SortOption {
  field: string;
  order: number;
}

export interface BaseQueryRequest {
  PageSize?: number;
  PageIndex?: number;
  // OrderBy?: string,
  // Offset?: number,
  SortBy?: SortOption[];
}

export interface BaseQueryResponse<T> {
  Status: string;
  Data: T[];
  Error?: ApiError;
  Meta?: ApiMeta;
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

export interface ApiError {
  Code: string;
  Message: string;
  Details: string;
}

export interface ApiMeta {
  Timestamp: string;   // 例如 ISO 格式時間
  RequestId: string;   // 後端可回傳唯一追蹤編號
}

export interface DropdownOption {
  No: string; // 顯示的文字
  Name: string; // 實際的值
}

export interface BaseDeleteRequest {
  idList: number[];                 // 要刪除的資料ID清單
}