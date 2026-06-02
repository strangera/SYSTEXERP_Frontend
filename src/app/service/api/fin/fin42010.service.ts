import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Response 資料結構
export interface fin42010MainData {
    Budget_Year: string,
    Budget_Version: string,
    Org_ID: string,
    Org_Name: string,
    AmtUnit: string,
    AmtUnitName: string
}

export interface fin42010DetailData {
    // "SortNo": number;
    // "LevelNo": number;
    "科目代號": string;     // 科目代號
    "科目名稱": string;   // 科目名稱
    "1月": number;
    "2月": number;
    "3月": number;
    "4月": number;
    "5月": number;
    "6月": number;
    "7月": number;
    "8月": number;
    "9月": number;
    "10月": number;
    "11月": number;
    "12月": number;
    "預算總金額": number;     // 預算總金額
}

export interface fin42010Response {
    Status: string;
    Data: {
        MainData: fin42010MainData;
        Details: fin42010DetailData[],
    },
    Error: {
        Code: string,
        Message: string,
        Details: string
    },
    Message: string,
    TotalCount: number,
    TotalPage: number
}

@Injectable({
    providedIn: 'root'
})
export class FIN42010Service {
    // 預算損益表
    // apiUrl: string = environment.ApiUrl + '/FIN0000/FIN4000';
    apiUrl: string = environment.ApiUrl + '/Controllers/FIN40000';
    constructor(private http: HttpClient) { }

    //查詢 預算損益表
    queryFIN42010(body: any): Observable<fin42010Response> {
        return this.http.post<fin42010Response>(`${this.apiUrl}/queryFIN42010`, body);
    }

    // 匯出 Excel
    exportExcelFIN42010(body: any): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/exportExcelFIN42010`, body, { responseType: 'blob' });
    }

    // 匯出 Pdf
    exportPDFFIN42010(body: any): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/exportPDFFIN42010`, body, { responseType: 'blob' });
    }
}