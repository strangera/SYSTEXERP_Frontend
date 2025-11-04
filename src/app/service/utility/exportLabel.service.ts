import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * @interface IExportLabelRequest
 * 標籤檔匯出請求的資料結構
 */
export interface IExportLabelRequest {
  PLU_MagNo: string;
  PLU_Name: string;
  PLU_SalePrc: number;
  Label_Qty: number;
  PLU_Unit: string;
  PLU_OrgPLUNo: string;
  PLU_No: string;
}

/**
 * @interface IExportDXTRequest
 * 申報檔匯出請求的資料結構 (對應 /ExportLabel/ExportDXT)
 */
export interface IExportDXTRequest {
  STO_Uniform: string;
  STO_TaxName: string;
  STO_TaxNo: string;
  STO_Type: string;
  REP_OrgCode: string;
  STO_Direct: string;
  STO_HQUniform: string;
  STO_ManagerName: string;
  STO_City: string;
  STO_Addr: string;
  STO_ApplyName: string;
  STO_AreaCode: string;
  STO_ApplyTEL: string;
  STO_ApplyTEL_ext: string;
  STO_MergeFlag: string;
  STO_ApplyID: string;
  STO_ModifyTime: string | null;
  STO_ApplyFlag: string;
}


@Injectable({
  providedIn: 'root'
})
export class ExportLabelService {
  private readonly apiUrl = environment.ApiUrl;

  constructor(
    private readonly http: HttpClient,
  ) { }

  /**
   * @method ExportLabel
   * 確認產生標籤檔(格式.txt)
   * @param data IExportLabelRequest 陣列
   * @returns Observable<HttpResponse<Blob>> 包含 .txt 檔案內容的 Observable
   */
  ExportLabel(data: IExportLabelRequest[]): Observable<HttpResponse<Blob>> {
    return this.http.post<Blob>(
      `${this.apiUrl}/ExportLabel/ExportLabel`,
      data,
      {
        responseType: 'blob' as 'json', // 必須明確指定為 'blob'
        observe: 'response' // 觀察完整的 HttpResponse，以便讀取 headers (如 filename)
      }
    );
  }

  /**
   * @method ExportDXT
   * 產生申報檔(格式.DXT) - 新增的 API
   * @param data IExportDXTRequest 陣列
   * @returns Observable<HttpResponse<Blob>> 包含 .DXT 檔案內容的 Observable
   */
  ExportDXT(data: IExportDXTRequest[]): Observable<HttpResponse<Blob>> {
    return this.http.post<Blob>(
      `${this.apiUrl}/ExportLabel/ExportDXT`,
      data,
      {
        responseType: 'blob' as 'json', // 指定 responseType 為 'blob' 以接收檔案資料
        observe: 'response' // 觀察完整的 HttpResponse
      }
    );
  }

  /**
   * @method handleFileDownload
   * 處理檔案下載的核心邏輯：從 HttpResponse 讀取 Blob 和檔名，並觸發瀏覽器下載。
   * @param exportHttpResponse 完整的 HTTP Response，包含 Blob。
   * @param defaultFilename 當 Content-Disposition 標頭中找不到檔名時使用的預設檔名。
   */
  handleFileDownload(exportHttpResponse: HttpResponse<Blob>, defaultFilename = 'unknown.txt'): void {
    if (!exportHttpResponse.ok || !exportHttpResponse.body) {
      console.warn('File download failed: Response not OK or body is null.');
      return;
    }

    const blob = exportHttpResponse.body;
    const contentDisposition = exportHttpResponse.headers.get('content-disposition');
    let filename = defaultFilename;

    if (contentDisposition) {
      // 處理 Content-Disposition: filename* (RFC 5987) 和 filename (RFC 6266)
      const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-8''|)([^;"]+)/i);
      if (filenameMatch && filenameMatch[1]) {
        // 解碼 URL 編碼的檔名
        try {
          filename = decodeURIComponent(filenameMatch[1]);
        } catch (e) {
          filename = filenameMatch[1]; // 解碼失敗則用原始值
          console.error('Error decoding filename from content-disposition:', e);
        }
      }
    }

    // 觸發瀏覽器下載
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
