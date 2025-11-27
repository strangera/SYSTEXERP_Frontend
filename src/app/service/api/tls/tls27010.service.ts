import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TLS27010Service {

  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 上傳保全現金資料檔案（多檔案支援）
   * @param files 欲上傳的檔案 File[] 陣列
   * @returns Observable<ApiResponse<number>>
   */
  uploadTLS27010(files: File[], clientIp: string): Observable<ApiResponse<number>> {
    const formData = new FormData();
    files.forEach(file => formData.append('Files', file));
    formData.append('client_ip', clientIp);
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/uploadTLS27010`, formData);
  }
}
