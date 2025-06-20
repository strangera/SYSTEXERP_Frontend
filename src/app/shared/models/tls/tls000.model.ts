export interface Pos10015 {
  id: number;
  SYS_StoreNo: string;
  SYS_SrvNo: string;
  SYS_SrvIP: string;
  SYS_SrvPort: number;
  SYS_SrvStatus: string;
  SYS_SrvName?: string;
  SYS_SrvUsrID?: string;
  SYS_SrvUsrPwd?: string;
  SYS_SRVDDir?: string;
  SYS_SRVUDir?: string;
  SYS_MyPOSDDir?: string;
  SYS_MyPOSUDir?: string;
  SYS_SRVDDirClt?: string;
  SYS_SRVUDirClt?: string;
  CRT_Date?: string;            // 可用 Date 型別也可以 string，看你從後端拿到的是什麼
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
}


// PLUUNIT  商品單位設定檔
export interface PluUnit {
  'id': string;
  'UNIT_No': string;
  'UNIT_NAME': string;
  'UNIT_Attribute': string;
  'CHILD_UNIT': string; // 子項單位代號 --沒有使用
  'CHILD_QTY': number; // 子項單位數量 --沒有使用
  'UNIT_Remark': string;

  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;

  'CanDel': boolean;  //能否刪除(僅顯示)
}

// PLULOGO  商品品牌設定檔
export interface PluLogo {
  'id': string;
  'LOGO_No': string;
  'LOGO_CH_NAME': string;
  'LOGO_EN_NAME': string;
  'LOGO_Remark': string;
  'PLU_OrderPrcRate': number; // 標準進貨折數 預設100
  'HOS_No': string;
  'VEN_No': string;

  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;

  'CanDel': boolean;  //能否刪除(僅顯示)
}

// POS2004 商品主檔
export interface POS2004 {
  'id': string;
  'PLU_MagNo': string;
  'PLU_No': string;
  'PLU_OrgPLUNo': string;
  'PLU_Name': string;
  'PLU_PrnName': string;
  'PLU_EngName': string;

  'CAT_LNo': string;
  'CAT_MNo': string;
  'CAT_SNo': string;
  'VEN_No': string;

  'PLU_TaxType': string;
  'PLU_Unit': string;
  'PLU_Spec': string;

  'PLU_FixPrc': number;
  'PLU_SalePrc': number;
  'PLU_MemPrc': number;
  'PLU_BatPrc': number;
  'PLU_Cost': number;

  'PLU_OpenPrc': string;
  'PLU_Status': string;
  'PLU_Type': string;
  'PLU_PageNum': string;

  'PLU_LocNo': number;
  'PLU_BoxQty': number;
  'PLU_StockTaxType': string;

  'PLU_OrderPrc': number;
  'PLU_OrderPrcRate': number;
  'PLU_SafeQty': number;
  'PLU_LastStockDate': Date;

  'PLU_Reserve1': string;
  'PLU_Reserve2': string;
  'PLU_Reserve3': string;
  'PLU_Reserve4': string;
  'PLU_Reserve5': string;

  'PLU_StopSale': string;
  'PLU_CalcSaleStock': string;
  'PLU_Disc': string;
  'PLU_OpenOrderPrc': string;
  'PLU_LastSaleDate': Date;
  'PLU_LastUpdSalePrc': Date;
  'PLU_LastUpdOrderPrc': Date;

  'PLU_RebateRate': number;
  'PLU_AccountType': string;
  'PLU_StopStockDate': Date;

  'PLU_StopSaleDate': Date;
  'PLU_ExpDays': number;
  'PLU_MemPrc2': number;
  'PLU_MemPrc3': number;

  'MAM_No': string;
  'MAM_Condition': number;
  'MAM_TotAmt': number;
  'MAM_CombNo': string;
  'MAM_CombGrp': string;

  'MAM_Method': string;
  'MAM_UnitPrc': number;
  'MAM_ChangeNo': string;
  'MAM_BegDate': Date;
  'MAM_EndDate': Date;
  'MAM_Quart': number;
  'MAM_TotQuart': number;
  'MAM_AddPrc': number;
  'MAM_AddQty': number;

  'MAM_AddPLU_No': string;
  'MAM_MemCondition': number;
  'MAM_MemTotAmt': number;
  'MAM_MemUnitPrc': number;
  'MAM_MaxCondition': number;

  'MAM_DiscAmt': number;
  'MAM_ActiveDate': Date;
  'MAM_DiscType': string;
  'MAM_FirstActiveDate': Date;
  'MAM_RecoverDate': Date;

  'PLU_Attribute': string;
  'PLU_Source': string;
  'PLU_IsStock': string;
  'PLU_ReadyDay': number;
  'PLU_MinOrder': number;
  'PLU_StockType': string;
  'MAM_PLU_MagNo': string;

  'MAM_OrdPrcBegDate': Date;
  'MAM_OrdPrcEndDate': Date;
  'MAM_OrderPrc': number;
  'TLT_NO': string;
  'PLU_TaxRate': number;
  'PLU_Lable': string;
  'LOGO_No': string;

  'PLU_Length': number;
  'PLU_Width': number;
  'PLU_Height': number;
  'PLU_Weight': number;
  'PLU_Volume': number;
  'PLU_Image': string;
  'PLU_ECStatus': string;

  'PLU_ECStopUseDate': Date;
  'PLU_ECStopUseUsr': string;
  'PLU_ECStopUseName': string;
  'PLU_ECReShelvesDate': Date;
  'PLU_ECReShelvesUsr': string;
  'PLU_ECReShelvesName': string;
  'PLU_ECStopInDate': Date;
  'PLU_ECStopInUsr': string;
  'PLU_ECStopInName': string;


  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;

  'CanDel': boolean;  //能否刪除(僅顯示)
}

//POS2034 倉庫設定檔
export interface POS2034 {
  'id': string;
  'STO_No': string; // 公司編號/店號
  'HOS_No': string; // 倉庫代碼 STO_NO+HOS_NO唯一值 STO_NO+HOS_NO唯一值
  'HOS_NAME': string; // 倉庫名稱
  'org_id': string; // 組織代碼/所屬部門
  'building_no': string; // 館別代碼
  'HOS_Remark'?: string; // 備註說明

  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;

  'CanDel': boolean; //能否刪除(僅顯示)
}

// option項目
export interface Option {
  value: string;
  label: string;
}

// api dropDown list 接收選項
export interface apiOption {
  No: string;
  Name: string;
  Label?: string;
}
