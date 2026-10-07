/**
 * 統一元件設計的標準下拉選單項目格式
 * 所有需要傳入元件的資料都應該轉換為此格式
 */
export interface Option {
  label: string;
  value: any;
  [key: string]: any;
}

/**
 * 通用的下拉選單項目型別，適用於大部分只有 No 和 Name 的下拉選單
 */
export interface IDropdownItem {
  No: string;
  Name: string;
}

/**
 * queryPOS2002_Location_DropDownList 回傳項目
 */
export interface Pos2002LocationItem {
  location_no?: string | null;
  tlt_building?: string | null;
  tlt_floor?: string | null;
  area_no?: string | null;
  tlt_space?: number | null;
  building_desc?: string | null;
  floor_desc?: string | null;
  area_desc?: string | null;
}

/** queryFASITEM_DropDownList 回傳列（GOODS_ID / GOODS_NAME / UNIT_NAME / ID） */
export interface FasItemDropdownItem {
  RowNo?: string;
  RowNum?: number;
  ID?: number | null;
  GOODS_ID?: string | null;
  GOODS_NAME?: string | null;
  UNIT?: string | null;
  UNIT_NAME?: string | null;
}

/** queryGLS1005_AccNo_DropDownList（資材攤提會計科目）回傳列 */
export interface FasAccNoDropdownItem {
  ROWNO?: string | null;
  AccNo?: string | null;
  AccCName?: string | null;
  AccDisplay?: string | null;
}

/**
 * 查詢採購單號下拉選單(ASS13010)
 * 後端回傳欄位：ID、APPLY_DATE
 * 前端下拉顯示僅需 ID
 */
export interface Ass13010PurchaseNumberDropDownItem {
  ID: string;
  APPLY_DATE: string;
}

/**
 * 查詢進貨單號下拉選單(ASS15070) queryFAASSCHKMASS15070_DropDownList
 * 前端下拉僅使用 SUBPOENA_ID
 */
export interface FAASSCHKMASS15070DropDownItem {
  SUBPOENA_ID?: string | null;
  NTAX_AMT?: number;
  CHECK_DATE?: string | null;
}

/** FIN70000 / POS2064MPCS_NoDropDownList 回傳列 */
export interface Pos2064MpcsNoDropDownItem {
  PCS_No?: string | null;
  PCS_Date?: string | null;
  PCS_UsrNo?: string | null;
}

/** FIN70000 / POS2064MPCS_RqstNoDropDownList 回傳列 */
export interface Pos2064MpcsRqstNoDropDownItem {
  PCS_RqstNo?: string | null;
  PCS_RqstDate?: string | null;
  Keep_UsrNo?: string | null;
}

/**
 * 查詢 queryFAASSCHKM_DropDownList 時的請求 body
 */
export interface FAASSCHKMQuery {
  Keyword?: string;
}

/**
 * 查詢驗收單號下拉選單 queryFAASSCHKM_DropDownList
 * 後端回傳欄位：SUBCHECK_ID
 */
export interface FAASSCHKMDropDownItem {
  SUBCHECK_ID?: string | null;
}

/**
 * 查詢 FACLASSM_DropDownList 時的請求 body
*/
export interface FaClassMQuery {
  CLASS_ID?: string | null;
  Keyword?: string | null;
}

/**
 * queryFACLASSM_DropDownList 回傳的項目型別
 */
export interface FaClassMItem {
  RowNum?: string;
  M_CLASS_ID: string;
  M_CLASS_NAME: string;
  B_CLASS_ID: string;
  B_CLASS_NAME: string;
  NOTES?: string | null;
}

/**
 * 查詢 FACLASS1_DropDownList 時的請求 body（資材大分類代碼 = FACLASSM.CLASS_ID）
 */
export interface FaClass1Query {
  /** 大分類代碼（對應 swagger B_CLASS_ID） */
  B_CLASS_ID?: string | null;
}

/**
 * queryFACLASS1_DropDownList 回傳的項目型別
 */
export interface FaClass1Item {
  RowNum?: string | null;
  M_CLASS_ID?: string | null;
  M_CLASS_NAME?: string | null;
  B_CLASS_ID?: string | null;
  B_CLASS_NAME?: string | null;
  NOTES?: string | null;
}

/**
 * 查詢 FACLASS2_DropDownList 時的請求 body
 */
