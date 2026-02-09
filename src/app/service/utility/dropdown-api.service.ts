import { AuthService } from './../system/auth.service';
// !!! 新版下拉方法
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  Aps1001ComboItem,
  Aps1001ComboQuery,
  Aps1001Item,
  Aps1001Query,
  Aps1002Item,
  Aps1003Query,
  BusClassItem,
  BusClassQuery,
  BusSClassItem,
  BusSClassRequest,
  Css1003Query,
  Css1005Query,
  CssDropDownItem,
  EcrItem,
  EcrQuery,
  ENG1001Item,
  IDropdownItem,
  LogoAccorHosItem,
  LogoAccorHosQuery,
  Option,
  OrgTreeItem,
  OrgTreeQuery,
  PluLogoHOSNoInnerItem,
  PluLogoItem,
  PluLogoOrderPrcRateInnerItem,
  Pos1002EcrTypeQuery,
  Pos1002GroupItem,
  Pos1002GroupQuery,
  Pos1002StatusItem,
  Pos1006Item,
  Pos1008Item,
  Pos20031Item,
  Pos20031Query,
  Pos20032Query,
  Pos2004Item,
  Pos2004LogoItem,
  Pos2004LogoQuery,
  Pos2004Query,
  Pos2013Item,
  Pos2013Query,
  Sys1000Query,
  TalentByContractDateItem,
  TalentByContractDateQuery,
  TalentChargeItem,
  TalentChargeQuery,
  TalentItem,
  TalentOpenFlagItem,
  TalentOpenFlagQuery,
  TalentQuery,
  TalentStatusQuery,
  TalentStoreWayQuery,
  TALPORDERMDataForShare,
  TALPORDERMQuery,
  TALPORDERMQueryForShare,
  TblUserOrgidItem,
  TLTTALENTItem,
  TLTTALENTQuery,
  TlttalentTltSpaceItem
} from './dropdown-api.model';

