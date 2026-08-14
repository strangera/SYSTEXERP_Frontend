import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


// 查詢 Request
export interface QueryFIN72010Request {
  SYS_StoreNo: string;   // 公司編號/店號(必填)
  PCS_No?: string;   // 零用金單號
  DateFrom?: string;   // 申請日期起
  DateTo?: string;   // 申請日期迄
  PCS_UsrNo?: string;   // 零用金申請人員代碼
  Keep_UsrNo?: string;   // 零用金保管人代碼
  PCS_Status?: string;   // 單據狀態
  Keep_OrgID?: string;   // 零用金保管人組織代碼(保管單位)
  AmtFrom?: number;   // 零用金申請總金額（起）
  AmtTo?: number;   // 零用金申請總金額（訖）
  PageIndex?: number;   // 頁碼（從 1 開始）
  PageSize?: number;   // 每頁筆數
  SortColumn?: string;   // 排序欄位
  SortDirection?: string;   // 排序方向 ASC / DESC
}

// Response 資料結構
export interface FIN72010Data {
  SeqNo: number;     // 序號
  PCS_No: string;     // 零用金單號
  PCS_Date: string;   // 零用金申請日期
  PCS_UsrNo: string;   // 零用金申請人員代碼
  PCS_UsrName: string;   // 零用金申請人員姓名
  PCS_OrgID: string;   // 零用金申請人組織代碼
  PCS_OrgName: string;   // 零用金申請人組織名稱
  Keep_UsrNo: string;   // 零用金保管人代碼
  Keep_UsrName: string;   // 零用金保管人員姓名
  Keep_OrgID: string;   // 零用金保管人組織代碼
  Keep_OrgName: string;   // 零用金保管人組織名稱
  PCS_Status: string;   // 單據狀態
  PCS_StatusName: string;   // 單據狀態名稱
  PCS_RqstNo: string;   // 支出請款單號
  PCS_SeqNo: number;   // 項次
  AccNo: string;   // 費用會計科目編號
  AccName: string;   // 費用會計科目名稱
  NOTeDesc: string;   // 項目摘要
  PCS_DtlType: string;   // 明細類別
  PCS_DtlTypeName: string;   // 明細類別名稱
  PCS_GUINo: string;   // 發票 / 收據號碼
  ORG_ID: string;   // 費用科目組織代碼
  Dtl_OrgName: string;   // 費用科目組織名稱
  PUR_Date: string;   // 憑證日期
  PCS_Net: number;   // 申請淨額(未稅金額)
  PCS_Tax: number;   // 申請稅額
  PCS_Amt: number;   // 申請總金額
}


// 查詢編輯頁面資料 Request
export interface QueryFIN72010DetailRequest {
  PCS_No: string;   // 零用金單號(必填)
}


// 查詢編輯頁面資料 Response
export interface FIN72010DetailMasterResponse {
  Master: {
    id: number;    // 主檔自動編號
    SYS_StoreNo: number;     // 公司編號/店號
    PCS_No: string;     // 零用金單號
    PCS_Date: string;   // 零用金申請日期
    PCS_UsrNo: string;   // 零用金申請人員代碼
    PCS_UsrName: string;   // 零用金申請人員姓名
    PCS_OrgID: string;   // 零用金申請人組織代碼
    PCS_OrgName: string;   // 零用金申請人組織名稱
    Keep_UsrNo: string;   // 零用金保管人代碼
    Keep_UsrName: string;   // 零用金保管人員姓名
    Keep_OrgID: string;   // 零用金保管人組織代碼
    Keep_OrgName: string;   // 零用金保管人組織名稱
    PCS_Status: string;   // 單據狀態
    PCS_StatusName: string;   // 單據狀態名稱
    PCS_RqstNo: string;   // 支出請款單號
    PCS_TotAmt: number;   // 申請總金額
    PCS_TotNet: number;   // 申請總淨額
    PCS_TotTax: number;   // 申請總稅額
    PCS_Remark: string;   // 備註說明
    CRT_Date: string;   // 建立日期
    CRT_USR_No: string;   // 建立人員代碼
    CRT_USR_Name: string;   // 建立人員姓名
    UPD_Date: string;   // 變更日期
    UPD_USR_No: string;   // 變更人員代碼
    UPD_USR_Name: string;   // 變更人員姓名
  },
  Details: QueryFIN72010DetailDetailResponse[];   // 明細資料
}

