import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IDropdownItem } from "@service/utility/dropDownList.service";
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";


// Response 資料結構
export interface FIN41020Data {
    OrgId: string;     // 部門代碼
    OrgName: string;   // 部門名稱
    BudgetYear: string;     // 年
    BudgetVersion: string;     // 版本
    AccNo: string;     // 科目代號
    AccName: string;   // 科目名稱
    TotalAmount: number;     // 年度合計
    M01: number;     // 1月金額
    M02: number;     // 2月金額
    M03: number;     // 3月金額
    M04: number;     // 4月金額
    M05: number;     // 5月金額
    M06: number;     // 6月金額
    M07: number;     // 7月金額
    M08: number;     // 8月金額
    M09: number;     // 9月金額
    M10: number;     // 10月金額
    M11: number;     // 11月金額
    M12: number;     // 12月金額
    R01: string;     // 1月份備註
    R02: string;     // 2月份備註
    R03: string;     // 3月份備註
    R04: string;     // 4月份備註
    R05: string;     // 5月份備註
    R06: string;     // 6月份備註
    R07: string;     // 7月份備註
    R08: string;     // 8月份備註
    R09: string;     // 9月份備註
    R10: string;     // 10月份備註
    R11: string;     // 11月份備註
    R12: string;     // 12月份備註
    RemarkAny: string;     // 彙總備註（可選：任一月有備註就取最大一筆，方便快速檢視）
}

//  執行結果(Insert, Update, Delete, UpdateClose, )
export interface ExecFIN41020Response {
    ErrCode?: number;
    ErrMsg?: string;
}


// 查詢 Request
export interface QueryFIN41020Request extends ApiRequest {
    ORG_ID?: string;   // 部門代碼
    AccNo?: string;   // 會計科目
    BudgetYear?: string;   // 年 (YYYY)
    BudgetVersion?: string;   // 版本
}

// 更新 Request
export interface EditFIN41020Request {
    ORG_ID: string;   // 部門代碼
    AccNo: string;   // 會計科目
    BudgetYear?: string;   // 年 (YYYY)
    BudgetVersion?: string;   // 版本
    Details?: EditFIN41020MonthDetail[];
}

export interface EditFIN41020MonthDetail {
    MonthNo: string;   // 月份 (例如 "01", "02" ... "12")
    Budget: number;
    Remark?: string;
}

// 刪除 Request
export interface DeleteFIN41020Request {
    Items: DeleteFIN41020Item[];
}

export interface DeleteFIN41020Item {
    ORG_ID: string;   // 部門代碼
    BudgetYear?: string;   // 年 (YYYY)
    BudgetVersion?: string;   // 版本
}

@Injectable({
    providedIn: 'root'
})
export class FIN41020Service {
    private apiUrl = environment.ApiUrl + '/Controllers/FIN40000';
    constructor(private http: HttpClient) { }

    // 查詢
    queryFIN41020(req: QueryFIN41020Request): Observable<ApiResponse<FIN41020Data[]>> {
        return this.http.post<ApiResponse<FIN41020Data[]>>(`${this.apiUrl}/queryFIN41020`, req);
    }

    // 更新
    editFIN41020(payload: EditFIN41020Request): Observable<ApiResponse<ExecFIN41020Response>> {
        return this.http.post<ApiResponse<ExecFIN41020Response>>(`${this.apiUrl}/editFIN41020`, payload);
    }

    // 刪除
    deleteFIN41020(payload: DeleteFIN41020Request): Observable<ApiResponse<ExecFIN41020Response>> {
        return this.http.post<ApiResponse<ExecFIN41020Response>>(`${this.apiUrl}/deleteFIN41020`, payload);
    }



    // 查詢部門代號下拉選單
    querySYS3100_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
        return this.http.post<ApiResponse<IDropdownItem[]>>(`${environment.ApiUrl}/querySYS3100_DropDownList`, {});
    }

    // 查詢會計科目下拉選單
    queryGLS1005_DropDownList(Ledger_MD: string): Observable<ApiResponse<IDropdownItem[]>> {
        return this.http.post<ApiResponse<IDropdownItem[]>>(`${environment.ApiUrl}/queryGLS1005_DropDownList`, { Ledger_MD });
    }
}