import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // ✅ 修正路徑為四層

@Injectable({ providedIn: 'root' })
export class BusinessIdService {
  constructor(private http: HttpClient) {}

  /**
   * 取得稅籍編號下拉選單清單
   * API 回傳格式範例:
   * [
   *   { label: '12345678 - 南紡百貨', value: '12345678' },
   *   { label: '98765432 - 夢時代百貨', value: '98765432' }
   * ]
   */
  getBusinessIdList(): Observable<{ label: string; value: string }[]> {
    return this.http.get<{ label: string; value: string }[]>(
      `${environment.ApiUrl}/DropDownList/GetBusinessId` // ✅ 修正為 apiUrl（環境變數通常是小寫）
    );
  }
}
