import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FIN51011Service {

  private readonly apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) { }

  /**
   * 上傳保全現金資料檔案（多檔案支援）
   * @param files 欲上傳的檔案 File[] 陣列
   * @returns Observable<ApiResponse<number>>
   */
  uploadFIN51011(file: File): Observable<ApiResponse<number>> {
    if (!file) {
      throw new Error('No file provided');
    }

    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      console.log('FIN51011Service: uploading file via FormData', file.name, 'size:', file.size, 'type:', file.type, 'url:', `${this.apiUrl}/uploadFIN51011`);
    } catch (e) {
      // ignore logging errors
    }

    // Do not set Content-Type header here; let the browser set multipart boundary.
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/uploadFIN51011`, formData);
  }
}
