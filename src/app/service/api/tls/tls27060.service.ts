import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TLS27060Service {

  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 上傳環友系統日結檔（多檔案支援）
   * @param files 欲上傳的檔案 File[] 陣列
   * @param uploadType 檔案類型（Points：會員點數日結檔 / Voucher：有價券日結檔）
   * @returns Observable<ApiResponse<number>>
   */
  uploadTLS27060(files: File[], clientIp: string, uploadType: string): Observable<ApiResponse<number>> {
    const formData = new FormData();
    files.forEach(file => formData.append('Files', file));
    formData.append('client_ip', clientIp);
    formData.append('uploadType', uploadType);
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/uploadTLS27060`, formData);
  }
}
