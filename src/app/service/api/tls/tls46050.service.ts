import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Tls46050Request {
  PageSize: number;
  PageIndex: number;
  SortBy: SortMeta[];
  ECR_No_Start: string;
  ECR_No_End: string;
  ShowTypes: string;
  ECR_GrpNos: string[];
}

export interface Tls46050Response {
  ID: number;
  ECR_No: string;
  EOS_TmplNo: string;
  ECR_TmplNo: string;
  EOS_KBLevel: string;
  ECR_KBLevel: string;
  ECR_GrpNo: string;
  ECR_GrpName: string;

  // ==================== 以下為補上的 TM 監控報表完整回傳欄位 ====================
  EOS_IP?: string;             // 收銀機IP
  EOS_Class?: string;          // 班別
  EOS_Status?: string;         // 收銀機即時狀態 (0=暫停交易、1=登出、3=交易中、5=關機)
  TLT_No?: string;             // 機台所屬專櫃編號
  TLT_Name?: string;           // 機台所屬專櫃名稱
  USR_No?: string;             // 作業中的收銀員代碼
  EOS_FreeGUIQty?: number;     // 機台剩餘可開立發票張數
  EOS_Type?: string;           // 機台類型 (1=統收、2=自收、5=離線、7=虛擬、OT=它社)
  EOS_Online?: string;         // 收銀機連線狀態 (Y=連線、N=離線)
  EOS_CloseTime?: string;      // 完成清帳時間
  EOS_StartUpTime?: string;    // 收銀機開機時間
  EOS_ShutDownTime?: string;   // 收銀機關機時間
  EOS_LastTxnTime?: string;    // 當天最後一筆交易時間

  // 收銀系統主程式與四個子模組的版本與更新狀態 (New 欄位用於前端判定顏色)
  EOS_MstSysVer?: string;      // 收銀系統主程式 KGPOS 版本
  EOS_MstSysNew?: string;      // 收銀系統主程式 KGPOS 是否為更新 Y/N
  EOS_ExtSysVer?: string;      // 收銀系統 KGExtFunc 版本
  EOS_ExtSysNew?: string;      // 收銀系統 KGExtFunc 是否為更新 Y/N
  EOS_DataSysVer?: string;     // 收銀系統 KGDataFunc 版本
  EOS_DataSysNew?: string;     // 收銀系統 KGDataFunc 是否為更新 Y/N
  EOS_PrmSysVer?: string;      // 收銀系統 KGPrmFunc 版本
  EOS_PrmSysNew?: string;      // 收銀系統 KGPrmFunc 是否為更新 Y/N
  EOS_DmnSysVer?: string;      // 收銀系統 STDmnPOS 版本
  EOS_DmnSysNew?: string;      // 收銀系統 STDmnPOS 是否為更新 Y/N

  // 各式周邊裝置與其狀態、連接埠 (Com 欄位與 Check 欄位)
  EOS_CD?: string;             // 客戶顯示器型態
  EOS_CDSysVer?: string;       // 客戶顯示器程式版本
  EOS_CDSysNew?: string;       // 客戶顯示器程式是否為更新 Y/N
  EOS_CDCom?: number;          // 客戶顯示器連接埠
  EOS_CDCheck?: string;        // 客戶顯示器設定是否相符 (Y/N/X)

  EOS_ExtScr?: string;         // 收銀客顯螢幕型態
  EOS_ExtScrSysVer?: string;   // 發票印表機程式版本 (對應原註解)
  EOS_ExtScrSysNew?: string;   // 發票印表機程式是否為更新 Y/N
  EOS_ExtScrCom?: number;      // 收銀客顯螢幕連接埠
  EOS_ExtScrCheck?: string;    // 收銀客顯螢幕設定是否相符 (Y/N/X)

  EOS_GUIPrn?: string;         // 發票印表機型態
  EOS_GUISysVer?: string;      // 發票印表機程式版本
  EOS_GUISysNew?: string;      // 發票印表機程式是否為更新 Y/N
  EOS_GUICom?: number;         // 發票印表機連接埠
  EOS_GUIPrnCheck?: string;    // 發票印表機設定是否相符 (Y/N/X)

