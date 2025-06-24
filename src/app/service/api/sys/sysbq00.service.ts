import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../system/auth.service';
import { SortMeta } from 'primeng/api';

// 查詢條件介面
export interface QuerySysbq00Request {
    PageSize: number;
    PageIndex: number;
    SortBy?: SortMeta[];
    data_type?: string;
    data_type_desc?: string;
}

// 回傳資料型別
export interface Sysbq00Data {
    id: number;
    data_type: string;
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    line5: string;
    CRT_Date: string;
    CRT_USR_No: string;
    CRT_USR_Name: string;
    UPD_Date: string;
    UPD_USR_No: string;
    UPD_USR_Name: string;
}

// 新增或更新請求資料
export interface Sysbq00Request {
    id?: number; // 更新時需帶 id
    data_type: string;
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    line5: string;
}

// 刪除請求
export interface DeleteSysbq00Request {
    idList: number[];
}

@Injectable({
    providedIn: 'root',
})
export class Sysbq00Service {
    private apiUrl = `${environment.ApiUrl}/SYS0000/BAS1000`;

    constructor(private http: HttpClient) { }

    /** 查詢 SYSBQ00 資料 */
    querySYSBQ00(params: QuerySysbq00Request): Observable<ApiResponse<Sysbq00Data[]>> {
        return this.http.post<ApiResponse<Sysbq00Data[]>>(`${this.apiUrl}/querySYSBQ00`, params);
    }

    /** 新增 SYSBQ00 資料 */
    insertSYSBQ00(data: Sysbq00Request): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertSYSBQ00`, data);
    }

    /** 更新 SYSBQ00 資料 */
    updateSYSBQ00(data: Sysbq00Request): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateSYSBQ00`, data);
    }

    /** 刪除 SYSBQ00 資料 */
    deleteSYSBQ00(idList: number[]): Observable<ApiResponse<any>> {
        const body: DeleteSysbq00Request = { idList };
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deleteSYSBQ00`, body);
    }
}