export interface FaClass2Query {
  /** 大分類代碼（FACLASSM.CLASS_ID） */
  B_CLASS_ID?: string | null;
  /** 中分類代碼（對應 swagger M_CLASS_ID） */
  M_CLASS_ID?: string | null;
}

/**
 * queryFACLASS2_DropDownList 回傳的項目型別
 */
export interface FaClass2Item {
  RowNum?: string | null;
  S_CLASS_ID?: string | null;
  S_CLASS_NAME?: string | null;
  M_CLASS_ID?: string | null;
  M_CLASS_NAME?: string | null;
  B_CLASS_ID?: string | null;
  B_CLASS_NAME?: string | null;
  NOTES?: string | null;
}

export interface FaHosItem {
  WH_ID: string;
  WH_NAME: string;
}

export interface FaSItemQuery {
  MATERIAL_TYPE: string;
}

export interface FaSItem {
  GOODS_ID: string;
  GOODS_NAME: string;
}

/**
 * queryFASITEM_DropDownList 請求（例：MATERIAL_TYPE = 品項類別） */
export interface FaSitemQuery {
  MATERIAL_TYPE?: string | null;
  /** 品項編號/名稱查詢字串，支援 % 萬用字元（如 '3%' 只列 3 開頭） */
  SearchText?: string | null;
}

/**
 * queryFASITEM_DropDownList 回傳項目
 */
export interface FaSitemItem {
  RowNo?: string;
  GOODS_ID: string;
  GOODS_NAME: string;
}

/**
 * /ASS0000/ASS1000/queryASS11040 回傳項目（SearchASS11040Response 子集）。
 * 與舊 `FaSitemItem` 並存：本介面含 UNIT 欄位，供 CRU 明細自動帶入單位的頁面使用。
 */
export interface FaSitemAss1000Item {
  RowNum?: number;
  ID?: number;
  GOODS_ID: string;
  GOODS_NAME: string;
  UNIT?: string | null;
  MATERIAL_TYPE?: string | null;
  STATUS?: string | null;
}

/**
 * 查詢 TLTBUSCLASS 時的請求 body
 */
export interface BusClassQuery {
  bus_type: string[];
}

/**
 * 查詢 TLTBUSCLASS 回傳的項目型別
 */
export interface BusClassItem extends IDropdownItem {
  bus_type: string;
  bus_type_name: string;
}

/**
 * 查詢 TLTBUSSCLASS 回傳的項目型別
 */
export interface BusSClassItem extends IDropdownItem {
  bus_type: string;
  bus_type_name: string;
  bus_class: string;
  bus_class_name: string;
}

/**
 * 查詢 TLTBUSSCLASS 時的請求 body
 */
export interface BusSClassRequest {
  queryTLTBUSSCLASSInfos: {
    bus_type: string;
    bus_class: string;
  }[];
}

/**
 * 查詢 SYS3100 Tree 時的請求 body
 */
export interface OrgTreeQuery {
  org_id: string;
  stop_flag: string;
}

/**
 * 查詢 SYS3100 Tree 回傳的項目型別
 */
export interface OrgTreeItem {
  org_id: string;
  org10Label: string;
  org20Label: string;
  org30Label: string;
  org40Label: string;
  org_name: string;
}

/**
 * 查詢 POS1002_Status_DropDownList 回傳的項目型別
 */
export interface Pos1002StatusItem {
  ECR_No: string;
  ECR_Name: string;
  ECR_Status: string;
}

/**
 * 查詢 POS20031_DropDownList 回傳的項目型別
 */
export interface Pos20031Item extends IDropdownItem {
  CAT_LNo: string;
  CAT_LName: string;
}

/**
 * 查詢 PLULOGO_DropDownList 回傳的項目型別
 */
export interface PluLogoItem extends IDropdownItem {
  LOGO_EN_NAME: string;
}

/**
 * 查詢 PLULOGO_OrderPrcRate_DropDownList 回傳的內部項目型別
 */
export interface PluLogoOrderPrcRateInnerItem extends IDropdownItem {
  PLU_OrderPrcRate: number;
}

/**
 * 查詢 PLULOGO_HOS_No_DropDownList 回傳的內部項目型別
 */
export interface PluLogoHOSNoInnerItem extends IDropdownItem {
  HOS_No: string;
}

/**
 * 查詢 APS1003_DropDownList 時的請求 body
 */
export interface Aps1003Query {
  cap_typeList: string[];
}

