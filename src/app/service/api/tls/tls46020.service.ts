import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../system/auth.service';

// 查詢用參數
export interface TLS46020QueryParams {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  ECR_TmplNo?: string;
  ECR_TmplDesc?: string;
  ECR_TmplBegDate?: string;
  ECR_TmplEndDate?: string;
}

// 單筆資料模型
export interface TLS46020Item {
  SYS_StoreNo?: string;
  id?: number;
  ECR_TmplNo?: string;
  ECR_TmplDesc?: string;
  ECR_TmplStatus?: string;
  ECR_TmplBegDate?: string;
  ECR_TmplEndDate?: string;
  ECR_SernoType?: string;
  ECR_GUI_Type?: string;
  ECR_TimeTickInvl?: number;
  ECR_Interval?: number;
  ECR_MaxQty?: number;
  ECR_MaxAmt?: number;
  ECR_MaxItemAmt?: number;
  ECR_MaxDisc?: number;
  ECR_EdcTimeout?: number;
  ECR_EdcSettle?: string;
  ECR_ForceInput?: string;
  ECR_CustCntEntry?: string;
  ECR_CustTypeEntry?: string;
  ECR_ClerkEntry?: string;
  ECR_ForceMember?: string;
  ECR_SettleDD?: string;
  ECR_SettleHHNN?: string;
  ECR_VoidTxn?: string;
  ECR_VoidRstDay?: number;
  ECR_CreditNote?: string;
  ECR_GUI_PeriodQty?: number;
  ECR_GUI_MinQty?: number;
  ECR_SelfReport?: string;
  ECR_SaleRpt1?: string;
  ECR_SaleRpt2?: string;
  ECR_SaleRpt3?: string;
  ECR_SaleRpt4?: string;
  ECR_SaleRpt5?: string;
  ECR_SaleRpt6?: string;
  ECR_SaleRpt7?: string;
  ECR_SaleRpt8?: string;
  ECR_SaleRpt9?: string;
  ECR_SaleRpt10?: string;
  ECR_PcashValid?: string;
  ECR_PickUpValid?: string;
  ECR_ReprintGUI?: string;
  ECR_PrnLogo?: string;
  ECR_Logo1?: string;
  ECR_Logo2?: string;
  ECR_Logo3?: string;
  ECR_Logo4?: string;
  ECR_Logo5?: string;
  ECR_Logo6?: string;
  ECR_KBLevel?: string;
  ECR_KBType?: string;
  ECR_Scanner?: string;
  ECR_ScannerCom?: number;
  ECR_ScrType?: string;
  ECR_CD?: string;
  ECR_CDCom?: number;
  ECR_ExtScr?: string;
  ECR_ExtScrCom?: number;
  ECR_GUIPrn?: string;
  ECR_GUICom?: number;
  ECR_SlipPrn?: string;
  ECR_SlipPrnCom?: number;
  ECR_LablePrn?: string;
  ECR_LablePrnCom?: number;
  ECR_EDC?: string;
  ECR_EDCCom?: number;
  ECR_EDC2?: string;
  ECR_EDC2Com?: number;
  ECR_EDC3?: string;
  ECR_EDC3Com?: number;
  ECR_ElecSVCrdA?: string;
  ECR_ElecSVCrdACom?: number;
  ECR_ElecSVCrdB?: string;
  ECR_ElecSVCrdBCom?: number;
  ECR_ElecSVCrdC?: string;
  ECR_ElecSVCrdCCom?: number;
  ECR_ElecPay?: string;
  ECR_ElecPayCom?: number;
  ECR_Drawer?: string;
  ECR_DrawerCom?: number;
  ECR_Device1Name?: string;
  ECR_Device1Com?: number;
  ECR_Device2Name?: string;
  ECR_Device2Com?: number;
  ECR_Device3Name?: string;
  ECR_Device3Com?: number;
  ECR_Device4Name?: string;
  ECR_Device4Com?: number;
  ECR_Device5Name?: string;
  ECR_Device5Com?: number;
  ECR_Device6Name?: string;
  ECR_Device6Com?: number;
  ECR_Device7Name?: string;
  ECR_Device7Com?: number;
  ECR_Device8Name?: string;
  ECR_Device8Com?: number;
  ECR_Device9Name?: string;
  ECR_Device9Com?: number;
  ECR_Device10Name?: string;
  ECR_Device10Com?: number;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TLS46020Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS4000';

  constructor(private http: HttpClient) { }

  /** 查詢 POS1002TML 資料 */
  queryTLS46020(params: TLS46020QueryParams): Observable<ApiResponse<TLS46020Item[]>> {
    return this.http.post<ApiResponse<TLS46020Item[]>>(`${this.apiUrl}/queryTLS46020`, params);
  }

  /** 新增 POS1002TML 資料 */
  insertTLS46020(data: Omit<TLS46020Item, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/insertTLS46020`, data);
  }

  /** 更新 POS1002TML 資料 */
  updateTLS46020(data: TLS46020Item): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateTLS46020`, data);
  }

  /** 刪除 POS1002TML 資料 */
  deleteTLS46020(idList: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/deleteTLS46020`, { idList });
  }
}