@Injectable({
  providedIn: 'root'
})
export class DropdownApiService {
  private readonly apiUrl = environment.ApiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) { }

  /**
     * 泛型底層方法：處理所有下拉選單的查詢和轉換
     * @param endpoint API 路徑
     * @param noKey 代表「值」的屬性名稱 (e.g., 'No', 'user_No')
     * @param nameKey 代表「顯示名稱」的屬性名稱 (e.g., 'Name', 'user_Name')
     * @param body 請求 body (可選)
     * @returns Observable，包含標準的 IDropdownItem 陣列或 null
     */
  private queryAndMapDropdown<T, U = object>(
    endpoint: string,
    noKey: keyof T,
    nameKey: keyof T,
    body: U = {} as U // 給予預設值
  ): Observable<Option[] | null> {
    return this.http.post<ApiResponse<T[]>>(`${this.apiUrl}${endpoint}`, body).pipe(
      map(response => {
        const data = response?.Data;
        return data ? data.map(item => ({
          ...item,
          value: item[noKey] as string | number,
          label: `${item[noKey]} - ${item[nameKey]}`,
        })) : null;
      }),
      catchError(err => {
        console.error(`API ${endpoint} 失敗:`, err);
        return of(null);
      })
    );
  }

  /**
   * 泛型底層方法：處理所有不帶參數的下拉選單查詢
   * @param endpoint API 路徑
   * @returns Observable，包含下拉選單資料或 null
   */
  private queryDropdown<T>(endpoint: string): Observable<T[] | null> {
    return this.http.post<ApiResponse<T[]>>(`${this.apiUrl}${endpoint}`, {}).pipe(
      map(response => response?.Data ?? null),
      catchError(err => {
        console.error(`API ${endpoint} 呼叫失敗:`, err);
        return of(null);
      })
    );
  }

  /**
   * 泛型底層方法：處理所有帶參數的下拉選單查詢
   * @param endpoint API 路徑
   * @param body 請求 body
   * @returns Observable，包含下拉選單資料或 null
   */
  private queryDropdownWithParams<T, U>(endpoint: string, body: U): Observable<T[] | null> {
    return this.http.post<ApiResponse<T[]>>(`${this.apiUrl}${endpoint}`, body).pipe(
      map(response => response?.Data ?? null),
      catchError(err => {
        console.error(`API ${endpoint} 呼叫失敗:`, err);
        return of(null);
      })
    );
  }

  /**
  * 專門處理回傳格式為 { "Data": [{ "Data": [...] }] } 的 API
  * @param endpoint API 路徑
  * @returns Observable，包含下拉選單資料或 null
  */
  private queryNestedDropdown<T>(endpoint: string): Observable<T[] | null> {
    return this.http.post<ApiResponse<unknown[]>>(`${this.apiUrl}${endpoint}`, {}).pipe(
      map(response => {
        // 檢查回傳的 Data[0] 是否存在且有 Data 屬性
        const firstItem = response?.Data?.[0];
        const nestedData = firstItem && typeof firstItem === 'object' && 'Data' in firstItem
          ? (firstItem as { Data?: T[] }).Data
          : null;
        return nestedData ?? null;
      }),
      catchError(err => {
        console.error(`API ${endpoint} 呼叫失敗:`, err);
        return of(null);
      })
    );
  }

  // 以下是每個特定下拉選單的公開方法，它們都只是簡單地呼叫底層方法

  /** 查詢上層組織(SYS3000)資料表下拉選單 */
  querySys3000(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/querySYS3000_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢專櫃大分類(業種)設定檔(TLTBUSTYPE)資料表 */
  queryTltBusType(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryTLTBUSTYPE_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢館別代碼(SYS3800)資料表下拉選單 */
  querySys3800(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/querySYS3800_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢樓層代碼(SYS3900)資料表下拉選單 */
  querySys3900(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/querySYS3900_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }
  /** 查詢區域代碼(SYS3A00)資料表下拉選單 */
  querySys3A00(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/querySYS3A00_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢用途代碼(SYS3F00)資料表下拉選單 */
  querySys3F00(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/querySYS3F00_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢中分類(商品類別)設定檔(TLTBUSCLASS)資料表 */
  queryTltBusClass(body?: BusClassQuery): Observable<BusClassItem[] | null> {
    return this.queryDropdownWithParams<BusClassItem, BusClassQuery | object>('/queryTLTBUSCLASS_DropDownList', body ?? {}).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢小分類設定檔(TLTBUSSCLASS)資料表 */
  queryTltBusSClass(body: BusSClassRequest): Observable<BusSClassItem[] | null> {
    return this.queryDropdownWithParams<BusSClassItem, BusSClassRequest | object>('/queryTLTBUSSCLASS_DropDownList', body ?? {}).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢組織代碼(SYS3100)資料表下拉選單 */
  querySys3100(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/querySYS3100_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }
  /** 查詢組織階層樹狀圖(SYS3100)下拉選單 */
  querySys3100Tree(body: OrgTreeQuery): Observable<OrgTreeItem[] | null> {
    return this.queryDropdownWithParams<OrgTreeItem, OrgTreeQuery>('/querySYS3100_tree_DropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  // --- 會計與扣款相關 ---

  /** 查詢公司銀行科目代號(APS1002) - 用於應收票據託收作業 */
  queryAps1002(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Aps1002Item>(
      '/queryAPS1002_DropDownList',
      'BNK_DepositAccNo',           // 這裡 TypeScript 會檢查 Aps1002Item 是否有此 Key
      'ACCCNAME'
    ).pipe(
      // 如果不需要過濾，直接 shareReplay 即可
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** 查詢會計科目設定檔(GLS1005) */
  queryGls1005(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryGLS1005_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true })// 避免重複查詢
    );
  }

  /** 查詢會計科目設定檔(GLS1005) (只取 支存、活存、定存) */
  queryGls1005For1103(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/queryGLS1005For1103_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢會計科目設定檔(GLS1005) (只取 公司銀行科目) */
  queryGls1005_BNK_DepositAcc(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryGls1005_BNK_DepositAcc', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢會計科目設定檔(GLS1005) (只取 應收票據科目) */
  queryGls1005_BNK_CheckInAcc(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryGls1005_BNK_CheckInAcc', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢會計科目設定檔(GLS1005) (只取 應付票據科目) */
  queryGls1005_BNK_CheckOutAcc(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/queryGls1005_BNK_CheckOutAcc').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }
  /** 查詢會計科目設定檔(GLS1016) (只取 對象別編號) */
  queryGLS1016(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryGLS1016_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢傳票型態(GLS1010) (用於 FIN55050) */
  queryGls1010(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>(
      '/queryGLS1010_DropDownList',
      'No',
      'Name'
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢
    );
  }

  /** 查詢扣款代碼檔(APS1003) */
  queryAps1003(body: Aps1003Query): Observable<Option[] | null> {
    // 使用新的泛型底層方法 queryAndMapDropdown
    // T = IDropdownItem, U = Aps1003Query
    return this.queryAndMapDropdown<IDropdownItem, Aps1003Query>(
      '/queryAPS1003_DropDownList', // API 路徑
      'No',                       // 代號欄位 (noKey)
      'Name',                     // 名稱欄位 (nameKey)
      body                        // 查詢參數 (body)
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }
  // --- POS 相關 ---

  /** 查詢後台主機IP(POS10015) */
  queryPos10015(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/queryPOS10015_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢環境變數編號(POS1002TML) */
  queryPos1002Tml(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/queryPOS1002TML_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢位置編號(SYS3A00) */
  queryPos2002(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryPOS2002_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢表格定義檔(DEFTBL) */
  queryDefTbl(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/queryDEFTBL_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢收銀機設定檔(POS1002) */
  queryPos1002(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryPOS1002_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢收銀機設定檔(POS1002) (整檔下傳作業TLS47010) */
  queryPos1002Status(): Observable<Pos1002StatusItem[] | null> {
    return this.queryDropdown<Pos1002StatusItem>('/queryPOS1002_Status_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢電子發票配號作業(POS1002) */
  queryPos1002Bill(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/queryPOS1002_Bill_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢大分類(POS2003) */
  queryPos2003(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/queryPOS2003_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢中分類(POS20031) */
  queryPos20031(body: Pos20031Query): Observable<Pos20031Item[] | null> {
    return this.queryDropdownWithParams<Pos20031Item, Pos20031Query>('/queryPOS20031_DropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢廠商資料表(POS2013) */
  queryPos2013(body: Pos2013Query): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Pos2013Item, Pos2013Query>('/queryPOS2013_DropDownList', 'VEN_No', 'Name', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true })// 避免重複查詢
    );
  }
  /** 查詢廠商資料表(POS2013依照品牌) */
  queryPos2013LOGO_No(body: { LOGO_No: string }): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Pos2013Item, { LOGO_No: string }>('/queryPOS2013LOGO_NoDropDownList', 'VEN_No', 'Name', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true })// 避免重複查詢
    );
  }
  /** * 查詢廠商資料表(POS2013)下拉選單 */
  queryPos2013TltTalent(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryPOS2013_TLTTALENT_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
  // --- 品牌代碼相關 ---

  /** 查詢品牌代碼(PLULOGO) */
  queryPluLogo(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<PluLogoItem>('/queryPLULOGO_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢品牌代碼(PLULOGO) (含PLU_OrderPrcRate) */
  queryPluLogoOrderPrcRate(): Observable<PluLogoOrderPrcRateInnerItem[] | null> {
    return this.queryNestedDropdown<PluLogoOrderPrcRateInnerItem>('/queryPLULOGO_OrderPrcRate_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢品牌代碼(PLULOGO) (含HOS_No) */
  queryPluLogoHosNo(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<PluLogoHOSNoInnerItem>('/queryPLULOGO_HOS_No_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true })// 避免重複查詢
    );
  }

  /** 查詢品牌對應倉別(queryLOGOaccorHOS) 資料表 */
  queryLogoAccorHOS(body: LogoAccorHosQuery): Observable<Option[] | null> {
    return this.queryAndMapDropdown<LogoAccorHosItem, LogoAccorHosQuery>(
      '/TLS0000/TLS5000/queryLOGOaccorHOS',
      'LOGO_No',
      'LOGO_CH_NAME',
      body
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  // --- POS 相關 (新增) ---

  /** 查詢小分類代碼(POS20032) */
  queryPos20032(body: Pos20032Query): Observable<IDropdownItem[] | null> {
    return this.queryDropdownWithParams<IDropdownItem, Pos20032Query>('/queryPOS20032_DropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢商品單位(PLUUNIT) */
  queryPluUnit(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/queryPLUUNIT_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢部門編號/分店(SYS3100/POS1001) */
  querySys3100JoinPos1001(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/querySYS3100_join_POS1001_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢倉別(POS2034) */
  queryPos2034(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryPOS2034_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true })// 避免重複查詢
    );
  }

  /** 查詢收銀機群組(POS1002GRM) */
  queryPos1002Grm(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryPOS1002GRM_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢收銀畫面名稱(POS1008) */
  queryPos1008(): Observable<Pos1008Item[] | null> {
    return this.queryDropdown<Pos1008Item>('/queryPOS1008_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢付款別(POS1006) */
  queryPos1006(): Observable<Pos1006Item[] | null> {
    return this.queryDropdown<Pos1006Item>('/queryPOS1006_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢位置代碼資料表(POS2002) */
  queryPos2002Location(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/queryPOS2002_Location_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢收銀機(POS1002) (依照館別、樓層、區域、機台類型查詢) */
  queryEcr(body: EcrQuery): Observable<EcrItem[] | null> {
    return this.queryDropdownWithParams<EcrItem, EcrQuery>('/queryECRDropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢收銀機(POS1002) (依照ECR_Type查詢) */
  queryPos1002EcrType(body: Pos1002EcrTypeQuery): Observable<IDropdownItem[] | null> {
    return this.queryDropdownWithParams<IDropdownItem, Pos1002EcrTypeQuery>('/queryPOS1002ECR_TypeDropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢收銀機(POS1002) (依照館別、樓層、區域查詢) */
  queryPos1002Group(body: Pos1002GroupQuery): Observable<Pos1002GroupItem[] | null> {
    return this.queryDropdownWithParams<Pos1002GroupItem, Pos1002GroupQuery>('/queryPOS1002Group_SubGroup_AreaNo_DropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢商品資料(POS2004) (依照專櫃編號TLT_No查詢) */
  queryPos2004(body: Pos2004Query): Observable<Pos2004Item[] | null> {
    return this.queryDropdownWithParams<Pos2004Item, Pos2004Query>('/queryPOS2004_DropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢商品資料(POS2004) (依照品牌編號LOGO_No查詢) */
  queryPos2004Logo(body: Pos2004LogoQuery): Observable<Pos2004LogoItem[] | null> {
    return this.queryDropdownWithParams<Pos2004LogoItem, Pos2004LogoQuery>('/queryPOS2004LOGO_NoDropDownList', body);
  }

  // --- 專櫃相關 (新增) ---

  /** 查詢專櫃主檔(TLTTALENT) (取得最新合約資料) */
  queryTltTalent(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryTLTTALENT_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢專櫃主檔(TLTTALENT) (取最新契約，含對應資料) */
  queryTLTTALENTDropDownList(body: TLTTALENTQuery = {}): Observable<Option[] | null> {
    return this.queryAndMapDropdown<TLTTALENTItem, TLTTALENTQuery>('/TLS0000/TLS2000/queryTLTTALENTDropDownList', 'tlt_no', 'tlt_name', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢專櫃主檔(TLTTALENT) (依照審核狀態查詢) */
  queryTltTalentStatus(body: TalentStatusQuery): Observable<IDropdownItem[] | null> {
    return this.queryDropdownWithParams<IDropdownItem, TalentStatusQuery>('/queryTLTTALENT_Status_DropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢專櫃主檔(TLTTALENT) (依照store_way查詢) */
  queryTltTalentStoreWay(body: TalentStoreWayQuery): Observable<IDropdownItem[] | null> {
    return this.queryDropdownWithParams<IDropdownItem, TalentStoreWayQuery>('/queryTLTTALENT_StoreWay_DropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢專櫃主檔(TLTTALENT) (Store_way=2 and approve_status=2) */
  queryTltTalentStoreWay2Approve(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryTLTTALENT__StoreWay2_Approve_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢專櫃主檔(TLTTALENT) (依照契約日期tlt_contract_date取得合約資料) */
  queryTltTalentByContractDate(body: TalentByContractDateQuery): Observable<TalentByContractDateItem[] | null> {
    return this.queryDropdownWithParams<TalentByContractDateItem, TalentByContractDateQuery>('/queryTLTTALENT_ByContractDate_DropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢專櫃抽成主檔(TLTTALENT_CHARGE) (依照合約編號talent_id查詢) */
  queryTltTalentCharge(body: TalentChargeQuery): Observable<TalentChargeItem[] | null> {
    return this.queryDropdownWithParams<TalentChargeItem, TalentChargeQuery>('/queryTLTTALENT_CHARGE_DropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢專櫃(TLTTALENT) (依照館別、樓層、區域等查詢) */
  queryTalent(body: TalentQuery): Observable<TalentItem[] | null> {
    return this.queryDropdownWithParams<TalentItem, TalentQuery>('/queryTalentDropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  queryTltTalentOpenFlag(body: TalentOpenFlagQuery): Observable<TalentOpenFlagItem[] | null> {
    return this.queryDropdownWithParams<TalentOpenFlagItem, TalentOpenFlagQuery>('/queryTLTTALENT_tlt_openflag_DropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  // 能源系列

  // 取得能源錶號
  queryENG1001_ENG_MeterNo(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<ENG1001Item>('/Share/queryENG1001_ENG_MeterNo_DropDownList', 'ENG_MeterNo', 'Location_No').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  // 能源下拉選單
  queryTLTTALENT_TLT_SPACE(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<TlttalentTltSpaceItem>('/queryTLTTALENT_TLT_SPACE_DropDownList', 'TltNo', 'TltName').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }


  // --- 其他 ---

  /** 查詢營業型態(SYS1000) */
  querySys1000(body: Sys1000Query): Observable<IDropdownItem[] | null> {
    return this.queryDropdownWithParams<IDropdownItem, Sys1000Query>('/querySYS1000_DropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢角色代碼(tblRole) */
  queryTblRole(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/querytblRole_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢收銀員設定檔(POS2001) */
  queryPos2001(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryPOS2001_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true })// 避免重複查詢
    );
  }

  /** 查詢銀行+分行資料表(APS1001 JOIN APS1004) */
  queryAps1001(body: Aps1001Query): Observable<Aps1001Item[] | null> {
    return this.queryDropdownWithParams<Aps1001Item, Aps1001Query>('/queryAPS1001_DropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢銀行資料表(APS1001) */
  queryAps1001NoBranch(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryAPS1001NoBranch_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢洽談人員資料表(TBLUSER) */
  queryTblUser(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryTBLUSER_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢人員資料表(TBLUSER) (依照組織代碼查詢) */
  queryTblUserOrgid(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<TblUserOrgidItem>('/queryTBLUSER_Orgid_DropDownList', 'user_No', 'user_Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢專櫃活動編號資料表下拉選單() */
  queryTALPORDERM_DropDownList(body?: TALPORDERMQuery): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem, TALPORDERMQuery>('/queryTALPORDERM_DropDownList', 'No', 'Name', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true })// 避免重複查詢
    );
  }
  /** 查詢銀行+分行資料表(APS1001 JOIN APS1004)下拉選單 */
  queryAps1001_DropDownList(body: Aps1001ComboQuery = { SearchKeyword: '' }): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Aps1001ComboItem, Aps1001ComboQuery>(
      '/queryAPS1001_DropDownList',
      'No',
      'Name',
      body
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  queryTALPORDERM_DropDownListShare(body?: TALPORDERMQueryForShare): Observable<Option[] | null> {
    const request = {
      ...body,
      mid: this.authService.currentUserValue?.mid || 0,
      str_no: this.authService.currentUserValue?.SYS_StoreNo || '',
    }
    return this.queryAndMapDropdown<TALPORDERMDataForShare, TALPORDERMQueryForShare>('/Share/queryTALPORDERM_DropDownList', 'pod_no', 'pod_desc', request).pipe(
      shareReplay({ bufferSize: 1, refCount: true })// 避免重複查詢
    );
  }
  // --- CSS 相關下拉選單 ---

  /** * 查詢 CSS1002 下拉選單
   * 無參數，直接回傳 Option[]
   */
  queryCss1002(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<CssDropDownItem>(
      '/queryCSS1002DropDownList',
      'No',
      'Name'
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** * 查詢 CSS1003 下拉選單
   * @param body { KIND_ID: string }
   */
  queryCss1003(body: Css1003Query): Observable<Option[] | null> {
    return this.queryAndMapDropdown<CssDropDownItem, Css1003Query>(
      '/queryCSS1003DropDownList',
      'No',
      'Name',
      body
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** * 查詢 CSS1005 下拉選單
   * @param body { ORG_ID: string }
   */
  queryCss1005(body: Css1005Query = { ORG_ID: '' }): Observable<Option[] | null> {
    return this.queryAndMapDropdown<CssDropDownItem, Css1005Query>(
      '/queryCSS1005DropDownList',
      'No',
      'Name',
      body
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