/**
 * TLS2D010 專用：查詢扣款代碼檔(APS1003) 時的請求 body（/TLS0000/TLS2000/queryAPS1003DropDownList）
 */
export interface Aps1003Tls2d010Query {
  CAP_ItemList?: string[];
}

/**
 * TLS2D010 專用：查詢扣款代碼檔(APS1003) 回傳的原始項目（含 CAP_Type 等欄位，供頁面自行分類/篩選，不做 value/label 轉換）
 */
export interface Aps1003Tls2d010Item {
  CAP_Item: string;
  CAP_Name: string;
  AccNo?: string;
  AccCName?: string;
  GUI_FLAG: string;
  CAP_TaxType?: string;
  CAP_Type: string;
  org_id?: string;
}

/**
 * 查詢 POS20031_DropDownList 時的請求 body
 */
export interface Pos20031Query {
  CAT_LNo: string[];
}

/**
 * 查詢 POS20032_DropDownList 時的請求 body
 */
export interface Pos20032Query {
  CAT_LNo: string[];
  CAT_MNo: string[];
}
/**
 * 查詢專櫃主檔(TLTTALENT) (取最新契約，含對應資料)
 */
export interface TLTTALENTQuery {
  tlt_noList?: string[];
}

/**
 * 查詢 TLTTALENT_Status_DropDownList 時的請求 body
 */
export interface TalentStatusQuery {
  approve_status: string;
}

/**
 * 查詢 TLTTALENT_StoreWay_DropDownList 時的請求 body
 */
export interface TalentStoreWayQuery {
  store_way: string;
}

/**
 * 查詢 TLTTALENT_Allowed_DropDownList 時的請求 body
 */
export interface TalentAllowedQuery {
  ProgNo: string;
  VEN_No?: string;
}

/**
 * 查詢 SYS1000_DropDownList 時的請求 body
 */
export interface Sys1000Query {
  SYS_Type: string;
}

/**
 * 查詢 APS1001_DropDownList 時的請求 body
 */
export interface Aps1001Query {
  SearchKeyword: string;
}

/**
 * 查詢 APS1001_DropDownList 回傳的項目型別
 */
export interface Aps1001Item extends IDropdownItem {
  DisplayText: string;
}

/**
 * 查詢 APS1001_DropDownList 時的請求 body
 */
export interface Aps1001Query {
  SearchKeyword: string;
}

/**
 * 查詢 APS1001_DropDownList 回傳的項目型別
 */
export interface Aps1001Item extends IDropdownItem {
  DisplayText: string;
}

/**
 * 查詢 APS1001_DropDownList (Combo型態) 回傳的項目型別
 */
export interface Aps1001ComboItem {
  No: string;
  Name: string;
  DisplayText: string;
  /** 銀行別(前3碼) */
  BNK_No: string;
  /** 分行(後4碼) */
  BNK_BranchNo: string;
}

/**
 * 查詢 APS1001_DropDownList (Combo型態) 時的請求 body
 */
export interface Aps1001ComboQuery {
  SearchKeyword: string;
}

/**
 * 查詢 TBLUSER_Orgid_DropDownList 回傳的項目型別
 */
export interface TblUserOrgidItem {
  user_No: string;
  user_Name: string;
  Org_ID: string;
  Org_Name: string;
}

/**
 * 查詢 TLTTALENT_ByContractDate_DropDownList 時的請求 body
 */
export interface TalentByContractDateQuery {
  tlt_contract_date: string; // 使用字串格式，例如 '2025-09-04T15:16:47.268Z'
}

/**
 * 查詢 TLTTALENT_ByContractDate_DropDownList 回傳的項目型別
 */
export interface TalentByContractDateItem extends IDropdownItem {
  store_way: string;
  talent_id: number;
}

/**
 * 查詢 POS2004_DropDownList 時的請求 body
 */
export interface Pos2004Query {
  TLT_NO: string;
}

/**
 * 查詢 POS2004_DropDownList 時的請求 body
 */
export interface Pos2004SearchKey {
  SearchKey: string;
}

/**
 * 查詢 POS2004_DropDownList 回傳的項目型別
 */
export interface Pos2004Item {
  PLU_MagNo: string;
  PLU_No: string;
  PLU_Name: string;
  PLU_SalePrc: number;
}

/**
 * 查詢 商品下拉選單 Response (擴充版)
 */
export interface Pos2004ExtendedItem extends Pos2004Item {
  PLU_Unit: string
  PLU_OrgPLUNo: string
}

