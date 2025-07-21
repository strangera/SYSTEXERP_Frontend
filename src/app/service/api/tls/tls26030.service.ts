import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable, of } from 'rxjs';

// Query request interface for TLS26030
export interface TLS26030QueryRequest {
  saleDateFrom: string;      // 銷售日期(起)
  saleDateTo: string;        // 銷售日期(訖)
  storeCodeFrom: string;     // 館別(起)
  storeCodeTo: string;       // 館別(訖)
  organizationName: string;  // 組織名稱
  floor: string;             // 樓層
}

export interface TLS26030Data {
  saleDate: string;
  hall: string;
  organizationName: string;
  posMachineNo: string;
  transactionNo: string;
  counterCode: string;
  locationCode: string;
  fieldName: string;
  preOrderAmount: number;
  recognizedAmount: number;
  recognitionBatchNo: string;
  preOrderStatus: string;
  voidOrReturnDate?: string;
  voidOrReturnMachineNo?: string;
  voidOrReturnSerialNo?: string;
  settlementDate?: string;
  settlementMachineNo?: string;
  settlementSerialNo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TLS26030Service {

  // private apiUrl = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryTLS26030(data: TLS26030QueryRequest): Observable<BaseQueryResponse<TLS26030Data>> {
    // return this.http.post<BaseQueryResponse<TLS26030Data>>(`${this.apiUrl}/queryTLS26030`, data);

    // 回傳假資料
    return of({
      Status: '0000',
      TotalCount: 1,
      Data: [{
        saleDate: '2023-10-01',
        hall: 'Main Hall',
        organizationName: '總公司',
        posMachineNo: 'POS001',
        transactionNo: 'TXN001',
        counterCode: 'C001',
        locationCode: 'L001',
        fieldName: 'Field A',
        preOrderAmount: 1000,
        recognizedAmount: 800,
        recognitionBatchNo: 'RB001',
        preOrderStatus: 'Pending',
        voidOrReturnDate: '2023-10-02',
        voidOrReturnMachineNo: 'POS002',
        voidOrReturnSerialNo: 'SR001',
        settlementDate: '2023-10-03',
        settlementMachineNo: 'POS003',
        settlementSerialNo: 'SR002',
      }],
      Message: 'Success',
      TotalPage: 1
    });
  }
}
