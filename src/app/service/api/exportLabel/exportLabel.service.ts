import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface IExportLabelRequest {
  PLU_MagNo: string;
  PLU_Name: string;
  PLU_SalePrc: number;
  Label_Qty: number;
  PLU_Unit: string;
  PLU_OrgPLUNo: string;
  PLU_No: string;
}
@Injectable({
  providedIn: 'root'
})
export class ExportLabelService {
  private apiUrl = environment.ApiUrl;

  ExportLabel(data: IExportLabelRequest[]): Observable<HttpResponse<Blob>> {
    // 如果後端需要 Content-Type: application/json，你可能需要設定 headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<Blob>(
      `${this.apiUrl}/ExportLabel/ExportLabel`,
      data,
      {
        headers: headers,
        responseType: 'blob' as 'json', // 必須明確指定為 'blob'
        observe: 'response' // 觀察完整的 HttpResponse，以便讀取 headers (如 filename)
      }
    );
  }

  constructor(
    private http: HttpClient,
  ) { }
}
