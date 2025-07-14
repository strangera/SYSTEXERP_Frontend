import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse, DropdownOption } from '../../../shared/models/api/base-api.interface';

// --- FIN13030 查詢參數 Model 定義 ---
export interface FIN13030QueryRequest extends BaseQueryRequest {
  invNoStart?: string;             // 發票號碼(起)
  invNoEnd?: string;               // 發票號碼(迄)
  invDateStart?: string;           // 發票日期(起)
  invDateEnd?: string;             // 發票日期(迄)
  invYmStart?: string;             // 資料所屬年月(起)
  invYmEnd?: string;               // 資料所屬年月(迄)
  declareYm?: string;              // 申報年月
  buyerTaxNo?: string;             // 買受人統一編號
  goodsName?: string;              // 貨物或勞務名稱
  goodsQtyStart?: string;          // 貨物或勞務數量(起)
  goodsQtyEnd?: string;            // 貨物或勞務數量(迄)
  exportMethod?: string;           // 外銷方式
  docNo?: string;                  // 證明文件號碼
  docName?: string;                // 證明文件名稱
  exportNo?: string;               // 出口報單號碼
  exportType?: string;             // 出口報單類別
  nonCustomsAmtStart?: string;     // 非經海關出口金額(起)
  nonCustomsAmtEnd?: string;       // 非經海關出口金額(迄)
  customsAmtStart?: string;        // 經海關出口金額(起)
  customsAmtEnd?: string;          // 經海關出口金額(迄)
  exportDateStart?: string;        // 輸出或結匯日期(起)
  exportDateEnd?: string;          // 輸出或結匯日期(迄)
  remark?: string;                 // 備註
}

// --- FIN13030 回應資料 Model 定義 ---
export interface FIN13030Data {
  invNo?: string;             // 發票號碼
  invDate?: string;             // 發票日期
  invYm?: string;               // 資料所屬年月
  declareYm?: string;              // 申報年月
  buyerTaxNo?: string;             // 買受人統一編號
  goodsName?: string;              // 貨物或勞務名稱
  goodsQty?: string;               // 貨物或勞務數量
  exportMethod?: string;           // 外銷方式
  docNo?: string;                  // 證明文件號碼
  docName?: string;                // 證明文件名稱
  exportNo?: string;               // 出口報單號碼
  exportType?: string;             // 出口報單類別
  nonCustomsAmt?: string;     // 非經海關出口金額
  customsAmt?: string;        // 經海關出口金額
  exportDate?: string;        // 輸出或結匯日期
  remark?: string;                 // 備註
}

@Injectable({
  providedIn: 'root'
})
export class FIN13030Service {

  constructor() { }

  // 查詢
  queryFIN13030(params: FIN13030QueryRequest): Observable<BaseQueryResponse<FIN13030Data>> {
    // 回傳假資料
    return new Observable((observer) => {
      observer.next({
        Data: [
          {
            invNo: 'A123456789',
            invDate: '2024-06-01',
            invYm: '202406',
            declareYm: '202406',
            buyerTaxNo: '12345678',
            goodsName: '電子零件',
            goodsQty: '15',
            exportMethod: '1',
            docNo: 'DOC20240601',
            docName: '出口證明',
            exportNo: 'EXP20240601',
            exportType: 'A',
            nonCustomsAmt: '15000',
            customsAmt: '7500',
            exportDate: '2024-06-05',
            remark: '測試資料'
          },
          {
            invNo: 'B987654321',
            invDate: '2024-06-10',
            invYm: '202406',
            declareYm: '202406',
            buyerTaxNo: '87654321',
            goodsName: '機械設備',
            goodsQty: '5',
            exportMethod: '2',
            docNo: 'DOC20240610',
            docName: '外銷證明',
            exportNo: 'EXP20240610',
            exportType: 'B',
            nonCustomsAmt: '50000',
            customsAmt: '25000',
            exportDate: '2024-06-15',
            remark: '機械出口'
          }
        ],
        Status: '0000',
        TotalCount: 2,
        TotalPage: 1,
        Message: '查詢成功'
      } as BaseQueryResponse<FIN13030Data>);
      observer.complete();
    });
  }

  // 🆕 新增：取得外銷方式選項
  getExportMethodOptions(): Observable<BaseQueryResponse<DropdownOption>> {
    return new Observable((observer) => {
      observer.next({
        Data: [
          { Name: '外銷貨物', No: '1' },
          { Name: '外銷勞務', No: '2' },
          { Name: '免稅商店', No: '3' },
          { Name: '保稅倉庫', No: '4' },
          { Name: '國際快遞', No: '5' },
          { Name: '郵遞出口', No: '6' },
          { Name: '轉口貿易', No: '7' },
          { Name: '海運出口', No: '8' },
          { Name: '空運出口', No: '9' },
          { Name: '陸運出口', No: '10' }
        ],
        Status: '0000',
        TotalCount: 10,
        TotalPage: 1,
        Message: '查詢成功'
      } as BaseQueryResponse<DropdownOption>);
      observer.complete();
    });
  }

  // 🆕 新增：取得出口報單類別選項
  getExportTypeOptions(): Observable<BaseQueryResponse<DropdownOption>> {
    return new Observable((observer) => {
      observer.next({
        Data: [
          { Name: '一般出口', No: 'A' },
          { Name: '特種出口', No: 'B' },
          { Name: '臨時出口', No: 'C' },
          { Name: '復出口', No: 'D' },
          { Name: '委託加工出口', No: 'E' },
          { Name: '保稅區出口', No: 'F' },
          { Name: '自由貿易港區出口', No: 'G' },
          { Name: '科學園區出口', No: 'H' },
          { Name: '農業科技園區出口', No: 'I' },
          { Name: '其他特殊出口', No: 'Z' }
        ],
        Status: '0000',
        TotalCount: 10,
        TotalPage: 1,
        Message: '查詢成功'
      } as BaseQueryResponse<DropdownOption>);
      observer.complete();
    });
  }

  // 新增
  insertFIN13030(body: FIN13030Data): Observable<{ Status: string; Message: string }> {
    return new Observable((observer) => {
      observer.next({ Status: '0000', Message: '新增成功' });
      observer.complete();
    });
  }

  // 修改
  updateFIN13030(body: FIN13030Data): Observable<{ Status: string; Message: string }> {
    return new Observable((observer) => {
      observer.next({ Status: '0000', Message: '修改成功' });
      observer.complete();
    });
  }
}