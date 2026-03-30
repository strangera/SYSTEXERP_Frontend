import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DetailASS13010Request, DetailASS13010Response } from '@pages/ass/ass13010/ass13010.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** ASS13010 資產維護作業 API */
@Injectable({ providedIn: 'root' })
export class ASS13010Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  /**
   * 資產明細。後端可能回傳 `Data` 為單一物件或陣列，統一正規化為單一物件或 `null`。
   */
  detailASS13010(body: DetailASS13010Request): Observable<ApiResponse<DetailASS13010Response | null>> {
    return this.http
      .post<ApiResponse<DetailASS13010Response | DetailASS13010Response[] | null>>(
        `${this.apiUrl}/detailASS13010`,
        body
      )
      .pipe(
        map(res => ({
          ...res,
          Data: this.normalizeDetailAss13010Data(res.Data),
        }))
      );
  }

  /** 將 detailASS13010 的 Data 解包為單筆明細（陣列取第一筆，空陣列為 null） */
  private normalizeDetailAss13010Data(data: unknown): DetailASS13010Response | null {
    if (data == null) return null;
    if (Array.isArray(data)) {
      const first = data[0];
      if (first == null || typeof first !== 'object') return null;
      return first as DetailASS13010Response;
    }
    if (typeof data === 'object') {
      return data as DetailASS13010Response;
    }
    return null;
  }
}
