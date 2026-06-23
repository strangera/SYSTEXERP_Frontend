import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QuerySysbq00Request {
    pageSize: number;
    pageIndex: number;
    SortBy?: SortMeta[];
    sys_type?: string;
    act_code?: string;
    data_type_desc?: string;
}

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

export interface Sysbq00Request {
    id?: number;
    data_type: string;
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    line5: string;
}

export interface Sysbq00DropDownItem {
    parent_prog_no: string;
    parent_prog_name: string | null;
    child_prog_no: string;
    child_prog_name: string | null;
    child_sort: number | null;
}

@Injectable({ providedIn: 'root' })
export class Sysbq00Service {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.ApiUrl}/SYS0000/BAS1000`;

    querySYSBQ00(params: QuerySysbq00Request): Observable<ApiResponse<Sysbq00Data[]>> {
        return this.http.post<ApiResponse<Sysbq00Data[]>>(`${this.apiUrl}/querySYSBQ00`, params);
    }

    insertSYSBQ00(data: Sysbq00Request): Observable<ApiResponse<number>> {
        return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertSYSBQ00`, data);
    }

    updateSYSBQ00(data: Sysbq00Request): Observable<ApiResponse<number>> {
        return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateSYSBQ00`, data);
    }

    deleteSYSBQ00(idList: number[]): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/deleteSYSBQ00`, { idList });
    }

    getSYSBQ00DropDown(): Observable<ApiResponse<Sysbq00DropDownItem[]>> {
        return this.http.post<ApiResponse<Sysbq00DropDownItem[]>>(`${this.apiUrl}/getSYSBQ00DropDown`, {});
    }
}
