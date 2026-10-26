import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IDropdownItem } from "@service/utility/dropDownList.service";
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, take } from "rxjs";
import { environment } from "src/environments/environment";


// Response 資料結構
export interface FIN42020Data {
    SortNo: number;         // 排序用
    LevelNo: number;        // 階層用，0=群組標題、1=明細、9=合計/計算列
    RowType: string;     // 列類型，HEADER=群組標題、DETAIL=明細、TOTAL=合計、CALC=計算列
    AccountCode: string;    // 科目代號
    AccountName: string;    // 科目名稱
    CurrentAmount: number;  // 本期金額
    CurrentRatio: number;   // 本期佔比
    LastYearAmount: number; // 去年同期金額
    LastYearRatio: number;  // 去年同期佔比
    GrowthRate: number;     // 本月增減率
    BudgetAmount: number;   // 本月預算
    BudgetDiffAmount: number; // 預算與本期差異
    BudgetGrowthRate: number; // 本月預算比增減率
    CurrentAccumAmount: number; // 本期累計金額
    CurrentAccumRatio: number; // 本期累計佔比
    LastYearAccumAmount: number; // 去年累計金額
    LastYearAccumRatio: number; // 去年累計佔比
    AccumGrowthRate: number; // 累計增減率
    BudgetAccumAmount: number; // 累計預算
    BudgetAccumGrowthRate: number; // 累計預算比增減率
}

export interface QueryFIN42020Request {
    YM: string;     // 年月 YYYYMM
    Org_ID?: string;     // 部門，可空白
    ReportType: number; // 1=統制, 2=明細
    AmtUnit: number; // 1=元, 2=千, 3=萬
}


@Injectable({
    providedIn: 'root'
})
export class FIN42020Service {
    private apiUrl = environment.ApiUrl + '/FIN40000/FIN4000';
    constructor(private http: HttpClient) { }

    // 查詢
    queryFIN42020(req: QueryFIN42020Request): Observable<ApiResponse<FIN42020Data[]>> {
        return this.http.post<ApiResponse<FIN42020Data[]>>(`${this.apiUrl}/queryFIN42020`, req);
    }

    // 查詢部門代號下拉選單
    querySYS3100_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
        return this.http.post<ApiResponse<IDropdownItem[]>>(`${environment.ApiUrl}/querySYS3100_DropDownList`, {});
    }

    /** 匯出 PDF */
    exportFIN42020PDF(payload: QueryFIN42020Request): Observable<HttpResponse<Blob>> {
        return this.http
            .post(`${this.apiUrl}/exportFIN42020PDF`, payload, {
                responseType: 'blob',
                observe: 'response',
            })
            .pipe(take(1));
    }

    /** 匯出 Excel */
    exportFIN42020Excel(payload: QueryFIN42020Request): Observable<HttpResponse<Blob>> {
        return this.http
            .post(`${this.apiUrl}/exportFIN42020Excel`, payload, {
                responseType: 'blob',
                observe: 'response',
            })
            .pipe(take(1));
    }

}