import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * @interface IExportLabelRequest
 * 標籤檔匯出請求資料結構 (通用型)
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
 * 申報檔匯出請求資料結構
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

/**
 * @interface IExportFIN26010Request
 * 匯款銀行匯出請求資料結構
 */
export interface IExportFIN26010Request {
  PamNoList: string[];
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
   * @method handleFileDownload
   * 處理檔案下載的核心邏輯：從 HttpResponse 讀取 Blob 和檔名，並觸發瀏覽器下載。
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
      const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-8''|)([^;"]+)/i);
      if (filenameMatch && filenameMatch[1]) {
        try {
          filename = decodeURIComponent(filenameMatch[1]);
        } catch (e) {
          filename = filenameMatch[1];
          console.error('Error decoding filename from content-disposition:', e);
        }
      }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * @method ExportLabel
   * 確認產生標籤檔(格式.txt)
   */
  ExportLabel(data: IExportLabelRequest[]): Observable<HttpResponse<Blob>> {
    return this.http.post<Blob>(
      `${this.apiUrl}/ExportLabel/ExportLabel`,
      data,
      { responseType: 'blob' as 'json', observe: 'response' }
    ).pipe(
      tap((response) => this.handleFileDownload(response, 'label_export.txt'))
    );
  }

  /**
   * @method ExportLabel_Other
   * 確認產生標籤檔(格式.txt) - 專供 tls52050、tls51070 使用
   * 檔名統一為: TRIMKG.txt
   */
  ExportLabel_Other(data: IExportLabelRequest[]): Observable<HttpResponse<Blob>> {
    return this.http.post<Blob>(
      `${this.apiUrl}/ExportLabel/ExportLabel_Other`,
      data,
      { responseType: 'blob' as 'json', observe: 'response' }
    ).pipe(
      tap((response) => this.handleFileDownload(response, 'TRIMKG.txt'))
    );
  }

  /**
   * @method ExportDXT
   * 產生申報檔(格式.DXT)
   */
  ExportDXT(data: IExportDXTRequest[]): Observable<HttpResponse<Blob>> {
    return this.http.post<Blob>(
      `${this.apiUrl}/ExportLabel/ExportDXT`,
      data,
      { responseType: 'blob' as 'json', observe: 'response' }
    ).pipe(
      tap((response) => this.handleFileDownload(response, 'declaration_export.DXT'))
    );
  }

  /**
   * @method ExportFIN26010TXT
   * 產生匯款銀行檔 (格式.yyyyMMddSSS_TSBRT.txt)
   */
  ExportFIN26010TXT(data: IExportFIN26010Request): Observable<HttpResponse<Blob>> {
    return this.http.post<Blob>(
      `${this.apiUrl}/ExportLabel/ExportFIN26010TXT`,
      data,
      { responseType: 'blob' as 'json', observe: 'response' }
    ).pipe(
      tap((response) => {
        // 銀行檔通常後端會給特定檔名，若無則使用預設格式
        this.handleFileDownload(response, 'bank_export.txt');
      })
    );
  }
}