export interface QueryFIN72010DetailDetailResponse {
  id: number;    // 明細自動編號（修改時作為比對主鍵）
  SYS_StoreNo: number;     // 公司編號/店號
  PCS_No: string;     // 零用金單號
  PCS_SeqNo: number;   // 項次
  AccNo: string;   // 費用會計科目編號
  AccName: string;   // 費用會計科目名稱
  NOTeDesc: string;   // 項目摘要
  ORG_ID: string;   // 組織代碼
  Dtl_OrgName: string;   // 費用科目組織名稱
  PCS_DtlType: string;   // 明細類別（0=不扣抵憑證 1=發票 2=收據）
  PCS_DtlTypeName: string;   // 明細類別名稱
  PCS_GUINo: string;   // 發票 / 收據號碼
  PUR_Date: string;   // 憑證日期
  DATA_YM: string;   // 資料年月
  DEC_YM: string;   // 申報年月（雙數月）
  PCS_Amt: number;   // 申請總金額（系統自動計算 = 淨額 + 稅額）
  PCS_Net: number;   // 申請淨額（未稅金額）
  PCS_Tax: number;   // 申請稅額
  VEN_Uniform: string;   // 廠商統一編號
  PUR_VoucherType: string;   // 憑證類別（發票格式）
  PUR_DiscNo: string;   // 扣抵代號（1=可扣抵進貨費用 2=可扣抵固定資產 3=不可扣抵進貨費用 4=不可扣抵固定資產）
  PCS_TaxType: string;   // 課稅別（0=免稅 1=應稅 2=零稅率）
  PCS_TaxTypeName: string;   // 課稅別名稱
  PUR_DirectType: string;   // 發票用途（1=專供課稅 2=共同使用）
  PUR_DirectTypeName: string;   // 發票用途名稱
  COLLECT_NUM: string;   // 彙總張數
  PCS_Remark: string;   // 備註說明
  RECON_Key: string;   // 對帳KEY值（明細類別=0 不扣抵憑證時不寫入）
  CRT_Date: string;   // 建立日期
  CRT_USR_No: string;   // 建立人員代碼
  CRT_USR_Name: string;   // 建立人員姓名
  UPD_Date: string;   // 變更日期
  UPD_USR_No: string;   // 變更人員代碼
  UPD_USR_Name: string;   // 變更人員姓名

  status?: string;   // 前端專用欄位，紀錄該筆明細的狀態（新增、修改、刪除），用於送出時決定 RowAction
  DEC_YM_Date: Date | null;  // 前端專用欄位，將 DEC_YM 轉換成 Date 物件以便於 PrimeNG 的 Calendar 元件使用
  _TABLE_KEY?: string; // table-edit 產生的暫時 key，用來識別新增資料
}

// 新增/修改 Request
export interface saveFIN72010Request {
  ActionMode: string;   // 作業模式：I=新增, U=修改 (必填)
  SYS_StoreNo?: string;   // 公司編號/店號(必填)
  PCS_No?: string;   // 零用金單號：新增時由 SP 自動給號 (可為 null)，修改時必填
  PCS_Date: string;   // 零用金申請日期 (必填)
  PCS_UsrNo: string;   // 零用金申請人員代碼 (必填)
  PCS_UsrName?: string;   // 零用金申請人員姓名
  PCS_OrgID?: string;   // 零用金申請人組織代碼
  Keep_UsrNo: string;   // 零用金保管人代碼 (必填)
  Keep_UsrName?: string;   // 零用金保管人員姓名
  Keep_OrgID?: string;   // 零用金保管人組織代碼
  PCS_Remark?: string;   // 備註說明
  CRT_USR_No?: string;   // 建立人員代碼
  CRT_USR_Name?: string; // 建立人員姓名
  Details: FIN72010SaveDetailItem[];   // 明細資料
}

