import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; // 引入 of 來模擬 API 響應
import { environment } from 'src/environments/environment';

// 假設的退貨明細資料結構 (根據您提供的 SQL 欄位定義)
export interface IReturnDetailData {
  RJM_No: string;        // 退貨單號
  APRV_Date: string;     // 審核日期 (可用來判斷結帳年月)
  VEN_NO: string;        // 廠商編號
  HOS_NAME: string;      // 醫院/門市名稱
  RJM_TotalBuyNet: number; // 總進貨淨額
  RJM_TotalBuyTax: number; // 總進貨稅額
  RJM_TotalBuyAmt: number; // 總進貨總額
}

// 新增的發票/收據明細資料結構 (根據您提供的 SQL 欄位定義)
export interface IInvoiceDetail {
  SeqNo: number;         // 序號
  PUR_GUINo: string;     // 發票/收據號碼
  PUR_GUIDate: string;   // 發票日期
  PUR_VenNo: string;     // 廠商編號
  TABTYPE: string;       // 單據別 ('收據' 或 '發票')
  PUR_TaxType: string;   // 稅別
  PUR_DirectType: string; // 發票用途
  PUR_VoucherType: string; // 發票格式代碼
  PUR_Amt: number;       // 發票金額
  Rebate_Amt: number;    // 已折讓金額

  Rebate_Amt_New?: number;
  Rebate_Net?: number;
  Rebate_Tax?: number;
}

