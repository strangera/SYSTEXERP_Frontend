import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/shared/utils/rxjs-operators/validate-api-response';
import { environment } from 'src/environments/environment';

export interface FIN42050Request {
    ActualYM: string,
    BudgetYM1: string,
    BudgetVersion1: string,
    BudgetYM2: string,
    BudgetVersion2: string,
    Org_ID?: string,
    ReportType?: number,
    AmtUnit?: number,
    Org_Name?: string,
    IsCludeDownOrg?: string,
    IsROC?: string
}

export interface FIN42050Data {
    SortNo?: number;
    LevelNo?: number;
    RowType?: string;
    AccountCode?: string;
    AccountName?: string;
    ActualAmount?: number;
    ActualRatio?: number;
    Budget1Amount?: number;
    Budget1Ratio?: number;
    Budget2Amount?: number;
    Budget2Ratio?: number;
    BudgetVersionDiff?: number;
}

@Injectable({ providedIn: 'root' })
export class FIN42050Service {
    apiUrl: string = environment.ApiUrl + '/FIN0000/FIN4000';

    constructor(private readonly http: HttpClient) { }

    queryFIN42050(body: FIN42050Request): Observable<ApiResponse<FIN42050Data[]>> {
        return this.http.post<ApiResponse<FIN42050Data[]>>(`${this.apiUrl}/queryFIN42050`, body);
    }

    exportExcelFIN42050(body: FIN42050Request): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/exportFIN42050`, body, { responseType: 'blob' });
    }

    exportPDFFIN42050(body: FIN42050Request): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/exportFIN42050PDF`, body, { responseType: 'blob' });
    }
}