export interface FIN72010SaveResponse {
  Summary: {
    IsSuccess: number;   // 執行結果：1=成功, 0=失敗
    Message: string;   // 執行結果訊息
    ErrCount: number;   // 違規總筆數 (若有驗證失敗則 > 0)
    SYS_StoreNo: string;   // 成功後回傳的公司編號
    PCS_No: string;     // 成功後回傳的零用金單號 (特別是新增模式下取得的單號)
    PCS_TotAmt: number;   // 最終計算的申請總金額
  },
  ValidationErrors: [{
    PCS_SeqNo: number;   // 發生錯誤的明細項次
    RuleNo: string;   // 違規的規則編號
    ErrField: string;   // 違規的欄位名稱
    ErrReason: string;   // 錯誤原因說明
  }];
}

// 作廢 Request
export interface voidFIN72010Request {
  SYS_StoreNo?: string;   // 公司編號/店號 (必填)
  PCS_No: string;   // 零用金單號 (必填)
  VoidUsrNo?: string;   // 作廢人代碼 (必填)
  VoidUsrName?: string; // 作廢人姓名 (必填)
}

// 作廢 Response
export interface FIN72010VoidResponse {
  SYS_StoreNo: string;   // 公司編號/店號
  PCS_No: string;   // 零用金單號
  OldStatus: string;   // 作廢前狀態
  NewStatus: string; // 作廢後狀態
  VoidDate: string;   // 作廢日期
  VoidUsrNo: string;   // 作廢人代碼
  VoidUsrName: string; // 作廢人姓名
  Message: string;   // 執行結果訊息
}


export interface FIN72010SaveDetailItem {
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
  VEN_Uniform?: string;   // 廠商統一編號
  PUR_VoucherType?: string;   // 憑證類別 (發票格式)：明細類別為「發票」時必填
  PUR_DiscNo?: string;   // 扣抵代號：1=可扣抵進貨費用, 2=可扣抵固定資產, 3=不可扣抵進貨費用, 4=不可扣抵固定資產
  PCS_TaxType: string;   // 課稅別：0=免稅, 1=應稅, 2=零稅率 (必填)
  PUR_DirectType?: string;   // 發票用途：1=專供課稅, 2=共同使用
  COLLECT_NUM?: string;   // 彙總張數 (預設 0)
  PCS_Remark?: string;   // 備註說明
  RECON_Key?: string;   // 對帳KEY值：明細類別=0(不扣抵憑證)時不寫入
}

export interface POS2064MPCS_NoDropDownListResponse {
  PCS_No?: string;    // 零用金單號
  PCS_Date?: string;   // 申請日期
  PCS_UsrNo?: string;   // 申請人員編號
}

export interface queryTBLUSER_Orgid_DropDownListResponse {
  user_No?: string;    // 使用者代碼
  user_Name?: string;   // 使用者名稱
  Org_ID?: string;   // 組織代碼
  Org_Name?: string;   // 組織名稱
}

export interface queryGLS1005_FASExpAccNo_DropDownListResponse {
  ROWNO?: number;   // 行號
  AccNo?: string;   // 會計科目代號
  AccName?: string;   // 會計科目名稱
  AccDisplay?: string;   // 下拉顯示文字
}

