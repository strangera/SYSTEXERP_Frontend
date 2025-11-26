import { map, OperatorFunction, pipe } from 'rxjs';

export interface ApiResponse<T, F = undefined> {
  Status: string;
  Data: T;
  footerData?: F;
  Error: {
    Code: string;
    Detail: string;
    Message: string;
  } | null;
  Meta: {
    Timestamp: string;
    RequestId: string;
  };
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

/**
 * 檢查 ApiResponse.Status 是否為 '0000'。若成功則只返回 Data，否則拋出業務錯誤。
 * @returns Observable<T> (只包含 Data 部分)
 */
export function validateApiResponse<T>(): OperatorFunction<ApiResponse<T>, T> {
  return pipe(
    map(response => {
      if (response.Status !== '0000') {
        // 拋出包含業務錯誤資訊的自定義錯誤
        const errorMessage = response.Message || response.Error?.Message || 'API 業務邏輯錯誤';
        throw new Error(errorMessage);
      }
      return response.Data; // 成功時只返回 Data
    })
  );
}
