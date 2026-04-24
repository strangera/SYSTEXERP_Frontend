import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** 查詢條件介面 */
export interface FIN51011QueryPayload {
  FileName: string;
}

/** 查詢結果單筆資料介面 */
export interface FIN51011Data {
  FileName: string;
  LastWriteTime: string;
}
/** 匯入回傳結果介面 (對應後端 UploadResult Class) */
export interface FIN51011UploadResult {
  Success: boolean;        // 是否成功
  SuccessCount: number;    // 成功筆數
  ErrorCount: number;      // 失敗筆數
  ErrorFilePath: string;   // 錯誤檔連結 (例如 /temp/xxxx.csv)
  Errors: string[];        // 錯誤訊息清單
}

/** 上傳 FileName 請求介面 (對應 uploadFIN51011FileName) */
export interface FIN51011UploadNamePayload {
  FileName: string;
}

@Injectable({
  providedIn: 'root'
})
export class FIN51011Service {
  private readonly baseUrl = `${environment.ApiUrl}/FIN0000/GLS1000`;

  constructor(private http: HttpClient) { }

  /**
   * 1. 查詢有價券日銷售檔案
   * POST /FIN0000/GLS1000/queryFIN51011
   */
  queryFIN51011(payload: FIN51011QueryPayload): Observable<ApiResponse<FIN51011Data[]>> {
    return this.http.post<ApiResponse<FIN51011Data[]>>(
      `${this.baseUrl}/queryFIN51011`,
      payload
    );
  }

  /**
   * 2. 有價券日銷售資料轉入作業匯入 (檔案上傳)
   * POST /FIN0000/GLS1000/uploadFIN51011
   * Request body: multipart/form-data
   */
  uploadFIN51011(file: File): Observable<ApiResponse<number>> {
    if (!file) {
      throw new Error('No file provided');
    }
    const formData = new FormData();
    // 根據 Swagger 文件，欄位名稱為 'file'
    formData.append('file', file, file.name);

    return this.http.post<ApiResponse<number>>(
      `${this.baseUrl}/uploadFIN51011`,
      formData
    );
  }

  /**
   * 3. 有價券日銷售資料轉入作業匯入 (檔名請求)
   * POST /FIN0000/GLS1000/uploadFIN51011FileName
   */
  uploadFIN51011FileName(payload: FIN51011UploadNamePayload): Observable<ApiResponse<FIN51011UploadResult>> {
    return this.http.post<ApiResponse<FIN51011UploadResult>>(
      `${this.baseUrl}/uploadFIN51011FileName`,
      payload
    );
  }
}
