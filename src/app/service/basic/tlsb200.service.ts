import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tlsb200Model } from '../../pages/sys/sysb200.cru/tlsb200.model';

@Injectable({
  providedIn: 'root'
})
export class Tlsb200Service {
  private baseUrl = '/api/tlsb200'; //根據實際後端 API 路徑修改

  constructor(private http: HttpClient) { }

  // 🔎 查詢（單筆）
  get(id: string): Observable<Tlsb200Model> {
    return this.http.get<Tlsb200Model>(`${this.baseUrl}/${id}`);
  }

  // ➕ 新增
  create(data: Tlsb200Model): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }

  // ✏️ 更新
  update(data: Tlsb200Model): Observable<any> {
    return this.http.put(`${this.baseUrl}`, data);
  }

  // ❌ 刪除（如果有需要）
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // 🔎 查詢清單（如果有需要列表頁面）
  list(): Observable<Tlsb200Model[]> {
    return this.http.get<Tlsb200Model[]>(`${this.baseUrl}`);
  }
}