  EOS_SlipPrn?: string;        // 收據印表機型態
  EOS_SlipPrnSysVer?: string;  // 收據印表機程式版本
  EOS_SlipPrnSysNew?: string;  // 收據印表機程式是否為更新 Y/N
  EOS_SlipPrnCom?: number;     // 收據印表機連接埠
  EOS_SlipPrnCheck?: string;   // 收據印表機設定是否相符 (Y/N/X)

  EOS_OrderPrn?: string;       // 訂單印表機型態
  EOS_OrderPrnSysVer?: string; // 訂單印表機程式版本
  EOS_OrderPrnSysNew?: string; // 訂單印表機程式是否為更新 Y/N
  EOS_OrderPrnCom?: number;    // 訂單印表機連接埠
  EOS_OrderPrnCheck?: string;  // 訂單印表機設定是否相符 (Y/N/X)

  EOS_LablePrn?: string;       // 標籤印表機型態
  EOS_LablePrnSysVer?: string; // 標籤印表機程式版本
  EOS_LablePrnSysNew?: string; // 標籤印表機程式是否為更新 Y/N
  EOS_LablePrnCom?: number;    // 標籤印表機連接埠
  EOS_LablePrnCheck?: string;  // 標籤印表機設定是否相符 (Y/N/X)

  EOS_EDC?: string;            // 信用卡刷卡機型態
  EOS_EDCSysVer?: string;      // 信用卡刷卡機程式版本
  EOS_EDCSysNew?: string;      // 信用卡刷卡機程式是否為更新 Y/N
  EOS_EDCCom?: number;         // 信用卡刷卡機連接埠
  EOS_EDCCheck?: string;       // 信用卡刷卡機設定是否相符 (Y/N/X)

  EOS_EDC2?: string;           // 第二台信用卡刷卡機型態
  EOS_EDC2SysVer?: string;     // 第二台信用卡刷卡機程式版本
  EOS_EDC2SysNew?: string;     // 第二台信用卡刷卡機程式是否為更新 Y/N
  EOS_EDC2Com?: number;        // 第二台信用卡刷卡機連接埠
  EOS_EDC2Check?: string;      // 第二台信用卡刷卡機設定是否相符 (Y/N/X)

  EOS_ElecSVCrdA?: string;     // 悠遊卡
  EOS_ElecSVCrdASysVer?: string; // 悠遊卡程式版本
  EOS_ElecSVCrdASysNew?: string; // 悠遊卡程式是否為更新 Y/N
  EOS_ElecSVCrdACom?: number;  // 悠遊卡連接埠
  EOS_ElecSVCrdACheck?: string; // 悠遊卡設定是否相符 (Y/N/X)

  EOS_ElecSVCrdB?: string;     // 一卡通
  EOS_ElecSVCrdBSysVer?: string; // 一卡通程式版本
  EOS_ElecSVCrdBSysNew?: string; // 一卡通程式是否為更新 Y/N
  EOS_ElecSVCrdBCom?: number;  // 一卡通連接埠
  EOS_ElecSVCrdBCheck?: string; // 一卡通設定是否相符 (Y/N/X)

  EOS_ElecSVCrdC?: string;     // 愛金卡
  EOS_ElecSVCrdCSysVer?: string; // 愛金卡程式版本
  EOS_ElecSVCrdCSysNew?: string; // 愛金卡程式是否為更新 Y/N
  EOS_ElecSVCrdCCom?: number;  // 愛金卡連接埠
  EOS_ElecSVCrdCCheck?: string; // 愛金卡設定是否相符 (Y/N/X)

  EOS_ElecPay?: string;        // 電子支付
  EOS_ElecPaySysVer?: string;  // 電子支付程式版本
  EOS_ElecPaySysNew?: string;  // 電子支付程式是否為更新 Y/N
  EOS_ElecPayCom?: number;     // 電子支付連接埠
  EOS_ElecPayCheck?: string;   // 電子支付設定是否相符 (Y/N/X)
}

@Injectable({
  providedIn: 'root'
})
export class Tls46050Service {
  private readonly apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;
  private readonly http = inject(HttpClient);

  queryTLS57050(requestBody: Tls46050Request): Observable<ApiResponse<Tls46050Response[]>> {
    return this.http.post<ApiResponse<Tls46050Response[]>>(`${this.apiUrl}/queryTLS46050`, requestBody);
  }
}
