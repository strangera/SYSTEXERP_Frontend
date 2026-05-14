import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface fin13090Item {
  VouNo: string, // 傳票編號
  VouDate: Date, // 傳票日期
  PostFlag: string, // 傳票狀態代碼 (1=建立 2=確認 3=過帳)
  PostFlagName: string, // 傳票狀態名稱
  TaxTotal: number // 進項稅額貸方 (APS2002.PUR_Tax 合計)
}

export interface fin13090Detail {
  id: number, // APS2002 主鍵 新增為0
  ACP_Type: string, // 應付帳款類別
  PUR_VoucherType: string, // 發票格式 (憑證類別 21~29)
  PUR_GUINo: string, // 發票號碼
  PUR_GUIDate: Date, // 發票日期
  PUR_RepYYYYMM: string, // 申報年月 (固定為雙數月)
  PUR_VenNo: string, // 廠商編號
  PUR_VenName: string, // 廠商名稱
  PUR_VenUniform: string, // 廠商統一編號
  PUR_Uniform: string, // 買受人統一編號
  PUR_DirectType: string, // 發票用途 (1=營業用 2=共同使用)
  PUR_Amt: number, // 發票總金額（含稅）

  PUR_TaxType: string, // 課稅別 (0=免稅 1=應稅 2=零稅)
  PUR_Net: number, // 發票未稅金額
  PUR_Tax: number  // 發票稅額
}

export interface fin13090response {
  Status: string,
  Data: fin13090Item[],
  Error: {
    Code: string,
    Message: string,
    Details: string
  },
  Message: string,
  TotalCount: number,
  TotalPage: number
}
@Injectable({
  providedIn: 'root'
})

export class Fin13090Service {
  //例行作業(補登進項稅額)
  private apiUrl = `${environment.ApiUrl}/FIN0000/INV1000`;

  constructor(private http: HttpClient) { }

  // 發票格式下拉 (TDS1007, code: 21/22/25/26/27/28)
  getGUITypeDropdown(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getGUITypeDropdown`, data);
  }

  // 查詢補發票傳票列表
  queryFIN13090(data: any): Observable<fin13090response> {
    return this.http.post<fin13090response>(`${this.apiUrl}/queryFIN13090`, data);
  }

  //查詢單一傳票明細
  queryFIN13090Detail(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN13090Detail`, data);
  }

  // 儲存補登進項稅額(insert/update共用) id=0: 新增 > id>0: 更新 ; DB有清單沒有 > 刪除
  saveFIN13090(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/saveFIN13090`, data);
  }
}
