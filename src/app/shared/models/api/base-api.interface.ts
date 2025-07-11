export interface SortOption {
  field: string;
  order: -1 | 0 | 1; // -1: DESC, 0: NONE, 1: ASC
}

export interface BaseQueryRequest {
  PageSize?: number;
  PageIndex?: number;
  OrderBy?: string,
  Offset?: number,
  SortBy?: SortOption[];
}

export interface BaseQueryResponse<T> {
  Status: string; // 狀態標記
  Data: T[];                              // 泛型資料，可為陣列或物件
  Error?: ApiError;                     // 錯誤資訊（選填）
  Meta: ApiMeta;                       // 請求中繼資訊（選填）
  Message: string;                     // 額外訊息
  TotalCount: number;                  // 總筆數（選填）
  TotalPage: number;                   // 總頁數（選填）
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