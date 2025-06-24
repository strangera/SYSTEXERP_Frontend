/**
 * @interface IAPS2001
 * @description APS2001 銷項發票主檔的數據模型
 */
export interface IAPS2001 {
  id: number; // 主鍵 ID
  SAL_GUIYYYYMM: string; // 發票年月YYYYMM
  SAL_GUIBegMM: string; // 起始月份
  SAL_GUIEndMM: string; // 終止月份
  SAL_GUITrack: string; // 字軌
  SAL_GUIBegNo: string; // 發票起號
  SAL_GUIEndNo: string; // 發票迄號
  SAL_GUIPaper: string; // 發票聯式 (31=銷項三聯式電子式計算機發票, 32=銷項二聯式、二聯式收銀機統一發票, 33=銷項三聯式銷貨退回或折讓證明單, 34=銷項二聯式銷貨退回或折讓證明單, 35=銷項三聯式收銀機統一發票, 36=銷項免用發票)
  SAL_LastUsedGUINo: string | null; // 已使用的發票號
  SAL_VoidGUICnt: number | null; // 作廢發票張數
  SAL_BlankCnt: number | null; // 發票張數(50, 250, 1)
  SAL_SAmt: number | null; // 應稅金額
  SAL_TaxAmt: number | null; // 稅額
  SAL_NoTaxAmt: number | null; // 免稅金額
  SAL_ZeroTaxAmt: number | null; // 零稅金額
  STR_Uniform: string | null; // 統一編號
  STO_No: string | null; // 分店編號
  SAL_Type: string | null; // 使用別 SYS1000.SYS_Type='T205'
  GUI_DingType: string | null; // 是否為丁種發票 Y= 丁種發票 N=非丁種發票
  CRT_Date: string | null; // 建立日期
  CRT_USR_No: string | null; // 建立人員
  CRT_USR_Name: string | null; // 建立人員姓名
  UPD_Date: string | null; // 變更日期
  UPD_USR_No: string | null; // 變更人員
  UPD_USR_Name: string | null; // 變更人員姓名
}
