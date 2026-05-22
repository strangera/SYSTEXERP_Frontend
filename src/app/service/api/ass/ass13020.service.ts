import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS13020Service {
  /** ASS 資產管理共用 API Prefix */
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) {}

  // TODO(API 對接): 後端 endpoint 尚未提供，先採 ASS13100 慣用命名作佔位
  uploadASS13020(file: File, sheetName: string): Observable<ApiResponse<unknown>> {
    const formData = new FormData();
    formData.append('FILENAME', file.name);
    formData.append('SHEETNAME', sheetName);
    formData.append('File', file, file.name);

    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/uploadASS13020`, formData);
  }
}
