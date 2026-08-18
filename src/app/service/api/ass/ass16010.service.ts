import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, take } from "rxjs";
import { environment } from "src/environments/environment";

export interface IDropdownItem_FAINVENTORYM {
    INV_ID?: string;
    INV_DATE?: string;
    INV_STATUS?: string;
    INV_STATUS_NAME?: string;
}

export interface QueryResult<T> {
    TotalRows: number;
    TotalPages: number;
    QueryData: T[];
}

// 查詢倉別下拉選單 Response 中的 Data 結構
export interface QueryASS11100Response {
    WH_ID: string;
    WH_NAME: string;
    ATT_ORG_ID: string;
    NOTES: string;
}

// 查詢中分類下拉選單 Response 中的 Data 結構
export interface QueryASS11020Response {
    RowNum: number; // 序號
    M_CLASS_ID: string; // 中分類代碼
    M_CLASS_NAME: string; // 中分類名稱
    B_CLASS_ID: string; // 大分類代碼
    B_CLASS_NAME: string; // 大分類名稱
    NOTES: string; // 說明
}

// 查詢 盤點單號下拉Request
export interface QueryFAINVENTORYMRequest {
    IS_ALL_STATUS?: string;   // N=只撈'1' , Y=全撈
}

// 查詢 倉別下拉Request
export interface QueryASS11100Request {
    STO_NO?: string;   // 分店編號
}

// 查詢 中分類下拉Request
export interface QueryASS11020Request {
    STO_NO?: string;   // 分店編號
    M_CLASS_ID?: string;   // 中分類代碼
    M_CLASS_NAME?: string;   // 中分類名稱
}

// 查詢 Request
export interface QueryASS16010Request extends ApiRequest {
    INV_ID?: string;   // 盤點單號
}

// 新增 Request
export interface InsertASS16010Request {
    STO_NO: string;     // 分店編號
    INV_TYPE: string;   // 盤點類型：1=全盤(不分類) 2=部份盤(以中分類)
    WHIDs: string[];       // 多個倉別（每個倉別各建一張單）
    B_CLASS_ID: string;   // 大分類代碼（部份盤必填）
    M_CLASS_ID: string;   // 中分類代碼（部份盤必填）
    CRT_USR_No: string;   // 建立人員代碼
    CRT_USR_Name: string; // 建立人員姓名
}

// Response 資料結構
export interface ASS16010Data {
    RowNo: number;     // 流水序號
    INV_ID: string;     // 盤點單號
    INV_DATE: string;   // 盤點日期
}

// 新增 Response：每個成功建立盤點單的倉別與單號
export interface InsertASS16010Response {
    WH_ID: string;
    NewINV_ID: string;
}

// 查看盤點單明細 Response
export interface QueryASS16010DetailResponse {
    RowNo: number;
    INV_ID: string;
    INV_DATE: string;
    B_CLASS_ID: string;
    BClassName: string;
    M_CLASS_ID: string;
    MClassName: string;
    S_CLASS_ID: string;
    SClassName: string;
    KEYIN_NO: number;
    FASITEM_ID: string;
    GOODS_NAME: string;
    FINE_QTY: number | null;
    BAD_QTY: number | null;
}

@Injectable({
    providedIn: 'root'
})
export class ASS16010Service {
    private apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';
    constructor(private http: HttpClient) { }

    // 查詢
    queryASS16010(req: QueryASS16010Request): Observable<ApiResponse<ASS16010Data[]>> {
        return this.http.post<ApiResponse<ASS16010Data[]>>(`${this.apiUrl}/queryASS16010`, req);
    }

    // 新增
    insertASS16010(payload: InsertASS16010Request): Observable<ApiResponse<InsertASS16010Response[]>> {
        return this.http.post<ApiResponse<InsertASS16010Response[]>>(`${this.apiUrl}/insertASS16010`, payload);
    }

    // 查看盤點單明細
    queryASS16010Detail(req: QueryASS16010Request): Observable<ApiResponse<QueryASS16010DetailResponse[]>> {
        return this.http.post<ApiResponse<QueryASS16010DetailResponse[]>>(`${this.apiUrl}/queryASS16010Detail`, req);
    }

    /** 匯出 PDF */
    exportPDFASS16010(payload: QueryASS16010Request): Observable<HttpResponse<Blob>> {
        return this.http
            .post(`${this.apiUrl}/exportPDFASS16010`, payload, {
                responseType: 'blob',
                observe: 'response',
            })
            .pipe(take(1));
    }



    // 查詢盤點單號下拉選單
    queryFAINVENTORYM_DropDownList(req: QueryFAINVENTORYMRequest): Observable<ApiResponse<IDropdownItem_FAINVENTORYM[]>> {
        return this.http.post<ApiResponse<IDropdownItem_FAINVENTORYM[]>>(`${environment.ApiUrl}/queryFAINVENTORYM_DropDownList`, req);
    }

    // 查詢倉別下拉選單
    queryASS11100(req: QueryASS11100Request): Observable<ApiResponse<QueryResult<QueryASS11100Response>>> {
        return this.http.post<ApiResponse<QueryResult<QueryASS11100Response>>>(`${this.apiUrl}/queryASS11100`, req);
    }

    // 查詢中分類下拉選單
    queryASS11020(req: QueryASS11020Request): Observable<ApiResponse<QueryResult<QueryASS11020Response>>> {
        return this.http.post<ApiResponse<QueryResult<QueryASS11020Response>>>(`${this.apiUrl}/queryASS11020`, req);
    }
}