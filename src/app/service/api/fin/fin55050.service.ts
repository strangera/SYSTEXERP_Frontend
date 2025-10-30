import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from 'src/environments/environment';

// 查詢傳票 Request
export interface QueryFIN55050Request extends BaseQueryRequest {
  VOUDATE_Start?: string;      // 日期起
  VOUDATE_End?: string;        // 日期迄
  ORG_ID?: string;             // 部門
  ProjectNo?: string;          // 活動代碼
  AccNo?: string;              // 科目代號
  VOUNO?: string;              // 傳票號碼
  DetailNo?: string;           // 廠商代號
  PTA?: string;                // 立沖代號
  SubDetailNo?: string;        // 對象別編號
  AccountKey?: string;         // 對帳KEY
  NoteDesc?: string;           // 摘要
  VOUCHER_KIND?: string;       // 傳票型態
  PostFlag?: string;           // 傳票狀態
}

// 傳票 Response 資料結構
export interface FIN55050Data {
  ID: number;                  // 主鍵ID
  VOUNO?: string;              // 傳票號碼
  DETAILNO?: string;           // 廠商代號/簡稱
  POSTFLAG?: string;           // 狀態
  ORG_ID?: string;             // 部門
  ORG_NAME?: string;           // 部門名稱
  ProjectNo?: string;          // 活動
  PTA?: string;                // 立沖代號
  NoteDesc?: string;           // 摘要
  D_AMT?: number;              // 借方金額
  C_AMT?: number;              // 貸方金額
  Balance?: number;            // 餘額
}

@Injectable({
  providedIn: 'root'
})
export class FIN55050Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/FIN5000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN55050(req: QueryFIN55050Request): Observable<any> {
    // return this.http.post<BaseQueryResponse<FIN55050Data>>(`${this.apiUrl}/queryFIN55050`, req);
    // 回傳模擬資料

