import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { ApiError, ApiMeta, ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


// 查詢 Request
export interface QueryFIN72020Request extends ApiRequest {
  PCS_RqstNo?: string;   // 支出請款單號 (TC+YYYYMMDDXXXX)
  PCS_RqstDate?: string;   // 請款產生日期
  PCS_UsrNo?: string;   // 零用金申請人員代碼
  Keep_UsrNo?: string;   // 零用金保管人代碼
  PCS_Status?: string;   // 單據狀態 (1=建立 2=請款 3=拋轉傳票 4=撥補 9=作廢)
  Keep_OrgID?: string;   // 零用金保管人組織代碼 (保管單位/限審單位)
  SortColumn?: string;   // 排序欄位
  SortDirection?: string;   // 排序方向 (ASC/DESC)
}

// Response 資料結構
export interface FIN72020Data {
  SeqNo: number;     // 序號
  PCS_RqstNo: string;   // 支出請款單號 (TC+YYYYMMDDXXXX)
  PCS_UsrNo: string;   // 零用金申請人員代碼
  PCS_UsrName: string;   // 零用金申請人員姓名
  PCS_OrgID: string;   // 申請人組織代碼
  PCS_OrgName: string;   // 申請人組織名稱
  Keep_UsrNo: string;   // 零用金保管人代碼
  Keep_UsrName: string;   // 零用金保管人員姓名
  Keep_OrgID: string;   // 保管人組織代碼 (限審單位)
  Keep_OrgName: string;   // 保管人組織名稱 (限審單位名稱)
  PCS_No: string;     // 零用金單號
  PCS_Status: string;   // 單據狀態代碼
  PCS_StatusName: string;   // 單據狀態名稱
  id: number;    // 主鍵 ID
}


// 查詢明細資料 Request
export interface ClaimFIN72020QueryRequest {
  DateFrom?: string;   // 零用金申請日期（起）
  DateTo?: string;   // 零用金申請日期（迄）
  Keep_OrgID: string;   // 保管單位組織代碼 (必填)
  Keep_UsrNo: string;   // 保管人代碼 (必填，卡控同一請款單須同一保管人)
}


// 查詢明細資料 Response
export interface ClaimFIN72020QueryResponse {
  SeqNo: number;     // 序號
  IsClaimed: boolean;   // 是否勾選 (預設為 false)
  PCS_No: string;   // 零用金單號
  PCS_Date: string;   // 申請日期
  PCS_TotAmt: number;   // 申請總金額
  PCS_UsrDisplay: string;   // 申請人 (代碼-姓名)
  PCS_OrgDisplay: string;   // 組織名稱 (代碼-名稱)
  Keep_UsrDisplay: string;   // 零用金保管人 (代碼-姓名)
  PCS_Status: string;   // 單據狀態代碼 (Mode=Q 時固定為 1)
  PCS_StatusName: string;   // 單據狀態名稱
  MainID: number;   // 主檔 id
}


// 執行請款 Request
export interface ClaimFIN72020ExecuteRequest {
  Keep_UsrNo: string;   // 保管人代碼 (必填)
  PCS_NoList?: string;   // 欲請款的單號清單 (逗號分隔)
  RqstUsrNo?: string;   // 請款人代碼
  RqstUsrName?: string;   // 請款人姓名
}

// 執行請款 Response
export interface ClaimFIN72020ExecuteResponse {
  PCS_RqstNo?: string;   // 產生的請款單號 (TC+YYYYMMDDXXXX)
  ErrMsg?: string;   // 錯誤訊息 (執行失敗時才有值)
}

// 作廢 Request
export interface voidFIN72020Request {
  SYS_StoreNo?: string;   // 公司編號/店號 (必填)
  PCS_No: string;   // 零用金單號 (必填)
  VoidUsrNo?: string;   // 作廢人代碼 (必填)
  VoidUsrName?: string; // 作廢人姓名 (必填)
}
// 作廢 Request
export interface returnFIN72020Request {
  SYS_StoreNo?: string;   // 公司編號/店號 (必填)
  PCS_No: string;   // 零用金單號 (必填)
  ReturnUsrNo?: string;   // 作廢人代碼 (必填)
  ReturnUsrName?: string; // 作廢人姓名 (必填)
}
// 作廢 Response
export interface FIN72020VoidResponse {
  SYS_StoreNo: string;   // 公司編號/店號
  PCS_No: string;   // 零用金單號
  OldStatus: string;   // 作廢前狀態
  NewStatus: string; // 作廢後狀態
  VoidDate: string;   // 作廢日期
  VoidUsrNo: string;   // 作廢人代碼
  VoidUsrName: string; // 作廢人姓名
  Message: string;   // 執行結果訊息
}
export interface FIN72020ReturnResponse {
  SYS_StoreNo: string;   // 公司編號/店號
  PCS_No: string;   // 零用金單號
  Message: string;   // 執行結果訊息
}

export interface FIN72020SaveDetailItem {
  id: number | null;    // 資料庫自動編號 ID：新增傳 null，修改/刪除傳原始 ID
  RowAction: string;   // 明細操作模式：I=新增, U=修改, D=刪除 (必填)
  PCS_SeqNo?: number;   // 項次
  AccNo: string;   // 費用會計科目編號 (必填)
  NOTeDesc: string;   // 項目摘要：必填，且前五碼需為 YYYMM (民國年+月) 格式
  ORG_ID: string;   // 組織代碼 (必填)
  PCS_DtlType: string;   // 明細類別：0=不扣抵憑證, 1=發票, 2=收據 (必填)
  PCS_GUINo?: string;   // 發票/收據號碼：發票或收據模式時必填
  PUR_Date: string;   // 憑證日期 (必填)
  DATA_YM?: string;   // 資料年月 (格式：YYYYMM)
  DEC_YM: string;   // 申報年月 (格式：YYYYMM，通常為雙數月，必填)
  PCS_Net: number;   // 申請淨額 (未稅金額，必填)
  PCS_Tax: number;   // 申請稅額：課稅別非「應稅」時，SP 會自動強制改為 0 (必填)
  VEN_UniformNum?: string;   // 廠商統一編號
  PUR_VoucherType?: string;   // 憑證類別 (發票格式)：明細類別為「發票」時必填
  PUR_DiscNo?: string;   // 扣抵代號：1=可扣抵進貨費用, 2=可扣抵固定資產, 3=不可扣抵進貨費用, 4=不可扣抵固定資產
  PCS_TaxType: string;   // 課稅別：0=免稅, 1=應稅, 2=零稅率 (必填)
  PUR_DirectType?: string;   // 發票用途：1=專供課稅, 2=共同使用
  COLLECT_NUM?: string;   // 彙總張數 (預設 0)
  PCS_Remark?: string;   // 備註說明
}

export interface POS2064MPCS_RqstNoDropDownListResponse {
  PCS_RqstNo?: string;    // 請款單號
  PCS_RqstDate?: string;   // 請款日期
  Keep_UsrNo?: string;   // 保管人員編號
}

export interface queryTBLUSER_Orgid_DropDownListResponse {
  user_No?: string;    // 使用者代碼
  user_Name?: string;   // 使用者名稱
  Org_ID?: string;   // 組織代碼
  Org_Name?: string;   // 組織名稱
}

export interface BaseNoArrayQueryResponse<T> {
  Status: string;
  Data: T;
  Error?: ApiError;
  Meta?: ApiMeta;
  Message: string;
  TotalCount: number;
  TotalPage: number;
}


@Injectable({ providedIn: 'root' })
export class FIN72020Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/FIN70000';
  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN72020(req: QueryFIN72020Request): Observable<ApiResponse<FIN72020Data[]>> {
    return this.http.post<ApiResponse<FIN72020Data[]>>(`${this.apiUrl}/queryFIN72020`, req).pipe(
      map((res: ApiResponse<FIN72020Data[]>) => {
        return {
          ...res,
          Data: res.Data.map((item: FIN72020Data) => ({
            ...item,
            PCS_UsrDisplay: `${item.PCS_UsrNo ?? ''}-${item.PCS_UsrName ?? ''}`,
            PCS_OrgDisplay: `${item.PCS_OrgID ?? ''}-${item.PCS_OrgName ?? ''}`,
            Keep_UsrDisplay: `${item.Keep_UsrNo ?? ''}-${item.Keep_UsrName ?? ''}`,
            Keep_OrgDisplay: `${item.Keep_OrgID ?? ''}-${item.Keep_OrgName ?? ''}`,
          }))
        }
      })
    )
  }

  // 查詢明細資料
  claimFIN72020Query(req: ClaimFIN72020QueryRequest): Observable<ApiResponse<ClaimFIN72020QueryResponse[]>> {
    return this.http.post<ApiResponse<ClaimFIN72020QueryResponse[]>>(`${this.apiUrl}/claimFIN72020Query`, req);
  }

  // 執行請款
  claimFIN72020Execute(payload: ClaimFIN72020ExecuteRequest): Observable<ApiResponse<ClaimFIN72020ExecuteResponse>> {
    return this.http.post<ApiResponse<ClaimFIN72020ExecuteResponse>>(`${this.apiUrl}/claimFIN72020Execute`, payload);
  }

  // 作廢
  voidFIN72020(payload: voidFIN72020Request): Observable<ApiResponse<FIN72020VoidResponse>> {
    return this.http.post<ApiResponse<FIN72020VoidResponse>>(`${this.apiUrl}/voidFIN72020`, payload);
  }
  returnIN72020(payload: returnFIN72020Request): Observable<ApiResponse<FIN72020ReturnResponse>> {
    return this.http.post<ApiResponse<FIN72020ReturnResponse>>(`${this.apiUrl}/returnFIN72020`, payload);
  }


  // 下拉選單
  // 支出請款單號下拉選單
  POS2064MPCS_RqstNoDropDownList(): Observable<ApiResponse<POS2064MPCS_RqstNoDropDownListResponse[]>> {
    return this.http.post<ApiResponse<POS2064MPCS_RqstNoDropDownListResponse[]>>(`${this.apiUrl}/POS2064MPCS_RqstNoDropDownList`, {});
  }

  // 查詢 零用金申請人、零用金保管人 下拉選單
  queryTBLUSER_Orgid_DropDownList(): Observable<ApiResponse<queryTBLUSER_Orgid_DropDownListResponse[]>> {
    return this.http.post<ApiResponse<queryTBLUSER_Orgid_DropDownListResponse[]>>(`${environment.ApiUrl}/queryTBLUSER_Orgid_DropDownList`, {});
  }
  //零用金保管人 下拉選單
  queryTBLUSER_PCS_DropDownList(user_No?: String): Observable<ApiResponse<queryTBLUSER_Orgid_DropDownListResponse[]>> {
    return this.http.post<ApiResponse<queryTBLUSER_Orgid_DropDownListResponse[]>>(`${environment.ApiUrl}/queryTBLUSER_PCS_DropDownList`, { user_No: user_No ?? null });
  }
  // 查詢保管單位下拉選單
  querySYS3100_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${environment.ApiUrl}/querySYS3100_DropDownList`, {});
  }

  // 查詢保管人下拉選單
  queryTBLUSER_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${environment.ApiUrl}/queryTBLUSER_DropDownList`, {});
  }
}