/**
 * 查詢 POS2004_ByTalentDropDownList 回傳的擴充項目型別
 */
export interface Pos2004WithBrandItem extends Pos2004Item {
  PLU_OrgPLUNo: string; // 廠商貨號
  LOGO_No: string;      // 品牌代碼
}

/**
 * 查詢 TLTTALENT_CHARGE_DropDownList 時的請求 body
 */
export interface TalentChargeQuery {
  talent_id: number;
}

export interface BatchTalentChargeQuery {
  talent_ids: number[];
}

/**
 * 查詢 TLTTALENT_tlt_openflag_DropDownList 時的請求 body
 */
export interface TalentOpenFlagQuery {
  /** 廠商編號 */
  VEN_No: string;
  /** 契約有效起日 */
  tlt_bdate?: string;
  /** 契約有效迄日 */
  tlt_edate?: string;
}

/**
 * 查詢 TLTTALENT_tlt_openflag_DropDownList 回傳的項目型別（含 talent_id）
 */
export interface TalentOpenFlagItem extends IDropdownItem {
  talent_id: number;
}

/**
 * 查詢 queryTLTTALENT_ActiveContract_DropDownList 回傳的項目型別
 * 共通下拉：僅回傳「當下日期落在合約有效期間內」的專櫃，並直接附帶店位/館別/樓層/區域資料，
 * 選取後可直接帶入表單欄位，不需再呼叫 queryTLT_NoInfo。
 */
export interface TLTTALENTActiveContractItem extends IDropdownItem {
  talent_id: number;
  tlt_bdate: string;
  tlt_edate: string;
  ECR_Group: string | null;
  ECR_SubGroup: string | null;
  ECR_AreaNo: string | null;
  ECR_LocNo: string | null;
  building_desc?: string | null;
  floor_desc?: string | null;
  area_desc?: string | null;
  contract_subno?: number;
}

/**
 * 查詢 TLTTALENT_ContractHistory_DropDownList 的請求 body（可選填，不填回傳全部）
 */
export interface TalentContractHistoryQuery {
  DateFrom?: string | null;
  DateTo?: string | null;
}

/**
 * 查詢 TLTTALENT_ContractHistory_DropDownList 回傳的項目型別
 * 含歷史合約，同一 tlt_no 可能有多筆(不同 talent_id 合約)，不做去重
 */
export interface TalentContractHistoryItem {
  talent_id: number;
  tlt_no: string;
  tlt_name: string;
  tlt_bdate: string | null;
  tlt_edate: string | null;
}

/**
 * 查詢 queryTLTTALENTDropDownList 時的請求 body
 */
export interface TLTTALENTItem {
  talent_id: string,
  apply_no: string,
  tlt_bdate: string,
  tlt_edate: string,
  tlt_no: string,
  tlt_name: string,
  org_id: string,
  contract_no: string,
  contract_subno: string,
  tlt_contract_bdate: string,
  tlt_contract_edate: string
}

/**
 * 查詢 TLTTALENT_CHARGE_DropDownList 回傳的項目型別
 */
export interface TalentChargeItem {
  talent_id?: number;
  tlt_id: string;
  tlt_id_desc: string;
  cag_taxtype: string;
  cag_barcode: string;
  cag_barcode_name: string;
}

/**
 * 查詢 ECRDropDownList 時的請求 body
 */
export interface EcrQuery {
  building_no: string;
  floor_no: string;
  area_no: string;
  ecr_type: string;
}

/**
 * 查詢 ECRDropDownList 回傳的項目型別
 */
export interface EcrItem {
  ecr_no: string;
  ecr_name: string;
  tlt_no: string;
  tlt_name: string;
  building_no: string;
  building_name: string;
  floor_no: string;
  floor_name: string;
  area_no: string;
  area_name: string;
  ecr_type: string;
}

/**
 * 查詢 POS1002ECR_TypeDropDownList 時的請求 body
 */
export interface Pos1002EcrTypeQuery {
  ECR_Type: string;
}

/**
 * 查詢 POS1002Group_SubGroup_AreaNo_DropDownList 時的請求 body
 */
export interface Pos1002GroupQuery {
  building_no: string;
  floor_no: string;
  area_no: string;
}

/**
 * 查詢 POS1002Group_SubGroup_AreaNo_DropDownList 回傳的項目型別
 */
