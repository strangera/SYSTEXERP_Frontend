import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TLS41010Item } from '../../pages/tls/tls41010/tls41010.model';
// 通用的下拉選單項目介面，用於大部分返回 { No: string, Name: string } 的 API
export interface IDropdownItem {
  value?: string;
  tlt_building?: string;
  tlt_floor?: string;
  area_no?: string;
  No: string; // 唯一值
  Name: string; // 用於顯示的名稱
  Display?: string; // 額外顯示欄位，例如 "No-Name"
  ShortName?: string; // 用於顯示的簡稱
  VEN_No?: string;  // 廠商編號
  HOS_No?: string; // 品牌編號
  store_way?: string;
  talent_id?: number;
  rece_yn?: string;
  PAY_Type?: string;
  label?: string; // 用於顯示的標籤
  CAT_LNo?: string;
  CAT_LName?: string;
  CAT_MNo?: string;
  CAT_MName?: string;
  items?: IDropdownItem[];
  ECR_TmplNo?: string; // 環境變數編號 模板編號
  ECR_TmplName?: string; // 環境變數編號 模板備註
  bus_type?: string;
  bus_type_name?: string;
  PAY_OverPay?: string;
  CHG_ItemName_List?: string;
}
// APS3001 下拉選單 Item
export interface IAPS3001Item {
  ACP_No: string;
  VEN_No: string;
  VEN_Name: string;
  ACP_Amt: number;
  ACP_Date: string; // yyyy-MM-dd
  ACP_BalanceAmt: number;
  acp_reserveamt: number;
}

export interface TLTTALENT_TLT_SPACE extends IDropdownItem {
  TalentId: number,
  TltNo: string,
  TltName: string,
  ApplyNo: string,
  LocationNo: string,
  TltSpace: number
}

export interface BusSClass extends IDropdownItem {
  bus_class: string,
  bus_class_name: string
}

export interface ITalentOption extends IDropdownItem {
  tlt_no: string;
  tlt_name: string;
  talent_id: number;
  org_id: string;
  contract_no?: string;
  contract_subno?: string;
  apply_no?: string;
  tlt_contract_bdate?: string | null;
  tlt_contract_edate?: string | null;
}
// 針對 querySYS3100_tree_DropDownList 的資料結構
export interface ISYS3100TreeItem {
  org_id: string;
  org10Label: string;
  org20Label: string;
  org30Label: string;
  org40Label: string;
  org_name: string;
}

// 針對 queryPLULOGO_OrderPrcRate_DropDownList 的資料結構
export interface IPLULOGOOrderPrcRateItem {
  No: string;
  Name: string;
  PLU_OrderPrcRate: number;
}

// 針對 queryPOS2002_Location_DropDownList 的資料結構
export interface IPOS2002LocationItem {
  location_no: string;
  tlt_building: string;
  tlt_floor: string;
  area_no: string;
  tlt_space: number;
  building_desc: string;
  floor_desc: string;
  area_desc: string;
}

// 請求參數介面
export interface ITLTBUSCLASSRequest {
  bus_type: string[];
}

export interface ITLTBUSSCLASSRequest {
  queryTLTBUSSCLASSInfos: {
    bus_type: string,
    bus_class: string
  }[]
}

// 小分類組成['大'+'中'] -- 新版api
export interface ITLTBUSSCLASSInfo {
  bus_type: string;
  bus_class: string;
}

//小分類Request-- 新版api
export interface ITLTBUSSCLASSRequest_new {
  queryTLTBUSSCLASSInfos: ITLTBUSSCLASSInfo[];
}

// GLS1005 ledgerMD 下拉選單項目
export interface IGLS1005LedgerMDItem {
  No: string;
  Name: string;
  ABAT_YN: string;
}

export interface ISYS3100TreeRequest {
  org_id: string;
  stop_flag: string;
}

export interface IAPS1003Request {
  cap_typeList: string[];
}

export interface CAP_ItemRequest {
  CAP_ItemList: string[]
}

export interface IPOS20031Request {
  CAT_LNo: string[];
}

export interface IPOS20032Request {
  CATList: [
    {
      CAT_LNo: string,
      CAT_MNo: string
    }
  ]
}

export interface ISYS1000Request {
  SYS_Type: string;
}

export interface IBankRequest {
  SearchKeyword: string;
}

export interface IPOS2002LocationRequest {
  talentId: string;
}

export interface IPOS2013Request {
  VEN_Flag?: string;
}

