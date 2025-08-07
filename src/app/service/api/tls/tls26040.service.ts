import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- TLS26040 查詢 Model 定義 ---
export interface TLS26040QueryRequest extends BaseQueryRequest {
  sad_date_start?: string;         // 銷售日期_起
  sad_date_end?: string;           // 銷售日期_迄
  tlt_noList?: string[];           // 專櫃編號清單
  sad_preorder_date_start?: string;// 預購業值入帳日_起
  sad_preorder_date_end?: string;  // 預購業值入帳日_迄
  batch_no?: string;               // 預售業值歸屬批號
  IsNotlt_no?: string;             // 篩選條件
}

// --- TLS26040 查詢插入 Model 定義 ---
export interface TLS26040QueryInsertRequest {
  sad_date_start?: string;         // 銷售日期_起
  sad_date_end?: string;           // 銷售日期_迄
  tlt_noList?: string[];           // 專櫃編號清單
  IsNotlt_no?: string;             // 篩選條件
}

// --- TLS26040 明細查詢 Model 定義 ---
export interface TLS26040DetailRequest extends BaseQueryRequest {
  sad_date?: string;               // 銷售日期
  tlt_no?: string;                 // 專櫃編號
}

// --- TLS26040 新增 Model 定義 ---
export interface TLS26040InsertRequest {
  sad_preorder_date?: string;      // 預購業值入帳日
  idList?: number[];               // ID清單
  sad_date_start?: string,        // 銷售日期_起
  sad_date_end?: string,      // 銷售日期_迄
}

// --- TLS26040 回應資料 Model 定義 ---
export interface TLS26040Data {
  id: number;
  sad_date: string;
  sad_preorder_date: string;
  tlt_no: string;
  tlt_name: string;
  batch_no: string;
  sad_preorder_amt: number;
  details?: any[];  // 展開的詳細資料
}

// --- TLS26040 明細回應資料 Model 定義 ---
export interface TLS26040DetailData {
  TXN_Date: string;                // 預售日期
  ECR_No: string;                  // 收銀機號
  TXN_No: number;                  // 交易序號
  TXN_TotSaleAmt: number;          // 業績金額
  TLT_No: string;                  // 專櫃編號
  tlt_name: string;                // 專櫃名稱
}