export interface Pos1002GroupItem {
  ECR_No: string;
  ECR_Name: string;
  tlt_no: string;
  tlt_name: string;
  building_no: string;
  building_name: string;
  floor_no: string;
  floor_name: string;
  area_no: string;
  area_name: string;
}

/**
 * 查詢 TalentDropDownList 時的請求 body
 */
export interface TalentQuery {
  building_nos?: string[];
  floor_nos?: string[];
  area_nos?: string[];
  tlt_openflag?: string;
  approve_status?: string;
  tlt_no?: string;
  tlt_name?: string;
  ven_no?: string;
  tlt_bdate?: string | null;
  tlt_edate?: string | null;
}

/**
 * 查詢 TalentDropDownList 回傳的項目型別
 */
export interface TalentItem {
  talent_id: number;
  tlt_no: string;
  tlt_name: string;
  apply_no: string;
  ven_no: string;
  VEN_Name: string;
  building_no: string;
  building_name: string;
  floor_no: string;
  floor_name: string;
  area_no: string;
  area_name: string;
}

/**
 * 查詢 POS1008DropDownList 回傳的項目型別
 */
export interface Pos1008Item {
  TSB_Name: string;
  TSB_XCount: number;
  TSB_YCount: number;
  TSB_Height: number;
  TSB_Width: number;
}

/**
 * 查詢 POS1006_DropDownList 回傳的項目型別
 */
export interface Pos1006Item extends IDropdownItem {
  PAY_Type: string;
  PAY_OverPay: string;
}

/**
 * 查詢 POS2013_DropDownList 時的請求 body
 */
export interface Pos2013Query {
  VEN_Flag: string;
}

/** 廠商資料表查詢參數介面 */
export interface Pos2013LogoRequest {
  LOGO_No?: string; // 改為可選
  VEN_No?: string;  // 新增可選的廠商編號
}
/**
 * 查詢 POS2013_DropDownList 回傳的項目型別
 */
export interface Pos2013Item extends IDropdownItem {
  // --- 廠商欄位 ---
  VEN_No: string;
  Name: string;      // 廠商全名
  ShortName: string; // 廠商簡稱
  No: string;        // 廠商統編 (VEN_Uniform)

  // --- 新增：品牌欄位 (與後端 Response DTO 一致) ---
  LOGO_No: string;
  LOGO_CH_NAME: string;

  // 原有但後端 SQL 若沒抓會是空的欄位
  VEN_EngName?: string;
  VEN_Address?: string;
}

/**
 * 查詢 POS2004LOGO_NoDropDownList 時的請求 body
 */
export interface Pos2004LogoQuery {
  LOGO_No: string;
}

/**
 * 查詢 POS2004LOGO_NoDropDownList 回傳的項目型別
 */
export interface Pos2004LogoItem {
  PLU_MagNo: string | null;
  PLU_No: string | null;
  PLU_Unit: string | null;
  PLU_BoxQty: number | null;
  PLU_Name: string | null;
  PLU_PageNum: string | null;
  PLU_LocNo: number | null;
}

/**
 * 查詢 queryTALPORDERM_DropDownList 時的請求 body
 */
export interface TALPORDERMQuery {
  pod_typeList: string[];
  pod_statusList: string[];
}
/**
 * 查詢 share/queryTALPORDERM_DropDownList 時的請求 body
 */
export interface TALPORDERMQueryForShare {
  mid: number,
  str_no: string,
  pod_type?: string[],
  pod_status?: string
}

/**
 * 查詢 GLS3002 對帳 Key 值下拉式選單回傳項目
 */
export interface Gls3002AcctKeyItem {
  ACCT_KEY: string;
}

/**
 * 查詢 queryLOGOaccorHOS 時的請求 body (品牌對應倉別)
 */
export interface LogoAccorHosQuery {
  LOGO_No?: string;
  HOS_No?: string;
}

/**
 * 查詢 queryLOGOaccorHOS 回傳的項目型別 (品牌對應倉別)
 */
export interface LogoAccorHosItem {
  TotalCount: number;
  LOGO_No: string;
  LOGO_CH_NAME: string;
  HOS_No: string;
  HOS_NAME: string;
}

export interface TALPORDERMDataForShare {
  pod_no: string,
  pod_type: string,
  pod_desc: string,
  pod_sdate: string,
  pod_edate: string
}

/**
 * 查詢 queryENG1001_ENG_MeterNo_DropDownList 回傳的項目型別
 */
