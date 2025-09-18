export interface testDorm {
  AccNo: string, // 科目代號
  AccCname: string, // 科目名稱
  AccEname: string, // 科目英文名稱
  AccDC: string, // 借/貸
  Ledger_MD: string, // 統制/明細
  ClassNo: string, // 三碼代號
  ABAT_YN: string, // 是否為沖帳代號
  Voucher_Type: string, // 傳票格式
  Budget_YN: string, // 是否為預算科目
  Org_YN: string, // 是否設定部門代號
  rest_value: number, // 折舊攤提年限
  rest_value2: number, // 殘值年限
  Input_YN: string, // 是否可輸

  //---可能也會需要下面這些---
  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}
