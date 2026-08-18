import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IDropdownItem } from "@service/utility/dropDownList.service";
import { ApiError, ApiMeta, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, take } from "rxjs";
import { environment } from "src/environments/environment";

export interface BaseQueryNoArrayResponse<T> {
    Status: string;
    Data: T;
    Error?: ApiError;
    Meta?: ApiMeta;
    Message: string;
    TotalCount: number;
    TotalPage: number;
}


// Response 資料結構
export interface ASS16020Data {
    Status: string;
    Data: { Details: QueryASS16020Detail[] }; // 查詢結果
    Error?: ApiError;
    Meta?: ApiMeta;
    Message: string;
    TotalCount: number;
    TotalPage: number;
}

// 查詢結果
export interface QueryASS16020Detail {
    RowNo: number;     // 流水序號
    INV_ID: string;   // 盤點單號
    INV_STATUS: string;     // 盤點狀態代碼
    INV_STATUS_NAME: string;   // 盤點狀態名稱 (1:盤點中, 2:登錄完成, 3:已結案)
    INV_DATE: string;     // 盤點日期 (格式: YYYY/MM/DD)
    CLOSE_DATE: string;   // 結案日期 (格式: YYYY/MM/DD)
    EMP_ID: string;   // 盤點人員代碼
    EMP_NAME: string;     // 盤點人員名稱
}

// 登錄/編輯明細 Response
export interface QueryDetailASS16020Response {
    WH_ID: string;     // 倉別
    INV_ID: string;   // 盤點單號
    INV_DATE: string;     // 盤點日期 (YYYY/MM/DD)
    INV_STATUS: string;     // 盤點狀態代碼
    INV_STATUS_NAME: string;   // 盤點狀態名稱 (盤點中/登錄完成/已結案)
    EMP_ID: string;   // 初盤人員代碼
    EMP_NAME: string;     // 初盤人員名稱
    EMP_ORG_ID: string;     // 初盤人員組織代碼
    EMP_ORG_NAME: string;     // 初盤人員組織名稱
    EMP_ID2: string;   // 複盤人員代碼
    EMP_NAME2: string;     // 複盤人員名稱
    EMP_ORG_ID2: string;     // 複盤人員組織代碼
    EMP_ORG_NAME2: string;     // 複盤人員組織名稱
    NOTES: string;   // 說明
    Details: QueryDetailASS16020Detail[];   // 明細資料
}

// 明細資料
export interface QueryDetailASS16020Detail {
    RowNo: number;     // 流水序號
    KEYIN_NO: number;   // 登錄序號
    FASITEM_ID: number;   // 品項編號
    GOODS_NAME: string;   // 品項名稱
    FASITEM_DISPLAY?: string;   // 品項編號/名稱 (前端組合顯示用，比照報表 "編號 / 名稱" 格式)
    B_CLASS_ID: string;   // 大分類代碼
    BClassName: string;   // 大分類名稱
    M_CLASS_ID: string;   // 中分類代碼
    MClassName: string;   // 中分類名稱
    S_CLASS_ID: string;   // 小分類代碼
    SClassName: string;   // 小分類名稱
    FINE_QTY: number;   // 盤點數量 (登錄時為NULL)
    NOTES: string;     // 說明 (登錄時為NULL)
}

//  盤點人員下拉選單 Response
export interface TBLUSERDropdownItem {
    user_No: string;
    user_Name: string;
    Org_ID: string;
    Org_Name: string;
}

//  盤點維護 - 執行結果(Insert, Update, Delete, UpdateClose, )
export interface ExecASS16020Response {
    ErrCode?: number;
    ErrMsg?: string;
}

// 查詢 Request
export interface QueryASS16020Request {
    STO_NO?: string;   // 分店代號
    INV_ID?: string;   // 盤點單號
    INV_STATUS?: string;   // 盤點狀態 1=盤點中 2=登錄完成 3=已結案
    INV_DATE_FROM?: string;   // 盤點日期(起)
    INV_DATE_TO?: string;   // 盤點日期(迄)
    CLOSE_DATE_FROM?: string;   // 結案日期(起)
    CLOSE_DATE_TO?: string;   // 結案日期(迄)
    EMP_ID?: string;   // 盤點人員代碼
    NOTES?: string;   // 說明 (模糊查詢)
    REPORT_TYPE?: string;   // 報表類型 0=全部 1=差異 (差異=明細有DIFF_QTY != 0)
}