export interface ENG1001Item {
  Id: number,
  ENG_MeterNo: string,
  Location_No: string,
  Location_Name: string,
  building_No: string,
  building_DESC: string,
  Floor_No: string,
  Floor_Desc: string,
  AREA_NO: string,
  AREA_DESC: string,
  Draw_X: string,
  Draw_Y: string,
  ENG_Type: string
}
// TLTTALENT_TLT_SPACE
export interface TlttalentTltSpaceItem {
  TalentId: number,
  TltNo: string
  TltName: string
  ApplyNo: string
  LocationNo: string
  TltSpace: number
}

/** CSS1003 查詢參數 */
export interface Css1003Query {
  KIND_ID: string | null;
}

/** CSS1005 查詢參數 */
export interface Css1005Query {
  ORG_ID: string;
}

/** CSS 系列通用回傳項 (1002, 1003, 1005) */
export interface CssDropDownItem {
  No: string;
  Name: string;
  /** CSS1005 專用：選 CLASS_ID 後自動帶出組織代碼 */
  ORG_ID?: string;
}

/**
 * 查詢 APS1002_DropDownList 回傳的項目型別 (公司銀行科目)
 */
export interface Aps1002Item {
  BNK_DepositAccNo: string; // 科目帳號/代碼
  ACCCNAME: string;         // 科目名稱
  BNK_No: string;           // 銀行代碼
  BNK_BRANCHNAME: string;   // 分行名稱
  BNK_AccType: string;      // 帳戶類型 (例如: 1-支存, 2-活存...)
  BNK_id: string;           // GL 科目代號（對應 GLS1005.ACCNO），SP_FIN62050Query @BankList 使用此值
}

/**
 * 查詢會計科目子科目設定檔(GLS1005 AccSubCode)下拉式選單
 */
export interface GLS1005AccSubCodeItem {
  CompNo: string;
  AccNo: string;
  AccCName: string;
  AccEName: string;
  AccDC: string;
}

/**
 * 查詢會計科目設定檔(GLS1005)下拉式選單(只顯示 GLS1005.ledger_MD=1)
 */
export interface IGLS1005LedgerMDItem extends IDropdownItem {
  ABAT_YN: string; // 應收廠商
}

/**
 * 查詢 SYS5000 子模組下拉選單 (querySYS5000SubModuleNo_DropDownList) 回傳的項目型別
 * 繼承 IDropdownItem (No, Name) 並擴充完整 SYS5000 屬性
 */
export interface Sys5000SubModuleItem extends IDropdownItem {
  /** 模組代碼 (如: ASS) */
  module_no: string;
  /** 模組名稱 */
  module_name: string;
  /** 唯一識別碼 */
  id: number;
  /** 程式快捷編號 */
  prog_id: string | null;
  /** 上層程式代號 */
  prog_up: string | null;
  /** 是否可執行的程式 (Y=可執行) */
  prog_ispage: string;
  /** 是否停用 (Y=停用) */
  prog_stopflag: string;
  /** 排列順序 */
  prog_sort: number | null;
}

/** * TLS55020 專用查詢參數
 */
export interface Tls55020Query {
  /** 交易日期 (YYYY-MM-DD) */
  TXN_Date: string;
}

/**
 * 收銀機下拉選單項目型別
 */
export interface queryPOS1002_DropDownListItem {
  No: string;
  Name: string;
  ECR_TLT_No?: string;
}

/**
 * 收銀機下拉選單項目型別(自營)
 */
export interface queryOwnPOS1002_DropDownListItem {
  ECR_No: string;
  ECR_Name: string;
}

/**
 * 查詢過濾後的收銀機設定檔 (POS1002 Filtered) 回傳項目
 * 對應後端 SQL: ECR_No, ECR_Name, ECR_TLT_No, ECR_TLT_Name, ECR_Status
 */
export interface Pos1002FilteredItem {
  No: string;        // ECR_No
  Name: string;      // ECR_Name
  ECR_TLT_No: string;
  ECR_TLT_Name: string;
  ECR_Status: string;
}

/** 查詢商品管理編號(ASS11040)下拉選單回傳項目 */
export interface Ass11040DropDownItem extends IDropdownItem {
  MaterialType?: string; // 或是 MATERIAL_TYPE，與後端 JSON 大小寫一致
  B_CLASS_ID?: string; // 大分類代碼，供查詢 ASS11090 中分類會計科目設定用
  M_CLASS_ID?: string; // 中分類代碼，供查詢 ASS11090 中分類會計科目設定用
}