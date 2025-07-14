import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';

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
  id?: number;                     // 主鍵
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
            id: 1,
            invNoStart: 'A123456789',
            invNoEnd: 'A123456790',
            invDateStart: '2024-06-01',
            invDateEnd: '2024-06-30',
            invYmStart: '202406',
            invYmEnd: '202406',
            declareYm: '202406',
            buyerTaxNo: '12345678',
            goodsName: '電子零件',
            goodsQtyStart: '10',
            goodsQtyEnd: '20',
            exportMethod: '空運',
            docNo: 'DOC20240601',
            docName: '出口證明',
            exportNo: 'EXP20240601',
            exportType: '一般',
            nonCustomsAmtStart: '10000',
            nonCustomsAmtEnd: '20000',
            customsAmtStart: '5000',
            customsAmtEnd: '10000',
            exportDateStart: '2024-06-05',
            exportDateEnd: '2024-06-10',
            remark: '測試資料'
          }
        ],
        Status: '0000',
        TotalCount: 1,
        TotalPage: 1,
        Message: '查詢成功'
      } as BaseQueryResponse<FIN13030Data>);
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

  // 刪除
  deleteFIN13030(id: number): Observable<{ Status: string; Message: string }> {
    return new Observable((observer) => {
      observer.next({ Status: '0000', Message: '刪除成功' });
      observer.complete();
    });
  }
}