import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class FIN13010Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  //✅ 查詢
  queryFIN13010(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13010`, query).pipe(
      tap(res => console.log('查詢結果:', res)),

    );
  }
  queryINV1000List(param: { GUI_Track: string }) {
    return this.http.post<ApiResponse<any[]>>(
      `${this.apiUrl}/FIN0000/INV1000/queryFIN13010_PURGUINo`,
      param
    );
  }


  // ✅ 新增
  insertFIN13010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/FIN0000/INV1000/insertFIN13010`, data).pipe(
      tap(res => console.log('新增結果:', res)),

    );
  }

  // ✅ 更新
  updateFIN13010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/FIN0000/INV1000/updateFIN13010`, data).pipe(
      tap(res => console.log('更新結果:', res)),

    );
  }
  queryDetailByPURGUINo(param: { PUR_GUINo: string }) {
    return this.http.post<any>('/FIN13010/queryDetailByPURGUINo', param);
  }
  queryCorrespondByGUINoCorrespond(param: { PUR_GUINo_Correspond: string }) {
    return this.http.post<any>(
      `${this.apiUrl}/FIN0000/INV1000/queryFIN13010_Correspond`,
      param
    );
  }
  //     // ✅ 查詢（使用假資料）
  //   queryFIN13010(query: any): Observable<any> {
  //   const mockData = [
  //     {
  //       TXN_Ret_No: 'RT20250701001',
  //       PUR_GUINo: 'AB12345678',
  //       PUR_GUINo_Start: '00000001',
  //       PUR_GUIDate: '2025-07-01',
  //       PUR_VoucherType: '23',
  //       Credit_Type: '折讓',
  //       PUR_RepYYYYMM: '202507',
  //       PUR_Net: 1500,
  //       Source_Doc_No: 'SRC2025070001',
  //       Voucher_No: 'VCH000123'
  //     },
  //     {
  //       TXN_Ret_No: 'RT20250701002',
  //       PUR_GUINo: 'CD98765432',
  //       PUR_GUINo_Start: '00000002',
  //       PUR_GUIDate: '2025-07-01',
  //       PUR_VoucherType: '24',
  //       Credit_Type: '退出',
  //       PUR_RepYYYYMM: '202507',
  //       PUR_Net: 2300,
  //       Source_Doc_No: 'SRC2025070002',
  //       Voucher_No: 'VCH000124'
  //     },
  //     {
  //       TXN_Ret_No: 'RT20250701003',
  //       PUR_GUINo: 'EF24681357',
  //       PUR_GUINo_Start: '00000003',
  //       PUR_GUIDate: '2025-07-01',
  //       PUR_VoucherType: '23',
  //       Credit_Type: '折讓',
  //       PUR_RepYYYYMM: '202507',
  //       PUR_Net: 1800,
  //       Source_Doc_No: 'SRC2025070003',
  //       Voucher_No: 'VCH000125'
  //     }
  //   ];

  //   const result = {
  //     Status: '0000',
  //     Data: mockData,
  //     TotalCount: mockData.length
  //   };

  //   return new Observable<any>(observer => {
  //     observer.next(result);
  //     observer.complete();
  //   });
  // }
  // // getInvoiceInfo(invoiceNo: string) {
  // //   return this.http.post<any>('/api/FIN13010/GetInvoiceInfo', { invoiceNo });
  // // }
  // getInvoiceInfo(invoiceNo: string) {
  //   const mockData = {
  //     Status: '0000',
  //     Data: {
  //       PUR_VoucherType: 23,
  //       PUR_TaxType: '1',
  //       Inv_Net: 10000,
  //       Inv_Tax: 500,
  //       History_RetAmt: 3000
  //     }
  //   };

  //   return of(mockData).pipe(delay(500)); // 模擬延遲 500ms
  // }
}