@Injectable({
  providedIn: 'root'
})
export class TLS26040Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢SALCHARGEM資料表
  queryTLS26040(data: TLS26040QueryRequest): Observable<BaseQueryResponse<TLS26040Data>> {
    return this.http.post<BaseQueryResponse<TLS26040Data>>(`${this.apiUrl}/queryTLS26040`, data);

    // 回傳假資料
    return new Observable<BaseQueryResponse<TLS26040Data>>(observer => {
      const Data: BaseQueryResponse<TLS26040Data> = {
        TotalCount: 2,
        Data: [
          {
            id: 1,
            sad_date: '2025-08-01',
            tlt_no: 'TLT001',
            tlt_name: '專櫃一',
            sad_preorder_date: '2025-07-25',
            sad_preorder_amt: 150000,
            batch_no: 'BATCH2025001'
          },
          {
            id: 2,
            sad_date: '2025-08-02',
            tlt_no: 'TLT002',
            tlt_name: '專櫃二',
            sad_preorder_date: '2025-07-26',
            sad_preorder_amt: 200000,
            batch_no: 'BATCH2025002'
          }
        ],
        Status: '',
        Message: '',
        TotalPage: 0
      };
      observer.next(Data);
      observer.complete();
    });
  }

  // 查詢SALCHARGEM資料表(插入用)
  queryTLS26040Insert(data: TLS26040QueryInsertRequest): Observable<BaseQueryResponse<TLS26040Data>> {
    return this.http.post<BaseQueryResponse<TLS26040Data>>(`${this.apiUrl}/queryTLS26040_insert`, data);

    // 回傳假資料
    return new Observable<BaseQueryResponse<TLS26040Data>>(observer => {
      const Data: BaseQueryResponse<TLS26040Data> = {
        TotalCount: 2,
        Data: [
          {
            id: 4,
            sad_date: '2025-08-04',
            tlt_no: 'TLT004',
            tlt_name: '專櫃四',
            sad_preorder_date: '2025-07-28',
            sad_preorder_amt: 180000,
            batch_no: 'BATCH2025004'
          },
          {
            id: 5,
            sad_date: '2025-08-05',
            tlt_no: 'TLT005',
            tlt_name: '專櫃五',
            sad_preorder_date: '2025-07-29',
            sad_preorder_amt: 220000,
            batch_no: 'BATCH2025005'
          }
        ],
        Status: '',
        Message: '',
        TotalPage: 0
      };
      observer.next(Data);
      observer.complete();
    });
  }

  // 查詢預售明細(POS5006)資料
  queryTLS26040Detail(data: TLS26040DetailRequest): Observable<BaseQueryResponse<TLS26040DetailData>> {
    return this.http.post<BaseQueryResponse<TLS26040DetailData>>(`${this.apiUrl}/queryTLS26040_Detail`, data);

    // 目前使用假資料測試
    return new Observable<BaseQueryResponse<TLS26040DetailData>>(observer => {
      const response: BaseQueryResponse<TLS26040DetailData> = {
        TotalCount: 20,
        Data: [
          {
            TXN_Date: '2025-08-01',
            ECR_No: 'ECR001',
            TXN_No: 1001,
            TXN_TotSaleAmt: 50000,
            TLT_No: 'TLT001',
            tlt_name: '專櫃一'
          },
          {
            TXN_Date: '2025-08-01',
            ECR_No: 'ECR002',
            TXN_No: 1002,
            TXN_TotSaleAmt: 75000,
            TLT_No: 'TLT001',
            tlt_name: '專櫃一'
          },
          {
            TXN_Date: '2025-08-01',
            ECR_No: 'ECR003',
            TXN_No: 1003,
            TXN_TotSaleAmt: 25000,
            TLT_No: 'TLT001',
            tlt_name: '專櫃一'
          },
          {
            TXN_Date: '2025-08-02',
            ECR_No: 'ECR004',
            TXN_No: 1004,
            TXN_TotSaleAmt: 30000,
            TLT_No: 'TLT002',
            tlt_name: '專櫃二'
          },
          {
            TXN_Date: '2025-08-02',
            ECR_No: 'ECR005',
            TXN_No: 1005,
            TXN_TotSaleAmt: 40000,
            TLT_No: 'TLT002',
            tlt_name: '專櫃二'
          },
          {
            TXN_Date: '2025-08-03',
            ECR_No: 'ECR006',
            TXN_No: 1006,
            TXN_TotSaleAmt: 35000,
            TLT_No: 'TLT003',
            tlt_name: '專櫃三'
          },
          {
            TXN_Date: '2025-08-03',
            ECR_No: 'ECR007',
            TXN_No: 1007,
            TXN_TotSaleAmt: 45000,
            TLT_No: 'TLT003',
            tlt_name: '專櫃三'
          },
          {
            TXN_Date: '2025-08-04',
            ECR_No: 'ECR008',
            TXN_No: 1008,
            TXN_TotSaleAmt: 55000,
            TLT_No: 'TLT004',
            tlt_name: '專櫃四'
          },
          {
            TXN_Date: '2025-08-04',
            ECR_No: 'ECR009',
            TXN_No: 1009,
            TXN_TotSaleAmt: 60000,
            TLT_No: 'TLT004',
            tlt_name: '專櫃四'
          },
          {
            TXN_Date: '2025-08-05',
            ECR_No: 'ECR010',
            TXN_No: 1010,
            TXN_TotSaleAmt: 70000,
            TLT_No: 'TLT005',
            tlt_name: '專櫃五'
          },
          {
            TXN_Date: '2025-08-05',
            ECR_No: 'ECR011',
            TXN_No: 1011,
            TXN_TotSaleAmt: 80000,
            TLT_No: 'TLT005',
            tlt_name: '專櫃五'
          },
          {
            TXN_Date: '2025-08-06',
            ECR_No: 'ECR012',
            TXN_No: 1012,
            TXN_TotSaleAmt: 90000,
            TLT_No: 'TLT006',
            tlt_name: '專櫃六'
          },
          {
            TXN_Date: '2025-08-06',
            ECR_No: 'ECR013',
            TXN_No: 1013,
            TXN_TotSaleAmt: 100000,
            TLT_No: 'TLT006',
            tlt_name: '專櫃六'
          },
          {
            TXN_Date: '2025-08-07',
            ECR_No: 'ECR014',
            TXN_No: 1014,
            TXN_TotSaleAmt: 110000,
            TLT_No: 'TLT007',
            tlt_name: '專櫃七'
          },
          {
            TXN_Date: '2025-08-07',
            ECR_No: 'ECR015',
            TXN_No: 1015,
            TXN_TotSaleAmt: 120000,
            TLT_No: 'TLT007',
            tlt_name: '專櫃七'
          },
          {
            TXN_Date: '2025-08-08',
            ECR_No: 'ECR016',
            TXN_No: 1016,
            TXN_TotSaleAmt: 130000,
            TLT_No: 'TLT008',
            tlt_name: '專櫃八'
          },
          {
            TXN_Date: '2025-08-08',
            ECR_No: 'ECR017',
            TXN_No: 1017,
            TXN_TotSaleAmt: 140000,
            TLT_No: 'TLT008',
            tlt_name: '專櫃八'
          },
          {
            TXN_Date: '2025-08-09',
            ECR_No: 'ECR018',
            TXN_No: 1018,
            TXN_TotSaleAmt: 150000,
            TLT_No: 'TLT009',
            tlt_name: '專櫃九'
          },
          {
            TXN_Date: '2025-08-09',
            ECR_No: 'ECR019',
            TXN_No: 1019,
            TXN_TotSaleAmt: 160000,
            TLT_No: 'TLT009',
            tlt_name: '專櫃九'
          },
          {
            TXN_Date: '2025-08-10',
            ECR_No: 'ECR020',
            TXN_No: 1020,
            TXN_TotSaleAmt: 170000,
            TLT_No: 'TLT010',
            tlt_name: '專櫃十'
          }
        ],
        Status: 'Success',
        Message: '',
        TotalPage: 1
      };
      observer.next(response);
      observer.complete();
    });
  }

  // 新增預售資料
  insertTLS26040(data: TLS26040InsertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS26040`, data);
  }
}