export interface POS2004Item {
  id?: number;
  PLU_MagNo: string | POS2004Item;
  PLU_No: string;
  PLU_Name: string;
  PLU_SalePrc?: number,
  TLT_No?: string,
  cag_barcode?: string,
  tlt_id?: string,
  Contract_No?: string,
  Contract_SubNo?: string
  label?: string; // 用於顯示的標籤
}

export interface POS1002Item {
  ID?: number,
  ECR_No?: string,
  ECR_Name?: string,
  tlt_no?: string,
  tlt_name?: string,
  building_no?: string,
  building_name?: string,
  floor_no?: string,
  floor_name?: string,
  area_no?: string,
  area_name?: string,
  Remark?: string
}

export interface TltTalentChargeData {
  tlt_id: string,
  tlt_id_desc: string,
  cag_taxtype: string,
  cag_barcode: string,
  cag_barcode_name: string
}

// 新增 interface for 字軌 API
export interface IPOS1018GUITrackRequest {
  GUI_YYMM: string;
  MID: number;
  STO_No: string;
  GUI_Type: string[];
}

// ARS4001 收貨單編號請求參數
export interface IARS4001RCVNORequest {
  MID: number;
  STO_No: string;
}
export interface IPOS1018GUITrackResponse {
  GuiTracks: string[];
}

// 新增 interface for 發票格式 API
export interface ITDS1007Request {
  mid: number;
  inv_guiTypeList?: string[];
}

export interface ITDS1007Response {
  INV_GUITypes: TDS1007Item[];
}

// 修改現有的 TDS1007Item interface
export interface TDS1007Item {
  INV_GUIType: string;
  INV_GUIName: string;
}

// 機台鍵盤編號下拉(dropdownTLS42010)回傳項目，key/value 皆為 USR_Level，另附鍵盤型態/說明供組合顯示文字
export interface ITLS42010KBLevelItem {
  keyUSR_Level: string;
  valueUSR_Level: string;
  ECR_KBType: string;
  ECR_KBDesc: string;
}

export interface TALPORDERMRequest {
  mid?: number;
  str_no?: string;
  pod_type?: string[];
  pod_status?: string;
}
export interface TALPORDERMResponse {
  pod_no?: string;
  pod_type?: string;
  pod_desc?: string;
  pod_sdate?: string;
  pod_edate?: string;
}
export interface IAPS1003Item {
  CAP_Item: string;
  CAP_Name: string;
  AccNo?: string;
  AccCName?: string;
  GUI_FLAG: string;
  CAP_TaxType?: string;
  CAP_Type: string;
  org_id?: string;
}
export interface POS1006Item {
  PAY_Type?: string;
  PAY_OverPay?: string;
  PAY_TaxType?: string;
  No: string;
  Name: string;
}
export interface TLTTALENTDropDownRequest {
  tlt_noList?: string[]; // 查指定專櫃編號
  isNewData?: boolean;   // 是否僅查詢合約有效期內（當日介於契約起迄日）的專櫃資料，後端預設false
}

@Injectable({
  providedIn: 'root'
})
export class DropDownListService {
  private readonly apiUrl = environment.ApiUrl;

  constructor(
    private readonly http: HttpClient,
  ) { }

