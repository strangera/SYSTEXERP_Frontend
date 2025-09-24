import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable, of } from 'rxjs';

// 查詢參數介面
export interface TLS53030QueryParams extends BaseQueryRequest {
  warehouseCode?: string | null; // 倉別
  inventorySerialNo?: string | null; // 盤點單號
  brandCode?: string | null; // 品牌代碼
  inventoryCategory?: string | null; // 盤點類別
  inventoryDateFrom?: Date | null; // 盤點基準開始日期
  inventoryDateTo?: Date | null; // 盤點基準結束日期
  storageInventoryStatus?: string | null; // 盤點單狀態
}

// 查詢結果項目介面
export interface TLS53030Data {
  ID: string; // 唯一識別碼
  inventorySerialNo: string; // 盤點單號
  brandCode: string; // 品牌
  warehouseCode: string; // 倉別
  inventoryDate: string; // 盤點基準日
  inventoryCategory: string; // 盤點類別
  storageInventoryStatus: string; // 狀態
}

@Injectable({
  providedIn: 'root'
})
export class TLS53030Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  queryTLS53030(data: TLS53030QueryParams): Observable<BaseQueryResponse<TLS53030Data>> {
    // return this.http.post<BaseQueryResponse<TLS53030Data>>(`${this.apiUrl}/TLS0000/TLS5000/queryTLS53030`, data);

    // 回傳模擬資料
    return of({
      Status: '0000',
      Message: '查詢成功',
      Data: [
        {
          ID: 'ID001',
          inventorySerialNo: 'INV202401001',
          brandCode: 'BRAND001',
          warehouseCode: 'WH001',
          inventoryDate: '2024-01-15',
          inventoryCategory: '定期盤點',
          storageInventoryStatus: '2'
        },
        {
          ID: 'ID002',
          inventorySerialNo: 'INV202401002',
          brandCode: 'BRAND002',
          warehouseCode: 'WH002',
          inventoryDate: '2024-01-16',
          inventoryCategory: '臨時盤點',
          storageInventoryStatus: '4'
        },
        {
          ID: 'ID003',
          inventorySerialNo: 'INV202401003',
          brandCode: 'BRAND001',
          warehouseCode: 'WH001',
          inventoryDate: '2024-01-17',
          inventoryCategory: '年度盤點',
          storageInventoryStatus: '0'
        }
      ],
      TotalCount: 3,
      TotalPage: 1
    });
  }
}
