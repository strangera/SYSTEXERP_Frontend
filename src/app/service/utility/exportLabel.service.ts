import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileExportService } from '@shared/service/file-export.service';
import { Observable } from 'rxjs';
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
    private readonly fileExportService: FileExportService
  ) { }

  // ExportLabel改用ExportLabel_Other
  ExportLabel(data: IExportLabelRequest[], btnLoadingSetter?: (state: boolean) => void): Observable<HttpResponse<Blob>> {
    const obs = this.http.post<Blob>(`${this.apiUrl}/ExportLabel/ExportLabel_Other`, data, { responseType: 'blob' as 'json', observe: 'response' });
    return this.fileExportService.executeFileExport(obs, '.txt', btnLoadingSetter);
  }

  ExportLabel_Other(data: IExportLabelRequest[], btnLoadingSetter?: (state: boolean) => void): Observable<HttpResponse<Blob>> {
    const obs = this.http.post<Blob>(`${this.apiUrl}/ExportLabel/ExportLabel_Other`, data, { responseType: 'blob' as 'json', observe: 'response' });
    return this.fileExportService.executeFileExport(obs, '.txt', btnLoadingSetter);
  }

  ExportDXT(data: IExportDXTRequest[], btnLoadingSetter?: (state: boolean) => void): Observable<HttpResponse<Blob>> {
    const obs = this.http.post<Blob>(`${this.apiUrl}/ExportLabel/ExportDXT`, data, { responseType: 'blob' as 'json', observe: 'response' });
    return this.fileExportService.executeFileExport(obs, '.DXT', btnLoadingSetter);
  }

  ExportFIN26010TXT(data: IExportFIN26010Request, btnLoadingSetter?: (state: boolean) => void): Observable<HttpResponse<Blob>> {
    const obs = this.http.post<Blob>(`${this.apiUrl}/ExportLabel/ExportFIN26010TXT`, data, { responseType: 'blob' as 'json', observe: 'response' });
    return this.fileExportService.executeFileExport(obs, '.txt', btnLoadingSetter);
  }
}