@Injectable({ providedIn: 'root' })
export class FIN72010Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/FIN70000';
  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN72010(req: QueryFIN72010Request): Observable<ApiResponse<FIN72010Data[]>> {
    return this.http.post<ApiResponse<FIN72010Data[]>>(`${this.apiUrl}/queryFIN72010`, req).pipe(
      map((res: ApiResponse<FIN72010Data[]>) => {
        return {
          ...res,
          Data: res.Data.map((item: FIN72010Data) => ({
            ...item,
            PCS_UsrDisplay: `${item.PCS_UsrNo ?? ''}-${item.PCS_UsrName ?? ''}`,
            PCS_OrgDisplay: `${item.PCS_OrgID ?? ''}-${item.PCS_OrgName ?? ''}`,
            Keep_UsrDisplay: `${item.Keep_UsrNo ?? ''}-${item.Keep_UsrName ?? ''}`,
            Keep_OrgDisplay: `${item.Keep_OrgID ?? ''}-${item.Keep_OrgName ?? ''}`,
            // 狀態中文顯示
            PCS_Status: this.getPCSStatusName(item.PCS_Status),
          }))
        }
      })
    )
  }

  // 查詢編輯頁面資料
  queryFIN72010Detail(req: QueryFIN72010DetailRequest): Observable<ApiResponse<FIN72010DetailMasterResponse>> {
    return this.http.post<ApiResponse<FIN72010DetailMasterResponse>>(`${this.apiUrl}/queryFIN72010Detail`, req);
  }

  // 新增/修改
  saveFIN72010(payload: saveFIN72010Request): Observable<ApiResponse<FIN72010SaveResponse>> {
    return this.http.post<ApiResponse<FIN72010SaveResponse>>(`${this.apiUrl}/saveFIN72010`, payload);
  }

  // 作廢
  voidFIN72010(payload: voidFIN72010Request): Observable<ApiResponse<FIN72010VoidResponse>> {
    return this.http.post<ApiResponse<FIN72010VoidResponse>>(`${this.apiUrl}/voidFIN72010`, payload);
  }


  // 下拉選單
  // 零用金單號下拉選單
  POS2064MPCS_NoDropDownList(): Observable<ApiResponse<POS2064MPCS_NoDropDownListResponse[]>> {
    return this.http.post<ApiResponse<POS2064MPCS_NoDropDownListResponse[]>>(`${this.apiUrl}/POS2064MPCS_NoDropDownList`, {});
  }

  // 查詢 零用金申請人、零用金保管人 下拉選單
  queryTBLUSER_Orgid_DropDownList(): Observable<ApiResponse<queryTBLUSER_Orgid_DropDownListResponse[]>> {
    return this.http.post<ApiResponse<queryTBLUSER_Orgid_DropDownListResponse[]>>(`${environment.ApiUrl}/queryTBLUSER_Orgid_DropDownList`, {});
  }

  // 查詢保管單位下拉選單
  querySYS3100_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${environment.ApiUrl}/querySYS3100_DropDownList`, {});
  }

  // 查詢 明細類別、發票格式、發票用途、課稅別、扣抵代號 下拉選單
  querySYS1000_DropDownList(SYS_Type: string): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${environment.ApiUrl}/querySYS1000_DropDownList`, { SYS_Type });
  }

  // 查詢費用會計科目下拉選單
  queryGLS1005_FASExpAccNo_DropDownList(Keyword: string): Observable<ApiResponse<queryGLS1005_FASExpAccNo_DropDownListResponse[]>> {
    return this.http.post<ApiResponse<queryGLS1005_FASExpAccNo_DropDownListResponse[]>>(`${environment.ApiUrl}/queryGLS1005_FASExpAccNo_DropDownList`, { Keyword });
  }

  // 根據狀態代碼回傳狀態名稱
  getPCSStatusName(status?: string | number | null): string {
    const statusMap: Record<string, string> = {
      '1': '建立',
      '2': '請款',
      '3': '拋轉',
      '4': '撥補',
      '9': '作廢'
    };

    return statusMap[String(status ?? '')] ?? '';
  }
}
