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
 * 查詢 POS2004_DropDownList 回傳的項目型別
 */
export interface Pos2004Item {
  PLU_MagNo: string;
  PLU_No: string;
  PLU_Name: string;
  PLU_SalePrc: number;
}

/**
 * 查詢 TLTTALENT_CHARGE_DropDownList 時的請求 body
 */
export interface TalentChargeQuery {
  talent_id: number;
}

/**
 * 查詢 TLTTALENT_tlt_openflag_DropDownList 時的請求 body
 */
export interface TalentOpenFlagQuery {
  /** 廠商編號 */
  VEN_No: string;
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

/**
 * 查詢 POS2013_DropDownList 回傳的項目型別
 */
export interface Pos2013Item extends IDropdownItem {
  ShortName: string;
  VEN_No: string;
  VEN_EngName: string;
  VEN_Address: string;
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
}