  queryPLULOGO_HOS_No_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPLULOGO_HOS_No_DropDownList`, {});
  }

  // 查詢倉別(POS2034)資料表下拉選單 (原先的 getBankOptions 已更名以符合API功能)
  getPOS2034Options(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS2034_DropDownList`, {});
  }

  /**
   * 查詢倉別(FAHOS)下拉選單（ASS17100 等）
   */
  queryFAHOS_DropDownList(body: Record<string, unknown> = {}): Observable<
    ApiResponse<{ WH_ID?: string | null; WH_NAME?: string | null }[]>
  > {
    return this.http.post<ApiResponse<{ WH_ID?: string | null; WH_NAME?: string | null }[]>>(
      `${this.apiUrl}/queryFAHOS_DropDownList`,
      body,
    );
  }

  // 查詢上層組織(SYS3000)資料表下拉選單
  querySYS3000_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/querySYS3000_DropDownList`, {});
  }

  // 查詢專櫃大分類(業種)設定檔(TLTBUSTYPE)資料表
  queryTLTBUSTYPE_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTLTBUSTYPE_DropDownList`, {});
  }

  // 查詢中分類(商品類別)設定檔(TLTBUSCLASS)資料表
  queryTLTBUSCLASS_DropDownList(params: ITLTBUSCLASSRequest): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTLTBUSCLASS_DropDownList`, params);
  }

  // 查詢TLTBUSSCLASS資料表 (小分類)
  queryTLTBUSSCLASS_DropDownList(params: ITLTBUSSCLASSRequest): Observable<ApiResponse<BusSClass[]>> {
    return this.http.post<ApiResponse<BusSClass[]>>(`${this.apiUrl}/queryTLTBUSSCLASS_DropDownList`, params);
  }

  // 查詢TLTBUSSCLASS資料表 (小分類) -- 新版api測試
  queryTLTBUSSCLASS_DropDownList_new(params: ITLTBUSSCLASSRequest_new): Observable<ApiResponse<BusSClass[]>> {
    return this.http.post<ApiResponse<BusSClass[]>>(`${this.apiUrl}/queryTLTBUSSCLASS_DropDownList`, params);
  }

  // 查詢組織代碼(SYS3100)資料表下拉選單
  querySYS3100_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/querySYS3100_DropDownList`, {});
  }

  // 查詢組織階層樹狀圖(SYS3100)下拉選單
  querySYS3100_tree_DropDownList(params: ISYS3100TreeRequest): Observable<ApiResponse<ISYS3100TreeItem[]>> {
    return this.http.post<ApiResponse<ISYS3100TreeItem[]>>(`${this.apiUrl}/querySYS3100_tree_DropDownList`, params);
  }

  // 查詢館別代碼(SYS3800)資料表下拉選單
  querySYS3800_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/querySYS3800_DropDownList`, {});
  }

  // 查詢樓層代碼(SYS3900)資料表下拉選單
  querySYS3900_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/querySYS3900_DropDownList`, {});
  }

  // 查詢區域代碼(SYS3A00)資料表下拉選單
  querySYS3A00_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/querySYS3A00_DropDownList`, {});
  }

  // 查詢用途代碼(SYS3F00)資料表下拉選單
  querySYS3F00_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/querySYS3F00_DropDownList`, {});
  }

  // 查詢會計科目設定檔(GLS1005)下拉式選單
  queryGLS1005_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryGLS1005_DropDownList`, {});
  }

  // 查詢科目大分類(GLS1003)下拉式選單
  queryGLS1003_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryGLS1003_DropDownList`, {});
  }
  // 查詢 ENG1002 下拉式選單
  queryENG1002_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/Share/queryENG1002_DropDownList`, {});
  }

  // 查詢會計科目設定檔(GLS1005)下拉式選單 (只取1103科目)
  queryGLS1005For1103_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryGLS1005For1103_DropDownList`, {});
  }

  // 查詢會計科目設定檔(GLS1005) ledgerMD 下拉式選單 (含 ABAT_YN 欄位)
  queryGLS1005_ledgerMD_DropDownList(): Observable<ApiResponse<IGLS1005LedgerMDItem[]>> {
    return this.http.post<ApiResponse<IGLS1005LedgerMDItem[]>>(`${this.apiUrl}/queryGLS1005_ledgerMD_DropDownList`, {});
  }

  // 查詢扣款代碼檔(APS1003)資料表
  queryAPS1003_DropDownList(params: IAPS1003Request): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryAPS1003_DropDownList`, params);
  }

  // 查詢後台主機IP(POS10015)資料表下拉選單
  queryPOS10015_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS10015_DropDownList`, {});
  }

  // 查詢環境變數編號(POS1002TML)資料表下拉選單
  queryPOS1002TML_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS1002TML_DropDownList`, {});
  }

  // 查詢收銀機群組編號(POS1002GRM)資料表下拉選單
  queryPOS1002GRM_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS1002GRM_DropDownList`, {});
  }

  // 查詢位置編號(SYS3A00)資料表下拉選單 (注意：Swagger 中寫 SYS3A00，但實際路徑是 POS2002)
  queryPOS2002_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS2002_DropDownList`, {});
  }

  // 查詢表格定義檔(DEFTBL)資料表
  queryDEFTBL_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryDEFTBL_DropDownList`, {});
  }

  // 查詢收銀機設定檔(POS1002)資料表
  queryPOS1002_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS1002_DropDownList`, {});
  }

  // 查詢收銀機群組(POS1002)資料表下拉選單 依照ECR_Type
  queryPOS1002ECR_TypeDropDownList(body: { ECR_Type: string }): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS1002ECR_TypeDropDownList`, body);
  }

  queryPOS1002Group_SubGroup_AreaNo_DropDownList(body: { building_no?: string, floor_no?: string, area_no?: string, ecr_no?: string }): Observable<ApiResponse<POS1002Item[]>> {
    return this.http.post<ApiResponse<POS1002Item[]>>(`${this.apiUrl}/queryPOS1002Group_SubGroup_AreaNo_DropDownList`, body);
  }

  // 查詢電子發票配號作業(POS1002)資料表
  queryPOS1002_Bill_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS1002_Bill_DropDownList`, {});
  }

  // 查詢大分類(POS2003)資料表
  queryPOS2003_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS2003_DropDownList`, {});
  }

  // 查詢中分類(POS20031)資料表
  queryPOS20031_DropDownList(params: IPOS20031Request): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS20031_DropDownList`, params);
  }

  // 查詢小分類代碼(POS20032)資料表下拉選單
  queryPOS20032_DropDownList(params: IPOS20032Request): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS20032_DropDownList`, params);
  }

  // 查詢品牌代碼(PLULOGO)資料表下拉選單
  queryPLULOGO_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPLULOGO_DropDownList`, {});
  }
  // 查詢 CPM13050 店家名稱(PK6001D) 下拉選單
  queryCPM13050_ShopNameDropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryCPM13050_shop_nameDropDownList`, {});
  }
  // 查詢 CPM13050 折扣名稱(PK68001D) 下拉選單
  queryCPM13050_RuleNameDropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryCPM13050_rule_nameDropDownList`, {});
  }

  // 查詢品牌代碼(PLULOGO)資料表下拉選單 (包含 PLU_OrderPrcRate)
  queryPLULOGO_OrderPrcRate_DropDownList(): Observable<ApiResponse<IPLULOGOOrderPrcRateItem[]>> {
    // 根據 Swagger Schema, Data 內部還有一個 Data 陣列，這可能是 Swagger 文件描述的問題或特殊結構。
    // 如果實際 API 返回的是直接包含 IPLULOGOOrderPrcRateItem 的陣列，則下面的 map 不必要。
    // 此處假設 Data 層級是多餘的，直接取用最內層的陣列。
    return this.http.post<ApiResponse<{ TotalCount: number, Data: IPLULOGOOrderPrcRateItem[] }[]>>(`${this.apiUrl}/queryPLULOGO_OrderPrcRate_DropDownList`, {})
      .pipe(
        map(response => {
          if (response.Data && response.Data.length > 0 && response.Data[0].Data) {
            return {
              ...response,
              Data: response.Data[0].Data // 提取內層的 Data 陣列
            };
          }
          return { ...response, Data: [] }; // 如果沒有，返回空陣列
        })
      );
  }

  // 查詢商品單位(PLUUNIT)資料表下拉選單
  queryPLUUNIT_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPLUUNIT_DropDownList`, {});
  }

  // 查詢部門編號/分店(SYS3100/POS1001)資料表下拉選單
  querySYS3100_join_POS1001_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/querySYS3100_join_POS1001_DropDownList`, {});
  }

  // 查詢專櫃主檔(TLTTALENT)資料表下拉選單
  queryTLTTALENT_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTLTTALENT_DropDownList`, {});
  }

  // 查詢專櫃主檔(TLTTALENT)資料表下拉選單 依狀態
  queryTLTTALENT_Status_DropDownList(approve_status: string): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTLTTALENT_Status_DropDownList`, { approve_status });
  }

  //依照 Store_way 查詢專櫃主檔(TLTTALENT)資料表下拉選單
  queryTLTTALENT_StoreWay_DropDownList(body: { store_way: string }): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTLTTALENT_StoreWay_DropDownList`, body);
  }

  // 查詢專櫃主檔(TLTTALENT)資料表下拉選單(Store_way=2自營and approve_status=2 已審核 and tlt_openflag != 0 非撤櫃)
  queryTLTTALENT__StoreWay2_Approve_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTLTTALENT__StoreWay2_Approve_DropDownList`, {});
  }

  // 查詢自營專櫃主檔(TLTTALENT)資料表下拉選單(Store_way=2自營and approve_status=2已審核)
  queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList`, {});
  }

  // 查詢專櫃下拉 (取最新契約，含對應資料，不用傳參數)
  queryTLTTALENTDropDownList(params: TLTTALENTDropDownRequest = {}): Observable<ApiResponse<ITalentOption[]>> {
    return this.http.post<ApiResponse<ITalentOption[]>>(
      `${this.apiUrl}/TLS0000/TLS2000/queryTLTTALENTDropDownList`, params
    );
  }

  // 查詢營業型態(SYS1000)資料表下拉選單
  querySYS1000_DropDownList(params: ISYS1000Request): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/querySYS1000_DropDownList`, params);
  }

  // 查詢角色設定檔(tblRole)資料表下拉選單
  querytblRole_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/querytblRole_DropDownList`, {});
  }

  // 查詢收銀員設定檔(POS2001)資料表下拉選單
  queryPOS2001_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS2001_DropDownList`, {});
  }

  // 查詢銀行資料表下拉選單
  queryAPS1001_DropDownList(params: IBankRequest): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryAPS1001_DropDownList`, params);
  }

  // 查詢洽談人員資料表下拉選單
  queryTBLUSER_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTBLUSER_DropDownList`, {});
  }

  // 查詢洽談人員資料表下拉選單 (包含停用)
  queryTBLUSER_AllStatus_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTBLUSER_AllStatus_DropDownList`, {});
  }

  // 查詢POS2002位置代碼資料表下拉選單
  queryPOS2002_Location_DropDownList(params: IPOS2002LocationRequest): Observable<ApiResponse<IPOS2002LocationItem[]>> {
    return this.http.post<ApiResponse<IPOS2002LocationItem[]>>(`${this.apiUrl}/queryPOS2002_Location_DropDownList`, params);
  }

  // 查詢POS2013廠商資料表下拉選單
  queryPOS2013_DropDownList(params: IPOS2013Request = {}): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS2013_DropDownList`, params);
  }

  // 查詢專櫃主檔(TLTTALENT)資料表下拉選單(依照契約日期取得合約資料)
  queryTLTTALENT_ByContractDate_DropDownList(tlt_contract_date: string | null): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTLTTALENT_ByContractDate_DropDownList`, { tlt_contract_date });
  }
  // 專為 TLS41040 使用的專櫃下拉（保留原始回傳 ApiResponse 結構）
  queryTLTTALENT_TLS41040_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTLTTALENT_TLS41040_DropDownList`, {});
  }
  // 查詢付款別(POS1006)資料表下拉選單
  queryPOS1006_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryPOS1006_DropDownList`, {});
  }
  // 查詢商品資料(POS2004)資料表下拉選單
  queryPOS2004_DropDownList(TLT_NO: string): Observable<ApiResponse<POS2004Item[]>> {
    return this.http.post<ApiResponse<POS2004Item[]>>(`${this.apiUrl}/queryPOS2004_DropDownList`, { TLT_NO });
  }
  // 查詢專櫃抽成主檔(TLTTALENT_CHARGE)資料表下拉選單
  queryTLTTALENT_CHARGE_DropDownList(talent_id?: number): Observable<ApiResponse<TltTalentChargeData[]>> {
    return this.http.post<ApiResponse<TltTalentChargeData[]>>(`${this.apiUrl}/queryTLTTALENT_CHARGE_DropDownList`, { talent_id });
  }

  // 查詢字軌(POS1018)資料表下拉選單
  queryPOS1018_GUI_TRACK_DropDownList(params: IPOS1018GUITrackRequest): Observable<ApiResponse<IPOS1018GUITrackResponse>> {
    return this.http.post<ApiResponse<IPOS1018GUITrackResponse>>(`${this.apiUrl}/Share/queryPOS1018_GUI_TRACK_DropDownList`, params);
  }

  // 查詢 ARS4001 收貨單編號 下拉選單
  queryARS4001RCVNO_DropDownList(params: IARS4001RCVNORequest): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/Share/queryARS4001RCVNO_DropDownList`, params);
  }
  // 查詢發票格式(TDS1007)資料表下拉選單
  queryTDS1007_DropDownList(params: ITDS1007Request): Observable<ApiResponse<ITDS1007Response>> {
    return this.http.post<ApiResponse<ITDS1007Response>>(`${this.apiUrl}/Share/queryTDS1007_DropDownList`, params);
  }
  // 查詢收銀畫面名稱(POS1008)資料表下拉選單
  queryPOS1008DropDownList(): Observable<ApiResponse<{ TSB_Name: string }[]>> {
    return this.http.post<ApiResponse<{ TSB_Name: string }[]>>(`${this.apiUrl}/queryPOS1008DropDownList`, {});
  }
  queryTLS42010DropDownList(): Observable<ApiResponse<ITLS42010KBLevelItem[]>> {
    return this.http.post<ApiResponse<ITLS42010KBLevelItem[]>>(`${this.apiUrl}/TLS0000/TLS4000/dropdownTLS42010`, { USR_Level: [] });
  }
  queryTLS42010FuncDropDownList(): Observable<{ label: string; value: string }[]> {
    const url = `${this.apiUrl}/TLS0000/TLS4000/dropdownTLS42010Func`;
    const body = { KB_Func: [] };

    return this.http.post<any>(url, body).pipe(
      map(res => {
        // 在 Service 層就決定好 UI 要顯示的格式
        const data: any[] = res?.Data ?? [];
        return data.map(item => ({
          label: `${item.KB_Func} - ${item.KB_Desc}`,
          value: item.KB_Func
        }));
      })
    );
  }
  // 載入活動清單 (TALPORDERM)
  getActivityOptions(params: TALPORDERMRequest): Observable<ApiResponse<TALPORDERMResponse[]>> {
    return this.http.post<ApiResponse<TALPORDERMResponse[]>>(`${this.apiUrl}/Share/queryTALPORDERM_DropDownList`, params);
  }
  // 查詢扣款代碼檔(APS1003) 下拉選單
  queryAPS1003DropDownList(params: CAP_ItemRequest): Observable<ApiResponse<IAPS1003Item[]>> {
    return this.http.post<ApiResponse<IAPS1003Item[]>>(`${this.apiUrl}/TLS0000/TLS2000/queryAPS1003DropDownList`, params);
  }
  // 查詢CPM11010 Service_Id資料表下拉選單
  queryCPM11010_ServiceId_DropDownList(): Observable<ApiResponse<{ Service_Id: string, Service_Name: string }[]>> {
    return this.http.post<ApiResponse<{ Service_Id: string, Service_Name: string }[]>>(`${this.apiUrl}/queryCPM11010_ServiceId_DropDownList`, {});
  }
  // 查詢專屬活動編號(TALPORDERM)資料表下拉選單
  queryTALPORDERM_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTALPORDERM_DropDownList`, {});
  }
  // 查詢環境變數模板 (POS1002TML_ALL)
  queryPOS1002TML_ALL_DropDownList(): Observable<ApiResponse<TLS41010Item[]>> {
    return this.http.post<ApiResponse<TLS41010Item[]>>(
      `${this.apiUrl}/queryPOS1002TML_ALL_DropDownList`, {});
  }
  // 查詢下拉選單 (TDS1008)
  queryTDS1008_DropDownList(SAL_Type: string[]): Observable<ApiResponse<IDropdownItem[]>> {
    const body = { SAL_Type };
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/Share/QueryTDS1008_DropDownList`, body);
  }
  // 查詢傳票型態(GLS1010)下拉選單
  queryGLS1010_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryGLS1010_DropDownList`, {});
  }
  // 能源下拉選單
  queryTLTTALENT_TLT_SPACE(params: { TltNo: string; ENG_Type?: string }): Observable<ApiResponse<TLTTALENT_TLT_SPACE[]>> {
    return this.http.post<ApiResponse<TLTTALENT_TLT_SPACE[]>>(`${this.apiUrl}/queryTLTTALENT_TLT_SPACE_DropDownList`, params);
  }
  // 查詢 TDS1010 下拉選單
  queryTDS1010_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryTDS1010_DropDown`, {});
  }
  // 查詢 CSS1002 下拉選單
  queryCSS1002DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryCSS1002DropDownList`, {});
  }
  // 查詢 CSS1003 下拉選單
  queryCSS1003DropDownList(KIND_ID: string): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryCSS1003DropDownList`, { KIND_ID });
  }
  // 查詢 APS3001 下拉選單
  queryAPS3001_DropDownList(): Observable<ApiResponse<IAPS3001Item[]>> {
    return this.http.post<ApiResponse<IAPS3001Item[]>>(
      `${this.apiUrl}/QueryAPS3001DropDownList`,
      {}
    );
  }
  //銀行資料表下拉選單 APS1001
  queryAPS1001NoBranch_DropDownList(params: IBankRequest): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.apiUrl}/queryAPS1001NoBranch_DropDownList`, params);
  }

}