// 登錄/編輯明細 Request
export interface QueryDetailASS16020Request {
    INV_ID: string;   // 盤點單號（必填）
}

// 新增 登錄/編輯明細 Request
export interface InsertASS16020Request {
    INV_ID: string;   // 盤點單號（必填）
    EMP_ID: string;   // 初盤人員代碼（必填）
    EMP_ID2: string;   // 複盤人員代碼（必填）
    NOTES?: string;   // 說明 (可不填)
    Details?: IUDetail[];   // 明細 TVP (KEYIN_NO, FINE_QTY, NOTES)
    UPD_USR_No: string;   // 操作人員代碼（必填）
    UPD_USR_Name: string;   // 操作人員姓名（必填）
}

// 更新 登錄/編輯明細 Request
export interface UpdateASS16020Request {
    INV_ID: string;   // 盤點單號（必填）
    EMP_ID: string;   // 初盤人員代碼（必填）
    EMP_ID2: string;   // 複盤人員代碼（必填）
    NOTES?: string;   // 說明 (可不填)
    Details?: IUDetail[];   // 明細 TVP (KEYIN_NO, FINE_QTY, NOTES)
    UPD_USR_No: string;   // 操作人員代碼（必填）
    UPD_USR_Name: string;   // 操作人員姓名（必填）
}

// 刪除 Request
export interface DeleteASS16020Request {
    INV_ID: string;   // 盤點單號（必填）
    UPD_USR_No?: string;   // 操作人員代碼（必填，供Log用）
}

// 結案 Request
export interface UpdateCloseASS16020Request {
    INV_ID: string;   // 盤點單號（必填）
    CLOSE_EMP_ID: string;   // 結案人員代碼（必填）
    UPD_USR_No: string;   // 操作人員代碼（必填）
    UPD_USR_Name: string;   // 操作人員姓名（必填）
}

// 報表列印 Request
export interface PrintASS16020Request {
    INV_ID: string;   // 盤點單號（必填）
    REPORT_TYPE?: string;   // 報表類型 0=全部 1=差異 (差異=明細有DIFF_QTY != 0)
}


// 對應 ASS16020_Detail_TVP 的結構
export interface IUDetail {
    KEYIN_NO?: number;
    FINE_QTY?: number;
    NOTES?: string;
}

export interface ASS16020ReportRequest {
    INV_ID: string;     // 盤點單號
}

export interface PrintASS16020Response {
    ErrCode: number; // 0=成功 1=參數錯誤 2=卡控 ERROR_NUMBER()=系統錯誤
    ErrMsg: string;
    SurplusCount: number; // 盤盈項數
    LossCount: number; // 盤損項數
    TotalDiffAmt: number; // 總差異金額
    NOTES: string; // 說明
    Details: ASS16020ReportData[]; // 明細
}

export interface ASS16020ReportData {
    RowNo: number; // 流水序號
    B_CLASS_ID: string;     // 大分類編號
    BClassName: string;     // 大分類名稱
    M_CLASS_ID: string;     // 中分類編號
    MClassName: string;     // 中分類名稱
    S_CLASS_ID: string;     // 小分類編號
    SClassName: string;     // 小分類名稱
    FASITEM_ID: string;     // 品項編號
    GOODS_NAME: string;   // 品項名稱
    AVER_AMT: number;     // 平均單價
    QTY: number;     // 庫存數量
    StockAmt: number;     // 庫存金額 (差異報表用)
    FINE_QTY: number;     // 盤點數量
    InvAmt: number;     // 盤點金額 (差異報表用)
    DIFF_QTY: number;     // 差異數量
    DIFF_AMT: number;     // 差異金額
    RowType: number;     // 0=明細 1=小計
    RowTypeDesc: string;     // 列類型說明 明細/小計
}

