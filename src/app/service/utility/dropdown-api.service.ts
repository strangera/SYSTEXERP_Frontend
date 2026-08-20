import { AuthService } from './../system/auth.service';
// !!! 新版下拉方法
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/utils/rxjs-operators/validate-api-response';
import {
  Aps1001ComboItem,
  Aps1001ComboQuery,
  Aps1001Item,
  Aps1001Query,
  Aps1002Item,
  Aps1003Query,
  Aps1003Tls2d010Item,
  Aps1003Tls2d010Query,
  Ass11040DropDownItem,
  Ass13010PurchaseNumberDropDownItem,
  BatchTalentChargeQuery,
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
  FAASSCHKMASS15070DropDownItem,
  FAASSCHKMDropDownItem,
  FAASSCHKMQuery,
  FaClass1Item,
  FaClass1Query,
  FaClass2Item,
  FaClass2Query,
  FaClassMItem,
  FaClassMQuery,
  FaHosItem,
  FasAccNoDropdownItem,
  FaSitemAss1000Item,
  FasItemDropdownItem,
  FaSitemItem,
  FaSitemQuery,
  GLS1005AccSubCodeItem,
  Gls3002AcctKeyItem,
  IDropdownItem,
  IGLS1005LedgerMDItem,
  LogoAccorHosItem,
  LogoAccorHosQuery,
  Option,
  OrgTreeItem,
  OrgTreeQuery,
  PluLogoHOSNoInnerItem,
  PluLogoItem,
  PluLogoOrderPrcRateInnerItem,
  Pos1002EcrTypeQuery,
  Pos1002FilteredItem,
  Pos1002GroupItem,
  Pos1002GroupQuery,
  Pos1002StatusItem,
  Pos1006Item,
  Pos1008Item,
  Pos2002LocationItem,
  Pos20031Item,
  Pos20031Query,
  Pos20032Query,
  Pos2004ExtendedItem,
  Pos2004Item,
  Pos2004LogoItem,
  Pos2004LogoQuery,
  Pos2004Query,
  Pos2004SearchKey,
  Pos2004WithBrandItem,
  Pos2013Item,
  Pos2013LogoRequest,
  Pos2013Query,
  Pos2064MpcsNoDropDownItem,
  Pos2064MpcsRqstNoDropDownItem,
  queryOwnPOS1002_DropDownListItem,
  queryPOS1002_DropDownListItem,
  Sys1000Query,
  Sys5000SubModuleItem,
  TalentAllowedQuery,
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
  Tls55020Query,
  TLTTALENTActiveContractItem,
  TLTTALENTItem,
  TLTTALENTQuery,
  TlttalentTltSpaceItem,
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
    nameKey?: keyof T,
    body: U = {} as U // 給予預設值
  ): Observable<Option[] | null> {
    return this.http.post<ApiResponse<T[]>>(`${this.apiUrl}${endpoint}`, body).pipe(
      map(response => {
        const data = response?.Data;
        const label = nameKey ? (item: T) => `${item[noKey]} - ${item[nameKey]}` : (item: T) => `${item[noKey]}`;
        return data ? data.map(item => ({
          ...item,
          value: item[noKey] as string | number,
          label: label(item), // 如果 nameKey 為空字串,不顯示
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

  /** 查詢抽成類別(TLTTALENT_CHARGEM.tlt_id/tlt_id_desc)下拉選單，供 TLS32070 篩選條件使用 */
  queryTltTalentChargeM(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryTLTTALENT_CHARGEM_DropDownList', 'No', 'Name').pipe(
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

  /** 查詢資產大分類(FACLASSM)資料表下拉選單 - 回傳 B_CLASS_ID / B_CLASS_NAME */
  queryFaClassM(body: FaClassMQuery = {}): Observable<Option[] | null> {
    const endpoint = '/ASS0000/ASS1000/queryFACLASSM_DropDownList';
    return this.http
      .post<ApiResponse<{ Data?: FaClassMItem[] | null } | FaClassMItem[] | null>>(
        `${this.apiUrl}${endpoint}`,
        body,
      )
      .pipe(
        map(response => {
          const raw: any = response?.Data;
          const data: FaClassMItem[] | null = Array.isArray(raw)
            ? raw
            : (raw?.Data ?? raw?.QueryData ?? null);
          if (!data) return null;
          return data.map(item => ({
            ...item,
            value: item.B_CLASS_ID as string | number,
            label: `${item.B_CLASS_ID} - ${item.B_CLASS_NAME}`,
          }));
        }),
        catchError(err => {
          console.error(`API ${endpoint} 失敗:`, err);
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  /** 查詢資產中分類(FACLASS1)資料表下拉選單 - 回傳 M_CLASS_ID / M_CLASS_NAME */
  queryFaClass1(body: FaClass1Query): Observable<Option[] | null> {
    const endpoint = '/ASS0000/ASS1000/queryFACLASS1_DropDownList';
    return this.http
      .post<ApiResponse<{ Data?: FaClass1Item[] | null } | FaClass1Item[] | null>>(
        `${this.apiUrl}${endpoint}`,
        body,
      )
      .pipe(
        map(response => {
          const raw: any = response?.Data;
          const data: FaClass1Item[] | null = Array.isArray(raw)
            ? raw
            : (raw?.Data ?? raw?.QueryData ?? null);
          if (!data) return null;
          return data.map(item => ({
            ...item,
            value: item.M_CLASS_ID as string | number,
            label: `${item.M_CLASS_ID} - ${item.M_CLASS_NAME}`,
          }));
        }),
        catchError(err => {
          console.error(`API ${endpoint} 失敗:`, err);
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  /** 查詢資產小分類(FACLASS2)資料表下拉選單 - 回傳 S_CLASS_ID / S_CLASS_NAME */
  queryFaClass2(body: FaClass2Query): Observable<Option[] | null> {
    const endpoint = '/ASS0000/ASS1000/queryFACLASS2_DropDownList';
    return this.http
      .post<ApiResponse<{ Data?: FaClass2Item[] | null } | FaClass2Item[] | null>>(
        `${this.apiUrl}${endpoint}`,
        body,
      )
      .pipe(
        map(response => {
          const raw: any = response?.Data;
          const data: FaClass2Item[] | null = Array.isArray(raw)
            ? raw
            : (raw?.Data ?? raw?.QueryData ?? null);
          if (!data) return null;
          return data.map(item => ({
            ...item,
            value: item.S_CLASS_ID as string | number,
            label: `${item.S_CLASS_ID} - ${item.S_CLASS_NAME}`,
          }));
        }),
        catchError(err => {
          console.error(`API ${endpoint} 失敗:`, err);
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  /** 查詢倉別(FAHOS)資料表下拉選單 - 回傳 WH_ID / WH_NAME */
  queryFaHos(body: object = {}): Observable<Option[] | null> {
    return this.queryAndMapDropdown<FaHosItem, object>(
      '/queryFAHOS_DropDownList',
      'WH_ID',
      'WH_NAME',
      body,
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  /**
   * 查詢品項(FASITEM)下拉 — 預設 MATERIAL_TYPE=3（列管耗材）；回傳 GOODS_ID / GOODS_NAME
   */
  queryFasItemDropdown(body: FaSitemQuery = {}): Observable<Option[] | null> {
    const payload: FaSitemQuery = {
      ...body,
      MATERIAL_TYPE: body.MATERIAL_TYPE ?? '3',
    };
    return this.queryAndMapDropdown<FaSitemItem, FaSitemQuery>(
      '/queryFASITEM_DropDownList',
      'GOODS_ID',
      'GOODS_NAME',
      payload,
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  /**
   * 查詢品項(FASITEM)下拉（ASS0000/ASS1000 路由）— 透過 ASS11040 主查詢 endpoint，
   * 同步回傳 UNIT 供明細列自動帶入單位。不加 MATERIAL_TYPE 過濾，全部品項皆出現。
   *
   * Endpoint response 為 wrapped 結構 `ApiResponse<{ TotalRows, TotalPages, QueryData: T[] }>`，
   * 與 `queryAndMapDropdown` 預期的扁平 `ApiResponse<T[]>` 不同，因此直接 inline 處理。
   * Request 帶 PageSize=9999 以一次取齊所有品項。
   */
  queryFasItemAss1000Dropdown(): Observable<Option[] | null> {
    return this.http
      .post<
        ApiResponse<{
          TotalRows?: number;
          TotalPages?: number;
          QueryData?: FaSitemAss1000Item[] | null;
        }>
      >(`${this.apiUrl}/ASS0000/ASS1000/queryASS11040`, {
        PageSize: 9999,
        PageIndex: 1,
      })
      .pipe(
        map(response => {
          const items = response?.Data?.QueryData ?? null;
          return items
            ? items.map(item => ({
              ...item,
              // FASITEM_ID 為 int64（對應 SearchASS11040Response.ID），用於 Insert/Update DETAILS
              value: item.ID,
              label: `${item.GOODS_ID} - ${item.GOODS_NAME}`,
            }))
            : null;
        }),
        catchError(err => {
          console.error('API /ASS0000/ASS1000/queryASS11040 失敗:', err);
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  /** 查詢商品管理編號(ASS11040)下拉選單 */
  queryAss11040Dropdown(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>(
      '/ASS0000/ASS1000/queryASS11040_DropDownList',
      'No',
      'Name',
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
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

  /** 查詢公司銀行科目代號(APS1002) - value 為 BNK_id，供 FIN62050 銀行往來調節表篩選使用 */
  queryAps1002ForBankFilter(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Aps1002Item>(
      '/queryAPS1002_DropDownList',
      'BNK_id',
      'ACCCNAME'
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** 查詢會計科目設定檔(GLS1005) */
  queryGls1005(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryGLS1005_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true })// 避免重複查詢
    );
  }

  /** 查詢會計科目設定檔(GLS1005) 依統制/明細篩選（'0'=統制、'1'=明細、不給=全部）。有參數不共用 queryGls1005() 的快取。 */
  queryGls1005ByLedgerMD(ledgerMD?: '0' | '1'): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryGLS1005_DropDownList', 'No', 'Name', { Ledger_MD: ledgerMD ?? null });
  }

  /**
   * 查詢資材攤提會計科目下拉（queryFASAccNoDropDownList / queryGLS1005_AccNo_DropDownList）
   * — 用於 ASS15040／ASS17110 等耗材會計科目報表查詢條件
   * 回傳 Option（value=AccNo, label='<AccNo> - <AccCName>'，與既有顯示慣例一致）
   */
  queryFasAccNoDropdown(keyword?: string): Observable<Option[] | null> {
    return this.http
      .post<ApiResponse<FasAccNoDropdownItem[]>>(
        `${this.apiUrl}/queryGLS1005_AccNo_DropDownList`,
        { Keyword: keyword ?? null },
      )
      .pipe(
        map(response => {
          const data = response?.Data ?? [];
          return data.map(item => ({
            ...item,
            value: item.AccNo ?? '',
            label: `${item.AccNo ?? ''} - ${item.AccCName ?? ''}`,
          }));
        }),
        catchError(err => {
          console.error('API /queryGLS1005_AccNo_DropDownList 失敗:', err);
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  /** 查詢會計科目子科目設定檔(GLS1005 AccSubCode) */
  queryGls1005AccSubCode(): Observable<Option[] | null> {
    return this.http
      .post<ApiResponse<GLS1005AccSubCodeItem[]>>(`${this.apiUrl}/queryGLS1005AccSubCode_DropDownList`, {})
      .pipe(
        map(response => {
          const data = response?.Data ?? [];
          return data.map(item => ({
            ...item,
            value: item.AccNo,
            label: `${item.AccNo} - ${item.AccCName}`,
          }));
        }),
        catchError(err => {
          console.error('API /queryGLS1005AccSubCode_DropDownList 失敗:', err);
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  // 查詢會計科目設定檔(GLS1005)下拉式選單(只顯示 GLS1005.ledger_MD=1)
  queryGls1005_ledgerMD(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IGLS1005LedgerMDItem>('/queryGLS1005_ledgerMD_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true })// 避免重複查詢
    );
  }

  /** 查詢會計科目設定檔(GLS1005) (只取 支存、活存、定存) */
  queryGls1005For1103(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryGLS1005For1103_DropDownList', 'No', 'Name').pipe(
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
  queryGls1005_BNK_CheckOutAcc(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryGls1005_BNK_CheckOutAcc', 'No', 'Name').pipe(
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

  /**
   * TLS2D010 專用：查詢扣款代碼檔(APS1003)（/TLS0000/TLS2000/queryAPS1003DropDownList）
   * 回傳原始欄位（CAP_Type/AccNo/GUI_FLAG/CAP_TaxType 等），不做 value/label 轉換，供頁面自行分類/篩選
   */
  queryAps1003ForTls2d010(body: Aps1003Tls2d010Query = { CAP_ItemList: [] }): Observable<Aps1003Tls2d010Item[] | null> {
    return this.queryDropdownWithParams<Aps1003Tls2d010Item, Aps1003Tls2d010Query>(
      '/TLS0000/TLS2000/queryAPS1003DropDownList',
      body
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
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
  queryPos10015(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryPOS10015_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢環境變數編號(POS1002TML) */
  queryPos1002Tml(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryPOS1002TML_DropDownList', 'No', 'Name').pipe(
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
  queryDefTbl(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryDEFTBL_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢收銀機設定檔(POS1002) */
  queryPos1002(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<queryPOS1002_DropDownListItem>('/queryPOS1002_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢收銀機設定檔(POS1002)自營用 */
  queryOwnPOS1002(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<queryOwnPOS1002_DropDownListItem>('/queryOwnPOS_DropDownList', 'ECR_No', 'ECR_Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /**
 * 查詢過濾後的收銀機設定檔 (POS1002)
 * 條件：SYS_StoreNo = '10', 未過期, Type IN ('1','2')
 */
  queryPos1002Filtered(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Pos1002FilteredItem>(
      '/queryPOS1002_Filtered_DropDownList', // 請確認與後端 Controller 的 Route 一致
      'No',
      'Name'
    ).pipe(
      map(options => {
        if (!options) return null;
        // 重新加工 label
        return options.map(opt => ({
          ...opt,
          // opt 內已經包含 Pos1002FilteredItem 的所有欄位
          label: `${opt['No']} - ${opt['Name']} ${opt['ECR_TLT_Name'] ? `- ${opt['ECR_TLT_Name']}` : ''}`,
        }));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** 查詢品項資料下拉選單(ASS11040) */
  queryASS11040_DropDownList(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Ass11040DropDownItem>(
      '/ASS0000/ASS1000/queryASS11040_DropDownList',
      'No',
      'Name'
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  /** 查詢採購單號下拉選單(ASS13010) */
  queryASS13010DropDownList(): Observable<Option[] | null> {
    return this.queryDropdown<Ass13010PurchaseNumberDropDownItem>(
      '/ASS0000/ASS1000/queryASS13010DropDownList'
    ).pipe(
      map(items => {
        if (!items) return null;
        // 下拉顯示僅需 ID；保留 APPLY_DATE 給之後可能的需求
        return items.map(item => ({
          ...item,
          value: String(item.ID),
          label: String(item.ID),
        }));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** 查詢進貨單號下拉選單(ASS15070) */
  queryFAASSCHKMASS15070_DropDownList(): Observable<Option[] | null> {
    return this.queryDropdown<FAASSCHKMASS15070DropDownItem>(
      '/ASS0000/ASS1000/queryFAASSCHKMASS15070_DropDownList'
    ).pipe(
      map(items => {
        if (!items) return null;
        return items
          .map(item => {
            const id = item.SUBPOENA_ID?.trim() ?? '';
            if (!id) return null;
            return {
              ...item,
              value: id,
              label: id,
            };
          })
          .filter((x): x is Option => x !== null);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** 查詢FAASSCHKM驗收單號下拉選單 */
  queryFAASSCHKM_DropDownList(body: FAASSCHKMQuery = {}): Observable<Option[] | null> {
    return this.queryDropdownWithParams<FAASSCHKMDropDownItem, FAASSCHKMQuery>(
      '/queryFAASSCHKM_DropDownList',
      body
    ).pipe(
      map(items => {
        if (!items) return null;
        return items
          .map(item => {
            const id = item.SUBCHECK_ID?.trim() ?? '';
            if (!id) return null;
            return {
              ...item,
              value: id,
              label: id,
            };
          })
          .filter((x): x is Option => x !== null);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
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
  queryPos2003(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryPOS2003_DropDownList', 'No', 'Name').pipe(
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
    return this.queryAndMapDropdown<Pos2013Item, Pos2013Query>(
      '/queryPOS2013_DropDownList',
      'VEN_No',
      'Name',
      body
    ).pipe(
      map(options => {
        if (!options) return null;
        // 重新對對象進行加工，確保 label 是 "No - Name"
        return options.map(opt => ({
          ...opt,
          label2: `${opt['No']} - ${opt['VEN_No']} - ${opt['Name']}`,
        }));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
  /** 查詢廠商統一編號下拉(POS2013，value=統一編號 No，label='統編 - 廠商名稱') — 供 FIN23040 廠商統一編號欄位使用 */
  queryPos2013VenUniform(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Pos2013Item, Pos2013Query>(
      '/queryPOS2013_DropDownList',
      'No',
      'Name',
      { VEN_Flag: '' }
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** 查詢廠商資料表(POS2013)(統一編號為主) */
  queryVendorNoGroup(body: any = { VEN_Flag: '' }): Observable<any[] | null> {
    return this.http.post<ApiResponse<any[]>>(`${this.apiUrl}/queryPOS2013_DropDownList`, body).pipe(
      map(response => {
        const data = response?.Data;
        if (!data) return null;

        // 使用 Map 確保每個 No 只有一筆資料，但把所有的 VEN_No 資訊存在內部的 subItems
        const noMap = new Map<string, any>();

        data.forEach(item => {
          if (!noMap.has(item.No)) {
            noMap.set(item.No, {
              No: item.No,
              Name: item.Name,
              // 這是給 MultiSelect 搜尋用的標籤，包含所有相關資訊
              combinedLabel: `${item.No} - ${item.Name}`,
              subItems: []
            });
          }
          noMap.get(item.No).subItems.push({
            VEN_No: item.VEN_No,
            ShortName: item.ShortName,
            Address: item.VEN_Address
          });
        });

        return Array.from(noMap.values());
      }),
      shareReplay(1)
    );
  }
  /**
 * 查詢品牌與廠商關聯表 (通用基礎方法)
 */
  private queryPos2013LogoBase(body: Pos2013LogoRequest = {}): Observable<Pos2013Item[] | null> {
    // 這裡不使用 queryAndMapDropdown，改用更底層的 post 取得原始陣列，
    // 因為同一個 API 資料要給兩個不同的 Dropdown (一個要 VEN_No, 一個要 LOGO_No)
    return this.http.post<ApiResponse<Pos2013Item[]>>(
      `${this.apiUrl}/queryPOS2013LOGO_NoDropDownList`,
      body
    ).pipe(
      map(res => res.Data || []),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** * [雙向 - 向下] 給品牌，查廠商選單
   * Value: VEN_No, Label: Name
   */
  queryVenByLogo(logoNo: string): Observable<Option[] | null> {
    return this.queryPos2013LogoBase({ LOGO_No: logoNo }).pipe(
      map(data => data?.map(item => ({
        label: `${item.VEN_No} - ${item.Name}`,
        value: item.VEN_No,
        ...item // 保留原始物件供後續使用
      })) || [])
    );
  }

  /** * [雙向 - 向上] 給廠商，查品牌選單
   * Value: LOGO_No, Label: LOGO_Name
   */
  queryLogoByVen(venNo: string): Observable<Option[] | null> {
    return this.queryPos2013LogoBase({ VEN_No: venNo }).pipe(
      map(data => data?.map(item => ({
        label: `${item.LOGO_No} - ${item.LOGO_CH_NAME}`,
        value: item.LOGO_No,
        ...item
      })) || [])
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
  queryPos2002Location(): Observable<Pos2002LocationItem[] | null> {
    return this.queryDropdown<Pos2002LocationItem>('/queryPOS2002_Location_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  queryPos2002LocationMap(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Pos2002LocationItem>('/queryPOS2002_Location_DropDownList', 'location_no').pipe(
      shareReplay({ bufferSize: 1, refCount: true }),

    );
  }

  /** 查詢收銀機(POS1002) (依照館別、樓層、區域、機台類型查詢) */
  queryEcr(body: EcrQuery): Observable<EcrItem[] | null> {
    return this.queryDropdownWithParams<EcrItem, EcrQuery>('/queryECRDropDownList', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢收銀機(POS1002) (依照ECR_Type查詢) */
  queryPos1002EcrType(body: Pos1002EcrTypeQuery): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem, Pos1002EcrTypeQuery>('/queryPOS1002ECR_TypeDropDownList', 'No', 'Name', body).pipe(
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

  /** 查詢商品資料(POS2004) (依照專櫃編號TLT_No查詢) */
  queryPOS2004_BySearchKey(body: Pos2004SearchKey): Observable<Pos2004ExtendedItem[] | null> {
    return this.queryDropdownWithParams<Pos2004ExtendedItem, Pos2004SearchKey>('/queryPOS2004_BySearchKey', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** * 查詢商品資料(POS2004 By Talent)
 * 依照專櫃編號連動品牌，查詢該品牌下的所有商品
 */
  queryPos2004ByTalent(body: Pos2004Query): Observable<Pos2004WithBrandItem[] | null> {
    // 注意：路徑改為後端新開的 /queryPOS2004_ByTalentDropDownList
    return this.queryDropdownWithParams<Pos2004WithBrandItem, Pos2004Query>(
      '/queryPOS2004_ByTalentDropDownList',
      body
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
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

  /**
   * 【共通】查詢專櫃主檔(TLTTALENT) (僅顯示當下日期落在合約有效期間內的專櫃)
   * 已附帶店位/館別/樓層/區域資料，選取後可直接 patch 表單欄位，不需再打 API (例如 TLS41010 queryTLT_NoInfo)。
   */
  queryTltTalentActiveContract(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<TLTTALENTActiveContractItem>('/queryTLTTALENT_ActiveContract_DropDownList', 'No', 'Name').pipe(
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
  queryTltTalentStoreWay(body: TalentStoreWayQuery): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem, TalentStoreWayQuery>('/queryTLTTALENT_StoreWay_DropDownList', 'No', 'Name', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢專櫃主檔(TLTTALENT) (依功能代碼ProgNo過濾使用者有權限的專櫃) */
  queryTltTalentAllowed(body: TalentAllowedQuery): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem, TalentAllowedQuery>('/queryTLTTALENT_Allowed_DropDownList', 'No', 'Name', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢專櫃主檔(TLTTALENT) (Store_way=2 and approve_status=2) */
  queryTltTalentStoreWay2Approve(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryTLTTALENT__StoreWay2_Approve_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  // 專為 TLS41040 使用的專櫃下拉（保留原始回傳 ApiResponse 結構）
  queryTLTTALENT_TLS41040(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryTLTTALENT_TLS41040_DropDownList', 'No', 'Name').pipe(
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

  batchQueryTltTalentCharge(talentIds: number[]): Observable<any> {
    return this.queryDropdownWithParams<TalentChargeItem, BatchTalentChargeQuery>('/BatchQueryTLTTALENT_CHARGE', { talent_ids: talentIds }).pipe(
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

  /** 查詢零用金單號（FIN70000 / POS2064MPCS_NoDropDownList） */
  queryPOS2064MPCS_NoDropDownList(): Observable<Option[] | null> {
    return this.queryDropdown<Pos2064MpcsNoDropDownItem>('/FIN0000/FIN70000/POS2064MPCS_NoDropDownList').pipe(
      map(items => {
        if (!items) return null;
        return items
          .map(item => {
            const pcsNo = String(item.PCS_No ?? '').trim();
            if (!pcsNo) return null;
            return {
              ...item,
              value: pcsNo,
              label: pcsNo,
            };
          })
          .filter((x): x is Option => x !== null);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** 查詢支出請款單號（FIN70000 / POS2064MPCS_RqstNoDropDownList，TC+YYYYMMDDXXXX） */
  queryPOS2064MPCS_RqstNoDropDownList(): Observable<Option[] | null> {
    return this.queryDropdown<Pos2064MpcsRqstNoDropDownItem>('/FIN0000/FIN70000/POS2064MPCS_RqstNoDropDownList').pipe(
      map(items => {
        if (!items) return null;
        return items
          .map(item => {
            const pcsRqstNo = String(item.PCS_RqstNo ?? '').trim();
            if (!pcsRqstNo) return null;
            return {
              ...item,
              value: pcsRqstNo,
              label: pcsRqstNo,
            };
          })
          .filter((x): x is Option => x !== null);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /** 查詢銀行+分行資料表(APS1001 JOIN APS1004) */
  queryAps1001(body: Aps1001Query): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Aps1001Item, Aps1001Query>('/queryAPS1001_DropDownList', 'No', 'Name', body).pipe(
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

  /** 查詢 ASS11040 品項編號下拉選單 */
  queryASS11040DropDownList(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Ass11040DropDownItem>(
      '/ASS0000/ASS1000/queryASS11040_DropDownList',
      'No',
      'Name'
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  /**
   * queryFASITEM_DropDownList（固定 MATERIAL_TYPE=3，耗材品項）。
   * 回傳列：RowNo、GOODS_ID、GOODS_NAME → 下拉 value/label 使用 GOODS_ID、GOODS_NAME。
   */
  queryFasItemDropDownList(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<FasItemDropdownItem>(
      '/queryFASITEM_DropDownList',
      'GOODS_ID',
      'GOODS_NAME',
      { MATERIAL_TYPE: '3' }
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  /**
   * queryFASITEM_DropDownList — 取得原始 row（含 ID / GOODS_ID / GOODS_NAME / UNIT_NAME 等）。
   * 後端回傳為巢狀 `Data: { Data: [...], TotalCount, TotalPages }`，此 method 已展平。
   * 用於 ASS16040 CRU 頁明細「單位」欄位 lookup（FASITEM_ID → UNIT_NAME）。
   */
  queryFasItemRawList(body: FaSitemQuery = {}): Observable<FasItemDropdownItem[]> {
    const payload: FaSitemQuery = {
      ...body,
      MATERIAL_TYPE: body.MATERIAL_TYPE ?? '3',
    };
    return this.http
      .post<ApiResponse<{ Data?: FasItemDropdownItem[] | null; TotalCount?: number; TotalPages?: number } | FasItemDropdownItem[] | null>>(
        `${this.apiUrl}/ASS0000/ASS1000/queryFASITEM_DropDownList`,
        payload,
      )
      .pipe(
        map(res => {
          const raw: any = res?.Data;
          if (Array.isArray(raw)) return raw as FasItemDropdownItem[];
          return (raw?.Data ?? raw?.QueryData ?? []) as FasItemDropdownItem[];
        }),
        catchError(err => {
          console.error('API /ASS0000/ASS1000/queryFASITEM_DropDownList 失敗:', err);
          return of([] as FasItemDropdownItem[]);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }
  /** 查詢子模組代碼(SYS5000) */
  querySys5000SubModuleNo(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Sys5000SubModuleItem>('/querySYS5000SubModuleNo_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }


  /** 查詢子模組代碼(SYS5000) */
  querySys5000SubModuleNoGroup(): Observable<Option[] | null> {
    return this.http.post<ApiResponse<Sys5000SubModuleItem[]>>(`${this.apiUrl}/querySYS5000SubModuleNo_DropDownList`, {}).pipe(
      map(response => {
        const data = response?.Data;
        if (!data) return null;

        const grouped = data.reduce((acc, item) => {
          const key = item.module_no;
          if (!acc[key]) {
            acc[key] = {
              label: `${item.module_no} - ${item.module_name}`,
              value: item.module_no,
              items: []
            };
          }
          acc[key].items.push({
            ...item,
            label: `${item.No} - ${item.Name}`,
            value: item.No
          });
          return acc;
        }, {} as Record<string, Option & { items: Option[] }>);

        return Object.values(grouped) as Option[];
      }),
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }


  /** 查詢人員資料表(TBLUSER) (依照組織代碼查詢) */
  queryTblUserOrgid(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<TblUserOrgidItem>('/queryTBLUSER_Orgid_DropDownList', 'user_No', 'user_Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢使用單位下拉（value 使用 Org_ID） */
  queryTblUserOrgidAsOrg(): Observable<Option[] | null> {
    return this.http
      .post<ApiResponse<TblUserOrgidItem[]>>(`${this.apiUrl}/queryTBLUSER_Orgid_DropDownList`, {})
      .pipe(
        map(response => {
          const data = response?.Data ?? [];
          const orgMap = new Map<string, Option>();
          data.forEach(item => {
            if (!item?.Org_ID || orgMap.has(item.Org_ID)) return;
            orgMap.set(item.Org_ID, {
              value: item.Org_ID,
              label: `${item.Org_ID} - ${item.Org_Name}`,
              Org_ID: item.Org_ID,
              Org_Name: item.Org_Name,
            });
          });
          return Array.from(orgMap.values());
        }),
        catchError(err => {
          console.error('API /queryTBLUSER_Orgid_DropDownList 失敗:', err);
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  /** 查詢專櫃活動編號資料表下拉選單() */
  queryTALPORDERM_DropDownList(body?: TALPORDERMQuery): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem, TALPORDERMQuery>('/queryTALPORDERM_DropDownList', 'No', 'Name', body).pipe(
      shareReplay({ bufferSize: 1, refCount: true })// 避免重複查詢
    );
  }

  /** * 查詢對帳 Key 值(GLS3002.ACCT_KEY) 下拉選單
   * Value: ACCT_KEY, Label: ACCT_KEY - ACCT_KEY
   */
  queryGls3002AcctKey(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<Gls3002AcctKeyItem>(
      '/queryGLS3002_DropDownList', // 對應後端 Controller 的路由
      'ACCT_KEY',
      'ACCT_KEY'
    ).pipe(
      map(options => options?.map(opt => ({ ...opt, label: opt.value })) ?? null),
      shareReplay({ bufferSize: 1, refCount: true })
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

  // 查詢CPM11030 服務台位置編號下拉選單
  queryCSS1001(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryCSS1001_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }
  // 查詢CPM11030 設備名稱下拉選單
  queryCSS2001(): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem>('/queryCSS2001_DropDownList', 'No', 'Name').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }

  /** 查詢財產編號下拉選單 (FAASSET) */
  queryFAASSETChooseList_DropDownList(): Observable<Option[] | null> {
    return this.http
      .post<ApiResponse<{ AssetId: string; AssetName: string }[]>>(
        `${this.apiUrl}/queryFAASSETChooseList_DropDownList`,
        {},
      )
      .pipe(
        map(response => {
          const data = response?.Data ?? [];
          return data.map(item => ({
            value: item.AssetId,
            label: `${item.AssetId} - ${item.AssetName}`,
          }));
        }),
        catchError(err => {
          console.error('API /queryFAASSETChooseList_DropDownList 失敗:', err);
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }
  /** 查詢當日交易日期有特殊條碼的機台 (TLS55020) */
  queryPos1002Tls55020(body: Tls55020Query): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem, Tls55020Query>(
      '/queryPOS1002_TLS55020_DropDownList',
      'No',
      'Name',
      body
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  /** 查詢當日交易日期有特殊條碼的專櫃 (TLS55020) */
  queryTltTalentTls55020(body: Tls55020Query): Observable<Option[] | null> {
    return this.queryAndMapDropdown<IDropdownItem, Tls55020Query>(
      '/queryTLTTALENT_TLS55020_DropDownList',
      'No',
      'Name',
      body
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  /** 查詢寄件者資料(NTY1001) */
  queryNTY1001_DropDownList(): Observable<IDropdownItem[] | null> {
    return this.queryDropdown<IDropdownItem>('/queryNTY1001_DropDownList').pipe(
      shareReplay({ bufferSize: 1, refCount: true }) // 避免重複查詢;
    );
  }
}
