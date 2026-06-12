import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CheckImportASS13020ResponseData,
  ImportASS13020ResponseData,
} from '@pages/ass/ass13020/ass13020.model';
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

  /**
   * 檢查 Excel 匯入內容（轉入前先檢查格式 / 資料是否合法）
   */
  checkImportASS13020(file: File): Observable<ApiResponse<CheckImportASS13020ResponseData>> {
    const formData = new FormData();
    formData.append('File', file, file.name);

    return this.http.post<ApiResponse<CheckImportASS13020ResponseData>>(
      `${this.apiUrl}/checkImportASS13020`,
      formData,
    );
  }

  /**
   * 正式匯入 Excel（資產轉入）
   * TODO: 後端開欄位後補傳工作表名稱
   */
  importASS13020(file: File): Observable<ApiResponse<ImportASS13020ResponseData>> {
    const formData = new FormData();
    formData.append('File', file, file.name);

    return this.http.post<ApiResponse<ImportASS13020ResponseData>>(
      `${this.apiUrl}/importASS13020`,
      formData,
    );
  }
}
