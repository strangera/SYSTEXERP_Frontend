import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@service/system/auth.service';

export interface POS1006Item {
  No: string;
  Name: string;
  PAY_Type: string;
}

@Injectable({
  providedIn: 'root'
})

export class NegotiatorOptionsService {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 洽談者
  getNegotiatorOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/queryTBLUSER_DropDownList`, {}) // 傳空物件
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No
        })) ?? [])
      );
  }

  queryPOS1006_DropDownList(): Observable<ApiResponse<POS1006Item>> {
    const url = `${this.apiUrl}/queryPOS1006_DropDownList`;
    return this.http.post<ApiResponse<POS1006Item>>(url, {}).pipe(
      tap(res => console.log('🎯 POS1006 下拉原始資料:', res)),
    );
  }

  getPOS1006Options(): Observable<any[]> {
    return this.queryPOS1006_DropDownList().pipe(
      map((res) => {
        if (!res?.Data || !Array.isArray(res.Data)) {
          console.warn('⚠️ POS1006 回傳資料格式異常:', res);
          return [];
        }
        return res.Data.map((x: POS1006Item) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
          payType: x.PAY_Type
        }));
      })
    );
  }
}
