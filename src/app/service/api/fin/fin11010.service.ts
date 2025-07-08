// --- FIN11010 Model 定義 ---
export interface FIN11010 {
  row_no?: number;              // 序號
  company_no?: string;          // 公司代號
  business_name?: string;       // 營業人名稱
  tax_no?: string;              // 營業人統編
  tax_id?: string;              // 營業人統編 (舊欄位)
  tax_name?: string;            // 營業人名稱 (舊欄位)
  city_type?: string;           // 縣市別
  address?: string;             // 營業地址
  main_code?: string;           // 總繳代號
  declare_method?: string;      // 申報方式
  deduct_type?: string;         // 直接扣抵法(Y/N)
  review_status?: string;       // 審核狀態(未確認/使用中/已過期)
  declare_month_start?: string; // 申報年月起
  declare_month_end?: string;   // 申報年月迄
  review_date?: string;         // 審核日期
  reviewer?: string;            // 審核人員
  setting_status?: string;      // 設定狀態(未確認/使用中/已過期)
}

// 其餘 service 內容...
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiOption } from '../../../shared/models/sys/sysb000.module';

@Injectable({
  providedIn: 'root'
})
export class Fin11010Service {
  // 查詢
  queryFIN11010(params: any): Observable<any> {
    // 回傳假資料
    return new Observable((observer) => {
      observer.next({
        Data: [
          {
            row_no: 1,
            company_no: 'C001',
            business_name: '台灣科技股份有限公司',
            tax_no: '12345678',
            tax_id: '12345678',
            tax_name: '台灣科技股份有限公司',
            city_type: '台北市',
            address: '信義路100號',
            main_code: 'A',
            declare_method: '網路申報',
            deduct_type: 'Y',
            review_status: '已審核',
            declare_month_start: '2023-01',
            declare_month_end: '2023-12',
            review_date: '2024-01-15',
            reviewer: '管理者',
            setting_status: '使用中',
          },
        ],
        Status: '0000',
      });
      observer.complete();
    });
  }
  exportFIN11010(params: any): Observable<any> {
    // 請依實際API實作
    return new Observable();
  }

  // 總繳代號
  getMainCodeOptions(): Observable<{ Data: apiOption[] }> {
    // 回傳假資料
    return new Observable((observer) => {
      observer.next({
        Data: [
          { No: 'A', Name: '總機A', Label: '總機A' },
          { No: 'B', Name: '總機B', Label: '總機B' },
        ]
      });
      observer.complete();
    });
  }

  // 新增
  insertFIN11010(body: any): Observable<any> {
    // 模擬新增成功
    return new Observable((observer) => {
      observer.next({ Status: '0000', Message: '新增成功' });
      observer.complete();
    });
  }

  // 取得最近一筆資料
  getLatestSetting(): Observable<any> {
    // 模擬取得最近一筆資料
    return new Observable((observer) => {
      observer.next({
        company_no: 'C001',
        owner_name: '王小明',
        business_name: '台灣科技股份有限公司',
        tax_no: '12345678',
        tax_id: '12345678',
        tax_name: '台灣科技股份有限公司',
        city_type: '台北市',
        address: '信義路100號',
        main_code: 'A',
        declare_method: 'A',
        deduct_type: 'Y',
        review_status: '未確認',
        setting_status: '未確認',
      });
      observer.complete();
    });
  }

  // 審核功能
  reviewFIN11010(id: any): Observable<any> {
    // 模擬審核成功
    return new Observable((observer) => {
      const currentDate = new Date().toISOString().split('T')[0];
      observer.next({
        Status: '0000',
        Message: '審核成功',
        Data: {
          review_date: currentDate,
          reviewer: '管理者',
          setting_status: '使用中',
          review_status: '已審核'
        }
      });
      observer.complete();
    });
  }

  // 反審核功能
  unreviewFIN11010(id: any): Observable<any> {
    // 模擬反審核成功
    return new Observable((observer) => {
      observer.next({
        Status: '0000',
        Message: '反審核成功',
        Data: {
          review_date: null,
          reviewer: null,
          setting_status: '未確認',
          review_status: '未確認',
          declare_month_end: null
        }
      });
      observer.complete();
    });
  }

}