@Injectable({
  providedIn: 'root'
})
export class Tls55030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS55030`;

  constructor(private http: HttpClient) { }

  queryTLS55030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS55030`, body)
  }

  /**
   * @method queryReturnDetailData
   * 模擬 API：根據結帳年月和廠商編號，帶入已審核且未開立折讓單的退貨驗收資料。
   * (對應規格：結帳年月該廠商的退貨驗收資料(已審核)帶入退貨明細，且要完成進貨日結)
   * * @param billingMonth 結帳年月 (e.g., '202510')
   * @param vendorNo 廠商編號 (e.g., 'A123')
   * @returns Observable<IReturnDetailData[]> 模擬的退貨明細資料陣列
   */
  queryReturnDetailData(params: { ACP_YYYYMM: string | null, VEN_No: string | null }): Observable<IReturnDetailData[]> {
    const dummyData: IReturnDetailData[] = [
      {
        "RJM_No": "RE201501150001",
        "APRV_Date": "2015-01-15",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 128463,
        "RJM_TotalBuyTax": 6423,
        "RJM_TotalBuyAmt": 134886
      },
      {
        "RJM_No": "RE201501160001",
        "APRV_Date": "2015-01-16",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 2119,
        "RJM_TotalBuyTax": 106,
        "RJM_TotalBuyAmt": 2225
      },
      {
        "RJM_No": "RE201501210001",
        "APRV_Date": "2015-01-22",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 523851,
        "RJM_TotalBuyTax": 26193,
        "RJM_TotalBuyAmt": 550044
      },
      {
        "RJM_No": "RE201502050001",
        "APRV_Date": "2015-02-06",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 1105130,
        "RJM_TotalBuyTax": 55257,
        "RJM_TotalBuyAmt": 1160387
      },
      {
        "RJM_No": "RE201505100001",
        "APRV_Date": "2015-05-10",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 1212463,
        "RJM_TotalBuyTax": 60623,
        "RJM_TotalBuyAmt": 1273086
      },
      {
        "RJM_No": "RE201506040001",
        "APRV_Date": "2015-06-04",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 12839,
        "RJM_TotalBuyTax": 642,
        "RJM_TotalBuyAmt": 13481
      },
      {
        "RJM_No": "RE201508040009",
        "APRV_Date": "2015-08-05",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 6820,
        "RJM_TotalBuyTax": 341,
        "RJM_TotalBuyAmt": 7161
      },
      {
        "RJM_No": "RE201509050001",
        "APRV_Date": "2015-09-05",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 3116,
        "RJM_TotalBuyTax": 156,
        "RJM_TotalBuyAmt": 3272
      },
      {
        "RJM_No": "RE201509170001",
        "APRV_Date": "2015-09-17",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 152315,
        "RJM_TotalBuyTax": 7616,
        "RJM_TotalBuyAmt": 159931
      },
      {
        "RJM_No": "RE201512030001",
        "APRV_Date": "2015-12-03",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 733284,
        "RJM_TotalBuyTax": 36664,
        "RJM_TotalBuyAmt": 769948
      },
      {
        "RJM_No": "RE201601020001",
        "APRV_Date": "2016-01-05",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 4070,
        "RJM_TotalBuyTax": 204,
        "RJM_TotalBuyAmt": 4274
      },
      {
        "RJM_No": "RE201602050002",
        "APRV_Date": "2016-02-05",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 34168,
        "RJM_TotalBuyTax": 1708,
        "RJM_TotalBuyAmt": 35876
      },
      {
        "RJM_No": "RE201606220001",
        "APRV_Date": "2016-06-22",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 191170,
        "RJM_TotalBuyTax": 9561,
        "RJM_TotalBuyAmt": 200731
      },
      {
        "RJM_No": "RE201608100007",
        "APRV_Date": "2016-08-10",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 27270,
        "RJM_TotalBuyTax": 1366,
        "RJM_TotalBuyAmt": 28636
      },
      {
        "RJM_No": "RE201612140002",
        "APRV_Date": "2016-12-14",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 241881,
        "RJM_TotalBuyTax": 12101,
        "RJM_TotalBuyAmt": 253982
      },
      {
        "RJM_No": "RE201701140001",
        "APRV_Date": "2017-01-14",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 12752,
        "RJM_TotalBuyTax": 638,
        "RJM_TotalBuyAmt": 13390
      },
      {
        "RJM_No": "RE201702170001",
        "APRV_Date": "2017-02-17",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 109742,
        "RJM_TotalBuyTax": 5489,
        "RJM_TotalBuyAmt": 115231
      },
      {
        "RJM_No": "RE201705100017",
        "APRV_Date": "2017-05-10",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 124396,
        "RJM_TotalBuyTax": 6222,
        "RJM_TotalBuyAmt": 130618
      },
      {
        "RJM_No": "RE201706050001",
        "APRV_Date": "2017-06-05",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 145363,
        "RJM_TotalBuyTax": 7269,
        "RJM_TotalBuyAmt": 152632
      },
      {
        "RJM_No": "RE201707110001",
        "APRV_Date": "2017-07-11",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 17247,
        "RJM_TotalBuyTax": 864,
        "RJM_TotalBuyAmt": 18111
      },
      {
        "RJM_No": "RE201708080006",
        "APRV_Date": "2017-08-08",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 68960,
        "RJM_TotalBuyTax": 3450,
        "RJM_TotalBuyAmt": 72410
      },
      {
        "RJM_No": "RE201709110007",
        "APRV_Date": "2017-09-11",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 35347,
        "RJM_TotalBuyTax": 1767,
        "RJM_TotalBuyAmt": 37114
      },
      {
        "RJM_No": "RE201710090001",
        "APRV_Date": "2017-10-09",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 26737,
        "RJM_TotalBuyTax": 1336,
        "RJM_TotalBuyAmt": 28073
      },
      {
        "RJM_No": "RE201711110001",
        "APRV_Date": "2017-11-11",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 21341,
        "RJM_TotalBuyTax": 1067,
        "RJM_TotalBuyAmt": 22408
      },
      {
        "RJM_No": "RE201712110001",
        "APRV_Date": "2017-12-11",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 218223,
        "RJM_TotalBuyTax": 10912,
        "RJM_TotalBuyAmt": 229135
      },
      {
        "RJM_No": "RE201801080004",
        "APRV_Date": "2018-01-08",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 26180,
        "RJM_TotalBuyTax": 1309,
        "RJM_TotalBuyAmt": 27489
      },
      {
        "RJM_No": "RE201802050001",
        "APRV_Date": "2018-02-05",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 21948,
        "RJM_TotalBuyTax": 1099,
        "RJM_TotalBuyAmt": 23047
      },
      {
        "RJM_No": "RE201803090001",
        "APRV_Date": "2018-03-09",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 24750,
        "RJM_TotalBuyTax": 1237,
        "RJM_TotalBuyAmt": 25987
      },
      {
        "RJM_No": "RE201805190002",
        "APRV_Date": "2018-05-19",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 117230,
        "RJM_TotalBuyTax": 5863,
        "RJM_TotalBuyAmt": 123093
      },
      {
        "RJM_No": "RE201806060008",
        "APRV_Date": "2018-06-06",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 229688,
        "RJM_TotalBuyTax": 11485,
        "RJM_TotalBuyAmt": 241173
      },
      {
        "RJM_No": "RE201807090007",
        "APRV_Date": "2018-07-09",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 32714,
        "RJM_TotalBuyTax": 1637,
        "RJM_TotalBuyAmt": 34351
      },
      {
        "RJM_No": "RE201808070006",
        "APRV_Date": "2018-08-07",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 17372,
        "RJM_TotalBuyTax": 871,
        "RJM_TotalBuyAmt": 18243
      },
      {
        "RJM_No": "RE201809170001",
        "APRV_Date": "2018-09-17",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 20026,
        "RJM_TotalBuyTax": 1001,
        "RJM_TotalBuyAmt": 21027
      },
      {
        "RJM_No": "RE201812070003",
        "APRV_Date": "2018-12-07",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 55970,
        "RJM_TotalBuyTax": 2799,
        "RJM_TotalBuyAmt": 58769
      },
      {
        "RJM_No": "RE201901070007",
        "APRV_Date": "2019-01-07",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 23760,
        "RJM_TotalBuyTax": 1188,
        "RJM_TotalBuyAmt": 24948
      },
      {
        "RJM_No": "RE201902120003",
        "APRV_Date": "2019-02-12",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 48310,
        "RJM_TotalBuyTax": 2417,
        "RJM_TotalBuyAmt": 50727
      },
      {
        "RJM_No": "RE201903120010",
        "APRV_Date": "2019-03-12",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 14960,
        "RJM_TotalBuyTax": 751,
        "RJM_TotalBuyAmt": 15711
      },
      {
        "RJM_No": "RE201905130003",
        "APRV_Date": "2019-05-13",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 58837,
        "RJM_TotalBuyTax": 2943,
        "RJM_TotalBuyAmt": 61780
      },
      {
        "RJM_No": "RE201906100006",
        "APRV_Date": "2019-06-10",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 257182,
        "RJM_TotalBuyTax": 12863,
        "RJM_TotalBuyAmt": 270045
      },
      {
        "RJM_No": "RE201907110003",
        "APRV_Date": "2019-07-11",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 47702,
        "RJM_TotalBuyTax": 2387,
        "RJM_TotalBuyAmt": 50089
      },
      {
        "RJM_No": "RE201908080001",
        "APRV_Date": "2019-08-08",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 51284,
        "RJM_TotalBuyTax": 2563,
        "RJM_TotalBuyAmt": 53847
      },
      {
        "RJM_No": "RE201909050001",
        "APRV_Date": "2019-09-05",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 189380,
        "RJM_TotalBuyTax": 9474,
        "RJM_TotalBuyAmt": 198854
      },
      {
        "RJM_No": "RE201912050015",
        "APRV_Date": "2019-12-05",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 36630,
        "RJM_TotalBuyTax": 1834,
        "RJM_TotalBuyAmt": 38464
      },
      {
        "RJM_No": "RE202001100009",
        "APRV_Date": "2020-01-10",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 44121,
        "RJM_TotalBuyTax": 2206,
        "RJM_TotalBuyAmt": 46327
      },
      {
        "RJM_No": "RE202002110006",
        "APRV_Date": "2020-02-11",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 22257,
        "RJM_TotalBuyTax": 1116,
        "RJM_TotalBuyAmt": 23373
      },
      {
        "RJM_No": "RE202005080010",
        "APRV_Date": "2020-05-08",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 47510,
        "RJM_TotalBuyTax": 2377,
        "RJM_TotalBuyAmt": 49887
      },
      {
        "RJM_No": "RE202006030005",
        "APRV_Date": "2020-06-03",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 116469,
        "RJM_TotalBuyTax": 5818,
        "RJM_TotalBuyAmt": 122287
      },
      {
        "RJM_No": "RE202007080002",
        "APRV_Date": "2020-07-08",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 15404,
        "RJM_TotalBuyTax": 773,
        "RJM_TotalBuyAmt": 16177
      },
      {
        "RJM_No": "RE202008110002",
        "APRV_Date": "2020-08-11",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 16654,
        "RJM_TotalBuyTax": 834,
        "RJM_TotalBuyAmt": 17488
      },
      {
        "RJM_No": "RE202009070001",
        "APRV_Date": "2020-09-07",
        "VEN_NO": "'23991432'-1",
        "HOS_NAME": "化妝品",
        "RJM_TotalBuyNet": 23394,
        "RJM_TotalBuyTax": 1168,
        "RJM_TotalBuyAmt": 24562
      }
    ];
    // 使用 RxJS 的 of 運算子模擬 API 延遲和回傳資料
    return of(dummyData); // 如果需要模擬延遲，可以加上 delay(500)
    // 如果未來要改成真的 API 呼叫，可以替換成：
    /*
    return this.http.post<IReturnDetailData[]>(`${this.apiUrl}/queryReturnDetail`, {
        billingMonth: billingMonth,
        vendorNo: vendorNo
    });
    */
  }

  /**
   * @method queryInvoiceDetailsForRebate
   * 模擬 API：查詢該廠商可開立折讓單的發票/收據明細。
   * (對應規格：發票金額– 已折讓金額 > 0 的近兩年資料，按日期降冪排序)
   * * @param vendorNo 廠商編號
   * @param storeNo 店別 (預設為 '10')
   * @returns Observable<IInvoiceDetail[]> 模擬的發票明細資料陣列
   */
  queryInvoiceDetailsForRebate(VEN_No: string | null): Observable<IInvoiceDetail[]> {
    // 模擬當前日期為 2025/11/11
    const today = new Date('2025-11-11');
    const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate()).toISOString().substring(0, 10); // 2023-11-11
    // 模擬資料，確保 PUR_GUIDate 在近兩年，且 Rebate_Amt < PUR_Amt
    const dummyInvoiceData: IInvoiceDetail[] = [
      {
        "SeqNo": 1,
        "PUR_GUINo": "SV69049830",
        "PUR_GUIDate": "2025-09-19 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 1332988,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 2,
        "PUR_GUINo": "SV69049678",
        "PUR_GUIDate": "2025-09-18 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 86823,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 3,
        "PUR_GUINo": "SV69049679",
        "PUR_GUIDate": "2025-09-18 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 2993006,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 4,
        "PUR_GUINo": "SV69049461",
        "PUR_GUIDate": "2025-09-17 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 10360328,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 5,
        "PUR_GUINo": "SV69049462",
        "PUR_GUIDate": "2025-09-17 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 432432,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 6,
        "PUR_GUINo": "SV69048854",
        "PUR_GUIDate": "2025-09-12 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 1183096,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 7,
        "PUR_GUINo": "SV69048594",
        "PUR_GUIDate": "2025-09-11 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 508384,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 8,
        "PUR_GUINo": "SV69048716",
        "PUR_GUIDate": "2025-09-11 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 2720,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 9,
        "PUR_GUINo": "SV69048717",
        "PUR_GUIDate": "2025-09-11 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 166005,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 10,
        "PUR_GUINo": "SV69048718",
        "PUR_GUIDate": "2025-09-11 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 3019900,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 11,
        "PUR_GUINo": "SV69048090",
        "PUR_GUIDate": "2025-09-08 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 216062,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 12,
        "PUR_GUINo": "SV69047922",
        "PUR_GUIDate": "2025-09-05 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 2602142,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 13,
        "PUR_GUINo": "SV69047713",
        "PUR_GUIDate": "2025-09-04 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 499945,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 14,
        "PUR_GUINo": "SV69047777",
        "PUR_GUIDate": "2025-09-04 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 9280,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 15,
        "PUR_GUINo": "SV69047778",
        "PUR_GUIDate": "2025-09-04 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 148603,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 16,
        "PUR_GUINo": "SV69047812",
        "PUR_GUIDate": "2025-09-04 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 692886,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 17,
        "PUR_GUINo": "SV69047544",
        "PUR_GUIDate": "2025-09-03 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 3504778,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 18,
        "PUR_GUINo": "SV69046611",
        "PUR_GUIDate": "2025-09-01 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 806513,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 19,
        "PUR_GUINo": "SV69046686",
        "PUR_GUIDate": "2025-09-01 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 9888,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 20,
        "PUR_GUINo": "SV69046710",
        "PUR_GUIDate": "2025-09-01 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 165975,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 21,
        "PUR_GUINo": "SV69046733",
        "PUR_GUIDate": "2025-09-01 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 2129387,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 22,
        "PUR_GUINo": "QV69053765",
        "PUR_GUIDate": "2025-08-20 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 621005,
        "Rebate_Amt": 240590
      },
      {
        "SeqNo": 23,
        "PUR_GUINo": "QV69053062",
        "PUR_GUIDate": "2025-08-15 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 211189,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 24,
        "PUR_GUINo": "QV69053131",
        "PUR_GUIDate": "2025-08-15 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 10503,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 25,
        "PUR_GUINo": "QV69053132",
        "PUR_GUIDate": "2025-08-15 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 582628,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 26,
        "PUR_GUINo": "QV69053157",
        "PUR_GUIDate": "2025-08-15 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 192768,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 27,
        "PUR_GUINo": "QV69052794",
        "PUR_GUIDate": "2025-08-13 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 408909,
        "Rebate_Amt": 384019
      },
      {
        "SeqNo": 28,
        "PUR_GUINo": "QV69052224",
        "PUR_GUIDate": "2025-08-08 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 141873,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 29,
        "PUR_GUINo": "QV69052006",
        "PUR_GUIDate": "2025-08-07 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 103526,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 30,
        "PUR_GUINo": "QV69052065",
        "PUR_GUIDate": "2025-08-07 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 225387,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 31,
        "PUR_GUINo": "QV69052066",
        "PUR_GUIDate": "2025-08-07 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 23919,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 32,
        "PUR_GUINo": "QV69052091",
        "PUR_GUIDate": "2025-08-07 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 592992,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 33,
        "PUR_GUINo": "QV69051733",
        "PUR_GUIDate": "2025-08-06 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 1230628,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 34,
        "PUR_GUINo": "QV69050683",
        "PUR_GUIDate": "2025-08-01 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 319965,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 35,
        "PUR_GUINo": "QV69050717",
        "PUR_GUIDate": "2025-08-01 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 95734,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 36,
        "PUR_GUINo": "QV69050753",
        "PUR_GUIDate": "2025-08-01 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 71480,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 37,
        "PUR_GUINo": "QV69050799",
        "PUR_GUIDate": "2025-08-01 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 12503,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 38,
        "PUR_GUINo": "QV69050817",
        "PUR_GUIDate": "2025-08-01 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 708439,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 39,
        "PUR_GUINo": "QV69050873",
        "PUR_GUIDate": "2025-08-01 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 118657,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 40,
        "PUR_GUINo": "QV69051086",
        "PUR_GUIDate": "2025-08-01 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 188765,
        "Rebate_Amt": 115770
      },
      {
        "SeqNo": 41,
        "PUR_GUINo": "QV69049636",
        "PUR_GUIDate": "2025-07-18 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 254017,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 42,
        "PUR_GUINo": "QV69049432",
        "PUR_GUIDate": "2025-07-17 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 431650,
        "Rebate_Amt": 295170
      },
      {
        "SeqNo": 43,
        "PUR_GUINo": "QV69049490",
        "PUR_GUIDate": "2025-07-17 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 142473,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 44,
        "PUR_GUINo": "QV69049502",
        "PUR_GUIDate": "2025-07-17 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 297691,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 45,
        "PUR_GUINo": "QV69049278",
        "PUR_GUIDate": "2025-07-16 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 141374,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 46,
        "PUR_GUINo": "QV69049303",
        "PUR_GUIDate": "2025-07-16 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 146723,
        "Rebate_Amt": 77447
      },
      {
        "SeqNo": 47,
        "PUR_GUINo": "QV69048527",
        "PUR_GUIDate": "2025-07-10 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 69000,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 48,
        "PUR_GUINo": "QV69048605",
        "PUR_GUIDate": "2025-07-10 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 15159,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 49,
        "PUR_GUINo": "QV69048606",
        "PUR_GUIDate": "2025-07-10 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 273071,
        "Rebate_Amt": 0
      },
      {
        "SeqNo": 50,
        "PUR_GUINo": "QV69048626",
        "PUR_GUIDate": "2025-07-10 00:00:00.000",
        "PUR_VenNo": '23991432',
        "TABTYPE": "發票",
        "PUR_TaxType": "應稅",
        "PUR_DirectType": "專供課稅",
        "PUR_VoucherType": '25',
        "PUR_Amt": 25679,
        "Rebate_Amt": 0
      }
    ]
    return of(dummyInvoiceData);
    // 如果未來要改成真的 API 呼叫，可以替換成：
    /*
    return this.http.post<IInvoiceDetail[]>(`${this.apiUrl}/queryRebateInvoice`, {
        vendorNo: vendorNo,
        storeNo: storeNo
    });
    */
  }
}