    return of({
      Status: '0000',
      Message: 'Success',
      TotalCount: 2,
      TotalPage: 1,
      Data: {
        group1: {
          AccNo: '110101',
          AccName: '現金',
          VOUDATE: '2024-06-01',
          VOUDATA: [
            {
              VOUNO: '期初餘額',
              Balance: 5000,
              AccNo: '110101',
              AccName: '現金',
            },
            {
              ID: 1,
              VOUNO: '20250101013',
              DETAILNO: 'V001',
              POSTFLAG: 'Y',
              ORG_ID: 'D01',
              ORG_NAME: '財務部',
              ProjectNo: 'P001',
              PTA: 'PTA1',
              NoteDesc: '測試1',
              D_AMT: 1000,
              C_AMT: 0,
              Balance: 1000,
              AccNo: '110101',
              AccName: '現金',
            }, {
              ID: 1,
              VOUNO: '20250101013',
              DETAILNO: 'V001',
              POSTFLAG: 'Y',
              ORG_ID: 'D01',
              ORG_NAME: '財務部',
              ProjectNo: 'P001',
              PTA: 'PTA1',
              NoteDesc: '測試1',
              D_AMT: 1000,
              C_AMT: 0,
              Balance: 1000,
              AccNo: '110101',
              AccName: '現金',
            }, {
              ID: 1,
              VOUNO: '20250101013',
              DETAILNO: 'V001',
              POSTFLAG: 'Y',
              ORG_ID: 'D01',
              ORG_NAME: '財務部',
              ProjectNo: 'P001',
              PTA: 'PTA1',
              NoteDesc: '測試1',
              D_AMT: 1000,
              C_AMT: 0,
              Balance: 1000,
              AccNo: '110101',
              AccName: '現金',
            }, {
              ID: 1,
              VOUNO: '20250101013',
              DETAILNO: 'V001',
              POSTFLAG: 'Y',
              ORG_ID: 'D01',
              ORG_NAME: '財務部',
              ProjectNo: 'P001',
              PTA: 'PTA1',
              NoteDesc: '測試1',
              D_AMT: 1000,
              C_AMT: 0,
              Balance: 1000,
              AccNo: '110101',
              AccName: '現金',
            }, {
              ID: 1,
              VOUNO: '20250101013',
              DETAILNO: 'V001',
              POSTFLAG: 'Y',
              ORG_ID: 'D01',
              ORG_NAME: '財務部',
              ProjectNo: 'P001',
              PTA: 'PTA1',
              NoteDesc: '測試1',
              D_AMT: 1000,
              C_AMT: 0,
              Balance: 1000,
              AccNo: '110101',
              AccName: '現金',
            },
            {
              VOUNO: '總計',
              D_AMT: 1000,
              C_AMT: 0,
              Balance: 1000,
              AccNo: '110101',
              AccName: '現金',
            },
            {
              VOUNO: '期初餘額',
              Balance: 5000,
              AccNo: '110102',
              AccName: '零用金',
            },
            {
              ID: 1,
              VOUNO: '20250101013',
              DETAILNO: 'V001',
              POSTFLAG: 'Y',
              ORG_ID: 'D01',
              ORG_NAME: '財務部',
              ProjectNo: 'P001',
              PTA: 'PTA1',
              NoteDesc: '測試1',
              D_AMT: 1000,
              C_AMT: 0,
              Balance: 1000,
              AccNo: '110102',
              AccName: '零用金',
            },
            {
              ID: 1,
              VOUNO: '20250101013',
              DETAILNO: 'V001',
              POSTFLAG: 'Y',
              ORG_ID: 'D01',
              ORG_NAME: '財務部',
              ProjectNo: 'P001',
              PTA: 'PTA1',
              NoteDesc: '測試1',
              D_AMT: 1000,
              C_AMT: 0,
              Balance: 1000,
              AccNo: '110102',
              AccName: '零用金',
            }, {
              ID: 1,
              VOUNO: '20250101013',
              DETAILNO: 'V001',
              POSTFLAG: 'Y',
              ORG_ID: 'D01',
              ORG_NAME: '財務部',
              ProjectNo: 'P001',
              PTA: 'PTA1',
              NoteDesc: '測試1',
              D_AMT: 1000,
              C_AMT: 0,
              Balance: 1000,
              AccNo: '110102',
              AccName: '零用金',
            },
            {
              VOUNO: '總計',
              D_AMT: 1000,
              C_AMT: 0,
              Balance: 1000,
              AccNo: '110102',
              AccName: '零用金',
            },
          ]
        },
        group2: {
          AccNo: '2001',
          AccName: '銀行存款',
          VOUDATE: '2024-06-02',
          VOUDATA: [
            {
              VOUNO: '期初餘額',
              Balance: 3000
            },
            {
              ID: 2,
              VOUNO: 'A002',
              DETAILNO: 'V002',
              POSTFLAG: 'N',
              ORG_ID: 'D02',
              ORG_NAME: '會計部',
              ProjectNo: 'P002',
              PTA: 'PTA2',
              NoteDesc: '測試2',
              D_AMT: 0,
              C_AMT: 2000,
              Balance: -2000,
            }, {
              ID: 2,
              VOUNO: 'A002',
              DETAILNO: 'V002',
              POSTFLAG: 'N',
              ORG_ID: 'D02',
              ORG_NAME: '會計部',
              ProjectNo: 'P002',
              PTA: 'PTA2',
              NoteDesc: '測試2',
              D_AMT: 0,
              C_AMT: 2000,
              Balance: -2000,
            }, {
              ID: 2,
              VOUNO: 'A002',
              DETAILNO: 'V002',
              POSTFLAG: 'N',
              ORG_ID: 'D02',
              ORG_NAME: '會計部',
              ProjectNo: 'P002',
              PTA: 'PTA2',
              NoteDesc: '測試2',
              D_AMT: 0,
              C_AMT: 2000,
              Balance: -2000,
            }, {
              ID: 2,
              VOUNO: 'A002',
              DETAILNO: 'V002',
              POSTFLAG: 'N',
              ORG_ID: 'D02',
              ORG_NAME: '會計部',
              ProjectNo: 'P002',
              PTA: 'PTA2',
              NoteDesc: '測試2',
              D_AMT: 0,
              C_AMT: 2000,
              Balance: -2000,
            }, {
              ID: 2,
              VOUNO: 'A002',
              DETAILNO: 'V002',
              POSTFLAG: 'N',
              ORG_ID: 'D02',
              ORG_NAME: '會計部',
              ProjectNo: 'P002',
              PTA: 'PTA2',
              NoteDesc: '測試2',
              D_AMT: 0,
              C_AMT: 2000,
              Balance: -2000,
            },
            {
              VOUNO: '總計',
              D_AMT: 0,
              C_AMT: 2000,
              Balance: -2000,
            },
          ]
        }
      }
    });

  }
}