export interface ASS16020Request {
    warehouseType: string; // 倉別
    INV_ID: string; // 盤點單號
    SInventoryDate: string; // 盤點日期(起)
    EInventoryDate: string; // 盤點日期(迄)
    initOrgCode: string; // 初盤組織
    initChecker: string; // 初盤人員
    reOrgCode: string; // 複盤組織
    rechecker: string; // 複盤人員
    remark: string; // remark
}

export enum PageMode {
    Query = 'Query',
    Report = 'Report',
}

@Injectable({
    providedIn: 'root'
})
export class Ass16020Service {
    private apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';
    constructor(private http: HttpClient) { }

    // 查詢
    queryASS16020(req: QueryASS16020Request): Observable<ASS16020Data> {
        return this.http.post<ASS16020Data>(`${this.apiUrl}/queryASS16020`, req);
    }

    // 登錄/編輯明細 查詢
    queryDetailASS16020(req: QueryDetailASS16020Request): Observable<BaseQueryNoArrayResponse<QueryDetailASS16020Response>> {
        return this.http.post<BaseQueryNoArrayResponse<QueryDetailASS16020Response>>(`${this.apiUrl}/queryDetailASS16020`, req);
    }

    // 新增 登錄/編輯明細
    insertASS16020(payload: InsertASS16020Request): Observable<BaseQueryNoArrayResponse<ExecASS16020Response>> {
        return this.http.post<BaseQueryNoArrayResponse<ExecASS16020Response>>(`${this.apiUrl}/insertASS16020`, payload);
    }

    // 更新 登錄/編輯明細
    updateASS16020(payload: UpdateASS16020Request): Observable<BaseQueryNoArrayResponse<ExecASS16020Response>> {
        return this.http.post<BaseQueryNoArrayResponse<ExecASS16020Response>>(`${this.apiUrl}/updateASS16020`, payload);
    }

    // 刪除
    deleteASS16020(payload: DeleteASS16020Request): Observable<BaseQueryNoArrayResponse<ExecASS16020Response>> {
        return this.http.post<BaseQueryNoArrayResponse<ExecASS16020Response>>(`${this.apiUrl}/deleteASS16020`, payload);
    }

    // 結案
    updateCloseASS16020(payload: UpdateCloseASS16020Request): Observable<BaseQueryNoArrayResponse<ExecASS16020Response>> {
        return this.http.post<BaseQueryNoArrayResponse<ExecASS16020Response>>(`${this.apiUrl}/updateCloseASS16020`, payload);
    }

    // 查詢報表
    queryPrintASS16020(payload: PrintASS16020Request): Observable<ApiResponse<PrintASS16020Response>> {
        return this.http.post<ApiResponse<PrintASS16020Response>>(`${this.apiUrl}/queryPrintASS16020`, payload);
    }

    // 報表列印 (Excel)
    exportExcelASS16020(payload: PrintASS16020Request): Observable<HttpResponse<Blob>> {
        return this.http
            .post(`${this.apiUrl}/exportASS16020`, payload, {
                responseType: 'blob',
                observe: 'response',
            })
            .pipe(take(1));
    }

    // 報表列印 (PDF)
    exportPDFASS16020(payload: PrintASS16020Request): Observable<HttpResponse<Blob>> {
        return this.http
            .post(`${this.apiUrl}/printASS16020`, payload, {
                responseType: 'blob',
                observe: 'response',
            })
            .pipe(take(1));
    }


    // 查詢盤點人員下拉選單
    queryTBLUSER_Orgid_DropDownList(): Observable<ApiResponse<TBLUSERDropdownItem[]>> {
        return this.http.post<ApiResponse<TBLUSERDropdownItem[]>>(`${environment.ApiUrl}/queryTBLUSER_Orgid_DropDownList`, {});
    }

    // 查詢組織下拉選單
    querySYS3100_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
        return this.http.post<ApiResponse<IDropdownItem[]>>(`${environment.ApiUrl}/querySYS3100_DropDownList`, {});
    }

}